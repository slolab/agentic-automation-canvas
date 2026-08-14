import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearPersistedCanvas,
  loadPersistedCanvas,
  readPersistedCanvas,
  savePersistedCanvas,
} from '@/persistence/canvas'
import { validateCurrentCanvas } from '@/schema/validation'
import { AAC_SCHEMA_VERSION } from '@/schema/contract'
import type { CanvasData } from '@/types/canvas'

/** Minimal Web Storage stand-in; the test environment is `node`. */
function createStorageStub(): Storage {
  const entries = new Map<string, string>()
  return {
    get length() {
      return entries.size
    },
    clear: () => entries.clear(),
    getItem: (key: string) => entries.get(key) ?? null,
    key: (index: number) => Array.from(entries.keys())[index] ?? null,
    removeItem: (key: string) => entries.delete(key) as unknown as void,
    setItem: (key: string, value: string) => {
      entries.set(key, value)
    },
  }
}

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

  it('reopens an untouched draft without inventing findings', () => {
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
    expect(result.diagnostics).toEqual([])
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })

  it('reopens a draft whose new task, person, and risk are still blank', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const draft = {
      project: { title: 'Draft in progress', description: 'Items were just added.' },
      persons: [{ id: 'person-0', name: '', functionRoles: [] }],
      userExpectations: {
        requirements: [
          {
            id: 'req-1',
            title: '',
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
    }

    const result = loadPersistedCanvas(JSON.stringify(draft))

    expect(result.canvasData).toEqual(draft)
    expect(result.diagnostics).toEqual([])
    expect(warn).not.toHaveBeenCalled()
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

describe('canvas storage boundary', () => {
  const canvas: CanvasData = {
    project: { title: 'Stored', description: 'Round-trips through storage.' },
  }

  beforeEach(() => {
    vi.stubGlobal('localStorage', createStorageStub())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('reports nothing stored before a first save', () => {
    expect(readPersistedCanvas()).toBeUndefined()
  })

  it('leaves an experimental v2 browser draft untouched and surfaces a notice', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const legacyDraft = JSON.stringify({
      format: 'aac-v2',
      projectTitle: 'Legacy draft',
      answers: { recent_case: 'Do not discard this answer.' },
    })
    localStorage.setItem('aac-v2-canvas-draft', legacyDraft)

    expect(readPersistedCanvas()).toEqual({
      diagnostics: [expect.objectContaining({
        source: 'persistence',
        code: 'persistence.legacyV2DraftUnsupported',
        path: '/aac-v2-canvas-draft',
      })],
    })
    expect(localStorage.getItem('aac-v2-canvas-draft')).toBe(legacyDraft)
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('[persistence.legacyV2DraftUnsupported]'),
      expect.objectContaining({ code: 'persistence.legacyV2DraftUnsupported' }),
    )
    warn.mockRestore()
  })

  it('round-trips a canvas through save and read', () => {
    savePersistedCanvas(canvas)

    expect(readPersistedCanvas()).toEqual({ canvasData: canvas, diagnostics: [] })
  })

  it('clears the stored canvas', () => {
    savePersistedCanvas(canvas)
    clearPersistedCanvas()

    expect(readPersistedCanvas()).toBeUndefined()
  })

  it('recovers stored data that no longer matches the current schema', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    localStorage.setItem(
      'agentic-automation-canvas-data',
      JSON.stringify({ ...canvas, undeclaredRootField: true }),
    )

    const result = readPersistedCanvas()

    expect(result?.canvasData).toEqual(canvas)
    expect(result?.diagnostics).toEqual([
      expect.objectContaining({ code: 'recovery.undeclaredFieldDropped' }),
    ])
    warn.mockRestore()
  })

  it('degrades to no saved canvas when storage itself is unavailable', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    vi.stubGlobal('localStorage', {
      ...createStorageStub(),
      getItem: () => {
        throw new Error('storage disabled')
      },
    })

    expect(readPersistedCanvas()).toBeUndefined()
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })

  it('warns instead of throwing when storage rejects a write', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    vi.stubGlobal('localStorage', {
      ...createStorageStub(),
      setItem: () => {
        throw new Error('quota exceeded')
      },
    })

    expect(() => savePersistedCanvas(canvas)).not.toThrow()
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })
})
