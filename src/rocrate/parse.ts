/**
 * RO-Crate term mapping.
 * Maps a recovered JSON-LD graph to a current canvas candidate.
 */

import type { ROCrateEntity, ROCrateJSONLD } from '@/types/rocrate'
import type {
  Agent,
  AgentDataAction,
  CanvasData,
  ComplianceStandard,
  Dataset,
  Deliverable,
  Evaluation,
  GovernanceStage,
  Person,
  Publication,
  PublicationAuthor,
  Requirement,
  TaskDatasetLink,
} from '@/types/canvas'
import { isRecord } from '@/json'
import { AAC_CURRENT_SCHEMA } from '@/schema/contract'
import {
  readBoolean,
  readEntityReference,
  readEntityReferences,
  readIdentifier,
  readNumber,
  readString,
  readStringArray,
} from '@/rocrate/jsonld'

interface ParseContext {
  graph: ROCrateEntity[]
  canvasIdByCrateId: ReadonlyMap<string, string>
}

/**
 * Text the schema requires is left `undefined` when the crate carries nothing
 * readable, never flattened to `''`. Recovery relies on that distinction: an
 * absent value is foreign data it reports and defaults or drops, whereas an
 * empty string is a field the user has deliberately not filled in yet.
 */
type UnreadableAsAbsent<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

type ProjectCandidate = UnreadableAsAbsent<CanvasData['project'], 'title' | 'description'>

type ProjectAndRootSection = { project: ProjectCandidate }
  & Partial<Pick<CanvasData, 'version' | 'versionDate'>>
  & { developerFeasibility?: Record<string, unknown> }
  & { governanceReadiness?: Record<string, unknown> }

type RequirementCandidate = UnreadableAsAbsent<
  Omit<Requirement, 'benefits' | 'feasibility'>,
  'title'
> & {
  benefits: unknown[]
  feasibility?: Record<string, unknown>
}

type PersonCandidate = UnreadableAsAbsent<Person, 'name'>

interface PeopleAndGovernanceSection {
  persons?: PersonCandidate[]
  governance?: CanvasData['governance']
  milestoneIds: ReadonlySet<string>
}

interface RoleInfo {
  role: string
  roleContext: string
  stageId?: string
  agentRoleContext?: string
}

const ACCESS_RIGHTS = {
  open: true,
  restricted: true,
  confidential: true,
  'highly-restricted': true,
} as const satisfies Record<NonNullable<Dataset['accessRights']>, true>

const AGENT_DATA_ACTIONS = {
  read: true,
  modify: true,
  process: true,
  generate: true,
} as const satisfies Record<AgentDataAction, true>

const PRIMARY_VALUE_DRIVERS = {
  time: true,
  quality: true,
  risk: true,
  enablement: true,
  cost: true,
} as const satisfies Record<
  NonNullable<CanvasData['project']['primaryValueDriver']>,
  true
>

type ProblemFrequency = NonNullable<CanvasData['project']['problemFrequency']>

const problemFrequencySchemaValues: readonly string[] =
  AAC_CURRENT_SCHEMA.properties.project.properties.problemFrequency['enum']

const PROBLEM_FREQUENCIES = Object.fromEntries(
  problemFrequencySchemaValues.map((value) => [value, true]),
) as Readonly<Record<ProblemFrequency, true>>

const REQUIREMENT_PRIORITIES = {
  low: true,
  medium: true,
  high: true,
  critical: true,
} as const satisfies Record<NonNullable<Requirement['priority']>, true>

const REQUIREMENT_STATUSES = {
  planned: true,
  'in-progress': true,
  completed: true,
  cancelled: true,
} as const satisfies Record<NonNullable<Requirement['status']>, true>

const REQUIREMENT_TIME_UNITS = {
  minutes: true,
  hours: true,
} as const satisfies Record<NonNullable<Requirement['timeUnit']>, true>

const REQUIREMENT_UNIT_CATEGORIES = {
  item: true,
  interaction: true,
  computation: true,
  other: true,
} as const satisfies Record<NonNullable<Requirement['unitCategory']>, true>

/**
 * Canvas id for an entity. Crates written by this app carry `aac:canvasId`;
 * otherwise the crate identifier is used, stripping only a leading `#` so an
 * absolute URI keeps its own fragment.
 */
function crateIdToCanvasId(crateId: string): string {
  return crateId.replace(/^#/, '')
}

function canvasIdFor(entity: ROCrateEntity): string {
  return readString(entity['aac:canvasId']) ?? crateIdToCanvasId(entity['@id'])
}

function findEntity(graph: ROCrateEntity[], id: string): ROCrateEntity | undefined {
  return graph.find((entity) => entity['@id'] === id)
}

function findEntitiesByType(graph: ROCrateEntity[], type: string | string[]): ROCrateEntity[] {
  const types = Array.isArray(type) ? type : [type]
  return graph.filter((entity) => {
    const entityTypes = Array.isArray(entity['@type']) ? entity['@type'] : [entity['@type']]
    return types.some((candidate) => entityTypes.includes(candidate))
  })
}

function findRootDataset(graph: ROCrateEntity[]): ROCrateEntity | undefined {
  return findEntity(graph, './')
}

function findProjectEntity(graph: ROCrateEntity[]): ROCrateEntity | undefined {
  const rootDataset = findRootDataset(graph)
  const projectId = readIdentifier(rootDataset?.about)
  return (
    (projectId ? findEntity(graph, projectId) : undefined)
    ?? findEntitiesByType(
      graph,
      ['Project', 'ResearchProject', 'schema:Project', 'schema:ResearchProject'],
    )[0]
  )
}

function findPlanEntity(graph: ROCrateEntity[]): ROCrateEntity | undefined {
  const planId = readIdentifier(findProjectEntity(graph)?.hasPlan)
  return (
    (planId ? findEntity(graph, planId) : undefined)
    ?? findEntitiesByType(graph, ['Plan', 'p-plan:Plan', 'prov:Plan'])[0]
  )
}

function isAllowedValue<T extends string>(
  value: unknown,
  allowed: Readonly<Record<T, true>>,
): value is T {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(allowed, value)
}

/**
 * Retain a known but incompatible value at this untrusted boundary so schema
 * recovery can remove it with a visible field-level diagnostic.
 */
function preserveIncompatibleValue(
  target: object,
  key: string,
  value: unknown,
  isCompatible: boolean,
): void {
  if (value === undefined || isCompatible) return
  const untrustedTarget = target as Record<string, unknown>
  untrustedTarget[key] = value
}

function readStringList(value: unknown): string[] | undefined {
  const values = readStringArray(value)
  if (values !== undefined) return values
  const singleValue = readString(value)
  return singleValue ? [singleValue] : undefined
}

function normalizeEffortEstimate(value: unknown): Record<string, unknown> | undefined {
  if (!isRecord(value)) return undefined

  const normalized = { ...value }
  if (typeof normalized.effortEstimate !== 'string') return normalized

  const estimate = normalized.effortEstimate.trim().toLowerCase()
  let migrated: { value: number; unit: 'weeks' | 'person-hours' } | undefined
  const weekMatch = estimate.match(/(\d+(?:\.\d+)?)\s*(?:week|wk)/i)
  if (weekMatch) {
    migrated = { value: Number.parseFloat(weekMatch[1]), unit: 'weeks' }
  } else {
    const hourMatch = estimate.match(/(\d+(?:\.\d+)?)\s*(?:person-?hour|person-?hr|ph|hour|hr)/i)
    if (hourMatch) {
      migrated = { value: Number.parseFloat(hourMatch[1]), unit: 'person-hours' }
    } else {
      const numberMatch = estimate.match(/(\d+(?:\.\d+)?)/)
      if (numberMatch) {
        migrated = { value: Number.parseFloat(numberMatch[1]), unit: 'weeks' }
      }
    }
  }

  if (migrated) {
    normalized.effortEstimate = migrated
  } else {
    delete normalized.effortEstimate
  }
  return normalized
}

function readComplianceStandard(value: unknown): string | ComplianceStandard | undefined {
  if (typeof value === 'string') return value
  if (!isRecord(value) || typeof value.framework !== 'string') return undefined

  return {
    framework: value.framework,
    clauses: readStringArray(value.clauses),
    uri: readString(value.uri),
  }
}

function createParseContext(rocrate: ROCrateJSONLD): ParseContext {
  const graph = rocrate['@graph']
  const canvasIdByCrateId = new Map<string, string>()
  graph.forEach((entity) => {
    const canvasId = readString(entity['aac:canvasId'])
    if (canvasId) canvasIdByCrateId.set(entity['@id'], canvasId)
  })
  return { graph, canvasIdByCrateId }
}

function readProjectAndRootSection(context: ParseContext): ProjectAndRootSection {
  const { canvasIdByCrateId, graph } = context
  const section: ProjectAndRootSection = { project: {} }

  const projectEntity = findProjectEntity(graph)
  if (projectEntity) {
    // The grant number lives on the FRAPO Grant entity referenced by the project.
    const fundingRef = readEntityReference(projectEntity['frapo:isFundedBy'])
    const grantEntity = fundingRef ? findEntity(graph, fundingRef['@id']) : undefined
    const primaryValueDriver = projectEntity['aac:primaryValueDriver']
    const problemFrequency = projectEntity['aac:problemFrequency']
    const creatorRefs = readEntityReferences(projectEntity.creator)

    section.project = {
      title: readString(projectEntity.name) || undefined,
      // Keep an explicitly empty description. Partial exports use the empty
      // string to represent an unanswered required prompt, and schema recovery
      // knows how to preserve that in-progress value across a reopen.
      description: readString(projectEntity.description),
      objective: readString(projectEntity['schema:abstract']) || readString(projectEntity.about) || undefined,
      problemFrequency: isAllowedValue(problemFrequency, PROBLEM_FREQUENCIES)
        ? problemFrequency
        : undefined,
      problemExamples: readStringArray(projectEntity['aac:problemExamples']),
      projectStage: readString(projectEntity['aac:projectStage']) || undefined,
      startDate: readString(projectEntity.startDate) || undefined,
      endDate: readString(projectEntity.endDate) || undefined,
      domain: readStringList(projectEntity['aac:domain'] ?? projectEntity.domain),
      keywords: readStringList(projectEntity.keywords),
      projectId: readString(projectEntity.identifier) || undefined,
      fundingGrant: readString(grantEntity?.['frapo:hasGrantNumber']) || undefined,
      leadOrganization: readString(projectEntity['aac:leadOrganization']) || undefined,
      headlineValue: readString(projectEntity['aac:headlineValue']) || undefined,
      primaryValueDriver: isAllowedValue(primaryValueDriver, PRIMARY_VALUE_DRIVERS)
        ? primaryValueDriver
        : undefined,
      roughEstimateValue: readNumber(projectEntity['aac:roughEstimateValue']),
      roughEstimateUnit: readString(projectEntity['aac:roughEstimateUnit']) || undefined,
      version: readString(projectEntity['aac:version']) || undefined,
      versionDate: readString(projectEntity['aac:versionDate']) || undefined,
      creator: creatorRefs.length > 0
        ? creatorRefs.map(
          (creator) => canvasIdByCrateId.get(creator['@id']) ?? crateIdToCanvasId(creator['@id']),
        )
        : undefined,
    }
    preserveIncompatibleValue(
      section.project,
      'problemFrequency',
      problemFrequency,
      isAllowedValue(problemFrequency, PROBLEM_FREQUENCIES),
    )
    preserveIncompatibleValue(
      section.project,
      'primaryValueDriver',
      primaryValueDriver,
      isAllowedValue(primaryValueDriver, PRIMARY_VALUE_DRIVERS),
    )
    preserveIncompatibleValue(
      section.project,
      'roughEstimateValue',
      projectEntity['aac:roughEstimateValue'],
      readNumber(projectEntity['aac:roughEstimateValue']) !== undefined,
    )
  }

  const rootDataset = findRootDataset(graph)
  if (rootDataset) {
    const rootVersion = readString(rootDataset['aac:version'])
    const rootVersionDate = readString(rootDataset['aac:versionDate'])
    if (!section.project.version && rootVersion) section.project.version = rootVersion
    if (!section.project.versionDate && rootVersionDate) section.project.versionDate = rootVersionDate

    const license = readIdentifier(rootDataset.license)
    if (license) section.project.license = license

    if (rootDataset['aac:developerFeasibility']) {
      section.developerFeasibility = normalizeEffortEstimate(
        rootDataset['aac:developerFeasibility'],
      )
    }
    if (isRecord(rootDataset['aac:governanceReadiness'])) {
      section.governanceReadiness = rootDataset['aac:governanceReadiness']
    }
  }

  if (section.project.version) section.version = section.project.version
  if (section.project.versionDate) section.versionDate = section.project.versionDate
  return section
}

function readTaskDataAccess(
  value: unknown,
  canvasIdByCrateId: ReadonlyMap<string, string>,
): Requirement['dataAccess'] | undefined {
  if (!isRecord(value) || !Array.isArray(value.datasetLinks)) return undefined

  const datasetLinks = value.datasetLinks
    .filter(
      (link): link is Record<string, unknown> & { datasetId: string } =>
        isRecord(link) && typeof link.datasetId === 'string',
    )
    .map((rawLink): TaskDatasetLink => {
      const rawDatasetId = rawLink.datasetId
      const crateDatasetId = rawDatasetId.startsWith('#') ? rawDatasetId : `#${rawDatasetId}`
      const link: TaskDatasetLink = {
        datasetId: canvasIdByCrateId.get(crateDatasetId) ?? rawDatasetId,
      }
      if (Array.isArray(rawLink.agentActions)) {
        link.agentActions = rawLink.agentActions.filter(
          (action): action is AgentDataAction => isAllowedValue(action, AGENT_DATA_ACTIONS),
        )
        preserveIncompatibleValue(
          link,
          'agentActions',
          rawLink.agentActions,
          link.agentActions.length === rawLink.agentActions.length,
        )
      }
      if (typeof rawLink.notes === 'string' && rawLink.notes) link.notes = rawLink.notes
      return link
    })

  return datasetLinks.length > 0 ? { datasetLinks } : undefined
}

function readRequirement(step: ROCrateEntity, context: ParseContext): RequirementCandidate {
  const stepDescription = readString(step.description) || ''
  const stepName = readString(step.name) || ''
  const aacTitle = readString(step['aac:title'])
  const requirement: RequirementCandidate = {
    id: canvasIdFor(step),
    title: aacTitle || stepDescription || stepName || undefined,
    description: stepDescription || undefined,
    userStory: readString(step['aac:userStory'])
      ?? (stepName && stepName !== (aacTitle || stepDescription) ? stepName : undefined),
    priority: isAllowedValue(step.priority, REQUIREMENT_PRIORITIES) ? step.priority : undefined,
    status: isAllowedValue(step.status, REQUIREMENT_STATUSES) ? step.status : undefined,
    benefits: [],
  }
  preserveIncompatibleValue(
    requirement,
    'priority',
    step.priority,
    isAllowedValue(step.priority, REQUIREMENT_PRIORITIES),
  )
  preserveIncompatibleValue(
    requirement,
    'status',
    step.status,
    isAllowedValue(step.status, REQUIREMENT_STATUSES),
  )

  const unitOfWork = readString(step['aac:unitOfWork'])
  if (unitOfWork !== undefined) requirement.unitOfWork = unitOfWork
  const volumePerMonth = readNumber(step['aac:volumePerMonth'])
  if (volumePerMonth !== undefined) requirement.volumePerMonth = volumePerMonth
  preserveIncompatibleValue(
    requirement,
    'volumePerMonth',
    step['aac:volumePerMonth'],
    volumePerMonth !== undefined,
  )
  const value = readString(step['aac:value'])
  if (value !== undefined) requirement.value = value
  if (isAllowedValue(step['aac:timeUnit'], REQUIREMENT_TIME_UNITS)) {
    requirement.timeUnit = step['aac:timeUnit']
  }
  preserveIncompatibleValue(
    requirement,
    'timeUnit',
    step['aac:timeUnit'],
    isAllowedValue(step['aac:timeUnit'], REQUIREMENT_TIME_UNITS),
  )
  const targetPopulation = readString(step['aac:targetPopulation'])
  if (targetPopulation !== undefined) requirement.targetPopulation = targetPopulation
  if (isAllowedValue(step['aac:unitCategory'], REQUIREMENT_UNIT_CATEGORIES)) {
    requirement.unitCategory = step['aac:unitCategory']
  }
  preserveIncompatibleValue(
    requirement,
    'unitCategory',
    step['aac:unitCategory'],
    isAllowedValue(step['aac:unitCategory'], REQUIREMENT_UNIT_CATEGORIES),
  )

  if (Array.isArray(step['aac:benefits'])) {
    // Full benefit validity is enforced by current-schema recovery.
    requirement.benefits = structuredClone(step['aac:benefits'])
  }

  // Older crates stored oversight on the requirement rather than its time benefit.
  const oversightValue = readNumber(step['aac:humanOversightMinutesPerUnit'])
  if (oversightValue !== undefined) {
    const firstTimeBenefitIndex = requirement.benefits.findIndex(
      (benefit) => isRecord(benefit) && benefit.benefitType === 'time',
    )
    const timeBenefit = requirement.benefits[firstTimeBenefitIndex]
    if (firstTimeBenefitIndex >= 0 && isRecord(timeBenefit)) {
      requirement.benefits[firstTimeBenefitIndex] = {
        ...timeBenefit,
        oversightMinutesPerUnit: oversightValue,
      }
    }
  }

  const dependsOn = readStringArray(step['aac:dependsOn'])
  if (dependsOn !== undefined) requirement.dependsOn = dependsOn
  const stakeholders = readStringArray(step['aac:stakeholders'])
  if (stakeholders !== undefined) requirement.stakeholders = stakeholders
  const feasibility = normalizeEffortEstimate(step['aac:feasibility'])
  if (feasibility !== undefined) requirement.feasibility = feasibility

  // Older crates may carry a model entity reference instead of feasibility fields.
  const modelRef = readEntityReference(step['aac:model'])
  if (modelRef && typeof requirement.feasibility?.modelCardUri !== 'string') {
    if (!requirement.feasibility) requirement.feasibility = {}
    requirement.feasibility.modelCardUri = modelRef['@id']
    if (typeof requirement.feasibility.modelName !== 'string') {
      const modelName = readString(findEntity(context.graph, modelRef['@id'])?.name)
      if (modelName) requirement.feasibility.modelName = modelName
    }
  }

  const dataAccess = readTaskDataAccess(step['aac:dataAccess'], context.canvasIdByCrateId)
  if (dataAccess) requirement.dataAccess = dataAccess
  return requirement
}

function readRequirementsSection(
  context: ParseContext,
): { requirements: RequirementCandidate[] } | undefined {
  const planEntity = findPlanEntity(context.graph)
  if (!planEntity) return undefined

  const requirements = readEntityReferences(planEntity['p-plan:hasStep'])
    .map((reference) => findEntity(context.graph, reference['@id']))
    .filter((step): step is ROCrateEntity => step !== undefined)
    .map((step) => readRequirement(step, context))

  return requirements.length > 0 ? { requirements } : undefined
}

function readPersonEntity(personEntity: ROCrateEntity): PersonCandidate {
  return {
    id: canvasIdFor(personEntity),
    name: readString(personEntity.name) || undefined,
    affiliation: readString(personEntity['schema:affiliation']),
    orcid: readIdentifier(personEntity['schema:identifier']),
    functionRoles: readStringArray(personEntity['aac:functionRoles']),
    localTitle: readString(personEntity['aac:localTitle']),
  }
}

function readRoleMap(graph: ROCrateEntity[]): Map<string, RoleInfo[]> {
  const rolesByPersonId = new Map<string, RoleInfo[]>()
  findEntitiesByType(graph, ['Role', 'schema:Role']).forEach((roleEntity) => {
    const memberRef = readEntityReference(roleEntity['schema:member'])
    if (!memberRef) return

    const roles = rolesByPersonId.get(memberRef['@id']) ?? []
    roles.push({
      role: readString(roleEntity['schema:roleName']) || '',
      roleContext: readString(roleEntity['aac:roleContext']) || 'stakeholder',
      stageId: readString(roleEntity['aac:stageId']),
      agentRoleContext: readString(roleEntity['aac:agentRoleContext']),
    })
    rolesByPersonId.set(memberRef['@id'], roles)
  })
  return rolesByPersonId
}

function readLegacyAgentRoles(agent: ROCrateEntity): string[] {
  const rawRoles = agent['aac:roles']
  const singleRole = readString(rawRoles)
  return readStringArray(rawRoles)
    ?? (singleRole ? [singleRole] : (readString(agent.role) ? [readString(agent.role)!] : []))
}

function readStageAgent(
  agent: ROCrateEntity,
  activity: ROCrateEntity,
  persons: PersonCandidate[],
  rolesByPersonId: ReadonlyMap<string, RoleInfo[]>,
): Agent {
  const agentType = Array.isArray(agent['@type']) ? agent['@type'][0] : agent['@type']
  const normalizedType = agentType?.replace('schema:', '') || agentType

  if (normalizedType === 'Person') {
    const personId = canvasIdFor(agent)
    if (!persons.some((person) => person.id === personId)) {
      persons.push(readPersonEntity(agent))
    }

    const rolesForPerson = rolesByPersonId.get(agent['@id']) ?? []
    const exactStageRoles = rolesForPerson.filter(
      (role) => role.roleContext === 'stage-agent' && role.stageId === activity['@id'],
    )
    const stageRoles = exactStageRoles.length > 0
      ? exactStageRoles
      : rolesForPerson.filter((role) => role.roleContext === 'stage-agent')
    const candidateRoles = stageRoles.length > 0
      ? stageRoles.map((role) => role.role)
      : readLegacyAgentRoles(agent)
    const meaningfulRoles = candidateRoles.filter((role) => role !== 'stakeholder' && role !== 'agent')

    return {
      personId,
      role: meaningfulRoles[0] ?? candidateRoles[0],
      roleContext: stageRoles[0]?.agentRoleContext,
      type: 'person',
    }
  }

  const selectedRole = (rolesByPersonId.get(agent['@id']) ?? []).find(
    (role) => role.roleContext === 'stage-agent' && role.stageId === activity['@id'],
  )
  return {
    name: readString(agent.name) || '',
    role: selectedRole?.role ?? readString(agent.role),
    roleContext: selectedRole?.agentRoleContext,
    type: normalizedType === 'Organization' ? 'organization' : 'software',
  }
}

function readGovernanceStage(
  activity: ROCrateEntity,
  graph: ROCrateEntity[],
  persons: PersonCandidate[],
  rolesByPersonId: ReadonlyMap<string, RoleInfo[]>,
): GovernanceStage {
  const stage: GovernanceStage = {
    id: canvasIdFor(activity),
    name: readString(activity.name) || '',
  }

  const startedAtTime = readString(activity.startedAtTime)
  if (startedAtTime) stage.startDate = startedAtTime.split('T')[0]
  const endedAtTime = readString(activity.endedAtTime)
  if (endedAtTime) stage.endDate = endedAtTime.split('T')[0]

  if (activity.wasAssociatedWith) {
    stage.agents = readEntityReferences(activity.wasAssociatedWith)
      .map((reference) => findEntity(graph, reference['@id']))
      .filter((agent): agent is ROCrateEntity => agent !== undefined)
      .map((agent) => readStageAgent(agent, activity, persons, rolesByPersonId))
  }

  if (activity.hasMilestone) {
    stage.milestones = readEntityReferences(activity.hasMilestone)
      .map((reference) => findEntity(graph, reference['@id']))
      .filter((milestone): milestone is ROCrateEntity => milestone !== undefined)
      .map((milestone) => ({
        description: readString(milestone.name) || '',
        kpi: readString(milestone.description) || undefined,
      }))
  }

  const complianceStandard = activity['aac:complianceStandard'] || activity.complianceStandard
  if (complianceStandard) {
    const standards = (Array.isArray(complianceStandard) ? complianceStandard : [complianceStandard])
      .map(readComplianceStandard)
      .filter((standard): standard is string | ComplianceStandard => standard !== undefined)
    if (standards.length > 0) stage.complianceStandards = standards
  }

  const policyCardUri = readString(activity['aac:policyCardUri'])
  if (policyCardUri) stage.policyCardUri = policyCardUri
  return stage
}

function readPeopleAndGovernanceSection(graph: ROCrateEntity[]): PeopleAndGovernanceSection {
  const persons = findEntitiesByType(graph, ['Person', 'schema:Person']).map(readPersonEntity)
  const hadCentralizedPersons = persons.length > 0
  const rolesByPersonId = readRoleMap(graph)
  const activities = findEntitiesByType(graph, ['Activity', 'prov:Activity'])
  const milestoneIds = new Set<string>()
  activities.forEach((activity) => {
    readEntityReferences(activity.hasMilestone).forEach((reference) => {
      milestoneIds.add(reference['@id'])
    })
  })

  const stages = activities.map((activity) =>
    readGovernanceStage(activity, graph, persons, rolesByPersonId),
  )

  return {
    // Match the legacy mapper: persons were committed before stage-agent fallbacks ran.
    persons: hadCentralizedPersons ? persons : undefined,
    governance: stages.length > 0 ? { stages } : undefined,
    milestoneIds,
  }
}

function readDatasetsSection(graph: ROCrateEntity[]): CanvasData['dataAccess'] | undefined {
  const datasetEntities = findEntitiesByType(
    graph,
    ['Dataset', 'dcat:Dataset', 'schema:Dataset'],
  ).filter(
    (entity) => entity['@id'] !== './' && entity['aac:outcomeType'] !== 'deliverable',
  )
  if (datasetEntities.length === 0) return undefined

  const datasets = datasetEntities.map((dataset): Dataset => {
    const duoTerms = dataset['dct:conformsTo']
    const duoValues = duoTerms === undefined
      ? undefined
      : (Array.isArray(duoTerms) ? duoTerms : [duoTerms])
          .map(readIdentifier)
          .filter((term): term is string => term !== undefined)
    const containsPersonalData = dataset['aac:containsPersonalData'] !== undefined
      ? dataset['aac:containsPersonalData']
      : dataset.containsPersonalData

    const canvasDataset: Dataset = {
      id: canvasIdFor(dataset),
      title: readString(dataset.name) || '',
      description: readString(dataset.description) || undefined,
      format: readString(dataset['schema:encodingFormat']),
      license: readIdentifier(dataset.license),
      accessRights: isAllowedValue(dataset['dct:accessRights'], ACCESS_RIGHTS)
        ? dataset['dct:accessRights']
        : undefined,
      pid: readString(dataset.identifier) || undefined,
      datasetSheetUri: readIdentifier(dataset['dcat:landingPage'])
        ?? readString(dataset['schema:url'])
        ?? undefined,
      duoTerms: duoValues,
      containsPersonalData: readBoolean(containsPersonalData),
      publisher: readString(dataset['schema:publisher']) || undefined,
      sensitivityLevel: readString(dataset['aac:sensitivityLevel']) || undefined,
    }
    preserveIncompatibleValue(
      canvasDataset,
      'accessRights',
      dataset['dct:accessRights'],
      isAllowedValue(dataset['dct:accessRights'], ACCESS_RIGHTS),
    )
    return canvasDataset
  })

  return datasets.length > 0 ? { datasets } : undefined
}

function findCreativeWorkOutcomes(
  graph: ROCrateEntity[],
  milestoneIds: ReadonlySet<string>,
): ROCrateEntity[] {
  const outcomeEntities = graph.filter((entity) => {
    if (entity['@id'] === 'ro-crate-metadata.json') return false
    if (entity['@id'] === 'benefit-display.json') return false
    if (milestoneIds.has(entity['@id']) || entity['aac:milestoneType'] === 'milestone') return false
    if (entity['aac:evaluationType']) return false
    if (!readString(entity.name)?.trim()) return false
    if (entity['aac:outcomeType'] === 'deliverable') return true

    const entityTypes = Array.isArray(entity['@type']) ? entity['@type'] : [entity['@type']]
    const legacyTypes = [
      'CreativeWork',
      'ScholarlyArticle',
      'Report',
      'schema:CreativeWork',
      'schema:ScholarlyArticle',
      'schema:Report',
    ]
    return legacyTypes.some((type) => entityTypes.includes(type))
  })
  const publications = findEntitiesByType(
    graph,
    ['ScholarlyArticle', 'schema:ScholarlyArticle'],
  ).filter((entity) =>
    entity['@id'] !== 'ro-crate-metadata.json' && Boolean(readString(entity.name)?.trim()),
  )

  const seenIds = new Set<string>()
  return [...outcomeEntities, ...publications].filter((entity) => {
    if (seenIds.has(entity['@id'])) return false
    seenIds.add(entity['@id'])
    return true
  })
}

function readPublicationAuthors(entity: ROCrateEntity, graph: ROCrateEntity[]): PublicationAuthor[] {
  const rawAuthors = Array.isArray(entity.author) ? entity.author : []
  return rawAuthors
    .filter((author): author is Record<string, unknown> =>
      isRecord(author) && Boolean(readString(author.name)),
    )
    .map((author): PublicationAuthor => {
      const authorRef = readEntityReference(author)
      const referencedPerson = authorRef ? findEntity(graph, authorRef['@id']) : undefined
      const personId = readString(referencedPerson?.['aac:canvasId'])
        ?? (authorRef ? crateIdToCanvasId(authorRef['@id']) : undefined)
      const authorTypes = readStringArray(author['@type'])
      const authorType = authorTypes?.[0] ?? readString(author['@type'])
      const isOrganization = authorType === 'schema:Organization' || authorType === 'Organization'
      if (!isOrganization && personId) return { type: 'person', personId }
      return { type: 'organization', name: readString(author.name) || '' }
    })
}

function readCreativeWorkOutcomeSection(
  graph: ROCrateEntity[],
  milestoneIds: ReadonlySet<string>,
): Partial<Pick<NonNullable<CanvasData['outcomes']>, 'deliverables' | 'publications'>> {
  const deliverables: Deliverable[] = []
  const publications: Publication[] = []

  findCreativeWorkOutcomes(graph, milestoneIds).forEach((entity) => {
    const entityType = Array.isArray(entity['@type']) ? entity['@type'][0] : entity['@type']
    const normalizedType = entityType?.replace('schema:', '') || entityType
    const title = readString(entity.name) || ''
    if (!title.trim()) return

    const outcome: Omit<Deliverable, 'type'> = {
      id: canvasIdFor(entity),
      title,
      description: readString(entity.description) || undefined,
      date: readString(entity.datePublished) || undefined,
      pid: readString(entity.identifier) || undefined,
    }

    if (normalizedType === 'ScholarlyArticle') {
      const authors = readPublicationAuthors(entity, graph)
      publications.push({
        id: outcome.id,
        title: outcome.title,
        date: outcome.date,
        doi: outcome.pid,
        authors: authors.length > 0 ? authors : undefined,
      })
      return
    }

    deliverables.push({
      ...outcome,
      type: normalizedType || 'Deliverable',
    })
  })

  const section: Partial<
    Pick<NonNullable<CanvasData['outcomes']>, 'deliverables' | 'publications'>
  > = {}
  if (deliverables.length > 0) section.deliverables = deliverables
  if (publications.length > 0) section.publications = publications
  return section
}

function readEvaluationSection(graph: ROCrateEntity[]): Evaluation[] | undefined {
  const oldEvaluations = findEntitiesByType(graph, 'Evaluation')
  const currentEvaluations = findEntitiesByType(graph, ['CreativeWork', 'schema:CreativeWork'])
    .filter((entity) =>
      entity['aac:evaluationType'] && entity['@id'] !== 'ro-crate-metadata.json',
    )
  const evaluations = [...oldEvaluations, ...currentEvaluations].map((evaluation): Evaluation => ({
    id: canvasIdFor(evaluation),
    type: readString(evaluation['aac:evaluationType']) || readString(evaluation.name) || '',
    results: readString(evaluation.description) || undefined,
    date: readString(evaluation.datePublished) || undefined,
    metrics: isRecord(evaluation['aac:metrics']) ? evaluation['aac:metrics'] : undefined,
  }))
  return evaluations.length > 0 ? evaluations : undefined
}

function readOutcomesSection(
  graph: ROCrateEntity[],
  milestoneIds: ReadonlySet<string>,
): CanvasData['outcomes'] | undefined {
  const creativeWorks = readCreativeWorkOutcomeSection(graph, milestoneIds)
  const evaluations = readEvaluationSection(graph)
  if (!creativeWorks.deliverables && !creativeWorks.publications && !evaluations) return undefined

  const outcomes: NonNullable<CanvasData['outcomes']> = { ...creativeWorks }
  if (evaluations) outcomes.evaluations = evaluations
  return outcomes
}

/**
 * Map known RO-Crate terms to an untrusted current-canvas candidate.
 * Only `recoverCanvasToCurrent` may promote this boundary value to CanvasData.
 */
export function mapROCrateToCanvasCandidate(rocrate: ROCrateJSONLD): unknown {
  const context = createParseContext(rocrate)
  const projectAndRoot = readProjectAndRootSection(context)
  const peopleAndGovernance = readPeopleAndGovernanceSection(context.graph)
  const userExpectations = readRequirementsSection(context)
  const dataAccess = readDatasetsSection(context.graph)
  const outcomes = readOutcomesSection(context.graph, peopleAndGovernance.milestoneIds)

  const { governanceReadiness, ...rootSections } = projectAndRoot
  const candidate: Record<string, unknown> = { ...rootSections }
  if (peopleAndGovernance.persons) candidate.persons = peopleAndGovernance.persons
  if (userExpectations) candidate.userExpectations = userExpectations
  if (peopleAndGovernance.governance || governanceReadiness) {
    candidate.governance = {
      ...governanceReadiness,
      ...peopleAndGovernance.governance,
    }
  }
  if (dataAccess) candidate.dataAccess = dataAccess
  if (outcomes) candidate.outcomes = outcomes
  return candidate
}
