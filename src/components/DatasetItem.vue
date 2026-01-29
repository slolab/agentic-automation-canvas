<template>
  <div class="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200">
    <!-- Collapsed View -->
    <button
      v-if="!isExpanded"
      @click="isExpanded = true"
      class="w-full text-left p-3 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset"
    >
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1.5">
            <span class="text-sm font-medium text-gray-900 truncate">
              {{ dataset.title || 'Untitled Dataset' }}
            </span>
            <span
              v-if="dataset.accessRights"
              :class="{
                'bg-green-100 text-green-700': dataset.accessRights === 'open',
                'bg-yellow-100 text-yellow-700': dataset.accessRights === 'restricted',
                'bg-orange-100 text-orange-700': dataset.accessRights === 'confidential',
                'bg-red-100 text-red-700': dataset.accessRights === 'highly-restricted',
              }"
              class="px-2 py-0.5 rounded text-xs font-medium capitalize"
            >
              {{ dataset.accessRights }}
            </span>
            <span
              v-if="dataset.containsPersonalData"
              class="px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700"
            >
              Personal Data
            </span>
          </div>
          <div class="flex items-center gap-4 text-xs text-gray-600">
            <span v-if="dataset.format" class="flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              {{ dataset.format }}
            </span>
            <span v-if="dataset.duoTerms && dataset.duoTerms.length > 0" class="flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              {{ dataset.duoTerms.length }} DUO term{{ dataset.duoTerms.length !== 1 ? 's' : '' }}
            </span>
          </div>
        </div>
        <svg class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </button>

    <!-- Expanded View -->
    <div v-else class="p-4 space-y-4">
      <div class="flex items-center justify-between mb-2">
        <h4 class="text-sm font-semibold text-gray-900">Dataset {{ index + 1 }}</h4>
        <button
          @click="isExpanded = false"
          class="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded p-1"
          aria-label="Collapse dataset"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>

      <FormField
        :id="`dataset-title-${index}`"
        label="Dataset Title"
        required
      >
        <input
          :id="`dataset-title-${index}`"
          :value="dataset.title"
          type="text"
          class="form-input"
          required
          @input="update({ ...dataset, title: ($event.target as HTMLInputElement).value })"
        />
      </FormField>

      <FormField
        :id="`dataset-desc-${index}`"
        label="Description"
      >
        <textarea
          :id="`dataset-desc-${index}`"
          :value="dataset.description || ''"
          rows="3"
          class="form-input"
          @input="update({ ...dataset, description: ($event.target as HTMLTextAreaElement).value })"
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
            :value="dataset.format || ''"
            type="text"
            class="form-input"
            @input="update({ ...dataset, format: ($event.target as HTMLInputElement).value })"
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
            :value="dataset.accessRights || ''"
            class="form-input"
            @change="update({ ...dataset, accessRights: ($event.target as HTMLSelectElement).value as any })"
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
          :value="dataset.license || ''"
          type="url"
          class="form-input"
          placeholder="https://creativecommons.org/licenses/by/4.0/"
          @input="update({ ...dataset, license: ($event.target as HTMLInputElement).value })"
        />
      </FormField>

      <FormField
        :id="`dataset-pid-${index}`"
        label="Persistent Identifier (PID/DOI)"
        help-text="DOI or other persistent identifier"
      >
        <input
          :id="`dataset-pid-${index}`"
          :value="dataset.pid || ''"
          type="url"
          class="form-input"
          placeholder="https://doi.org/10.1234/example"
          @input="update({ ...dataset, pid: ($event.target as HTMLInputElement).value })"
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
          v-for="(term, termIndex) in (dataset.duoTerms || [])"
          :key="termIndex"
          class="mb-2 p-2 bg-gray-50 rounded flex items-center justify-between"
        >
          <span class="text-sm font-mono text-xs break-all">{{ term }}</span>
          <button
            type="button"
            @click="removeDuoTerm(termIndex)"
            class="text-red-600 hover:text-red-800 text-sm ml-2 flex-shrink-0"
          >
            Remove
          </button>
        </div>
        <button
          type="button"
          @click="showAddDuoTerm = true"
          class="btn-secondary text-sm"
        >
          Add DUO Term
        </button>
        <div v-if="showAddDuoTerm" class="mt-2 p-3 bg-gray-50 rounded space-y-2">
          <input
            v-model="newDuoTerm"
            type="url"
            placeholder="http://purl.obolibrary.org/obo/DUO_0000006"
            class="form-input text-sm"
          />
          <div class="flex gap-2">
            <button
              type="button"
              @click="addDuoTerm"
              class="btn-primary text-sm"
            >
              Add
            </button>
            <button
              type="button"
              @click="showAddDuoTerm = false; newDuoTerm = ''"
              class="btn-secondary text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <FormField
        :id="`dataset-personal-data-${index}`"
        label="Contains Personal Data"
        help-text="If checked, access restriction text is required for compliance"
      >
        <label class="form-checkbox-field">
          <input
            :id="`dataset-personal-data-${index}`"
            type="checkbox"
            :checked="dataset.containsPersonalData || false"
            class="form-checkbox-small"
            @change="update({ ...dataset, containsPersonalData: ($event.target as HTMLInputElement).checked })"
          />
          <span>Contains Personal Data</span>
        </label>
      </FormField>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FormField from './FormField.vue'
import type { Dataset } from '@/types/canvas'

interface Props {
  dataset: Dataset
  index: number
  update: (item: Dataset) => void
}

const props = defineProps<Props>()
// New datasets (without title) start expanded
const isExpanded = ref(!props.dataset.title || props.dataset.title.trim() === '')

const showAddDuoTerm = ref(false)
const newDuoTerm = ref<string>('')

function addDuoTerm() {
  if (newDuoTerm.value.trim()) {
    const updatedDuoTerms = [...(props.dataset.duoTerms || []), newDuoTerm.value.trim()]
    props.update({ ...props.dataset, duoTerms: updatedDuoTerms })
    newDuoTerm.value = ''
    showAddDuoTerm.value = false
  }
}

function removeDuoTerm(termIndex: number) {
  const updatedDuoTerms = (props.dataset.duoTerms || []).filter((_, idx) => idx !== termIndex)
  props.update({ ...props.dataset, duoTerms: updatedDuoTerms })
}
</script>
