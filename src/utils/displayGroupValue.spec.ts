import { describe, it, expect } from 'vitest'
import { formatDisplayGroupValue } from '@/utils/displayGroupValue'
import type { Requirement } from '@/types/canvas'
import type { BenefitDisplayGroup } from '@/types/benefitDisplay'

function req(id: string, volumePerMonth: number, benefits: Requirement['benefits']): Requirement {
  return { id, description: '', benefits, volumePerMonth }
}

function timeBenefit(baselineMin: number, expectedMin: number) {
  return {
    benefitType: 'time' as const,
    metricId: 'processingTime',
    metricLabel: 'Processing time',
    direction: 'decreaseIsBetter' as const,
    valueMeaning: 'absolute' as const,
    benefitUnit: 'min',
    baseline: { type: 'numeric' as const, value: baselineMin },
    expected: { type: 'numeric' as const, value: expectedMin },
  }
}

function qualityBenefit(display: string) {
  return {
    benefitType: 'quality' as const,
    metricId: 'errorRate',
    metricLabel: 'Error Rate',
    direction: 'decreaseIsBetter' as const,
    valueMeaning: 'absolute' as const,
    benefitUnit: '%',
    baseline: { type: 'numeric' as const, value: 10 },
    expected: { type: 'numeric' as const, value: 2 },
  }
}

describe('formatDisplayGroupValue', () => {
  it('returns em dash when benefitRefs is empty', () => {
    const group: BenefitDisplayGroup = {
      id: 0,
      benefitType: 'time',
      metricId: 'processingTime',
      benefitRefs: [],
    }
    expect(formatDisplayGroupValue(group, [])).toBe('—')
  })

  it('sums time group: one benefit and volume → min saved/month when total < 60', () => {
    const reqs: Requirement[] = [
      req('r1', 10, [timeBenefit(10, 5)]), // 5 min saved/unit * 10 = 50 min
    ]
    const group: BenefitDisplayGroup = {
      id: 0,
      benefitType: 'time',
      metricId: 'processingTime',
      benefitRefs: [{ requirementId: 'r1', benefitIndex: 0 }],
    }
    expect(formatDisplayGroupValue(group, reqs)).toBe('50 min saved/month')
  })

  it('sums time group: two benefits and volumes → hours when total >= 60 min', () => {
    const reqs: Requirement[] = [
      req('r1', 60, [timeBenefit(10, 4)]),   // 6 * 60 = 360 min
      req('r2', 40, [timeBenefit(15, 10)]), // 5 * 40 = 200 min → total 560 min = 9.3 h
    ]
    const group: BenefitDisplayGroup = {
      id: 0,
      benefitType: 'time',
      metricId: 'processingTime',
      benefitRefs: [
        { requirementId: 'r1', benefitIndex: 0 },
        { requirementId: 'r2', benefitIndex: 0 },
      ],
    }
    expect(formatDisplayGroupValue(group, reqs)).toBe('9.3 h saved/month')
  })

  it('time total <= 0 falls back to first benefit display', () => {
    const reqs: Requirement[] = [
      req('r1', 10, [timeBenefit(5, 10)]), // no time saved
    ]
    const group: BenefitDisplayGroup = {
      id: 0,
      benefitType: 'time',
      metricId: 'processingTime',
      benefitRefs: [{ requirementId: 'r1', benefitIndex: 0 }],
    }
    expect(formatDisplayGroupValue(group, reqs)).toBe('5 min → 10 min')
  })

  it('non-time single benefit → one value', () => {
    const reqs: Requirement[] = [
      req('r1', 0, [qualityBenefit('10%')]),
    ]
    const group: BenefitDisplayGroup = {
      id: 0,
      benefitType: 'quality',
      metricId: 'errorRate',
      benefitRefs: [{ requirementId: 'r1', benefitIndex: 0 }],
    }
    expect(formatDisplayGroupValue(group, reqs)).toBe('10% → 2%')
  })

  it('non-time multiple benefits → comma-separated list', () => {
    const b1 = qualityBenefit('x')
    const b2 = {
      ...qualityBenefit('y'),
      baseline: { type: 'numeric' as const, value: 20 },
      expected: { type: 'numeric' as const, value: 5 },
    }
    const reqs: Requirement[] = [
      req('r1', 0, [b1]),
      req('r2', 0, [b2]),
    ]
    const group: BenefitDisplayGroup = {
      id: 0,
      benefitType: 'quality',
      metricId: 'errorRate',
      benefitRefs: [
        { requirementId: 'r1', benefitIndex: 0 },
        { requirementId: 'r2', benefitIndex: 0 },
      ],
    }
    expect(formatDisplayGroupValue(group, reqs)).toBe('10% → 2%, 20% → 5%')
  })

  it('missing req/benefit skips that ref', () => {
    const reqs: Requirement[] = [
      req('r1', 10, [timeBenefit(10, 5)]),
    ]
    const group: BenefitDisplayGroup = {
      id: 0,
      benefitType: 'time',
      metricId: 'processingTime',
      benefitRefs: [
        { requirementId: 'r1', benefitIndex: 0 },
        { requirementId: 'missing', benefitIndex: 0 },
      ],
    }
    expect(formatDisplayGroupValue(group, reqs)).toBe('50 min saved/month')
  })

  it('resolves requirement by id or fallback req-{i}', () => {
    const reqNoId: Requirement = { id: 'req-0', description: '', benefits: [timeBenefit(10, 3)], volumePerMonth: 10 }
    const reqs: Requirement[] = [{ ...reqNoId }]
    const group: BenefitDisplayGroup = {
      id: 0,
      benefitType: 'time',
      metricId: 'processingTime',
      benefitRefs: [{ requirementId: 'req-0', benefitIndex: 0 }],
    }
    // 7 min saved/unit * 10 = 70 min >= 60 → displayed as hours
    expect(formatDisplayGroupValue(group, reqs)).toBe('1.2 h saved/month')
  })
})
