/**
 * Time unit conversion utilities.
 * All calculations are done in minutes internally, but we convert for display.
 */

export type TimeUnit = 'minutes' | 'hours'

const MINUTES_PER_HOUR = 60

/**
 * Convert a value from the given unit to minutes.
 */
export function toMinutes(value: number, unit: TimeUnit): number {
  switch (unit) {
    case 'minutes':
      return value
    case 'hours':
      return value * MINUTES_PER_HOUR
    default:
      return value
  }
}

/**
 * Convert a value from minutes to the given unit.
 */
export function fromMinutes(value: number, unit: TimeUnit): number {
  switch (unit) {
    case 'minutes':
      return value
    case 'hours':
      return value / MINUTES_PER_HOUR
    default:
      return value
  }
}

/**
 * Parse a benefit unit string to determine if it's a time unit.
 * Returns the standardized unit or null if not a recognized time unit.
 */
export function parseTimeUnit(unitString: string): TimeUnit | null {
  const normalized = unitString.toLowerCase().trim()
  
  // Check for minutes
  if (normalized.includes('minute') || normalized === 'min' || normalized === 'mins') {
    return 'minutes'
  }
  
  // Check for hours
  if (normalized.includes('hour') || normalized === 'hr' || normalized === 'hrs' || normalized === 'h') {
    return 'hours'
  }
  
  return null
}

/**
 * Get the display label for a time unit.
 */
export function getTimeUnitLabel(unit: TimeUnit): string {
  switch (unit) {
    case 'minutes':
      return 'minutes'
    case 'hours':
      return 'hours'
  }
}
