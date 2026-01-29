<template>
  <div class="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200">
    <!-- Collapsed View -->
    <button
      v-if="!isExpanded"
      @click="isExpanded = true"
      class="w-full text-left p-3 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset"
    >
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1.5">
            <span class="text-sm font-medium text-gray-900 truncate">
              {{ requirement.description || 'Untitled Task' }}
            </span>
            <span
              v-if="requirement.priority"
              :class="{
                'bg-gray-100 text-gray-700': requirement.priority === 'low',
                'bg-blue-100 text-blue-700': requirement.priority === 'medium',
                'bg-orange-100 text-orange-700': requirement.priority === 'high',
                'bg-red-100 text-red-700': requirement.priority === 'critical',
              }"
              class="px-2 py-0.5 rounded text-xs font-medium"
            >
              {{ requirement.priority.charAt(0).toUpperCase() + requirement.priority.slice(1) }}
            </span>
            <span
              v-if="requirement.status"
              :class="{
                'bg-gray-100 text-gray-700': requirement.status === 'planned',
                'bg-blue-100 text-blue-700': requirement.status === 'in-progress',
                'bg-green-100 text-green-700': requirement.status === 'completed',
                'bg-red-100 text-red-700': requirement.status === 'cancelled',
              }"
              class="px-2 py-0.5 rounded text-xs font-medium"
            >
              {{ requirement.status === 'in-progress' ? 'In Progress' : requirement.status.charAt(0).toUpperCase() + requirement.status.slice(1) }}
            </span>
          </div>
          <div class="flex items-center gap-4 text-xs text-gray-600">
            <span v-if="requirement.unitOfWork" class="flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {{ requirement.unitOfWork }}
            </span>
            <span v-if="timeSavedText" class="flex items-center gap-1 text-green-700 font-medium">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ timeSavedText }}
            </span>
            <span v-if="requirement.valueType && requirement.valueType.length > 0" class="flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ valueTypesText }}
            </span>
          </div>
          <!-- Time savings bar -->
          <div v-if="maxTotalTimeSaved > 0" class="mt-2">
            <div class="h-1.5 bg-gray-200 rounded-full overflow-hidden relative">
              <!-- Net savings bar (green) -->
              <div
                v-if="getNetSavingsPercentage() > 0"
                class="h-full bg-green-500 transition-all absolute left-0 top-0"
                :style="{ width: `${getNetSavingsPercentage()}%` }"
              />
              <!-- Oversight bar (grey, shows time lost to oversight) -->
              <div
                v-if="getOversightPercentage() > 0"
                class="h-full bg-gray-400 transition-all absolute top-0"
                :style="{ 
                  width: `${getOversightPercentage()}%`,
                  left: `${getNetSavingsPercentage()}%`
                }"
              />
            </div>
          </div>
        </div>
        <svg class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </button>

    <!-- Expanded View -->
    <div v-else class="p-4 space-y-3">
      <div class="flex items-center justify-between mb-2">
        <h4 class="text-sm font-semibold text-gray-900">Task {{ index + 1 }}</h4>
        <button
          @click="isExpanded = false"
          class="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded p-1"
          aria-label="Collapse task"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>

      <FormField
        :id="`req-desc-${index}`"
        label="Description"
        tooltip="A clear description of what this automation task does. Tasks are represented as P-Plan Steps (extending PROV-O Plan) and should describe a specific automation activity. Example: 'Automatically classify incoming documents by type and route to appropriate team members'."
        required
      >
        <textarea
          :id="`req-desc-${index}`"
          :value="requirement.description"
          rows="2"
          class="form-input"
          @input="update({ ...requirement, description: ($event.target as HTMLTextAreaElement).value })"
        />
      </FormField>
      
      <FormField
        :id="`req-story-${index}`"
        label="User Story"
        help-text="As a [user], I want [feature] so that [benefit]"
        tooltip="Write a user story in the format: 'As a [user type], I want [feature/action] so that [benefit/value]'. Example: 'As a data entry manager, I want documents automatically classified so that I can reduce manual sorting time by 80%'. This helps capture stakeholder values and requirements."
      >
        <input
          :id="`req-story-${index}`"
          :value="requirement.userStory || ''"
          type="text"
          class="form-input"
          @input="update({ ...requirement, userStory: ($event.target as HTMLInputElement).value })"
        />
      </FormField>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          :id="`req-priority-${index}`"
          label="Priority"
          tooltip="Set the priority level for this task: <strong>Low</strong> - Nice to have; <strong>Medium</strong> - Important; <strong>High</strong> - Critical for success; <strong>Critical</strong> - Blocking or essential. Priority helps prioritize development and track which tasks deliver the most value."
        >
          <select
            :id="`req-priority-${index}`"
            :value="requirement.priority || ''"
            class="form-input"
            @change="update({ ...requirement, priority: ($event.target as HTMLSelectElement).value as any })"
          >
            <option value="">Select priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </FormField>

        <FormField
          :id="`req-status-${index}`"
          label="Status"
          tooltip="Track the current status: <strong>Planned</strong> - Not yet started; <strong>In Progress</strong> - Currently being developed; <strong>Completed</strong> - Finished and deployed; <strong>Cancelled</strong> - No longer pursued. Status helps track progress through governance stages."
        >
          <select
            :id="`req-status-${index}`"
            :value="requirement.status || ''"
            class="form-input"
            @change="update({ ...requirement, status: ($event.target as HTMLSelectElement).value as any })"
          >
            <option value="">Select status</option>
            <option value="planned">Planned</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </FormField>
      </div>

      <!-- Value Model Fields (M0 - Required) -->
      <div class="mt-6 pt-6 border-t-2 border-gray-200">
        <h4 class="subsubsection-header">Value Model (M0)</h4>
        
        <FormField
          :id="`req-unit-${index}`"
          label="Unit of Work"
          help-text="The specific work item being automated (e.g., 'one document', 'one customer inquiry', 'one analysis run'). This defines what one 'unit' means for volume and time calculations."
          tooltip="Define what one 'unit' of work means for this task. This is critical for calculating total time savings. Examples: 'one document', 'one customer inquiry', 'one staging decision', 'one analysis run'. Be specific - 'one document' is better than 'document processing'. This unit is used with Volume Per Month to calculate total savings."
          required
        >
          <input
            :id="`req-unit-${index}`"
            :value="requirement.unitOfWork || ''"
            type="text"
            class="form-input"
            placeholder="e.g., one staging decision"
            @input="update({ ...requirement, unitOfWork: ($event.target as HTMLInputElement).value })"
          />
        </FormField>

        <FormField
          :id="`req-unit-category-${index}`"
          label="Unit Category"
          help-text="Standardized category of the work unit. Select the type that best matches your unit of work (case, document, record, message, analysis run, meeting, or other)."
          tooltip="Select the standardized category that best matches your unit: <strong>Case</strong> - A case file or case record; <strong>Document</strong> - A document or file; <strong>Record</strong> - A data record or entry; <strong>Message</strong> - An email, message, or communication; <strong>Analysis Run</strong> - An analysis or computation; <strong>Meeting</strong> - A meeting or session; <strong>Other</strong> - Something else. Standardization enables comparison across projects."
          required
        >
          <select
            :id="`req-unit-category-${index}`"
            :value="requirement.unitCategory || ''"
            class="form-input"
            @change="update({ ...requirement, unitCategory: ($event.target as HTMLSelectElement).value as any || undefined })"
          >
            <option value="">Select category</option>
            <option value="case">Case</option>
            <option value="document">Document</option>
            <option value="record">Record</option>
            <option value="message">Message</option>
            <option value="analysisRun">Analysis Run</option>
            <option value="meeting">Meeting</option>
            <option value="other">Other</option>
          </select>
        </FormField>

        <FormField
          :id="`req-volume-${index}`"
          label="Volume Per Month"
          help-text="Average number of units processed per month. Used to calculate total time savings (volume × time saved per unit)."
          tooltip="Enter the average number of units processed per month. This is multiplied by 'Time Saved Per Unit' to calculate total monthly time savings. Example: If you process 100 documents per month and save 5 minutes per document, total savings = 100 × 5 = 500 minutes/month. Use realistic averages - consider seasonal variations."
          required
        >
          <input
            :id="`req-volume-${index}`"
            :value="requirement.volumePerMonth || ''"
            type="number"
            min="0"
            class="form-input"
            @input="update({ ...requirement, volumePerMonth: ($event.target as HTMLInputElement).value ? parseFloat(($event.target as HTMLInputElement).value) : undefined })"
          />
        </FormField>

        <FormField
          :id="`req-baseline-${index}`"
          label="Baseline Minutes Per Unit"
          help-text="Current time spent per unit before automation. Enter a single number (average) or use a 3-point estimate (best/likely/worst) if there's significant variation."
          tooltip="Enter how many minutes it currently takes to process one unit manually (before automation). This is your baseline. If processing time varies significantly, you can use a 3-point estimate (best/likely/worst) by entering ranges. Example: If documents take 10-15 minutes on average, enter 12.5. This baseline is compared to time saved to show improvement."
          required
        >
          <input
            :id="`req-baseline-${index}`"
            :value="typeof requirement.baselineMinutesPerUnit === 'number' ? requirement.baselineMinutesPerUnit : ''"
            type="number"
            min="0"
            class="form-input"
            placeholder="Single number"
            @input="update({ ...requirement, baselineMinutesPerUnit: ($event.target as HTMLInputElement).value ? parseFloat(($event.target as HTMLInputElement).value) : undefined })"
          />
        </FormField>

        <div class="grid grid-cols-3 gap-2">
          <FormField
            :id="`req-saved-best-${index}`"
            label="Time Saved (Best)"
            help-text="Best case scenario: maximum minutes saved per unit (optimistic estimate)"
            tooltip="Enter the best-case scenario: the maximum minutes you could save per unit in ideal conditions. This is your optimistic estimate. Use this when there's significant uncertainty and you want to capture the full range. Example: If automation could save up to 8 minutes per document in the best case, enter 8."
          >
            <input
              :id="`req-saved-best-${index}`"
              :value="requirement.timeSavedMinutesPerUnit?.best || ''"
              type="number"
              min="0"
              class="form-input"
              @input="update({ 
                ...requirement, 
                timeSavedMinutesPerUnit: { 
                  ...(requirement.timeSavedMinutesPerUnit || { likely: 0, worst: 0 }), 
                  best: ($event.target as HTMLInputElement).value ? parseFloat(($event.target as HTMLInputElement).value) : 0 
                } 
              })"
            />
          </FormField>
          <FormField
            :id="`req-saved-likely-${index}`"
            label="Time Saved (Likely)"
            help-text="Most likely scenario: expected minutes saved per unit (realistic estimate). This is the primary value used for calculations."
            tooltip="Enter your realistic estimate: the most likely minutes saved per unit. This is the primary value used for all calculations (total time saved, dashboard metrics, etc.). Be realistic - this should be what you actually expect, not your best-case scenario. Example: If you realistically expect to save 5 minutes per document, enter 5."
            required
          >
            <input
              :id="`req-saved-likely-${index}`"
              :value="requirement.timeSavedMinutesPerUnit?.likely || ''"
              type="number"
              min="0"
              class="form-input"
              @input="update({ 
                ...requirement, 
                timeSavedMinutesPerUnit: { 
                  ...(requirement.timeSavedMinutesPerUnit || { best: 0, worst: 0 }), 
                  likely: ($event.target as HTMLInputElement).value ? parseFloat(($event.target as HTMLInputElement).value) : 0 
                } 
              })"
            />
          </FormField>
          <FormField
            :id="`req-saved-worst-${index}`"
            label="Time Saved (Worst)"
            help-text="Worst case scenario: minimum minutes saved per unit (conservative estimate)"
            tooltip="Enter the worst-case scenario: the minimum minutes you would save per unit even if things don't go perfectly. This is your conservative estimate. Use this to understand the lower bound of value. Example: If automation would save at least 3 minutes per document even in worst case, enter 3."
          >
            <input
              :id="`req-saved-worst-${index}`"
              :value="requirement.timeSavedMinutesPerUnit?.worst || ''"
              type="number"
              min="0"
              class="form-input"
              @input="update({ 
                ...requirement, 
                timeSavedMinutesPerUnit: { 
                  ...(requirement.timeSavedMinutesPerUnit || { best: 0, likely: 0 }), 
                  worst: ($event.target as HTMLInputElement).value ? parseFloat(($event.target as HTMLInputElement).value) : 0 
                } 
              })"
            />
          </FormField>
        </div>

        <FormField
          :id="`req-value-type-${index}`"
          label="Value Type"
          help-text="Select all value types this task delivers: Time (saves time), Quality (improves accuracy/consistency), Risk (reduces errors/compliance issues), Enablement (enables new capabilities)"
          tooltip="Select all value types this task delivers (you can select multiple): <strong>Time</strong> - Saves time through automation; <strong>Quality</strong> - Improves accuracy, consistency, or outcomes; <strong>Risk</strong> - Reduces errors, compliance issues, or operational risks; <strong>Enablement</strong> - Enables new capabilities or workflows. Tasks often deliver multiple types of value."
        >
          <div class="flex flex-wrap gap-3">
            <label class="form-checkbox-field">
              <input
                type="checkbox"
                :checked="requirement.valueType?.includes('time') || false"
                class="form-checkbox-small"
                @change="handleValueTypeChange('time', $event)"
              />
              <span>Time</span>
            </label>
            <label class="form-checkbox-field">
              <input
                type="checkbox"
                :checked="requirement.valueType?.includes('quality') || false"
                class="form-checkbox-small"
                @change="handleValueTypeChange('quality', $event)"
              />
              <span>Quality</span>
            </label>
            <label class="form-checkbox-field">
              <input
                type="checkbox"
                :checked="requirement.valueType?.includes('risk') || false"
                class="form-checkbox-small"
                @change="handleValueTypeChange('risk', $event)"
              />
              <span>Risk</span>
            </label>
            <label class="form-checkbox-field">
              <input
                type="checkbox"
                :checked="requirement.valueType?.includes('enablement') || false"
                class="form-checkbox-small"
                @change="handleValueTypeChange('enablement', $event)"
              />
              <span>Enablement</span>
            </label>
          </div>
        </FormField>
      </div>

      <!-- Value Model Fields (M1/M2 - Optional) -->
      <div class="mt-6 pt-6 border-t-2 border-gray-200">
        <h4 class="subsubsection-header text-gray-600">Value Model (M1/M2 - Optional)</h4>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            :id="`req-rework-${index}`"
            label="Rework Rate (%)"
            help-text="Percentage of units requiring rework due to errors or quality issues. Used to calculate quality impact."
            tooltip="Enter the percentage of units that currently require rework due to errors or quality issues. This helps quantify quality improvements. Example: If 15% of documents need rework due to classification errors, enter 15. After automation, this should decrease, showing quality value."
          >
            <input
              :id="`req-rework-${index}`"
              :value="requirement.reworkRate || ''"
              type="number"
              min="0"
              max="100"
              class="form-input"
              @input="update({ ...requirement, reworkRate: ($event.target as HTMLInputElement).value ? parseFloat(($event.target as HTMLInputElement).value) : undefined })"
            />
          </FormField>

          <FormField
            :id="`req-error-cost-${index}`"
            label="Error Cost"
            help-text="Estimated cost or impact of errors (can be a number or descriptive text). Used to quantify risk reduction value."
            tooltip="Estimate the cost or impact of errors. This can be a number (e.g., '$500 per error') or descriptive text (e.g., 'Compliance violation risk'). This helps quantify the risk reduction value of automation. Example: 'Each misclassified document costs $50 in rework and delays' or 'High risk of regulatory non-compliance'."
          >
            <input
              :id="`req-error-cost-${index}`"
              :value="requirement.errorCost || ''"
              type="text"
              class="form-input"
              @input="update({ ...requirement, errorCost: ($event.target as HTMLInputElement).value || undefined })"
            />
          </FormField>

          <FormField
            :id="`req-oversight-${index}`"
            label="Human Oversight Minutes Per Unit"
            help-text="Time required for human review/oversight per unit. This is subtracted from time saved to calculate net time savings. If automation requires no oversight, enter 0."
            tooltip="Enter the time required for human review or oversight per unit. This is subtracted from time saved to calculate net time savings. If automation requires no human oversight, enter 0. Example: If each automated document needs 2 minutes of human review, enter 2. Net savings = Time Saved - Oversight Time. This shows realistic time savings after accounting for oversight."
          >
            <input
              :id="`req-oversight-${index}`"
              :value="requirement.humanOversightMinutesPerUnit || ''"
              type="number"
              min="0"
              class="form-input"
              @input="update({ ...requirement, humanOversightMinutesPerUnit: ($event.target as HTMLInputElement).value ? parseFloat(($event.target as HTMLInputElement).value) : undefined })"
            />
          </FormField>

          <FormField
            :id="`req-confidence-user-${index}`"
            label="User Confidence"
            help-text="User's confidence level in the time savings estimates (low/medium/high)"
            tooltip="The user's/stakeholder's confidence in the time savings estimates: <strong>Low</strong> - Estimates are uncertain or preliminary; <strong>Medium</strong> - Reasonable confidence based on experience; <strong>High</strong> - High confidence based on data or pilot testing. This helps assess estimate reliability."
          >
            <select
              :id="`req-confidence-user-${index}`"
              :value="requirement.confidenceUser || ''"
              class="form-input"
              @change="update({ ...requirement, confidenceUser: ($event.target as HTMLSelectElement).value || undefined })"
            >
              <option value="">Select confidence</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </FormField>

          <FormField
            :id="`req-confidence-dev-${index}`"
            label="Developer Confidence"
            help-text="Developer's confidence level in technical feasibility and implementation estimates (low/medium/high)"
            tooltip="The developer's confidence in technical feasibility and implementation estimates: <strong>Low</strong> - Uncertain feasibility or high technical risk; <strong>Medium</strong> - Feasible but may have challenges; <strong>High</strong> - High confidence in implementation. This helps assess technical risk and feasibility."
          >
            <select
              :id="`req-confidence-dev-${index}`"
              :value="requirement.confidenceDev || ''"
              class="form-input"
              @change="update({ ...requirement, confidenceDev: ($event.target as HTMLSelectElement).value || undefined })"
            >
              <option value="">Select confidence</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </FormField>
        </div>

        <FormField
          :id="`req-assumptions-${index}`"
          label="Assumptions"
          help-text="Key assumptions underlying the time savings estimates (e.g., document formats, complexity levels, edge cases)"
          tooltip="Document key assumptions that underlie your time savings estimates. This is critical for validation and helps others understand the context. Examples: 'Assumes standard document formats', 'Based on average complexity documents', 'Does not account for edge cases requiring manual review', 'Assumes 90% automation success rate'. These assumptions help validate estimates later."
        >
          <textarea
            :id="`req-assumptions-${index}`"
            :value="requirement.assumptions || ''"
            rows="2"
            class="form-input"
            @input="update({ ...requirement, assumptions: ($event.target as HTMLTextAreaElement).value || undefined })"
          />
        </FormField>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import FormField from './FormField.vue'
import type { Requirement } from '@/types/canvas'
import { useCanvasData } from '@/composables/useCanvasData'

interface Props {
  requirement: Requirement
  index: number
  update: (item: Requirement) => void
}

const props = defineProps<Props>()
// New requirements (without description) start expanded
const isExpanded = ref(!props.requirement.description || props.requirement.description.trim() === '')

// Get all requirements for normalization
const { canvasData } = useCanvasData()
const allRequirements = computed(() => canvasData.value.userExpectations?.requirements || [])

// Calculate maximum total time saved across all tasks for normalization
const maxTotalTimeSaved = computed(() => {
  if (allRequirements.value.length === 0) return 0
  return Math.max(...allRequirements.value.map(req => {
    const timeSaved = req.timeSavedMinutesPerUnit?.likely || 0
    const volume = req.volumePerMonth || 0
    return timeSaved * volume
  }))
})

// Get net savings percentage (green bar)
function getNetSavingsPercentage(): number {
  if (maxTotalTimeSaved.value === 0) return 0
  const timeSaved = props.requirement.timeSavedMinutesPerUnit?.likely || 0
  const oversight = props.requirement.humanOversightMinutesPerUnit || 0
  const volume = props.requirement.volumePerMonth || 0
  const netTimeSaved = Math.max(0, timeSaved - oversight) * volume
  return Math.round((netTimeSaved / maxTotalTimeSaved.value) * 100)
}

// Get oversight percentage (grey bar)
function getOversightPercentage(): number {
  if (maxTotalTimeSaved.value === 0) return 0
  const oversight = props.requirement.humanOversightMinutesPerUnit || 0
  const volume = props.requirement.volumePerMonth || 0
  const oversightTime = oversight * volume
  return Math.round((oversightTime / maxTotalTimeSaved.value) * 100)
}

// Format time saved text for collapsed view
const timeSavedText = computed(() => {
  const likely = props.requirement.timeSavedMinutesPerUnit?.likely
  const volume = props.requirement.volumePerMonth
  
  if (likely && volume) {
    const totalMinutes = likely * volume
    if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60)
      const mins = Math.round(totalMinutes % 60)
      return mins > 0 ? `${hours}h ${mins}m/month` : `${hours}h/month`
    }
    return `${Math.round(totalMinutes)}m/month`
  }
  return null
})

// Format value types text
const valueTypesText = computed(() => {
  if (!props.requirement.valueType || props.requirement.valueType.length === 0) {
    return null
  }
  return props.requirement.valueType.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ')
})

// Handle value type checkbox changes
function handleValueTypeChange(
  valueType: 'time' | 'quality' | 'risk' | 'enablement',
  event: Event
) {
  const checked = (event.target as HTMLInputElement).checked
  const currentTypes = props.requirement.valueType || []
  let newTypes: Array<'time' | 'quality' | 'risk' | 'enablement'>
  
  if (checked) {
    newTypes = [...currentTypes, valueType]
  } else {
    newTypes = currentTypes.filter(t => t !== valueType)
  }
  
  props.update({ ...props.requirement, valueType: newTypes.length > 0 ? newTypes : undefined })
}

</script>
