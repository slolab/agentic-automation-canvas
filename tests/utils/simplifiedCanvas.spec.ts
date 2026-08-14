import { describe, expect, it } from 'vitest'
import { reactive } from 'vue'
import type { Benefit, DataAccessSensitivity, GovernanceStaging, UserExpectations } from '@/types/canvas'
import {
  applyDatasetConstraintToggle,
  patchFirstStageMilestone,
  patchFirstStage,
  patchPrimaryRequirement,
  replacePrimaryUnclassifiedBenefits,
  retainedClassifiedBenefitIndexes,
} from '@/utils/simplifiedCanvas'

const idFactory = (prefix: string) => `${prefix}-generated`

const classifiedBenefit: Benefit = {
  benefitType: 'quality',
  metricId: 'accuracy',
  metricLabel: 'Accuracy',
  direction: 'increaseIsBetter',
  valueMeaning: 'absolute',
  benefitUnit: '%',
  baseline: { type: 'numeric', value: 70 },
  expected: { type: 'numeric', value: 90 },
}

describe('simplified canvas canonical mappings', () => {
  it('creates the schema-required primary requirement with title equal to its id', () => {
    const result = patchPrimaryRequirement(
      undefined,
      { targetPopulation: 'Lab staff' },
      idFactory,
    )

    expect(result.requirements).toEqual([{
      id: 'requirement-generated',
      title: 'requirement-generated',
      benefits: [],
      targetPopulation: 'Lab staff',
    }])
  })

  it('patches only the first requirement and preserves detailed nested data and later tasks', () => {
    const current: UserExpectations = {
      requirements: [
        {
          id: 'req-1',
          title: 'Existing task',
          benefits: [classifiedBenefit],
          feasibility: {
            technologyApproach: {
              architecture: 'rag',
              ragDetails: { retrievalMethod: 'hybrid' },
            },
          },
        },
        { id: 'req-2', title: 'Later task', benefits: [] },
      ],
    }

    const result = patchPrimaryRequirement(current, {
      targetPopulation: 'Researchers',
      feasibility: {
        ...current.requirements![0].feasibility,
        technologyApproach: {
          ...current.requirements![0].feasibility!.technologyApproach,
          approaches: ['agentic-research-support', 'analysis-pipeline-orchestration'],
        },
      },
    })

    expect(result.requirements?.[0]).toMatchObject({
      id: 'req-1',
      title: 'Existing task',
      targetPopulation: 'Researchers',
      benefits: [classifiedBenefit],
      feasibility: {
        technologyApproach: {
          architecture: 'rag',
          approaches: ['agentic-research-support', 'analysis-pipeline-orchestration'],
          ragDetails: { retrievalMethod: 'hybrid' },
        },
      },
    })
    expect(result.requirements?.[1]).toEqual(current.requirements?.[1])
  })

  it('replaces lightweight descriptions or metrics without dropping classified benefits', () => {
    const current: UserExpectations = {
      requirements: [{
        id: 'req-1',
        title: 'req-1',
        benefits: [
          classifiedBenefit,
          { benefitType: 'unclassified', description: 'Old benefit' },
          { benefitType: 'unclassified', metricLabel: 'Old metric' },
        ],
      }],
    }

    const descriptions = replacePrimaryUnclassifiedBenefits(
      current,
      'description',
      ['Fewer handoffs', 'Fewer handoffs', ''],
    )
    expect(descriptions.requirements?.[0].benefits).toEqual([
      classifiedBenefit,
      { benefitType: 'unclassified', description: 'Fewer handoffs' },
      { benefitType: 'unclassified', metricLabel: 'Old metric' },
    ])

    const metrics = replacePrimaryUnclassifiedBenefits(
      descriptions,
      'metricLabel',
      ['Escalations per month'],
    )
    expect(metrics.requirements?.[0].benefits).toEqual([
      classifiedBenefit,
      { benefitType: 'unclassified', description: 'Fewer handoffs' },
      { benefitType: 'unclassified', metricLabel: 'Escalations per month' },
    ])
  })

  it('edits lightweight entries in place and maps classified indexes after deletion', () => {
    const laterClassifiedBenefit: Benefit = {
      ...classifiedBenefit,
      metricId: 'consistency',
      metricLabel: 'Consistency',
    }
    const current: UserExpectations = {
      requirements: [{
        id: 'req-1',
        title: 'req-1',
        benefits: [
          { benefitType: 'unclassified', description: 'First draft' },
          classifiedBenefit,
          { benefitType: 'unclassified', metricLabel: 'Cases per month' },
          laterClassifiedBenefit,
        ],
      }],
    }

    const edited = replacePrimaryUnclassifiedBenefits(
      current,
      'description',
      ['Reworded benefit'],
    )
    expect(edited.requirements?.[0].benefits[1]).toBe(classifiedBenefit)
    expect(edited.requirements?.[0].benefits[3]).toBe(laterClassifiedBenefit)

    const cleared = replacePrimaryUnclassifiedBenefits(edited, 'description', [])
    const indexMap = retainedClassifiedBenefitIndexes(
      edited.requirements![0].benefits,
      cleared.requirements![0].benefits,
    )
    expect(indexMap.get(1)).toBe(0)
    expect(indexMap.get(3)).toBe(2)
    expect(cleared.requirements?.[0].benefits).toEqual([
      classifiedBenefit,
      { benefitType: 'unclassified', metricLabel: 'Cases per month' },
      laterClassifiedBenefit,
    ])
  })

  it('creates a Planning stage lazily and patches its first milestone', () => {
    const result = patchFirstStageMilestone(
      undefined,
      { description: 'Validate on 100 cases', kpi: 'At least 95 pass' },
      idFactory,
    )

    expect(result.stages).toEqual([{
      id: 'stage-generated',
      name: 'Planning',
      milestones: [{
        description: 'Validate on 100 cases',
        kpi: 'At least 95 pass',
      }],
    }])
  })

  it('reuses the first existing stage and preserves later stages and milestones', () => {
    const current: GovernanceStaging = {
      stages: [
        {
          id: 'discovery',
          name: 'Discovery',
          milestones: [
            { description: 'Old wording', kpi: 'Old KPI' },
            { description: 'Second milestone' },
          ],
        },
        { id: 'delivery', name: 'Delivery' },
      ],
    }

    const result = patchFirstStageMilestone(current, { description: 'New wording' })

    expect(result.stages).toHaveLength(2)
    expect(result.stages?.[0].name).toBe('Discovery')
    expect(result.stages?.[0].milestones).toEqual([
      { description: 'New wording', kpi: 'Old KPI' },
      { description: 'Second milestone' },
    ])
    expect(result.stages?.[1]).toEqual(current.stages?.[1])
  })

  it('patches first-stage dates without replacing milestones, agents, or later stages', () => {
    const current: GovernanceStaging = {
      stages: [
        {
          id: 'discovery',
          name: 'Discovery',
          agents: [{ type: 'person', personId: 'person-1' }],
          milestones: [{ description: 'Validate it', kpi: '95% pass' }],
          complianceStandards: ['Internal policy'],
        },
        { id: 'delivery', name: 'Delivery' },
      ],
    }

    const result = patchFirstStage(current, {
      startDate: '2026-09-01',
      endDate: '2026-09-30',
    })

    expect(result.stages?.[0]).toEqual({
      ...current.stages?.[0],
      startDate: '2026-09-01',
      endDate: '2026-09-30',
    })
    expect(result.stages?.[1]).toEqual(current.stages?.[1])
  })

  it('accepts Vue reactive records used by the live composable', () => {
    const expectations = reactive<UserExpectations>({
      requirements: [{ id: 'req-1', title: 'req-1', benefits: [classifiedBenefit] }],
    })
    const governance = reactive<GovernanceStaging>({
      stages: [{ id: 'stage-1', name: 'Planning', milestones: [] }],
    })

    expect(() => replacePrimaryUnclassifiedBenefits(
      expectations,
      'description',
      ['Fewer delays'],
    )).not.toThrow()
    expect(() => patchFirstStageMilestone(
      governance,
      { description: 'Validated pilot' },
    )).not.toThrow()
  })
})

describe('dataset constraints', () => {
  const check = (flag: string, flags: readonly string[] = [flag]) => ({ flag, checked: true, flags })
  const uncheck = (flag: string, flags: readonly string[] = []) => ({ flag, checked: false, flags })

  it('creates the dataset a data constraint implies', () => {
    const result = applyDatasetConstraintToggle(undefined, check('large-data'), idFactory)

    expect(result?.datasets).toEqual([{ id: 'dataset-generated', title: '' }])
  })

  it('records personal data on the dataset without creating a second one', () => {
    const first = applyDatasetConstraintToggle(undefined, check('large-data'), idFactory)
    const second = applyDatasetConstraintToggle(
      first,
      check('personal-data', ['large-data', 'personal-data']),
      idFactory,
    )

    expect(second?.datasets).toEqual([{
      id: 'dataset-generated',
      title: '',
      containsPersonalData: true,
    }])
  })

  it('clears the personal-data answer when that checkbox is unchecked', () => {
    const current: DataAccessSensitivity = {
      datasets: [
        { id: 'dataset-1', title: 'Referral letters', accessRights: 'restricted', containsPersonalData: true },
        { id: 'dataset-2', title: 'Reference corpus', containsPersonalData: true },
      ],
    }

    const result = applyDatasetConstraintToggle(current, uncheck('personal-data'), idFactory)

    expect(result?.datasets).toEqual([
      { id: 'dataset-1', title: 'Referral letters', accessRights: 'restricted' },
      { id: 'dataset-2', title: 'Reference corpus', containsPersonalData: true },
    ])
  })

  it('removes the generated dataset when the last data constraint is unchecked', () => {
    const created = applyDatasetConstraintToggle(undefined, check('personal-data'), idFactory)
    expect(created?.datasets).toEqual([
      { id: 'dataset-generated', title: '', containsPersonalData: true },
    ])

    expect(applyDatasetConstraintToggle(created, uncheck('personal-data'), idFactory)).toBeUndefined()
  })

  it('keeps the generated dataset while another data constraint is still selected', () => {
    const created = applyDatasetConstraintToggle(undefined, check('personal-data'), idFactory)

    const result = applyDatasetConstraintToggle(
      created,
      uncheck('personal-data', ['large-data']),
      idFactory,
    )

    expect(result?.datasets).toEqual([{ id: 'dataset-generated', title: '' }])
  })

  it('leaves data access untouched for constraints that do not describe data', () => {
    expect(applyDatasetConstraintToggle(undefined, check('real-time'), idFactory)).toBeUndefined()

    const current: DataAccessSensitivity = { datasets: [{ id: 'dataset-1', title: 'Letters' }] }
    expect(applyDatasetConstraintToggle(current, uncheck('real-time'), idFactory)).toBe(current)
  })

  it('never rewrites a detailed personal-data answer from an unrelated checkbox', () => {
    // The user answered this in the Data Access section; toggling any other
    // constraint must not touch it, in either direction.
    const current: DataAccessSensitivity = {
      datasets: [{ id: 'dataset-1', title: 'Referral letters', containsPersonalData: true }],
    }

    expect(applyDatasetConstraintToggle(current, check('cluster-compute', ['cluster-compute']), idFactory))
      .toBe(current)
    expect(applyDatasetConstraintToggle(current, uncheck('valuable-ip'), idFactory)).toBe(current)
    expect(applyDatasetConstraintToggle(current, check('large-data', ['large-data']), idFactory))
      .toBe(current)
  })

  it('does not resurrect a dataset the user deleted in the detailed view', () => {
    // large-data stays checked, but the dataset it created has been deleted in
    // Data Access. Unrelated constraint edits must not bring it back.
    const current: DataAccessSensitivity = { datasets: [] }

    expect(applyDatasetConstraintToggle(
      current,
      check('real-time', ['large-data', 'real-time']),
      idFactory,
    )).toBe(current)
    expect(applyDatasetConstraintToggle(
      current,
      uncheck('large-data', ['real-time']),
      idFactory,
    )).toBe(current)
  })

  it('keeps an explicit no-personal-data answer given in the detailed view', () => {
    const current: DataAccessSensitivity = {
      datasets: [{ id: 'dataset-1', title: 'Letters', containsPersonalData: false }],
    }

    expect(applyDatasetConstraintToggle(current, uncheck('personal-data'), idFactory)).toBe(current)
    expect(applyDatasetConstraintToggle(current, check('personal-data'), idFactory)?.datasets).toEqual([
      { id: 'dataset-1', title: 'Letters', containsPersonalData: true },
    ])
  })
})
