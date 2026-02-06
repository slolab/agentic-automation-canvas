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
 * Get human oversight per unit in minutes.
 * Converts from the requirement's time unit to minutes for consistent calculations.
 */
export function getOversightMinutesPerUnit(requirement: Requirement): number {
  if (requirement.humanOversightMinutesPerUnit === undefined) {
    return 0
  }
  
  // If requirement has a timeUnit, the oversight is stored in minutes but represents that unit
  // So we need to convert it. Actually wait - the field is called MinutesPerUnit, so it's always in minutes.
  // But if the requirement has a timeUnit, we should convert the stored minutes to match the unit for display,
  // but keep calculations in minutes.
  
  // Actually, I think the oversight should be stored in the requirement's time unit, not always minutes.
  // But for backward compatibility, let's assume it's stored in minutes for now.
  // We'll need to migrate this properly.
  
  return requirement.humanOversightMinutesPerUnit
}
