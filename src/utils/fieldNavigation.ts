/**
 * Maps ValidationError.field paths to tab/item/DOM navigation targets,
 * and provides a DOM helper to scroll+focus+highlight a field.
 */

export interface FocusFieldRequest {
  sectionId: string
  domFieldId: string | null   // null = expand item only, no specific field to focus
  itemType: 'project' | 'requirement' | 'dataset' | 'deliverable' | 'publication' | 'evaluation' | null
  itemIndex: number | null
}

/**
 * Maps a ValidationError.field string to navigation metadata.
 * Returns null if the field cannot be mapped to a known section.
 *
 * Field path examples:
 *   "project.title"                                    → project tab, project-title
 *   "userExpectations.requirements[2].unitOfWork"      → user-expectations tab, req-unit-2
 *   "dataAccess.datasets[0].accessRights"              → data-access tab, dataset-access-0
 *   "outcomes.deliverables[1].type"                    → outcomes tab, deliverable-type-1
 */
export function fieldToNavTarget(field: string): FocusFieldRequest | null {
  // ── Project fields ──────────────────────────────────────────────────────────
  if (field.startsWith('project')) {
    const domMap: Record<string, string> = {
      'project.title':        'project-title',
      'project.description':  'project-description',
      'project.projectStage': 'project-stage',
      'project.version':      'project-version',
    }
    return {
      sectionId:  'project',
      itemType:   'project',
      itemIndex:  null,
      domFieldId: domMap[field] ?? 'project-title',
    }
  }

  // ── userExpectations.requirements (list-level, no index) ────────────────────
  if (field === 'userExpectations.requirements') {
    return { sectionId: 'user-expectations', itemType: null, itemIndex: null, domFieldId: null }
  }

  // ── requirements[n].subField ────────────────────────────────────────────────
  const reqMatch = field.match(/^requirements\[(\d+)\](?:\.(.+))?$/)
  if (reqMatch) {
    const index = parseInt(reqMatch[1], 10)
    const subField = reqMatch[2] ?? ''
    const domMap: Record<string, string> = {
      'title':          `req-title-${index}`,
      'unitOfWork':     `req-unit-${index}`,
      'unitCategory':   `req-unit-category-${index}`,
      'volumePerMonth': `req-volume-${index}`,
    }
    // Benefit-related subFields (benefits, benefits[].*, benefits[n].*, netTimeSaved)
    // all target the "Edit Benefits" button
    const isBenefitField = subField === 'benefits' ||
      subField.startsWith('benefits[') ||
      subField === 'netTimeSaved'
    return {
      sectionId:  'user-expectations',
      itemType:   'requirement',
      itemIndex:  index,
      domFieldId: domMap[subField] ?? (isBenefitField ? `req-benefits-edit-${index}` : null),
    }
  }

  // ── datasets[n].subField ────────────────────────────────────────────────────
  const datasetMatch = field.match(/^datasets\[(\d+)\](?:\.(.+))?$/)
  if (datasetMatch) {
    const index = parseInt(datasetMatch[1], 10)
    const subField = datasetMatch[2] ?? ''
    const domMap: Record<string, string> = {
      'title':        `dataset-title-${index}`,
      'accessRights': `dataset-access-${index}`,
    }
    return {
      sectionId:  'data-access',
      itemType:   'dataset',
      itemIndex:  index,
      domFieldId: domMap[subField] ?? null,
    }
  }

  // ── outcomes.deliverables[n].subField ───────────────────────────────────────
  const delivMatch = field.match(/^outcomes\.deliverables\[(\d+)\](?:\.(.+))?$/)
  if (delivMatch) {
    const index = parseInt(delivMatch[1], 10)
    const subField = delivMatch[2] ?? ''
    const domMap: Record<string, string> = {
      'title': `deliverable-title-${index}`,
      'type':  `deliverable-type-${index}`,
    }
    return {
      sectionId:  'outcomes',
      itemType:   'deliverable',
      itemIndex:  index,
      domFieldId: domMap[subField] ?? null,
    }
  }

  // ── outcomes.publications[n].subField ───────────────────────────────────────
  const pubMatch = field.match(/^outcomes\.publications\[(\d+)\](?:\.(.+))?$/)
  if (pubMatch) {
    const index = parseInt(pubMatch[1], 10)
    const subField = pubMatch[2] ?? ''
    const domMap: Record<string, string> = {
      'title': `pub-title-${index}`,
    }
    return {
      sectionId:  'outcomes',
      itemType:   'publication',
      itemIndex:  index,
      domFieldId: domMap[subField] ?? null,
    }
  }

  // ── outcomes.evaluations[n].subField ────────────────────────────────────────
  const evalMatch = field.match(/^outcomes\.evaluations\[(\d+)\](?:\.(.+))?$/)
  if (evalMatch) {
    const index = parseInt(evalMatch[1], 10)
    const subField = evalMatch[2] ?? ''
    const domMap: Record<string, string> = {
      'type': `eval-type-${index}`,
    }
    return {
      sectionId:  'outcomes',
      itemType:   'evaluation',
      itemIndex:  index,
      domFieldId: domMap[subField] ?? null,
    }
  }

  return null
}

/**
 * Section label shown in the error link hover state.
 * Matches the tab labels in CanvasForm.vue.
 */
export function sectionLabel(sectionId: string): string {
  const labels: Record<string, string> = {
    'project':              'Project',
    'user-expectations':    'Tasks & Benefits',
    'data-access':          'Data Access',
    'outcomes':             'Outcomes',
    'governance':           'Governance',
    'developer-feasibility':'Feasibility & Risks',
    'persons':              'Persons',
  }
  return labels[sectionId] ?? sectionId
}

/**
 * Scrolls to, focuses, and applies the radar-ping highlight to a DOM field.
 * Call this inside an async function after isExpanded = true + nextTick.
 */
export function applyFieldFocus(domFieldId: string): void {
  const el = document.getElementById(domFieldId)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  el.focus({ preventScroll: true })
  // Apply highlight to the FormField wrapper (.mb-6) or the element itself
  const wrapper = el.closest('.mb-6') ?? el.parentElement
  if (!wrapper) return
  wrapper.classList.add('field-focus-pulse')
  wrapper.addEventListener('animationend', () => {
    wrapper.classList.remove('field-focus-pulse')
  }, { once: true })
}
