/**
 * Maps ValidationError.field paths to tab/item/DOM navigation targets,
 * and provides a DOM helper to scroll+focus+highlight a field.
 */

import type {
  CanvasData,
  Dataset,
  Deliverable,
  DeveloperFeasibility,
  Evaluation,
  GovernanceStage,
  Person,
  Publication,
  Requirement,
} from '@/types/canvas'

type FieldTargetFactory = (index: number) => string

// Presentation-only exception: DOM ids and tab placement do not exist in JSON
// Schema, so this mapping must be handwritten. Every AAC field key is still
// checked against the generated domain types to make schema drift fail typecheck.
const projectDomMap: Partial<Record<keyof CanvasData['project'], string>> = {
  title: 'project-title',
  description: 'project-description',
  projectStage: 'project-stage',
  version: 'project-version',
}

const requirementDomMap: Partial<Record<keyof Requirement, FieldTargetFactory>> = {
  title: (index) => `req-title-${index}`,
  unitOfWork: (index) => `req-unit-${index}`,
  unitCategory: (index) => `req-unit-category-${index}`,
  volumePerMonth: (index) => `req-volume-${index}`,
}

const datasetDomMap: Partial<Record<keyof Dataset, FieldTargetFactory>> = {
  title: (index) => `dataset-title-${index}`,
  accessRights: (index) => `dataset-access-${index}`,
}

const deliverableDomMap: Partial<Record<keyof Deliverable, FieldTargetFactory>> = {
  title: (index) => `deliverable-title-${index}`,
  type: (index) => `deliverable-type-${index}`,
}

const publicationDomMap: Partial<Record<keyof Publication, FieldTargetFactory>> = {
  title: (index) => `pub-title-${index}`,
}

const evaluationDomMap: Partial<Record<keyof Evaluation, FieldTargetFactory>> = {
  type: (index) => `eval-type-${index}`,
}

const personDomMap: Partial<Record<keyof Person, FieldTargetFactory>> = {
  id: (index) => `person-id-${index}`,
  name: (index) => `person-name-${index}`,
  affiliation: (index) => `person-affiliation-${index}`,
  orcid: (index) => `person-orcid-${index}`,
  functionRoles: (index) => `person-function-roles-${index}`,
  localTitle: (index) => `person-local-title-${index}`,
}

const stageDomMap: Partial<Record<keyof GovernanceStage, FieldTargetFactory>> = {
  name: (index) => `stage-name-${index}`,
  startDate: (index) => `stage-start-${index}`,
  endDate: (index) => `stage-end-${index}`,
  policyCardUri: (index) => `stage-policy-card-uri-${index}`,
}

// Project-level feasibility is a single form, so its targets are not indexed.
const developerFeasibilityDomMap: Partial<Record<keyof DeveloperFeasibility, string>> = {
  technicalRisk: 'technical-risk',
  effortEstimate: 'effort-estimate-value',
  feasibilityNotes: 'feasibility-notes',
}

const trlLevelDomMap: Partial<
  Record<keyof NonNullable<DeveloperFeasibility['trlLevel']>, string>
> = {
  current: 'trl-current',
  target: 'trl-target',
}

export interface FocusFieldRequest {
  sectionId: string
  domFieldId: string | null   // null = expand item only, no specific field to focus
  itemType:
    | 'project'
    | 'person'
    | 'requirement'
    | 'feasibility'
    | 'stage'
    | 'dataset'
    | 'deliverable'
    | 'publication'
    | 'evaluation'
    | null
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
    const projectField = field.slice('project.'.length) as keyof CanvasData['project']
    return {
      sectionId:  'project',
      itemType:   'project',
      itemIndex:  null,
      domFieldId: projectDomMap[projectField] ?? 'project-title',
    }
  }

  // ── userExpectations.requirements (list-level, no index) ────────────────────
  if (field === 'userExpectations.requirements') {
    return { sectionId: 'user-expectations', itemType: null, itemIndex: null, domFieldId: null }
  }

  // ── persons[n].subField ─────────────────────────────────────────────────────
  const personMatch = field.match(/^persons\[(\d+)\](?:\.(.+))?$/)
  if (personMatch) {
    const index = parseInt(personMatch[1], 10)
    const subField = personMatch[2] ?? ''
    return {
      sectionId:  'persons',
      itemType:   'person',
      itemIndex:  index,
      domFieldId: personDomMap[subField as keyof Person]?.(index) ?? null,
    }
  }

  // ── governance.stages[n].subField ───────────────────────────────────────────
  if (field === 'governance' || field === 'governance.stages') {
    return { sectionId: 'governance', itemType: null, itemIndex: null, domFieldId: null }
  }
  const stageMatch = field.match(/^governance\.stages\[(\d+)\](?:\.(.+))?$/)
  if (stageMatch) {
    const index = parseInt(stageMatch[1], 10)
    const subField = stageMatch[2] ?? ''
    return {
      sectionId:  'governance',
      itemType:   'stage',
      itemIndex:  index,
      domFieldId: stageDomMap[subField as keyof GovernanceStage]?.(index) ?? null,
    }
  }

  // ── developerFeasibility.subField (project-level, single form) ──────────────
  if (field === 'developerFeasibility' || field.startsWith('developerFeasibility.')) {
    const subField = field.slice('developerFeasibility.'.length)
    const trlField = subField.startsWith('trlLevel.')
      ? trlLevelDomMap[
        subField.slice('trlLevel.'.length) as keyof NonNullable<DeveloperFeasibility['trlLevel']>
      ]
      : undefined
    return {
      sectionId:  'developer-feasibility',
      itemType:   'feasibility',
      itemIndex:  null,
      domFieldId: trlField
        ?? developerFeasibilityDomMap[subField as keyof DeveloperFeasibility]
        ?? null,
    }
  }

  // ── requirements[n].subField ────────────────────────────────────────────────
  const reqMatch = field.match(/^requirements\[(\d+)\](?:\.(.+))?$/)
  if (reqMatch) {
    const index = parseInt(reqMatch[1], 10)
    const subField = reqMatch[2] ?? ''
    // Task-level data access is edited from the Data Access tab, not Tasks & Benefits
    if (subField === 'dataAccess' || subField.startsWith('dataAccess.')) {
      return { sectionId: 'data-access', itemType: null, itemIndex: null, domFieldId: null }
    }
    // Task-level feasibility and risks live on the Feasibility & Risks tab, whose
    // field ids are keyed by requirement id rather than index.
    if (subField === 'feasibility' || subField.startsWith('feasibility.')) {
      return {
        sectionId: 'developer-feasibility', itemType: null, itemIndex: null, domFieldId: null,
      }
    }
    const targetFactory = requirementDomMap[subField as keyof Requirement]
    // Benefit-related subFields (benefits, benefits[].*, benefits[n].*, netTimeSaved)
    // all target the "Edit Benefits" button
    const isBenefitField = subField === 'benefits' ||
      subField.startsWith('benefits[') ||
      subField === 'netTimeSaved'
    return {
      sectionId:  'user-expectations',
      itemType:   'requirement',
      itemIndex:  index,
      domFieldId: targetFactory?.(index) ?? (isBenefitField ? `req-benefits-edit-${index}` : null),
    }
  }

  // ── datasets[n].subField ────────────────────────────────────────────────────
  const datasetMatch = field.match(/^datasets\[(\d+)\](?:\.(.+))?$/)
  if (datasetMatch) {
    const index = parseInt(datasetMatch[1], 10)
    const subField = datasetMatch[2] ?? ''
    const targetFactory = datasetDomMap[subField as keyof Dataset]
    return {
      sectionId:  'data-access',
      itemType:   'dataset',
      itemIndex:  index,
      domFieldId: targetFactory?.(index) ?? null,
    }
  }

  // ── outcomes.deliverables[n].subField ───────────────────────────────────────
  const delivMatch = field.match(/^outcomes\.deliverables\[(\d+)\](?:\.(.+))?$/)
  if (delivMatch) {
    const index = parseInt(delivMatch[1], 10)
    const subField = delivMatch[2] ?? ''
    const targetFactory = deliverableDomMap[subField as keyof Deliverable]
    return {
      sectionId:  'outcomes',
      itemType:   'deliverable',
      itemIndex:  index,
      domFieldId: targetFactory?.(index) ?? null,
    }
  }

  // ── outcomes.publications[n].subField ───────────────────────────────────────
  const pubMatch = field.match(/^outcomes\.publications\[(\d+)\](?:\.(.+))?$/)
  if (pubMatch) {
    const index = parseInt(pubMatch[1], 10)
    const subField = pubMatch[2] ?? ''
    const targetFactory = publicationDomMap[subField as keyof Publication]
    return {
      sectionId:  'outcomes',
      itemType:   'publication',
      itemIndex:  index,
      domFieldId: targetFactory?.(index) ?? null,
    }
  }

  // ── outcomes.evaluations[n].subField ────────────────────────────────────────
  const evalMatch = field.match(/^outcomes\.evaluations\[(\d+)\](?:\.(.+))?$/)
  if (evalMatch) {
    const index = parseInt(evalMatch[1], 10)
    const subField = evalMatch[2] ?? ''
    const targetFactory = evaluationDomMap[subField as keyof Evaluation]
    return {
      sectionId:  'outcomes',
      itemType:   'evaluation',
      itemIndex:  index,
      domFieldId: targetFactory?.(index) ?? null,
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
