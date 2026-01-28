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

  // Find project entity
  const projectEntity = findEntitiesByType(graph, ['Project', 'ResearchProject'])[0]
  if (projectEntity) {
    canvasData.project = {
      title: (projectEntity.name as string) || '',
      description: (projectEntity.description as string) || '',
      objective: (projectEntity.about as string) || undefined,
      startDate: (projectEntity.startDate as string) || undefined,
      endDate: (projectEntity.endDate as string) || undefined,
      domain: Array.isArray(projectEntity.domain)
        ? projectEntity.domain
        : projectEntity.domain
          ? [projectEntity.domain as string]
          : undefined,
      keywords: Array.isArray(projectEntity.keywords)
        ? projectEntity.keywords
        : projectEntity.keywords
          ? [projectEntity.keywords as string]
          : undefined,
      projectId: (projectEntity.identifier as string) || undefined,
    }
  }

  // Find user expectations plan (P-Plan)
  const planEntity = findEntitiesByType(graph, ['Plan', 'p-plan:Plan'])[0]
  if (planEntity) {
    const steps = (planEntity['p-plan:hasStep'] as Array<{ '@id': string }>) || []
    const requirements = steps
      .map((stepRef) => findEntity(graph, stepRef['@id']))
      .filter((step) => step !== undefined)
      .map((step) => ({
        id: step!['@id'].replace('#', ''),
        description: (step!.description as string) || '',
        userStory: (step!.name as string) || undefined,
        priority: (step!.priority as 'low' | 'medium' | 'high' | 'critical' | undefined) || undefined,
        status: (step!.status as 'planned' | 'in-progress' | 'completed' | 'cancelled' | undefined) || undefined,
      }))

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
      .filter((entity) => entity !== undefined && entity['@type'] === 'Person')
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

  // Find governance stages (PROV-O Activities)
  const activityEntities = findEntitiesByType(graph, 'Activity')
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
            return {
              name: (agent!.name as string) || '',
              role: (agent!.role as string) || undefined,
              type:
                agentType === 'Person'
                  ? 'person'
                  : agentType === 'Organization'
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

      // Extract compliance standards
      if (activity.complianceStandard) {
        stage.complianceStandards = Array.isArray(activity.complianceStandard)
          ? activity.complianceStandard
          : [activity.complianceStandard as string]
      }

      return stage
    })

    if (stages.length > 0) {
      canvasData.governance = { stages }
    }
  }

  // Find datasets (DCAT)
  const datasetEntities = findEntitiesByType(graph, 'Dataset').filter(
    (entity) => entity['@id'] !== './'
  )
  if (datasetEntities.length > 0) {
    const datasets = datasetEntities.map((dataset) => ({
      id: dataset['@id'].replace('#', ''),
      title: (dataset.name as string) || '',
      description: (dataset.description as string) || undefined,
      format: (dataset.format as string) || undefined,
      license: typeof dataset.license === 'object' && dataset.license !== null && '@id' in dataset.license
        ? (dataset.license as { '@id': string })['@id']
        : (dataset.license as string) || undefined,
      accessRights:
        typeof dataset.accessRights === 'string'
          ? (dataset.accessRights as any)
          : undefined,
      pid: (dataset.identifier as string) || undefined,
      duoTerms: dataset.duoTerms
        ? (Array.isArray(dataset.duoTerms) 
            ? dataset.duoTerms.map((term: any) => typeof term === 'object' && term !== null && '@id' in term ? term['@id'] : term)
            : [typeof dataset.duoTerms === 'object' && dataset.duoTerms !== null && '@id' in dataset.duoTerms 
                ? (dataset.duoTerms as { '@id': string })['@id'] 
                : dataset.duoTerms as string])
        : undefined,
      containsPersonalData: dataset.containsPersonalData !== undefined 
        ? (dataset.containsPersonalData as boolean)
        : undefined,
    }))

    if (datasets.length > 0) {
      canvasData.dataAccess = { datasets }
    }
  }

  // Find outcomes (CreativeWork, ScholarlyArticle)
  // Exclude metadata file descriptor and other non-outcome CreativeWorks
  const creativeWorkEntities = findEntitiesByType(graph, [
    'CreativeWork',
    'ScholarlyArticle',
    'Report',
  ]).filter((entity) => {
    // Exclude metadata file descriptor
    if (entity['@id'] === 'ro-crate-metadata.json') {
      return false
    }
    // Exclude file entities (they're referenced but not outcomes)
    if (entity['@id'] === 'developer-feasibility.json') {
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
      const isPublication = entityType === 'ScholarlyArticle'
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
          type: entityType || 'Deliverable',
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

  // Find evaluations
  const evaluationEntities = findEntitiesByType(graph, 'Evaluation')
  if (evaluationEntities.length > 0) {
    const evaluations = evaluationEntities.map((evaluation) => ({
      id: evaluation['@id'].replace('#', ''),
      type: (evaluation.name as string) || '',
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
