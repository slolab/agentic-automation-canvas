<template>
  <div class="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200">
    <!-- Collapsed View -->
    <button
      v-if="!isExpanded"
      @click="isExpanded = true"
      class="w-full text-left p-3 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset min-h-[60px]"
    >
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1.5">
            <span class="text-sm font-medium text-gray-900 truncate">
              {{ requirement.title || 'Untitled Task' }}
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
            <span
              v-if="(requirement.dependsOn || []).length > 0"
              class="flex items-center gap-1 text-gray-500 text-xs"
            >
              Depends on {{ (requirement.dependsOn || []).length }}
            </span>
            <span
              v-if="(requirement.stakeholders || []).length > 0"
              class="flex items-center gap-1 text-blue-600 text-xs"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {{ (requirement.stakeholders || []).length }} stakeholder{{ (requirement.stakeholders || []).length !== 1 ? 's' : '' }}
            </span>
            <!-- Benefit type badges -->
            <span v-if="benefitTypes.length > 0" class="flex items-center gap-1">
              <span
                v-for="type in benefitTypes"
                :key="type"
                :class="benefitTypeBadgeClass(type)"
                class="px-1.5 py-0.5 rounded text-xs font-medium"
              >
                {{ type.charAt(0).toUpperCase() + type.slice(1) }}
              </span>
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
        :id="`req-title-${index}`"
        label="Title"
        tooltip="Short display name for this task, used in lists and the dashboard."
        required
      >
        <input
          :id="`req-title-${index}`"
          :value="requirement.title || ''"
          type="text"
          class="form-input"
          placeholder="e.g., Classify and route documents"
          @input="update({ ...requirement, title: ($event.target as HTMLInputElement).value })"
        />
      </FormField>

      <FormField
        :id="`req-desc-${index}`"
        label="Description"
        tooltip="Detailed notes, links for further reading, or context. Optional."
      >
        <textarea
          :id="`req-desc-${index}`"
          :value="requirement.description || ''"
          rows="3"
          class="form-input"
          placeholder="Notes, links, references..."
          @input="update({ ...requirement, description: ($event.target as HTMLTextAreaElement).value || undefined })"
        />
      </FormField>
      
      <FormField
        :id="`req-story-${index}`"
        label="User Story"
        help-text="As a [user], I want [feature] so that [benefit]"
        tooltip="Write a user story in the format: 'As a [user type], I want [feature/action] so that [benefit/value]'. Example: 'As a data entry manager, I want documents automatically classified so that I can reduce manual sorting time by 80%'. This helps capture stakeholder values and requirements."
      >
        <textarea
          :id="`req-story-${index}`"
          :value="requirement.userStory || ''"
          rows="3"
          class="form-input"
          @input="update({ ...requirement, userStory: ($event.target as HTMLTextAreaElement).value })"
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

      <!-- Value Model Fields -->
      <div class="mt-6 pt-6 border-t-2 border-gray-200">
        <h4 class="subsubsection-header">Value Model</h4>
        
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
          help-text="Standardized category of the work unit. Select the type that best matches your unit of work."
          tooltip="Select the category that best matches your unit: <strong>Item</strong> - A processable unit (e.g. case, document, record); <strong>Interaction</strong> - User-facing interaction (e.g. message, meeting); <strong>Computation</strong> - Automated process (e.g. analysis run); <strong>Other</strong> - Something else."
          required
        >
          <select
            :id="`req-unit-category-${index}`"
            :value="requirement.unitCategory || ''"
            class="form-input"
            @change="update({ ...requirement, unitCategory: ($event.target as HTMLSelectElement).value as any || undefined })"
          >
            <option value="">Select category</option>
            <option value="item">Item</option>
            <option value="interaction">Interaction</option>
            <option value="computation">Computation</option>
            <option value="other">Other</option>
          </select>
        </FormField>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            :id="`req-volume-${index}`"
            label="Volume Per Month"
            help-text="Average number of units processed per month. Used to calculate total benefit values."
            tooltip="Enter the average number of units processed per month. This is multiplied by per-unit benefits to calculate total monthly impact."
            required
          >
            <div>
              <input
                :id="`req-volume-${index}`"
                :value="requirement.volumePerMonth || ''"
                type="number"
                min="0"
                class="form-input"
                @input="update({ ...requirement, volumePerMonth: ($event.target as HTMLInputElement).value ? parseFloat(($event.target as HTMLInputElement).value) : undefined })"
              />
              <p v-if="volumeBandHelper" class="mt-1.5 text-xs text-gray-600">
                {{ volumeBandHelper }}
              </p>
            </div>
          </FormField>

          <FormField
            :id="`req-oversight-${index}`"
            :label="`Human Oversight After Automation (${requirement.timeUnit || 'minutes'}/unit)`"
            help-text="Time required for human review per unit after the system is deployed. Subtracted from time savings. Unit matches your time benefit unit."
            tooltip="Time required for human review or oversight per unit after the envisioned system is deployed. This represents ongoing oversight costs and is subtracted from time savings. The unit automatically matches your time benefit unit."
          >
            <input
              :id="`req-oversight-${index}`"
              :value="getOversightDisplayValue()"
              type="number"
              min="0"
              step="0.1"
              class="form-input"
              @input="handleOversightChange($event)"
            />
          </FormField>
        </div>
      </div>

      <!-- Stakeholders Section -->
      <div class="mt-6 pt-6 border-t-2 border-gray-200">
        <FormField
          :id="`req-stakeholders-${index}`"
          label="Stakeholders"
          help-text="Persons with interest in this task"
          tooltip="Select stakeholders from the persons list. Stakeholders represent people with an interest in this specific task's outcomes."
        >
          <div class="space-y-2">
            <div class="flex flex-wrap gap-2">
              <span
                v-for="personId in (requirement.stakeholders || [])"
                :key="personId"
                class="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-100 text-blue-800 text-sm"
              >
                {{ getPersonName(personId) || personId }}
                <button
                  type="button"
                  @click="removeStakeholder(personId)"
                  class="text-blue-600 hover:text-red-600"
                  aria-label="Remove stakeholder"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            </div>
            <select
              :id="`req-stakeholders-${index}`"
              :value="''"
              class="form-input w-auto"
              @change="addStakeholder(($event.target as HTMLSelectElement).value)"
            >
              <option value="">Add stakeholder...</option>
              <option
                v-for="person in availablePersons"
                :key="person.id"
                :value="person.id"
              >
                {{ person.name }}{{ person.affiliation ? ` (${person.affiliation})` : '' }}
              </option>
            </select>
            <p v-if="availablePersons.length === 0" class="text-xs text-yellow-600 mt-1">
              No persons available. Please add persons in the "Persons" section first.
            </p>
          </div>
        </FormField>
      </div>

      <!-- Dependencies Section -->
      <div class="mt-6 pt-6 border-t-2 border-gray-200">
        <FormField
          :id="`req-deps-${index}`"
          label="Dependencies"
          help-text="Tasks that must be completed before this one"
          tooltip="Select tasks this task depends on. Dependencies define workflow order."
        >
          <div class="space-y-2">
            <div class="flex flex-wrap gap-2">
              <span
                v-for="depId in (requirement.dependsOn || [])"
                :key="depId"
                class="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-100 text-gray-800 text-sm"
              >
                {{ getTaskTitle(depId) || depId }}
                <button
                  type="button"
                  @click="removeDependency(depId)"
                  class="text-gray-500 hover:text-red-600"
                  aria-label="Remove dependency"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            </div>
            <select
              :id="`req-deps-${index}`"
              :value="''"
              class="form-input w-auto"
              @change="addDependency(($event.target as HTMLSelectElement).value)"
            >
              <option value="">Add dependency...</option>
              <option
                v-for="other in otherTasks"
                :key="other.id"
                :value="other.id"
              >
                {{ other.title || other.id }}
              </option>
            </select>
          </div>
        </FormField>
      </div>

      <!-- Benefits Section -->
      <div class="mt-6 pt-6 border-t-2 border-gray-200">
        <div class="flex items-center justify-between mb-4">
          <h4 class="subsubsection-header mb-0">Benefits</h4>
          <button
            @click="openBenefitsModal"
            class="btn-secondary text-sm flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Benefits
          </button>
        </div>

        <!-- Benefits Summary -->
        <div v-if="benefits.length === 0" class="text-sm text-gray-500 italic py-4 text-center bg-gray-50 rounded-lg">
          No benefits defined yet. Click "Edit Benefits" to add time, quality, risk, enablement, or cost benefits.
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="(benefit, bIndex) in benefits"
            :key="bIndex"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center gap-3">
              <span :class="benefitTypeBadgeClass(benefit.benefitType)" class="px-2 py-1 rounded text-xs font-medium">
                {{ benefit.benefitType.charAt(0).toUpperCase() + benefit.benefitType.slice(1) }}
              </span>
              <span class="text-sm font-medium text-gray-900">{{ getMetricDisplayLabel(benefit.benefitType, benefit.metricId, benefit.metricLabel) || benefit.metricLabel }}</span>
            </div>
            <div class="text-sm text-gray-600">
              {{ formatBenefitValueDisplay(benefit) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Done Button -->
      <div class="pt-4 border-t border-gray-200 mt-4">
        <button
          type="button"
          @click="isExpanded = false"
          class="btn-secondary w-full flex items-center justify-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
          </svg>
          Done (collapse)
        </button>
      </div>
    </div>

    <!-- Benefits Modal -->
    <BenefitsModal
      :is-open="isBenefitsModalOpen"
      :benefits="benefits"
      :requirement="{ timeUnit: requirement.timeUnit }"
      @update:is-open="isBenefitsModalOpen = $event"
      @save="saveBenefits"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import FormField from './FormField.vue'
import BenefitsModal from './BenefitsModal.vue'
import type { Requirement, Benefit, Person } from '@/types/canvas'
import { useCanvasData } from '@/composables/useCanvasData'
import { getMetricDisplayLabel, formatBenefitValueDisplay } from '@/data/benefitMetrics'
import { getTimeSavedPerUnit } from '@/utils/timeBenefits'
import { parseTimeUnit, fromMinutes, toMinutes, type TimeUnit } from '@/utils/timeUnitConversion'

interface Props {
  requirement: Requirement
  index: number
  update: (item: Requirement) => void
}

const props = defineProps<Props>()

// New requirements (without title) start expanded
const isExpanded = ref(!props.requirement.title || props.requirement.title.trim() === '')
const isBenefitsModalOpen = ref(false)

// Get all requirements for normalization
const { canvasData } = useCanvasData()
const allRequirements = computed(() => canvasData.value.userExpectations?.requirements || [])
const allPersons = computed(() => canvasData.value.persons || [])

// Available persons (exclude already selected stakeholders)
const availablePersons = computed(() => {
  const selected = props.requirement.stakeholders || []
  return allPersons.value.filter((p) => !selected.includes(p.id))
})

// Other tasks (exclude self and already selected) for dependency selector
const otherTasks = computed(() => {
  const deps = props.requirement.dependsOn || []
  return allRequirements.value.filter(
    (r) => r.id !== props.requirement.id && !deps.includes(r.id)
  )
})

function getTaskTitle(id: string): string {
  const req = allRequirements.value.find((r) => r.id === id)
  return req?.title || req?.description || id
}

function addDependency(id: string) {
  if (!id) return
  const deps = [...(props.requirement.dependsOn || [])]
  if (deps.includes(id)) return
  props.update({ ...props.requirement, dependsOn: [...deps, id] })
}

function removeDependency(id: string) {
  const deps = (props.requirement.dependsOn || []).filter((d) => d !== id)
  props.update({ ...props.requirement, dependsOn: deps.length > 0 ? deps : undefined })
}

function getPersonName(personId: string): string {
  const person = allPersons.value.find((p) => p.id === personId)
  return person?.name || 'Unknown Person'
}

function addStakeholder(personId: string) {
  if (!personId) return
  const stakeholders = [...(props.requirement.stakeholders || [])]
  if (stakeholders.includes(personId)) return
  props.update({ ...props.requirement, stakeholders: [...stakeholders, personId] })
}

function removeStakeholder(personId: string) {
  const stakeholders = (props.requirement.stakeholders || []).filter((s) => s !== personId)
  props.update({ ...props.requirement, stakeholders: stakeholders.length > 0 ? stakeholders : undefined })
}

// Benefits array (ensure it's always an array)
const benefits = computed(() => props.requirement.benefits || [])

// Get unique benefit types
const benefitTypes = computed(() => {
  const types = new Set(benefits.value.map(b => b.benefitType))
  return Array.from(types)
})

// Volume band helper: dynamic hint based on volume bands
const volumeBandHelper = computed(() => {
  const v = props.requirement.volumePerMonth
  if (v == null || v <= 0 || Number.isNaN(v)) return null
  if (v < 100) return 'Low volume – quick wins may suffice.'
  if (v <= 1000) return 'Medium volume – automation ROI typically strong.'
  return 'High volume – automation often essential.'
})

// Get time benefit for calculations
const timeBenefit = computed(() => {
  return benefits.value.find(b => b.benefitType === 'time')
})

// Calculate maximum total time saved across all tasks for normalization (baseline − expected) × volume
const maxTotalTimeSaved = computed(() => {
  if (allRequirements.value.length === 0) return 0
  return Math.max(...allRequirements.value.map(req => {
    const timeBen = (req.benefits || []).find(b => b.benefitType === 'time')
    if (!timeBen) return 0
    const savedPerUnit = getTimeSavedPerUnit(timeBen, req)
    const volume = req.volumePerMonth || 0
    return savedPerUnit * volume
  }))
})

// Get net savings percentage (green bar)
function getNetSavingsPercentage(): number {
  if (maxTotalTimeSaved.value === 0) return 0
  if (!timeBenefit.value) return 0
  
  const savedPerUnit = getTimeSavedPerUnit(timeBenefit.value, props.requirement)
  const oversight = props.requirement.humanOversightMinutesPerUnit || 0
  const volume = props.requirement.volumePerMonth || 0
  const netTimeSaved = Math.max(0, savedPerUnit - oversight) * volume
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

// Get oversight display value (convert from minutes to requirement's time unit)
function getOversightDisplayValue(): number | string {
  if (props.requirement.humanOversightMinutesPerUnit === undefined) {
    return ''
  }
  
  const timeUnit: TimeUnit = props.requirement.timeUnit || 'minutes'
  if (timeUnit === 'minutes') {
    return props.requirement.humanOversightMinutesPerUnit
  }
  
  // Convert from minutes to the requirement's time unit
  return fromMinutes(props.requirement.humanOversightMinutesPerUnit, timeUnit)
}

// Handle oversight change (convert from requirement's time unit to minutes for storage)
function handleOversightChange(event: Event) {
  const input = event.target as HTMLInputElement
  const value = input.value ? parseFloat(input.value) : undefined
  
  if (value === undefined) {
    props.update({ ...props.requirement, humanOversightMinutesPerUnit: undefined })
    return
  }
  
  const timeUnit: TimeUnit = props.requirement.timeUnit || 'minutes'
  // Convert from requirement's time unit to minutes for storage
  const minutesValue = toMinutes(value, timeUnit)
  
  props.update({ ...props.requirement, humanOversightMinutesPerUnit: minutesValue })
}

// Format time saved text for collapsed view (baseline − expected) × volume
const timeSavedText = computed(() => {
  if (!timeBenefit.value) return null
  
  const savedPerUnit = getTimeSavedPerUnit(timeBenefit.value, props.requirement)
  const volume = props.requirement.volumePerMonth
  
  if (savedPerUnit > 0 && volume) {
    const totalMinutes = savedPerUnit * volume
    if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60)
      const mins = Math.round(totalMinutes % 60)
      return mins > 0 ? `${hours}h ${mins}m/month` : `${hours}h/month`
    }
    return `${Math.round(totalMinutes)}m/month`
  }
  return null
})

// Badge class for benefit types
function benefitTypeBadgeClass(type: string): string {
  const classes: Record<string, string> = {
    'time': 'bg-green-100 text-green-700',
    'quality': 'bg-blue-100 text-blue-700',
    'risk': 'bg-orange-100 text-orange-700',
    'enablement': 'bg-purple-100 text-purple-700',
    'cost': 'bg-amber-100 text-amber-700'
  }
  return classes[type] || 'bg-gray-100 text-gray-700'
}

// Open benefits modal
function openBenefitsModal() {
  isBenefitsModalOpen.value = true
}

// Save benefits from modal
function saveBenefits(newBenefits: Benefit[]) {
  // Determine time unit from time benefits
  const timeBenefits = newBenefits.filter(b => b.benefitType === 'time')
  let timeUnit: 'minutes' | 'hours' | 'days' | undefined = props.requirement.timeUnit
  
  if (timeBenefits.length > 0) {
    // Parse unit from first time benefit
    const firstTimeBenefit = timeBenefits[0]
    if (firstTimeBenefit.benefitUnit) {
      const parsed = parseTimeUnit(firstTimeBenefit.benefitUnit)
      if (parsed) {
        timeUnit = parsed
      }
    }
  } else if (timeBenefits.length === 0) {
    // No time benefits, clear time unit
    timeUnit = undefined
  }
  
  props.update({ ...props.requirement, benefits: newBenefits, timeUnit })
}
</script>
