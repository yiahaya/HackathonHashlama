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
export function uiMatchOut(m: RightMatch, completedSteps = new Set<string>()): RightMatchUiOut {
  const r = m.right;
  // Required milestones, in sort order. Milestone description_he is usually null
  // in this dataset, so fall back to the milestone title for human-readable text.
  const rawSteps = uniqNonEmpty(
    [...r.milestones]
      .filter((ms) => ms.isRequired)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((ms) => ms.descriptionHe?.trim() || ms.titleHe)
  );
  const steps = rawSteps.map(text => ({ step: text, is_completed: completedSteps.has(`${r.id}_${text}`) }));

  return {
    id: r.id,
    title: r.nameHe,
    description: uniqNonEmpty(r.benefits.map((b) => b.descriptionHe)),
    confidence: m.percentage,
    source_url: r.sourceUrl,
    steps,
    missing_info: uniqNonEmpty(m.unknownRequired.map((c) => c.descriptionHe)),
  };
}

// Project an already-serialized full match DTO (e.g. a stored
// `registrations.results` right) down to the UI DTO. Mirrors `uiMatchOut` but
// reads the serialized field names, so persisted evaluations can be served in
// the exact /evaluate/ui shape without re-running the engine.
export function uiFromMatchOut(m: RightMatchOut, completedSteps = new Set<string>()): RightMatchUiOut {
  const rawSteps = uniqNonEmpty(
    [...m.milestones]
      .filter((ms) => ms.is_required)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((ms) => ms.description_he?.trim() || ms.title_he)
  );
  const steps = rawSteps.map(text => ({ step: text, is_completed: completedSteps.has(`${m.id}_${text}`) }));

  return {
    id: m.id,
    title: m.name_he,
    description: uniqNonEmpty(m.benefits.map((b) => b.description_he)),
    confidence: m.percentage,
    source_url: m.source_url,
    steps,
    missing_info: uniqNonEmpty(m.missing_info),
  };
}

export function matchOut(m: RightMatch): RightMatchOut {
  const r = m.right;
  return {
    id: r.id,
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
