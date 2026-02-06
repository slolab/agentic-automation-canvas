/**
 * RO-Crate import functionality
 * Parses RO-Crate JSON-LD back to canvas data format
 */

import JSZip from 'jszip'
import type { ROCrateJSONLD, ROCrateEntity } from '@/types/rocrate'
import type { CanvasData } from '@/types/canvas'
import type { BenefitDisplayState } from '@/types/benefitDisplay'
import { normalizeCanvasData } from '@/utils/migrate'

/**
 * Find entity by ID in RO-Crate graph
 */
function findEntity(graph: ROCrateEntity[], id: string): ROCrateEntity | undefined {
  return graph.find((entity) => entity['@id'] === id)
}

/**
 * Find entities by type in RO-Crate graph
 */
function findEntitiesByType(graph: ROCrateEntity[], type: string | string[]): ROCrateEntity[] {
  const types = Array.isArray(type) ? type : [type]
  return graph.filter((entity) => {
    const entityTypes = Array.isArray(entity['@type']) ? entity['@type'] : [entity['@type']]
    return types.some((t) => entityTypes.includes(t))
  })
}

/**
 * Parse RO-Crate JSON-LD to canvas data
 */
export function parseROCrateToCanvas(rocrate: ROCrateJSONLD): CanvasData {
  const graph = rocrate['@graph']
  const canvasData: CanvasData = {
    project: {
      title: '',
      description: '',
    },
  }

  // Find project entity
  const projectEntity = findEntitiesByType(graph, ['Project', 'ResearchProject', 'schema:Project', 'schema:ResearchProject'])[0]
  if (projectEntity) {
    canvasData.project = {
      title: (projectEntity.name as string) || '',
      description: (projectEntity.description as string) || '',
      objective: (projectEntity['schema:abstract'] as string) || (projectEntity.about as string) || undefined,
      projectStage: (projectEntity['aac:projectStage'] as string) || undefined,
      startDate: (projectEntity.startDate as string) || undefined,
      endDate: (projectEntity.endDate as string) || undefined,
      domain: Array.isArray(projectEntity['aac:domain'])
        ? projectEntity['aac:domain'] as string[]
        : projectEntity['aac:domain']
          ? [projectEntity['aac:domain'] as string]
          : Array.isArray(projectEntity.domain)
            ? projectEntity.domain as string[]
            : projectEntity.domain
              ? [projectEntity.domain as string]
              : undefined,
      keywords: Array.isArray(projectEntity.keywords)
        ? projectEntity.keywords as string[]
        : projectEntity.keywords
          ? [projectEntity.keywords as string]
          : undefined,
      projectId: (projectEntity.identifier as string) || undefined,
      headlineValue: (projectEntity['aac:headlineValue'] as string) || undefined,
      primaryValueDriver: (projectEntity['aac:primaryValueDriver'] as 'time' | 'quality' | 'risk' | 'enablement') || undefined,
      roughEstimateValue: (projectEntity['aac:roughEstimateValue'] as number) ?? undefined,
      roughEstimateUnit: (projectEntity['aac:roughEstimateUnit'] as string) || undefined,
      version: (projectEntity['aac:version'] as string) || undefined,
      versionDate: (projectEntity['aac:versionDate'] as string) || undefined,
    }
  }

  // Extract version from root dataset if not found in project entity
  const rootDataset = findEntity(graph, './')
  if (rootDataset) {
    if (!canvasData.project.version && (rootDataset['aac:version'] as string)) {
      canvasData.project.version = rootDataset['aac:version'] as string
    }
    if (!canvasData.project.versionDate && (rootDataset['aac:versionDate'] as string)) {
      canvasData.project.versionDate = rootDataset['aac:versionDate'] as string
    }
    if (rootDataset['aac:developerFeasibility']) {
      canvasData.developerFeasibility = rootDataset['aac:developerFeasibility'] as CanvasData['developerFeasibility']
    }
  }

  // Set version at root level for consistency
  if (canvasData.project.version) {
    canvasData.version = canvasData.project.version
  }
  // Always set versionDate to today's date when importing (download date)
  const today = new Date().toISOString().split('T')[0]
  canvasData.versionDate = today
  canvasData.project.versionDate = today

  // Find user expectations plan (P-Plan) - handle both prefixed and non-prefixed types
  const planEntity = findEntitiesByType(graph, ['Plan', 'p-plan:Plan', 'prov:Plan'])[0]
  if (planEntity) {
    const steps = (planEntity['p-plan:hasStep'] as Array<{ '@id': string }>) || []
    const requirements = steps
      .map((stepRef) => findEntity(graph, stepRef['@id']))
      .filter((step) => step !== undefined)
      .map((step) => {
        const stepDesc = (step!.description as string) || ''
        const stepName = (step!.name as string) || ''
        const aacTitle = step!['aac:title'] as string | undefined
        const aacUserStory = step!['aac:userStory'] as string | undefined
        const req: any = {
          id: step!['@id'].replace('#', ''),
          title: aacTitle || stepDesc || stepName || '',
          description: stepDesc || undefined,
          userStory: aacUserStory ?? (stepName && stepName !== (aacTitle || stepDesc) ? stepName : undefined),
          priority: (step!.priority as 'low' | 'medium' | 'high' | 'critical' | undefined) || undefined,
          status: (step!.status as 'planned' | 'in-progress' | 'completed' | 'cancelled' | undefined) || undefined,
          benefits: [], // Always initialize benefits array
        }
        // Parse value model fields
        if (step!['aac:unitOfWork']) {
          req.unitOfWork = step!['aac:unitOfWork'] as string
        }
        if (step!['aac:volumePerMonth'] !== undefined) {
          req.volumePerMonth = step!['aac:volumePerMonth'] as number
        }
        // Migrate old requirement-level oversight to first time benefit
        // Map RO-Crate field name (aac:humanOversightMinutesPerUnit) to internal schema field name (oversightMinutesPerUnit)
        if (step!['aac:humanOversightMinutesPerUnit'] !== undefined) {
          const oversightValue = step!['aac:humanOversightMinutesPerUnit'] as number
          // Find first time benefit and add oversight
          if (req.benefits && req.benefits.length > 0) {
            const firstTimeBenefitIndex = req.benefits.findIndex(b => b.benefitType === 'time')
            if (firstTimeBenefitIndex >= 0) {
              req.benefits[firstTimeBenefitIndex] = {
                ...req.benefits[firstTimeBenefitIndex],
                oversightMinutesPerUnit: oversightValue
              }
            }
          }
        }
        if (step!['aac:unitCategory']) {
          req.unitCategory = step!['aac:unitCategory'] as 'item' | 'interaction' | 'computation' | 'other'
        }
        // Parse benefits array
        if (step!['aac:benefits'] && Array.isArray(step!['aac:benefits'])) {
          req.benefits = step!['aac:benefits']
        }
        if (step!['aac:dependsOn'] && Array.isArray(step!['aac:dependsOn'])) {
          req.dependsOn = step!['aac:dependsOn'] as string[]
        }
        if (step!['aac:feasibility'] && typeof step!['aac:feasibility'] === 'object') {
          req.feasibility = step!['aac:feasibility'] as import('@/types/canvas').RequirementFeasibility
        }
        return req
      })

    if (requirements.length > 0) {
      canvasData.userExpectations = {
        requirements,
      }
    }
  }

  // Collect all Person entities from graph and create centralized persons array
  const personEntities = findEntitiesByType(graph, ['Person', 'schema:Person'])
  const personMap = new Map<string, ROCrateEntity>()
  personEntities.forEach(person => {
    personMap.set(person['@id'], person)
  })

  // Create centralized persons array from Person entities
  const persons: Array<{ id: string; name: string; affiliation?: string; orcid?: string }> = []
  personEntities.forEach((personEntity) => {
    const affiliation = personEntity['schema:affiliation']
      ? (typeof personEntity['schema:affiliation'] === 'string' 
          ? personEntity['schema:affiliation'] 
          : undefined)
      : undefined
    
    const identifier = personEntity['schema:identifier']
    const orcid = identifier 
      ? (typeof identifier === 'string' ? identifier : (identifier as { '@id': string })['@id'])
      : undefined

    // Extract Person ID (remove # prefix if present)
    const personId = personEntity['@id'].replace('#', '')
    
    persons.push({
      id: personId,
      name: (personEntity.name as string) || '',
      affiliation,
      orcid,
    })
  })

  // Store persons array in canvasData
  if (persons.length > 0) {
    canvasData.persons = persons
  }

  // Find all schema:Role entities and build a map of personId -> role info
  const roleEntities = findEntitiesByType(graph, ['Role', 'schema:Role'])
  interface RoleInfo {
    role: string
    roleContext: string
    stageId?: string
  }
  const personRolesMap = new Map<string, RoleInfo[]>()
  
  roleEntities.forEach((roleEntity) => {
    const memberRef = roleEntity['schema:member'] as { '@id': string } | undefined
    if (!memberRef || !memberRef['@id']) return
    
    const personId = memberRef['@id']
    const roleName = (roleEntity['schema:roleName'] as string) || ''
    const roleContext = (roleEntity['aac:roleContext'] as string) || 'stakeholder'
    const stageId = roleEntity['aac:stageId'] as string | undefined
    
    if (!personRolesMap.has(personId)) {
      personRolesMap.set(personId, [])
    }
    personRolesMap.get(personId)!.push({ role: roleName, roleContext, stageId })
  })

  // Helper function to extract Person data (for legacy formats with embedded roles)
  const extractPersonData = (personEntity: ROCrateEntity) => {
    // First check for roles from schema:Role nodes
    const rolesFromRoleNodes = personRolesMap.get(personEntity['@id']) || []
    
    // Also check for legacy embedded roles
    const legacyRoles = personEntity['aac:roles'] 
      ? (Array.isArray(personEntity['aac:roles']) ? personEntity['aac:roles'] : [personEntity['aac:roles']])
      : []
    
    const affiliation = personEntity['schema:affiliation']
      ? (typeof personEntity['schema:affiliation'] === 'string' 
          ? personEntity['schema:affiliation'] 
          : undefined)
      : undefined
    
    const identifier = personEntity['schema:identifier']
    const orcid = identifier 
      ? (typeof identifier === 'string' ? identifier : (identifier as { '@id': string })['@id'])
      : undefined

    return {
      name: (personEntity.name as string) || '',
      roles: legacyRoles,
      rolesFromNodes: rolesFromRoleNodes,
      affiliation,
      orcid,
      roleContext: personEntity['aac:roleContext'] as string | undefined,
    }
  }

  // Find stakeholders (contributors to project)
  if (projectEntity && projectEntity.contributor) {
    const contributorRefs = Array.isArray(projectEntity.contributor) 
      ? projectEntity.contributor 
      : [projectEntity.contributor]
    
    const stakeholders = contributorRefs
      .map((ref: any) => {
        const entity = findEntity(graph, ref['@id'])
        if (!entity) return null
        
        const entityType = Array.isArray(entity['@type'])
          ? entity['@type'][0]
          : entity['@type']
        // Handle both prefixed and non-prefixed Person type
        const normalizedType = entityType?.replace('schema:', '') || entityType
        if (normalizedType !== 'Person') return null

        const personData = extractPersonData(entity)
        // Extract Person ID (remove # prefix if present)
        const personId = entity['@id'].replace('#', '')
        
        // Get role from schema:Role nodes (prefer stakeholder context) or legacy embedded roles
        const stakeholderRolesFromNodes = personData.rolesFromNodes
          .filter(r => r.roleContext === 'stakeholder')
          .map(r => r.role)
        
        // Use role from Role nodes first, then legacy embedded roles
        const roles = stakeholderRolesFromNodes.length > 0 
          ? stakeholderRolesFromNodes 
          : personData.roles.filter(r => r !== 'stakeholder')
        const primaryRole = roles.length > 0 ? roles[0] : undefined
        
        return {
          personId: personId,
          role: primaryRole,
        }
      })
      .filter((stakeholder): stakeholder is NonNullable<typeof stakeholder> => stakeholder !== null)

    if (stakeholders.length > 0) {
      if (!canvasData.userExpectations) {
        canvasData.userExpectations = {}
      }
      canvasData.userExpectations.stakeholders = stakeholders
    }
  }

  // Find governance stages (PROV-O Activities) - handle both prefixed and non-prefixed types
  const activityEntities = findEntitiesByType(graph, ['Activity', 'prov:Activity'])
  
  // Collect milestone IDs to exclude them from deliverables (do this before processing stages)
  const milestoneIds = new Set<string>()
  activityEntities.forEach((activity) => {
    const milestonesRef = activity.hasMilestone
    if (milestonesRef) {
      const milestoneRefs = Array.isArray(milestonesRef) ? milestonesRef : [milestonesRef]
      milestoneRefs.forEach((ref: any) => {
        milestoneIds.add(ref['@id'])
      })
    }
  })
  
  if (activityEntities.length > 0) {
    const stages = activityEntities.map((activity) => {
      const stage: any = {
        id: activity['@id'].replace('#', ''),
        name: (activity.name as string) || '',
      }

      if (activity.startedAtTime) {
        stage.startDate = (activity.startedAtTime as string).split('T')[0]
      }
      if (activity.endedAtTime) {
        stage.endDate = (activity.endedAtTime as string).split('T')[0]
      }

      // Extract agents
      const agentsRef = activity.wasAssociatedWith
      if (agentsRef) {
        const agentRefs = Array.isArray(agentsRef) ? agentsRef : [agentsRef]
        stage.agents = agentRefs
          .map((ref) => findEntity(graph, ref['@id']))
          .filter((agent) => agent !== undefined)
          .map((agent) => {
            const agentType = Array.isArray(agent!['@type'])
              ? agent!['@type'][0]
              : agent!['@type']
            // Handle both prefixed and non-prefixed types
            const normalizedType = agentType?.replace('schema:', '') || agentType
            
            if (normalizedType === 'Person') {
              // Extract Person ID (remove # prefix if present)
              const personId = agent!['@id'].replace('#', '')
              const fullPersonId = agent!['@id']
              
              // Ensure person exists in persons array
              const existingPerson = persons.find(p => p.id === personId)
              if (!existingPerson) {
                const personData = extractPersonData(agent!)
                persons.push({
                  id: personId,
                  name: personData.name,
                  affiliation: personData.affiliation,
                  orcid: personData.orcid,
                })
              }
              
              // Get role from schema:Role nodes (prefer stage-agent context for this activity)
              const stageAgentRolesFromNodes = (personRolesMap.get(fullPersonId) || [])
                .filter(r => r.roleContext === 'stage-agent' && r.stageId === activity['@id'])
                .map(r => r.role)
              
              // Fall back to any stage-agent role, then legacy embedded roles
              const anyStageAgentRoles = stageAgentRolesFromNodes.length > 0 
                ? stageAgentRolesFromNodes
                : (personRolesMap.get(fullPersonId) || [])
                    .filter(r => r.roleContext === 'stage-agent')
                    .map(r => r.role)
              
              // Extract role from aac:roles array or role property (legacy)
              const legacyRoles = agent!['aac:roles']
                ? (Array.isArray(agent!['aac:roles']) ? agent!['aac:roles'] : [agent!['aac:roles']])
                : agent!.role
                  ? [agent!.role as string]
                  : []
              
              // Prefer roles from Role nodes, then legacy
              const roles = anyStageAgentRoles.length > 0 ? anyStageAgentRoles : legacyRoles
              
              // Filter out roles that are just 'stakeholder' or 'agent' defaults
              const meaningfulRoles = roles.filter(r => r !== 'stakeholder' && r !== 'agent')
              const primaryRole = meaningfulRoles.length > 0 ? meaningfulRoles[0] : roles[0]
              
              return {
                personId: personId,
                role: primaryRole,
                type: 'person' as const,
              }
            } else {
              // Non-person agents (organization, software)
              return {
                name: (agent!.name as string) || '',
                role: (agent!.role as string) || undefined,
                type:
                  normalizedType === 'Organization'
                    ? 'organization' as const
                    : 'software' as const,
              }
            }
          })
      }

      // Extract milestones
      const milestonesRef = activity.hasMilestone
      if (milestonesRef) {
        const milestoneRefs = Array.isArray(milestonesRef) ? milestonesRef : [milestonesRef]
        stage.milestones = milestoneRefs
          .map((ref: any) => findEntity(graph, ref['@id']))
          .filter((milestone) => milestone !== undefined)
          .map((milestone) => ({
            description: (milestone!.name as string) || '',
            kpi: (milestone!.description as string) || undefined,
          }))
      }

      // Extract compliance standards (handle both old and new property names)
      const complianceStandard = activity['aac:complianceStandard'] || activity.complianceStandard
      if (complianceStandard) {
        stage.complianceStandards = Array.isArray(complianceStandard)
          ? complianceStandard as string[]
          : [complianceStandard as string]
      }

      return stage
    })

    if (stages.length > 0) {
      canvasData.governance = { stages }
    }
  }

  // Find datasets (DCAT) - handle both prefixed and non-prefixed types
  const datasetEntities = findEntitiesByType(graph, ['Dataset', 'dcat:Dataset', 'schema:Dataset']).filter(
    (entity) => entity['@id'] !== './'
  )
  if (datasetEntities.length > 0) {
    const datasets = datasetEntities.map((dataset) => {
      const format = dataset['schema:encodingFormat']
      const accessRights = dataset['dct:accessRights']
      const duoTerms = dataset['dct:conformsTo']
      const containsPersonalData = dataset['aac:containsPersonalData'] !== undefined
        ? dataset['aac:containsPersonalData']
        : dataset.containsPersonalData
      
      return {
        id: dataset['@id'].replace('#', ''),
        title: (dataset.name as string) || '',
        description: (dataset.description as string) || undefined,
        format: format as string | undefined,
        license: typeof dataset.license === 'object' && dataset.license !== null && '@id' in dataset.license
          ? (dataset.license as { '@id': string })['@id']
          : (dataset.license as string) || undefined,
        accessRights:
          typeof accessRights === 'string'
            ? (accessRights as any)
            : undefined,
        pid: (dataset.identifier as string) || undefined,
        duoTerms: duoTerms
          ? (Array.isArray(duoTerms) 
              ? duoTerms.map((term: any) => typeof term === 'object' && term !== null && '@id' in term ? term['@id'] : term)
              : [typeof duoTerms === 'object' && duoTerms !== null && '@id' in duoTerms 
                  ? (duoTerms as { '@id': string })['@id'] 
                  : duoTerms as string])
          : undefined,
        containsPersonalData: containsPersonalData !== undefined 
          ? (containsPersonalData as boolean)
          : undefined,
      }
    })

    if (datasets.length > 0) {
      canvasData.dataAccess = { datasets }
    }
  }

  // Find outcomes (CreativeWork, ScholarlyArticle) - handle both prefixed and non-prefixed types
  // Exclude metadata file descriptor, milestones, evaluations, and other non-outcome CreativeWorks
  const creativeWorkEntities = findEntitiesByType(graph, [
    'CreativeWork',
    'ScholarlyArticle',
    'Report',
    'schema:CreativeWork',
    'schema:ScholarlyArticle',
    'schema:Report',
  ]).filter((entity) => {
    // Exclude metadata file descriptor
    if (entity['@id'] === 'ro-crate-metadata.json') {
      return false
    }
    // Exclude file entities (they're referenced but not outcomes)
    if (entity['@id'] === 'benefit-display.json') {
      return false
    }
    // Exclude milestones (they're linked via hasMilestone or have aac:milestoneType)
    if (milestoneIds.has(entity['@id']) || entity['aac:milestoneType'] === 'milestone') {
      return false
    }
    // Exclude evaluations (they have aac:evaluationType)
    if (entity['aac:evaluationType']) {
      return false
    }
    // Only include entities that have a name (title) - real outcomes should have names
    return !!(entity.name as string)?.trim()
  })

  if (creativeWorkEntities.length > 0) {
    const deliverables: any[] = []
    const publications: any[] = []

    creativeWorkEntities.forEach((entity) => {
      const entityType = Array.isArray(entity['@type']) ? entity['@type'][0] : entity['@type']
      // Handle both prefixed and non-prefixed types
      const normalizedType = entityType?.replace('schema:', '') || entityType
      const isPublication = normalizedType === 'ScholarlyArticle'
      const title = (entity.name as string) || ''

      // Skip if no title
      if (!title.trim()) {
        return
      }

      const outcome = {
        id: entity['@id'].replace('#', ''),
        title: title,
        description: (entity.description as string) || undefined,
        date: (entity.datePublished as string) || undefined,
        pid: (entity.identifier as string) || undefined,
      }

      if (isPublication) {
        publications.push({
          ...outcome,
          doi: outcome.pid,
          authors: Array.isArray(entity.author)
            ? entity.author.map((a: any) => a.name).filter(Boolean)
            : [],
        })
      } else {
        deliverables.push({
          ...outcome,
          type: normalizedType || 'Deliverable',
        })
      }
    })

    if (deliverables.length > 0 || publications.length > 0) {
      canvasData.outcomes = {}
      if (deliverables.length > 0) {
        canvasData.outcomes.deliverables = deliverables
      }
      if (publications.length > 0) {
        canvasData.outcomes.publications = publications
      }
    }
  }

  // Find evaluations - handle both old Evaluation type and new CreativeWork with aac:evaluationType
  const evaluationEntitiesOld = findEntitiesByType(graph, 'Evaluation')
  const evaluationEntitiesNew = findEntitiesByType(graph, ['CreativeWork', 'schema:CreativeWork'])
    .filter((e) => e['aac:evaluationType'] && e['@id'] !== 'ro-crate-metadata.json')
  const evaluationEntities = [...evaluationEntitiesOld, ...evaluationEntitiesNew]
  
  if (evaluationEntities.length > 0) {
    const evaluations = evaluationEntities.map((evaluation) => ({
      id: evaluation['@id'].replace('#', ''),
      type: (evaluation['aac:evaluationType'] as string) || (evaluation.name as string) || '',
      results: (evaluation.description as string) || undefined,
      date: (evaluation.datePublished as string) || undefined,
    }))

    if (evaluations.length > 0) {
      if (!canvasData.outcomes) {
        canvasData.outcomes = {}
      }
      canvasData.outcomes.evaluations = evaluations
    }
  }

  return canvasData
}

/**
 * Import RO-Crate from JSON-LD (direct JSON file)
 */
export async function importROCrateFromJSON(rocrate: ROCrateJSONLD): Promise<CanvasData> {
  // Validate it's a valid RO-Crate
  if (!rocrate['@context'] || !rocrate['@graph']) {
    throw new Error('Invalid RO-Crate format: missing @context or @graph')
  }

  return parseROCrateToCanvas(rocrate)
}

/**
 * Import RO-Crate from ZIP file
 */
export interface ImportROCrateResult {
  canvasData: CanvasData
  benefitDisplay?: BenefitDisplayState
  /** Schema version of the crate (from aac:schemaVersion in root dataset) */
  crateSchemaVersion?: string
  /** Warnings from migration/normalization (e.g. description→title, unitCategory mapping) */
  migrationWarnings?: string[]
}

export async function importROCrateFromZip(file: File): Promise<ImportROCrateResult> {
  try {
    const zip = await JSZip.loadAsync(file)
    const metadataFile = zip.file('ro-crate-metadata.json')

    if (!metadataFile) {
      throw new Error('ro-crate-metadata.json not found in ZIP file')
    }

    const metadataContent = await metadataFile.async('string')
    const rocrate: ROCrateJSONLD = JSON.parse(metadataContent)

    const rootDataset = rocrate['@graph']?.find((e: ROCrateEntity) => e['@id'] === './')
    const crateSchemaVersion = rootDataset?.['aac:schemaVersion'] as string | undefined

    let canvasData = await importROCrateFromJSON(rocrate)
    const { data: normalizedData, warnings: migrationWarnings } = normalizeCanvasData(canvasData)
    canvasData = normalizedData

    let benefitDisplay: BenefitDisplayState | undefined
    const benefitDisplayFile = zip.file('benefit-display.json')
    if (benefitDisplayFile) {
      try {
        const content = await benefitDisplayFile.async('string')
        const parsed = JSON.parse(content)
        if (parsed && Array.isArray(parsed.displayGroups)) {
          benefitDisplay = {
            displayGroups: parsed.displayGroups,
            displayGroupCount: parsed.displayGroupCount,
          }
        }
      } catch (error) {
        console.warn('Failed to parse benefit-display.json:', error)
      }
    }

    return { canvasData, benefitDisplay, crateSchemaVersion, migrationWarnings }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to import RO-Crate: ${error.message}`)
    }
    throw new Error('Failed to import RO-Crate: Unknown error')
  }
}
