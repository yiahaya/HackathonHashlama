// Controlled person-attribute vocabulary + value normalization.
// Ported from rights_platform/domain/vocab.py.
//
// `normalize(attribute, value)` maps a (possibly messy) criterion value_text or
// profile value onto a canonical token, or returns null when it can't be
// recognized. Unrecognized categoricals are treated as UNKNOWN by the rule
// engine rather than failed — extracted value_text is noisy (mixed Hebrew
// free-text / ad-hoc tokens), so we never derive a false negative from it.

const INJURY_CAUSE: Record<string, string[]> = {
  general_disability: ['general_disability', 'נכות כללית', 'מחלה', 'כללי'],
  work_injury: ['work_injury', 'נפגע עבודה', 'תאונת עבודה', 'פגיעה בעבודה'],
  idf: ['idf', 'נכה צהל', 'נכה צה"ל', 'צבא', 'שירות צבאי', 'כוחות הביטחון'],
  hostile_action: [
    'hostile_action',
    'פעולת איבה',
    'נפגע פעולת איבה',
    'טרור',
    'מלחמת חרבות ברזל',
    'חרבות ברזל',
  ],
  road_accident: ['road_accident', 'תאונת דרכים', 'תאונה'],
  any: ['any', 'כל סיבה'],
};

const EMPLOYMENT_STATUS: Record<string, string[]> = {
  employed: ['employed', 'employee', 'employed_legally', 'שכיר', 'מועסק', 'עובד'],
  self_employed: ['self_employed', 'עצמאי'],
  unemployed: ['unemployed', 'terminated', 'מובטל', 'מפוטר', 'פוטר'],
  not_working: [
    'not_working',
    'unable_to_work',
    'לא עובד',
    'אינו עובד',
    'עקרת בית',
    'עקר בית',
  ],
  retired: ['retired', 'פנסיונר', 'גמלאי', 'פרישה'],
};

const FAMILY_STATUS: Record<string, string[]> = {
  single: ['single', 'רווק', 'רווקה'],
  married: ['married', 'נשוי', 'נשואה', 'בן זוג', 'בת זוג'],
  divorced: ['divorced', 'גרוש', 'גרושה'],
  widowed: ['widowed', 'אלמן', 'אלמנה'],
  single_parent: ['single_parent', 'הורה יחיד', 'חד הורי', 'חד-הורי'],
};

const AMPUTATION_LEVEL: Record<string, string[]> = {
  finger: ['finger', 'אצבע'],
  hand: ['hand', 'כף יד', 'יד'],
  below_elbow: ['below_elbow', 'מתחת למרפק'],
  above_elbow: ['above_elbow', 'מעל המרפק'],
  toe: ['toe', 'בוהן', 'אצבע רגל'],
  foot: ['foot', 'כף רגל'],
  below_knee: ['below_knee', 'מתחת לברך'],
  above_knee: ['above_knee', 'מעל הברך'],
  multiple: ['multiple', 'מרובה', 'כמה גפיים'],
  other: ['other', 'אחר'],
};

const REGISTRY: Record<string, Record<string, string[]>> = {
  injury_cause: INJURY_CAUSE,
  employment_status: EMPLOYMENT_STATUS,
  family_status: FAMILY_STATUS,
  amputation_level: AMPUTATION_LEVEL,
};

// Precompute a synonym -> canonical lookup per attribute (lowercased).
const LOOKUP: Record<string, Record<string, string>> = {};
for (const [attr, table] of Object.entries(REGISTRY)) {
  const flat: Record<string, string> = {};
  for (const [canon, syns] of Object.entries(table)) {
    flat[canon.toLowerCase()] = canon;
    for (const s of syns) {
      flat[s.trim().toLowerCase()] = canon;
    }
  }
  LOOKUP[attr] = flat;
}

export function isCategorical(attribute: string): boolean {
  return attribute in REGISTRY;
}

export function normalize(
  attribute: string,
  value: unknown
): string | null {
  const table = LOOKUP[attribute];
  if (!table || value === null || value === undefined) {
    return null;
  }
  const key = String(value).trim().toLowerCase();
  if (!key) {
    return null;
  }
  if (key in table) {
    return table[key];
  }
  // substring fallback for noisy extracted phrases
  for (const [syn, canon] of Object.entries(table)) {
    if (syn.length >= 3 && (key.includes(syn) || syn.includes(key))) {
      return canon;
    }
  }
  return null;
}
