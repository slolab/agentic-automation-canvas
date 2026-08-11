/**
 * Current AAC RO-Crate JSON-LD exporter
 * Following RO-Crate 1.2 specification with Schema.org, DCAT, PROV-O, FRAPO mappings
 */

import type { CanvasData } from '@/types/canvas'
import type { BenefitDisplayState } from '@/types/benefitDisplay'
import {
  AAC_RO_CRATE_PROFILE_ID,
  AAC_SCHEMA_VERSION,
  RO_CRATE_CONTEXT,
  RO_CRATE_VERSION,
} from '@/schema/contract'
import { assertCurrentCanvas } from '@/schema/validation'
import type { ROCrateJSONLD, ROCrateEntity } from '@/types/rocrate'

/**
 * Generate a unique ID for an entity
 */
function generateId(prefix: string, index?: number): string {
  return index !== undefined ? `#${prefix}-${index}` : `#${prefix}`
}

class CrateIdAllocator {
  private readonly used = new Set<string>()

  constructor(reserved: readonly string[]) {
    reserved.forEach((id) => this.used.add(id))
  }

  forCanvasId(canvasId: string, fallbackPrefix: string, index: number): string {
    const preferred = canvasId && /^[\w-]+$/.test(canvasId)
      ? `#${canvasId}`
      : generateId(fallbackPrefix, index)
    return this.unique(preferred, generateId(fallbackPrefix, index))
  }

  generated(prefix: string, index?: number): string {
    const candidate = generateId(prefix, index)
    return this.unique(candidate, candidate)
  }

  private unique(preferred: string, fallback: string): string {
    if (!this.used.has(preferred)) {
      this.used.add(preferred)
      return preferred
    }

    let suffix = 1
    let candidate = fallback
    while (this.used.has(candidate)) candidate = `${fallback}-${suffix++}`
    this.used.add(candidate)
    return candidate
  }
}

/**
 * Crate @ids for datasets are allocated up front so task-level references use
 * the same collision-free identity as entity emission.
 */
interface DatasetCrateIds {
  byIndex: string[]
  byCanvasId: Map<string, string>
}

function buildDatasetCrateIds(
  data: CanvasData,
  allocator: CrateIdAllocator,
): DatasetCrateIds {
  const datasets = data.dataAccess?.datasets ?? []
  const byIndex = datasets.map((dataset, index) =>
    allocator.forCanvasId(dataset.id, 'dataset', index),
  )
  const byCanvasId = new Map<string, string>()
  datasets.forEach((dataset, index) => {
    if (!byCanvasId.has(dataset.id)) byCanvasId.set(dataset.id, byIndex[index])
  })
  return { byIndex, byCanvasId }
}

interface ExportEntityIds {
  requirements: string[]
  datasets: DatasetCrateIds
  stages: string[]
  deliverables: string[]
  publications: string[]
  evaluations: string[]
}

function allocateEntityIds(
  data: CanvasData,
  allocator: CrateIdAllocator,
): ExportEntityIds {
  return {
    requirements: (data.userExpectations?.requirements ?? []).map((requirement, index) =>
      allocator.forCanvasId(requirement.id, 'requirement', index),
    ),
    datasets: buildDatasetCrateIds(data, allocator),
    stages: (data.governance?.stages ?? []).map((stage, index) =>
      allocator.forCanvasId(stage.id, 'stage', index),
    ),
    deliverables: (data.outcomes?.deliverables ?? []).map((deliverable, index) =>
      allocator.forCanvasId(deliverable.id, 'outcome', index),
    ),
    publications: (data.outcomes?.publications ?? []).map((publication, index) =>
      allocator.forCanvasId(publication.id, 'publication', index),
    ),
    evaluations: (data.outcomes?.evaluations ?? []).map((evaluation, index) =>
      allocator.forCanvasId(evaluation.id, 'evaluation', index),
    ),
  }
}

type CanvasPerson = NonNullable<CanvasData['persons']>[number]

/**
 * Role assignment for a person
 */
interface RoleAssignment {
  personId: string
  role: string
  roleContext: 'stakeholder' | 'stage-agent'
  stageId?: string
  agentRoleContext?: string
}

interface NonPersonAgentRole {
  agentId: string
  role: string
  stageId: string
  agentRoleContext?: string
}

/**
 * Stores explicitly identified Person entities and their role assignments.
 * Canvas person IDs are the identity boundary, so no heuristic name matching is
 * needed here.
 */
class PersonRegistry {
  private readonly persons = new Map<string, ROCrateEntity>()
  private readonly roleAssignments: RoleAssignment[] = []

  /**
   * Add a role assignment for a person
   */
  addRoleAssignment(
    personId: string,
    role: string,
    roleContext: RoleAssignment['roleContext'],
    stageId?: string,
    agentRoleContext?: string,
  ): void {
    const exists = this.roleAssignments.some(
      (assignment) =>
        assignment.personId === personId &&
        assignment.role === role &&
        assignment.roleContext === roleContext &&
        assignment.stageId === stageId &&
        assignment.agentRoleContext === agentRoleContext,
    )
    if (!exists) {
      this.roleAssignments.push({ personId, role, roleContext, stageId, agentRoleContext })
    }
  }

  addPerson(personId: string, person: CanvasPerson): void {
    if (this.persons.has(personId)) return

    const personEntity: ROCrateEntity = {
      '@id': personId,
      '@type': 'schema:Person',
      name: person.name,
      'aac:canvasId': person.id,
    }
    if (person.affiliation) {
      personEntity['schema:affiliation'] = person.affiliation
    }
    if (person.orcid) {
      personEntity['schema:identifier'] = person.orcid
    }
    if (person.functionRoles?.length) {
      personEntity['aac:functionRoles'] = person.functionRoles
    }
    if (person.localTitle) {
      personEntity['aac:localTitle'] = person.localTitle
    }

    this.persons.set(personId, personEntity)
  }

  /**
   * Get all Person entities for the graph (identity-only, no roles embedded)
   */
  getAllPersonEntities(): ROCrateEntity[] {
    return Array.from(this.persons.values(), (entity) => ({ ...entity }))
  }

  /**
   * Get all Role entities for the graph
   * Creates schema:Role nodes for each role assignment
   */
  getAllRoleEntities(allocator: CrateIdAllocator): ROCrateEntity[] {
    return this.roleAssignments.map((assignment, index) => {
      const roleId = allocator.generated('role', index)
      const roleEntity: ROCrateEntity = {
        '@id': roleId,
        '@type': 'schema:Role',
        'schema:roleName': assignment.role,
        'schema:member': { '@id': assignment.personId },
        'aac:roleContext': assignment.roleContext,
      }

      if (assignment.stageId) {
        roleEntity['aac:stageId'] = assignment.stageId
      }
      if (assignment.agentRoleContext) {
        roleEntity['aac:agentRoleContext'] = assignment.agentRoleContext
      }

      return roleEntity
    })
  }
}

/**
 * Validate date string - returns true if date is valid (year between 1000 and 3000)
 */
function isValidDate(dateStr: string | undefined): boolean {
  if (!dateStr) return false
  const year = parseInt(dateStr.split('-')[0], 10)
  return !isNaN(year) && year >= 1000 && year <= 3000
}

export interface GenerateROCrateOptions {
  benefitDisplay?: BenefitDisplayState
}

interface ExportContext {
  readonly data: CanvasData
  readonly graph: ROCrateEntity[]
  readonly rootDataset: ROCrateEntity
  readonly projectEntity: ROCrateEntity
  readonly hasPart: Array<{ '@id': string }>
  readonly personIdMap: Map<string, string>
  readonly personRegistry: PersonRegistry
  readonly idAllocator: CrateIdAllocator
  readonly entityIds: ExportEntityIds
  readonly emittedModelUris: Set<string>
  readonly nonPersonAgentRoles: NonPersonAgentRole[]
  orgCounter: number
  softwareCounter: number
}

/**
 * Establish the core crate entities and shared identity maps. Subsequent
 * section writers append to this context in document order.
 */
function createExportContext(data: CanvasData): ExportContext {
  const graph: ROCrateEntity[] = []
  const idAllocator = new CrateIdAllocator([
    'ro-crate-metadata.json',
    './',
    '#project',
    '#grant',
    '#user-plan',
    'benefit-display.json',
    'AGENTS.md',
  ])

  graph.push({
    '@id': 'ro-crate-metadata.json',
    '@type': 'schema:CreativeWork',
    conformsTo: {
      '@id': `https://w3id.org/ro/crate/${RO_CRATE_VERSION}`,
    },
    about: {
      '@id': './',
    },
  })

  const rootDataset: ROCrateEntity = {
    '@id': './',
    '@type': ['schema:Dataset', 'dcat:Dataset'],
    name: data.project.title || 'Agentic Automation Project',
    description: data.project.description,
    datePublished: new Date().toISOString().split('T')[0],
    conformsTo: { '@id': AAC_RO_CRATE_PROFILE_ID },
    'aac:schemaVersion': AAC_SCHEMA_VERSION,
  }

  if (data.project.license) {
    rootDataset.license = { '@id': data.project.license }
    graph.push({
      '@id': data.project.license,
      '@type': 'schema:CreativeWork',
      identifier: data.project.license,
    })
  }

  const projectId = generateId('project')
  rootDataset.about = { '@id': projectId }
  const hasPart: Array<{ '@id': string }> = []
  graph.push(rootDataset)

  const projectEntity: ROCrateEntity = {
    '@id': projectId,
    '@type': ['schema:Project', 'schema:ResearchProject'],
    name: data.project.title,
    description: data.project.description,
  }

  if (data.project.objective) {
    projectEntity['schema:abstract'] = data.project.objective
  }
  if (data.project.projectStage) {
    projectEntity['aac:projectStage'] = data.project.projectStage
  }
  if (data.project.startDate) {
    projectEntity.startDate = data.project.startDate
  }
  if (data.project.endDate) {
    projectEntity.endDate = data.project.endDate
  }
  if (data.project.domain && data.project.domain.length > 0) {
    projectEntity['aac:domain'] = data.project.domain
  }
  if (data.project.keywords && data.project.keywords.length > 0) {
    projectEntity.keywords = data.project.keywords
  }
  if (data.project.projectId) {
    projectEntity.identifier = data.project.projectId
  }
  if (data.project.leadOrganization) {
    projectEntity['aac:leadOrganization'] = data.project.leadOrganization
  }

  const grantId = generateId('grant')
  if (data.project.fundingGrant) {
    projectEntity['frapo:isFundedBy'] = { '@id': grantId }
  }
  if (data.project.headlineValue) {
    projectEntity['aac:headlineValue'] = data.project.headlineValue
  }
  if (data.project.primaryValueDriver) {
    projectEntity['aac:primaryValueDriver'] = data.project.primaryValueDriver
  }
  if (data.project.roughEstimateValue !== undefined) {
    projectEntity['aac:roughEstimateValue'] = data.project.roughEstimateValue
  }
  if (data.project.roughEstimateUnit) {
    projectEntity['aac:roughEstimateUnit'] = data.project.roughEstimateUnit
  }

  const version = data.project.version || data.version || '0.1.0'
  const versionDate =
    data.project.versionDate || data.versionDate || new Date().toISOString().split('T')[0]
  projectEntity['aac:version'] = version
  projectEntity['aac:versionDate'] = versionDate
  rootDataset['aac:version'] = version
  rootDataset['aac:versionDate'] = versionDate
  graph.push(projectEntity)

  if (data.project.fundingGrant) {
    graph.push({
      '@id': grantId,
      '@type': 'frapo:Grant',
      'frapo:hasGrantNumber': data.project.fundingGrant,
    })
  }

  const personIdMap = new Map<string, string>()
  const personRegistry = new PersonRegistry()
  data.persons?.forEach((person, index) => {
    const rocratePersonId = idAllocator.forCanvasId(person.id, 'person', index)
    if (!personIdMap.has(person.id)) personIdMap.set(person.id, rocratePersonId)
    personRegistry.addPerson(rocratePersonId, person)
  })
  const entityIds = allocateEntityIds(data, idAllocator)

  if (data.project.creator) {
    projectEntity.creator = data.project.creator.map((personId) => ({
      '@id': personIdMap.get(personId) ?? `#${personId}`,
    }))
  }

  return {
    data,
    graph,
    rootDataset,
    projectEntity,
    hasPart,
    personIdMap,
    personRegistry,
    idAllocator,
    entityIds,
    emittedModelUris: new Set<string>(),
    nonPersonAgentRoles: [],
    orgCounter: 0,
    softwareCounter: 0,
  }
}

function addUserExpectations(context: ExportContext): void {
  const { data, emittedModelUris, entityIds, graph, projectEntity } = context
  const requirements = data.userExpectations?.requirements
  if (!requirements?.length) return

  const planId = generateId('user-plan')
  const planStepRefs: Array<{ '@id': string }> = []

  requirements.forEach((req, index) => {
    const stepId = entityIds.requirements[index]
    planStepRefs.push({ '@id': stepId })

    const stepEntity: ROCrateEntity = {
      '@id': stepId,
      '@type': 'p-plan:Step',
      'aac:canvasId': req.id,
      name: req.title,
      description: req.description ?? '',
    }
    stepEntity['aac:title'] = req.title
    if (req.userStory) {
      stepEntity['aac:userStory'] = req.userStory
    }
    if (req.priority) {
      stepEntity.priority = req.priority
    }
    if (req.status) {
      stepEntity.status = req.status
    }
    if (req.unitOfWork) {
      stepEntity['aac:unitOfWork'] = req.unitOfWork
    }
    if (req.unitCategory) {
      stepEntity['aac:unitCategory'] = req.unitCategory
    }
    if (req.volumePerMonth !== undefined) {
      stepEntity['aac:volumePerMonth'] = req.volumePerMonth
    }
    if (req.value !== undefined) {
      stepEntity['aac:value'] = req.value
    }
    if (req.timeUnit !== undefined) {
      stepEntity['aac:timeUnit'] = req.timeUnit
    }
    if (req.targetPopulation) {
      stepEntity['aac:targetPopulation'] = req.targetPopulation
    }

    const timeBenefit = req.benefits?.find((benefit) => benefit.benefitType === 'time')
    if (timeBenefit?.oversightMinutesPerUnit !== undefined) {
      stepEntity['aac:humanOversightMinutesPerUnit'] = timeBenefit.oversightMinutesPerUnit
    }
    if (req.benefits) {
      stepEntity['aac:benefits'] = req.benefits
    }
    if (req.dependsOn) {
      stepEntity['aac:dependsOn'] = req.dependsOn
    }
    if (req.feasibility && Object.keys(req.feasibility).length > 0) {
      stepEntity['aac:feasibility'] = req.feasibility
    }

    const provUsedRefs: Array<{ '@id': string }> = []
    if (req.dataAccess?.datasetLinks && req.dataAccess.datasetLinks.length > 0) {
      stepEntity['aac:dataAccess'] = {
        ...req.dataAccess,
        datasetLinks: req.dataAccess.datasetLinks.map((link) => {
          const crateId = entityIds.datasets.byCanvasId.get(link.datasetId)
          if (!crateId) return link
          provUsedRefs.push({ '@id': crateId })
          return { ...link, datasetId: crateId.slice(1) }
        }),
      }
    }

    if (req.feasibility?.modelCardUri) {
      const modelUri = req.feasibility.modelCardUri
      stepEntity['aac:model'] = { '@id': modelUri }
      provUsedRefs.push({ '@id': modelUri })
      if (!emittedModelUris.has(modelUri)) {
        emittedModelUris.add(modelUri)
        const modelEntity: ROCrateEntity = {
          '@id': modelUri,
          '@type': 'schema:SoftwareApplication',
          'schema:applicationCategory': 'Machine Learning Model',
          'schema:url': modelUri,
        }
        if (req.feasibility.modelName) {
          modelEntity.name = req.feasibility.modelName
        }
        graph.push(modelEntity)
      }
    }

    if (provUsedRefs.length === 1) {
      stepEntity['prov:used'] = provUsedRefs[0]
    } else if (provUsedRefs.length > 1) {
      stepEntity['prov:used'] = provUsedRefs
    }
    if (req.stakeholders) {
      stepEntity['aac:stakeholders'] = req.stakeholders
    }
    graph.push(stepEntity)
  })

  graph.push({
    '@id': planId,
    '@type': ['prov:Plan', 'p-plan:Plan'],
    name: 'User Expectations Plan',
    description: 'User requirements and expectations for the automation',
    'p-plan:hasStep': planStepRefs,
  })
  projectEntity.hasPlan = { '@id': planId }
}

function addStakeholders(context: ExportContext): void {
  const { data, personIdMap, personRegistry, projectEntity } = context
  const taskStakeholderIds = new Set<string>()
  data.userExpectations?.requirements?.forEach((requirement) => {
    requirement.stakeholders?.forEach((personId) => taskStakeholderIds.add(personId))
  })
  if (taskStakeholderIds.size === 0) return

  const stakeholderRefs: Array<{ '@id': string }> = []
  taskStakeholderIds.forEach((personId) => {
    const person = data.persons?.find((candidate) => candidate.id === personId)
    if (!person) {
      console.warn(`Stakeholder references unknown person: ${personId}`)
      return
    }

    const rocratePersonId = personIdMap.get(personId)
    if (!rocratePersonId) {
      console.warn(`No RO-Crate ID mapped for person: ${personId}`)
      return
    }

    personRegistry.addRoleAssignment(rocratePersonId, 'Stakeholder', 'stakeholder')
    stakeholderRefs.push({ '@id': rocratePersonId })
  })

  if (stakeholderRefs.length > 0) {
    projectEntity.contributor = stakeholderRefs.length === 1 ? stakeholderRefs[0] : stakeholderRefs
  }
}

function addGovernance(context: ExportContext): void {
  const {
    data,
    entityIds,
    graph,
    hasPart,
    idAllocator,
    nonPersonAgentRoles,
    personIdMap,
    personRegistry,
  } = context
  const governanceStages = data.governance?.stages
  if (!governanceStages?.length) return

  const activities: Array<{ '@id': string }> = []
  governanceStages.forEach((stage, index) => {
    const activityId = entityIds.stages[index]
    activities.push({ '@id': activityId })

    const activityEntity: ROCrateEntity = {
      '@id': activityId,
      '@type': 'prov:Activity',
      name: stage.name,
      'aac:canvasId': stage.id,
    }

    if (stage.startDate) {
      activityEntity.startedAtTime = `${stage.startDate}T00:00:00Z`
    }
    if (stage.endDate) {
      activityEntity.endedAtTime = `${stage.endDate}T23:59:59Z`
    }

    if (stage.agents && stage.agents.length > 0) {
      const agentRefs = stage.agents
        .map((agent) => {
          if (agent.type === 'person') {
            if (!agent.personId) {
              console.warn('Person-type agent missing personId')
              return null
            }

            const person = data.persons?.find((candidate) => candidate.id === agent.personId)
            if (!person) {
              console.warn(`Agent references unknown person: ${agent.personId}`)
              return null
            }

            const rocratePersonId = personIdMap.get(agent.personId)
            if (!rocratePersonId) {
              console.warn(`No RO-Crate ID mapped for person: ${agent.personId}`)
              return null
            }

            if (agent.role) {
              personRegistry.addRoleAssignment(
                rocratePersonId,
                agent.role,
                'stage-agent',
                activityId,
                agent.roleContext,
              )
            }
            return { '@id': rocratePersonId }
          }

          if (!agent.name) {
            console.warn('Non-person agent missing name')
            return null
          }

          const isOrg = agent.type === 'organization'
          const agentId = isOrg
            ? idAllocator.generated('org', context.orgCounter++)
            : idAllocator.generated('software', context.softwareCounter++)
          graph.push({
            '@id': agentId,
            '@type': isOrg ? 'schema:Organization' : 'schema:SoftwareApplication',
            name: agent.name,
          })

          if (agent.role) {
            nonPersonAgentRoles.push({
              agentId,
              role: agent.role,
              stageId: activityId,
              agentRoleContext: agent.roleContext,
            })
          }
          return { '@id': agentId }
        })
        .filter((reference): reference is { '@id': string } => reference !== null)

      if (agentRefs.length > 0) {
        activityEntity.wasAssociatedWith = agentRefs.length === 1 ? agentRefs[0] : agentRefs
      }
    }

    if (stage.milestones && stage.milestones.length > 0) {
      const milestoneRefs: Array<{ '@id': string }> = []
      stage.milestones.forEach((milestone, milestoneIndex) => {
        const milestoneId = idAllocator.generated(`milestone-${index}`, milestoneIndex)
        milestoneRefs.push({ '@id': milestoneId })

        const milestoneEntity: ROCrateEntity = {
          '@id': milestoneId,
          '@type': 'schema:CreativeWork',
          name: typeof milestone === 'string' ? milestone : milestone.description,
        }
        if (typeof milestone === 'object' && milestone.kpi) {
          milestoneEntity.description = milestone.kpi
        }
        milestoneEntity['aac:milestoneType'] = 'milestone'
        graph.push(milestoneEntity)
      })
      if (milestoneRefs.length > 0) {
        activityEntity.hasMilestone =
          milestoneRefs.length === 1 ? milestoneRefs[0] : milestoneRefs
      }
    }

    if (stage.complianceStandards && stage.complianceStandards.length > 0) {
      activityEntity['aac:complianceStandard'] = stage.complianceStandards
    }
    if (stage.policyCardUri) {
      activityEntity['aac:policyCardUri'] = stage.policyCardUri
    }
    if (index > 0) {
      activityEntity.wasInformedBy = {
        '@id': entityIds.stages[index - 1],
      }
    }

    graph.push(activityEntity)
  })

  hasPart.push(...activities)
}

function addDatasets(context: ExportContext): void {
  const { data, entityIds, graph, hasPart } = context
  data.dataAccess?.datasets?.forEach((dataset, index) => {
    const datasetId = entityIds.datasets.byIndex[index]
    hasPart.push({ '@id': datasetId })

    const datasetEntity: ROCrateEntity = {
      '@id': datasetId,
      '@type': 'dcat:Dataset',
      name: dataset.title,
      description: dataset.description,
      'aac:canvasId': dataset.id,
    }
    if (dataset.format) {
      datasetEntity['schema:encodingFormat'] = dataset.format
    }
    if (dataset.license) {
      datasetEntity.license = { '@id': dataset.license }
    }
    if (dataset.accessRights) {
      datasetEntity['dct:accessRights'] = dataset.accessRights
    }
    if (dataset.pid) {
      datasetEntity.identifier = dataset.pid
    }
    if (dataset.datasetSheetUri) {
      datasetEntity['dcat:landingPage'] = { '@id': dataset.datasetSheetUri }
    }
    if (dataset.duoTerms && dataset.duoTerms.length > 0) {
      datasetEntity['dct:conformsTo'] = dataset.duoTerms.map((term) => ({ '@id': term }))
    }
    if (dataset.containsPersonalData !== undefined) {
      datasetEntity['aac:containsPersonalData'] = dataset.containsPersonalData
    }
    if (dataset.publisher) {
      datasetEntity['schema:publisher'] = dataset.publisher
    }
    if (dataset.sensitivityLevel) {
      datasetEntity['aac:sensitivityLevel'] = dataset.sensitivityLevel
    }
    graph.push(datasetEntity)
  })
}

function addOutcomes(context: ExportContext): void {
  const { data, entityIds, graph, hasPart, personIdMap } = context

  data.outcomes?.deliverables
    ?.filter((deliverable) => deliverable.title && deliverable.title.trim())
    .forEach((deliverable, index) => {
      const outcomeId = entityIds.deliverables[index]
      hasPart.push({ '@id': outcomeId })

      const outcomeEntity: ROCrateEntity = {
        '@id': outcomeId,
        '@type': deliverable.type ? `schema:${deliverable.type}` : 'schema:CreativeWork',
        'aac:outcomeType': 'deliverable',
        'aac:canvasId': deliverable.id,
        name: deliverable.title,
        description: deliverable.description,
      }
      if (deliverable.date && isValidDate(deliverable.date)) {
        outcomeEntity.datePublished = deliverable.date
      }
      if (deliverable.pid) {
        outcomeEntity.identifier = deliverable.pid
      }

      const governanceStages = data.governance?.stages
      if (governanceStages?.length) {
        const lastStageIndex = governanceStages.length - 1
        outcomeEntity.wasGeneratedBy = {
          '@id': entityIds.stages[lastStageIndex],
        }
      }
      graph.push(outcomeEntity)
    })

  data.outcomes?.publications?.forEach((publication, index) => {
    const publicationId = entityIds.publications[index]
    hasPart.push({ '@id': publicationId })

    const publicationEntity: ROCrateEntity = {
      '@id': publicationId,
      '@type': 'schema:ScholarlyArticle',
      name: publication.title,
      'aac:canvasId': publication.id,
    }
    if (publication.doi) {
      publicationEntity.identifier = publication.doi
    }
    if (publication.authors && publication.authors.length > 0) {
      publicationEntity.author = publication.authors.map((author) => {
        if (author.type === 'person' && author.personId) {
          const person = data.persons?.find((candidate) => candidate.id === author.personId)
          return {
            '@type': 'schema:Person',
            name: person?.name || author.personId,
            '@id': personIdMap.get(author.personId) ?? `#${author.personId}`,
          }
        }
        return { '@type': 'schema:Organization', name: author.name || '' }
      })
    }
    if (publication.date && isValidDate(publication.date)) {
      publicationEntity.datePublished = publication.date
    }
    graph.push(publicationEntity)
  })

  data.outcomes?.evaluations?.forEach((evaluation, index) => {
    const evaluationId = entityIds.evaluations[index]
    hasPart.push({ '@id': evaluationId })

    const evaluationEntity: ROCrateEntity = {
      '@id': evaluationId,
      '@type': 'schema:CreativeWork',
      name: evaluation.type,
      description: evaluation.results,
      'aac:evaluationType': evaluation.type,
      'aac:canvasId': evaluation.id,
    }
    if (evaluation.date && isValidDate(evaluation.date)) {
      evaluationEntity.datePublished = evaluation.date
    }
    if (evaluation.metrics !== undefined) {
      evaluationEntity['aac:metrics'] = evaluation.metrics
    }
    graph.push(evaluationEntity)
  })
}

function addAuxiliaryFiles(context: ExportContext, options?: GenerateROCrateOptions): void {
  const { data, graph, hasPart, rootDataset } = context
  if (data.developerFeasibility && Object.keys(data.developerFeasibility).length > 0) {
    rootDataset['aac:developerFeasibility'] = data.developerFeasibility
  }

  const hasBenefitDisplay =
    (options?.benefitDisplay?.displayGroups?.length ?? 0) > 0 ||
    (options?.benefitDisplay?.displayGroupCount != null &&
      options.benefitDisplay.displayGroupCount !== 5)
  if (hasBenefitDisplay) {
    const benefitDisplayFileId = 'benefit-display.json'
    hasPart.push({ '@id': benefitDisplayFileId })
    graph.push({
      '@id': benefitDisplayFileId,
      '@type': 'schema:File',
      name: 'Benefit display groups',
      description: 'UI display groups for dashboard (which benefits to show together)',
      'schema:encodingFormat': 'application/json',
    })
  }

  const agentInstructionsFileId = 'AGENTS.md'
  hasPart.push({ '@id': agentInstructionsFileId })
  graph.push({
    '@id': agentInstructionsFileId,
    '@type': 'schema:File',
    name: 'Agent instructions',
    description: 'AI coding agent instructions derived from the AAC canvas specification',
    'schema:encodingFormat': 'text/markdown',
  })
}

function finalizeGraph(context: ExportContext): void {
  const {
    graph,
    hasPart,
    idAllocator,
    nonPersonAgentRoles,
    personRegistry,
    rootDataset,
  } = context
  if (hasPart.length > 0) {
    rootDataset.hasPart = hasPart
  }

  graph.push(...personRegistry.getAllPersonEntities())
  graph.push(...personRegistry.getAllRoleEntities(idAllocator))

  nonPersonAgentRoles.forEach((agentRole, index) => {
    const roleEntity: ROCrateEntity = {
      '@id': idAllocator.generated('agent-role', index),
      '@type': 'schema:Role',
      'schema:roleName': agentRole.role,
      'schema:member': { '@id': agentRole.agentId },
      'aac:roleContext': 'stage-agent',
      'aac:stageId': agentRole.stageId,
    }
    if (agentRole.agentRoleContext) {
      roleEntity['aac:agentRoleContext'] = agentRole.agentRoleContext
    }
    graph.push(roleEntity)
  })
}

function buildCrateDocument(context: ExportContext): ROCrateJSONLD {
  const jsonLdContext: (string | Record<string, string>)[] = [
    RO_CRATE_CONTEXT,
    {
      schema: 'https://schema.org/',
      prov: 'http://www.w3.org/ns/prov#',
      'p-plan': 'http://purl.org/net/p-plan#',
      dct: 'http://purl.org/dc/terms/',
      dcat: 'http://www.w3.org/ns/dcat#',
      frapo: 'http://purl.org/cerif/frapo/',
      aac: 'https://w3id.org/aac/schema/',
    },
  ]

  return {
    '@context': jsonLdContext,
    '@graph': context.graph,
  }
}

/**
 * Generate RO-Crate JSON-LD from canvas data
 */
export function generateROCrate(data: CanvasData, options?: GenerateROCrateOptions): ROCrateJSONLD {
  assertCurrentCanvas(data)

  const context = createExportContext(data)
  addUserExpectations(context)
  addStakeholders(context)
  addGovernance(context)
  addDatasets(context)
  addOutcomes(context)
  addAuxiliaryFiles(context, options)
  finalizeGraph(context)

  return buildCrateDocument(context)
}
