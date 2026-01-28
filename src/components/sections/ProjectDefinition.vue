<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Project Definition & Context</h2>
      <p class="text-sm text-gray-600 mb-6">
        Define the core project information using <a href="https://schema.org/Project" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-800 underline" title="Schema.org Project type specification">Schema.org Project</a> and <a href="https://schema.org/ResearchProject" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-800 underline" title="Schema.org ResearchProject type specification">ResearchProject</a> types.
      </p>
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

    <div class="pt-4 border-t border-gray-200">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Project Value Summary</h3>
      
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
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue'
import FormField from '../FormField.vue'
import MultiValueInput from '../MultiValueInput.vue'
import type { ProjectDefinition } from '@/types/canvas'
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
