/**
 * Generate AGENTS.md content from AAC canvas data.
 *
 * Minimal output: only information that directly guides AI coding agents.
 * Governance, administrative metadata, and project management details are omitted.
 */

import type {
  CanvasData,
  Requirement,
  RequirementFeasibility,
  BenefitValue,
} from '@/types/canvas'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function lines(...parts: (string | undefined | false)[]): string {
  return parts.filter((p): p is string => typeof p === 'string').join('\n')
}

function formatBenefitValue(v: BenefitValue): string {
  switch (v.type) {
    case 'numeric':
      return String(v.value)
    case 'categorical':
      return v.category
    case 'binary':
      return v.bool ? 'yes' : 'no'
  }
}

const PRIORITY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }

function sortRequirements(reqs: Requirement[]): Requirement[] {
  return [...reqs].sort((a, b) => {
    const pa = PRIORITY_ORDER[a.priority ?? 'medium'] ?? 2
    const pb = PRIORITY_ORDER[b.priority ?? 'medium'] ?? 2
    return pa - pb
  })
}

// ---------------------------------------------------------------------------
// Section renderers
// ---------------------------------------------------------------------------

function renderHeader(data: CanvasData): string {
  const version = data.project.version ?? data.version ?? 'draft'
  const parts: string[] = [`# ${data.project.title}`]
  parts.push('', `Target version: ${version}. Implement to match this specification exactly.`)
  if (data.project.description) parts.push('', data.project.description)
  if (data.project.objective && data.project.objective !== data.project.description) {
    parts.push('', `Objective: ${data.project.objective}`)
  }
  return lines(...parts)
}

function renderRequirements(data: CanvasData): string | undefined {
  const reqs = data.userExpectations?.requirements
  if (!reqs?.length) return undefined

  const sorted = sortRequirements(reqs)
  const parts: string[] = ['', '## Requirements']

  for (const req of sorted) {
    parts.push('', `### ${req.title}`, '')
    if (req.description) parts.push(req.description, '')

    if (req.benefits?.length) {
      for (const b of req.benefits) {
        const base = formatBenefitValue(b.baseline)
        const exp = formatBenefitValue(b.expected)
        parts.push(`- ${b.metricLabel}: ${base} → ${exp} ${b.benefitUnit}`)
      }
    }

    if (req.feasibility) renderFeasibility(req.feasibility, parts)
  }

  return lines(...parts)
}

function renderFeasibility(f: RequirementFeasibility, parts: string[]): void {
  const items: string[] = []

  if (f.technologyApproach?.architecture && f.technologyApproach.architecture !== 'none') {
    items.push(`architecture: ${f.technologyApproach.architecture}`)
  }
  if (f.modelName) items.push(`model: ${f.modelName}${f.modelSelection ? ` (${f.modelSelection})` : ''}`)
  else if (f.modelSelection && f.modelSelection !== 'none') items.push(`model: ${f.modelSelection}`)
  if (f.algorithms?.length) items.push(`algorithms: ${f.algorithms.join(', ')}`)
  if (f.tools?.length) items.push(`tools: ${f.tools.join(', ')}`)

  const ta = f.technologyApproach
  if (ta?.ragDetails) {
    const d = [ta.ragDetails.retrievalMethod, ta.ragDetails.embeddingModel, ta.ragDetails.chunkingStrategy].filter(Boolean)
    if (d.length) items.push(`RAG: ${d.join('; ')}`)
  }
  if (ta?.fineTuningDetails) {
    const d = [
      ta.fineTuningDetails.baseModel && `base: ${ta.fineTuningDetails.baseModel}`,
      ta.fineTuningDetails.tuningApproach,
      ta.fineTuningDetails.dataset && `dataset: ${ta.fineTuningDetails.dataset}`,
    ].filter(Boolean)
    if (d.length) items.push(`fine-tuning: ${d.join('; ')}`)
  }
  if (ta?.agenticDetails) {
    const ad = ta.agenticDetails
    const d = [
      ad.framework?.length && `framework: ${ad.framework.join(', ')}`,
      ad.tools?.length && `tools: ${ad.tools.join(', ')}`,
      ad.orchestration?.length && `orchestration: ${ad.orchestration.join(', ')}`,
    ].filter(Boolean)
    if (d.length) items.push(`agentic: ${d.join('; ')}`)
  }

  if (items.length) {
    parts.push(`- Tech: ${items.join(' | ')}`)
  }
}

function renderDataSources(data: CanvasData): string | undefined {
  const datasets = data.dataAccess?.datasets
  if (!datasets?.length) return undefined

  const parts: string[] = ['', '## Data']
  for (const ds of datasets) {
    const details = [ds.format, ds.accessRights].filter(Boolean).join(', ')
    parts.push(`- ${ds.title}${details ? ` (${details})` : ''}`)
  }
  return lines(...parts)
}

function renderConstraints(data: CanvasData): string | undefined {
  const notes: string[] = []
  for (const req of data.userExpectations?.requirements ?? []) {
    for (const b of req.benefits ?? []) {
      if (b.assumptions) notes.push(`${req.title} / ${b.metricLabel}: ${b.assumptions}`)
    }
  }
  if (!notes.length) return undefined

  const parts: string[] = ['', '## Constraints']
  for (const n of notes) parts.push(`- ${n}`)
  return lines(...parts)
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate a structured AGENTS.md markdown document from canvas data.
 * Only sections with data are included; empty dimensions are skipped.
 */
export function generateAgentInstructions(data: CanvasData): string {
  const sections = [
    renderHeader(data),
    renderRequirements(data),
    renderDataSources(data),
    renderConstraints(data),
  ].filter(Boolean)

  return sections.join('\n') + '\n'
}
