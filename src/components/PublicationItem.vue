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
              {{ publication.title || 'Untitled Publication' }}
            </span>
            <span
              v-if="publication.date"
              class="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
            >
              {{ formatDate(publication.date) }}
            </span>
          </div>
          <div class="flex items-center gap-4 text-xs text-gray-600">
            <span v-if="publication.authors && publication.authors.length > 0" class="flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {{ publication.authors.length }} author{{ publication.authors.length !== 1 ? 's' : '' }}
            </span>
            <span v-if="publication.doi" class="flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              DOI
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
        <h4 class="text-sm font-semibold text-gray-900">Publication {{ index + 1 }}</h4>
        <button
          @click="isExpanded = false"
          class="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded p-1"
          aria-label="Collapse publication"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>

      <FormField
        :id="`pub-title-${index}`"
        label="Title"
        required
      >
        <input
          :id="`pub-title-${index}`"
          :value="publication.title"
          type="text"
          class="form-input"
          required
          @input="update({ ...publication, title: ($event.target as HTMLInputElement).value })"
        />
      </FormField>

      <FormField
        :id="`pub-doi-${index}`"
        label="DOI"
        help-text="Digital Object Identifier (DOI) as a full URL (e.g., https://doi.org/10.1234/example). Publications use <a href='https://schema.org/ScholarlyArticle' target='_blank' rel='noopener noreferrer' class='text-primary-600 hover:text-primary-800 underline' title='Schema.org ScholarlyArticle type'>schema:ScholarlyArticle</a> type."
      >
        <input
          :id="`pub-doi-${index}`"
          :value="publication.doi || ''"
          type="url"
          class="form-input"
          placeholder="https://doi.org/10.1234/example"
          @input="update({ ...publication, doi: ($event.target as HTMLInputElement).value })"
        />
      </FormField>

      <FormField
        :id="`pub-authors-${index}`"
        label="Authors"
        help-text="Comma-separated list of authors"
      >
        <input
          :id="`pub-authors-${index}`"
          :value="(publication.authors || []).join(', ')"
          type="text"
          class="form-input"
          @input="update({ ...publication, authors: ($event.target as HTMLInputElement).value.split(',').map(s => s.trim()).filter(s => s) })"
        />
      </FormField>

      <FormField
        :id="`pub-date-${index}`"
        label="Publication Date"
      >
        <input
          :id="`pub-date-${index}`"
          :value="publication.date || ''"
          type="date"
          class="form-input"
          @input="update({ ...publication, date: ($event.target as HTMLInputElement).value })"
        />
      </FormField>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FormField from './FormField.vue'
import type { Publication } from '@/types/canvas'

interface Props {
  publication: Publication
  index: number
  update: (item: Publication) => void
}

const props = defineProps<Props>()
// New publications (without title) start expanded
const isExpanded = ref(!props.publication.title || props.publication.title.trim() === '')

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>
