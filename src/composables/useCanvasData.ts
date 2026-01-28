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

  // Computed: form completion percentage
  const completionPercentage = computed(() => {
    let completed = 0
    let total = 2 // title and description are required

    if (canvasData.value.project.title) completed++
    if (canvasData.value.project.description) completed++

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
  }
}
