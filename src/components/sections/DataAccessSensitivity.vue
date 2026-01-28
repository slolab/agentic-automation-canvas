<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Data Access & Sensitivity</h2>
      <p class="text-sm text-gray-600 mb-6">
        Describe datasets using DCAT vocabulary with DUO terms for data use restrictions.
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
              help-text="Data format (e.g., JSON, CSV, Parquet)"
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
            help-text="License URI (e.g., https://creativecommons.org/licenses/by/4.0/)"
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

          <FormField
            :id="`dataset-duo-${index}`"
            label="DUO Terms"
            help-text="Data Use Ontology terms (comma-separated URIs)"
          >
            <input
              :id="`dataset-duo-${index}`"
              :value="(item.duoTerms || []).join(', ')"
              type="text"
              class="form-input"
              placeholder="http://purl.obolibrary.org/obo/DUO_0000006"
              @input="update({ ...item, duoTerms: ($event.target as HTMLInputElement).value.split(',').map(s => s.trim()).filter(s => s) })"
            />
          </FormField>

          <div class="flex items-center gap-4">
            <label class="flex items-center">
              <input
                type="checkbox"
                :checked="item.containsPersonalData || false"
                class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                @change="update({ ...item, containsPersonalData: ($event.target as HTMLInputElement).checked })"
              />
              <span class="ml-2 text-sm text-gray-700">Contains Personal Data</span>
            </label>
          </div>
        </div>
      </template>
    </MultiValueInput>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import FormField from '../FormField.vue'
import MultiValueInput from '../MultiValueInput.vue'
import type { Dataset } from '@/types/canvas'
import { useCanvasData } from '@/composables/useCanvasData'

const { canvasData, updateDataAccess } = useCanvasData()

const localDatasets = ref<Dataset[]>(
  canvasData.value.dataAccess?.datasets || []
)

// Watch for local changes and update canvasData immediately
watch(localDatasets, () => {
  updateDataAccess({ datasets: [...localDatasets.value] })
}, { deep: true, immediate: false })
</script>
