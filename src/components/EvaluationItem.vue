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
              {{ evaluation.type || 'Untitled Evaluation' }}
            </span>
            <span
              v-if="evaluation.date"
              class="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
            >
              {{ formatDate(evaluation.date) }}
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
        <h4 class="text-sm font-semibold text-gray-900">Evaluation {{ index + 1 }}</h4>
        <button
          @click="isExpanded = false"
          class="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded p-1"
          aria-label="Collapse evaluation"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>

      <FormField
        :id="`eval-type-${index}`"
        label="Evaluation Type"
        help-text="Type of evaluation (e.g., Performance Evaluation, User Study, Compliance Audit). Evaluations link to governance stages via <a href='https://www.w3.org/TR/prov-o/#wasGeneratedBy' target='_blank' rel='noopener noreferrer' class='text-primary-600 hover:text-primary-800 underline' title='PROV-O wasGeneratedBy property'>PROV-O wasGeneratedBy</a>."
        required
      >
        <input
          :id="`eval-type-${index}`"
          :value="evaluation.type"
          type="text"
          class="form-input"
          placeholder="e.g., Usability Test, Performance Evaluation"
          required
          @input="update({ ...evaluation, type: ($event.target as HTMLInputElement).value })"
        />
      </FormField>

      <FormField
        :id="`eval-date-${index}`"
        label="Date"
      >
        <input
          :id="`eval-date-${index}`"
          :value="evaluation.date || ''"
          type="date"
          class="form-input"
          @input="update({ ...evaluation, date: ($event.target as HTMLInputElement).value })"
        />
      </FormField>

      <FormField
        :id="`eval-results-${index}`"
        label="Results"
      >
        <textarea
          :id="`eval-results-${index}`"
          :value="evaluation.results || ''"
          rows="3"
          class="form-input"
          @input="update({ ...evaluation, results: ($event.target as HTMLTextAreaElement).value })"
        />
      </FormField>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FormField from './FormField.vue'
import type { Evaluation } from '@/types/canvas'

interface Props {
  evaluation: Evaluation
  index: number
  update: (item: Evaluation) => void
}

const props = defineProps<Props>()
// New evaluations (without type) start expanded
const isExpanded = ref(!props.evaluation.type || props.evaluation.type.trim() === '')

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>
