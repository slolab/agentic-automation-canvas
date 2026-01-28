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
    canvasData.value.project = { ...canvasData.value.project, ...updates }
  }

  const updateUserExpectations = (updates: Partial<CanvasData['userExpectations']>) => {
    if (!canvasData.value.userExpectations) {
      canvasData.value.userExpectations = {}
    }
    canvasData.value.userExpectations = {
      ...canvasData.value.userExpectations,
      ...updates,
    }
  }

  const updateDeveloperFeasibility = (updates: Partial<CanvasData['developerFeasibility']>) => {
    if (!canvasData.value.developerFeasibility) {
      canvasData.value.developerFeasibility = {}
    }
    canvasData.value.developerFeasibility = {
      ...canvasData.value.developerFeasibility,
      ...updates,
    }
  }

  const updateGovernance = (updates: Partial<CanvasData['governance']>) => {
    if (!canvasData.value.governance) {
      canvasData.value.governance = {}
    }
    canvasData.value.governance = {
      ...canvasData.value.governance,
      ...updates,
    }
  }

  const updateDataAccess = (updates: Partial<CanvasData['dataAccess']>) => {
    if (!canvasData.value.dataAccess) {
      canvasData.value.dataAccess = {}
    }
    canvasData.value.dataAccess = {
      ...canvasData.value.dataAccess,
      ...updates,
    }
  }

  const updateOutcomes = (updates: Partial<CanvasData['outcomes']>) => {
    if (!canvasData.value.outcomes) {
      canvasData.value.outcomes = {}
    }
    canvasData.value.outcomes = {
      ...canvasData.value.outcomes,
      ...updates,
    }
  }

  const clearData = () => {
    canvasData.value = {
      project: {
        title: '',
        description: '',
      },
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
    completionPercentage,
  }
}
