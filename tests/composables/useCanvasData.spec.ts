import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Diagnostic } from '@/diagnostics'

function memoryStorage(): Storage {
  const values = new Map<string, string>()
  return {
    get length() {
      return values.size
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => Array.from(values.keys())[index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, value),
  }
}

describe('useCanvasData imports', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubGlobal('localStorage', memoryStorage())
  })

  it('uses current JSON Schema diagnostics as the only structural validation errors', async () => {
    const { useCanvasData } = await import('@/composables/useCanvasData')
    const state = useCanvasData()

    state.canvasData.value = {
      project: {
        title: '',
        description: 'A structurally invalid project.',
        invented: true,
      },
      userExpectations: {
        requirements: [{ id: 'task', title: '', benefits: [] }],
      },
      dataAccess: {
        datasets: [{ id: 'dataset', title: '' }],
      },
    } as unknown as typeof state.canvasData.value

    const result = state.validateAll()
    expect(result.errors.filter((error) => error.field === 'project.title')).toHaveLength(1)
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'project.title', severity: 'error' }),
        expect.objectContaining({ field: 'project.invented', severity: 'error' }),
        expect.objectContaining({ field: 'requirements[0].title', severity: 'error' }),
      ]),
    )
    expect(result.errors).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'datasets[0].title' }),
      ]),
    )
  })

  it('keeps semantic recommendations as non-blocking warnings', async () => {
    const { useCanvasData } = await import('@/composables/useCanvasData')
    const state = useCanvasData()

    state.canvasData.value = {
      project: {
        title: 'Valid project',
        description: 'Description without terminal punctuation',
      },
    }

    const result = state.validateAll()
    expect(result.errors).toEqual([])
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'project.description' }),
        expect.objectContaining({ field: 'userExpectations.requirements' }),
      ]),
    )
  })

  it('recovers direct JSON imports and exposes one structured diagnostic collection', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const { useCanvasData } = await import('@/composables/useCanvasData')
    const state = useCanvasData()

    state.importData(
      JSON.stringify({
        project: {
          title: 'Imported JSON',
          description: 'Known fields remain readable.',
        },
        incompatibleField: 'drop me',
      }),
    )

    expect(state.canvasData.value).not.toHaveProperty('incompatibleField')
    expect(state.lastDiagnostics.value).toEqual([
      expect.objectContaining({
        source: 'recovery',
        code: 'recovery.undeclaredFieldDropped',
        path: '/incompatibleField',
      }),
    ])
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('[recovery.undeclaredFieldDropped]'),
      expect.objectContaining({ path: '/incompatibleField' }),
    )
    warn.mockRestore()
  })

  it('replaces prior notices with the structured diagnostics supplied by RO-Crate import', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const { useCanvasData } = await import('@/composables/useCanvasData')
    const state = useCanvasData()
    const diagnostics: Diagnostic[] = [
      {
        severity: 'warning',
        source: 'ro-crate',
        code: 'rocrate.schemaVersionNonCurrent',
        path: '/',
        message: 'The crate was recovered best-effort.',
      },
    ]

    state.importData(
      JSON.stringify({
        project: { title: 'First', description: 'The first imported project.' },
        incompatibleField: true,
      }),
    )
    state.importFromROCrate(
      { project: { title: 'Second', description: 'The second imported project.' } },
      undefined,
      diagnostics,
    )

    expect(state.canvasData.value.project.title).toBe('Second')
    expect(state.lastDiagnostics.value).toEqual(diagnostics)

    state.clearDiagnostics()
    expect(state.lastDiagnostics.value).toEqual([])
    vi.restoreAllMocks()
  })

  it('rejects malformed direct JSON without replacing the current canvas', async () => {
    const { useCanvasData } = await import('@/composables/useCanvasData')
    const state = useCanvasData()
    const before = JSON.parse(JSON.stringify(state.canvasData.value)) as unknown

    expect(() => state.importData('{not json')).toThrow('Invalid JSON data')
    expect(state.canvasData.value).toEqual(before)
  })
})
