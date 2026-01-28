<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Outcomes & Evaluation</h2>
      <p class="text-sm text-gray-600 mb-6">
        Document deliverables, publications, and evaluation results using FRAPO and schema.org CreativeWork types.
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
import { ref, watch } from 'vue'
import FormField from '../FormField.vue'
import MultiValueInput from '../MultiValueInput.vue'
import type { Deliverable, Publication, Evaluation } from '@/types/canvas'
import { useCanvasData } from '@/composables/useCanvasData'

const { canvasData, updateOutcomes } = useCanvasData()

const localDeliverables = ref<Deliverable[]>(
  canvasData.value.outcomes?.deliverables || []
)
const localPublications = ref<Publication[]>(
  canvasData.value.outcomes?.publications || []
)
const localEvaluations = ref<Evaluation[]>(
  canvasData.value.outcomes?.evaluations || []
)

// Watch for local changes and update canvasData immediately
watch([localDeliverables, localPublications, localEvaluations], () => {
  updateOutcomes({
    deliverables: [...localDeliverables.value],
    publications: [...localPublications.value],
    evaluations: [...localEvaluations.value],
  })
}, { deep: true, immediate: false })
</script>
