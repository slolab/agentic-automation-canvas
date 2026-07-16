import { describe, it, expect } from 'vitest'
import { computeFrameworkProgress } from './frameworkProgress'
import type { CanvasData } from '@/types/canvas'

function emptyCanvas(): CanvasData {
  return { project: { title: '', description: '' } }
}

describe('computeFrameworkProgress', () => {
  it('reports zero completed boxes for an empty canvas', () => {
    const p = computeFrameworkProgress(emptyCanvas())
    expect(p.summary).toBe(false)
    expect(p.benefit).toBe(false)
    expect(p.tasks).toBe(false)
    expect(p.feasibility).toBe(false)
    expect(p.dataAccess).toBe(false)
    expect(p.outcomes).toBe(false)
    expect(p.completeCount).toBe(0)
  })

  it('completes summary only when title and description are non-blank', () => {
    const data = emptyCanvas()
    data.project.title = 'Clinical letter triage'
    expect(computeFrameworkProgress(data).summary).toBe(false)
    data.project.description = '   '
    expect(computeFrameworkProgress(data).summary).toBe(false)
    data.project.description = 'Sort incoming letters automatically'
    expect(computeFrameworkProgress(data).summary).toBe(true)
  })

  it('completes benefit with a headline value or a rough estimate', () => {
    const withHeadline = emptyCanvas()
    withHeadline.project.headlineValue = 'Save ~10 h/month'
    expect(computeFrameworkProgress(withHeadline).benefit).toBe(true)

    const withEstimate = emptyCanvas()
    withEstimate.project.roughEstimateValue = 10
    withEstimate.project.roughEstimateUnit = 'hours/month'
    expect(computeFrameworkProgress(withEstimate).benefit).toBe(true)
  })

  it('does not count a cleared rough estimate as a benefit', () => {
    // v-model.number leaves '' when the input is emptied; older data can hold null
    const cleared = emptyCanvas()
    cleared.project.roughEstimateValue = '' as unknown as number
    expect(computeFrameworkProgress(cleared).benefit).toBe(false)

    const nulled = emptyCanvas()
    nulled.project.roughEstimateValue = null as unknown as number
    expect(computeFrameworkProgress(nulled).benefit).toBe(false)

    const zero = emptyCanvas()
    zero.project.roughEstimateValue = 0
    expect(computeFrameworkProgress(zero).benefit).toBe(true)
  })

  it('completes tasks when the first task has a title and a user story', () => {
    const data = emptyCanvas()
    data.userExpectations = {
      requirements: [{ id: 'r1', title: 'De-identify letters', benefits: [] }],
    }
    expect(computeFrameworkProgress(data).tasks).toBe(false)
    data.userExpectations.requirements![0].userStory =
      'As a clinician, I want letters triaged, so that I see urgent ones first'
    expect(computeFrameworkProgress(data).tasks).toBe(true)
  })

  it('completes feasibility when a project-level technical risk is set', () => {
    const data = emptyCanvas()
    data.developerFeasibility = { technicalRisk: 'medium' }
    expect(computeFrameworkProgress(data).feasibility).toBe(true)
  })

  it('completes dataAccess when a dataset has a title and an explicit personal-data answer', () => {
    const data = emptyCanvas()
    data.dataAccess = { datasets: [{ id: 'd1', title: 'Patient letters' }] }
    expect(computeFrameworkProgress(data).dataAccess).toBe(false)
    // an explicit "no" also counts as answered
    data.dataAccess.datasets![0].containsPersonalData = false
    expect(computeFrameworkProgress(data).dataAccess).toBe(true)
  })

  it('completes outcomes only when a deliverable has both title and type', () => {
    const data = emptyCanvas()
    // title alone is not enough: a typeless deliverable would raise a validation error
    data.outcomes = { deliverables: [{ id: 'del1', title: 'Triage dashboard', type: '' }] }
    expect(computeFrameworkProgress(data).outcomes).toBe(false)
    data.outcomes.deliverables![0].type = 'software'
    expect(computeFrameworkProgress(data).outcomes).toBe(true)
  })

  it('counts all six boxes on a fully filled framework', () => {
    const data: CanvasData = {
      project: {
        title: 'Clinical letter triage',
        description: 'Sort incoming letters automatically',
        headlineValue: 'Save ~10 h/month',
      },
      userExpectations: {
        requirements: [
          {
            id: 'r1',
            title: 'De-identify letters',
            userStory: 'As a clinician, I want letters triaged, so that I see urgent ones first',
            benefits: [],
          },
        ],
      },
      developerFeasibility: { technicalRisk: 'medium' },
      dataAccess: { datasets: [{ id: 'd1', title: 'Patient letters', containsPersonalData: true }] },
      outcomes: { deliverables: [{ id: 'del1', title: 'Triage dashboard', type: 'software' }] },
    }
    const p = computeFrameworkProgress(data)
    expect(p.completeCount).toBe(6)
  })
})
