/**
 * RO-Crate JSON-LD generator
 * Following RO-Crate 1.2 specification with Schema.org, DCAT, PROV-O, FRAPO mappings
 */

import type { CanvasData, Benefit } from '@/types/canvas'
import type { BenefitDisplayState } from '@/types/benefitDisplay'
import type { ROCrateJSONLD, ROCrateEntity } from '@/types/rocrate'

/**
 * Validation error for export
 */
export interface ExportValidationError {
  path: string
  message: string
  severity: 'error' | 'warning'
}

/**
 * Validate a benefit object for export
 */
function validateBenefit(benefit: Benefit, requirementId: string, benefitIndex: number): ExportValidationError[] {
  const errors: ExportValidationError[] = []
  const path = `requirements[${requirementId}].benefits[${benefitIndex}]`

  // Required fields
  if (!benefit.direction) {
    errors.push({
      path: `${path}.direction`,
      message: `Benefit missing required 'direction' field. Expected one of: increaseIsBetter, decreaseIsBetter, targetIsBetter, boolIsBetter`,
      severity: 'error'
    })
  }

  if (!benefit.valueMeaning) {
    errors.push({
      path: `${path}.valueMeaning`,
      message: `Benefit missing required 'valueMeaning' field. Expected one of: absolute, delta`,
      severity: 'error'
    })
  }

  // If direction is targetIsBetter, target must be present
  if (benefit.direction === 'targetIsBetter' && benefit.target === undefined) {
    errors.push({
      path: `${path}.target`,
      message: `Benefit with direction 'targetIsBetter' must have a 'target' value`,
      severity: 'error'
    })
  }

  // Note: Baseline and expected can have different types (e.g. numeric, categorical, binary).

  return errors
}

/**
 * Validate canvas data before RO-Crate export
 * Returns array of validation errors. If any error has severity 'error', export should be blocked.
 */
export function validateForExport(data: CanvasData): ExportValidationError[] {
  const errors: ExportValidationError[] = []

  // Validate all benefits in requirements
  if (data.userExpectations?.requirements) {
    data.userExpectations.requirements.forEach((req, reqIndex) => {
      if (req.benefits && req.benefits.length > 0) {
        req.benefits.forEach((benefit, benefitIndex) => {
          errors.push(...validateBenefit(benefit, req.id || `${reqIndex}`, benefitIndex))
        })
      }
    })
  }

  return errors
}

/**
 * Check if export should be blocked based on validation errors
 */
export function hasBlockingErrors(errors: ExportValidationError[]): boolean {
  return errors.some(e => e.severity === 'error')
}

/**
 * Generate a unique ID for an entity
 */
function generateId(prefix: string, index?: number): string {
  return index !== undefined ? `#${prefix}-${index}` : `#${prefix}`
}

/**
 * Person identity for deduplication
 */
interface PersonIdentity {
  name: string
  orcid?: string
  affiliation?: string
}

/**
 * Role assignment for a person
 */
interface RoleAssignment {
  personId: string
  role: string
  roleContext: 'stakeholder' | 'stage-agent' | 'task-agent'
  stageId?: string // For stage-agent context
}

/**
 * Person registry entry
 */
interface PersonRegistryEntry {
  id: string
  identity: PersonIdentity
  entity: ROCrateEntity
}

/**
 * Person Registry for deduplication within a crate
 * Stores persons and their role assignments separately for clean export
 */
class PersonRegistry {
  private persons: Map<string, PersonRegistryEntry> = new Map()
  private roleAssignments: RoleAssignment[] = []
  private personCounter = 0

  /**
   * Normalize name for comparison (lowercase, trim)
   */
  private normalizeName(name: string): string {
    return name.trim().toLowerCase()
  }

  /**
   * Generate a key for exact matching (ORCID or name+affiliation)
   */
  private getMatchKey(identity: PersonIdentity): string | null {
    if (identity.orcid) {
      return `orcid:${identity.orcid.toLowerCase().trim()}`
    }
    const normalizedName = this.normalizeName(identity.name)
    if (identity.affiliation) {
      return `name+affiliation:${normalizedName}:${identity.affiliation.trim().toLowerCase()}`
    }
    return null
  }

  /**
   * Find existing person by exact match (ORCID or name+affiliation)
   */
  private findExactMatch(identity: PersonIdentity): PersonRegistryEntry | null {
    const matchKey = this.getMatchKey(identity)
    if (!matchKey) return null

    for (const entry of this.persons.values()) {
      const entryKey = this.getMatchKey(entry.identity)
      if (entryKey === matchKey) {
        return entry
      }
    }
    return null
  }

  /**
   * Find existing person by soft match (name only, no conflicting context)
   */
  private findSoftMatch(identity: PersonIdentity): PersonRegistryEntry | null {
    const normalizedName = this.normalizeName(identity.name)
    
    // Only soft match if no ORCID or affiliation provided
    if (identity.orcid || identity.affiliation) {
      return null
    }

    for (const entry of this.persons.values()) {
      const entryNormalizedName = this.normalizeName(entry.identity.name)
      // Soft match: same name, and existing entry also has no ORCID/affiliation
      if (entryNormalizedName === normalizedName && 
          !entry.identity.orcid && 
          !entry.identity.affiliation) {
        return entry
      }
    }
    return null
  }

  /**
   * Add a role assignment for a person
   */
  addRoleAssignment(
    personId: string,
    role: string,
    roleContext: 'stakeholder' | 'stage-agent' | 'task-agent',
    stageId?: string
  ): void {
    // Avoid duplicate role assignments
    const exists = this.roleAssignments.some(
      ra => ra.personId === personId && ra.role === role && ra.roleContext === roleContext && ra.stageId === stageId
    )
    if (!exists) {
      this.roleAssignments.push({ personId, role, roleContext, stageId })
    }
  }

  /**
   * Find or create a Person entity with a specific ID
   * Used when we have a predefined Person ID from the centralized persons array
   */
  findOrCreatePersonWithId(
    personId: string,
    identity: PersonIdentity
  ): string {
    // Check if person already exists with this ID
    const entry = this.persons.get(personId)
    
    if (entry) {
      return entry.id
    }

    // Create new Person entity with specified ID (identity-only, no roles embedded)
    const personEntity: ROCrateEntity = {
      '@id': personId,
      '@type': 'schema:Person',
      name: identity.name,
    }

    // Add optional fields
    if (identity.affiliation) {
      personEntity['schema:affiliation'] = identity.affiliation
    }
    if (identity.orcid) {
      personEntity['schema:identifier'] = identity.orcid
    }

    this.persons.set(personId, {
      id: personId,
      identity,
      entity: personEntity,
    })

    return personId
  }

  /**
   * Find or create a Person entity
   * Returns the Person ID
   */
  findOrCreatePerson(
    identity: PersonIdentity
  ): string {
    // Try exact match first (ORCID or name+affiliation)
    let entry = this.findExactMatch(identity)
    
    // If no exact match, try soft match (name only)
    if (!entry) {
      entry = this.findSoftMatch(identity)
    }

    if (entry) {
      return entry.id
    }

    // Create new Person entity (identity-only, no roles embedded)
    const personId = generateId('person', this.personCounter++)
    const personEntity: ROCrateEntity = {
      '@id': personId,
      '@type': 'schema:Person',
      name: identity.name,
    }

    // Add optional fields
    if (identity.affiliation) {
      personEntity['schema:affiliation'] = identity.affiliation
    }
    if (identity.orcid) {
      personEntity['schema:identifier'] = identity.orcid
    }

    this.persons.set(personId, {
      id: personId,
      identity,
      entity: personEntity,
    })

    return personId
  }

  /**
   * Validate Person deduplication
   * Returns array of validation warnings/errors
   */
  validate(): Array<{ type: 'warning' | 'error'; message: string; personId?: string }> {
    const issues: Array<{ type: 'warning' | 'error'; message: string; personId?: string }> = []
    
    // Check for potential duplicates (same name, different context)
    const nameMap = new Map<string, PersonRegistryEntry[]>()
    for (const entry of this.persons.values()) {
      const normalizedName = this.normalizeName(entry.identity.name)
      if (!nameMap.has(normalizedName)) {
        nameMap.set(normalizedName, [])
      }
      nameMap.get(normalizedName)!.push(entry)
    }

    // Warn if same name appears with different contexts (potential duplicates)
    for (const [, entries] of nameMap.entries()) {
      if (entries.length > 1) {
        // Check if they have different ORCIDs or affiliations
        const hasDifferentContexts = entries.some((e1, i) => 
          entries.slice(i + 1).some(e2 => 
            e1.identity.orcid !== e2.identity.orcid ||
            e1.identity.affiliation !== e2.identity.affiliation
          )
        )
        
        if (hasDifferentContexts) {
          // This is actually fine - they're different people with same name
          // But we could warn if they don't have disambiguation
          const withoutDisambiguation = entries.filter(e => !e.identity.orcid && !e.identity.affiliation)
          if (withoutDisambiguation.length > 1) {
            issues.push({
              type: 'warning',
              message: `Multiple persons with name "${entries[0].identity.name}" without disambiguation (ORCID or affiliation). Consider adding disambiguation fields.`,
            })
          }
        }
      }
    }

    return issues
  }

  /**
   * Get all Person entities for the graph (identity-only, no roles embedded)
   */
  getAllPersonEntities(): ROCrateEntity[] {
    return Array.from(this.persons.values()).map(entry => ({ ...entry.entity }))
  }

  /**
   * Get all Role entities for the graph
   * Creates schema:Role nodes for each role assignment
   */
  getAllRoleEntities(): ROCrateEntity[] {
    return this.roleAssignments.map((assignment, index) => {
      const roleId = generateId('role', index)
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
  /** Schema version at export time (for import mismatch warning) */
  schemaVersion?: string
}

/**
 * Generate RO-Crate JSON-LD from canvas data
 */
export function generateROCrate(data: CanvasData, options?: GenerateROCrateOptions): ROCrateJSONLD {
  const graph: ROCrateEntity[] = []

  // 1. RO-Crate Metadata File Descriptor
  graph.push({
    '@id': 'ro-crate-metadata.json',
    '@type': 'schema:CreativeWork',
    conformsTo: {
      '@id': 'https://w3id.org/ro/crate/1.2',
    },
    about: {
      '@id': './',
    },
  })

  // 2. Root Dataset
  const rootDataset: ROCrateEntity = {
    '@id': './',
    '@type': ['schema:Dataset', 'dcat:Dataset'],
    name: data.project.title || 'Agentic Automation Project',
    description: data.project.description,
    datePublished: new Date().toISOString().split('T')[0],
  }

  // Optional license on root dataset (RO-Crate 1.2 SHOULD)
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

  // 3. Project Entity (Schema.org + FRAPO)
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
  // Project-level value summary
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
  // Version management
  const version = data.project.version || data.version || '0.1.0'
  const versionDate = data.project.versionDate || data.versionDate || new Date().toISOString().split('T')[0]
  projectEntity['aac:version'] = version
  projectEntity['aac:versionDate'] = versionDate
  // Also add to root dataset for easy access
  rootDataset['aac:version'] = version
  rootDataset['aac:versionDate'] = versionDate
  if (options?.schemaVersion) {
    rootDataset['aac:schemaVersion'] = options.schemaVersion
  }

  graph.push(projectEntity)

  // Initialize Person registry for deduplication
  // Map canvas personId to RO-Crate personId
  const personIdMap = new Map<string, string>() // canvas personId -> RO-Crate personId
  const personRegistry = new PersonRegistry()
  
  // Pre-register persons from centralized persons array
  if (data.persons && data.persons.length > 0) {
    data.persons.forEach((person, index) => {
      // Generate RO-Crate Person ID (opaque, e.g., #person-0, #person-1)
      const rocratePersonId = generateId('person', index)
      personIdMap.set(person.id, rocratePersonId)
      
      // Pre-register person in registry (identity-only)
      personRegistry.findOrCreatePersonWithId(
        rocratePersonId,
        {
          name: person.name,
          orcid: person.orcid,
          affiliation: person.affiliation,
        }
      )
    })
  }

  // Track emitted model URIs for deduplication
  const emittedModelUris = new Set<string>()

  // 4. User Expectations as P-Plan
  if (data.userExpectations?.requirements && data.userExpectations.requirements.length > 0) {
    const planId = generateId('user-plan')
    const planStepRefs: Array<{ '@id': string }> = []

    data.userExpectations.requirements.forEach((req, index) => {
      // Preserve req.id so display-group benefitRefs resolve after import (e.g. dev crate uses req-time, req-time-2)
      const stepId =
        req.id && /^[\w-]+$/.test(req.id) ? `#${req.id}` : generateId('requirement', index)
      planStepRefs.push({ '@id': stepId })

      // Add step entity with value model - define once in graph
      const stepEntity: ROCrateEntity = {
        '@id': stepId,
        '@type': 'p-plan:Step',
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
      // Value model fields
      if (req.unitOfWork) {
        stepEntity['aac:unitOfWork'] = req.unitOfWork
      }
      if (req.unitCategory) {
        stepEntity['aac:unitCategory'] = req.unitCategory
      }
      if (req.volumePerMonth !== undefined) {
        stepEntity['aac:volumePerMonth'] = req.volumePerMonth
      }
      // Export oversight from first time benefit (for backward compatibility)
      // RO-Crate uses 'humanOversightMinutesPerUnit' for backward compatibility with older crates
      const timeBenefit = req.benefits?.find(b => b.benefitType === 'time')
      if (timeBenefit?.oversightMinutesPerUnit !== undefined) {
        stepEntity['aac:humanOversightMinutesPerUnit'] = timeBenefit.oversightMinutesPerUnit
      }
      // Benefits array - generalized benefit tracking
      if (req.benefits && req.benefits.length > 0) {
        stepEntity['aac:benefits'] = req.benefits
      }
      if (req.dependsOn && req.dependsOn.length > 0) {
        stepEntity['aac:dependsOn'] = req.dependsOn
      }
      if (req.feasibility && Object.keys(req.feasibility).length > 0) {
        stepEntity['aac:feasibility'] = req.feasibility
      }
      // Emit SoftwareApplication entity for model card URI; link step to model via PROV
      if (req.feasibility?.modelCardUri) {
        const modelUri = req.feasibility.modelCardUri
        stepEntity['aac:model'] = { '@id': modelUri }
        stepEntity['prov:used'] = { '@id': modelUri }
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
      if (req.stakeholders && req.stakeholders.length > 0) {
        stepEntity['aac:stakeholders'] = req.stakeholders
      }
      graph.push(stepEntity)
    })

    const planEntity: ROCrateEntity = {
      '@id': planId,
      '@type': ['prov:Plan', 'p-plan:Plan'],
      name: 'User Expectations Plan',
      description: 'User requirements and expectations for the automation',
      'p-plan:hasStep': planStepRefs,
    }

    graph.push(planEntity)
    projectEntity.hasPlan = { '@id': planId }
  }

  // 4b. Stakeholders - collect from tasks (per-task stakeholders)
  // Collect all unique person IDs from task stakeholders
  const taskStakeholderIds = new Set<string>()
  if (data.userExpectations?.requirements) {
    data.userExpectations.requirements.forEach((req) => {
      if (req.stakeholders) {
        req.stakeholders.forEach((personId) => taskStakeholderIds.add(personId))
      }
    })
  }
  
  if (taskStakeholderIds.size > 0) {
    const stakeholderRefs: Array<{ '@id': string }> = []
    taskStakeholderIds.forEach((personId) => {
      // Find person by personId
      const person = data.persons?.find(p => p.id === personId)
      if (!person) {
        console.warn(`Stakeholder references unknown person: ${personId}`)
        return
      }
      
      // Get RO-Crate Person ID from map
      const rocratePersonId = personIdMap.get(personId)
      if (!rocratePersonId) {
        console.warn(`No RO-Crate ID mapped for person: ${personId}`)
        return
      }
      
      // Ensure Person entity exists in registry (identity-only)
      personRegistry.findOrCreatePersonWithId(
        rocratePersonId,
        {
          name: person.name,
          orcid: person.orcid,
          affiliation: person.affiliation,
        }
      )
      
      // Note: Per-task stakeholders don't have roles, but we can still create a generic stakeholder role
      // for backward compatibility with RO-Crate format
      personRegistry.addRoleAssignment(rocratePersonId, 'Stakeholder', 'stakeholder')
      
      stakeholderRefs.push({ '@id': rocratePersonId })
    })
    
    // Link stakeholders to project
    if (stakeholderRefs.length > 0) {
      projectEntity.contributor = stakeholderRefs.length === 1 ? stakeholderRefs[0] : stakeholderRefs
    }
  }

  // 5. Governance Stages as PROV-O Activities
  // Track non-person agent entities and their roles
  let orgCounter = 0
  let softwareCounter = 0
  interface NonPersonAgentRole {
    agentId: string
    role: string
    stageId: string
  }
  const nonPersonAgentRoles: NonPersonAgentRole[] = []

  if (data.governance?.stages && data.governance.stages.length > 0) {
    const activities: Array<{ '@id': string }> = []

    data.governance.stages.forEach((stage, index) => {
      const activityId = generateId('stage', index)
      activities.push({ '@id': activityId })

      const activityEntity: ROCrateEntity = {
        '@id': activityId,
        '@type': 'prov:Activity',
        name: stage.name,
      }

      if (stage.startDate) {
        activityEntity.startedAtTime = `${stage.startDate}T00:00:00Z`
      }
      if (stage.endDate) {
        activityEntity.endedAtTime = `${stage.endDate}T23:59:59Z`
      }

      // Link agents - use Person registry for person-type agents
      if (stage.agents && stage.agents.length > 0) {
        const agentRefs = stage.agents.map((agent) => {
          if (agent.type === 'person') {
            // Find person by personId
            if (!agent.personId) {
              console.warn(`Person-type agent missing personId`)
              return null
            }
            
            const person = data.persons?.find(p => p.id === agent.personId)
            if (!person) {
              console.warn(`Agent references unknown person: ${agent.personId}`)
              return null
            }
            
            // Get RO-Crate Person ID from map
            const rocratePersonId = personIdMap.get(agent.personId)
            if (!rocratePersonId) {
              console.warn(`No RO-Crate ID mapped for person: ${agent.personId}`)
              return null
            }
            
            // Ensure Person entity exists in registry (identity-only)
            personRegistry.findOrCreatePersonWithId(
              rocratePersonId,
              {
                name: person.name,
                orcid: person.orcid,
                affiliation: person.affiliation,
              }
            )
            
            // Add role assignment separately (will create schema:Role node)
            if (agent.role) {
              personRegistry.addRoleAssignment(rocratePersonId, agent.role, 'stage-agent', activityId)
            }
            
            return { '@id': rocratePersonId }
          } else {
            // Non-person agents (organization, software) - create separate entities with proper IDs
            if (!agent.name) {
              console.warn(`Non-person agent missing name`)
              return null
            }
            
            // Use consistent ID format: #org-N or #software-N
            const isOrg = agent.type === 'organization'
            const agentId = isOrg 
              ? generateId('org', orgCounter++)
              : generateId('software', softwareCounter++)
            
            const agentEntity: ROCrateEntity = {
              '@id': agentId,
              '@type': isOrg ? 'schema:Organization' : 'schema:SoftwareApplication',
              name: agent.name,
            }
            // No role embedded - roles are separate entities
            graph.push(agentEntity)
            
            // Track role for creating Role node later
            if (agent.role) {
              nonPersonAgentRoles.push({
                agentId,
                role: agent.role,
                stageId: activityId,
              })
            }
            
            return { '@id': agentId }
          }
        }).filter((ref): ref is { '@id': string } => ref !== null)
        if (agentRefs.length > 0) {
          activityEntity.wasAssociatedWith = agentRefs.length === 1 ? agentRefs[0] : agentRefs
        }
      }

      // Add milestones
      if (stage.milestones && stage.milestones.length > 0) {
        const milestoneRefs: Array<{ '@id': string }> = []
        stage.milestones.forEach((milestone, milestoneIndex) => {
          const milestoneId = generateId(`milestone-${index}`, milestoneIndex)
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
          activityEntity.hasMilestone = milestoneRefs.length === 1 ? milestoneRefs[0] : milestoneRefs
        }
      }

      // Add compliance standards (strings or structured objects)
      if (stage.complianceStandards && stage.complianceStandards.length > 0) {
        activityEntity['aac:complianceStandard'] = stage.complianceStandards
      }

      // Add Policy Card URI
      if (stage.policyCardUri) {
        activityEntity['aac:policyCardUri'] = stage.policyCardUri
      }

      // Link to previous stage
      if (index > 0) {
        activityEntity.wasInformedBy = { '@id': generateId('stage', index - 1) }
      }

      graph.push(activityEntity)
    })

    rootDataset.hasPart = [...hasPart, ...activities]
  }

  // 6. Datasets (DCAT)
  if (data.dataAccess?.datasets && data.dataAccess.datasets.length > 0) {
    data.dataAccess.datasets.forEach((dataset, index) => {
      const datasetId = generateId('dataset', index)
      hasPart.push({ '@id': datasetId })

      const datasetEntity: ROCrateEntity = {
        '@id': datasetId,
        '@type': 'dcat:Dataset',
        name: dataset.title,
        description: dataset.description,
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
        datasetEntity['dct:conformsTo'] = dataset.duoTerms.map(term => ({ '@id': term }))
      }
      if (dataset.containsPersonalData !== undefined) {
        datasetEntity['aac:containsPersonalData'] = dataset.containsPersonalData
      }

      graph.push(datasetEntity)
    })
  }

  // 7. Outcomes (FRAPO deliverables, CreativeWork)
  if (data.outcomes?.deliverables && data.outcomes.deliverables.length > 0) {
    data.outcomes.deliverables
      .filter((deliverable) => deliverable.title && deliverable.title.trim()) // Only include deliverables with titles
      .forEach((deliverable, index) => {
        const outcomeId = generateId('outcome', index)
        hasPart.push({ '@id': outcomeId })

        const outcomeEntity: ROCrateEntity = {
          '@id': outcomeId,
          '@type': deliverable.type ? `schema:${deliverable.type}` : 'schema:CreativeWork',
          'aac:outcomeType': 'deliverable',
          name: deliverable.title,
          description: deliverable.description,
        }

        if (deliverable.date && isValidDate(deliverable.date)) {
          outcomeEntity.datePublished = deliverable.date
        }
        if (deliverable.pid) {
          outcomeEntity.identifier = deliverable.pid
        }

        // Link to generating activity if available
        if (data.governance?.stages && data.governance.stages.length > 0) {
          const lastStageId = generateId('stage', data.governance.stages.length - 1)
          outcomeEntity.wasGeneratedBy = { '@id': lastStageId }
        }

        graph.push(outcomeEntity)
      })
  }

  if (data.outcomes?.publications && data.outcomes.publications.length > 0) {
    data.outcomes.publications.forEach((pub, index) => {
      const pubId = generateId('publication', index)
      hasPart.push({ '@id': pubId })

      const pubEntity: ROCrateEntity = {
        '@id': pubId,
        '@type': 'schema:ScholarlyArticle',
        name: pub.title,
      }

      if (pub.doi) {
        pubEntity.identifier = pub.doi
      }
      if (pub.authors && pub.authors.length > 0) {
        pubEntity.author = pub.authors.map(name => ({ '@type': 'schema:Person', name }))
      }
      if (pub.date && isValidDate(pub.date)) {
        pubEntity.datePublished = pub.date
      }

      graph.push(pubEntity)
    })
  }

  // 7c. Evaluations
  if (data.outcomes?.evaluations && data.outcomes.evaluations.length > 0) {
    data.outcomes.evaluations.forEach((evaluation, index) => {
      const evalId = generateId('evaluation', index)
      hasPart.push({ '@id': evalId })

      const evalEntity: ROCrateEntity = {
        '@id': evalId,
        '@type': 'schema:CreativeWork',
        name: evaluation.type,
        description: evaluation.results,
        'aac:evaluationType': evaluation.type,
      }

      if (evaluation.date && isValidDate(evaluation.date)) {
        evalEntity.datePublished = evaluation.date
      }

      graph.push(evalEntity)
    })
  }

  // Embed developer feasibility in root dataset (first-rate membership in main graph)
  if (data.developerFeasibility && Object.keys(data.developerFeasibility).length > 0) {
    rootDataset['aac:developerFeasibility'] = data.developerFeasibility
  }

  // Add benefit-display.json as first-class file entity if present (UI display groups)
  const hasBenefitDisplay =
    (options?.benefitDisplay?.displayGroups?.length ?? 0) > 0 ||
    (options?.benefitDisplay?.displayGroupCount != null && options.benefitDisplay.displayGroupCount !== 5)
  if (hasBenefitDisplay) {
    const benefitDisplayFileId = 'benefit-display.json'
    hasPart.push({ '@id': benefitDisplayFileId })
    const benefitDisplayFileEntity: ROCrateEntity = {
      '@id': benefitDisplayFileId,
      '@type': 'schema:File',
      name: 'Benefit display groups',
      description: 'UI display groups for dashboard (which benefits to show together)',
      'schema:encodingFormat': 'application/json',
    }
    graph.push(benefitDisplayFileEntity)
  }

  // Add AGENTS.md as first-class file entity (AI coding agent instructions)
  const agentInstructionsFileId = 'AGENTS.md'
  hasPart.push({ '@id': agentInstructionsFileId })
  graph.push({
    '@id': agentInstructionsFileId,
    '@type': 'schema:File',
    name: 'Agent instructions',
    description: 'AI coding agent instructions derived from the AAC canvas specification',
    'schema:encodingFormat': 'text/markdown',
  } as ROCrateEntity)

  // Update root dataset hasPart
  if (hasPart.length > 0) {
    rootDataset.hasPart = hasPart
  }

  // Add all Person entities from registry to graph (identity-only, no roles embedded)
  const personEntities = personRegistry.getAllPersonEntities()
  personEntities.forEach(personEntity => {
    graph.push(personEntity)
  })

  // Add all Role entities from registry to graph (separate schema:Role nodes)
  const roleEntities = personRegistry.getAllRoleEntities()
  roleEntities.forEach(roleEntity => {
    graph.push(roleEntity)
  })

  // Add Role entities for non-person agents (organizations, software)
  nonPersonAgentRoles.forEach((agentRole, index) => {
    const roleId = generateId('agent-role', index)
    const roleEntity: ROCrateEntity = {
      '@id': roleId,
      '@type': 'schema:Role',
      'schema:roleName': agentRole.role,
      'schema:member': { '@id': agentRole.agentId },
      'aac:roleContext': 'stage-agent',
      'aac:stageId': agentRole.stageId,
    }
    graph.push(roleEntity)
  })

  // Extended @context with all required prefixes
  const context: (string | Record<string, string>)[] = [
    'https://w3id.org/ro/crate/1.2/context',
    {
      schema: 'https://schema.org/',
      prov: 'http://www.w3.org/ns/prov#',
      'p-plan': 'http://purl.org/net/p-plan#',
      dct: 'http://purl.org/dc/terms/',
      dcat: 'http://www.w3.org/ns/dcat#',
      aac: 'https://github.com/slolab/agentic-automation-canvas/schema/',
    },
  ]

  return {
    '@context': context,
    '@graph': graph,
  }
}
