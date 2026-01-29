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
              {{ deliverable.title || 'Untitled Deliverable' }}
            </span>
            <span
              v-if="deliverable.type"
              class="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700"
            >
              {{ deliverable.type }}
            </span>
            <span
              v-if="deliverable.date"
              class="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
            >
              {{ formatDate(deliverable.date) }}
            </span>
          </div>
        </div>
        <svg class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </button>

    <!-- Expanded View -->
    <div v-else class="p-4 space-y-3">
      <div class="flex items-center justify-between mb-2">
        <h4 class="text-sm font-semibold text-gray-900">Deliverable {{ index + 1 }}</h4>
        <button
          @click="isExpanded = false"
          class="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded p-1"
          aria-label="Collapse deliverable"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>

      <FormField
        :id="`deliverable-title-${index}`"
        label="Title"
        tooltip="The title of the deliverable. Deliverables are outputs of your project such as software, reports, datasets, or documentation. Examples: 'Automated Document Classification System', 'Project Evaluation Report', 'Training Dataset'."
        required
      >
        <input
          :id="`deliverable-title-${index}`"
          :value="deliverable.title"
          type="text"
          class="form-input"
          required
          @input="update({ ...deliverable, title: ($event.target as HTMLInputElement).value })"
        />
      </FormField>

      <FormField
        :id="`deliverable-type-${index}`"
        label="Type"
        help-text="Deliverable type using <a href='https://schema.org/CreativeWork' target='_blank' rel='noopener noreferrer' class='text-primary-600 hover:text-primary-800 underline' title='Schema.org CreativeWork type'>Schema.org</a> types (e.g., SoftwareApplication, Report, Dataset, Document). Maps to <a href='https://sparontologies.github.io/frapo/current/frapo.html#d4e1003' target='_blank' rel='noopener noreferrer' class='text-primary-600 hover:text-primary-800 underline' title='FRAPO Deliverable class'>FRAPO Deliverable</a>."
        tooltip="The type of deliverable using Schema.org types. Common types: SoftwareApplication (software systems), Report (reports or documents), Dataset (data files), WebApplication (web apps), CodeRepository (source code). This helps categorize deliverables and appears in RO-Crate metadata."
        required
      >
        <input
          :id="`deliverable-type-${index}`"
          :value="deliverable.type"
          type="text"
          class="form-input"
          placeholder="e.g., Report, Software, Dataset"
          required
          @input="update({ ...deliverable, type: ($event.target as HTMLInputElement).value })"
        />
      </FormField>

      <FormField
        :id="`deliverable-desc-${index}`"
        label="Description"
        tooltip="A description of what the deliverable is, what it contains, and how it relates to the project. This helps others understand what was produced and how to use it."
      >
        <textarea
          :id="`deliverable-desc-${index}`"
          :value="deliverable.description || ''"
          rows="2"
          class="form-input"
          @input="update({ ...deliverable, description: ($event.target as HTMLTextAreaElement).value })"
        />
      </FormField>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          :id="`deliverable-date-${index}`"
          label="Date"
          tooltip="The date when the deliverable was completed or released. This helps track project progress and timeline."
        >
          <input
            :id="`deliverable-date-${index}`"
            :value="deliverable.date || ''"
            type="date"
            class="form-input"
            @input="update({ ...deliverable, date: ($event.target as HTMLInputElement).value })"
          />
        </FormField>

        <FormField
          :id="`deliverable-pid-${index}`"
          label="PID/DOI"
          help-text="Persistent Identifier (PID) or Digital Object Identifier (DOI) for the deliverable (e.g., https://doi.org/10.1234/example)"
          tooltip="A persistent identifier (PID) or DOI for the deliverable if it has been published or assigned one. Use a DOI if published (e.g., https://doi.org/10.1234/software), or another PID for versioned deliverables. PIDs enable stable references and help track deliverable versions."
        >
          <input
            :id="`deliverable-pid-${index}`"
            :value="deliverable.pid || ''"
            type="url"
            class="form-input"
            placeholder="https://doi.org/10.1234/example"
            @input="update({ ...deliverable, pid: ($event.target as HTMLInputElement).value })"
          />
        </FormField>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FormField from './FormField.vue'
import type { Deliverable } from '@/types/canvas'

interface Props {
  deliverable: Deliverable
  index: number
  update: (item: Deliverable) => void
}

const props = defineProps<Props>()
// New deliverables (without title) start expanded
const isExpanded = ref(!props.deliverable.title || props.deliverable.title.trim() === '')

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>
