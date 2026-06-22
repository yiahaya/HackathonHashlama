// RightsRepository: load the structured rights DB into domain objects.
// Ported from rights_platform/data/repository.py + mappers.py.
//
// The whole corpus is small (~100 rights / ~800 children), so we load everything
// once and cache it in memory. Reads from the shared `pg` pool (db.ts). NUMERIC
// columns come back from node-pg as strings, so they go through num().

import { pool } from '../db';
import { Benefit, Criterion, Milestone, Right } from './types';

function num(v: any): number | null {
  if (v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function toRight(row: any): Right {
  return {
    id: row.id,
    slug: row.slug,
    nameHe: row.name_he,
    nameEn: row.name_en ?? null,
    domain: row.domain,
    authority: row.authority,
    injuryCause: Array.isArray(row.injury_cause) ? row.injury_cause : [],
    descriptionHe: row.description_he || '',
    summaryEn: row.summary_en ?? null,
    legalBasis: row.legal_basis ?? null,
    sourceUrl: row.source_url ?? null,
    extractionConfidence:
      row.extraction_confidence !== null && row.extraction_confidence !== undefined
        ? Number(row.extraction_confidence)
        : 0.6,
    benefits: [],
    criteria: [],
    milestones: [],
  };
}

function toBenefit(row: any): Benefit {
  return {
    benefitType: row.benefit_type,
    descriptionHe: row.description_he || '',
    amountType: row.amount_type || 'n/a',
    amountValue: num(row.amount_value),
    amountMin: num(row.amount_min),
    amountMax: num(row.amount_max),
    currency: row.currency || 'n/a',
    frequency: row.frequency || 'n/a',
    conditionsNote: row.conditions_note ?? null,
  };
}

function toCriterion(row: any): Criterion {
  return {
    attribute: row.attribute,
    operator: row.operator,
    valueNum: num(row.value_num),
    valueNumMax: num(row.value_num_max),
    valueText: row.value_text ?? null,
    valueSet:
      row.value_set && Array.isArray(row.value_set) && row.value_set.length
        ? row.value_set
        : null,
    unit: row.unit || 'n/a',
    logicGroup: row.logic_group ?? 1,
    isRequired: row.is_required === undefined ? true : !!row.is_required,
    descriptionHe: row.description_he || '',
    confidence: num(row.confidence),
    needsVocabReview: !!row.needs_vocab_review,
  };
}

function toMilestone(row: any): Milestone {
  return {
    slug: row.slug,
    titleHe: row.title_he,
    descriptionHe: row.description_he ?? null,
    category: row.category || 'other',
    authority: row.authority || 'n/a',
    isGeneral: !!row.is_general,
    rightSlug: row.right_slug ?? null,
    sortOrder: row.sort_order ?? 1,
    isRequired: row.is_required === undefined ? true : !!row.is_required,
  };
}

export class RightsRepository {
  private byId = new Map<number, Right>();
  private bySlug = new Map<string, Right>();

  async load(): Promise<this> {
    const byId = new Map<number, Right>();

    const rights = await pool.query('SELECT * FROM rights ORDER BY id');
    for (const row of rights.rows) {
      const r = toRight(row);
      byId.set(r.id, r);
    }

    const benefits = await pool.query('SELECT * FROM benefits ORDER BY id');
    for (const row of benefits.rows) {
      byId.get(row.right_id)?.benefits.push(toBenefit(row));
    }

    const criteria = await pool.query(
      'SELECT * FROM criteria ORDER BY logic_group, id'
    );
    for (const row of criteria.rows) {
      byId.get(row.right_id)?.criteria.push(toCriterion(row));
    }

    // Milestones are non-essential to scoring; degrade gracefully if the linking
    // tables aren't present in this DB.
    try {
      const milestoneSql = `
        SELECT rm.right_id, rm.sort_order, rm.is_required,
               m.slug, m.title_he, m.description_he, m.category, m.authority,
               m.is_general, tr.slug AS right_slug
        FROM right_milestones rm
        JOIN milestones m ON m.id = rm.milestone_id
        LEFT JOIN rights tr ON tr.id = m.right_id
        ORDER BY rm.right_id, rm.sort_order, rm.id`;
      const milestones = await pool.query(milestoneSql);
      for (const row of milestones.rows) {
        byId.get(row.right_id)?.milestones.push(toMilestone(row));
      }
    } catch (e: any) {
      console.warn('Milestones not loaded (continuing without them):', e.message);
    }

    this.byId = byId;
    this.bySlug = new Map(Array.from(byId.values()).map((r) => [r.slug, r]));
    return this;
  }

  all(): Right[] {
    return Array.from(this.byId.values());
  }

  getBySlug(slug: string): Right | undefined {
    return this.bySlug.get(slug);
  }

  get size(): number {
    return this.byId.size;
  }
}

// Lazy, cached singleton — loaded once on first evaluate, reused thereafter.
let cached: RightsRepository | null = null;
let loading: Promise<RightsRepository> | null = null;

export async function getRepository(): Promise<RightsRepository> {
  if (cached) return cached;
  if (!loading) {
    loading = new RightsRepository().load().then((repo) => {
      cached = repo;
      loading = null;
      return repo;
    });
  }
  return loading;
}
