<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Outcomes & Evaluation</h2>
      <p class="text-sm text-gray-600 mb-6">
        Document deliverables using <a href="https://sparontologies.github.io/frapo/current/frapo.html#d4e1003" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-800 underline" title="FRAPO Deliverable class">FRAPO Deliverable</a> and <a href="https://schema.org/CreativeWork" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-800 underline" title="Schema.org CreativeWork type">Schema.org CreativeWork</a> types (e.g., <a href="https://schema.org/SoftwareApplication" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-800 underline" title="Schema.org SoftwareApplication type">SoftwareApplication</a>, <a href="https://schema.org/Report" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-800 underline" title="Schema.org Report type">Report</a>, <a href="https://schema.org/Dataset" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-800 underline" title="Schema.org Dataset type">Dataset</a>). Publications use <a href="https://schema.org/ScholarlyArticle" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-800 underline" title="Schema.org ScholarlyArticle type">ScholarlyArticle</a>.
      </p>
    </div>

    <div>
      <h3 class="text-lg font-medium text-gray-900 mb-4">Deliverables</h3>
      <MultiValueInput
        v-model="localDeliverables"
        label="deliverable"
        :create-default="() => ({ id: `deliverable-${Date.now()}`, title: '', type: '' })"
      >
        <template #input="{ item, index, update }">
          <div class="space-y-3 p-4 border border-gray-200 rounded-lg">
            <FormField
              :id="`deliverable-title-${index}`"
              label="Title"
              required
            >
              <input
                :id="`deliverable-title-${index}`"
                :value="item.title"
                type="text"
                class="form-input"
                required
                @input="update({ ...item, title: ($event.target as HTMLInputElement).value })"
              />
            </FormField>

            <FormField
              :id="`deliverable-type-${index}`"
              label="Type"
              help-text="Deliverable type using <a href='https://schema.org/CreativeWork' target='_blank' rel='noopener noreferrer' class='text-primary-600 hover:text-primary-800 underline' title='Schema.org CreativeWork type'>Schema.org</a> types (e.g., SoftwareApplication, Report, Dataset, Document). Maps to <a href='https://sparontologies.github.io/frapo/current/frapo.html#d4e1003' target='_blank' rel='noopener noreferrer' class='text-primary-600 hover:text-primary-800 underline' title='FRAPO Deliverable class'>FRAPO Deliverable</a>."
              required
            >
              <input
                :id="`deliverable-type-${index}`"
                :value="item.type"
                type="text"
                class="form-input"
                placeholder="e.g., Report, Software, Dataset"
                required
                @input="update({ ...item, type: ($event.target as HTMLInputElement).value })"
              />
            </FormField>

            <FormField
              :id="`deliverable-desc-${index}`"
              label="Description"
            >
              <textarea
                :id="`deliverable-desc-${index}`"
                :value="item.description || ''"
                rows="2"
                class="form-input"
                @input="update({ ...item, description: ($event.target as HTMLTextAreaElement).value })"
              />
            </FormField>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                :id="`deliverable-date-${index}`"
                label="Date"
              >
                <input
                  :id="`deliverable-date-${index}`"
                  :value="item.date || ''"
                  type="date"
                  class="form-input"
                  @input="update({ ...item, date: ($event.target as HTMLInputElement).value })"
                />
              </FormField>

              <FormField
                :id="`deliverable-pid-${index}`"
                label="PID/DOI"
                help-text="Persistent Identifier (PID) or Digital Object Identifier (DOI) for the deliverable (e.g., https://doi.org/10.1234/example)"
              >
                <input
                  :id="`deliverable-pid-${index}`"
                  :value="item.pid || ''"
                  type="url"
                  class="form-input"
                  placeholder="https://doi.org/10.1234/example"
                  @input="update({ ...item, pid: ($event.target as HTMLInputElement).value })"
                />
              </FormField>
            </div>
          </div>
        </template>
      </MultiValueInput>
    </div>

    <div>
      <h3 class="text-lg font-medium text-gray-900 mb-4">Publications</h3>
      <MultiValueInput
        v-model="localPublications"
        label="publication"
        :create-default="() => ({ id: `pub-${Date.now()}`, title: '' })"
      >
        <template #input="{ item, index, update }">
          <div class="space-y-3 p-4 border border-gray-200 rounded-lg">
            <FormField
              :id="`pub-title-${index}`"
              label="Title"
              required
            >
              <input
                :id="`pub-title-${index}`"
                :value="item.title"
                type="text"
                class="form-input"
                required
                @input="update({ ...item, title: ($event.target as HTMLInputElement).value })"
              />
            </FormField>

            <FormField
              :id="`pub-doi-${index}`"
              label="DOI"
              help-text="Digital Object Identifier (DOI) as a full URL (e.g., https://doi.org/10.1234/example). Publications use <a href='https://schema.org/ScholarlyArticle' target='_blank' rel='noopener noreferrer' class='text-primary-600 hover:text-primary-800 underline' title='Schema.org ScholarlyArticle type'>schema:ScholarlyArticle</a> type."
            >
              <input
                :id="`pub-doi-${index}`"
                :value="item.doi || ''"
                type="url"
                class="form-input"
                placeholder="https://doi.org/10.1234/example"
                @input="update({ ...item, doi: ($event.target as HTMLInputElement).value })"
              />
            </FormField>

            <FormField
              :id="`pub-authors-${index}`"
              label="Authors"
              help-text="Comma-separated list of authors"
            >
              <input
                :id="`pub-authors-${index}`"
                :value="(item.authors || []).join(', ')"
                type="text"
                class="form-input"
                @input="update({ ...item, authors: ($event.target as HTMLInputElement).value.split(',').map(s => s.trim()).filter(s => s) })"
              />
            </FormField>

            <FormField
              :id="`pub-date-${index}`"
              label="Publication Date"
            >
              <input
                :id="`pub-date-${index}`"
                :value="item.date || ''"
                type="date"
                class="form-input"
                @input="update({ ...item, date: ($event.target as HTMLInputElement).value })"
              />
            </FormField>
          </div>
        </template>
      </MultiValueInput>
    </div>

    <div>
      <h3 class="text-lg font-medium text-gray-900 mb-4">Evaluations</h3>
      <MultiValueInput
        v-model="localEvaluations"
        label="evaluation"
        :create-default="() => ({ id: `eval-${Date.now()}`, type: '' })"
      >
        <template #input="{ item, index, update }">
          <div class="space-y-3 p-4 border border-gray-200 rounded-lg">
              <FormField
                :id="`eval-type-${index}`"
                label="Evaluation Type"
                help-text="Type of evaluation (e.g., Performance Evaluation, User Study, Compliance Audit). Evaluations link to governance stages via <a href='https://www.w3.org/TR/prov-o/#wasGeneratedBy' target='_blank' rel='noopener noreferrer' class='text-primary-600 hover:text-primary-800 underline' title='PROV-O wasGeneratedBy property'>PROV-O wasGeneratedBy</a>."
                required
              >
              <input
                :id="`eval-type-${index}`"
                :value="item.type"
                type="text"
                class="form-input"
                placeholder="e.g., Usability Test, Performance Evaluation"
                required
                @input="update({ ...item, type: ($event.target as HTMLInputElement).value })"
              />
            </FormField>

            <FormField
              :id="`eval-date-${index}`"
              label="Date"
            >
              <input
                :id="`eval-date-${index}`"
                :value="item.date || ''"
                type="date"
                class="form-input"
                @input="update({ ...item, date: ($event.target as HTMLInputElement).value })"
              />
            </FormField>

            <FormField
              :id="`eval-results-${index}`"
              label="Results"
            >
              <textarea
                :id="`eval-results-${index}`"
                :value="item.results || ''"
                rows="3"
                class="form-input"
                @input="update({ ...item, results: ($event.target as HTMLTextAreaElement).value })"
              />
            </FormField>
          </div>
        </template>
      </MultiValueInput>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import FormField from '../FormField.vue'
import MultiValueInput from '../MultiValueInput.vue'
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
  { deep: true, immediate: false }
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
