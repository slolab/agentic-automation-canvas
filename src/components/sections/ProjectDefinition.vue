<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Project Definition & Context</h2>
      <p class="text-sm text-gray-600 mb-6">
        Define the core project information using Schema.org Project and ResearchProject types.
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
      help-text="The main objective or goal of the project"
    >
      <textarea
        id="project-objective"
        v-model="localData.objective"
        rows="3"
        class="form-input"
        @blur="update"
      />
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
      id="project-domain"
      label="Domain"
      help-text="Research domain(s) or field(s) of application"
    >
      <input
        id="project-domain"
        v-model="domainInput"
        type="text"
        class="form-input"
        placeholder="e.g., Biomedical, Computer Science"
        @keydown.enter.prevent="addDomain"
      />
      <div v-if="localData.domain && localData.domain.length > 0" class="mt-2 flex flex-wrap gap-2">
        <span
          v-for="(domain, index) in localData.domain"
          :key="index"
          class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
        >
          {{ domain }}
          <button
            type="button"
            @click="removeDomain(index)"
            class="ml-2 text-primary-600 hover:text-primary-800"
            aria-label="Remove domain"
          >
            ×
          </button>
        </span>
      </div>
    </FormField>

    <FormField
      id="project-keywords"
      label="Keywords"
      help-text="Keywords or tags for the project"
    >
      <input
        id="project-keywords"
        v-model="keywordInput"
        type="text"
        class="form-input"
        placeholder="e.g., AI, automation, machine learning"
        @keydown.enter.prevent="addKeyword"
      />
      <div v-if="localData.keywords && localData.keywords.length > 0" class="mt-2 flex flex-wrap gap-2">
        <span
          v-for="(keyword, index) in localData.keywords"
          :key="index"
          class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
        >
          {{ keyword }}
          <button
            type="button"
            @click="removeKeyword(index)"
            class="ml-2 text-gray-600 hover:text-gray-800"
            aria-label="Remove keyword"
          >
            ×
          </button>
        </span>
      </div>
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
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import FormField from '../FormField.vue'
import type { ProjectDefinition } from '@/types/canvas'
import { useCanvasData } from '@/composables/useCanvasData'

const { canvasData, updateProject } = useCanvasData()

const localData = ref<ProjectDefinition>({
  ...canvasData.value.project,
})

const domainInput = ref('')
const keywordInput = ref('')

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

watch(
  () => canvasData.value.project,
  (newProject) => {
    localData.value = { ...newProject }
  },
  { deep: true }
)

const update = () => {
  updateProject(localData.value)
}

const addDomain = () => {
  if (domainInput.value.trim()) {
    if (!localData.value.domain) {
      localData.value.domain = []
    }
    if (!localData.value.domain.includes(domainInput.value.trim())) {
      localData.value.domain.push(domainInput.value.trim())
      domainInput.value = ''
      update()
    }
  }
}

const removeDomain = (index: number) => {
  if (localData.value.domain) {
    localData.value.domain.splice(index, 1)
    update()
  }
}

const addKeyword = () => {
  if (keywordInput.value.trim()) {
    if (!localData.value.keywords) {
      localData.value.keywords = []
    }
    if (!localData.value.keywords.includes(keywordInput.value.trim())) {
      localData.value.keywords.push(keywordInput.value.trim())
      keywordInput.value = ''
      update()
    }
  }
}

const removeKeyword = (index: number) => {
  if (localData.value.keywords) {
    localData.value.keywords.splice(index, 1)
    update()
  }
}
</script>
