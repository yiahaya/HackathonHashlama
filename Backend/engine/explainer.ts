// Deterministic Hebrew "why you might qualify" text per right.
// Ported from the fallback path of rights_platform/services/explainer.py.
// (The Python service also has an optional Claude Haiku path; the evaluate flow
// uses only the deterministic text, so that's all we port here.)

import { Criterion, RightMatch } from './types';

function descs(crits: Criterion[], limit = 3): string[] {
  const out: string[] = [];
  for (const c of crits) {
    const d = (c.descriptionHe || '').trim();
    if (d && !out.includes(d)) out.push(d);
    if (out.length >= limit) break;
  }
  return out;
}

function fallback(m: RightMatch): string {
  const met = descs(m.matched, 3);
  const missing = descs(m.unknownRequired, 3);
  const parts: string[] = [];
  if (met.length) {
    parts.push('ייתכן שאתה זכאי/ת על סמך: ' + met.join('; ') + '.');
  } else if (m.right.descriptionHe) {
    parts.push(m.right.descriptionHe.trim().slice(0, 200));
  } else {
    parts.push('ייתכן שזכות זו רלוונטית עבורך.');
  }
  if (missing.length) {
    parts.push('כדי לאמת זכאות כדאי לבדוק: ' + missing.join('; ') + '.');
  }
  return parts.join(' ');
}

// Fill every match's explanationHe with fast, offline Hebrew text.
export function deterministic(matches: RightMatch[]): void {
  for (const m of matches) {
    m.explanationHe = fallback(m);
  }
}
