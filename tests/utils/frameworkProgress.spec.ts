import { describe, expect, it } from 'vitest'
import type { CanvasData } from '@/types/canvas'
import { computeFrameworkProgress } from '@/utils/frameworkProgress'

function simplifiedOnlyCanvas(): CanvasData {
  return {
    project: {
      title: 'Referral triage support',
      description: 'Referrals pile up and urgent cases are found late.',
      headlineValue: 'The waiting list review starts next quarter.',
    },
    userExpectations: {
      requirements: [{
        id: 'requirement-1',
        title: 'requirement-1',
        targetPopulation: 'Clinical staff triaging referrals',
        benefits: [{ benefitType: 'unclassified', description: 'Fewer urgent cases missed' }],
        feasibility: { technologyApproach: { approaches: ['intelligent-search'] } },
      }],
    },
    developerFeasibility: { constraintFlags: ['large-data'] },
    version: '0.1.0',
    versionDate: '2026-08-12',
  }
}

describe('canvas summary essentials', () => {
  it('counts the answers a simplified canvas provides', () => {
    const progress = computeFrameworkProgress(simplifiedOnlyCanvas())

    expect(progress.summary).toBe(true)
    expect(progress.benefit).toBe(true)
    expect(progress.tasks).toBe(true)
    expect(progress.feasibility).toBe(true)
    // Datasets and deliverables are not asked for in the simplified canvas
    expect(progress.dataAccess).toBe(false)
    expect(progress.outcomes).toBe(false)
    expect(progress.completeCount).toBe(4)
  })

  it('accepts an expected benefit as the value answer', () => {
    const data = simplifiedOnlyCanvas()
    data.project.headlineValue = undefined

    expect(computeFrameworkProgress(data).benefit).toBe(true)

    data.userExpectations!.requirements![0].benefits = []
    expect(computeFrameworkProgress(data).benefit).toBe(false)

    data.project.roughEstimateValue = 12
    expect(computeFrameworkProgress(data).benefit).toBe(true)
  })

  it('does not treat a generated requirement title as an authored task', () => {
    const data = simplifiedOnlyCanvas()
    data.userExpectations!.requirements![0].targetPopulation = undefined
    data.userExpectations!.requirements![0].userStory = 'As a nurse, I want triage help'

    expect(computeFrameworkProgress(data).tasks).toBe(false)

    data.userExpectations!.requirements![0].title = 'Triage incoming referrals'
    expect(computeFrameworkProgress(data).tasks).toBe(true)
  })

  it('accepts either a risk gut-check or the simplified feasibility evidence', () => {
    const data = simplifiedOnlyCanvas()
    data.developerFeasibility = {}
    data.userExpectations!.requirements![0].feasibility = undefined
    expect(computeFrameworkProgress(data).feasibility).toBe(false)

    data.developerFeasibility = { feasibilityNotes: 'A keyword filter missed urgent wording.' }
    expect(computeFrameworkProgress(data).feasibility).toBe(true)

    data.developerFeasibility = { technicalRisk: 'medium' }
    expect(computeFrameworkProgress(data).feasibility).toBe(true)
  })

  it('completes the data and outcome essentials from detailed answers', () => {
    const data = simplifiedOnlyCanvas()
    data.dataAccess = { datasets: [{ id: 'dataset-1', title: 'Referral letters', containsPersonalData: true }] }
    data.outcomes = { deliverables: [{ id: 'deliverable-1', title: 'Triage view', type: 'Software' }] }

    const progress = computeFrameworkProgress(data)
    expect(progress.dataAccess).toBe(true)
    expect(progress.outcomes).toBe(true)
    expect(progress.completeCount).toBe(6)
  })
})
