// Rule-based eligibility engine — public entrypoint.
//
// `evaluate(payload)` is the stateless contract ported from the Python service's
// POST /api/v1/evaluate: it takes developer 1's questionnaire-result JSON, maps
// it onto the engine profile (intake.toProfile), ranks every right in the DB
// (scoring.scoreRight), attaches deterministic Hebrew text, and returns the
// ranked rights + all their data. No sessions, no storage — data-in -> rights-out.

import { EvaluateOut, EvaluateUiOut, EvaluateMeta, RightMatch, Profile } from './types';
import { toProfile } from './intake';
import { getRepository } from './repository';
import { scoreRight } from './scoring';
import { deterministic } from './explainer';
import { matchOut, uiMatchOut } from './serializer';

// How many ranked rights to return at most (env-overridable, mirrors the Python
// RESULTS_LIMIT default of 30).
const RESULTS_LIMIT = parseInt(
  process.env.KZ_PLATFORM_RESULTS_LIMIT || '30',
  10
);
const SNAPSHOT_DATE = process.env.KZ_SNAPSHOT_DATE || '2024-05-01';
const DISCLAIMER =
  'Information is based on a May 2024 snapshot of kol-zchut.org.il and is not ' +
  'legal advice. Verify current eligibility on the official site.';

// Shared ranking pipeline: profile -> score every right -> sort -> top N with
// deterministic Hebrew text. Both evaluate() and evaluateUi() build on this.
async function rank(payload: Record<string, any>): Promise<{
  profile: Profile;
  missing: string[];
  ranked: RightMatch[];
  totalEvaluated: number;
}> {
  const repo = await getRepository();
  const { profile, missing } = toProfile(payload);

  const matches = repo.all().map((r) => scoreRight(r, profile));
  matches.sort((a, b) => b.score - a.score);

  const ranked = matches.slice(0, RESULTS_LIMIT);
  deterministic(ranked); // instant Hebrew text, no LLM call

  return { profile, missing, ranked, totalEvaluated: matches.length };
}

function buildMeta(
  payload: Record<string, any>,
  missing: string[],
  totalEvaluated: number
): EvaluateMeta {
  return {
    total_evaluated: totalEvaluated,
    missing_inputs: missing,
    disclaimer: DISCLAIMER,
    snapshot_date: SNAPSHOT_DATE,
    form_id: (payload.metadata || {}).formId ?? null,
  };
}

export async function evaluate(payload: Record<string, any>): Promise<EvaluateOut> {
  const { profile, missing, ranked, totalEvaluated } = await rank(payload);
  return {
    profile,
    rights: ranked.map(matchOut),
    meta: buildMeta(payload, missing, totalEvaluated),
  };
}

// Trimmed, presentation-ready evaluation for the frontend: only UI fields plus
// the disclaimer. No profile, no diagnostics.
export async function evaluateUi(payload: Record<string, any>): Promise<EvaluateUiOut> {
  const { ranked } = await rank(payload);
  return {
    rights: ranked.map(uiMatchOut),
    disclaimer: DISCLAIMER,
  };
}

export { getRepository } from './repository';
export { toProfile } from './intake';
export { uiFromMatchOut } from './serializer';
export type { EvaluateOut, RightMatchOut } from './types';
