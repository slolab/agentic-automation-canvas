/**
 * Composable for managing canvas form data state
 */

import { ref, computed, watch } from 'vue'
import type { CanvasData } from '@/types/canvas'

const STORAGE_KEY = 'agentic-automation-canvas-data'

// Initialize with default structure
const canvasData = ref<CanvasData>({
  project: {
    title: '',
    description: '',
    projectStage: '',
  },
})

// Load from localStorage on init
const loadFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      canvasData.value = parsed
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
    }
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

  const importFromROCrate = (data: CanvasData) => {
    canvasData.value = data
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

      if (req.baselineMinutesPerUnit === undefined) {
        errors.push({ field: `${prefix}.baselineMinutesPerUnit`, message: 'Baseline minutes per unit is required', severity: 'error' })
      } else if (typeof req.baselineMinutesPerUnit === 'number' && req.baselineMinutesPerUnit < 0) {
        errors.push({ field: `${prefix}.baselineMinutesPerUnit`, message: 'Baseline minutes per unit must be ≥ 0', severity: 'error' })
      }

      if (!req.timeSavedMinutesPerUnit || req.timeSavedMinutesPerUnit.likely === undefined) {
        errors.push({ field: `${prefix}.timeSavedMinutesPerUnit.likely`, message: 'Time saved (likely) is required', severity: 'error' })
      } else if (req.timeSavedMinutesPerUnit.likely < 0) {
        errors.push({ field: `${prefix}.timeSavedMinutesPerUnit.likely`, message: 'Time saved (likely) must be ≥ 0', severity: 'error' })
      }

      // Optional validations
      if (req.timeSavedMinutesPerUnit) {
        const { best, likely, worst } = req.timeSavedMinutesPerUnit
        if (best !== undefined && likely !== undefined && best < likely) {
          errors.push({ field: `${prefix}.timeSavedMinutesPerUnit`, message: 'Best case should be ≥ likely case', severity: 'error' })
        }
        if (likely !== undefined && worst !== undefined && likely < worst) {
          errors.push({ field: `${prefix}.timeSavedMinutesPerUnit`, message: 'Likely case should be ≥ worst case', severity: 'error' })
        }
      }

      if (req.humanOversightMinutesPerUnit !== undefined && req.humanOversightMinutesPerUnit < 0) {
        errors.push({ field: `${prefix}.humanOversightMinutesPerUnit`, message: 'Human oversight minutes must be ≥ 0', severity: 'error' })
      }

      // Warning: net time saved ≤ 0
      if (req.timeSavedMinutesPerUnit?.likely !== undefined && req.humanOversightMinutesPerUnit !== undefined) {
        const netTimeSaved = req.timeSavedMinutesPerUnit.likely - req.humanOversightMinutesPerUnit
        if (netTimeSaved <= 0) {
          errors.push({ field: `${prefix}.netTimeSaved`, message: 'Net time saved is ≤ 0 (oversight exceeds time saved)', severity: 'warning' })
        }
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

  const validateAll = (): { errors: ValidationError[]; warnings: ValidationError[]; isValid: boolean } => {
    const allErrors: ValidationError[] = []
    
    allErrors.push(...validateProject())
    allErrors.push(...validateRequirements())
    allErrors.push(...validateDatasets())

    const errors = allErrors.filter(e => e.severity === 'error')
    const warnings = allErrors.filter(e => e.severity === 'warning')

    return {
      errors,
      warnings,
      isValid: errors.length === 0,
    }
  }

  // Computed: form completion percentage
  const completionPercentage = computed(() => {
    let completed = 0
    let total = 3 // title, description, projectStage are required

    if (canvasData.value.project.title) completed++
    if (canvasData.value.project.description) completed++
    if (canvasData.value.project.projectStage) completed++

    // Optional sections
    if (canvasData.value.userExpectations?.requirements?.length) completed++
    total++
    if (canvasData.value.developerFeasibility?.trlLevel) completed++
    total++
    if (canvasData.value.governance?.stages?.length) completed++
    total++
    if (canvasData.value.dataAccess?.datasets?.length) completed++
    total++
    if (canvasData.value.outcomes?.deliverables?.length) completed++
    total++

    return Math.round((completed / total) * 100)
  })

  return {
    canvasData,
    updateProject,
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
  }
}
