import { describe, expect, it } from 'vitest'
import { recoverCanvasToCurrent } from '@/schema/recovery'
import { validateCurrentCanvas } from '@/schema/validation'

describe('recoverCanvasToCurrent', () => {
  it('recovers readable values from an arbitrary non-current shape without a version adapter', () => {
    const input = {
      unknownRoot: 'drop me',
      project: {
        title: 'Older project',
        description: 'Still viewable after recovery.',
        unknownProjectField: true,
      },
      governance: {
        stages: [
          {
            id: 'stage-1',
            name: 'Older stage',
            milestones: ['String milestone'],
          },
        ],
      },
    }
    const snapshot = structuredClone(input)

    const result = recoverCanvasToCurrent(input)

    expect(input).toEqual(snapshot)
    expect(result.data).toMatchObject({
      project: {
        title: 'Older project',
        description: 'Still viewable after recovery.',
      },
      governance: {
        stages: [
          {
            id: 'stage-1',
            name: 'Older stage',
            milestones: [{ description: 'String milestone' }],
          },
        ],
      },
    })
    expect(result.data).not.toHaveProperty('unknownRoot')
    expect(result.data.project).not.toHaveProperty('unknownProjectField')
    expect(validateCurrentCanvas(result.data).valid).toBe(true)
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'recovery.milestoneConverted',
          path: '/governance/stages/0/milestones/0',
        }),
        expect.objectContaining({
          code: 'recovery.undeclaredFieldDropped',
          path: '/unknownRoot',
        }),
      ]),
    )
    expect(result.diagnostics.some((diagnostic) => diagnostic.code.includes('legacySchema'))).toBe(false)
  })

  it('defaults an unreadable required project while preserving recoverable siblings', () => {
    const result = recoverCanvasToCurrent({
      project: { title: 42 },
      dataAccess: {
        datasets: [{ id: 'dataset-1', title: 'Recoverable dataset' }],
      },
    })

    expect(result.data.project.title).toBe('Untitled imported project')
    expect(result.data.project.description).toBe('No project description could be recovered.')
    expect(result.data.dataAccess?.datasets?.[0]?.title).toBe('Recoverable dataset')
    expect(validateCurrentCanvas(result.data).valid).toBe(true)
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'recovery.requiredValueDefaulted' }),
      ]),
    )
  })

  it('drops undeclared fields without mutating valid oneOf benefit values', () => {
    const result = recoverCanvasToCurrent({
      project: { title: 'Benefit project', description: 'Preserves union branches.' },
      userExpectations: {
        requirements: [
          {
            id: 'requirement-1',
            title: 'Timed task',
            benefits: [
              {
                benefitType: 'time',
                metricId: 'processingTime',
                metricLabel: 'Processing time',
                direction: 'decreaseIsBetter',
                valueMeaning: 'absolute',
                benefitUnit: 'minutes',
                baseline: { type: 'numeric', value: 30 },
                expected: { type: 'numeric', value: 10 },
                undeclared: true,
              },
            ],
          },
        ],
      },
    })

    expect(result.data.userExpectations?.requirements?.[0].benefits[0]).toMatchObject({
      baseline: { type: 'numeric', value: 30 },
      expected: { type: 'numeric', value: 10 },
    })
    expect(result.data.userExpectations?.requirements?.[0].benefits[0]).not.toHaveProperty(
      'undeclared',
    )
  })

  it('uses JSON Pointer escaping when reporting and dropping undeclared fields', () => {
    const result = recoverCanvasToCurrent({
      project: {
        title: 'Escaped path',
        description: 'Handles unusual extension keys.',
        'extension/with~tokens': true,
      },
    })

    expect(result.data.project).not.toHaveProperty('extension/with~tokens')
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'recovery.undeclaredFieldDropped',
          path: '/project/extension~1with~0tokens',
        }),
      ]),
    )
  })

  it('drops one malformed array item without deleting a valid sibling', () => {
    const result = recoverCanvasToCurrent({
      project: { title: 'Array recovery', description: 'Keeps valid siblings.' },
      dataAccess: {
        datasets: [
          { description: 'Missing both required fields.' },
          { id: 'dataset-valid', title: 'Valid dataset', description: 'Must survive.' },
        ],
      },
    })

    expect(result.data.dataAccess?.datasets).toEqual([
      {
        id: 'dataset-valid',
        title: 'Valid dataset',
        description: 'Must survive.',
      },
    ])
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'recovery.invalidFieldDropped',
          path: '/dataAccess/datasets/0',
        }),
      ]),
    )
    expect(validateCurrentCanvas(result.data).valid).toBe(true)
  })

  it('drops only the invalid nested object when one of its required values is missing', () => {
    const result = recoverCanvasToCurrent({
      project: { title: 'Nested recovery', description: 'Keeps useful parent records.' },
      userExpectations: {
        requirements: [
          {
            id: 'requirement-partial-cost',
            title: 'Useful requirement',
            description: 'Everything except deployment cost is readable.',
            benefits: [],
            feasibility: {
              deploymentCost: { costPerMonth: 50 },
            },
          },
          {
            id: 'requirement-valid',
            title: 'Valid sibling',
            benefits: [],
          },
        ],
      },
    })

    expect(result.data.userExpectations?.requirements).toEqual([
      {
        id: 'requirement-partial-cost',
        title: 'Useful requirement',
        description: 'Everything except deployment cost is readable.',
        benefits: [],
        feasibility: {},
      },
      {
        id: 'requirement-valid',
        title: 'Valid sibling',
        benefits: [],
      },
    ])
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'recovery.invalidFieldDropped',
          path:
            '/userExpectations/requirements/0/feasibility/deploymentCost',
        }),
      ]),
    )
    expect(validateCurrentCanvas(result.data).valid).toBe(true)
  })

  it('uses the matching oneOf branch when pruning an extension field', () => {
    const result = recoverCanvasToCurrent({
      project: { title: 'Union recovery', description: 'Preserves the selected value branch.' },
      userExpectations: {
        requirements: [
          {
            id: 'requirement-1',
            title: 'Timed task',
            benefits: [
              {
                benefitType: 'time',
                metricId: 'processingTime',
                metricLabel: 'Processing time',
                direction: 'decreaseIsBetter',
                valueMeaning: 'absolute',
                benefitUnit: 'minutes',
                baseline: {
                  type: 'numeric',
                  value: 30,
                  legacyNote: 'Not part of the current numeric branch.',
                },
                expected: { type: 'numeric', value: 10 },
              },
            ],
          },
        ],
      },
    })

    expect(result.data.userExpectations?.requirements?.[0].benefits[0]).toMatchObject({
      baseline: { type: 'numeric', value: 30 },
      expected: { type: 'numeric', value: 10 },
    })
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'recovery.undeclaredFieldDropped',
          path: '/userExpectations/requirements/0/benefits/0/baseline/legacyNote',
        }),
      ]),
    )
    expect(result.diagnostics).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'recovery.undeclaredFieldDropped',
          path: '/userExpectations/requirements/0/benefits/0/baseline/value',
        }),
      ]),
    )
    expect(validateCurrentCanvas(result.data).valid).toBe(true)
  })

  it('keeps items whose required text the user has not filled in yet', () => {
    const result = recoverCanvasToCurrent({
      project: { title: '', description: '', projectStage: '' },
      persons: [{ id: 'person-0', name: '', functionRoles: [] }],
      userExpectations: {
        requirements: [{ id: 'req-1', title: '', benefits: [], unitOfWork: '' }],
      },
    })

    expect(result.data.project).toEqual({ title: '', description: '', projectStage: '' })
    expect(result.data.persons).toEqual([{ id: 'person-0', name: '', functionRoles: [] }])
    expect(result.data.userExpectations?.requirements).toEqual([
      { id: 'req-1', title: '', benefits: [], unitOfWork: '' },
    ])
    expect(result.diagnostics).toEqual([])
  })

  it('keeps a nested risk whose title is still empty', () => {
    const result = recoverCanvasToCurrent({
      project: { title: 'Risk draft', description: 'A risk is being entered.' },
      userExpectations: {
        requirements: [
          {
            id: 'req-1',
            title: 'Task',
            benefits: [],
            feasibility: {
              risks: [
                {
                  id: 'risk-1',
                  riskCategory: 'technical',
                  title: '',
                  likelihood: 'low',
                  impact: 'low',
                  status: 'identified',
                },
              ],
            },
          },
        ],
      },
    })

    expect(result.data.userExpectations?.requirements?.[0].feasibility?.risks).toEqual([
      {
        id: 'risk-1',
        riskCategory: 'technical',
        title: '',
        likelihood: 'low',
        impact: 'low',
        status: 'identified',
      },
    ])
    expect(result.diagnostics).toEqual([])
  })

  it('still defaults required text that is missing or not a string', () => {
    const result = recoverCanvasToCurrent({ project: { title: 42 } })

    expect(result.data.project.title).toBe('Untitled imported project')
    expect(result.data.project.description).toBe('No project description could be recovered.')
  })

  it('keeps empty required text while dropping genuinely invalid siblings', () => {
    const result = recoverCanvasToCurrent({
      project: { title: '', description: '', undeclaredExtension: true },
      persons: [{ id: 'person-0', name: '' }, { name: 'Missing an id' }],
    })

    expect(result.data.project).toEqual({ title: '', description: '' })
    expect(result.data.persons).toEqual([{ id: 'person-0', name: '' }])
    expect(result.diagnostics.map((diagnostic) => diagnostic.path)).toEqual([
      '/project/undeclaredExtension',
      '/persons/1',
    ])
  })

  it('treats a slash pointer as an empty root property rather than the document root', () => {
    const result = recoverCanvasToCurrent({
      project: { title: 'Pointer recovery', description: 'Does not throw.' },
      '': 'empty property name',
    })

    expect(Object.prototype.hasOwnProperty.call(result.data, '')).toBe(false)
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'recovery.undeclaredFieldDropped',
          path: '/',
        }),
      ]),
    )
    expect(validateCurrentCanvas(result.data).valid).toBe(true)
  })
})
