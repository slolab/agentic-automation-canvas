<template>
  <div class="bg-white rounded-lg shadow-lg">
    <!-- Progress indicator -->
    <div class="border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-gray-700">Form Completion</span>
        <span class="text-sm text-gray-600">{{ completionPercentage }}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div
          class="bg-primary-600 h-2 rounded-full transition-all duration-300"
          :style="{ width: `${completionPercentage}%` }"
        />
      </div>
    </div>

    <!-- Section navigation -->
    <div class="border-b border-gray-200 bg-gray-50">
      <nav class="flex overflow-x-auto px-6" aria-label="Section navigation">
        <button
          v-for="section in sections"
          :key="section.id"
          @click="activeSection = section.id"
          :class="[
            'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
            activeSection === section.id
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
          ]"
        >
          {{ section.label }}
        </button>
      </nav>
    </div>

    <!-- Form sections -->
    <div class="p-6">
      <ProjectDefinition
        v-if="activeSection === 'project'"
        :key="'project'"
      />
      <UserExpectations
        v-if="activeSection === 'user-expectations'"
        :key="'user-expectations'"
      />
      <DeveloperFeasibility
        v-if="activeSection === 'developer-feasibility'"
        :key="'developer-feasibility'"
      />
      <GovernanceStaging
        v-if="activeSection === 'governance'"
        :key="'governance'"
      />
      <DataAccessSensitivity
        v-if="activeSection === 'data-access'"
        :key="'data-access'"
      />
      <OutcomesEvaluation
        v-if="activeSection === 'outcomes'"
        :key="'outcomes'"
      />
    </div>

    <!-- Actions -->
    <div class="border-t border-gray-200 px-6 py-4 bg-gray-50 flex flex-col sm:flex-row gap-3 justify-end">
      <button
        type="button"
        @click="clearData"
        class="btn-secondary"
      >
        Clear Form
      </button>
      <button
        type="button"
        @click="downloadROCrate"
        :disabled="!canDownload"
        class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        <span>Download RO-Crate</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ProjectDefinition from './sections/ProjectDefinition.vue'
import UserExpectations from './sections/UserExpectations.vue'
import DeveloperFeasibility from './sections/DeveloperFeasibility.vue'
import GovernanceStaging from './sections/GovernanceStaging.vue'
import DataAccessSensitivity from './sections/DataAccessSensitivity.vue'
import OutcomesEvaluation from './sections/OutcomesEvaluation.vue'
import { useCanvasData } from '@/composables/useCanvasData'
import { generateROCrate } from '@/utils/rocrate'
import { downloadROCrateZip } from '@/utils/download'

const { canvasData, completionPercentage, clearData: clearCanvasData } = useCanvasData()

const activeSection = ref('project')

const sections = [
  { id: 'project', label: 'Project' },
  { id: 'user-expectations', label: 'User Expectations' },
  { id: 'developer-feasibility', label: 'Developer Feasibility' },
  { id: 'governance', label: 'Governance' },
  { id: 'data-access', label: 'Data Access' },
  { id: 'outcomes', label: 'Outcomes' },
]

const canDownload = computed(() => {
  return !!(canvasData.value.project.title && canvasData.value.project.description)
})

const clearData = () => {
  if (confirm('Are you sure you want to clear all form data? This cannot be undone.')) {
    const currentSection = activeSection.value // Save current section
    clearCanvasData()
    // Keep the current section active instead of resetting to project
    activeSection.value = currentSection
  }
}

const downloadROCrate = async () => {
  try {
    const rocrate = generateROCrate(canvasData.value)
    const projectName = canvasData.value.project.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'agentic-automation-project'
    
    await downloadROCrateZip(rocrate, projectName, canvasData.value)
  } catch (error) {
    alert(`Error generating RO-Crate: ${error instanceof Error ? error.message : 'Unknown error'}`)
    console.error('RO-Crate generation error:', error)
  }
}
</script>
