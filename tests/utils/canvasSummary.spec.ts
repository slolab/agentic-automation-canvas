import { describe, expect, it } from 'vitest'
import type { CanvasData } from '@/types/canvas'
import { computeCanvasSummary } from '@/utils/canvasSummary'

function simplifiedOnlyCanvas(): CanvasData {
  return {
    project: {
      title: 'Referral triage support',
      description: 'Referrals pile up and urgent cases are found late.',
      problemFrequency: 'weekly',
      problemExamples: ['Last Tuesday an urgent referral waited three days.'],
      objective: 'Urgent referrals surface on the day they arrive.',
      headlineValue: 'The waiting list review starts next quarter.',
    },
    userExpectations: {
      requirements: [{
        id: 'requirement-1',
        title: 'requirement-1',
        targetPopulation: 'Clinical staff triaging referrals',
        benefits: [
          { benefitType: 'unclassified', description: 'Less time spent re-reading letters' },
          { benefitType: 'unclassified', description: 'Fewer urgent cases missed' },
          { benefitType: 'unclassified', metricLabel: 'Days from arrival to triage' },
        ],
        feasibility: {
          technologyApproach: {
            approaches: ['intelligent-search', 'other'],
            customApproaches: ['Clinical evidence triage'],
          },
        },
      }],
    },
    developerFeasibility: {
      feasibilityNotes: 'A keyword filter was tried and missed urgent wording.',
      solutionsToResearch: 'Existing triage products',
      constraintFlags: ['large-data', 'personal-data', 'other', 'Needs sign-off from the data office'],
    },
    governance: {
      buildTeamStatus: 'possible',
      maintenanceOwnerStatus: 'none',
      stages: [{
        id: 'stage-1',
        name: 'Planning',
        startDate: '2026-09-01',
        endDate: '2026-12-01',
        milestones: [{ description: 'Shadow-run triage for one clinic', kpi: 'Urgent cases agreed with the clinician' }],
      }],
    },
    dataAccess: {
      datasets: [{ id: 'dataset-1', title: '', containsPersonalData: true }],
    },
    version: '0.1.0',
    versionDate: '2026-08-12',
  }
}

describe('canvas summary v2 content', () => {
  it('labels the problem frequency for the project block', () => {
    const summary = computeCanvasSummary(simplifiedOnlyCanvas())

    expect(summary.project.problemFrequency).toBe('About once a week')
  })

  it('counts lightweight benefits and metrics separately from classified types', () => {
    const summary = computeCanvasSummary(simplifiedOnlyCanvas())

    expect(summary.userExpectations.expectedBenefitCount).toBe(2)
    expect(summary.userExpectations.successMetricCount).toBe(1)
    expect(summary.userExpectations.benefitTypeCounts).toEqual({})
  })

  it('labels constraints and approaches, keeping custom entries verbatim', () => {
    const summary = computeCanvasSummary(simplifiedOnlyCanvas())

    expect(summary.developerFeasibility.constraints).toEqual([
      'Large data',
      'Personal data',
      'Needs sign-off from the data office',
    ])
    expect(summary.developerFeasibility.approaches).toEqual([
      'Intelligent Search',
      'Clinical evidence triage',
    ])
  })

  it('summarises ownership and the first milestone in governance', () => {
    const summary = computeCanvasSummary(simplifiedOnlyCanvas())

    expect(summary.governance.buildTeamStatus).toBe('Possible, but not committed')
    expect(summary.governance.maintenanceOwnerStatus).toBe('No')
    expect(summary.governance.firstMilestone).toEqual({
      description: 'Shadow-run triage for one clinic',
      kpi: 'Urgent cases agreed with the clinician',
    })
  })

  it('reports datasets answered as containing personal data', () => {
    const summary = computeCanvasSummary(simplifiedOnlyCanvas())

    expect(summary.dataAccess.datasetCount).toBe(1)
    expect(summary.dataAccess.personalDataCount).toBe(1)
  })

  it('leaves the new fields empty for a canvas without them', () => {
    const summary = computeCanvasSummary({
      project: { title: 'Bare', description: 'Bare' },
      version: '0.1.0',
      versionDate: '2026-08-12',
    })

    expect(summary.project.problemFrequency).toBe('')
    expect(summary.developerFeasibility.constraints).toEqual([])
    expect(summary.developerFeasibility.approaches).toEqual([])
    expect(summary.governance.firstMilestone).toBeNull()
    expect(summary.governance.buildTeamStatus).toBe('')
    expect(summary.dataAccess.personalDataCount).toBe(0)
  })
})
