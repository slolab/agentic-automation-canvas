/**
 * RO-Crate JSON-LD generator
 * Following RO-Crate 1.1 specification with Schema.org, DCAT, PROV-O, FRAPO mappings
 */

import type { CanvasData } from '@/types/canvas'
import type { ROCrateJSONLD, ROCrateEntity } from '@/types/rocrate'

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
 * Person registry entry
 */
interface PersonRegistryEntry {
  id: string
  identity: PersonIdentity
  roles: Set<string>
  roleContexts: Map<string, string> // role -> roleContext
  entity: ROCrateEntity
}

/**
 * Person Registry for deduplication within a crate
 */
class PersonRegistry {
  private persons: Map<string, PersonRegistryEntry> = new Map()
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
   * Find or create a Person entity with a specific ID
   * Used when we have a predefined Person ID from the centralized persons array
   */
  findOrCreatePersonWithId(
    personId: string,
    identity: PersonIdentity,
    role: string | undefined,
    roleContext?: string
  ): string {
    // Check if person already exists with this ID
    let entry = this.persons.get(personId)
    
    if (entry) {
      // Person exists - add role if provided
      if (role) {
        entry.roles.add(role)
        if (roleContext) {
          entry.roleContexts.set(role, roleContext)
        }
      }
      return entry.id
    }

    // Create new Person entity with specified ID
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

    // Create registry entry
    const rolesSet = new Set<string>()
    const roleContextsMap = new Map<string, string>()
    if (role) {
      rolesSet.add(role)
      if (roleContext) {
        roleContextsMap.set(role, roleContext)
      }
    }

    entry = {
      id: personId,
      identity,
      roles: rolesSet,
      roleContexts: roleContextsMap,
      entity: personEntity,
    }

    this.persons.set(personId, entry)
    return personId
  }

  /**
   * Find or create a Person entity
   * Returns the Person ID
   */
  findOrCreatePerson(
    identity: PersonIdentity,
    role: string | undefined,
    roleContext?: string
  ): string {
    // Try exact match first (ORCID or name+affiliation)
    let entry = this.findExactMatch(identity)
    
    // If no exact match, try soft match (name only)
    if (!entry) {
      entry = this.findSoftMatch(identity)
    }

    if (entry) {
      // Add role if provided
      if (role) {
        entry.roles.add(role)
        if (roleContext) {
          entry.roleContexts.set(role, roleContext)
        }
      }
      return entry.id
    }

    // Create new Person entity
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

    // Create registry entry
    const rolesSet = new Set<string>()
    const roleContextsMap = new Map<string, string>()
    if (role) {
      rolesSet.add(role)
      if (roleContext) {
        roleContextsMap.set(role, roleContext)
      }
    }

    entry = {
      id: personId,
      identity,
      roles: rolesSet,
      roleContexts: roleContextsMap,
      entity: personEntity,
    }

    this.persons.set(personId, entry)
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
   * Get all Person entities for the graph
   */
  getAllPersonEntities(): ROCrateEntity[] {
    return Array.from(this.persons.values()).map(entry => {
      const entity = { ...entry.entity }
      
      // Add roles array
      if (entry.roles.size > 0) {
        entity['aac:roles'] = Array.from(entry.roles)
        // Set role to first role if only one
        if (entry.roles.size === 1) {
          entity.role = Array.from(entry.roles)[0]
        }
      }

      // Add role contexts if any
      if (entry.roleContexts.size > 0) {
        // Store role contexts as a map or array
        // For simplicity, we'll store as a single roleContext if there's only one context
        const contexts = Array.from(entry.roleContexts.values())
        if (contexts.length === 1) {
          entity['aac:roleContext'] = contexts[0]
        } else if (contexts.length > 1) {
          // Multiple contexts - store as array
          entity['aac:roleContext'] = contexts
        }
      }

      return entity
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

/**
 * Generate RO-Crate JSON-LD from canvas data
 */
export function generateROCrate(data: CanvasData): ROCrateJSONLD {
  const graph: ROCrateEntity[] = []

  // 1. RO-Crate Metadata File Descriptor
  graph.push({
    '@id': 'ro-crate-metadata.json',
    '@type': 'schema:CreativeWork',
    conformsTo: {
      '@id': 'https://w3id.org/ro/crate/1.1',
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
  if (data.project.aggregateBenefitValue !== undefined) {
    projectEntity['aac:aggregateBenefitValue'] = data.project.aggregateBenefitValue
  }
  if (data.project.aggregateBenefitUnit) {
    projectEntity['aac:aggregateBenefitUnit'] = data.project.aggregateBenefitUnit
  }
  if (data.project.primaryValueDriver) {
    projectEntity['aac:primaryValueDriver'] = data.project.primaryValueDriver
  }
  // Version management
  const version = data.project.version || data.version || '0.1.0'
  const versionDate = data.project.versionDate || data.versionDate || new Date().toISOString().split('T')[0]
  projectEntity['aac:version'] = version
  projectEntity['aac:versionDate'] = versionDate
  // Also add to root dataset for easy access
  rootDataset['aac:version'] = version
  rootDataset['aac:versionDate'] = versionDate

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
      
      // Pre-register person in registry
      personRegistry.findOrCreatePersonWithId(
        rocratePersonId,
        {
          name: person.name,
          orcid: person.orcid,
          affiliation: person.affiliation,
        },
        undefined, // No role yet
        undefined // No role context yet
      )
    })
  }

  // 4. User Expectations as P-Plan
  if (data.userExpectations?.requirements && data.userExpectations.requirements.length > 0) {
    const planId = generateId('user-plan')
    const planStepRefs: Array<{ '@id': string }> = []

    data.userExpectations.requirements.forEach((req, index) => {
      const stepId = generateId('requirement', index)
      planStepRefs.push({ '@id': stepId })

      // Add step entity with value model - define once in graph
      const stepEntity: ROCrateEntity = {
        '@id': stepId,
        '@type': 'p-plan:Step',
        description: req.description,
      }
      if (req.userStory) {
        stepEntity.name = req.userStory
      }
      if (req.priority) {
        stepEntity.priority = req.priority
      }
      if (req.status) {
        stepEntity.status = req.status
      }
      // Value model fields (M0 - required)
      if (req.unitOfWork) {
        stepEntity['aac:unitOfWork'] = req.unitOfWork
      }
      if (req.unitCategory) {
        stepEntity['aac:unitCategory'] = req.unitCategory
      }
      if (req.volumePerMonth !== undefined) {
        stepEntity['aac:volumePerMonth'] = req.volumePerMonth
      }
      if (req.baselineMinutesPerUnit !== undefined) {
        stepEntity['aac:baselineMinutesPerUnit'] = req.baselineMinutesPerUnit
      }
      if (req.timeSavedMinutesPerUnit) {
        stepEntity['aac:timeSavedMinutesPerUnit'] = req.timeSavedMinutesPerUnit
        // Compute netTimeSavedMinutesPerUnit if we have likely and oversight
        if (req.timeSavedMinutesPerUnit.likely !== undefined && req.humanOversightMinutesPerUnit !== undefined) {
          const netTimeSaved = req.timeSavedMinutesPerUnit.likely - req.humanOversightMinutesPerUnit
          stepEntity['aac:netTimeSavedMinutesPerUnit'] = netTimeSaved
        }
      }
      if (req.valueType && req.valueType.length > 0) {
        stepEntity['aac:valueType'] = req.valueType
      }
      // Value model fields (M1/M2 - optional)
      if (req.reworkRate !== undefined) {
        stepEntity['aac:reworkRate'] = req.reworkRate
      }
      if (req.errorCost !== undefined) {
        stepEntity['aac:errorCost'] = req.errorCost
      }
      if (req.humanOversightMinutesPerUnit !== undefined) {
        stepEntity['aac:humanOversightMinutesPerUnit'] = req.humanOversightMinutesPerUnit
        // Recompute netTimeSavedMinutesPerUnit if we have timeSaved
        if (req.timeSavedMinutesPerUnit?.likely !== undefined) {
          const netTimeSaved = req.timeSavedMinutesPerUnit.likely - req.humanOversightMinutesPerUnit
          stepEntity['aac:netTimeSavedMinutesPerUnit'] = netTimeSaved
        }
      }
      if (req.confidenceUser) {
        stepEntity['aac:confidenceUser'] = req.confidenceUser
      }
      if (req.confidenceDev) {
        stepEntity['aac:confidenceDev'] = req.confidenceDev
      }
      if (req.assumptions) {
        stepEntity['aac:assumptions'] = req.assumptions
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

  // 4b. Stakeholders - use Person registry for deduplication
  if (data.userExpectations?.stakeholders && data.userExpectations.stakeholders.length > 0) {
    const stakeholderRefs: Array<{ '@id': string }> = []
    data.userExpectations.stakeholders.forEach((stakeholder) => {
      // Find person by personId
      const person = data.persons?.find(p => p.id === stakeholder.personId)
      if (!person) {
        console.warn(`Stakeholder references unknown person: ${stakeholder.personId}`)
        return
      }
      
      // Get RO-Crate Person ID from map
      const rocratePersonId = personIdMap.get(stakeholder.personId)
      if (!rocratePersonId) {
        console.warn(`No RO-Crate ID mapped for person: ${stakeholder.personId}`)
        return
      }
      
      // Find or create Person entity through registry (will reuse if already exists)
      personRegistry.findOrCreatePersonWithId(
        rocratePersonId,
        {
          name: person.name,
          orcid: person.orcid,
          affiliation: person.affiliation,
        },
        stakeholder.role || 'stakeholder',
        stakeholder.roleContext
      )
      stakeholderRefs.push({ '@id': rocratePersonId })
    })
    
    // Link stakeholders to project
    if (stakeholderRefs.length > 0) {
      projectEntity.contributor = stakeholderRefs.length === 1 ? stakeholderRefs[0] : stakeholderRefs
    }
  }

  // 5. Governance Stages as PROV-O Activities
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
        const agentRefs = stage.agents.map((agent, agentIndex) => {
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
            
            // Use Person registry for deduplication (will reuse if already exists)
            // rocratePersonId is guaranteed to be defined here due to check above
            personRegistry.findOrCreatePersonWithId(
              rocratePersonId,
              {
                name: person.name,
                orcid: person.orcid,
                affiliation: person.affiliation,
              },
              agent.role || undefined,
              agent.roleContext
            )
            return { '@id': rocratePersonId }
          } else {
            // Non-person agents (organization, software) - create separate entities
            if (!agent.name) {
              console.warn(`Non-person agent missing name`)
              return null
            }
            const agentId = generateId(`agent-${index}`, agentIndex)
            const agentEntity: ROCrateEntity = {
              '@id': agentId,
              '@type': agent.type === 'organization' ? 'schema:Organization' : 'schema:SoftwareApplication',
              name: agent.name,
            }
            if (agent.role) {
              agentEntity.role = agent.role
            }
            graph.push(agentEntity)
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

      // Add compliance standards
      if (stage.complianceStandards && stage.complianceStandards.length > 0) {
        activityEntity['aac:complianceStandard'] = stage.complianceStandards
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

  // Add developer-feasibility.json as first-class file entity if present
  if (data.developerFeasibility && Object.keys(data.developerFeasibility).length > 0) {
    const feasibilityFileId = 'developer-feasibility.json'
    hasPart.push({ '@id': feasibilityFileId })
    
    // Add file entity to graph
    const feasibilityFileEntity: ROCrateEntity = {
      '@id': feasibilityFileId,
      '@type': 'schema:File',
      name: 'Developer Feasibility Assessment',
      description: 'Technical feasibility assessment including Technology Readiness Level (TRL), risk assessment, and technology choices',
      'schema:encodingFormat': 'application/json',
    }
    graph.push(feasibilityFileEntity)
  }

  // Update root dataset hasPart
  if (hasPart.length > 0) {
    rootDataset.hasPart = hasPart
  }

  // Add all Person entities from registry to graph
  const personEntities = personRegistry.getAllPersonEntities()
  personEntities.forEach(personEntity => {
    graph.push(personEntity)
  })

  // Extended @context with all required prefixes
  const context: (string | Record<string, string>)[] = [
    'https://w3id.org/ro/crate/1.1/context',
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
