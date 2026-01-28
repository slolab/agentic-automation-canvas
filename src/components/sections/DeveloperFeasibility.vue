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
      help-text="List of algorithms, models, or technologies to be used"
    >
      <input
        id="algorithms"
        v-model="algorithmInput"
        type="text"
        class="form-input"
        placeholder="e.g., BERT, GPT-4, Random Forest"
        @keydown.enter.prevent="addAlgorithm"
      />
      <div v-if="localData.algorithms && localData.algorithms.length > 0" class="mt-2 flex flex-wrap gap-2">
        <span
          v-for="(alg, index) in localData.algorithms"
          :key="index"
          class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
        >
          {{ alg }}
          <button
            type="button"
            @click="removeAlgorithm(index)"
            class="ml-2 text-blue-600 hover:text-blue-800"
            aria-label="Remove algorithm"
          >
            ×
          </button>
        </span>
      </div>
    </FormField>

    <FormField
      id="tools"
      label="Tools / Frameworks"
      help-text="Development tools and frameworks"
    >
      <input
        id="tools"
        v-model="toolInput"
        type="text"
        class="form-input"
        placeholder="e.g., Python, TensorFlow, Docker"
        @keydown.enter.prevent="addTool"
      />
      <div v-if="localData.tools && localData.tools.length > 0" class="mt-2 flex flex-wrap gap-2">
        <span
          v-for="(tool, index) in localData.tools"
          :key="index"
          class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
        >
          {{ tool }}
          <button
            type="button"
            @click="removeTool(index)"
            class="ml-2 text-green-600 hover:text-green-800"
            aria-label="Remove tool"
          >
            ×
          </button>
        </span>
      </div>
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
import { ref, watch } from 'vue'
import FormField from '../FormField.vue'
import type { DeveloperFeasibility } from '@/types/canvas'
import { useCanvasData } from '@/composables/useCanvasData'

const { canvasData, updateDeveloperFeasibility } = useCanvasData()

const localData = ref<DeveloperFeasibility>({
  trlLevel: {},
  ...canvasData.value.developerFeasibility,
})

const algorithmInput = ref('')
const toolInput = ref('')

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

watch(
  () => canvasData.value.developerFeasibility,
  (newFeasibility) => {
    if (newFeasibility) {
      localData.value = { trlLevel: {}, ...newFeasibility }
    }
  },
  { deep: true }
)

const update = () => {
  updateDeveloperFeasibility(localData.value)
}

const addAlgorithm = () => {
  if (algorithmInput.value.trim()) {
    if (!localData.value.algorithms) {
      localData.value.algorithms = []
    }
    if (!localData.value.algorithms.includes(algorithmInput.value.trim())) {
      localData.value.algorithms.push(algorithmInput.value.trim())
      algorithmInput.value = ''
      update()
    }
  }
}

const removeAlgorithm = (index: number) => {
  if (localData.value.algorithms) {
    localData.value.algorithms.splice(index, 1)
    update()
  }
}

const addTool = () => {
  if (toolInput.value.trim()) {
    if (!localData.value.tools) {
      localData.value.tools = []
    }
    if (!localData.value.tools.includes(toolInput.value.trim())) {
      localData.value.tools.push(toolInput.value.trim())
      toolInput.value = ''
      update()
    }
  }
}

const removeTool = (index: number) => {
  if (localData.value.tools) {
    localData.value.tools.splice(index, 1)
    update()
  }
}
</script>
