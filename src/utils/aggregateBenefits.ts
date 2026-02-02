/**
 * Aggregate benefits are derived from task-level benefits: one row per (benefitType, metricId)
 * with value = baseline → expected (first occurrence). Time = processing time (duration before → after).
 * Time savings can be computed later as (baseline − expected) × volume. Manual overrides in project.aggregateBenefits.
 */

import type { CanvasData, BenefitValue, AggregateBenefit } from '@/types/canvas'

/** Format baseline or expected for aggregate display (numeric, categorical, binary + unit). */
function formatValueForAggregate(value: BenefitValue, unit: string): string {
  const suffix = unit === '%' ? '%' : unit ? ` ${unit}` : ''
  switch (value.type) {
    case 'numeric':
      return `${value.value}${suffix}`
    case 'categorical':
      return value.category.charAt(0).toUpperCase() + value.category.slice(1)
    case 'binary':
      return value.bool ? 'Yes' : 'No'
    default:
      return String(value)
  }
}

/**
 * Compute project-level aggregates from requirements: one per (benefitType, metricId),
 * value = first baseline → expected. Time = task duration before → after (processing time).
 */
export function computeAggregateBenefitsFromRequirements(data: CanvasData): AggregateBenefit[] {
  const requirements = data.userExpectations?.requirements || []
  const key = (type: string, id: string) => `${type}|${id}`
  const byMetric: Record<string, {
    unit: string
    aggregationBasis: 'perUnit' | 'perMonth' | 'oneOff'
    benefitType: string
    metricId: string
    baselineDisplay: string
    expectedDisplay: string
  }> = {}

  for (const req of requirements) {
    for (const benefit of req.benefits || []) {
      const type = benefit.benefitType
      const metricId = benefit.metricId || `${type}Total`
      const k = key(type, metricId)
      const unit = benefit.benefitUnit || ''
      const basis = benefit.aggregationBasis || 'perUnit'

      if (!byMetric[k]) {
        byMetric[k] = {
          unit,
          aggregationBasis: basis,
          benefitType: type,
          metricId,
          baselineDisplay: formatValueForAggregate(benefit.baseline, unit),
          expectedDisplay: formatValueForAggregate(benefit.expected, unit),
        }
      } else if (byMetric[k].unit === '' && unit) {
        byMetric[k].unit = unit
      }
    }
  }

  const typeOrder = ['time', 'quality', 'risk', 'enablement'] as const
  const result: AggregateBenefit[] = Object.values(byMetric).map((acc) => ({
    benefitType: acc.benefitType as AggregateBenefit['benefitType'],
    metricId: acc.metricId,
    aggregationBasis: acc.aggregationBasis,
    unit: acc.unit || 'units',
    value: `${acc.baselineDisplay} → ${acc.expectedDisplay}`,
    method: 'computed' as const,
  }))

  result.sort((a, b) => {
    const ai = typeOrder.indexOf(a.benefitType as (typeof typeOrder)[number])
    const bi = typeOrder.indexOf(b.benefitType as (typeof typeOrder)[number])
    if (ai !== bi) return ai - bi
    return (a.metricId || '').localeCompare(b.metricId || '')
  })
  return result
}

const key = (type: string, id: string) => `${type}|${id}`

/**
 * Effective aggregates: computed from requirements, then overridden by project.aggregateBenefits.
 */
export function getEffectiveAggregateBenefits(data: CanvasData): AggregateBenefit[] {
  const computed = computeAggregateBenefitsFromRequirements(data)
  const overrides = data.project.aggregateBenefits || []
  const effectiveMap = new Map<string, AggregateBenefit>(computed.map((c) => [key(c.benefitType, c.metricId), c]))
  for (const o of overrides) {
    if (o.method === 'manualOverride') {
      effectiveMap.set(key(o.benefitType, o.metricId), o)
    }
  }
  const typeOrder = ['time', 'quality', 'risk', 'enablement'] as const
  const list = Array.from(effectiveMap.values())
  list.sort((a, b) => {
    const ai = typeOrder.indexOf(a.benefitType as (typeof typeOrder)[number])
    const bi = typeOrder.indexOf(b.benefitType as (typeof typeOrder)[number])
    if (ai !== bi) return ai - bi
    return (a.metricId || '').localeCompare(b.metricId || '')
  })
  return list
}
