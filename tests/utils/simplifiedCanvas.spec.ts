import { describe, expect, it } from 'vitest'
import { reactive } from 'vue'
import type { Benefit, GovernanceStaging, UserExpectations } from '@/types/canvas'
import {
  patchFirstStageMilestone,
  patchFirstStage,
  patchPrimaryRequirement,
  firstStageTeamNames,
  replacePrimaryUnclassifiedBenefits,
  retainedClassifiedBenefitIndexes,
  setFirstStageTeam,
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

  it('reuses Person entities and removes only first-stage links when team chips change', () => {
    const currentGovernance: GovernanceStaging = {
      stages: [{
        id: 'planning',
        name: 'Planning',
        agents: [
          { type: 'organization', name: 'Research unit' },
          { type: 'person', personId: 'person-1', role: 'Lead' },
        ],
      }],
    }

    const withTeam = setFirstStageTeam(
      [{ id: 'person-1', name: 'Ada', affiliation: 'Lab' }],
      currentGovernance,
      ['Ada', 'Grace'],
      idFactory,
    )

    expect(withTeam.persons).toEqual([
      { id: 'person-1', name: 'Ada', affiliation: 'Lab' },
      { id: 'person-generated', name: 'Grace' },
    ])
    expect(firstStageTeamNames(withTeam.persons, withTeam.governance)).toEqual(['Ada', 'Grace'])
    expect(withTeam.governance?.stages?.[0].agents?.[0]).toEqual({
      type: 'organization',
      name: 'Research unit',
    })

    const removed = setFirstStageTeam(withTeam.persons, withTeam.governance, ['Grace'])
    expect(removed.persons).toHaveLength(2)
    expect(firstStageTeamNames(removed.persons, removed.governance)).toEqual(['Grace'])
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
