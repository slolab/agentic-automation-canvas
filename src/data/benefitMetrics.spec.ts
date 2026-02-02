import { describe, it, expect } from 'vitest'
import {
  getMetricDisplayLabel,
  formatBenefitValueDisplay,
  formatAggregateValueDisplay,
} from '@/data/benefitMetrics'
import type { Benefit } from '@/types/canvas'

describe('getMetricDisplayLabel', () => {
  it('returns mapped label for known metricId', () => {
    expect(getMetricDisplayLabel('time', 'processingTime')).toBe('Processing time')
    expect(getMetricDisplayLabel('quality', 'errorRate')).toBe('Error Rate')
    expect(getMetricDisplayLabel('risk', 'complianceIncidents')).toBe('Compliance Incidents')
    expect(getMetricDisplayLabel('enablement', 'throughput')).toBe('Throughput')
  })

  it('returns metricLabel for custom metricId when provided', () => {
    expect(getMetricDisplayLabel('time', 'custom', ' My Custom Metric ')).toBe('My Custom Metric')
  })

  it('returns humanized metricId for unknown (no custom label)', () => {
    expect(getMetricDisplayLabel('quality', 'someUnknownId')).toBe('Some Unknown Id')
    expect(getMetricDisplayLabel('time', 'cycleTime')).toBe('Cycle time')
  })

  it('returns empty string for null metricId', () => {
    expect(getMetricDisplayLabel('time', null)).toBe('')
  })
})

describe('formatBenefitValueDisplay', () => {
  it('formats numeric with unit (absolute/delta)', () => {
    const benefit: Benefit = {
      benefitType: 'quality',
      metricId: 'errorRate',
      metricLabel: 'Error Rate',
      direction: 'decreaseIsBetter',
      valueMeaning: 'absolute',
      benefitUnit: '%',
      baseline: { type: 'numeric', value: 10 },
      expected: { type: 'numeric', value: 2 },
    } as Benefit
    expect(formatBenefitValueDisplay(benefit)).toBe('10% → 2%')
  })

  it('formats binary (boolIsBetter) as Available / Not available', () => {
    const benefit: Benefit = {
      benefitType: 'enablement',
      metricId: 'newCapability',
      metricLabel: 'New Capability',
      direction: 'boolIsBetter',
      valueMeaning: 'absolute',
      benefitUnit: '',
      baseline: { type: 'binary', bool: false },
      expected: { type: 'binary', bool: true },
    } as Benefit
    expect(formatBenefitValueDisplay(benefit)).toBe('Not available → Available')
  })

  it('formats categorical', () => {
    const benefit: Benefit = {
      benefitType: 'quality',
      metricId: 'satisfaction',
      metricLabel: 'Satisfaction',
      direction: 'increaseIsBetter',
      valueMeaning: 'absolute',
      benefitUnit: '',
      baseline: { type: 'categorical', category: 'low' },
      expected: { type: 'categorical', category: 'high' },
    } as Benefit
    expect(formatBenefitValueDisplay(benefit)).toBe('Low → High')
  })
})

describe('formatAggregateValueDisplay', () => {
  it('formats number with unit', () => {
    expect(formatAggregateValueDisplay(42, 'hours')).toBe('42 hours')
    expect(formatAggregateValueDisplay(3.5, '%')).toBe('3.5 %')
  })

  it('formats string (optionally appends unit if not present)', () => {
    expect(formatAggregateValueDisplay('Manual estimate', 'hours')).toBe('Manual estimate hours')
    expect(formatAggregateValueDisplay('50%', '%')).toBe('50%')
  })

  it('formats boolean as Yes/No', () => {
    expect(formatAggregateValueDisplay(true, '')).toBe('Yes')
    expect(formatAggregateValueDisplay(false, '')).toBe('No')
  })
})
