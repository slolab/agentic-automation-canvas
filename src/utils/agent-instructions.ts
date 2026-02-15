/**
 * Generate AGENTS.md content from AAC canvas data.
 *
 * The output is a structured markdown document that AI coding agents
 * (GitHub Copilot, Cursor, etc.) can consume as a project specification
 * to guide implementation.
 */

import type {
  CanvasData,
  Requirement,
  RequirementFeasibility,
  Benefit,
  BenefitValue,
  Person,
  Dataset,
  GovernanceStage,
  Agent,
  Deliverable,
  Evaluation,
} from '@/types/canvas'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function lines(...parts: (string | undefined | false)[]): string {
  return parts.filter((p): p is string => typeof p === 'string').join('\n')
}

function bullet(label: string, value: string | number | boolean | undefined | null): string | undefined {
  if (value === undefined || value === null || value === '') return undefined
  return `- **${label}:** ${value}`
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

function directionLabel(d: Benefit['direction']): string {
  switch (d) {
    case 'increaseIsBetter':
      return 'higher is better'
    case 'decreaseIsBetter':
      return 'lower is better'
    case 'targetIsBetter':
      return 'target value'
    case 'boolIsBetter':
      return 'boolean'
  }
}

function personName(id: string, persons: Person[]): string {
  const p = persons.find((p) => p.id === id)
  return p ? p.name : id
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

function renderPreamble(data: CanvasData): string {
  const version = data.project.version ?? data.version ?? 'draft'
  const date = data.project.versionDate ?? data.versionDate ?? new Date().toISOString().slice(0, 10)
  return lines(
    `# ${data.project.title} — Agent Instructions`,
    '',
    `> Auto-generated from [Agentic Automation Canvas](https://aac.slolab.ai) v${version} (${date}).`,
    '> This file summarises the project specification for use by AI coding agents.',
    '> Treat it as a living brief: re-export from the canvas when the specification changes.',
  )
}

function renderProjectContext(data: CanvasData): string {
  const p = data.project
  const parts: string[] = ['', '## Project Context', '']
  parts.push(p.description)
  if (p.objective) parts.push('', `**Objective:** ${p.objective}`)
  if (p.domain?.length) parts.push('', `**Domains:** ${p.domain.join(', ')}`)
  if (p.keywords?.length) parts.push(`**Keywords:** ${p.keywords.join(', ')}`)
  if (p.projectStage) parts.push(`**Stage:** ${p.projectStage}`)
  if (p.startDate || p.endDate) {
    parts.push(`**Timeline:** ${p.startDate ?? '?'} — ${p.endDate ?? '?'}`)
  }
  if (p.headlineValue) parts.push('', `**Value proposition:** ${p.headlineValue}`)
  return lines(...parts)
}

function renderRequirements(data: CanvasData): string | undefined {
  const reqs = data.userExpectations?.requirements
  if (!reqs?.length) return undefined

  const persons = data.persons ?? []
  const sorted = sortRequirements(reqs)
  const parts: string[] = ['', '## Requirements']

  for (let i = 0; i < sorted.length; i++) {
    const req = sorted[i]
    const tags: string[] = []
    if (req.priority) tags.push(`priority: ${req.priority}`)
    if (req.status) tags.push(`status: ${req.status}`)
    const tagStr = tags.length ? ` (${tags.join(', ')})` : ''

    parts.push('', `### Task: ${req.title}${tagStr}`, '')

    if (req.description) parts.push(req.description, '')
    if (req.userStory) parts.push(bullet('User story', req.userStory)!)
    if (req.unitOfWork) {
      const vol = req.volumePerMonth != null ? ` (${req.volumePerMonth}/month)` : ''
      parts.push(bullet('Unit of work', `${req.unitOfWork}${vol}`)!)
    }
    if (req.dependsOn?.length) {
      const depTitles = req.dependsOn.map((id) => {
        const dep = reqs.find((r) => r.id === id)
        return dep ? dep.title : id
      })
      parts.push(bullet('Depends on', depTitles.join(', '))!)
    }
    if (req.stakeholders?.length) {
      parts.push(bullet('Stakeholders', req.stakeholders.map((id) => personName(id, persons)).join(', '))!)
    }

    // Benefits as acceptance criteria
    if (req.benefits?.length) {
      parts.push('', '#### Acceptance criteria', '')
      for (const b of req.benefits) {
        const base = formatBenefitValue(b.baseline)
        const exp = formatBenefitValue(b.expected)
        const dir = directionLabel(b.direction)
        parts.push(`- ${b.metricLabel}: baseline ${base} → expected ${exp} ${b.benefitUnit} (${dir})`)
      }
    }

    // Per-task feasibility
    if (req.feasibility) {
      parts.push('', '#### Technical approach', '')
      renderFeasibilityInline(req.feasibility, parts)
    }

    // Separator between tasks
    if (i < sorted.length - 1) {
      parts.push('', '---', '')
    } else {
      parts.push('')
    }
  }

  return lines(...parts)
}

function renderFeasibilityInline(f: RequirementFeasibility, parts: string[]): void {
  if (f.technologyApproach?.architecture && f.technologyApproach.architecture !== 'none') {
    parts.push(bullet('Architecture', f.technologyApproach.architecture)!)
  }
  if (f.modelName) parts.push(bullet('Model', `${f.modelName}${f.modelSelection ? ` (${f.modelSelection})` : ''}`)!)
  else if (f.modelSelection && f.modelSelection !== 'none') parts.push(bullet('Model selection', f.modelSelection)!)
  if (f.algorithms?.length) parts.push(bullet('Algorithms', f.algorithms.join(', '))!)
  if (f.tools?.length) parts.push(bullet('Tools/frameworks', f.tools.join(', '))!)

  const ta = f.technologyApproach
  if (ta?.ragDetails) {
    const rd = ta.ragDetails
    const details = [rd.retrievalMethod, rd.embeddingModel, rd.chunkingStrategy].filter(Boolean).join('; ')
    if (details) parts.push(bullet('RAG details', details)!)
  }
  if (ta?.fineTuningDetails) {
    const ft = ta.fineTuningDetails
    const details = [ft.baseModel && `base: ${ft.baseModel}`, ft.tuningApproach, ft.dataset && `dataset: ${ft.dataset}`].filter(Boolean).join('; ')
    if (details) parts.push(bullet('Fine-tuning', details)!)
  }
  if (ta?.agenticDetails) {
    const ad = ta.agenticDetails
    if (ad.framework?.length) parts.push(bullet('Agentic framework', ad.framework.join(', '))!)
    if (ad.tools?.length) parts.push(bullet('Agentic tools', ad.tools.join(', '))!)
    if (ad.orchestration?.length) parts.push(bullet('Orchestration', ad.orchestration.join(', '))!)
  }

  if (f.technicalRisk) parts.push(bullet('Technical risk', f.technicalRisk)!)
  if (f.effortEstimate) parts.push(bullet('Effort estimate', `${f.effortEstimate.value} ${f.effortEstimate.unit}`)!)
  if (f.feasibilityNotes) parts.push(bullet('Notes', f.feasibilityNotes)!)
}

function renderTechnicalApproach(data: CanvasData): string | undefined {
  const df = data.developerFeasibility
  if (!df || Object.keys(df).length === 0) return undefined

  const parts: string[] = ['', '## Technical Approach (Project Level)', '']

  if (df.trlLevel) {
    const cur = df.trlLevel.current != null ? `current TRL ${df.trlLevel.current}` : undefined
    const tgt = df.trlLevel.target != null ? `target TRL ${df.trlLevel.target}` : undefined
    const trl = [cur, tgt].filter(Boolean).join(' → ')
    if (trl) parts.push(bullet('Technology readiness', trl)!)
  }
  if (df.technicalRisk) parts.push(bullet('Technical risk', df.technicalRisk)!)
  if (df.effortEstimate) parts.push(bullet('Effort estimate', `${df.effortEstimate.value} ${df.effortEstimate.unit}`)!)
  if (df.feasibilityNotes) parts.push(bullet('Feasibility notes', df.feasibilityNotes)!)

  return lines(...parts)
}

function renderDataSources(data: CanvasData): string | undefined {
  const datasets = data.dataAccess?.datasets
  if (!datasets?.length) return undefined

  const parts: string[] = ['', '## Data Sources']

  for (const ds of datasets) {
    parts.push('', `### ${ds.title}`, '')
    if (ds.description) parts.push(ds.description, '')
    if (ds.format) parts.push(bullet('Format', ds.format)!)
    if (ds.accessRights) parts.push(bullet('Access', ds.accessRights)!)
    if (ds.license) parts.push(bullet('License', ds.license)!)
    if (ds.containsPersonalData != null) parts.push(bullet('Contains personal data', ds.containsPersonalData ? 'yes' : 'no')!)
    if (ds.duoTerms?.length) parts.push(bullet('Data use conditions', ds.duoTerms.join(', '))!)
    if (ds.pid) parts.push(bullet('Identifier', ds.pid)!)
    parts.push('')
  }

  return lines(...parts)
}

function renderGovernance(data: CanvasData): string | undefined {
  const stages = data.governance?.stages
  if (!stages?.length) return undefined

  const persons = data.persons ?? []
  const parts: string[] = ['', '## Governance and Compliance']

  for (const stage of stages) {
    const dateRange = (stage.startDate || stage.endDate)
      ? ` (${stage.startDate ?? '?'} — ${stage.endDate ?? '?'})`
      : ''
    parts.push('', `### ${stage.name}${dateRange}`, '')

    if (stage.milestones?.length) {
      for (const m of stage.milestones) {
        const kpi = m.kpi ? ` — KPI: ${m.kpi}` : ''
        parts.push(`- ${m.description}${kpi}`)
      }
    }

    if (stage.complianceStandards?.length) {
      parts.push(bullet('Compliance', stage.complianceStandards.join(', '))!)
    }

    if (stage.agents?.length) {
      const agentDescs = stage.agents.map((a) => {
        const name = a.type === 'person' && a.personId ? personName(a.personId, persons) : a.name ?? '?'
        const role = a.role ? ` (${a.role})` : ''
        return `${name}${role} [${a.type}]`
      })
      parts.push(bullet('Responsible', agentDescs.join('; '))!)
    }

    parts.push('')
  }

  return lines(...parts)
}

function renderDeliverables(data: CanvasData): string | undefined {
  const outcomes = data.outcomes
  if (!outcomes) return undefined

  const hasDeliverables = (outcomes.deliverables?.length ?? 0) > 0
  const hasEvaluations = (outcomes.evaluations?.length ?? 0) > 0
  if (!hasDeliverables && !hasEvaluations) return undefined

  const parts: string[] = ['', '## Deliverables', '']

  if (outcomes.deliverables?.length) {
    for (const d of outcomes.deliverables) {
      const desc = d.description ? ` — ${d.description}` : ''
      parts.push(`- **${d.title}** (${d.type})${desc}`)
    }
  }

  if (outcomes.evaluations?.length) {
    parts.push('', '### Evaluations', '')
    for (const e of outcomes.evaluations) {
      const res = e.results ? ` — ${e.results}` : ''
      parts.push(`- ${e.type}${res}`)
    }
  }

  return lines(...parts)
}

function renderConstraints(data: CanvasData): string | undefined {
  const notes: string[] = []

  // Collect feasibility notes
  if (data.developerFeasibility?.feasibilityNotes) {
    notes.push(data.developerFeasibility.feasibilityNotes)
  }

  // Collect assumptions from benefits
  const reqs = data.userExpectations?.requirements ?? []
  for (const req of reqs) {
    for (const b of req.benefits ?? []) {
      if (b.assumptions) {
        notes.push(`${req.title} / ${b.metricLabel}: ${b.assumptions}`)
      }
    }
  }

  if (!notes.length) return undefined

  const parts: string[] = ['', '## Constraints and Assumptions', '']
  for (const n of notes) {
    parts.push(`- ${n}`)
  }
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
    renderPreamble(data),
    renderProjectContext(data),
    renderRequirements(data),
    renderTechnicalApproach(data),
    renderDataSources(data),
    renderGovernance(data),
    renderDeliverables(data),
    renderConstraints(data),
  ].filter(Boolean)

  return sections.join('\n') + '\n'
}
