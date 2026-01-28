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
    '@type': 'dcat:Dataset',
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
    projectEntity.about = data.project.objective
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
  if (data.project.aggregateExpectedHoursSavedPerMonth !== undefined) {
    projectEntity['aac:aggregateExpectedHoursSavedPerMonth'] = data.project.aggregateExpectedHoursSavedPerMonth
  }
  if (data.project.primaryValueDriver) {
    projectEntity['aac:primaryValueDriver'] = data.project.primaryValueDriver
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

      // Add step entity with value model
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
      if (req.volumePerMonth !== undefined) {
        stepEntity['aac:volumePerMonth'] = req.volumePerMonth
      }
      if (req.baselineMinutesPerUnit !== undefined) {
        stepEntity['aac:baselineMinutesPerUnit'] = req.baselineMinutesPerUnit
      }
      if (req.timeSavedMinutesPerUnit) {
        stepEntity['aac:timeSavedMinutesPerUnit'] = req.timeSavedMinutesPerUnit
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
      if (req.oversightMinutesPerUnit !== undefined) {
        stepEntity['aac:oversightMinutesPerUnit'] = req.oversightMinutesPerUnit
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
      'p-plan:hasStep': planSteps,
    }

    graph.push(planEntity)
    projectEntity.hasPlan = { '@id': planId }
  }

  // 4b. Stakeholders
  if (data.userExpectations?.stakeholders && data.userExpectations.stakeholders.length > 0) {
    const stakeholderRefs: Array<{ '@id': string }> = []
    data.userExpectations.stakeholders.forEach((stakeholder, index) => {
      const stakeholderId = generateId('stakeholder', index)
      stakeholderRefs.push({ '@id': stakeholderId })
      
      const stakeholderEntity: ROCrateEntity = {
        '@id': stakeholderId,
        '@type': 'schema:Person',
        name: stakeholder.name,
      }
      if (stakeholder.role) {
        stakeholderEntity.role = stakeholder.role
      }
      graph.push(stakeholderEntity)
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

      // Link agents
      if (stage.agents && stage.agents.length > 0) {
        const agentRefs = stage.agents.map((agent, agentIndex) => {
          const agentId = generateId(`agent-${index}`, agentIndex)
          
          // Add agent entity
          const agentEntity: ROCrateEntity = {
            '@id': agentId,
            '@type': agent.type === 'person' ? 'schema:Person' : agent.type === 'organization' ? 'schema:Organization' : 'schema:SoftwareApplication',
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
      description: 'Technical feasibility assessment including TRL levels, risk assessment, and technology choices',
      'schema:encodingFormat': 'application/json',
    }
    graph.push(feasibilityFileEntity)
  }

  // Update root dataset hasPart
  if (hasPart.length > 0) {
    rootDataset.hasPart = hasPart
  }

  // Extended @context with all required prefixes
  const context = [
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
