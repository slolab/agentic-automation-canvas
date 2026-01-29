<template>
  <div class="space-y-6">
    <div>
      <h2 class="section-header">Data Access & Sensitivity</h2>
      <p class="section-description">
        Describe datasets using <a href="https://www.w3.org/TR/vocab-dcat-2/#Class:Dataset" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-800 underline font-medium" title="DCAT Dataset class">DCAT Dataset</a> vocabulary with properties like <a href="http://purl.org/dc/terms/accessRights" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-800 underline font-medium" title="Dublin Core Terms accessRights">dct:accessRights</a> and <a href="http://purl.org/dc/terms/license" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-800 underline font-medium" title="Dublin Core Terms license">dct:license</a>. Data use restrictions use <a href="https://github.com/EBISPOT/DUO" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-800 underline font-medium" title="DUO (Data Use Ontology) for machine-readable data use permissions">DUO terms</a>.
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
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import MultiValueInput from '../MultiValueInput.vue'
import DatasetItem from '../DatasetItem.vue'
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
</script>
