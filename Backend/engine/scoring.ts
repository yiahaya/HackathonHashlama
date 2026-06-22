// Right-level scoring: turn per-criterion results into a likelihood.
// Ported from rights_platform/domain/scoring.py.
//
// Logic-group semantics: criteria sharing a `logicGroup` are OR'd; different
// groups are AND'd. We aggregate that into a 0..1 likelihood that reflects
// **positive evidence**, so a right is only "high" when several of its
// requirements are actually confirmed — not merely un-disproven.

import {
  Band,
  Criterion,
  CriterionStatus,
  EligStatus,
  Profile,
  Right,
  RightMatch,
} from './types';
import { evaluateCriterion } from './rules';
import { normalize } from './vocab';

const AMPUTATION_DOMAINS = new Set([
  'mobility',
  'prosthetics_aids',
  'disability_general',
  'rehabilitation',
]);
const HARD_FAIL_SCORE = 0.05;
const NO_EVIDENCE_FLOOR = 0.3; // all required conditions still unknown

function distinctAttrs(crits: Criterion[]): string[] {
  const seen: string[] = [];
  for (const c of crits) {
    if (!seen.includes(c.attribute) && c.attribute !== 'n/a') {
      seen.push(c.attribute);
    }
  }
  return seen;
}

function injuryCauseExcluded(right: Right, profile: Profile): boolean {
  const causes = new Set(right.injuryCause.filter((c) => c !== 'n/a'));
  if (causes.size === 0 || causes.has('any')) {
    return false;
  }
  const pc = profile['injury_cause'];
  if (pc === undefined || pc === null) {
    return false;
  }
  const norm = normalize('injury_cause', pc);
  return norm !== null && !causes.has(norm);
}

function hardFailMatch(
  right: Right,
  matched: Criterion[],
  failed: Criterion[],
  unknownRequired: Criterion[]
): RightMatch {
  return {
    right,
    score: HARD_FAIL_SCORE,
    percentage: Math.round(HARD_FAIL_SCORE * 100),
    band: 'low',
    status: 'unlikely',
    matched,
    failed,
    unknownRequired,
    missingAttributes: distinctAttrs(unknownRequired),
    explanationHe: null,
  };
}

export function scoreRight(right: Right, profile: Profile): RightMatch {
  const matched: Criterion[] = [];
  const failed: Criterion[] = [];
  const unknownRequired: Criterion[] = [];

  if (injuryCauseExcluded(right, profile)) {
    return hardFailMatch(right, [], [], []);
  }

  const groups = new Map<number, Criterion[]>();
  for (const c of right.criteria) {
    const arr = groups.get(c.logicGroup);
    if (arr) arr.push(c);
    else groups.set(c.logicGroup, [c]);
  }

  // Evaluate every criterion once; summarize each group.
  const groupStatus = new Map<number, CriterionStatus>();
  const groupRequired = new Map<number, boolean>();
  let hardFail = false;

  for (const [gid, crits] of groups) {
    const results = crits.map(
      (c) => [c, evaluateCriterion(c, profile)] as [Criterion, CriterionStatus]
    );
    const statuses = results.map(([, s]) => s);
    groupRequired.set(
      gid,
      crits.some((c) => c.isRequired)
    );

    let g: CriterionStatus;
    if (statuses.includes('pass')) {
      g = 'pass';
    } else if (statuses.length && statuses.every((s) => s === 'fail')) {
      g = 'fail';
    } else {
      g = 'unknown';
    }
    groupStatus.set(gid, g);

    for (const [c, s] of results) {
      if (s === 'pass') matched.push(c);
      else if (s === 'fail') failed.push(c);
      else if (c.isRequired) unknownRequired.push(c);
    }

    if (g === 'fail' && groupRequired.get(gid)) {
      if (
        results.some(
          ([c, s]) => c.isRequired && !c.needsVocabReview && s === 'fail'
        )
      ) {
        hardFail = true;
      }
    }
  }

  if (hardFail) {
    return hardFailMatch(right, matched, failed, unknownRequired);
  }

  // Pool: required groups if any, else all groups.
  const allGids = Array.from(groups.keys());
  let pool = allGids.filter((gid) => groupRequired.get(gid));
  if (pool.length === 0) pool = allGids;

  const passed = pool.filter((gid) => groupStatus.get(gid) === 'pass').length;
  const unknown = pool.filter(
    (gid) => groupStatus.get(gid) === 'unknown'
  ).length;

  let score: number;
  let status: EligStatus;

  if (pool.length === 0) {
    // No criteria at all — rely on relevance only.
    score = NO_EVIDENCE_FLOOR;
    status = 'need_more_info';
  } else if (passed === 0) {
    score = NO_EVIDENCE_FLOOR;
    status = unknown ? 'need_more_info' : 'unlikely';
  } else {
    const satisfaction = passed / (passed + unknown);
    const evidence = 1 - Math.pow(0.5, passed);
    score = satisfaction * (0.35 + 0.65 * evidence);
    status = unknown === 0 ? 'likely_eligible' : 'possible';
  }

  // Confidence weighting (gentle, with a floor) + amputation relevance nudge.
  const conf =
    right.extractionConfidence !== null && right.extractionConfidence !== undefined
      ? right.extractionConfidence
      : 0.6;
  score *= 0.8 + 0.2 * Math.max(0.0, Math.min(1.0, conf));
  if (profile['has_amputation'] === true && AMPUTATION_DOMAINS.has(right.domain)) {
    score = Math.min(1.0, score * 1.12);
  }

  score = Math.max(0.0, Math.min(1.0, score));
  const band: Band = score >= 0.7 ? 'high' : score >= 0.4 ? 'medium' : 'low';

  return {
    right,
    score: round4(score),
    percentage: Math.round(score * 100),
    band,
    status,
    matched,
    failed,
    unknownRequired,
    missingAttributes: distinctAttrs(unknownRequired),
    explanationHe: null,
  };
}

function round4(n: number): number {
  return Math.round(n * 1e4) / 1e4;
}
