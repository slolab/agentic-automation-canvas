import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
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

  it('autosaves edits and drops the cleared canvas from storage', async () => {
    const { useCanvasData } = await import('@/composables/useCanvasData')
    const state = useCanvasData()

    state.updateProject({ title: 'Autosaved project' })
    state.benefitDisplay.value = { displayGroups: [], displayGroupCount: 3 }
    await nextTick()

    expect(localStorage.getItem('agentic-automation-canvas-data')).toContain('Autosaved project')
    expect(localStorage.getItem('agentic-automation-canvas-benefit-display')).toContain('3')

    state.clearData()
    await nextTick()

    // clearData removes both keys; the autosave watcher then persists the reset
    // state, so what remains must be an empty canvas rather than the old one.
    expect(state.canvasData.value.project.title).toBe('')
    expect(localStorage.getItem('agentic-automation-canvas-data')).not.toContain(
      'Autosaved project',
    )
    expect(localStorage.getItem('agentic-automation-canvas-benefit-display')).not.toContain('3')
  })

  it('reopens an autosaved draft whose new items are still blank', async () => {
    vi.stubGlobal('localStorage', memoryStorage())
    localStorage.setItem(
      'agentic-automation-canvas-data',
      JSON.stringify({
        project: { title: '', description: '' },
        persons: [{ id: 'person-0', name: '' }],
        userExpectations: { requirements: [{ id: 'req-1', title: '', benefits: [] }] },
      }),
    )

    const { useCanvasData } = await import('@/composables/useCanvasData')
    const state = useCanvasData()

    expect(state.canvasData.value.persons).toHaveLength(1)
    expect(state.canvasData.value.userExpectations?.requirements).toHaveLength(1)
    expect(state.lastDiagnostics.value).toEqual([])
  })

  it('keeps display-group references attached to classified benefits after lightweight edits', async () => {
    const { useCanvasData } = await import('@/composables/useCanvasData')
    const state = useCanvasData()
    const firstClassified = {
      benefitType: 'quality' as const,
      metricId: 'accuracy',
      metricLabel: 'Accuracy',
      direction: 'increaseIsBetter' as const,
      valueMeaning: 'absolute' as const,
      benefitUnit: '%',
      baseline: { type: 'numeric' as const, value: 70 },
      expected: { type: 'numeric' as const, value: 90 },
    }
    const secondClassified = {
      ...firstClassified,
      metricId: 'consistency',
      metricLabel: 'Consistency',
    }
    state.canvasData.value = {
      project: { title: 'Benefit refs', description: 'Keeps references stable.' },
      userExpectations: {
        requirements: [{
          id: 'req-1',
          title: 'req-1',
          benefits: [
            { benefitType: 'unclassified', description: 'Draft benefit' },
            firstClassified,
            { benefitType: 'unclassified', metricLabel: 'Cases per month' },
            secondClassified,
          ],
        }],
      },
    }
    state.benefitDisplay.value = {
      displayGroups: [
        {
          id: 1,
          benefitType: 'quality',
          metricId: 'accuracy',
          benefitRefs: [{ requirementId: 'req-1', benefitIndex: 1 }],
        },
        {
          id: 2,
          benefitType: 'quality',
          metricId: 'consistency',
          benefitRefs: [{ requirementId: 'req-1', benefitIndex: 3 }],
        },
      ],
    }

    state.replacePrimaryUnclassifiedBenefits('description', [])

    expect(state.canvasData.value.userExpectations?.requirements?.[0].benefits).toEqual([
      firstClassified,
      { benefitType: 'unclassified', metricLabel: 'Cases per month' },
      secondClassified,
    ])
    expect(state.benefitDisplay.value.displayGroups.map((group) => group.benefitRefs[0])).toEqual([
      { requirementId: 'req-1', benefitIndex: 0 },
      { requirementId: 'req-1', benefitIndex: 2 },
    ])
  })
})
