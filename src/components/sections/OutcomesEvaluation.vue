<template>
  <div class="space-y-6">
    <div>
      <h2 class="section-header flex items-center gap-2">
        <span>Outcomes & Evaluation</span>
        <InfoTooltip
          content="<strong>What goes here:</strong> Project outputs including deliverables (software, reports, datasets), publications, and evaluation results.<br/><br/><strong>Deliverables:</strong> What the project produces (e.g., software applications, reports, datasets). Use Schema.org types to categorize.<br/><br/><strong>Publications:</strong> Papers, articles, or other publications about the project. Link via DOI if published.<br/><br/><strong>Evaluations:</strong> Results that demonstrate success (e.g., performance tests, user studies). Link to governance stages to show when evaluations occurred.<br/><br/><strong>Workflow tip:</strong> Add deliverables and publications as they're created. Add evaluations after testing/validation stages to demonstrate project success."
          position="top"
        />
      </h2>
      <p class="section-description">
        What will your project produce? Document the deliverables (e.g., software, reports, datasets), publications, and evaluation results that demonstrate the success and impact of your automation project. This helps track what you've created and how well the solution performs. Outcomes are represented using <a href="https://schema.org/CreativeWork" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-800 underline font-medium" title="Schema.org CreativeWork type">Schema.org CreativeWork</a> types and <a href="https://sparontologies.github.io/frapo/current/frapo.html#d4e1003" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-800 underline font-medium" title="FRAPO Deliverable class">FRAPO Deliverable</a>.
      </p>
    </div>

    <div>
      <h3 class="subsection-header text-gray-500">Deliverables</h3>
      <MultiValueInput
        v-model="localDeliverables"
        label="deliverable"
        :create-default="() => ({ id: `deliverable-${Date.now()}`, title: '', type: '' })"
      >
        <template #input="{ item, index, update }">
          <DeliverableItem
            :deliverable="item"
            :index="index"
            :update="update"
          />
        </template>
      </MultiValueInput>
    </div>

    <div>
      <h3 class="subsection-header text-gray-500">Publications</h3>
      <MultiValueInput
        v-model="localPublications"
        label="publication"
        :create-default="() => ({ id: `pub-${Date.now()}`, title: '' })"
      >
        <template #input="{ item, index, update }">
          <PublicationItem
            :publication="item"
            :index="index"
            :update="update"
          />
        </template>
      </MultiValueInput>
    </div>

    <div>
      <h3 class="subsection-header text-gray-500">Evaluations</h3>
      <MultiValueInput
        v-model="localEvaluations"
        label="evaluation"
        :create-default="() => ({ id: `eval-${Date.now()}`, type: '' })"
      >
        <template #input="{ item, index, update }">
          <EvaluationItem
            :evaluation="item"
            :index="index"
            :update="update"
          />
        </template>
      </MultiValueInput>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import MultiValueInput from '../MultiValueInput.vue'
import DeliverableItem from '../DeliverableItem.vue'
import PublicationItem from '../PublicationItem.vue'
import EvaluationItem from '../EvaluationItem.vue'
import InfoTooltip from '../InfoTooltip.vue'
import type { Deliverable, Publication, Evaluation } from '@/types/canvas'
import { useCanvasData } from '@/composables/useCanvasData'

const { canvasData, updateOutcomes } = useCanvasData()

// Initialize with proper deep copying of nested arrays
const initLocalData = () => {
  const outcomes = canvasData.value.outcomes
  return {
    deliverables: (outcomes?.deliverables || []).map((item) => ({ ...item })),
    publications: (outcomes?.publications || []).map((pub) => ({
      ...pub,
      authors: pub.authors ? [...pub.authors] : undefined,
    })),
    evaluations: (outcomes?.evaluations || []).map((item) => ({ ...item })),
  }
}

const initialData = initLocalData()
const localDeliverables = ref<Deliverable[]>(initialData.deliverables)
const localPublications = ref<Publication[]>(initialData.publications)
const localEvaluations = ref<Evaluation[]>(initialData.evaluations)

let isLocalUpdate = false
let isSyncingFromCanvas = false

// Watch for changes from canvasData (e.g., when cleared or imported)
watch(
  () => canvasData.value.outcomes,
  (newOutcomes) => {
    // Don't sync if the update came from us
    if (!isLocalUpdate) {
      isSyncingFromCanvas = true
      if (newOutcomes) {
        // Deep copy arrays with nested arrays (e.g., authors in publications)
        localDeliverables.value = (newOutcomes.deliverables || []).map((item) => ({ ...item }))
        localPublications.value = (newOutcomes.publications || []).map((pub) => ({
          ...pub,
          authors: pub.authors ? [...pub.authors] : undefined,
        }))
        localEvaluations.value = (newOutcomes.evaluations || []).map((item) => ({ ...item }))
      } else {
        // Reset when cleared
        localDeliverables.value = []
        localPublications.value = []
        localEvaluations.value = []
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
watch([localDeliverables, localPublications, localEvaluations], async () => {
  // Skip if we're currently syncing from canvasData to avoid circular updates
  if (isSyncingFromCanvas) return
  
  isLocalUpdate = true
  updateOutcomes({
    deliverables: [...localDeliverables.value],
    publications: [...localPublications.value],
    evaluations: [...localEvaluations.value],
  })
  await nextTick()
  isLocalUpdate = false
}, { deep: true, immediate: false })
</script>
