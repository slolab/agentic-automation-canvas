<template>
  <div class="w-full">
    <div
      v-if="lastDiagnostics.length > 0"
      class="mb-4 flex items-start justify-between gap-4 rounded-lg border border-amber-200 bg-amber-50 px-5 py-3"
    >
      <div class="min-w-0 flex-1">
        <p class="text-sm font-medium text-amber-800">Canvas notices</p>
        <p class="mt-1 text-sm text-amber-700">
          The canvas was opened with all safely readable values. Some data did not match the current format:
        </p>
        <ul class="mt-1 list-inside list-disc text-sm text-amber-700">
          <li
            v-for="(diagnostic, index) in lastDiagnostics"
            :key="`${diagnostic.code}:${diagnostic.path}:${index}`"
          >
            [{{ diagnostic.code }}] {{ diagnostic.path }}: {{ diagnostic.message }}
          </li>
        </ul>
      </div>
      <button
        type="button"
        class="shrink-0 rounded p-1 text-amber-700 hover:bg-amber-100 hover:text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-700"
        aria-label="Dismiss canvas notices"
        @click="clearDiagnostics"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <SimplifiedCanvas
      v-if="viewMode === 'simplified'"
      :key="'simplified-canvas'"
      :highlight-missing="props.highlightMissing"
    />

    <template v-else>
      <div class="detailed-tabs-full-bleed border-y border-gray-200">
        <div class="flex w-full items-center">
          <nav
            class="min-w-0 flex-1 overflow-x-auto"
            role="tablist"
            aria-label="Detailed canvas sections"
            @keydown="handleTabKeydown"
          >
            <div class="flex">
              <button
                v-for="(section, index) in sections"
                :id="`detailed-tab-${section.id}`"
                :key="section.id"
                :ref="(element) => setTabRef(element, index)"
                type="button"
                role="tab"
                :aria-selected="activeSection === section.id"
                :aria-controls="`detailed-panel-${section.id}`"
                :tabindex="activeSection === section.id ? 0 : -1"
                :class="[
                  'shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-600',
                  activeSection === section.id
                    ? 'border-primary-600 text-primary-700'
                    : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-950',
                ]"
                @click="activeSection = section.id"
              >
                {{ section.label }}
              </button>
            </div>
          </nav>
          <p class="shrink-0 px-4 text-sm text-gray-600">
            Canvas completion
            <strong :class="getCompletionTextColor()">{{ completionPercentage.percentage }}%</strong>
            <span v-if="!completionPercentage.isValid" class="sr-only"> with validation errors</span>
          </p>
        </div>
      </div>

      <div
        :id="`detailed-panel-${activeSection}`"
        class="py-6"
        role="tabpanel"
        :aria-labelledby="`detailed-tab-${activeSection}`"
        tabindex="0"
      >
        <ProjectDefinition v-if="activeSection === 'project'" :key="'project'" />
        <Persons v-if="activeSection === 'persons'" :key="'persons'" />
        <UserExpectations
          v-if="activeSection === 'user-expectations'"
          :key="`user-expectations-${dataVersion}`"
        />
        <DeveloperFeasibility v-if="activeSection === 'developer-feasibility'" :key="'developer-feasibility'" />
        <GovernanceStaging v-if="activeSection === 'governance'" :key="'governance'" />
        <DataAccessSensitivity v-if="activeSection === 'data-access'" :key="'data-access'" />
        <OutcomesEvaluation v-if="activeSection === 'outcomes'" :key="'outcomes'" />
        <Dashboard v-if="activeSection === 'dashboard'" :key="'dashboard'" />
      </div>

      <div
        v-if="errorsWithTargets.length > 0 || warningsWithTargets.length > 0"
        class="border-t border-gray-200 py-5"
      >
        <div v-if="errorsWithTargets.length > 0" class="mb-4">
          <h3 class="mb-2 text-sm font-semibold text-red-700">Validation Errors</h3>
          <ul class="space-y-0.5">
            <li v-for="(item, index) in errorsWithTargets" :key="index">
              <button
                v-if="item.target"
                type="button"
                class="group flex w-full items-start gap-2 rounded px-1 py-0.5 text-left hover:bg-red-50"
                @click="navigateToError(item.error.field)"
              >
                <span class="text-red-400" aria-hidden="true">›</span>
                <span class="flex-1 text-sm text-red-600">{{ item.error.message }}</span>
                <span class="shrink-0 text-xs text-red-500">{{ sectionLabel(item.target.sectionId) }} ↗</span>
              </button>
              <span v-else class="flex items-start gap-2 px-1 py-0.5 text-sm text-red-600">• {{ item.error.message }}</span>
            </li>
          </ul>
        </div>
        <div v-if="warningsWithTargets.length > 0">
          <h3 class="mb-2 text-sm font-semibold text-yellow-700">Warnings</h3>
          <ul class="space-y-0.5">
            <li v-for="(item, index) in warningsWithTargets" :key="index">
              <button
                v-if="item.target"
                type="button"
                class="group flex w-full items-start gap-2 rounded px-1 py-0.5 text-left hover:bg-yellow-50"
                @click="navigateToError(item.error.field)"
              >
                <span class="text-yellow-500" aria-hidden="true">›</span>
                <span class="flex-1 text-sm text-yellow-700">{{ item.error.message }}</span>
                <span class="shrink-0 text-xs text-yellow-600">{{ sectionLabel(item.target.sectionId) }} ↗</span>
              </button>
              <span v-else class="flex items-start gap-2 px-1 py-0.5 text-sm text-yellow-700">• {{ item.error.message }}</span>
            </li>
          </ul>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  defineAsyncComponent,
  ref,
  watch,
  type ComponentPublicInstance,
} from 'vue'
import SimplifiedCanvas from './sections/SimplifiedCanvas.vue'
import { useCanvasData } from '@/composables/useCanvasData'
import { fieldToNavTarget, sectionLabel } from '@/utils/fieldNavigation'

// Detailed sections are intentionally lazy. The simplified landing page should
// not download the advanced editors (or Dashboard's diagram engine) until the
// user opts into the detailed canvas.
const ProjectDefinition = defineAsyncComponent(() => import('./sections/ProjectDefinition.vue'))
const Persons = defineAsyncComponent(() => import('./sections/Persons.vue'))
const UserExpectations = defineAsyncComponent(() => import('./sections/UserExpectations.vue'))
const DeveloperFeasibility = defineAsyncComponent(() => import('./sections/DeveloperFeasibility.vue'))
const GovernanceStaging = defineAsyncComponent(() => import('./sections/GovernanceStaging.vue'))
const DataAccessSensitivity = defineAsyncComponent(() => import('./sections/DataAccessSensitivity.vue'))
const OutcomesEvaluation = defineAsyncComponent(() => import('./sections/OutcomesEvaluation.vue'))
const Dashboard = defineAsyncComponent(() => import('./sections/Dashboard.vue'))
const props = withDefaults(defineProps<{
  highlightMissing?: boolean
  viewMode?: 'simplified' | 'detailed'
}>(), {
  highlightMissing: false,
  viewMode: 'simplified',
})

const emit = defineEmits<{
  'update:viewMode': [viewMode: 'simplified' | 'detailed']
}>()

const {
  completionPercentage,
  validateAll,
  lastDiagnostics,
  clearDiagnostics,
  requestedSection,
  dataVersion,
  focusFieldRequest,
} = useCanvasData()

const sections = [
  { id: 'project', label: 'Project' },
  { id: 'persons', label: 'Persons' },
  { id: 'user-expectations', label: 'Tasks & Benefits' },
  { id: 'developer-feasibility', label: 'Feasibility & Risks' },
  { id: 'governance', label: 'Governance' },
  { id: 'data-access', label: 'Data Access' },
  { id: 'outcomes', label: 'Outcomes' },
  { id: 'dashboard', label: 'Dashboard' },
] as const

type DetailedSectionId = typeof sections[number]['id']

const viewMode = computed<'simplified' | 'detailed'>({
  get: () => props.viewMode,
  set: (value) => emit('update:viewMode', value),
})
const activeSection = ref<DetailedSectionId>('project')
const tabRefs = ref<HTMLButtonElement[]>([])

watch(requestedSection, (section) => {
  if (!section) return
  if (section === 'simplified-canvas') {
    showSimplifiedCanvas()
  } else if (sections.some((candidate) => candidate.id === section)) {
    viewMode.value = 'detailed'
    activeSection.value = section as DetailedSectionId
  }
  requestedSection.value = null
})

const validation = computed(() => validateAll())
const errorsWithTargets = computed(() =>
  validation.value.errors.map((error) => ({ error, target: fieldToNavTarget(error.field) })),
)
const warningsWithTargets = computed(() =>
  validation.value.warnings.map((error) => ({ error, target: fieldToNavTarget(error.field) })),
)

function showSimplifiedCanvas() {
  viewMode.value = 'simplified'
}

function navigateToError(field: string) {
  const target = fieldToNavTarget(field)
  if (!target) return
  viewMode.value = 'detailed'
  activeSection.value = target.sectionId as DetailedSectionId
  if (target.itemType !== null) focusFieldRequest.value = target
}

function getCompletionTextColor(): string {
  if (completionPercentage.value.hasErrors) return 'text-red-600'
  if (completionPercentage.value.hasWarnings) return 'text-yellow-700'
  if (completionPercentage.value.isValid) return 'text-green-700'
  return 'text-gray-700'
}

function setTabRef(element: Element | ComponentPublicInstance | null, index: number) {
  if (element instanceof HTMLButtonElement) tabRefs.value[index] = element
}

function selectTab(index: number) {
  const normalized = (index + sections.length) % sections.length
  activeSection.value = sections[normalized].id
  tabRefs.value[normalized]?.focus()
}

function handleTabKeydown(event: KeyboardEvent) {
  const currentIndex = sections.findIndex((section) => section.id === activeSection.value)
  if (event.key === 'ArrowRight') {
    event.preventDefault()
    selectTab(currentIndex + 1)
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault()
    selectTab(currentIndex - 1)
  } else if (event.key === 'Home') {
    event.preventDefault()
    selectTab(0)
  } else if (event.key === 'End') {
    event.preventDefault()
    selectTab(sections.length - 1)
  }
}
</script>

<style scoped>
.detailed-tabs-full-bleed {
  width: 100vw;
  margin-left: calc((100% - 100vw) / 2);
}
</style>
