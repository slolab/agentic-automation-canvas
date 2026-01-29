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
          <div class="flex items-center gap-2 mb-1">
            <span class="text-sm font-medium text-gray-900 truncate">
              {{ stakeholder.name || 'Unnamed Stakeholder' }}
            </span>
            <span
              v-if="stakeholder.role"
              class="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
            >
              {{ stakeholder.role }}
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
        <h4 class="text-sm font-semibold text-gray-900">Stakeholder {{ index + 1 }}</h4>
        <button
          @click="isExpanded = false"
          class="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded p-1"
          aria-label="Collapse stakeholder"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>

      <FormField
        :id="`stakeholder-name-${index}`"
        label="Name"
        required
      >
        <input
          :id="`stakeholder-name-${index}`"
          :value="stakeholder.name"
          type="text"
          class="form-input"
          required
          @input="update({ ...stakeholder, name: ($event.target as HTMLInputElement).value })"
        />
      </FormField>

      <FormField
        :id="`stakeholder-role-${index}`"
        label="Role"
      >
        <input
          :id="`stakeholder-role-${index}`"
          :value="stakeholder.role || ''"
          type="text"
          class="form-input"
          @input="update({ ...stakeholder, role: ($event.target as HTMLInputElement).value })"
        />
      </FormField>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import FormField from './FormField.vue'
import type { Stakeholder } from '@/types/canvas'

interface Props {
  stakeholder: Stakeholder
  index: number
  update: (item: Stakeholder) => void
}

const props = defineProps<Props>()
// New stakeholders (without name) start expanded so they can be filled in
// Existing stakeholders start collapsed
const isExpanded = ref(!props.stakeholder.name || props.stakeholder.name.trim() === '')
</script>
