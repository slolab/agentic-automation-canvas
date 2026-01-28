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
 * Generate RO-Crate JSON-LD from canvas data
 */
export function generateROCrate(data: CanvasData): ROCrateJSONLD {
  const graph: ROCrateEntity[] = []
  let entityCounter = 0

  // 1. RO-Crate Metadata File Descriptor
  graph.push({
    '@id': 'ro-crate-metadata.json',
    '@type': 'CreativeWork',
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
    '@type': 'Dataset',
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
    '@type': ['Project', 'ResearchProject'],
    name: data.project.title,
    description: data.project.description,
  }

  if (data.project.objective) {
    projectEntity.about = data.project.objective
  }
  if (data.project.startDate) {
    projectEntity.startDate = data.project.startDate
  }
  if (data.project.endDate) {
    projectEntity.endDate = data.project.endDate
  }
  if (data.project.keywords && data.project.keywords.length > 0) {
    projectEntity.keywords = data.project.keywords
  }
  if (data.project.projectId) {
    projectEntity.identifier = data.project.projectId
  }

  graph.push(projectEntity)

  // 4. User Expectations as P-Plan
  if (data.userExpectations?.requirements && data.userExpectations.requirements.length > 0) {
    const planId = generateId('user-plan')
    const planSteps: Array<{ '@id': string; '@type': string; description?: string }> = []

    data.userExpectations.requirements.forEach((req, index) => {
      const stepId = generateId('requirement', index)
      planSteps.push({
        '@id': stepId,
        '@type': 'p-plan:Step',
        description: req.userStory || req.description,
      })

      // Add step entity
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
      graph.push(stepEntity)
    })

    const planEntity: ROCrateEntity = {
      '@id': planId,
      '@type': ['Plan', 'p-plan:Plan'],
      name: 'User Expectations Plan',
      description: 'User requirements and expectations for the automation',
      'p-plan:hasStep': planSteps,
    }

    graph.push(planEntity)
    projectEntity.hasPlan = { '@id': planId }
  }

  // 5. Governance Stages as PROV-O Activities
  if (data.governance?.stages && data.governance.stages.length > 0) {
    const activities: Array<{ '@id': string }> = []

    data.governance.stages.forEach((stage, index) => {
      const activityId = generateId('stage', index)
      activities.push({ '@id': activityId })

      const activityEntity: ROCrateEntity = {
        '@id': activityId,
        '@type': 'Activity',
        name: stage.name,
      }

      if (stage.startDate) {
        activityEntity.startedAtTime = `${stage.startDate}T00:00:00Z`
      }
      if (stage.endDate) {
        activityEntity.endedAtTime = `${stage.endDate}T23:59:59Z`
      }

      // Link agents
      if (stage.agents && stage.agents.length > 0) {
        const agentRefs = stage.agents.map((agent, agentIndex) => {
          const agentId = generateId(`agent-${index}`, agentIndex)
          
          // Add agent entity
          const agentEntity: ROCrateEntity = {
            '@id': agentId,
            '@type': agent.type === 'person' ? 'Person' : agent.type === 'organization' ? 'Organization' : 'SoftwareApplication',
            name: agent.name,
          }
          if (agent.role) {
            agentEntity.role = agent.role
          }
          graph.push(agentEntity)

          return { '@id': agentId }
        })
        activityEntity.wasAssociatedWith = agentRefs.length === 1 ? agentRefs[0] : agentRefs
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
        '@type': 'Dataset',
        name: dataset.title,
        description: dataset.description,
      }

      if (dataset.format) {
        datasetEntity.format = dataset.format
      }
      if (dataset.license) {
        datasetEntity.license = { '@id': dataset.license }
      }
      if (dataset.accessRights) {
        datasetEntity.accessRights = dataset.accessRights
      }
      if (dataset.pid) {
        datasetEntity.identifier = dataset.pid
      }
      if (dataset.duoTerms && dataset.duoTerms.length > 0) {
        datasetEntity.accessRights = [
          dataset.accessRights || 'restricted',
          ...dataset.duoTerms.map(term => ({ '@id': term })),
        ]
      }

      graph.push(datasetEntity)
    })
  }

  // 7. Outcomes (FRAPO deliverables, CreativeWork)
  if (data.outcomes?.deliverables && data.outcomes.deliverables.length > 0) {
    data.outcomes.deliverables.forEach((deliverable, index) => {
      const outcomeId = generateId('outcome', index)
      hasPart.push({ '@id': outcomeId })

      const outcomeEntity: ROCrateEntity = {
        '@id': outcomeId,
        '@type': 'CreativeWork',
        name: deliverable.title,
        description: deliverable.description,
      }

      if (deliverable.date) {
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
        '@type': 'ScholarlyArticle',
        name: pub.title,
      }

      if (pub.doi) {
        pubEntity.identifier = pub.doi
      }
      if (pub.authors && pub.authors.length > 0) {
        pubEntity.author = pub.authors.map(name => ({ '@type': 'Person', name }))
      }
      if (pub.date) {
        pubEntity.datePublished = pub.date
      }

      graph.push(pubEntity)
    })
  }

  // Update root dataset hasPart
  if (hasPart.length > 0) {
    rootDataset.hasPart = hasPart
  }

  return {
    '@context': 'https://w3id.org/ro/crate/1.1/context',
    '@graph': graph,
  }
}
