/**
 * RO-Crate import functionality
 * Parses RO-Crate JSON-LD back to canvas data format
 */

import JSZip from 'jszip'
import type { ROCrateJSONLD, ROCrateEntity } from '@/types/rocrate'
import type { CanvasData } from '@/types/canvas'

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

  // Find project entity (handle both prefixed and non-prefixed types for backward compatibility)
  const projectEntity = findEntitiesByType(graph, ['Project', 'ResearchProject', 'schema:Project', 'schema:ResearchProject'])[0]
  if (projectEntity) {
    canvasData.project = {
      title: (projectEntity.name as string) || '',
      description: (projectEntity.description as string) || '',
      objective: (projectEntity.about as string) || undefined,
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
      aggregateExpectedHoursSavedPerMonth: (projectEntity['aac:aggregateExpectedHoursSavedPerMonth'] as number) || undefined,
      primaryValueDriver: (projectEntity['aac:primaryValueDriver'] as 'time' | 'quality' | 'risk' | 'enablement') || undefined,
    }
  }

  // Find user expectations plan (P-Plan) - handle both prefixed and non-prefixed types
  const planEntity = findEntitiesByType(graph, ['Plan', 'p-plan:Plan', 'prov:Plan'])[0]
  if (planEntity) {
    const steps = (planEntity['p-plan:hasStep'] as Array<{ '@id': string }>) || []
    const requirements = steps
      .map((stepRef) => findEntity(graph, stepRef['@id']))
      .filter((step) => step !== undefined)
      .map((step) => {
        const req: any = {
          id: step!['@id'].replace('#', ''),
          description: (step!.description as string) || '',
          userStory: (step!.name as string) || undefined,
          priority: (step!.priority as 'low' | 'medium' | 'high' | 'critical' | undefined) || undefined,
          status: (step!.status as 'planned' | 'in-progress' | 'completed' | 'cancelled' | undefined) || undefined,
        }
        // Parse value model fields
        if (step!['aac:unitOfWork']) {
          req.unitOfWork = step!['aac:unitOfWork'] as string
        }
        if (step!['aac:volumePerMonth'] !== undefined) {
          req.volumePerMonth = step!['aac:volumePerMonth'] as number
        }
        if (step!['aac:baselineMinutesPerUnit'] !== undefined) {
          req.baselineMinutesPerUnit = step!['aac:baselineMinutesPerUnit']
        }
        if (step!['aac:timeSavedMinutesPerUnit']) {
          req.timeSavedMinutesPerUnit = step!['aac:timeSavedMinutesPerUnit'] as { best: number; likely: number; worst: number }
        }
        if (step!['aac:valueType']) {
          req.valueType = step!['aac:valueType'] as Array<'time' | 'quality' | 'risk' | 'enablement'>
        }
        if (step!['aac:reworkRate'] !== undefined) {
          req.reworkRate = step!['aac:reworkRate'] as number
        }
        if (step!['aac:errorCost'] !== undefined) {
          req.errorCost = step!['aac:errorCost']
        }
        if (step!['aac:oversightMinutesPerUnit'] !== undefined) {
          req.oversightMinutesPerUnit = step!['aac:oversightMinutesPerUnit'] as number
        }
        if (step!['aac:confidenceUser']) {
          req.confidenceUser = step!['aac:confidenceUser'] as 'low' | 'medium' | 'high'
        }
        if (step!['aac:confidenceDev']) {
          req.confidenceDev = step!['aac:confidenceDev'] as 'low' | 'medium' | 'high'
        }
        if (step!['aac:assumptions']) {
          req.assumptions = step!['aac:assumptions'] as string
        }
        return req
      })

    if (requirements.length > 0) {
      canvasData.userExpectations = {
        requirements,
      }
    }
  }

  // Find stakeholders (contributors to project)
  if (projectEntity && projectEntity.contributor) {
    const contributorRefs = Array.isArray(projectEntity.contributor) 
      ? projectEntity.contributor 
      : [projectEntity.contributor]
    
    const stakeholders = contributorRefs
      .map((ref: any) => findEntity(graph, ref['@id']))
      .filter((entity) => {
        if (!entity) return false
        const entityType = Array.isArray(entity['@type'])
          ? entity['@type'][0]
          : entity['@type']
        // Handle both prefixed and non-prefixed Person type
        const normalizedType = entityType?.replace('schema:', '') || entityType
        return normalizedType === 'Person'
      })
      .map((entity) => ({
        name: (entity!.name as string) || '',
        role: (entity!.role as string) || undefined,
      }))

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
            return {
              name: (agent!.name as string) || '',
              role: (agent!.role as string) || undefined,
              type:
                normalizedType === 'Person'
                  ? 'person'
                  : normalizedType === 'Organization'
                    ? 'organization'
                    : 'software',
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
      // Handle both old and new property names for backward compatibility
      const format = dataset['schema:encodingFormat'] || dataset.format
      const accessRights = dataset['dct:accessRights'] || dataset.accessRights
      const duoTerms = dataset['dct:conformsTo'] || dataset.duoTerms
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
    if (entity['@id'] === 'developer-feasibility.json') {
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
export async function importROCrateFromZip(file: File): Promise<CanvasData> {
  try {
    const zip = await JSZip.loadAsync(file)
    const metadataFile = zip.file('ro-crate-metadata.json')

    if (!metadataFile) {
      throw new Error('ro-crate-metadata.json not found in ZIP file')
    }

    const metadataContent = await metadataFile.async('string')
    const rocrate: ROCrateJSONLD = JSON.parse(metadataContent)

    const canvasData = await importROCrateFromJSON(rocrate)

    // Try to load developer feasibility from separate file
    const feasibilityFile = zip.file('developer-feasibility.json')
    if (feasibilityFile) {
      try {
        const feasibilityContent = await feasibilityFile.async('string')
        const feasibility = JSON.parse(feasibilityContent)
        canvasData.developerFeasibility = feasibility
      } catch (error) {
        console.warn('Failed to parse developer-feasibility.json:', error)
      }
    }

    return canvasData
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to import RO-Crate: ${error.message}`)
    }
    throw new Error('Failed to import RO-Crate: Unknown error')
  }
}
