import { describe, expect, it } from 'vitest'
import { AAC_SCHEMA_VERSION } from '@/schema/contract'
import { validateCurrentCanvas } from '@/schema/validation'

describe('validateCurrentCanvas', () => {
  it('accepts a minimal current canvas', () => {
    const result = validateCurrentCanvas({
      project: { title: 'Valid project', description: 'Valid description' },
    })

    expect(result.valid).toBe(true)
    expect(result.diagnostics).toEqual([])
  })

  it('returns all structural findings as stable diagnostics', () => {
    const result = validateCurrentCanvas({
      inventedSection: true,
      project: {
        title: '',
        description: 'Description',
        inventedByUi: true,
      },
      governance: {
        stages: [
          {
            id: 'stage-1',
            name: 'Review',
            milestones: ['legacy string milestone'],
          },
        ],
      },
    })

    expect(result.valid).toBe(false)
    expect(result.diagnostics.length).toBeGreaterThanOrEqual(4)
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'schema.additionalProperties',
          path: '/inventedSection',
          schemaVersion: AAC_SCHEMA_VERSION,
        }),
        expect.objectContaining({
          code: 'schema.minLength',
          path: '/project/title',
          schemaVersion: AAC_SCHEMA_VERSION,
        }),
        expect.objectContaining({
          code: 'schema.type',
          path: '/governance/stages/0/milestones/0',
          schemaVersion: AAC_SCHEMA_VERSION,
        }),
      ]),
    )
  })

  it('allows arbitrary evaluation metric keys', () => {
    const result = validateCurrentCanvas({
      project: { title: 'Metrics project', description: 'Description' },
      outcomes: {
        evaluations: [
          {
            id: 'evaluation-1',
            type: 'benchmark',
            metrics: {
              accuracy: 0.92,
              nested: { threshold: 0.8 },
            },
          },
        ],
      },
    })

    expect(result.valid).toBe(true)
  })

  it('does not mutate invalid input while validating it', () => {
    const input = {
      project: { title: 'Project', description: 'Description', unknown: 'kept' },
    }
    const snapshot = structuredClone(input)

    validateCurrentCanvas(input)

    expect(input).toEqual(snapshot)
  })

  it("requires a target only when a benefit's direction is targetIsBetter", () => {
    const withoutTarget = validateCurrentCanvas({
      project: { title: 'Target project', description: 'Description' },
      userExpectations: {
        requirements: [
          {
            id: 'requirement-1',
            title: 'Exact score',
            description: 'Reach an exact score',
            benefits: [
              {
                benefitType: 'quality',
                metricId: 'score',
                metricLabel: 'Score',
                direction: 'targetIsBetter',
                valueMeaning: 'absolute',
                benefitUnit: 'points',
                baseline: { type: 'numeric', value: 10 },
                expected: { type: 'numeric', value: 12 },
              },
            ],
          },
        ],
      },
    })

    expect(withoutTarget.valid).toBe(false)
    expect(withoutTarget.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'schema.required',
          path: '/userExpectations/requirements/0/benefits/0/target',
          schemaVersion: AAC_SCHEMA_VERSION,
        }),
      ]),
    )

    const increaseWithoutTarget = validateCurrentCanvas({
      project: { title: 'Increase project', description: 'Description' },
      userExpectations: {
        requirements: [
          {
            id: 'requirement-1',
            title: 'Higher score',
            description: 'Increase a score',
            benefits: [
              {
                benefitType: 'quality',
                metricId: 'score',
                metricLabel: 'Score',
                direction: 'increaseIsBetter',
                valueMeaning: 'absolute',
                benefitUnit: 'points',
                baseline: { type: 'numeric', value: 10 },
                expected: { type: 'numeric', value: 12 },
              },
            ],
          },
        ],
      },
    })

    expect(increaseWithoutTarget.diagnostics).toEqual([])
    expect(increaseWithoutTarget.valid).toBe(true)
  })
})
