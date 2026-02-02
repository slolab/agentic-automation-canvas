/**
 * Composable for managing canvas form data state
 */

import { ref, computed, watch } from 'vue'
import type { CanvasData, Milestone } from '@/types/canvas'
import type { BenefitDisplayState } from '@/types/benefitDisplay'
import { getTimeSavedPerUnit } from '@/utils/timeBenefits'

const STORAGE_KEY = 'agentic-automation-canvas-data'

// Initialize with default structure
const canvasData = ref<CanvasData>({
  project: {
    title: '',
    description: '',
    projectStage: '',
  },
  version: '0.9.0',
  versionDate: new Date().toISOString().split('T')[0],
})

// App-only: version at last import, for "increment version" reminder (not in schema)
const lastImportedVersion = ref<string | null>(null)

// App-only: benefit display groups for dashboard (not in schema; stored in benefit-display.json in crate)
const benefitDisplay = ref<BenefitDisplayState>({ displayGroups: [] })

// Load from localStorage on init
const loadFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      canvasData.value = parsed
      // Ensure version fields are initialized if missing
      if (!canvasData.value.version && !canvasData.value.project.version) {
        canvasData.value.version = '0.9.0'
        canvasData.value.project.version = '0.9.0'
      }
      if (!canvasData.value.versionDate && !canvasData.value.project.versionDate) {
        const today = new Date().toISOString().split('T')[0]
        canvasData.value.versionDate = today
        canvasData.value.project.versionDate = today
      }
    }
  } catch (error) {
    console.warn('Failed to load canvas data from storage:', error)
  }
}

// Save to localStorage whenever data changes
watch(
  canvasData,
  (newData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData))
    } catch (error) {
      console.warn('Failed to save canvas data to storage:', error)
    }
  },
  { deep: true }
)

// Initialize
loadFromStorage()

export function useCanvasData() {
  const updateProject = (updates: Partial<CanvasData['project']>) => {
    // Ensure arrays are properly copied to preserve references
    const updatedProject: any = {
      ...canvasData.value.project,
    }
    // Apply updates, ensuring arrays are copied
    Object.keys(updates).forEach((key) => {
      const value = (updates as any)[key]
      if (Array.isArray(value)) {
        updatedProject[key] = [...value]
      } else {
        updatedProject[key] = value
      }
    })
    canvasData.value.project = updatedProject
  }

  const updateUserExpectations = (updates: Partial<CanvasData['userExpectations']>) => {
    if (!canvasData.value.userExpectations) {
      canvasData.value.userExpectations = {}
    }
    // Ensure arrays are properly copied to preserve references
    const updatedExpectations: any = {
      ...canvasData.value.userExpectations,
    }
    // Apply updates, ensuring arrays are copied
    Object.keys(updates || {}).forEach((key) => {
      const value = (updates as any)[key]
      if (Array.isArray(value)) {
        updatedExpectations[key] = [...value]
      } else {
        updatedExpectations[key] = value
      }
    })
    canvasData.value.userExpectations = updatedExpectations
  }

  const updateDeveloperFeasibility = (updates: Partial<CanvasData['developerFeasibility']>) => {
    if (!canvasData.value.developerFeasibility) {
      canvasData.value.developerFeasibility = {}
    }
    // Ensure arrays are properly copied to preserve references
    const updatedFeasibility: any = {
      ...canvasData.value.developerFeasibility,
    }
    // Apply updates, ensuring arrays are copied
    Object.keys(updates || {}).forEach((key) => {
      const value = (updates as any)[key]
      if (Array.isArray(value)) {
        updatedFeasibility[key] = [...value]
      } else {
        updatedFeasibility[key] = value
      }
    })
    canvasData.value.developerFeasibility = updatedFeasibility
  }

  const updateGovernance = (updates: Partial<CanvasData['governance']>) => {
    if (!canvasData.value.governance) {
      canvasData.value.governance = {}
    }
    // Ensure arrays are properly copied to preserve references (including nested arrays)
    const updatedGovernance: any = {
      ...canvasData.value.governance,
    }
    // Apply updates, ensuring arrays are copied (deep copy for nested arrays)
    Object.keys(updates || {}).forEach((key) => {
      const value = (updates as any)[key]
      if (Array.isArray(value)) {
        // Deep copy array items that may contain nested arrays (e.g., agents within stages)
        updatedGovernance[key] = value.map((item: any) => {
          if (item && typeof item === 'object') {
            const copiedItem = { ...item }
            // Handle nested arrays (e.g., agents, milestones, complianceStandards)
            Object.keys(copiedItem).forEach((nestedKey) => {
              if (Array.isArray(copiedItem[nestedKey])) {
                copiedItem[nestedKey] = [...copiedItem[nestedKey]]
              }
            })
            return copiedItem
          }
          return item
        })
      } else {
        updatedGovernance[key] = value
      }
    })
    canvasData.value.governance = updatedGovernance
  }

  const updateDataAccess = (updates: Partial<CanvasData['dataAccess']>) => {
    if (!canvasData.value.dataAccess) {
      canvasData.value.dataAccess = {}
    }
    // Ensure arrays are properly copied to preserve references
    const updatedDataAccess: any = {
      ...canvasData.value.dataAccess,
    }
    // Apply updates, ensuring arrays are copied
    Object.keys(updates || {}).forEach((key) => {
      const value = (updates as any)[key]
      if (Array.isArray(value)) {
        // Deep copy array items that may contain nested arrays (e.g., duoTerms)
        updatedDataAccess[key] = value.map((item: any) => {
          if (item && typeof item === 'object') {
            const copiedItem = { ...item }
            // Handle nested arrays (e.g., duoTerms, authors)
            Object.keys(copiedItem).forEach((nestedKey) => {
              if (Array.isArray(copiedItem[nestedKey])) {
                copiedItem[nestedKey] = [...copiedItem[nestedKey]]
              }
            })
            return copiedItem
          }
          return item
        })
      } else {
        updatedDataAccess[key] = value
      }
    })
    canvasData.value.dataAccess = updatedDataAccess
  }

  const updatePersons = (persons: CanvasData['persons']) => {
    canvasData.value.persons = persons ? [...persons] : undefined
  }

  const updateOutcomes = (updates: Partial<CanvasData['outcomes']>) => {
    if (!canvasData.value.outcomes) {
      canvasData.value.outcomes = {}
    }
    // Ensure arrays are properly copied to preserve references
    const updatedOutcomes: any = {
      ...canvasData.value.outcomes,
    }
    // Apply updates, ensuring arrays are copied
    Object.keys(updates || {}).forEach((key) => {
      const value = (updates as any)[key]
      if (Array.isArray(value)) {
        // Deep copy array items that may contain nested arrays (e.g., authors in publications)
        updatedOutcomes[key] = value.map((item: any) => {
          if (item && typeof item === 'object') {
            const copiedItem = { ...item }
            // Handle nested arrays (e.g., authors)
            Object.keys(copiedItem).forEach((nestedKey) => {
              if (Array.isArray(copiedItem[nestedKey])) {
                copiedItem[nestedKey] = [...copiedItem[nestedKey]]
              }
            })
            return copiedItem
          }
          return item
        })
      } else {
        updatedOutcomes[key] = value
      }
    })
    canvasData.value.outcomes = updatedOutcomes
  }

  const clearData = () => {
    // Set to empty structure - use undefined to trigger watchers properly
    canvasData.value = {
      project: {
        title: '',
        description: '',
        projectStage: '',
      },
      userExpectations: undefined,
      developerFeasibility: undefined,
      governance: undefined,
      dataAccess: undefined,
      outcomes: undefined,
      version: '0.9.0',
      versionDate: new Date().toISOString().split('T')[0],
    }
    lastImportedVersion.value = null
    benefitDisplay.value = { displayGroups: [] }
    localStorage.removeItem(STORAGE_KEY)
  }

  const exportData = (): string => {
    return JSON.stringify(canvasData.value, null, 2)
  }

  const importData = (json: string) => {
    try {
      const parsed = JSON.parse(json)
      canvasData.value = parsed
    } catch (error) {
      throw new Error('Invalid JSON data')
    }
  }

  const importFromROCrate = (data: CanvasData, importedBenefitDisplay?: BenefitDisplayState) => {
    // Deep copy the data to ensure reactivity works properly
    const newData = JSON.parse(JSON.stringify(data))
    // Clear existing data first to ensure watchers trigger
    canvasData.value = {
      project: {
        title: '',
        description: '',
        projectStage: '',
      },
    }
    // Sync version between project and root level
    if (newData.project?.version && !newData.version) {
      newData.version = newData.project.version
    } else if (newData.version && !newData.project?.version) {
      newData.project.version = newData.version
    }
    // Always set versionDate to today's date when importing (download date)
    const today = new Date().toISOString().split('T')[0]
    newData.versionDate = today
    newData.project.versionDate = today
    canvasData.value = newData
    lastImportedVersion.value = newData.project?.version ?? newData.version ?? null
    if (importedBenefitDisplay) {
      benefitDisplay.value = importedBenefitDisplay
    } else {
      benefitDisplay.value = { displayGroups: [] }
    }
  }

  // Validation functions
  interface ValidationError {
    field: string
    message: string
    severity: 'error' | 'warning'
  }

  const validateProject = (): ValidationError[] => {
    const errors: ValidationError[] = []
    const project = canvasData.value.project

    if (!project.title || !project.title.trim()) {
      errors.push({ field: 'project.title', message: 'Project title is required', severity: 'error' })
    }

    if (!project.description || !project.description.trim()) {
      errors.push({ field: 'project.description', message: 'Project description is required', severity: 'error' })
    } else {
      // Check if description has at least one sentence (contains period, exclamation, or question mark)
      const sentencePattern = /[.!?]/
      if (!sentencePattern.test(project.description)) {
        errors.push({ field: 'project.description', message: 'Description should be at least one sentence', severity: 'error' })
      }
    }

    if (!project.projectStage || !project.projectStage.trim()) {
      errors.push({ field: 'project.projectStage', message: 'Project stage is required', severity: 'error' })
    }

    // Version management validation: recommend incrementing version if just imported (app state)
    if (lastImportedVersion.value != null && project.version && project.version === lastImportedVersion.value) {
      errors.push({
        field: 'project.version',
        message: 'It is recommended to increment the version when modifying an imported canvas. See https://semver.org/ for guidance.',
        severity: 'warning',
      })
    }

    return errors
  }

  const validateRequirements = (): ValidationError[] => {
    const errors: ValidationError[] = []
    const requirements = canvasData.value.userExpectations?.requirements || []

    if (requirements.length === 0) {
      errors.push({ field: 'userExpectations.requirements', message: 'At least one task is required', severity: 'error' })
      return errors
    }

    requirements.forEach((req, index) => {
      const prefix = `requirements[${index}]`

      if (!req.unitOfWork || !req.unitOfWork.trim()) {
        errors.push({ field: `${prefix}.unitOfWork`, message: 'Unit of work is required', severity: 'error' })
      }

      if (!req.unitCategory) {
        errors.push({ field: `${prefix}.unitCategory`, message: 'Unit category is required', severity: 'error' })
      }

      if (req.volumePerMonth === undefined || req.volumePerMonth < 1) {
        errors.push({ field: `${prefix}.volumePerMonth`, message: 'Volume per month must be at least 1', severity: 'error' })
      }

      if (req.humanOversightMinutesPerUnit !== undefined && req.humanOversightMinutesPerUnit < 0) {
        errors.push({ field: `${prefix}.humanOversightMinutesPerUnit`, message: 'Human oversight minutes must be ≥ 0', severity: 'error' })
      }

      // Validate benefits array
      if (!req.benefits || req.benefits.length === 0) {
        errors.push({ field: `${prefix}.benefits`, message: 'At least one benefit is required', severity: 'warning' })
      } else {
        // Check for time benefit and validate net savings (baseline − expected − oversight)
        const timeBenefit = req.benefits.find(b => b.benefitType === 'time')
        if (timeBenefit && req.humanOversightMinutesPerUnit !== undefined) {
          const savedPerUnit = getTimeSavedPerUnit(timeBenefit)
          const netTimeSaved = savedPerUnit - req.humanOversightMinutesPerUnit
          if (netTimeSaved <= 0) {
            errors.push({ field: `${prefix}.netTimeSaved`, message: 'Net time saved is ≤ 0 (oversight exceeds time saved)', severity: 'warning' })
          }
        }

        // Validate each benefit
        req.benefits.forEach((benefit, bIndex) => {
          const benefitPrefix = `${prefix}.benefits[${bIndex}]`
          if (!benefit.metricLabel || !benefit.metricLabel.trim()) {
            errors.push({ field: `${benefitPrefix}.metricLabel`, message: 'Benefit metric label is required', severity: 'error' })
          }
          if (!benefit.benefitUnit || !benefit.benefitUnit.trim()) {
            errors.push({ field: `${benefitPrefix}.benefitUnit`, message: 'Benefit unit is required', severity: 'error' })
          }
        })
      }
    })

    return errors
  }

  const validateDatasets = (): ValidationError[] => {
    const errors: ValidationError[] = []
    const datasets = canvasData.value.dataAccess?.datasets || []

    datasets.forEach((dataset, index) => {
      const prefix = `datasets[${index}]`

      if (!dataset.title || !dataset.title.trim()) {
        errors.push({ field: `${prefix}.title`, message: 'Dataset title is required', severity: 'error' })
      }

      if (!dataset.accessRights || !dataset.accessRights.trim()) {
        errors.push({ field: `${prefix}.accessRights`, message: 'Access rights are required', severity: 'error' })
      }

      if (dataset.containsPersonalData && (!dataset.accessRights || !dataset.accessRights.trim())) {
        errors.push({ field: `${prefix}.accessRights`, message: 'Access restriction text is required when dataset contains personal data', severity: 'error' })
      }
    })

    return errors
  }

  const validateOutcomes = (): ValidationError[] => {
    const errors: ValidationError[] = []
    const outcomes = canvasData.value.outcomes

    // Validate deliverables
    if (outcomes?.deliverables && outcomes.deliverables.length > 0) {
      outcomes.deliverables.forEach((deliverable, index) => {
        const prefix = `outcomes.deliverables[${index}]`

        if (!deliverable.title || !deliverable.title.trim()) {
          errors.push({ field: `${prefix}.title`, message: 'Deliverable title is required', severity: 'error' })
        }

        if (!deliverable.type || !deliverable.type.trim()) {
          errors.push({ field: `${prefix}.type`, message: 'Deliverable type is required', severity: 'error' })
        }
      })
    }

    // Validate publications
    if (outcomes?.publications && outcomes.publications.length > 0) {
      outcomes.publications.forEach((publication, index) => {
        const prefix = `outcomes.publications[${index}]`

        if (!publication.title || !publication.title.trim()) {
          errors.push({ field: `${prefix}.title`, message: 'Publication title is required', severity: 'error' })
        }
      })
    }

    // Validate evaluations
    if (outcomes?.evaluations && outcomes.evaluations.length > 0) {
      outcomes.evaluations.forEach((evaluation, index) => {
        const prefix = `outcomes.evaluations[${index}]`

        if (!evaluation.type || !evaluation.type.trim()) {
          errors.push({ field: `${prefix}.type`, message: 'Evaluation type is required', severity: 'error' })
        }
      })
    }

    return errors
  }

  const validateAll = (): { errors: ValidationError[]; warnings: ValidationError[]; isValid: boolean } => {
    const allErrors: ValidationError[] = []
    
    allErrors.push(...validateProject())
    allErrors.push(...validateRequirements())
    allErrors.push(...validateDatasets())
    allErrors.push(...validateOutcomes())

    const errors = allErrors.filter(e => e.severity === 'error')
    const warnings = allErrors.filter(e => e.severity === 'warning')

    return {
      errors,
      warnings,
      isValid: errors.length === 0,
    }
  }

  // Computed: form completion percentage (field-by-field)
  const completionPercentage = computed(() => {
    let completed = 0
    let total = 0
    const data = canvasData.value

    // Project fields (mandatory)
    total++
    if (data.project.title?.trim()) completed++
    
    total++
    if (data.project.description?.trim()) completed++
    
    total++
    if (data.project.projectStage?.trim()) completed++

    // Project fields (optional - only count if section exists)
    if (data.project.objective !== undefined) {
      total++
      if (data.project.objective?.trim()) completed++
    }
    if (data.project.startDate !== undefined) {
      total++
      if (data.project.startDate) completed++
    }
    if (data.project.endDate !== undefined) {
      total++
      if (data.project.endDate) completed++
    }
    if (data.project.domain !== undefined && data.project.domain.length > 0) {
      total += data.project.domain.length
      completed += data.project.domain.filter(d => d?.trim()).length
    }
    if (data.project.keywords !== undefined && data.project.keywords.length > 0) {
      total += data.project.keywords.length
      completed += data.project.keywords.filter(k => k?.trim()).length
    }
    if (data.project.projectId !== undefined) {
      total++
      if (data.project.projectId?.trim()) completed++
    }
    if (data.project.headlineValue !== undefined) {
      total++
      if (data.project.headlineValue?.trim()) completed++
    }
    // Check rough estimate fields (manual estimate when getting started)
    if (data.project.roughEstimateValue !== undefined || data.project.roughEstimateUnit !== undefined) {
      total++
      if (data.project.roughEstimateValue !== undefined && data.project.roughEstimateValue !== null) {
        completed++
      }
    }
    if (data.project.primaryValueDriver !== undefined) {
      total++
      if (data.project.primaryValueDriver) completed++
    }

    // Requirements (optional section - only count if exists)
    if (data.userExpectations?.requirements && data.userExpectations.requirements.length > 0) {
      data.userExpectations.requirements.forEach(req => {
        // Mandatory fields per requirement
        total++
        if (req.description?.trim()) completed++
        
        total++
        if (req.unitOfWork?.trim()) completed++
        
        total++
        if (req.unitCategory) completed++
        
        total++
        if (req.volumePerMonth !== undefined && req.volumePerMonth >= 1) completed++
        
        total++
        if (req.benefits && req.benefits.length > 0) completed++

        // Optional fields per requirement
        if (req.userStory !== undefined) {
          total++
          if (req.userStory?.trim()) completed++
        }
        if (req.priority !== undefined) {
          total++
          if (req.priority) completed++
        }
        if (req.status !== undefined) {
          total++
          if (req.status) completed++
        }
        if (req.humanOversightMinutesPerUnit !== undefined) {
          total++
          if (req.humanOversightMinutesPerUnit !== undefined) completed++
        }
        // Count benefits as completed fields
        if (req.benefits && req.benefits.length > 0) {
          total += req.benefits.length
          completed += req.benefits.length
        }
      })
    }

    // Stakeholders (optional - only count if exists)
    if (data.userExpectations?.stakeholders && data.userExpectations.stakeholders.length > 0) {
      data.userExpectations.stakeholders.forEach(stakeholder => {
        total++
        // Check if stakeholder has a valid personId
        if (stakeholder.personId?.trim()) {
          // Check if person exists and has a name
          const person = data.persons?.find(p => p.id === stakeholder.personId)
          if (person?.name?.trim()) completed++
        }
        if (stakeholder.role !== undefined) {
          total++
          if (stakeholder.role?.trim()) completed++
        }
        if (stakeholder.values !== undefined && stakeholder.values.length > 0) {
          total += stakeholder.values.length
          completed += stakeholder.values.filter(v => v?.trim()).length
        }
      })
    }

    // Developer Feasibility (optional section)
    if (data.developerFeasibility) {
      if (data.developerFeasibility.trlLevel !== undefined) {
        total++
        if (data.developerFeasibility.trlLevel.current !== undefined) completed++
        if (data.developerFeasibility.trlLevel.target !== undefined) {
          total++
          if (data.developerFeasibility.trlLevel.target !== undefined) completed++
        }
      }
      if (data.developerFeasibility.technicalRisk !== undefined) {
        total++
        if (data.developerFeasibility.technicalRisk) completed++
      }
      if (data.developerFeasibility.algorithms !== undefined && data.developerFeasibility.algorithms.length > 0) {
        total += data.developerFeasibility.algorithms.length
        completed += data.developerFeasibility.algorithms.filter(a => a?.trim()).length
      }
      if (data.developerFeasibility.tools !== undefined && data.developerFeasibility.tools.length > 0) {
        total += data.developerFeasibility.tools.length
        completed += data.developerFeasibility.tools.filter(t => t?.trim()).length
      }
      if (data.developerFeasibility.effortEstimate !== undefined) {
        total++
        if (data.developerFeasibility.effortEstimate?.trim()) completed++
      }
      if (data.developerFeasibility.feasibilityNotes !== undefined) {
        total++
        if (data.developerFeasibility.feasibilityNotes?.trim()) completed++
      }
    }

    // Governance Stages (optional section)
    if (data.governance?.stages && data.governance.stages.length > 0) {
      data.governance.stages.forEach(stage => {
        total++
        if (stage.name?.trim()) completed++
        if (stage.startDate !== undefined) {
          total++
          if (stage.startDate) completed++
        }
        if (stage.endDate !== undefined) {
          total++
          if (stage.endDate) completed++
        }
        if (stage.agents !== undefined && stage.agents.length > 0) {
          stage.agents.forEach(agent => {
            total++
            // For person-type agents, check personId; for others, check name
            if (agent.type === 'person') {
              if (agent.personId?.trim()) {
                const person = data.persons?.find(p => p.id === agent.personId)
                if (person?.name?.trim()) completed++
              }
            } else {
              if (agent.name?.trim()) completed++
            }
            if (agent.role !== undefined) {
              total++
              if (agent.role?.trim()) completed++
            }
          })
        }
        if (stage.milestones !== undefined && stage.milestones.length > 0) {
          total += stage.milestones.length
          completed += stage.milestones.filter((m) => {
            const milestone = m as Milestone
            return !!(milestone.description?.trim() || milestone.kpi?.trim())
          }).length
        }
        if (stage.complianceStandards !== undefined && stage.complianceStandards.length > 0) {
          total += stage.complianceStandards.length
          completed += stage.complianceStandards.filter(c => c?.trim()).length
        }
      })
    }

    // Datasets (optional section)
    if (data.dataAccess?.datasets && data.dataAccess.datasets.length > 0) {
      data.dataAccess.datasets.forEach(dataset => {
        total++
        if (dataset.title?.trim()) completed++
        total++
        if (dataset.accessRights?.trim()) completed++
        if (dataset.description !== undefined) {
          total++
          if (dataset.description?.trim()) completed++
        }
        if (dataset.format !== undefined) {
          total++
          if (dataset.format?.trim()) completed++
        }
        if (dataset.license !== undefined) {
          total++
          if (dataset.license?.trim()) completed++
        }
        if (dataset.pid !== undefined) {
          total++
          if (dataset.pid?.trim()) completed++
        }
        if (dataset.duoTerms !== undefined && dataset.duoTerms.length > 0) {
          total += dataset.duoTerms.length
          completed += dataset.duoTerms.filter(t => t?.trim()).length
        }
        if (dataset.containsPersonalData !== undefined) {
          total++
          completed++ // Boolean is always "filled"
        }
      })
    }

    // Outcomes (optional section)
    if (data.outcomes?.deliverables && data.outcomes.deliverables.length > 0) {
      data.outcomes.deliverables.forEach(deliverable => {
        total++
        if (deliverable.title?.trim()) completed++
        total++
        if (deliverable.type?.trim()) completed++
        if (deliverable.description !== undefined) {
          total++
          if (deliverable.description?.trim()) completed++
        }
        if (deliverable.date !== undefined) {
          total++
          if (deliverable.date) completed++
        }
        if (deliverable.pid !== undefined) {
          total++
          if (deliverable.pid?.trim()) completed++
        }
      })
    }

    if (data.outcomes?.publications && data.outcomes.publications.length > 0) {
      data.outcomes.publications.forEach(pub => {
        total++
        if (pub.title?.trim()) completed++
        if (pub.doi !== undefined) {
          total++
          if (pub.doi?.trim()) completed++
        }
        if (pub.authors !== undefined && pub.authors.length > 0) {
          total += pub.authors.length
          completed += pub.authors.filter(a => a?.trim()).length
        }
        if (pub.date !== undefined) {
          total++
          if (pub.date) completed++
        }
      })
    }

    if (data.outcomes?.evaluations && data.outcomes.evaluations.length > 0) {
      data.outcomes.evaluations.forEach(evaluation => {
        total++
        if (evaluation.type?.trim()) completed++
        if (evaluation.date !== undefined) {
          total++
          if (evaluation.date) completed++
        }
        if (evaluation.results !== undefined) {
          total++
          if (evaluation.results?.trim()) completed++
        }
      })
    }

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
    const validation = validateAll()
    
    return {
      percentage,
      isValid: validation.isValid,
      hasErrors: validation.errors.length > 0,
      hasWarnings: validation.warnings.length > 0,
    }
  })

  return {
    canvasData,
    lastImportedVersion,
    benefitDisplay,
    updateProject,
    updatePersons,
    updateUserExpectations,
    updateDeveloperFeasibility,
    updateGovernance,
    updateDataAccess,
    updateOutcomes,
    clearData,
    exportData,
    importData,
    importFromROCrate,
    completionPercentage,
    validateAll,
    validateProject,
    validateRequirements,
    validateDatasets,
    validateOutcomes,
  }
}
