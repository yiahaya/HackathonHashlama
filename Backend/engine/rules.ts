// Single-criterion evaluation against a person profile.
// Ported from rights_platform/domain/rules.py.
//
// Returns 'pass' / 'fail' / 'unknown' for one Criterion. The guiding principle
// (given noisy extracted categoricals) is **never invent a false negative**: we
// only return 'fail' when we can cleanly compare structured numeric/boolean
// values or a recognized categorical token. Anything ambiguous or absent is
// 'unknown', which the scorer treats as "need more info" rather than rejection.

import { Criterion, CriterionStatus, Profile, ProfileValue } from './types';
import { normalize } from './vocab';

const MISSING = Symbol('missing');

function asNumber(v: ProfileValue): number | null {
  if (typeof v === 'boolean') {
    return null; // bool is excluded (mirrors Python excluding bool subclass of int)
  }
  if (typeof v === 'number') {
    return Number.isFinite(v) ? v : null;
  }
  if (typeof v === 'string') {
    const t = v.trim();
    if (t === '') return null;
    const n = Number(t);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function numCompare(val: number, c: Criterion): CriterionStatus {
  const lo = c.valueNum;
  const hi = c.valueNumMax;
  const op = c.operator;
  if (lo === null && op !== 'between') {
    return 'unknown';
  }
  switch (op) {
    case 'gte':
      return val >= (lo as number) ? 'pass' : 'fail';
    case 'gt':
      return val > (lo as number) ? 'pass' : 'fail';
    case 'lte':
      return val <= (lo as number) ? 'pass' : 'fail';
    case 'lt':
      return val < (lo as number) ? 'pass' : 'fail';
    case 'eq':
      return val === lo ? 'pass' : 'fail';
    case 'neq':
      return val !== lo ? 'pass' : 'fail';
    case 'between':
      if (lo === null || hi === null) return 'unknown';
      return lo <= val && val <= hi ? 'pass' : 'fail';
    default:
      return 'unknown';
  }
}

export function evaluateCriterion(
  c: Criterion,
  profile: Profile
): CriterionStatus {
  const op = c.operator;
  if (op === 'n/a') {
    return 'unknown';
  }

  const has = Object.prototype.hasOwnProperty.call(profile, c.attribute);
  const val: ProfileValue | typeof MISSING = has ? profile[c.attribute] : MISSING;

  // --- boolean operators ---
  if (op === 'is_true' || op === 'is_false') {
    if (typeof val !== 'boolean') {
      return 'unknown';
    }
    return val === (op === 'is_true') ? 'pass' : 'fail';
  }

  // --- presence ---
  if (op === 'exists') {
    return val !== MISSING && val !== null && val !== undefined
      ? 'pass'
      : 'unknown';
  }

  if (val === MISSING || val === null || val === undefined) {
    return 'unknown';
  }

  // --- numeric path (criterion carries a numeric threshold) ---
  if (c.valueNum !== null || (op === 'between' && c.valueNumMax !== null)) {
    const num = asNumber(val);
    if (num !== null) {
      return numCompare(num, c);
    }
    // threshold is numeric but profile value isn't comparable
    return 'unknown';
  }

  // --- set membership ---
  if ((op === 'in' || op === 'not_in') && c.valueSet && c.valueSet.length) {
    const canonSet = new Set(c.valueSet.map((x) => normalize(c.attribute, x)));
    const pv = normalize(c.attribute, val);
    if (canonSet.has(null) || pv === null) {
      return 'unknown'; // messy / unrecognized -> soft
    }
    const hit = canonSet.has(pv);
    return hit === (op === 'in') ? 'pass' : 'fail';
  }

  // --- categorical scalar ---
  if ((op === 'eq' || op === 'neq') && c.valueText !== null) {
    const cv = normalize(c.attribute, c.valueText);
    const pv = normalize(c.attribute, val);
    if (cv === null || pv === null) {
      return 'unknown';
    }
    const equal = cv === pv;
    return equal === (op === 'eq') ? 'pass' : 'fail';
  }

  return 'unknown';
}
