<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Developer Feasibility & Technical Assessment</h2>
      <p class="text-sm text-gray-600 mb-6">
        Assess technical feasibility, TRL levels, risks, and required technologies.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        id="trl-current"
        label="Current TRL Level"
        help-text="Current Technology Readiness Level (1-9)"
      >
        <select
          id="trl-current"
          v-model.number="localData.trlLevel.current"
          class="form-input"
          @change="update"
        >
          <option :value="undefined">Select TRL</option>
          <option v-for="level in trlLevels" :key="level.value" :value="level.value">
            {{ level.label }}
          </option>
        </select>
      </FormField>

      <FormField
        id="trl-target"
        label="Target TRL Level"
        help-text="Target Technology Readiness Level (1-9)"
      >
        <select
          id="trl-target"
          v-model.number="localData.trlLevel.target"
          class="form-input"
          @change="update"
        >
          <option :value="undefined">Select TRL</option>
          <option v-for="level in trlLevels" :key="level.value" :value="level.value">
            {{ level.label }}
          </option>
        </select>
      </FormField>
    </div>

    <FormField
      id="technical-risk"
      label="Technical Risk"
      help-text="Overall technical risk assessment"
    >
      <select
        id="technical-risk"
        v-model="localData.technicalRisk"
        class="form-input"
        @change="update"
      >
        <option :value="undefined">Select risk level</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="critical">Critical</option>
      </select>
    </FormField>

    <FormField
      id="algorithms"
      label="Algorithms / Technologies"
      help-text="List of algorithms, models, or technologies to be used. Add one per entry."
    >
      <MultiValueInput
        v-model="localAlgorithms"
        label="algorithm"
        :create-default="() => ({ value: '' })"
      >
        <template #input="{ item, index, update }">
          <input
            :id="`algorithm-${index}`"
            :value="item.value"
            type="text"
            class="form-input"
            placeholder="e.g., BERT"
            @input="update({ ...item, value: ($event.target as HTMLInputElement).value })"
          />
        </template>
      </MultiValueInput>
    </FormField>

    <FormField
      id="tools"
      label="Tools / Frameworks"
      help-text="Development tools and frameworks. Add one per entry."
    >
      <MultiValueInput
        v-model="localTools"
        label="tool"
        :create-default="() => ({ value: '' })"
      >
        <template #input="{ item, index, update }">
          <input
            :id="`tool-${index}`"
            :value="item.value"
            type="text"
            class="form-input"
            placeholder="e.g., Python"
            @input="update({ ...item, value: ($event.target as HTMLInputElement).value })"
          />
        </template>
      </MultiValueInput>
    </FormField>

    <FormField
      id="effort-estimate"
      label="Effort Estimate"
      help-text="Estimated effort or duration"
    >
      <input
        id="effort-estimate"
        v-model="localData.effortEstimate"
        type="text"
        class="form-input"
        placeholder="e.g., 6 months, 500 person-hours"
        @blur="update"
      />
    </FormField>

    <FormField
      id="feasibility-notes"
      label="Feasibility Notes"
      help-text="Additional notes on feasibility and technical considerations"
    >
      <textarea
        id="feasibility-notes"
        v-model="localData.feasibilityNotes"
        rows="4"
        class="form-input"
        @blur="update"
      />
    </FormField>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import FormField from '../FormField.vue'
import MultiValueInput from '../MultiValueInput.vue'
import type { DeveloperFeasibility } from '@/types/canvas'
import { useCanvasData } from '@/composables/useCanvasData'

const { canvasData, updateDeveloperFeasibility } = useCanvasData()

// Initialize localData with proper array references
const initLocalData = (): DeveloperFeasibility => {
  const feasibility = canvasData.value.developerFeasibility
  return {
    trlLevel: feasibility?.trlLevel || {},
    technicalRisk: feasibility?.technicalRisk,
    effortEstimate: feasibility?.effortEstimate,
    feasibilityNotes: feasibility?.feasibilityNotes,
  }
}

const localData = ref<DeveloperFeasibility>(initLocalData())

// Convert algorithms/tools arrays to objects for MultiValueInput
const initAlgorithms = () => {
  const algorithms = canvasData.value.developerFeasibility?.algorithms || []
  return algorithms.map((a: string) => ({ value: a }))
}

const initTools = () => {
  const tools = canvasData.value.developerFeasibility?.tools || []
  return tools.map((t: string) => ({ value: t }))
}

const localAlgorithms = ref<Array<{ value: string }>>(initAlgorithms())
const localTools = ref<Array<{ value: string }>>(initTools())

const trlLevels = [
  { value: 1, label: 'TRL 1 - Basic principles observed' },
  { value: 2, label: 'TRL 2 - Technology concept formulated' },
  { value: 3, label: 'TRL 3 - Experimental proof of concept' },
  { value: 4, label: 'TRL 4 - Technology validated in lab' },
  { value: 5, label: 'TRL 5 - Technology validated in relevant environment' },
  { value: 6, label: 'TRL 6 - Technology demonstrated in relevant environment' },
  { value: 7, label: 'TRL 7 - System prototype demonstration in operational environment' },
  { value: 8, label: 'TRL 8 - System complete and qualified' },
  { value: 9, label: 'TRL 9 - Actual system proven in operational environment' },
]

let isLocalUpdate = false
let isSyncingFromCanvas = false

watch(
  () => canvasData.value.developerFeasibility,
  (newFeasibility) => {
    // Don't sync if the update came from us
    if (!isLocalUpdate) {
      isSyncingFromCanvas = true
      if (newFeasibility && Object.keys(newFeasibility).length > 0) {
        // Create new object with proper array references
        localData.value = {
          trlLevel: newFeasibility.trlLevel || {},
          technicalRisk: newFeasibility.technicalRisk,
          effortEstimate: newFeasibility.effortEstimate,
          feasibilityNotes: newFeasibility.feasibilityNotes,
        }
        // Sync algorithms and tools arrays
        localAlgorithms.value = (newFeasibility.algorithms || []).map((a: string) => ({ value: a }))
        localTools.value = (newFeasibility.tools || []).map((t: string) => ({ value: t }))
      } else {
        // Reset to empty state when cleared
        localData.value = { trlLevel: {} }
        localAlgorithms.value = []
        localTools.value = []
      }
      // Reset flag after syncing
      nextTick(() => {
        isSyncingFromCanvas = false
      })
    }
  },
  { deep: true, immediate: false }
)

const update = async () => {
  // Skip if we're currently syncing from canvasData to avoid circular updates
  if (isSyncingFromCanvas) return
  
  isLocalUpdate = true
  updateDeveloperFeasibility(localData.value)
  await nextTick()
  isLocalUpdate = false
}

// Watch for local changes to algorithms and tools
watch(localAlgorithms, async (newAlgorithms) => {
  // Skip if we're currently syncing from canvasData to avoid circular updates
  if (isSyncingFromCanvas) return
  
  isLocalUpdate = true
  updateDeveloperFeasibility({
    ...localData.value,
    algorithms: newAlgorithms.map((a) => a.value).filter((v) => v.trim()),
    tools: localTools.value.map((t) => t.value).filter((v) => v.trim()),
  })
  await nextTick()
  isLocalUpdate = false
}, { deep: true, immediate: false })

watch(localTools, async (newTools) => {
  // Skip if we're currently syncing from canvasData to avoid circular updates
  if (isSyncingFromCanvas) return
  
  isLocalUpdate = true
  updateDeveloperFeasibility({
    ...localData.value,
    algorithms: localAlgorithms.value.map((a) => a.value).filter((v) => v.trim()),
    tools: newTools.map((t) => t.value).filter((v) => v.trim()),
  })
  await nextTick()
  isLocalUpdate = false
}, { deep: true, immediate: false })
</script>
