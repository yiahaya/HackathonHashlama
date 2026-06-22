// Domain object -> API DTO conversion. Ported from rights_platform/api/serializers.py.

import {
  Benefit,
  BenefitOut,
  Criterion,
  Milestone,
  MilestoneOut,
  RightMatch,
  RightMatchOut,
  RightMatchUiOut,
} from './types';

// Trim, dedupe, and drop empties from a list of strings (preserves order).
function uniqNonEmpty(items: string[]): string[] {
  const out: string[] = [];
  for (const s of items) {
    const t = (s || '').trim();
    if (t && !out.includes(t)) out.push(t);
  }
  return out;
}

function benefitOut(b: Benefit): BenefitOut {
  return {
    benefit_type: b.benefitType,
    description_he: b.descriptionHe,
    amount_type: b.amountType,
    amount_value: b.amountValue,
    amount_min: b.amountMin,
    amount_max: b.amountMax,
    currency: b.currency,
    frequency: b.frequency,
    conditions_note: b.conditionsNote,
  };
}

function milestoneOut(m: Milestone): MilestoneOut {
  return {
    slug: m.slug,
    title_he: m.titleHe,
    description_he: m.descriptionHe,
    category: m.category,
    authority: m.authority,
    is_general: m.isGeneral,
    right_slug: m.rightSlug,
    sort_order: m.sortOrder,
    is_required: m.isRequired,
  };
}

function descs(crits: Criterion[], limit = 5): string[] {
  const out: string[] = [];
  for (const c of crits) {
    const d = (c.descriptionHe || '').trim();
    if (d && !out.includes(d)) out.push(d);
    if (out.length >= limit) break;
  }
  return out;
}

// Presentation-ready projection for the frontend: only what a UI shows.
export function uiMatchOut(m: RightMatch): RightMatchUiOut {
  const r = m.right;
  return {
    slug: r.slug,
    title: r.nameHe,
    description: r.descriptionHe,
    confidence: m.percentage,
    source_url: r.sourceUrl,
    benefits: uniqNonEmpty(r.benefits.map((b) => b.descriptionHe)),
    criteria: uniqNonEmpty(m.matched.map((c) => c.descriptionHe)),
    missing_info: uniqNonEmpty(m.unknownRequired.map((c) => c.descriptionHe)),
  };
}

export function matchOut(m: RightMatch): RightMatchOut {
  const r = m.right;
  return {
    slug: r.slug,
    name_he: r.nameHe,
    name_en: r.nameEn,
    domain: r.domain,
    authority: r.authority,
    source_url: r.sourceUrl,
    percentage: m.percentage,
    band: m.band,
    status: m.status,
    explanation_he: m.explanationHe,
    met_conditions: descs(m.matched),
    missing_info: descs(m.unknownRequired),
    benefits: r.benefits.map(benefitOut),
    milestones: r.milestones.map(milestoneOut),
  };
}
