import { describe, it, expect } from 'vitest'
import { getExpectedLikely, getTimeSavedPerUnit } from '@/utils/timeBenefits'
import type { Benefit, BenefitValue } from '@/types/canvas'

describe('getExpectedLikely', () => {
  it('returns value for numeric BenefitValue', () => {
    expect(getExpectedLikely({ type: 'numeric', value: 10 })).toBe(10)
    expect(getExpectedLikely({ type: 'numeric', value: 0 })).toBe(0)
    expect(getExpectedLikely({ type: 'numeric', value: 2.5 })).toBe(2.5)
  })

  it('returns 0 for non-numeric BenefitValue', () => {
    expect(getExpectedLikely({ type: 'categorical', category: 'high' })).toBe(0)
    expect(getExpectedLikely({ type: 'categorical', category: 'low' })).toBe(0)
    expect(getExpectedLikely({ type: 'binary', bool: true })).toBe(0)
    expect(getExpectedLikely({ type: 'binary', bool: false })).toBe(0)
  })
})

describe('getTimeSavedPerUnit', () => {
  const baseBenefit = (baseline: BenefitValue, expected: BenefitValue): Benefit =>
    ({
      benefitType: 'time',
      metricId: 'processingTime',
      metricLabel: 'Processing time',
      direction: 'decreaseIsBetter',
      valueMeaning: 'absolute',
      benefitUnit: 'min',
      baseline,
      expected,
    }) as Benefit

  it('returns baseline − expected when baseline > expected', () => {
    const benefit = baseBenefit(
      { type: 'numeric', value: 15 },
      { type: 'numeric', value: 5 }
    )
    expect(getTimeSavedPerUnit(benefit)).toBe(10)
  })

  it('returns 0 when baseline < expected', () => {
    const benefit = baseBenefit(
      { type: 'numeric', value: 5 },
      { type: 'numeric', value: 15 }
    )
    expect(getTimeSavedPerUnit(benefit)).toBe(0)
  })

  it('returns 0 when baseline === expected', () => {
    const benefit = baseBenefit(
      { type: 'numeric', value: 10 },
      { type: 'numeric', value: 10 }
    )
    expect(getTimeSavedPerUnit(benefit)).toBe(0)
  })

  it('treats non-numeric baseline/expected as 0', () => {
    const benefit = baseBenefit(
      { type: 'numeric', value: 8 },
      { type: 'categorical', category: 'high' }
    )
    expect(getTimeSavedPerUnit(benefit)).toBe(8)
  })
})
