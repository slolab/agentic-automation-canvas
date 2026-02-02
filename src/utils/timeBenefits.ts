/**
 * Helpers for time benefits. Time = processing time (duration before → after).
 * Time saved per unit = baseline − expected (derived, not stored).
 */

import type { Benefit, BenefitValue } from '@/types/canvas'

export function getExpectedLikely(value: BenefitValue): number {
  if (value.type === 'numeric') return value.value
  return 0
}

/** Time saved per unit = duration before − duration after (baseline − expected). */
export function getTimeSavedPerUnit(benefit: Benefit): number {
  const baseline = getExpectedLikely(benefit.baseline)
  const expected = getExpectedLikely(benefit.expected)
  return Math.max(0, baseline - expected)
}
