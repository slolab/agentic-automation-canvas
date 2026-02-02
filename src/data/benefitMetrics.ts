/**
 * Central mapping from schema variables (metricId, benefitType) to UI display.
 * Use these labels everywhere so we never show raw ids like "reworkRate".
 * Semantics (direction, valueMeaning) inform how values are displayed (e.g. x% → y%).
 */

import type { Benefit, BenefitValue } from '@/types/canvas'

export type BenefitType = 'time' | 'quality' | 'risk' | 'enablement'

/** Display label for each metricId per benefit type. Custom metrics use metricLabel from the benefit. */
export const METRIC_DISPLAY_LABELS: Record<BenefitType, Record<string, string>> = {
  time: {
    processingTime: 'Processing time',
    cycleTime: 'Cycle time',
    custom: '', // use metricLabel
  },
  quality: {
    errorRate: 'Error Rate',
    reworkRate: 'Rework Rate',
    precision: 'Precision',
    recall: 'Recall',
    satisfaction: 'Satisfaction Score',
    accuracy: 'Accuracy',
    qualityImprovementTotal: 'Quality improvement',
    custom: '',
  },
  risk: {
    complianceIncidents: 'Compliance Incidents',
    dataExposureRisk: 'Data Exposure Risk',
    auditFindings: 'Audit Findings',
    probabilityOfHarm: 'Probability of Harm',
    securityVulnerabilities: 'Security Vulnerabilities',
    riskReductionTotal: 'Risk reduction',
    custom: '',
  },
  enablement: {
    newCapability: 'New Capability',
    coverage: 'Coverage',
    latencyToAnswer: 'Latency to Answer',
    throughput: 'Throughput',
    availability: 'Availability',
    enablementTotal: 'Enablement',
    custom: '',
  },
}

/**
 * Human-readable label for a metric. Prefer mapped label; for custom use provided metricLabel or humanize metricId.
 */
export function getMetricDisplayLabel(
  benefitType: string,
  metricId: string | null,
  metricLabel?: string
): string {
  if (!metricId) return ''
  const typeMap = METRIC_DISPLAY_LABELS[benefitType as BenefitType]
  const mapped = typeMap?.[metricId]
  if (mapped !== undefined && mapped !== '') return mapped
  if (metricId === 'custom' && metricLabel?.trim()) return metricLabel.trim()
  return humanizeMetricId(metricId)
}

function humanizeMetricId(id: string): string {
  return id
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .replace(/[_-]/g, ' ')
    .trim()
}

/** Format a single BenefitValue for display; unit is appended so we get "10%" not "10 %". */
function formatValuePart(value: BenefitValue, unit: string): string {
  const suf = unit === '%' ? '%' : unit && unit !== 'units' ? ` ${unit}` : ''
  switch (value.type) {
    case 'numeric':
      return `${value.value}${suf}`
    case 'categorical':
      return value.category.charAt(0).toUpperCase() + value.category.slice(1)
    case 'binary':
      return value.bool ? 'Available' : 'Not available'
    default:
      return String(value)
  }
}

/**
 * Format aggregate value for display. Computed aggregates are "baseline → expected";
 * append unit when useful (e.g. "10 → 2 findings/audit"). Manual overrides may be number/string/boolean.
 */
export function formatAggregateValueDisplay(value: number | string | boolean, unit: string): string {
  if (typeof value === 'string') {
    if (unit === '%' && value.includes('%')) return value
    if (unit && !value.endsWith(` ${unit}`)) return `${value} ${unit}`
    return value
  }
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return unit ? `${value} ${unit}` : String(value)
}

/**
 * Format benefit value for display using semantics: baseline → expected with unit.
 * For boolIsBetter shows "Available" / "Not available"; for absolute/delta shows "x unit → y unit" (e.g. "10% → 1%").
 */
export function formatBenefitValueDisplay(benefit: Benefit): string {
  const unit = benefit.benefitUnit?.trim() || ''

  if (benefit.direction === 'boolIsBetter') {
    const base = benefit.baseline.type === 'binary' ? (benefit.baseline.bool ? 'Available' : 'Not available') : ''
    const exp = benefit.expected.type === 'binary' ? (benefit.expected.bool ? 'Available' : 'Not available') : ''
    if (base && exp) return `${base} → ${exp}`
    return exp || base || '—'
  }

  const baselineStr = formatValuePart(benefit.baseline, unit)
  const expectedStr = formatValuePart(benefit.expected, unit)
  return `${baselineStr} → ${expectedStr}`
}
