// Domain types for the rule-based eligibility engine (ported from the Python
// `rights_platform` service). A `Profile` is a flat map keyed by the controlled
// person-attribute vocab; values are boolean | number | string | string[].

export type ProfileValue = boolean | number | string | string[];
export type Profile = Record<string, ProfileValue>;

export type CriterionStatus = 'pass' | 'fail' | 'unknown';
export type Band = 'high' | 'medium' | 'low';
export type EligStatus =
  | 'likely_eligible'
  | 'possible'
  | 'need_more_info'
  | 'unlikely';

export interface Criterion {
  attribute: string;
  operator: string;
  valueNum: number | null;
  valueNumMax: number | null;
  valueText: string | null;
  valueSet: string[] | null;
  unit: string;
  logicGroup: number;
  isRequired: boolean;
  descriptionHe: string;
  confidence: number | null;
  needsVocabReview: boolean;
}

export interface Benefit {
  benefitType: string;
  descriptionHe: string;
  amountType: string;
  amountValue: number | null;
  amountMin: number | null;
  amountMax: number | null;
  currency: string;
  frequency: string;
  conditionsNote: string | null;
}

export interface Milestone {
  slug: string;
  titleHe: string;
  descriptionHe: string | null;
  category: string;
  authority: string;
  isGeneral: boolean;
  rightSlug: string | null;
  sortOrder: number;
  isRequired: boolean;
}

export interface Right {
  id: number;
  slug: string;
  nameHe: string;
  nameEn: string | null;
  domain: string;
  authority: string;
  injuryCause: string[];
  descriptionHe: string;
  summaryEn: string | null;
  legalBasis: string | null;
  sourceUrl: string | null;
  extractionConfidence: number;
  benefits: Benefit[];
  criteria: Criterion[];
  milestones: Milestone[];
}

export interface RightMatch {
  right: Right;
  score: number; // 0..1
  percentage: number; // round(score * 100)
  band: Band;
  status: EligStatus;
  matched: Criterion[];
  failed: Criterion[];
  unknownRequired: Criterion[];
  missingAttributes: string[];
  explanationHe: string | null;
}

// --- API output DTOs (mirror of the Python schemas) ---

export interface BenefitOut {
  benefit_type: string;
  description_he: string;
  amount_type: string;
  amount_value: number | null;
  amount_min: number | null;
  amount_max: number | null;
  currency: string;
  frequency: string;
  conditions_note: string | null;
}

export interface MilestoneOut {
  slug: string;
  title_he: string;
  description_he: string | null;
  category: string;
  authority: string;
  is_general: boolean;
  right_slug: string | null;
  sort_order: number;
  is_required: boolean;
}

export interface RightMatchOut {
  id: number;
  slug: string;
  name_he: string;
  name_en: string | null;
  domain: string;
  authority: string;
  source_url: string | null;
  percentage: number;
  band: string;
  status: string;
  explanation_he: string | null;
  met_conditions: string[];
  missing_info: string[];
  benefits: BenefitOut[];
  milestones: MilestoneOut[];
}

export interface EvaluateMeta {
  total_evaluated: number;
  missing_inputs: string[];
  disclaimer: string;
  snapshot_date: string | null;
  form_id: string | null;
}

export interface EvaluateOut {
  profile: Profile;
  rights: RightMatchOut[];
  meta: EvaluateMeta;
}

// --- Trimmed, presentation-ready DTO for the frontend (POST /evaluate/ui) ---
// Only the fields a UI renders. No engine profile, no diagnostics.

export interface RightMatchUiOut {
  id: number;                // right DB id (list key + lookups)
  title: string;             // right name (Hebrew)
  description: string[];     // descriptions of the right's benefits
  confidence: number;        // 0..100
  source_url: string | null; // official source / "learn more" link
  steps: string[];           // ordered descriptions of the required milestones
  missing_info: string[];    // required criteria still needed to confirm eligibility
}

export interface EvaluateUiOut {
  rights: RightMatchUiOut[];
  disclaimer: string;
}
