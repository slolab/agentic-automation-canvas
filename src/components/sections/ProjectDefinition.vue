<template>
  <div class="space-y-6">
    <div>
      <h2 class="section-header">Project Definition and Context</h2>
      <p class="section-description">
        What do you want to build? Define the core project information using <a href="https://schema.org/Project" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-800 underline font-medium" title="Schema.org Project type specification">Schema.org Project</a> and <a href="https://schema.org/ResearchProject" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-800 underline font-medium" title="Schema.org ResearchProject type specification">ResearchProject</a> types.
      </p>
    </div>

    <div class="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200">
      <!-- Collapsed View -->
      <button
        v-if="!isExpanded"
        @click="isExpanded = true"
        class="w-full text-left p-5 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0 space-y-4">
            <!-- Project Info -->
            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <span class="text-lg font-semibold text-gray-900 truncate">
                  {{ localData.title || 'Untitled Project' }}
                </span>
                <span
                  v-if="localData.projectStage"
                  class="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700"
                >
                  {{ localData.projectStage }}
                </span>
              </div>
              <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span v-if="localData.startDate || localData.endDate" class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span v-if="localData.startDate">{{ formatDate(localData.startDate) }}</span>
                  <span v-if="localData.startDate && localData.endDate"> - </span>
                  <span v-if="localData.endDate">{{ formatDate(localData.endDate) }}</span>
                </span>
                <span v-if="localData.headlineValue" class="flex items-center gap-1 text-green-700 font-medium">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ localData.headlineValue }}
                </span>
                <span v-if="localData.aggregateExpectedHoursSavedPerMonth" class="flex items-center gap-1 text-green-700 font-medium">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ localData.aggregateExpectedHoursSavedPerMonth }}h/month
                </span>
                <span v-if="localData.primaryValueDriver" class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  {{ localData.primaryValueDriver.charAt(0).toUpperCase() + localData.primaryValueDriver.slice(1) }}
                </span>
              </div>
              <div v-if="localDomains.length > 0 || localKeywords.length > 0" class="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                <span v-if="localDomains.length > 0">
                  <span class="font-medium">Domains:</span> {{ localDomains.map(d => d.value).join(', ') }}
                </span>
                <span v-if="localKeywords.length > 0">
                  <span class="font-medium">Keywords:</span> {{ localKeywords.map(k => k.value).join(', ') }}
                </span>
              </div>
            </div>

            <!-- Tasks Summary -->
            <div class="pt-4 border-t-2 border-gray-200">
              <div v-if="tasks.length === 0" class="text-xs text-gray-400 italic py-2">
                No tasks defined yet
              </div>
              <template v-else>
                <div class="flex items-center gap-2 mb-3">
                  <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span class="text-xs font-semibold text-gray-700 uppercase tracking-wide">Tasks ({{ tasks.length }})</span>
                </div>
                <div class="space-y-2.5">
                  <div
                    v-for="(task, taskIndex) in tasks"
                    :key="task.id"
                    class="text-xs text-gray-600 bg-gray-50 rounded-md px-3 py-2 border border-gray-200"
                  >
                    <div class="flex items-center gap-2 mb-1.5">
                      <span class="font-medium text-gray-900 truncate flex-1 text-sm">
                        {{ task.description || `Task ${taskIndex + 1}` }}
                      </span>
                      <span
                        v-if="task.priority"
                        :class="{
                          'bg-gray-100 text-gray-700': task.priority === 'low',
                          'bg-blue-100 text-blue-700': task.priority === 'medium',
                          'bg-orange-100 text-orange-700': task.priority === 'high',
                          'bg-red-100 text-red-700': task.priority === 'critical',
                        }"
                        class="px-1.5 py-0.5 rounded text-xs font-medium"
                      >
                        {{ task.priority.charAt(0).toUpperCase() + task.priority.slice(1) }}
                      </span>
                      <span
                        v-if="task.status"
                        :class="{
                          'bg-gray-100 text-gray-700': task.status === 'planned',
                          'bg-blue-100 text-blue-700': task.status === 'in-progress',
                          'bg-green-100 text-green-700': task.status === 'completed',
                          'bg-red-100 text-red-700': task.status === 'cancelled',
                        }"
                        class="px-1.5 py-0.5 rounded text-xs font-medium"
                      >
                        {{ task.status === 'in-progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1) }}
                      </span>
                    </div>
                    <div class="flex items-center gap-3 text-xs text-gray-500">
                      <span v-if="task.unitOfWork" class="flex items-center gap-1">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        {{ task.unitOfWork }}
                      </span>
                      <span v-if="getTaskTimeSaved(task)" class="flex items-center gap-1 text-green-700 font-medium">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {{ getTaskTimeSaved(task) }}
                      </span>
                      <span v-if="task.valueType && task.valueType.length > 0" class="flex items-center gap-1">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {{ task.valueType.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ') }}
                      </span>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
          <svg class="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      <!-- Expanded View -->
      <div v-else class="p-4 space-y-3">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-semibold text-gray-900">Project Details</h3>
          <button
            @click="isExpanded = false"
            class="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded p-1"
            aria-label="Collapse project details"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>

        <FormField
          id="project-title"
          label="Project Title"
          help-text="The name or title of your agentic automation project"
          :error="errors.title"
          required
        >
          <input
            id="project-title"
            v-model="localData.title"
            type="text"
            class="form-input"
            required
            @blur="update"
          />
        </FormField>

        <FormField
          id="project-description"
          label="Description"
          help-text="A detailed description of the project and its objectives"
          :error="errors.description"
          required
        >
          <textarea
            id="project-description"
            v-model="localData.description"
            rows="4"
            class="form-input"
            required
            @blur="update"
          />
        </FormField>

        <FormField
          id="project-objective"
          label="Objective"
          help-text="The main objective or goal of the project. Maps to <a href='https://schema.org/abstract' target='_blank' rel='noopener noreferrer' class='text-primary-600 hover:text-primary-800 underline' title='Schema.org abstract property'>schema:abstract</a> (summary of the project)."
        >
          <textarea
            id="project-objective"
            v-model="localData.objective"
            rows="3"
            class="form-input"
            @blur="update"
          />
        </FormField>

        <FormField
          id="project-stage"
          label="Project Stage"
          help-text="Current stage of the project lifecycle. Stages align with <a href='https://www.w3.org/TR/prov-o/#Activity' target='_blank' rel='noopener noreferrer' class='text-primary-600 hover:text-primary-800 underline' title='PROV-O Activity type'>PROV-O Activities</a> and represent major phases: Design, Development, Validation, Deployment, Monitoring."
          required
        >
          <select
            id="project-stage"
            v-model="localData.projectStage"
            class="form-input"
            @change="update"
          >
            <option value="">Select stage</option>
            <option value="Design">Design</option>
            <option value="Development">Development</option>
            <option value="Validation">Validation</option>
            <option value="Deployment">Deployment</option>
            <option value="Monitoring">Monitoring</option>
          </select>
        </FormField>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            id="project-start-date"
            label="Start Date"
            help-text="Project start date"
          >
            <input
              id="project-start-date"
              v-model="localData.startDate"
              type="date"
              class="form-input"
              @blur="update"
            />
          </FormField>

          <FormField
            id="project-end-date"
            label="End Date"
            help-text="Project end date"
          >
            <input
              id="project-end-date"
              v-model="localData.endDate"
              type="date"
              class="form-input"
              :min="localData.startDate"
              @blur="update"
            />
          </FormField>
        </div>

        <FormField
          id="project-domains"
          label="Domains"
          help-text="Research domain(s) or field(s) of application. Add one domain per entry."
        >
          <MultiValueInput
            v-model="localDomains"
            label="domain"
            :create-default="() => ({ value: '' })"
          >
            <template #input="{ item, index, update }">
              <input
                :id="`domain-${index}`"
                :value="item.value"
                type="text"
                class="form-input"
                placeholder="e.g., Biomedical"
                @input="update({ ...item, value: ($event.target as HTMLInputElement).value })"
              />
            </template>
          </MultiValueInput>
        </FormField>

        <FormField
          id="project-keywords"
          label="Keywords"
          help-text="Keywords or tags for the project. Add one keyword per entry."
        >
          <MultiValueInput
            v-model="localKeywords"
            label="keyword"
            :create-default="() => ({ value: '' })"
          >
            <template #input="{ item, index, update }">
              <input
                :id="`keyword-${index}`"
                :value="item.value"
                type="text"
                class="form-input"
                placeholder="e.g., AI"
                @input="update({ ...item, value: ($event.target as HTMLInputElement).value })"
              />
            </template>
          </MultiValueInput>
        </FormField>

        <FormField
          id="project-id"
          label="Project ID (URI/DOI)"
          help-text="Persistent identifier for the project (URI or DOI)"
        >
          <input
            id="project-id"
            v-model="localData.projectId"
            type="url"
            class="form-input"
            placeholder="https://doi.org/10.1234/example"
            @blur="update"
          />
        </FormField>

        <div class="pt-6 border-t-2 border-gray-200 mt-8">
          <h3 class="subsection-header">Project Value Summary</h3>
          
          <FormField
            id="project-headline-value"
            label="Headline Value"
            help-text="Short text summary of the project's value proposition"
          >
            <input
              id="project-headline-value"
              v-model="localData.headlineValue"
              type="text"
              class="form-input"
              placeholder="e.g., Saves 10 hours per month through automated data processing"
              @blur="update"
            />
          </FormField>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              id="project-aggregate-hours"
              label="Aggregate Expected Hours Saved Per Month"
              help-text="Total hours saved per month (computed from requirements or manually entered)"
            >
              <input
                id="project-aggregate-hours"
                v-model.number="localData.aggregateExpectedHoursSavedPerMonth"
                type="number"
                min="0"
                step="0.1"
                class="form-input"
                @blur="update"
              />
            </FormField>

            <FormField
              id="project-primary-value-driver"
              label="Primary Value Driver"
              help-text="The main type of value this project delivers"
            >
              <select
                id="project-primary-value-driver"
                v-model="localData.primaryValueDriver"
                class="form-input"
                @change="update"
              >
                <option value="">Select value driver</option>
                <option value="time">Time</option>
                <option value="quality">Quality</option>
                <option value="risk">Risk</option>
                <option value="enablement">Enablement</option>
              </select>
            </FormField>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue'
import FormField from '../FormField.vue'
import MultiValueInput from '../MultiValueInput.vue'
import type { ProjectDefinition, Requirement } from '@/types/canvas'
import { useCanvasData } from '@/composables/useCanvasData'

const { canvasData, updateProject } = useCanvasData()

// Initialize localData with proper array references
const initLocalData = (): ProjectDefinition => {
  const project = canvasData.value.project
  return {
    title: project.title || '',
    description: project.description || '',
    objective: project.objective,
    projectStage: project.projectStage,
    startDate: project.startDate,
    endDate: project.endDate,
    projectId: project.projectId,
    headlineValue: project.headlineValue,
    aggregateExpectedHoursSavedPerMonth: project.aggregateExpectedHoursSavedPerMonth,
    primaryValueDriver: project.primaryValueDriver,
  }
}

const localData = ref<ProjectDefinition>(initLocalData())

// Convert domain/keywords arrays to objects for MultiValueInput
const initDomains = () => {
  const domains = canvasData.value.project.domain || []
  return domains.map((d: string) => ({ value: d }))
}

const initKeywords = () => {
  const keywords = canvasData.value.project.keywords || []
  return keywords.map((k: string) => ({ value: k }))
}

const localDomains = ref<Array<{ value: string }>>(initDomains())
const localKeywords = ref<Array<{ value: string }>>(initKeywords())

// Get tasks for display in collapsed view
const tasks = computed(() => canvasData.value.userExpectations?.requirements || [])

// Collapsible state - start collapsed to show the nice overview, expand if project is completely empty
const isExpanded = ref(false) // Always start collapsed to show the overview

// Format date for display
function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateStr
  }
}

// Format task time saved for display
function getTaskTimeSaved(task: Requirement): string | null {
  const likely = task.timeSavedMinutesPerUnit?.likely
  const volume = task.volumePerMonth
  
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
}

const errors = computed(() => {
  const errs: Record<string, string> = {}
  if (!localData.value.title?.trim()) {
    errs.title = 'Title is required'
  }
  if (!localData.value.description?.trim()) {
    errs.description = 'Description is required'
  }
  return errs
})

let isLocalUpdate = false
let isSyncingFromCanvas = false

watch(
  () => canvasData.value.project,
  (newProject) => {
    // Don't sync if the update came from us
    if (!isLocalUpdate) {
      isSyncingFromCanvas = true
      localData.value = {
        title: newProject.title || '',
        description: newProject.description || '',
        objective: newProject.objective,
        projectStage: newProject.projectStage,
        startDate: newProject.startDate,
        endDate: newProject.endDate,
        projectId: newProject.projectId,
        headlineValue: newProject.headlineValue,
        aggregateExpectedHoursSavedPerMonth: newProject.aggregateExpectedHoursSavedPerMonth,
        primaryValueDriver: newProject.primaryValueDriver,
      }
      // Sync domain and keywords arrays
      localDomains.value = (newProject.domain || []).map((d: string) => ({ value: d }))
      localKeywords.value = (newProject.keywords || []).map((k: string) => ({ value: k }))
      // Reset flag after syncing
      nextTick(() => {
        isSyncingFromCanvas = false
      })
    }
  },
  { deep: true, immediate: false }
)

// Watch for local changes to domain and keywords
watch(localDomains, async (newDomains) => {
  // Skip if we're currently syncing from canvasData to avoid circular updates
  if (isSyncingFromCanvas) return
  
  isLocalUpdate = true
  updateProject({
    domain: newDomains.map((d) => d.value).filter((v) => v.trim()),
    keywords: localKeywords.value.map((k) => k.value).filter((v) => v.trim()),
  })
  await nextTick()
  isLocalUpdate = false
}, { deep: true, immediate: false })

watch(localKeywords, async (newKeywords) => {
  // Skip if we're currently syncing from canvasData to avoid circular updates
  if (isSyncingFromCanvas) return
  
  isLocalUpdate = true
  updateProject({
    domain: localDomains.value.map((d) => d.value).filter((v) => v.trim()),
    keywords: newKeywords.map((k) => k.value).filter((v) => v.trim()),
  })
  await nextTick()
  isLocalUpdate = false
}, { deep: true, immediate: false })

const update = async () => {
  // Skip if we're currently syncing from canvasData to avoid circular updates
  if (isSyncingFromCanvas) return
  
  isLocalUpdate = true
  updateProject(localData.value)
  await nextTick()
  isLocalUpdate = false
}
</script>
