<template>
  <div class="space-y-6">
    <div>
      <h2 class="section-header flex items-center gap-2">
        <span>Data Access & Sensitivity</span>
        <InfoTooltip
          content="<strong>What goes here:</strong> All datasets used by your automation, including access restrictions, licenses, and data use conditions.<br/><br/><strong>DUO Terms:</strong> Data Use Ontology terms specify machine-readable data use permissions (e.g., research-only, no commercial use). These enable automated compliance checking.<br/><br/><strong>Access Rights:</strong> Classify datasets as Open, Restricted, Confidential, or Highly Restricted. This ensures proper data governance.<br/><br/><strong>Workflow tip:</strong> Document all datasets your automation accesses. If datasets contain personal data, check 'Contains Personal Data' and ensure proper access restrictions and compliance standards are documented."
          position="top"
        />
      </h2>
      <p class="section-description">
        What data will your automation work with? Document the datasets your project uses, including their access restrictions, sensitivity levels, licenses, and any data use conditions. This helps ensure compliance and proper data governance. Datasets are described using <a href="https://www.w3.org/TR/vocab-dcat-2/#Class:Dataset" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-800 underline font-medium" title="DCAT Dataset class">DCAT Dataset</a> vocabulary with <a href="https://github.com/EBISPOT/DUO" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-800 underline font-medium" title="DUO (Data Use Ontology) for machine-readable data use permissions">DUO terms</a> for data use restrictions.
      </p>
    </div>

    <MultiValueInput
      v-model="localDatasets"
      label="dataset"
      :create-default="() => ({ id: `dataset-${Date.now()}`, title: '' })"
    >
      <template #input="{ item, index, update }">
        <DatasetItem
          :dataset="item"
          :index="index"
          :update="update"
        />
      </template>
    </MultiValueInput>

    <!-- Task-level data access: tasks come from Tasks & Benefits (single ground truth) -->
    <div class="border-t border-gray-200 pt-6 space-y-4">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span>Task-Level Data Access</span>
          <InfoTooltip
            content="<strong>What goes here:</strong> For each task, select which datasets it uses and what the agent may do with them (read / modify / process / generate).<br/><br/><strong>Single ground truth:</strong> Tasks are defined once in Tasks &amp; Benefits and appear here automatically — exactly like task-level feasibility.<br/><br/><strong>Compliance flags:</strong> Linking a restricted or personal-data dataset to a task whose agent uses a frontier model raises an advisory flag (data-processing agreement, GDPR review, or enterprise licence may be needed). Flags never block the form."
            position="top"
          />
        </h3>
        <p class="section-description">
          Which task uses which dataset, and what may the agent do with it? Tasks defined in
          Tasks &amp; Benefits appear here automatically. Sensitive datasets combined with a
          frontier model raise an advisory compliance flag.
        </p>
      </div>

      <div v-if="requirements.length === 0" class="text-sm text-gray-500 italic">
        No tasks defined yet.
        <button
          type="button"
          class="text-primary-600 hover:text-primary-800 underline font-medium not-italic"
          @click="requestSection('user-expectations')"
        >
          Define tasks in Tasks &amp; Benefits
        </button>
        — they will appear here automatically.
      </div>
      <div v-else-if="localDatasets.length === 0" class="text-sm text-gray-500 italic">
        Add a dataset above first, then link it to your tasks here.
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="requirement in requirements"
          :key="requirement.id"
          class="border border-gray-200 rounded-lg p-4"
        >
          <div class="flex items-start justify-between gap-3 mb-3 flex-wrap">
            <h4 class="font-medium text-gray-900">{{ requirement.title || requirement.id }}</h4>
            <span
              class="text-xs px-2 py-0.5 rounded-full border whitespace-nowrap"
              :class="modelChipClass(requirement)"
            >
              {{ modelChipLabel(requirement) }}
            </span>
          </div>

          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Datasets used by this task</p>
          <div class="flex flex-wrap gap-2 mb-3">
            <button
              v-for="dataset in localDatasets"
              :key="dataset.id"
              type="button"
              class="text-sm px-3 py-1 rounded-full border transition-colors"
              :class="isLinked(requirement, dataset.id)
                ? 'bg-primary-50 border-primary-500 text-primary-700 font-medium'
                : 'border-gray-300 text-gray-600 hover:border-gray-400'"
              :aria-pressed="isLinked(requirement, dataset.id)"
              @click="toggleDatasetLink(requirement, dataset.id)"
            >
              {{ dataset.title || 'Untitled dataset' }}
              <span
                v-if="isSensitiveDataset(dataset)"
                class="ml-1 text-amber-600"
                title="Restricted access or personal data"
              >•</span>
            </button>
          </div>

          <div v-if="linkedDatasets(requirement).length > 0" class="space-y-3">
            <div
              v-for="{ link, dataset } in linkedDatasets(requirement)"
              :key="link.datasetId"
              class="rounded-md bg-gray-50 border border-gray-200 p-3"
            >
              <div class="flex items-center justify-between gap-2 flex-wrap mb-2">
                <span class="text-sm font-medium text-gray-800">{{ dataset.title || 'Untitled dataset' }}</span>
                <span class="flex gap-1.5 text-xs">
                  <span v-if="dataset.accessRights" class="px-1.5 py-0.5 rounded bg-gray-200 text-gray-700 capitalize">
                    {{ dataset.accessRights }}
                  </span>
                  <span v-if="dataset.containsPersonalData" class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                    personal data
                  </span>
                </span>
              </div>

              <div class="flex items-center gap-4 flex-wrap">
                <span class="text-xs text-gray-500">Agent may:</span>
                <label
                  v-for="action in AGENT_ACTIONS"
                  :key="action"
                  class="inline-flex items-center gap-1.5 text-sm text-gray-700 capitalize"
                >
                  <input
                    type="checkbox"
                    class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    :checked="hasAction(link, action)"
                    @change="toggleAction(requirement, link.datasetId, action)"
                  />
                  {{ action }}
                </label>
              </div>

              <input
                type="text"
                class="mt-2 w-full text-sm border border-gray-200 rounded px-2 py-1 bg-white placeholder-gray-400 focus:border-primary-500 focus:ring-primary-500"
                placeholder="Notes (e.g. DPA in place, de-identified before this step)"
                :value="link.notes || ''"
                @change="updateLinkNotes(requirement, link.datasetId, ($event.target as HTMLInputElement).value)"
              />

              <div
                v-if="linkFlag(requirement, link)"
                class="mt-2 text-sm rounded-md px-3 py-2 flex gap-2"
                :class="linkFlag(requirement, link)!.level === 'warning'
                  ? 'bg-amber-50 border border-amber-300 text-amber-800'
                  : 'bg-blue-50 border border-blue-200 text-blue-800'"
              >
                <span aria-hidden="true">{{ linkFlag(requirement, link)!.level === 'warning' ? '⚠' : 'ℹ' }}</span>
                <span>{{ linkFlag(requirement, link)!.message }}</span>
              </div>
            </div>

            <p v-if="taskHasCleanLinks(requirement)" class="text-xs text-green-700 flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              No compliance flags for this task
            </p>
          </div>
          <p v-else class="text-sm text-gray-500 italic">
            No datasets linked. Select the datasets this task's agent works with.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import MultiValueInput from '../MultiValueInput.vue'
import DatasetItem from '../DatasetItem.vue'
import InfoTooltip from '../InfoTooltip.vue'
import type { AgentDataAction, Dataset, Requirement, TaskDatasetLink } from '@/types/canvas'
import { useCanvasData } from '@/composables/useCanvasData'
import { evaluateTaskDatasetLink, type DataAccessFlag } from '@/utils/dataAccessWarnings'

const { canvasData, updateDataAccess, updateUserExpectations, requestSection } = useCanvasData()

// Initialize with proper deep copying of nested arrays
const initLocalDatasets = (): Dataset[] => {
  const datasets = canvasData.value.dataAccess?.datasets || []
  return datasets.map((dataset) => ({
    ...dataset,
    duoTerms: dataset.duoTerms ? [...dataset.duoTerms] : undefined,
  }))
}

const localDatasets = ref<Dataset[]>(initLocalDatasets())

let isLocalUpdate = false
let isSyncingFromCanvas = false

// Watch for changes from canvasData (e.g., when cleared or imported)
watch(
  () => canvasData.value.dataAccess,
  (newDataAccess) => {
    // Don't sync if the update came from us
    if (!isLocalUpdate) {
      isSyncingFromCanvas = true
      if (newDataAccess && newDataAccess.datasets) {
        // Deep copy datasets with nested arrays (duoTerms)
        localDatasets.value = newDataAccess.datasets.map((dataset) => ({
          ...dataset,
          duoTerms: dataset.duoTerms ? [...dataset.duoTerms] : undefined,
        }))
      } else {
        // Reset when cleared
        localDatasets.value = []
      }
      // Reset flag after syncing
      nextTick(() => {
        isSyncingFromCanvas = false
      })
    }
  },
  { deep: true, immediate: true }
)

// Watch for local changes and update canvasData immediately
watch(localDatasets, async () => {
  // Skip if we're currently syncing from canvasData to avoid circular updates
  if (isSyncingFromCanvas) return

  isLocalUpdate = true
  updateDataAccess({ datasets: [...localDatasets.value] })
  await nextTick()
  isLocalUpdate = false
}, { deep: true, immediate: false })

// ── Task-level data access (mirrors the task-level feasibility mechanism) ──

const AGENT_ACTIONS: AgentDataAction[] = ['read', 'modify', 'process', 'generate']

const requirements = computed(() => canvasData.value.userExpectations?.requirements || [])

function updateRequirement(taskId: string, updatedRequirement: Requirement) {
  const reqs = canvasData.value.userExpectations?.requirements || []
  const index = reqs.findIndex((r) => r.id === taskId)
  if (index === -1) return

  const updatedRequirements = [...reqs]
  updatedRequirements[index] = updatedRequirement
  updateUserExpectations({ requirements: updatedRequirements })
}

function isLinked(requirement: Requirement, datasetId: string): boolean {
  return (requirement.dataAccess?.datasetLinks || []).some((l) => l.datasetId === datasetId)
}

function toggleDatasetLink(requirement: Requirement, datasetId: string) {
  const links = requirement.dataAccess?.datasetLinks || []
  const newLinks = isLinked(requirement, datasetId)
    ? links.filter((l) => l.datasetId !== datasetId)
    : [...links, { datasetId, agentActions: [] as AgentDataAction[] }]

  updateRequirement(requirement.id, {
    ...requirement,
    dataAccess: newLinks.length > 0 ? { datasetLinks: newLinks } : undefined,
  })
}

/** Linked datasets that still exist (dangling links are hidden but preserved in data) */
function linkedDatasets(requirement: Requirement): Array<{ link: TaskDatasetLink; dataset: Dataset }> {
  const byId = new Map(localDatasets.value.map((d) => [d.id, d]))
  return (requirement.dataAccess?.datasetLinks || [])
    .map((link) => ({ link, dataset: byId.get(link.datasetId) }))
    .filter((entry): entry is { link: TaskDatasetLink; dataset: Dataset } => entry.dataset !== undefined)
}

function hasAction(link: TaskDatasetLink, action: AgentDataAction): boolean {
  return (link.agentActions || []).includes(action)
}

function updateLink(requirement: Requirement, datasetId: string, patch: Partial<TaskDatasetLink>) {
  const links = (requirement.dataAccess?.datasetLinks || []).map((l) =>
    l.datasetId === datasetId ? { ...l, ...patch } : l
  )
  updateRequirement(requirement.id, { ...requirement, dataAccess: { datasetLinks: links } })
}

function toggleAction(requirement: Requirement, datasetId: string, action: AgentDataAction) {
  const link = (requirement.dataAccess?.datasetLinks || []).find((l) => l.datasetId === datasetId)
  if (!link) return
  const actions = link.agentActions || []
  const newActions = actions.includes(action)
    ? actions.filter((a) => a !== action)
    : [...actions, action]
  updateLink(requirement, datasetId, { agentActions: newActions })
}

function updateLinkNotes(requirement: Requirement, datasetId: string, notes: string) {
  updateLink(requirement, datasetId, { notes: notes.trim() || undefined })
}

function linkFlag(requirement: Requirement, link: TaskDatasetLink): DataAccessFlag | null {
  const dataset = localDatasets.value.find((d) => d.id === link.datasetId)
  if (!dataset) return null
  return evaluateTaskDatasetLink(requirement, dataset, link)
}

function taskHasCleanLinks(requirement: Requirement): boolean {
  const linked = linkedDatasets(requirement)
  return linked.length > 0 && linked.every(({ link }) => linkFlag(requirement, link) === null)
}

function isSensitiveDataset(dataset: Dataset): boolean {
  return Boolean(
    dataset.containsPersonalData ||
    (dataset.accessRights && ['restricted', 'confidential', 'highly-restricted'].includes(dataset.accessRights))
  )
}

function modelChipLabel(requirement: Requirement): string {
  const feasibility = requirement.feasibility
  if (feasibility?.modelName?.trim()) return feasibility.modelName
  switch (feasibility?.modelSelection) {
    case 'frontier-model': return 'Frontier model'
    case 'open-source': return 'Open-source model'
    case 'fine-tuned': return 'Fine-tuned model'
    case 'custom': return 'Custom model'
    case 'other': return 'Other model'
    case 'none': return 'No LLM (deterministic)'
    default: return 'Model not set'
  }
}

function modelChipClass(requirement: Requirement): string {
  const selection = requirement.feasibility?.modelSelection
  if (selection === 'frontier-model') return 'border-amber-400 bg-amber-50 text-amber-700'
  if (selection === undefined) return 'border-gray-300 text-gray-500'
  return 'border-gray-300 bg-gray-50 text-gray-600'
}
</script>
