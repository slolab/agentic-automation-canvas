<template>
  <div class="space-y-6">
    <div>
      <h2 class="section-header flex items-center gap-2">
        <span>Developer Feasibility & Technical Assessment</span>
        <InfoTooltip
          content="<strong>What goes here:</strong> Technical assessment including Technology Readiness Level (TRL), risks, technologies, model selection, baseline capability, and expected gains.<br/><br/><strong>TRL (Technology Readiness Level):</strong> Measures maturity from 1 (basic research) to 9 (operational). Track current and target TRL to measure progress.<br/><br/><strong>Baseline Assessment:</strong> Critical for understanding improvement potential. Assess how well the naive model performs without agentic capabilities - this shows headroom for improvement.<br/><br/><strong>Workflow tip:</strong> Fill TRL and risk first, then assess baseline capability. Expected gains should align with baseline limitations."
          position="top"
        />
      </h2>
      <p class="section-description">
        Assess technical feasibility, Technology Readiness Level (TRL), risks, and required technologies.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        id="trl-current"
        label="Current TRL"
        help-text="Current <a href='https://en.wikipedia.org/wiki/Technology_readiness_level' target='_blank' rel='noopener noreferrer' class='text-primary-600 hover:text-primary-800 underline' title='Technology Readiness Level (TRL) scale'>Technology Readiness Level (TRL)</a> (1-9). TRL measures the maturity of a technology, from basic research (1) to proven in operational environment (9)."
        tooltip="Technology Readiness Level (TRL) measures maturity from 1-9: <strong>1-3</strong> - Research (basic principles to proof of concept); <strong>4-6</strong> - Development (lab validation to demonstration); <strong>7-9</strong> - Deployment (prototype to operational). Select your current TRL to track progress. Example: If you have a working prototype, select TRL 7."
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
        label="Target TRL"
        help-text="Target <a href='https://en.wikipedia.org/wiki/Technology_readiness_level' target='_blank' rel='noopener noreferrer' class='text-primary-600 hover:text-primary-800 underline' title='Technology Readiness Level (TRL) scale'>Technology Readiness Level (TRL)</a> (1-9). The TRL you aim to achieve by the end of the project."
        tooltip="The TRL you aim to achieve by project completion. This helps set goals and track progress. Typically, projects aim to advance 2-3 levels. Example: If you're at TRL 4 (lab validation) and want to reach TRL 7 (prototype demonstration), select TRL 7."
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
      tooltip="Assess overall technical risk: <strong>Low</strong> - Well-understood technology, minimal challenges; <strong>Medium</strong> - Some unknowns or moderate complexity; <strong>High</strong> - Significant technical challenges or unproven approaches; <strong>Critical</strong> - Very high risk, may fail. This helps prioritize risk mitigation."
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
      tooltip="Estimate the effort required for implementation. Can be in time (e.g., '6 months') or person-hours (e.g., '500 person-hours'). Be realistic - consider development, testing, and deployment. Example: '3 months development + 1 month testing' or '400 person-hours'."
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
      tooltip="Add any additional notes about technical feasibility, challenges, dependencies, or considerations. This helps document technical context and risks. Examples: 'Requires API access to external system', 'Depends on model fine-tuning capabilities', 'May need custom tool development'."
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
          tooltip="Select the type of base model: <strong>Open Source</strong> - Publicly available models (e.g., Llama, Mistral); <strong>Frontier Model</strong> - Latest commercial models (e.g., GPT-4, Claude); <strong>Fine-tuned</strong> - Base model customized for your domain; <strong>Custom</strong> - Custom-built model; <strong>Other</strong> - Different type. This helps understand model capabilities and costs."
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
          help-text="Specific model name or identifier (e.g., 'GPT-5', 'Claude 4.5', 'Gemini 2.5', 'Llama 3.2')"
          tooltip="Enter the specific model name or version you're using. Include version numbers for tracking. Examples: 'GPT-4', 'Claude 3.5 Sonnet', 'Gemini 2.0', 'Llama 3.1 70B'. This helps track which model versions were used and enables reproducibility."
        >
          <input
            id="model-name"
            v-model="localData.modelName"
            type="text"
            class="form-input"
            placeholder="e.g., GPT-5, Claude 4.5, Gemini 2.5"
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
          tooltip="Assess how well the base model performs without any custom agentic system: <strong>Excellent</strong> - Handles task very well; <strong>Good</strong> - Handles adequately; <strong>Moderate</strong> - Works with limitations; <strong>Poor</strong> - Struggles significantly; <strong>Fails</strong> - Cannot perform. This baseline helps measure improvement from adding agentic capabilities."
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
          tooltip="Enter the estimated success rate (0-100%) of the naive model without custom system. This quantifies baseline performance. Example: If the model correctly handles 75% of cases without customization, enter 75. This helps quantify the improvement potential."
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
        tooltip="Describe the main limitations that prevent the naive model from performing well. Examples: 'Cannot handle custom domain terminology', 'Fails on edge cases', 'Lacks context awareness', 'Cannot access external data sources', 'No multi-step reasoning capability'. These limitations justify why agentic capabilities are needed."
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
          tooltip="Check if the task requires extensive custom instructions or prompts to work properly. If the naive model needs detailed, task-specific instructions to perform adequately, check this. This indicates that the task is not straightforward for the base model."
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
          tooltip="If custom instructions are required, assess their complexity: <strong>Low</strong> - Simple prompts suffice (e.g., 'Classify documents by type'); <strong>Medium</strong> - Structured prompts needed (e.g., multi-step instructions); <strong>High</strong> - Complex, multi-step instructions required (e.g., detailed workflows with conditional logic). Higher complexity suggests more benefit from agentic systems."
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
          tooltip="Assess expected improvement from adding agentic capabilities: <strong>Minimal</strong> - Small improvement (e.g., 5-10%); <strong>Moderate</strong> - Noticeable improvement (e.g., 20-30%); <strong>Significant</strong> - Major improvement (e.g., 50%+); <strong>Transformative</strong> - Game-changing (e.g., enables previously impossible tasks). This helps justify the investment in agentic capabilities."
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
          tooltip="Assess the gap between current baseline and potential: <strong>Low</strong> - Baseline is already good, limited room for improvement; <strong>Medium</strong> - Some room for improvement; <strong>High</strong> - Significant room for improvement. High headroom indicates the baseline is far from optimal, suggesting high potential value from agentic capabilities."
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
        tooltip="Explain why you expect gains and what enables them. Examples: 'Tool use enables access to external data sources', 'Autonomy allows multi-step decision making', 'Custom workflows handle complex edge cases', 'Domain knowledge improves accuracy'. This justifies the expected improvement and helps others understand what makes the system agentic."
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
          tooltip="Assess implementation difficulty: <strong>Very Easy</strong> - Simple configuration (e.g., AGENTS.md file); <strong>Easy</strong> - Straightforward implementation; <strong>Moderate</strong> - Requires some development; <strong>Difficult</strong> - Complex implementation; <strong>Very Difficult</strong> - Major development effort. Lower difficulty suggests faster implementation and lower risk."
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
          tooltip="Assess security level: <strong>Low</strong> - Minimal security (e.g., internal tools); <strong>Medium</strong> - Standard security (e.g., business data); <strong>High</strong> - Enhanced security (e.g., sensitive data); <strong>Critical</strong> - Maximum security (e.g., financial, medical, compliance-critical). Higher security levels require more validation and monitoring."
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
          tooltip="Check if you need to compare automated results against baseline (manual) results for validation. This is typically required for high-stakes tasks or when measuring improvement. Baseline comparison helps validate that automation actually improves outcomes."
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
          tooltip="Check if ongoing validation and monitoring are required. This is typically needed for high-security tasks, compliance-critical applications, or when errors have significant impact. Validation ensures continued correctness; monitoring tracks performance over time."
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
        tooltip="Explain how you add agentic capabilities. LLMs aren't inherently agentic - agentic behavior comes from: (1) <strong>Tool use</strong> - Access to APIs, databases, external tools; (2) <strong>Autonomy</strong> - Ability to make decisions and take actions; (3) <strong>Structured workflows</strong> - Multi-step processes with decision points; (4) <strong>Domain knowledge</strong> - Custom instructions, context, and knowledge bases. Describe your specific approach."
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
import InfoTooltip from '../InfoTooltip.vue'
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
