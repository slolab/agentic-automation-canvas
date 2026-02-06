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
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import MultiValueInput from '../MultiValueInput.vue'
import DatasetItem from '../DatasetItem.vue'
import InfoTooltip from '../InfoTooltip.vue'
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
</script>
