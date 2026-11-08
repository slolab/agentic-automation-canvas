import { describe, it, expect } from 'vitest'
import { getMonthlyDeploymentCost, aggregateDeploymentCosts } from '@/utils/deploymentCost'
import type { Requirement } from '@/types/canvas'

describe('getMonthlyDeploymentCost', () => {
  it('returns 0 when no deploymentCost is set', () => {
    const req: Requirement = { id: 'r1', title: 'T', benefits: [] }
    expect(getMonthlyDeploymentCost(req)).toBe(0)
  })

  it('calculates perUnit cost as costPerUnit * volumePerMonth', () => {
    const req: Requirement = {
      id: 'r1', title: 'T', benefits: [],
      volumePerMonth: 1000,
      feasibility: {
        deploymentCost: {
          costPerUnit: 0.05,
          aggregationBasis: 'perUnit',
          currency: 'USD',
        },
      },
    }
    expect(getMonthlyDeploymentCost(req)).toBeCloseTo(50)
  })

  it('returns 0 for perUnit when volumePerMonth is missing', () => {
    const req: Requirement = {
      id: 'r1', title: 'T', benefits: [],
      feasibility: {
        deploymentCost: {
          costPerUnit: 0.05,
          aggregationBasis: 'perUnit',
          currency: 'USD',
        },
      },
    }
    expect(getMonthlyDeploymentCost(req)).toBe(0)
  })

  it('returns costPerMonth directly for perMonth aggregation', () => {
    const req: Requirement = {
      id: 'r1', title: 'T', benefits: [],
      feasibility: {
        deploymentCost: {
          costPerMonth: 120,
          aggregationBasis: 'perMonth',
          currency: 'EUR',
        },
      },
    }
    expect(getMonthlyDeploymentCost(req)).toBe(120)
  })
})

describe('aggregateDeploymentCosts', () => {
  it('returns empty map when no tasks have deployment costs', () => {
    const reqs: Requirement[] = [{ id: 'r1', title: 'T', benefits: [] }]
    const result = aggregateDeploymentCosts(reqs)
    expect(result.size).toBe(0)
  })

  it('sums costs grouped by currency', () => {
    const reqs: Requirement[] = [
      {
        id: 'r1', title: 'T1', benefits: [], volumePerMonth: 1000,
        feasibility: { deploymentCost: { costPerUnit: 0.05, aggregationBasis: 'perUnit', currency: 'USD' } },
      },
      {
        id: 'r2', title: 'T2', benefits: [],
        feasibility: { deploymentCost: { costPerMonth: 30, aggregationBasis: 'perMonth', currency: 'USD' } },
      },
      {
        id: 'r3', title: 'T3', benefits: [],
        feasibility: { deploymentCost: { costPerMonth: 80, aggregationBasis: 'perMonth', currency: 'EUR' } },
      },
    ]
    const result = aggregateDeploymentCosts(reqs)
    expect(result.get('USD')).toBeCloseTo(80) // 50 + 30
    expect(result.get('EUR')).toBe(80)
  })
})
