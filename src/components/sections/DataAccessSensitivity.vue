<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Data Access & Sensitivity</h2>
      <p class="text-sm text-gray-600 mb-6">
        Describe datasets using <a href="https://www.w3.org/TR/vocab-dcat-2/#Class:Dataset" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-800 underline" title="DCAT Dataset class">DCAT Dataset</a> vocabulary with properties like <a href="http://purl.org/dc/terms/accessRights" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-800 underline" title="Dublin Core Terms accessRights">dct:accessRights</a> and <a href="http://purl.org/dc/terms/license" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-800 underline" title="Dublin Core Terms license">dct:license</a>. Data use restrictions use <a href="https://github.com/EBISPOT/DUO" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-800 underline" title="DUO (Data Use Ontology) for machine-readable data use permissions">DUO terms</a>.
      </p>
    </div>

    <MultiValueInput
      v-model="localDatasets"
      label="dataset"
      :create-default="() => ({ id: `dataset-${Date.now()}`, title: '' })"
    >
      <template #input="{ item, index, update }">
        <div class="space-y-4 p-4 border border-gray-200 rounded-lg">
          <FormField
            :id="`dataset-title-${index}`"
            label="Dataset Title"
            required
          >
            <input
              :id="`dataset-title-${index}`"
              :value="item.title"
              type="text"
              class="form-input"
              required
              @input="update({ ...item, title: ($event.target as HTMLInputElement).value })"
            />
          </FormField>

          <FormField
            :id="`dataset-desc-${index}`"
            label="Description"
          >
            <textarea
              :id="`dataset-desc-${index}`"
              :value="item.description || ''"
              rows="3"
              class="form-input"
              @input="update({ ...item, description: ($event.target as HTMLTextAreaElement).value })"
            />
          </FormField>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              :id="`dataset-format-${index}`"
              label="Format"
              help-text="Data format or MIME type (e.g., JSON, CSV, Parquet, application/json). Maps to <a href='https://schema.org/encodingFormat' target='_blank' rel='noopener noreferrer' class='text-primary-600 hover:text-primary-800 underline' title='Schema.org encodingFormat property'>schema:encodingFormat</a>."
            >
              <input
                :id="`dataset-format-${index}`"
                :value="item.format || ''"
                type="text"
                class="form-input"
                @input="update({ ...item, format: ($event.target as HTMLInputElement).value })"
              />
            </FormField>

            <FormField
              :id="`dataset-access-${index}`"
              label="Access Rights"
              help-text="Access rights classification. Maps to <a href='http://purl.org/dc/terms/accessRights' target='_blank' rel='noopener noreferrer' class='text-primary-600 hover:text-primary-800 underline' title='Dublin Core Terms accessRights'>dct:accessRights</a>. Options: Open (publicly accessible), Restricted (requires approval), Confidential (limited access), Highly Restricted (very limited access)."
              required
            >
              <select
                :id="`dataset-access-${index}`"
                :value="item.accessRights || ''"
                class="form-input"
                @change="update({ ...item, accessRights: ($event.target as HTMLSelectElement).value as any })"
              >
                <option value="">Select access level</option>
                <option value="open">Open</option>
                <option value="restricted">Restricted</option>
                <option value="confidential">Confidential</option>
                <option value="highly-restricted">Highly Restricted</option>
              </select>
            </FormField>
          </div>

          <FormField
            :id="`dataset-license-${index}`"
            label="License (URI)"
            help-text="License URI (e.g., https://creativecommons.org/licenses/by/4.0/). Maps to <a href='http://purl.org/dc/terms/license' target='_blank' rel='noopener noreferrer' class='text-primary-600 hover:text-primary-800 underline' title='Dublin Core Terms license property'>dct:license</a>."
          >
            <input
              :id="`dataset-license-${index}`"
              :value="item.license || ''"
              type="url"
              class="form-input"
              placeholder="https://creativecommons.org/licenses/by/4.0/"
              @input="update({ ...item, license: ($event.target as HTMLInputElement).value })"
            />
          </FormField>

          <FormField
            :id="`dataset-pid-${index}`"
            label="Persistent Identifier (PID/DOI)"
            help-text="DOI or other persistent identifier"
          >
            <input
              :id="`dataset-pid-${index}`"
              :value="item.pid || ''"
              type="url"
              class="form-input"
              placeholder="https://doi.org/10.1234/example"
              @input="update({ ...item, pid: ($event.target as HTMLInputElement).value })"
            />
          </FormField>

          <div>
            <label class="form-label mb-2">
              <a href="https://github.com/EBISPOT/DUO" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-800 underline" title="DUO (Data Use Ontology) - machine-readable data use permissions">DUO Terms</a>
            </label>
            <p class="text-xs text-gray-500 mb-2">
              <a href="https://github.com/EBISPOT/DUO" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-800 underline">Data Use Ontology</a> terms specify machine-readable data use permissions. Common terms include: DUO:0000006 (Health/Medical/Biomedical Research Only), DUO:0000012 (No Commercial Use). Add one URI per entry.
            </p>
            <div
              v-for="(term, termIndex) in (item.duoTerms || [])"
              :key="termIndex"
              class="mb-2 p-2 bg-gray-50 rounded flex items-center justify-between"
            >
              <span class="text-sm font-mono text-xs break-all">{{ term }}</span>
              <button
                type="button"
                @click="removeDuoTerm(item, termIndex)"
                class="text-red-600 hover:text-red-800 text-sm ml-2 flex-shrink-0"
              >
                Remove
              </button>
            </div>
            <button
              type="button"
              @click="showAddDuoTerm = index"
              class="btn-secondary text-sm"
            >
              Add DUO Term
            </button>
            <div v-if="showAddDuoTerm === index" class="mt-2 p-3 bg-gray-50 rounded space-y-2">
              <input
                v-model="newDuoTerm"
                type="url"
                placeholder="http://purl.obolibrary.org/obo/DUO_0000006"
                class="form-input text-sm"
              />
              <div class="flex gap-2">
                <button
                  type="button"
                  @click="addDuoTerm(item, index)"
                  class="btn-primary text-sm"
                >
                  Add
                </button>
                <button
                  type="button"
                  @click="showAddDuoTerm = null; newDuoTerm = ''"
                  class="btn-secondary text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <label class="flex items-center">
              <input
                type="checkbox"
                :checked="item.containsPersonalData || false"
                class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                @change="update({ ...item, containsPersonalData: ($event.target as HTMLInputElement).checked })"
              />
              <span class="ml-2 text-sm text-gray-700">
                Contains Personal Data
                <span class="text-xs text-gray-500 ml-1" title="If checked, access restriction text is required for compliance">(requires access restrictions)</span>
              </span>
            </label>
          </div>
        </div>
      </template>
    </MultiValueInput>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import FormField from '../FormField.vue'
import MultiValueInput from '../MultiValueInput.vue'
import type { Dataset } from '@/types/canvas'
import { useCanvasData } from '@/composables/useCanvasData'

const { canvasData, updateDataAccess } = useCanvasData()

// Initialize with proper deep copying of nested arrays
const initLocalDatasets = (): Dataset[] => {
  const datasets = canvasData.value.dataAccess?.datasets || []
  return datasets.map((dataset) => ({
    ...dataset,
    duoTerms: dataset.duoTerms ? [...dataset.duoTerms] : undefined,
  }))
}

const localDatasets = ref<Dataset[]>(initLocalDatasets())

const showAddDuoTerm = ref<number | null>(null)
const newDuoTerm = ref<string>('')

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
  { deep: true, immediate: false }
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

const addDuoTerm = (dataset: Dataset, datasetIndex: number) => {
  if (newDuoTerm.value.trim()) {
    // Create a new array with updated dataset
    const updatedDatasets = localDatasets.value.map((d, i) => {
      if (i === datasetIndex) {
        const updatedDuoTerms = [...(dataset.duoTerms || []), newDuoTerm.value.trim()]
        return { ...dataset, duoTerms: updatedDuoTerms }
      }
      return d
    })
    localDatasets.value = updatedDatasets
    newDuoTerm.value = ''
    showAddDuoTerm.value = null
  }
}

const removeDuoTerm = (dataset: Dataset, termIndex: number) => {
  const datasetIndex = localDatasets.value.findIndex(d => d.id === dataset.id)
  if (datasetIndex !== -1 && dataset.duoTerms) {
    // Create a new array with updated dataset
    const updatedDatasets = localDatasets.value.map((d, i) => {
      if (i === datasetIndex) {
        const updatedDuoTerms = dataset.duoTerms!.filter((_, idx) => idx !== termIndex)
        return { ...dataset, duoTerms: updatedDuoTerms }
      }
      return d
    })
    localDatasets.value = updatedDatasets
  }
}
</script>
