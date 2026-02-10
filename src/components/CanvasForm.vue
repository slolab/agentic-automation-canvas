<template>
  <div class="bg-white rounded-lg shadow-lg">
    <!-- Migration warnings banner (one-time after import) -->
    <div
      v-if="lastImportMigrationWarnings.length > 0"
      class="border-b border-amber-200 bg-amber-50 px-6 py-3 flex items-start justify-between gap-4"
    >
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-amber-800">Import migrations applied</p>
        <ul class="mt-1 text-sm text-amber-700 list-disc list-inside">
          <li v-for="(msg, i) in lastImportMigrationWarnings" :key="i">{{ msg }}</li>
        </ul>
      </div>
      <button
        type="button"
        @click="clearMigrationWarnings"
        class="text-amber-700 hover:text-amber-900 shrink-0"
        aria-label="Dismiss"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    <!-- Progress indicator -->
    <div class="border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-gray-700">Form Completion</span>
        <span class="text-sm font-medium" :class="getCompletionTextColor()">
          {{ completionPercentage.percentage }}%
          <span v-if="!completionPercentage.isValid" class="text-xs">(validation errors)</span>
        </span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div
          class="h-2 rounded-full transition-all duration-300"
          :class="getCompletionBarColor()"
          :style="{ width: `${completionPercentage.percentage}%` }"
        />
      </div>
    </div>

    <!-- Section navigation -->
    <div class="border-b border-gray-200 bg-gray-50">
      <nav class="flex overflow-x-auto px-6" aria-label="Section navigation">
        <button
          v-for="section in sections"
          :key="section.id"
          type="button"
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
      <CanvasSummary
        v-if="activeSection === 'canvas-summary'"
        :key="'canvas-summary'"
      />
      <ProjectDefinition
        v-if="activeSection === 'project'"
        :key="'project'"
      />
      <Persons
        v-if="activeSection === 'persons'"
        :key="'persons'"
      />
      <UserExpectations
        v-if="activeSection === 'user-expectations'"
        :key="`user-expectations-${dataVersion}`"
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
      <Dashboard
        v-if="activeSection === 'dashboard'"
        :key="'dashboard'"
      />
    </div>

    <!-- Validation Errors -->
    <div v-if="validation.errors.length > 0 || validation.warnings.length > 0" class="border-t border-gray-200 px-6 py-4 bg-gray-50">
      <div v-if="validation.errors.length > 0" class="mb-4">
        <h3 class="text-sm font-semibold text-red-700 mb-2">Validation Errors</h3>
        <ul class="list-disc list-inside space-y-1">
          <li v-for="(error, index) in validation.errors" :key="index" class="text-sm text-red-600">
            {{ error.message }}
          </li>
        </ul>
      </div>
      <div v-if="validation.warnings.length > 0">
        <h3 class="text-sm font-semibold text-yellow-700 mb-2">Warnings</h3>
        <ul class="list-disc list-inside space-y-1">
          <li v-for="(warning, index) in validation.warnings" :key="index" class="text-sm text-yellow-600">
            {{ warning.message }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import CanvasSummary from './sections/CanvasSummary.vue'
import ProjectDefinition from './sections/ProjectDefinition.vue'
import Persons from './sections/Persons.vue'
import UserExpectations from './sections/UserExpectations.vue'
import DeveloperFeasibility from './sections/DeveloperFeasibility.vue'
import GovernanceStaging from './sections/GovernanceStaging.vue'
import DataAccessSensitivity from './sections/DataAccessSensitivity.vue'
import OutcomesEvaluation from './sections/OutcomesEvaluation.vue'
import Dashboard from './sections/Dashboard.vue'
import { useCanvasData } from '@/composables/useCanvasData'

const { completionPercentage, validateAll, lastImportMigrationWarnings, clearMigrationWarnings, requestedSection, dataVersion } = useCanvasData()

const sections = [
  { id: 'canvas-summary', label: 'Canvas Summary' },
  { id: 'project', label: 'Project' },
  { id: 'persons', label: 'Persons' },
  { id: 'user-expectations', label: 'Tasks & Expectations' },
  { id: 'developer-feasibility', label: 'Developer Feasibility' },
  { id: 'governance', label: 'Governance' },
  { id: 'data-access', label: 'Data Access' },
  { id: 'outcomes', label: 'Outcomes' },
  { id: 'dashboard', label: 'Dashboard' },
]

const activeSection = ref('canvas-summary')

watch(requestedSection, (section) => {
  if (section && sections.some((s) => s.id === section)) {
    activeSection.value = section
    requestedSection.value = null
  }
})

const validation = computed(() => validateAll())

const getCompletionBarColor = () => {
  if (completionPercentage.value.hasErrors) {
    return 'bg-red-500'
  }
  if (completionPercentage.value.hasWarnings) {
    return 'bg-yellow-500'
  }
  if (completionPercentage.value.isValid) {
    return 'bg-green-500'
  }
  return 'bg-primary-600'
}

const getCompletionTextColor = () => {
  if (completionPercentage.value.hasErrors) {
    return 'text-red-600'
  }
  if (completionPercentage.value.hasWarnings) {
    return 'text-yellow-600'
  }
  if (completionPercentage.value.isValid) {
    return 'text-green-600'
  }
  return 'text-gray-600'
}
</script>
