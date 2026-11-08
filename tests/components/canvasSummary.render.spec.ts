/*
The Canvas Summary is the paper's six-dimension one-pager and the first tab of
the Advanced view. Rendering it server-side keeps the restored component honest:
its six blocks must appear, and a canvas answered only in the simplified view
must show its answers rather than "Not specified".
*/

import { describe, expect, it, beforeEach, vi } from 'vitest'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import CanvasSummary from '@/components/sections/CanvasSummary.vue'
import { simplifiedOnlyCanvas } from '@/data/simplified-only-canvas'
import { useCanvasData } from '@/composables/useCanvasData'

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

const { canvasData } = useCanvasData()

async function renderSummary(): Promise<string> {
  return renderToString(createSSRApp(CanvasSummary))
}

describe('canvas summary rendering', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', memoryStorage())
    canvasData.value = structuredClone(simplifiedOnlyCanvas)
  })

  it('renders the six canvas dimensions', async () => {
    const html = await renderSummary()

    for (const block of [
      'Project Definition',
      'User Expectations',
      'Developer Feasibility',
      'Governance',
      'Data Access',
      'Outcomes',
    ]) {
      expect(html).toContain(block)
    }
  })

  it('shows the answers a simplified canvas provides', async () => {
    const html = await renderSummary()

    expect(html).toContain('Referral triage support')
    expect(html).toContain('Problem occurs: About once a week')
    expect(html).toContain('2 expected benefits')
    expect(html).toContain('Personal data')
    expect(html).toContain('Intelligent Search')
    expect(html).toContain('First milestone')
    expect(html).toContain('Build: Possible, but not committed')
    expect(html).toContain('personal or GDPR-sensitive data')
  })

  it('never presents the generated requirement id as a task title', async () => {
    const html = await renderSummary()
    const requirementId = simplifiedOnlyCanvas.userExpectations!.requirements![0].id

    expect(html).not.toContain(requirementId)
    // The task still has to be identifiable: the simplified canvas answers who
    // experiences the problem, and that is what the block shows instead.
    expect(html).toContain('For: Clinical staff triaging incoming referrals')
  })

  it('marks untouched dimensions as unspecified', async () => {
    const html = await renderSummary()

    // Outcomes is the one block the simplified canvas never reaches
    expect(html).toContain('Not specified')
  })

  it('renders an empty canvas without values', async () => {
    canvasData.value = {
      project: { title: '', description: '', projectStage: '' },
      version: '0.1.0',
      versionDate: '2026-08-12',
    }

    const html = await renderSummary()

    expect(html).toContain('Not specified')
    expect(html).not.toContain('Problem occurs')
  })
})
