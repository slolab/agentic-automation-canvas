/**
 * Helpers for time benefits. Time = processing time (duration before → after).
 * Time saved per unit = baseline − expected (derived, not stored).
 * All calculations are normalized to minutes internally.
 */

import type { Benefit, BenefitValue, Requirement } from '@/types/canvas'
import { toMinutes, parseTimeUnit, type TimeUnit } from './timeUnitConversion'

export function getExpectedLikely(value: BenefitValue): number {
  if (value.type === 'numeric') return value.value
  return 0
}

/**
 * Get time saved per unit in minutes.
 * Converts from the requirement's time unit to minutes for consistent calculations.
 */
export function getTimeSavedPerUnit(benefit: Benefit, requirement?: Requirement): number {
  const baseline = getExpectedLikely(benefit.baseline)
  const expected = getExpectedLikely(benefit.expected)
  
  // Determine the unit to use for conversion
  let unit: TimeUnit = 'minutes' // default
  if (requirement?.timeUnit) {
    unit = requirement.timeUnit
  } else if (benefit.benefitUnit) {
    const parsedUnit = parseTimeUnit(benefit.benefitUnit)
    if (parsedUnit) {
      unit = parsedUnit
    }
  }
  
  // Convert to minutes for calculation
  const baselineMinutes = toMinutes(baseline, unit)
  const expectedMinutes = toMinutes(expected, unit)
  
  return Math.max(0, baselineMinutes - expectedMinutes)
}

/**
 * Get human oversight for a time benefit in minutes.
 * Returns oversight per unit or per month.
 * Oversight is always stored and measured in minutes.
 * 
 * Logic:
 * - If oversightMinutesPerMonth is set, use it (independent of aggregation basis)
 * - Otherwise, if oversightMinutesPerUnit is set, multiply by volume for perUnit aggregation
 * - For perMonth aggregation, use oversightMinutesPerMonth if set
 * - For oneOff, no oversight
 */
export function getOversightMinutes(benefit: Benefit, volumePerMonth?: number): number {
  // Oversight follows the aggregation basis of the benefit
  if (benefit.aggregationBasis === 'perUnit') {
    // For perUnit aggregation, oversight is per unit - multiply by volume
    if (benefit.oversightMinutesPerUnit !== undefined && benefit.oversightMinutesPerUnit !== null && !isNaN(benefit.oversightMinutesPerUnit)) {
      return volumePerMonth ? benefit.oversightMinutesPerUnit * volumePerMonth : benefit.oversightMinutesPerUnit
    }
  } else if (benefit.aggregationBasis === 'perMonth') {
    // For perMonth aggregation, oversight is already per month - return directly
    if (benefit.oversightMinutesPerMonth !== undefined && benefit.oversightMinutesPerMonth !== null && !isNaN(benefit.oversightMinutesPerMonth)) {
      return benefit.oversightMinutesPerMonth
    }
  }
  
  // For oneOff or no oversight set, return 0
  return 0
}

/**
 * Get human oversight per unit in minutes (for perUnit aggregation only).
 * @deprecated Use getOversightMinutes instead
 */
export function getOversightMinutesPerUnit(requirement: Requirement): number {
  if (requirement.humanOversightMinutesPerUnit === undefined) {
    return 0
  }
  return requirement.humanOversightMinutesPerUnit
}
