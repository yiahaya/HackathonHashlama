// Map the external questionnaire JSON (developer 1's registration form) onto the
// engine Profile. Ported from rights_platform/api/intake.py.
//
// The rule engine reads a flat Profile of controlled person-attributes. This is
// the only place that knows the external form's shape. Reuses vocab.normalize()
// for the categoricals it already has Hebrew synonyms for.
//
// to_profile(payload) returns { profile, missing }:
//   * profile — only attributes we could confidently fill (engine treats absent
//               attributes as UNKNOWN, never a false negative).
//   * missing — engine attributes that materially affect ranking but the form
//               does not capture (disability %, income, vehicle, …).
//
// A caller may pass an optional top-level `overrides` object (attribute -> value)
// to supply any of those directly; overrides win and clear themselves from missing.

import { Profile, ProfileValue } from './types';
import { normalize } from './vocab';

// Engine attributes the form does not capture but the engine leans on.
const UNCAPTURED = [
  'medical_disability_percentage',
  'general_disability_percentage',
  'mobility_limitation_percentage',
  'degree_of_incapacity',
  'income_monthly',
  'owns_vehicle',
  'has_driving_license',
];

// insuringBody (המוסד המבטח) -> injury_cause, when amputationReason is unclear.
const INSURER_CAUSE: Record<string, string> = {
  'משרד הביטחון': 'idf',
  צבא: 'idf',
  'צה"ל': 'idf',
  'ביטוח לאומי': 'general_disability',
  'המוסד לביטוח לאומי': 'general_disability',
  'חברת ביטוח': 'road_accident',
  'תאונת דרכים': 'road_accident',
  מעביד: 'work_injury',
  מעסיק: 'work_injury',
};

const LEVEL_FIELDS = [
  'rightArmAmputationLevel',
  'leftArmAmputationLevel',
  'rightLegAmputationLevel',
  'leftLegAmputationLevel',
];

type AnyObj = Record<string, any>;

function ageFrom(birth: any): number | null {
  if (!birth) return null;
  const s = String(birth).trim();
  let d: Date | null = null;

  // ISO (YYYY-MM-DD or full datetime)
  const iso = Date.parse(s);
  if (!Number.isNaN(iso) && /^\d{4}-\d{2}/.test(s)) {
    d = new Date(iso);
  } else {
    // dd/mm/yyyy
    let m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m) {
      d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
    } else {
      // mm/yyyy
      m = s.match(/^(\d{1,2})\/(\d{4})$/);
      if (m) {
        d = new Date(Number(m[2]), Number(m[1]) - 1, 1);
      }
    }
  }
  if (!d || Number.isNaN(d.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const beforeBirthday =
    today.getMonth() < d.getMonth() ||
    (today.getMonth() === d.getMonth() && today.getDate() < d.getDate());
  if (beforeBirthday) age -= 1;
  return age;
}

function truthyHe(v: any): boolean | null {
  if (typeof v === 'boolean') return v;
  const s = String(v ?? '').trim();
  if (['כן', 'yes', 'true', 'True'].includes(s)) return true;
  if (['לא', 'no', 'false', 'False'].includes(s)) return false;
  return null;
}

export function toProfile(payload: AnyObj): {
  profile: Profile;
  missing: string[];
} {
  const p: Profile = {};
  const amputee: AnyObj = payload.amputeeDetails || {};
  const amp: AnyObj = payload.amputationDescription || {};
  const general: AnyObj = payload.generalQuestions || {};

  // --- identity / demographics ---
  const age = ageFrom(amputee.birthDate);
  if (age !== null) p.age = age;
  if (amputee.gender) p.gender = amputee.gender;
  const fam = normalize('family_status', amputee.maritalStatus);
  if (fam) p.family_status = fam;

  let kids: any = amputee.numberOfChildren;
  if (kids === null || kids === undefined) {
    if (Array.isArray(amputee.children)) kids = amputee.children.length;
  }
  if ((kids === null || kids === undefined) && amputee.hasChildren === false) {
    kids = 0;
  }
  if (kids !== null && kids !== undefined) {
    const n = parseInt(String(kids), 10);
    if (!Number.isNaN(n)) p.num_children = n;
  }

  const country = String((amputee.address || {}).country || '').trim();
  if (country) {
    p.is_resident_israel = ['ישראל', 'Israel', 'IL'].includes(country);
  }

  // --- amputation ---
  const types: any[] = amp.amputationTypes || [];
  const arms: any[] = amp.amputatedArms || [];
  const legs: any[] = amp.amputatedLegs || [];
  if (types.length || arms.length || legs.length || payload.userType === 'הקטוע') {
    p.has_amputation = true;
  }
  let limbs = arms.length + legs.length;
  if (!limbs) {
    limbs = LEVEL_FIELDS.filter((f) => String(amp[f] || '').trim()).length;
  }
  if (limbs) {
    p.limbs_affected_count = Math.max(1, Math.min(4, limbs));
  }

  const levels = LEVEL_FIELDS.map((f) => normalize('amputation_level', amp[f])).filter(
    (l): l is string => !!l
  );
  if (levels.length > 1) {
    p.amputation_level = 'multiple';
  } else if (levels.length === 1) {
    p.amputation_level = levels[0];
  } else if (types.length > 1) {
    p.amputation_level = 'multiple';
  }

  let prosth = truthyHe(amp.usesProsthesis); // כן/לא/טרם התאמתי
  if (prosth === null && amp.usesProsthesis) {
    prosth = false; // "טרם התאמתי" => not currently using
  }
  if (prosth !== null) p.has_prosthesis = prosth;
  if (String(amp.otherAssistiveDevices || '').trim() || legs.length) {
    p.needs_mobility_aid = true;
  }

  // --- injury cause (reason, else insuring body) ---
  let cause = normalize('injury_cause', amp.amputationReason);
  if (!cause) {
    cause = INSURER_CAUSE[String(amp.insuringBody || '').trim()] || null;
  }
  if (cause) p.injury_cause = cause;

  // --- work / benefits ---
  const working = truthyHe(general.currentlyWorkingFullTime);
  if (working === true) p.employment_status = 'employed';
  else if (working === false) p.employment_status = 'not_working';

  const receiving = truthyHe(general.receivingDisabilityAllowance);
  if (receiving === true) p.receives_benefit = ['monthly_allowance_disability_general'];
  else if (receiving === false) p.receives_benefit = ['none'];

  // --- overrides win and clear themselves from "missing" ---
  const overrides: AnyObj = payload.overrides || {};
  for (const [k, v] of Object.entries(overrides)) {
    if (v !== null && v !== undefined) p[k] = v as ProfileValue;
  }

  const missing = UNCAPTURED.filter((a) => !(a in p));
  return { profile: p, missing };
}
