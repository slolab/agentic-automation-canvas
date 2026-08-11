import { describe, expect, it, vi } from 'vitest'
import { loadPersistedCanvas } from '@/persistence/canvas'
import { validateCurrentCanvas } from '@/schema/validation'
import { AAC_SCHEMA_VERSION } from '@/schema/contract'

describe('loadPersistedCanvas', () => {
  it('loads valid current-version data without diagnostics', () => {
    const stored = {
      project: {
        title: 'Persisted project',
        description: 'A valid persisted canvas.',
      },
      version: '1.2.3',
    }

    const result = loadPersistedCanvas(JSON.stringify(stored))

    expect(result.canvasData).toEqual(stored)
    expect(result.diagnostics).toEqual([])
  })

  it('reports, logs, and recovers invalid stored data without blocking the load', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const result = loadPersistedCanvas(
      JSON.stringify({
        undeclaredRootField: 'drop me',
        project: {
          title: 'Recoverable project',
          description: 'The readable values should still open.',
        },
        governance: {
          stages: [
            {
              id: 'stage-1',
              name: 'Review',
              milestones: ['Legacy milestone'],
            },
          ],
        },
      }),
    )

    expect(result.canvasData).toEqual(
      expect.objectContaining({
        project: {
          title: 'Recoverable project',
          description: 'The readable values should still open.',
        },
        governance: {
          stages: [
            expect.objectContaining({
              milestones: [{ description: 'Legacy milestone' }],
            }),
          ],
        },
      }),
    )
    expect(result.canvasData).not.toHaveProperty('undeclaredRootField')
    expect(validateCurrentCanvas(result.canvasData).valid).toBe(true)
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: 'recovery',
          code: 'recovery.undeclaredFieldDropped',
          path: '/undeclaredRootField',
          schemaVersion: AAC_SCHEMA_VERSION,
        }),
        expect.objectContaining({
          source: 'recovery',
          code: 'recovery.milestoneConverted',
          path: '/governance/stages/0/milestones/0',
          schemaVersion: AAC_SCHEMA_VERSION,
        }),
      ]),
    )
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('[recovery.undeclaredFieldDropped]'),
      expect.objectContaining({ code: 'recovery.undeclaredFieldDropped' }),
    )
    warn.mockRestore()
  })

  it('keeps an incomplete but type-safe draft viewable while reporting schema findings', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    const result = loadPersistedCanvas(
      JSON.stringify({
        project: { title: '', description: '', projectStage: '' },
        version: '0.1.0',
      }),
    )

    expect(result.canvasData?.project).toEqual({
      title: '',
      description: '',
      projectStage: '',
    })
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: 'recovery',
          code: 'recovery.requiredValueDefaulted',
          path: '/project/title',
        }),
        expect.objectContaining({
          source: 'recovery',
          code: 'recovery.requiredValueDefaulted',
          path: '/project/description',
        }),
      ]),
    )
    warn.mockRestore()
  })

  it('turns malformed JSON into a structured, logged persistence diagnostic', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    const result = loadPersistedCanvas('{not json')

    expect(result.canvasData).toBeUndefined()
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        severity: 'error',
        source: 'persistence',
        code: 'persistence.invalidJson',
        path: '/',
      }),
    ])
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('[persistence.invalidJson]'),
      expect.objectContaining({ code: 'persistence.invalidJson' }),
    )
    warn.mockRestore()
  })
})
