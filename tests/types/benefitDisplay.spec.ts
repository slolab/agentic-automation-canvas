import { describe, expect, it } from 'vitest'
import {
  DEFAULT_DISPLAY_GROUP_COUNT,
  hasCustomBenefitDisplay,
  isBenefitDisplayState,
} from '@/types/benefitDisplay'

describe('hasCustomBenefitDisplay', () => {
  it('is false for absent or default state', () => {
    expect(hasCustomBenefitDisplay(undefined)).toBe(false)
    expect(hasCustomBenefitDisplay({ displayGroups: [] })).toBe(false)
    expect(
      hasCustomBenefitDisplay({
        displayGroups: [],
        displayGroupCount: DEFAULT_DISPLAY_GROUP_COUNT,
      }),
    ).toBe(false)
  })

  it('is true once groups exist or the slot count is customized', () => {
    expect(
      hasCustomBenefitDisplay({
        displayGroups: [{ id: 1, benefitType: 'time', metricId: 'processingTime', benefitRefs: [] }],
      }),
    ).toBe(true)
    expect(hasCustomBenefitDisplay({ displayGroups: [], displayGroupCount: 3 })).toBe(true)
  })
})

describe('isBenefitDisplayState', () => {
  it('accepts a well-formed state', () => {
    expect(
      isBenefitDisplayState({
        displayGroups: [
          {
            id: 1,
            benefitType: 'quality',
            metricId: 'reviewQuality',
            benefitRefs: [{ requirementId: 'req-1', benefitIndex: 0 }],
          },
        ],
        displayGroupCount: 5,
      }),
    ).toBe(true)
  })

  it('rejects unknown benefit types and malformed references', () => {
    expect(
      isBenefitDisplayState({
        displayGroups: [{ id: 1, benefitType: 'sustainability', metricId: 'x', benefitRefs: [] }],
      }),
    ).toBe(false)
    expect(
      isBenefitDisplayState({
        displayGroups: [
          { id: 1, benefitType: 'time', metricId: 'x', benefitRefs: [{ requirementId: 'r' }] },
        ],
      }),
    ).toBe(false)
    expect(isBenefitDisplayState({})).toBe(false)
    expect(isBenefitDisplayState(null)).toBe(false)
  })
})
