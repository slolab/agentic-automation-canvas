<template>
  <div class="space-y-6">
    <div>
      <h2 class="section-header">Developer Feasibility & Technical Assessment</h2>
      <p class="section-description">
        Assess technical feasibility, TRL levels, risks, and required technologies.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        id="trl-current"
        label="Current TRL Level"
        help-text="Current <a href='https://en.wikipedia.org/wiki/Technology_readiness_level' target='_blank' rel='noopener noreferrer' class='text-primary-600 hover:text-primary-800 underline' title='Technology Readiness Level (TRL) scale'>Technology Readiness Level (TRL)</a> (1-9). TRL measures the maturity of a technology, from basic research (1) to proven in operational environment (9)."
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
        help-text="Target <a href='https://en.wikipedia.org/wiki/Technology_readiness_level' target='_blank' rel='noopener noreferrer' class='text-primary-600 hover:text-primary-800 underline' title='Technology Readiness Level (TRL) scale'>Technology Readiness Level (TRL)</a> (1-9). The TRL level you aim to achieve by the end of the project."
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

    <div>
      <label class="form-label mb-2">
        Algorithms / Technologies
        <span class="text-xs text-gray-500 font-normal ml-2">
          List of algorithms, models, or technologies to be used. Add one per entry.
        </span>
      </label>
      <CollapsibleListField
        v-model:items="localAlgorithms"
        label="Algorithms / Technologies"
        placeholder="e.g., BERT"
      />
    </div>

    <div>
      <label class="form-label mb-2">
        Tools / Frameworks
        <span class="text-xs text-gray-500 font-normal ml-2">
          Development tools and frameworks. Add one per entry.
        </span>
      </label>
      <CollapsibleListField
        v-model:items="localTools"
        label="Tools / Frameworks"
        placeholder="e.g., Python"
      />
    </div>

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

    <!-- Model Selection Section -->
    <div class="border-t pt-6 mt-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Model Selection</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          id="model-selection"
          label="Model Type"
          help-text="Type of base model to be used for the agentic system"
        >
          <select
            id="model-selection"
            v-model="localData.modelSelection"
            class="form-input"
            @change="update"
          >
            <option :value="undefined">Select model type</option>
            <option value="open-source">Open Source</option>
            <option value="frontier-model">Frontier Model</option>
            <option value="fine-tuned">Fine-tuned</option>
            <option value="custom">Custom</option>
            <option value="other">Other</option>
          </select>
        </FormField>

        <FormField
          id="model-name"
          label="Model Name"
          help-text="Specific model name or identifier (e.g., 'GPT-4', 'Llama 3.1', 'Claude Sonnet')"
        >
          <input
            id="model-name"
            v-model="localData.modelName"
            type="text"
            class="form-input"
            placeholder="e.g., GPT-4, Llama 3.1"
            @blur="update"
          />
        </FormField>
      </div>
    </div>

    <!-- Baseline Capability Assessment Section -->
    <div class="border-t pt-6 mt-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Baseline Capability Assessment</h3>
      <p class="text-sm text-gray-600 mb-4">
        Assess how well the naive model performs the task without any custom agentic system. This helps determine the headroom for improvement.
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          id="baseline-task-performance"
          label="Task Performance (Naive Model)"
          help-text="How well does the naive model perform the task without custom system? This measures baseline capability before adding agentic features."
        >
          <select
            id="baseline-task-performance"
            v-model="localData.baselineCapability.taskPerformance"
            class="form-input"
            @change="update"
          >
            <option :value="undefined">Select performance level</option>
            <option value="excellent">Excellent - Model handles task very well</option>
            <option value="good">Good - Model handles task adequately</option>
            <option value="moderate">Moderate - Model handles task with limitations</option>
            <option value="poor">Poor - Model struggles with the task</option>
            <option value="fails">Fails - Model cannot perform the task</option>
          </select>
        </FormField>

        <FormField
          id="baseline-success-rate"
          label="Success Rate (%)"
          help-text="Estimated success rate of naive model without custom system (0-100%)"
        >
          <input
            id="baseline-success-rate"
            v-model.number="localData.baselineCapability.successRate"
            type="number"
            min="0"
            max="100"
            class="form-input"
            placeholder="e.g., 75"
            @blur="update"
          />
        </FormField>
      </div>

      <FormField
        id="baseline-limitations"
        label="Key Limitations"
        help-text="Describe the main limitations of the naive model that prevent it from performing the task well"
      >
        <textarea
          id="baseline-limitations"
          v-model="localData.baselineCapability.limitations"
          rows="3"
          class="form-input"
          placeholder="e.g., Cannot handle custom domain terminology, fails on edge cases, lacks context awareness"
          @blur="update"
        />
      </FormField>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          id="requires-custom-instructions"
          label="Requires Custom Instructions"
          help-text="Whether the task requires extensive custom instructions or prompts to work"
        >
          <label class="form-checkbox-field">
            <input
              id="requires-custom-instructions"
              v-model="localData.baselineCapability.requiresCustomInstructions"
              type="checkbox"
              class="form-checkbox-small"
              @change="update"
            />
            <span>Task requires extensive custom instructions</span>
          </label>
        </FormField>

        <FormField
          id="custom-instructions-complexity"
          label="Custom Instructions Complexity"
          help-text="If custom instructions are required, how complex are they?"
        >
          <select
            id="custom-instructions-complexity"
            v-model="localData.baselineCapability.customInstructionsComplexity"
            class="form-input"
            :disabled="!localData.baselineCapability.requiresCustomInstructions"
            @change="update"
          >
            <option :value="undefined">Select complexity</option>
            <option value="low">Low - Simple prompts suffice</option>
            <option value="medium">Medium - Structured prompts needed</option>
            <option value="high">High - Complex, multi-step instructions required</option>
          </select>
        </FormField>
      </div>
    </div>

    <!-- Expected Gains Section -->
    <div class="border-t pt-6 mt-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Expected Gains from Agentic System</h3>
      <p class="text-sm text-gray-600 mb-4">
        Assess the expected improvement from implementing a custom agentic system compared to the baseline. High headroom indicates significant potential for improvement.
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          id="performance-improvement"
          label="Expected Performance Improvement"
          help-text="How much improvement is expected from the agentic system compared to baseline?"
        >
          <select
            id="performance-improvement"
            v-model="localData.expectedGains.performanceImprovement"
            class="form-input"
            @change="update"
          >
            <option :value="undefined">Select improvement level</option>
            <option value="minimal">Minimal - Small improvement expected</option>
            <option value="moderate">Moderate - Noticeable improvement expected</option>
            <option value="significant">Significant - Major improvement expected</option>
            <option value="transformative">Transformative - Game-changing improvement expected</option>
          </select>
        </FormField>

        <FormField
          id="headroom"
          label="Headroom for Improvement"
          help-text="The gap between baseline capability and potential. High headroom means there's much room for improvement."
        >
          <select
            id="headroom"
            v-model="localData.expectedGains.headroom"
            class="form-input"
            @change="update"
          >
            <option :value="undefined">Select headroom level</option>
            <option value="low">Low - Baseline is already good, limited improvement possible</option>
            <option value="medium">Medium - Some room for improvement</option>
            <option value="high">High - Significant room for improvement</option>
          </select>
        </FormField>
      </div>

      <FormField
        id="gains-justification"
        label="Justification for Expected Gains"
        help-text="Explain why gains are expected and what enables them (e.g., tool use, autonomy, custom workflows, domain knowledge)"
      >
        <textarea
          id="gains-justification"
          v-model="localData.expectedGains.justification"
          rows="3"
          class="form-input"
          placeholder="e.g., Adding tool use and autonomy will enable the model to handle complex multi-step workflows that it cannot do naively"
          @blur="update"
        />
      </FormField>
    </div>

    <!-- Implementation Difficulty Section -->
    <div class="border-t pt-6 mt-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Implementation Difficulty & Requirements</h3>
      <p class="text-sm text-gray-600 mb-4">
        Assess how difficult it is to add the necessary capabilities and what validation/monitoring is required.
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          id="skill-addition-difficulty"
          label="Skill Addition Difficulty"
          help-text="How difficult is it to add the necessary skills (e.g., via AGENTS.md, tools, custom instructions)?"
        >
          <select
            id="skill-addition-difficulty"
            v-model="localData.implementationDifficulty.skillAdditionDifficulty"
            class="form-input"
            @change="update"
          >
            <option :value="undefined">Select difficulty</option>
            <option value="very-easy">Very Easy - Simple configuration (e.g., AGENTS.md)</option>
            <option value="easy">Easy - Straightforward implementation</option>
            <option value="moderate">Moderate - Requires some development</option>
            <option value="difficult">Difficult - Complex implementation needed</option>
            <option value="very-difficult">Very Difficult - Major development effort</option>
          </select>
        </FormField>

        <FormField
          id="security-level"
          label="Security Level"
          help-text="Security level of the task, which affects validation and monitoring requirements"
        >
          <select
            id="security-level"
            v-model="localData.implementationDifficulty.securityLevel"
            class="form-input"
            @change="update"
          >
            <option :value="undefined">Select security level</option>
            <option value="low">Low - Minimal security requirements</option>
            <option value="medium">Medium - Standard security requirements</option>
            <option value="high">High - Enhanced security requirements</option>
            <option value="critical">Critical - Maximum security requirements</option>
          </select>
        </FormField>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          id="baseline-comparison-required"
          label="Baseline Comparison Required"
          help-text="Whether baseline comparison is necessary for validation"
        >
          <label class="form-checkbox-field">
            <input
              id="baseline-comparison-required"
              v-model="localData.implementationDifficulty.baselineComparisonRequired"
              type="checkbox"
              class="form-checkbox-small"
              @change="update"
            />
            <span>Baseline comparison required for validation</span>
          </label>
        </FormField>

        <FormField
          id="validation-monitoring-required"
          label="Validation & Monitoring Required"
          help-text="Whether validation and monitoring are required (typically depends on security level)"
        >
          <label class="form-checkbox-field">
            <input
              id="validation-monitoring-required"
              v-model="localData.implementationDifficulty.validationMonitoringRequired"
              type="checkbox"
              class="form-checkbox-small"
              @change="update"
            />
            <span>Validation and monitoring required</span>
          </label>
        </FormField>
      </div>
    </div>

    <!-- Agentic Explanation Section -->
    <div class="border-t pt-6 mt-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Agentic Capabilities</h3>
      <FormField
        id="agentic-explanation"
        label="How Agentic Capabilities Are Added"
        help-text="Explain how agentic capabilities are added to the system. Note: LLMs are not inherently agentic - agentic behavior comes from how they are used, given autonomy, tool access, and structured workflows."
      >
        <textarea
          id="agentic-explanation"
          v-model="localData.agenticExplanation"
          rows="4"
          class="form-input"
          placeholder="e.g., Agentic capabilities are added through: (1) Tool use - giving the model access to APIs and external tools, (2) Autonomy - allowing the model to make decisions and take actions, (3) Structured workflows - defining multi-step processes, (4) Domain knowledge - providing custom instructions and context. The base LLM provides reasoning and language understanding, but the agentic behavior emerges from the system architecture."
          @blur="update"
        />
      </FormField>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import FormField from '../FormField.vue'
import CollapsibleListField from '../CollapsibleListField.vue'
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
    modelSelection: feasibility?.modelSelection,
    modelName: feasibility?.modelName,
    baselineCapability: feasibility?.baselineCapability || {},
    expectedGains: feasibility?.expectedGains || {},
    implementationDifficulty: feasibility?.implementationDifficulty || {},
    agenticExplanation: feasibility?.agenticExplanation,
  }
}

const localData = ref<DeveloperFeasibility>(initLocalData())

// Ensure nested objects always exist for v-model binding
if (!localData.value.baselineCapability) {
  localData.value.baselineCapability = {}
}
if (!localData.value.expectedGains) {
  localData.value.expectedGains = {}
}
if (!localData.value.implementationDifficulty) {
  localData.value.implementationDifficulty = {}
}

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
          modelSelection: newFeasibility.modelSelection,
          modelName: newFeasibility.modelName,
          baselineCapability: newFeasibility.baselineCapability || {},
          expectedGains: newFeasibility.expectedGains || {},
          implementationDifficulty: newFeasibility.implementationDifficulty || {},
          agenticExplanation: newFeasibility.agenticExplanation,
        }
        // Ensure nested objects always exist
        if (!localData.value.baselineCapability) {
          localData.value.baselineCapability = {}
        }
        if (!localData.value.expectedGains) {
          localData.value.expectedGains = {}
        }
        if (!localData.value.implementationDifficulty) {
          localData.value.implementationDifficulty = {}
        }
        // Sync algorithms and tools arrays
        localAlgorithms.value = (newFeasibility.algorithms || []).map((a: string) => ({ value: a }))
        localTools.value = (newFeasibility.tools || []).map((t: string) => ({ value: t }))
      } else {
        // Reset to empty state when cleared
        localData.value = { 
          trlLevel: {},
          baselineCapability: {},
          expectedGains: {},
          implementationDifficulty: {},
        }
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
