import { describe, it, expect } from 'vitest'
import { fieldToNavTarget } from '@/utils/fieldNavigation'

describe('fieldToNavTarget', () => {
  // Project fields
  it('maps project.title', () => {
    expect(fieldToNavTarget('project.title')).toEqual({
      sectionId: 'project', itemType: 'project', itemIndex: null, domFieldId: 'project-title',
    })
  })
  it('maps project.description', () => {
    expect(fieldToNavTarget('project.description')).toEqual({
      sectionId: 'project', itemType: 'project', itemIndex: null, domFieldId: 'project-description',
    })
  })
  it('maps project.projectStage', () => {
    expect(fieldToNavTarget('project.projectStage')).toEqual({
      sectionId: 'project', itemType: 'project', itemIndex: null, domFieldId: 'project-stage',
    })
  })
  it('maps generic project field to project-title fallback', () => {
    const result = fieldToNavTarget('project')
    expect(result?.sectionId).toBe('project')
    expect(result?.domFieldId).toBe('project-title')
  })

  // Requirements — list-level
  it('maps userExpectations.requirements (list-level)', () => {
    expect(fieldToNavTarget('userExpectations.requirements')).toEqual({
      sectionId: 'user-expectations', itemType: null, itemIndex: null, domFieldId: null,
    })
  })

  // Requirements — item-level
  it('maps requirements[0].title', () => {
    expect(fieldToNavTarget('requirements[0].title')).toEqual({
      sectionId: 'user-expectations', itemType: 'requirement', itemIndex: 0, domFieldId: 'req-title-0',
    })
  })
  it('maps requirements[3].unitOfWork', () => {
    expect(fieldToNavTarget('requirements[3].unitOfWork')).toEqual({
      sectionId: 'user-expectations', itemType: 'requirement', itemIndex: 3, domFieldId: 'req-unit-3',
    })
  })
  it('maps requirements[1].unitCategory', () => {
    expect(fieldToNavTarget('requirements[1].unitCategory')).toEqual({
      sectionId: 'user-expectations', itemType: 'requirement', itemIndex: 1, domFieldId: 'req-unit-category-1',
    })
  })
  it('maps requirements[2].volumePerMonth', () => {
    expect(fieldToNavTarget('requirements[2].volumePerMonth')).toEqual({
      sectionId: 'user-expectations', itemType: 'requirement', itemIndex: 2, domFieldId: 'req-volume-2',
    })
  })
  it('maps requirements[2].dataAccess to the Data Access tab', () => {
    expect(fieldToNavTarget('requirements[2].dataAccess')).toEqual({
      sectionId: 'data-access', itemType: null, itemIndex: null, domFieldId: null,
    })
  })
  it('maps requirements[0].benefits to Edit Benefits button', () => {
    const result = fieldToNavTarget('requirements[0].benefits')
    expect(result?.sectionId).toBe('user-expectations')
    expect(result?.itemType).toBe('requirement')
    expect(result?.itemIndex).toBe(0)
    expect(result?.domFieldId).toBe('req-benefits-edit-0')
  })
  it('maps nested benefit field — expands item, no specific field', () => {
    const result = fieldToNavTarget('requirements[1].benefits[0].metricLabel')
    expect(result?.itemType).toBe('requirement')
    expect(result?.itemIndex).toBe(1)
    expect(result?.domFieldId).toBe('req-benefits-edit-1')
  })
  it('maps requirements[1].netTimeSaved to Edit Benefits button', () => {
    const result = fieldToNavTarget('requirements[1].netTimeSaved')
    expect(result?.domFieldId).toBe('req-benefits-edit-1')
  })
  it('maps requirements[0].benefits[0].metricLabel to Edit Benefits button', () => {
    const result = fieldToNavTarget('requirements[0].benefits[0].metricLabel')
    expect(result?.domFieldId).toBe('req-benefits-edit-0')
  })

  // Datasets
  it('maps datasets[0].title', () => {
    expect(fieldToNavTarget('datasets[0].title')).toEqual({
      sectionId: 'data-access', itemType: 'dataset', itemIndex: 0, domFieldId: 'dataset-title-0',
    })
  })
  it('maps datasets[2].accessRights', () => {
    expect(fieldToNavTarget('datasets[2].accessRights')).toEqual({
      sectionId: 'data-access', itemType: 'dataset', itemIndex: 2, domFieldId: 'dataset-access-2',
    })
  })

  // Outcomes — deliverables
  it('maps outcomes.deliverables[0].title', () => {
    expect(fieldToNavTarget('outcomes.deliverables[0].title')).toEqual({
      sectionId: 'outcomes', itemType: 'deliverable', itemIndex: 0, domFieldId: 'deliverable-title-0',
    })
  })
  it('maps outcomes.deliverables[1].type', () => {
    expect(fieldToNavTarget('outcomes.deliverables[1].type')).toEqual({
      sectionId: 'outcomes', itemType: 'deliverable', itemIndex: 1, domFieldId: 'deliverable-type-1',
    })
  })

  // Outcomes — publications
  it('maps outcomes.publications[0].title', () => {
    expect(fieldToNavTarget('outcomes.publications[0].title')).toEqual({
      sectionId: 'outcomes', itemType: 'publication', itemIndex: 0, domFieldId: 'pub-title-0',
    })
  })

  // Outcomes — evaluations
  it('maps outcomes.evaluations[0].type', () => {
    expect(fieldToNavTarget('outcomes.evaluations[0].type')).toEqual({
      sectionId: 'outcomes', itemType: 'evaluation', itemIndex: 0, domFieldId: 'eval-type-0',
    })
  })

  // Persons
  it('maps persons[0].name', () => {
    expect(fieldToNavTarget('persons[0].name')).toEqual({
      sectionId: 'persons', itemType: 'person', itemIndex: 0, domFieldId: 'person-name-0',
    })
  })
  it('maps persons[2].localTitle', () => {
    expect(fieldToNavTarget('persons[2].localTitle')).toEqual({
      sectionId: 'persons', itemType: 'person', itemIndex: 2, domFieldId: 'person-local-title-2',
    })
  })
  it('maps an unmapped person field to the person item', () => {
    expect(fieldToNavTarget('persons[1].functionRoles')).toEqual({
      sectionId: 'persons', itemType: 'person', itemIndex: 1, domFieldId: 'person-function-roles-1',
    })
  })

  // Governance stages
  it('maps governance.stages[0].name', () => {
    expect(fieldToNavTarget('governance.stages[0].name')).toEqual({
      sectionId: 'governance', itemType: 'stage', itemIndex: 0, domFieldId: 'stage-name-0',
    })
  })
  it('maps governance.stages[1].policyCardUri', () => {
    expect(fieldToNavTarget('governance.stages[1].policyCardUri')).toEqual({
      sectionId: 'governance', itemType: 'stage', itemIndex: 1, domFieldId: 'stage-policy-card-uri-1',
    })
  })
  it('maps a nested stage field to the stage item without a field target', () => {
    expect(fieldToNavTarget('governance.stages[0].agents[1].type')).toEqual({
      sectionId: 'governance', itemType: 'stage', itemIndex: 0, domFieldId: null,
    })
  })
  it('maps governance.stages (list-level)', () => {
    expect(fieldToNavTarget('governance.stages')).toEqual({
      sectionId: 'governance', itemType: null, itemIndex: null, domFieldId: null,
    })
  })

  // Project-level developer feasibility
  it('maps developerFeasibility.technicalRisk', () => {
    expect(fieldToNavTarget('developerFeasibility.technicalRisk')).toEqual({
      sectionId: 'developer-feasibility', itemType: 'feasibility', itemIndex: null,
      domFieldId: 'technical-risk',
    })
  })
  it('maps developerFeasibility.trlLevel.current', () => {
    expect(fieldToNavTarget('developerFeasibility.trlLevel.current')).toEqual({
      sectionId: 'developer-feasibility', itemType: 'feasibility', itemIndex: null,
      domFieldId: 'trl-current',
    })
  })

  // Task-level feasibility is edited on the Feasibility & Risks tab, not Tasks
  it('routes requirement feasibility fields to the feasibility section', () => {
    expect(fieldToNavTarget('requirements[0].feasibility.risks[0].title')).toEqual({
      sectionId: 'developer-feasibility', itemType: null, itemIndex: null, domFieldId: null,
    })
  })

  // Unknown field
  it('returns null for unrecognised field', () => {
    expect(fieldToNavTarget('unknown.field')).toBeNull()
  })
})
