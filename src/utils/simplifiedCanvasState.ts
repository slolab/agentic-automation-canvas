import type { CanvasData } from '@/types/canvas'

type SimplifiedSection =
  | 'Project'
  | 'Problem'
  | 'Change and Value'
  | 'Solutions'
  | 'Development Reality'
  | 'First Milestone'

const simplifiedPromptDefinitions = {
  'project-title': { label: 'Project title', section: 'Project', domId: 'simplified-project-title' },
  'problem-description': { label: 'Problem description', section: 'Problem', domId: 'problem-description' },
  'problem-audience': { label: 'Who experiences this problem', section: 'Problem', domId: 'problem-audience' },
  'problem-frequency': { label: 'How often the problem is experienced', section: 'Problem', domId: 'problem-frequency' },
  'problem-example': { label: 'Most recent concrete case', section: 'Problem', domId: 'problem-example-0' },
  'desired-change': { label: 'What should happen differently', section: 'Change and Value', domId: 'desired-change' },
  'why-now': { label: 'Why this is important right now', section: 'Change and Value', domId: 'why-now' },
  'expected-benefits': { label: 'Expected benefits', section: 'Change and Value', domId: 'expected-benefits' },
  'success-metrics': { label: 'How you will know it worked', section: 'Change and Value', domId: 'success-metrics' },
  'previous-attempts': { label: 'What has already been tried', section: 'Solutions', domId: 'previous-attempts' },
  'solution-approaches': { label: 'Potential Approaches', section: 'Solutions', domId: 'solution-approaches' },
  'solutions-research': { label: 'Tools or existing solutions (to research)', section: 'Solutions', domId: 'solutions-research' },
  'build-team-status': { label: 'Whether a team can build it', section: 'Development Reality', domId: 'build-team-status' },
  'maintenance-status': { label: 'Whether somebody can maintain it', section: 'Development Reality', domId: 'maintenance-status' },
  'first-milestone': { label: 'First milestone', section: 'First Milestone', domId: 'first-milestone' },
  'milestone-kpi': { label: 'Milestone completion evidence', section: 'First Milestone', domId: 'milestone-kpi' },
} as const satisfies Record<
  string,
  { label: string; section: SimplifiedSection; domId: string }
>

export type SimplifiedPromptId = keyof typeof simplifiedPromptDefinitions

export interface MissingSimplifiedPrompt {
  id: SimplifiedPromptId
  label: string
  section: SimplifiedSection
}

export function simplifiedPromptDomId(id: SimplifiedPromptId): string {
  return simplifiedPromptDefinitions[id].domId
}

function hasText(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0
}

function hasMeaningfulValue(value: unknown): boolean {
  if (value === undefined || value === null || value === false) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (typeof value === 'number') return true
  if (Array.isArray(value)) return value.some(hasMeaningfulValue)
  if (typeof value === 'object') return Object.values(value).some(hasMeaningfulValue)
  return true
}

export function missingSimplifiedPrompts(data: CanvasData): MissingSimplifiedPrompt[] {
  const requirement = data.userExpectations?.requirements?.[0]
  const benefits = requirement?.benefits ?? []
  const developer = data.developerFeasibility
  const governance = data.governance
  const firstStage = data.governance?.stages?.[0]
  const firstMilestone = firstStage?.milestones?.[0]
  const potentialApproaches = requirement?.feasibility?.technologyApproach?.approaches ?? []
  const customApproaches = requirement?.feasibility?.technologyApproach?.customApproaches ?? []

  const complete: Record<SimplifiedPromptId, boolean> = {
    'project-title': hasText(data.project.title),
    'problem-description': hasText(data.project.description),
    'problem-audience': hasText(requirement?.targetPopulation),
    'problem-frequency': hasText(data.project.problemFrequency),
    'problem-example': data.project.problemExamples?.some(hasText) ?? false,
    'desired-change': hasText(data.project.objective),
    'why-now': hasText(data.project.headlineValue),
    'expected-benefits': benefits.some((benefit) => benefit.benefitType === 'unclassified' && hasText(benefit.description)),
    'success-metrics': benefits.some((benefit) => benefit.benefitType === 'unclassified' && hasText(benefit.metricLabel)),
    'previous-attempts': hasText(developer?.feasibilityNotes),
    'solution-approaches': potentialApproaches.length > 0
      && (!potentialApproaches.includes('other') || customApproaches.some(hasText)),
    'solutions-research': hasText(developer?.solutionsToResearch),
    'build-team-status': hasText(governance?.buildTeamStatus),
    'maintenance-status': hasText(governance?.maintenanceOwnerStatus),
    'first-milestone': hasText(firstMilestone?.description),
    'milestone-kpi': hasText(firstMilestone?.kpi),
  }

  return (Object.keys(simplifiedPromptDefinitions) as SimplifiedPromptId[])
    .filter((id) => !complete[id])
    .map((id) => ({ id, ...simplifiedPromptDefinitions[id] }))
}

export function hasMeaningfulCanvasContent(data: CanvasData): boolean {
  const meaningfulProject = Object.entries(data.project).some(([key, value]) =>
    key !== 'version' && key !== 'versionDate' && hasMeaningfulValue(value),
  )
  if (meaningfulProject) return true

  if ([
    data.persons,
    data.developerFeasibility,
    data.dataAccess,
    data.outcomes,
  ].some(hasMeaningfulValue)) return true

  const userExpectations = data.userExpectations
  if (hasExtraKeys(userExpectations, ['requirements'])) return true
  if ((userExpectations?.requirements ?? []).some((requirement) => {
    if (hasText(requirement.title) && requirement.title !== requirement.id) return true
    return hasExtraKeys(requirement, ['id', 'title'])
  })) return true

  const governance = data.governance
  if (hasExtraKeys(governance, ['stages'])) return true
  return (governance?.stages ?? []).some((stage) => {
    if (hasText(stage.name) && stage.name !== 'Planning') return true
    return hasExtraKeys(stage, ['id', 'name', 'milestones', 'agents'])
      || (stage.milestones ?? []).some(hasMeaningfulValue)
      || (stage.agents ?? []).some(hasMeaningfulValue)
  })
}

function hasExtraKeys<T extends object>(
  value: T | undefined,
  simplifiedKeys: readonly Extract<keyof T, string>[],
): boolean {
  if (!value) return false
  const allowed = new Set<string>(simplifiedKeys)
  return Object.entries(value).some(([key, entry]) => !allowed.has(key) && hasMeaningfulValue(entry))
}

/**
 * Reports canonical content that is not represented by the simplified canvas.
 * It powers a discoverability hint only; it never changes or filters project data.
 */
export function hasDetailedCanvasContent(data: CanvasData): boolean {
  if (hasExtraKeys(data.project, [
    'title',
    'description',
    'objective',
    'headlineValue',
    'problemFrequency',
    'problemExamples',
    'projectStage',
    'version',
    'versionDate',
  ])) return true
  if (hasText(data.project.projectStage)) return true

  if (hasExtraKeys(data.developerFeasibility, [
    'feasibilityNotes',
    'solutionsToResearch',
    'constraintFlags',
  ])) return true
  // A dataset created by a simplified data constraint carries no detailed content
  // of its own: only its generated id and the personal-data answer are set.
  if (hasExtraKeys(data.dataAccess, ['datasets'])) return true
  const datasets = data.dataAccess?.datasets ?? []
  if (datasets.length > 1) return true
  const dataset = datasets[0]
  if (dataset && (
    hasText(dataset.title)
    || hasExtraKeys(dataset, ['id', 'title', 'containsPersonalData'])
  )) return true
  if (hasMeaningfulValue(data.outcomes)) return true

  const requirements = data.userExpectations?.requirements ?? []
  if (requirements.length > 1) return true
  const requirement = requirements[0]
  if (requirement) {
    if (requirement.title !== requirement.id) return true
    if (hasExtraKeys(requirement, ['id', 'title', 'targetPopulation', 'benefits', 'feasibility'])) return true
    if ((requirement.benefits ?? []).some((benefit) => benefit.benefitType !== 'unclassified')) return true
    if (hasExtraKeys(requirement.feasibility, ['technologyApproach'])) return true
    if (hasExtraKeys(requirement.feasibility?.technologyApproach, ['approaches', 'customApproaches'])) return true
  }

  const stages = data.governance?.stages ?? []
  if (stages.length > 1) return true
  const stage = stages[0]
  if (stage) {
    if (stage.name !== 'Planning') return true
    if (hasExtraKeys(stage, [
      'id',
      'name',
      'startDate',
      'endDate',
      'agents',
      'milestones',
    ])) return true
    if ((stage.milestones?.length ?? 0) > 1) return true
    if (hasExtraKeys(stage.milestones?.[0], ['description', 'kpi'])) return true
    if ((stage.agents ?? []).some((agent) => agent.type !== 'person' || hasExtraKeys(agent, ['type', 'personId']))) return true
  }

  if (hasExtraKeys(data.governance, [
    'buildTeamStatus',
    'maintenanceOwnerStatus',
    'stages',
  ])) return true

  const linkedPersonIds = new Set(
    (stage?.agents ?? [])
      .filter((agent) => agent.type === 'person' && agent.personId)
      .map((agent) => agent.personId!),
  )
  if ((data.persons ?? []).some((person) =>
    !linkedPersonIds.has(person.id) || hasExtraKeys(person, ['id', 'name']),
  )) return true

  return false
}
