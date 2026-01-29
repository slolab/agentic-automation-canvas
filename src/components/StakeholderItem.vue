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
              {{ personName || 'Unassigned Person' }}
            </span>
            <span
              v-if="stakeholder.role"
              class="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
            >
              {{ stakeholder.role }}
            </span>
          </div>
          <div v-if="personInfo" class="text-xs text-gray-500 mt-0.5">
            <span v-if="personInfo.affiliation">{{ personInfo.affiliation }}</span>
            <span v-if="personInfo.affiliation && personInfo.orcid"> • </span>
            <span v-if="personInfo.orcid" class="font-mono">{{ personInfo.orcid }}</span>
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
        :id="`stakeholder-person-${index}`"
        label="Person"
        help-text="Select a person from the Persons section, or create a new person there first."
        required
      >
        <select
          :id="`stakeholder-person-${index}`"
          :value="stakeholder.personId || ''"
          class="form-input"
          required
          @change="update({ ...stakeholder, personId: ($event.target as HTMLSelectElement).value })"
        >
          <option value="">Select a person...</option>
          <option
            v-for="person in availablePersons"
            :key="person.id"
            :value="person.id"
          >
            {{ person.name }} {{ person.affiliation ? `(${person.affiliation})` : '' }}
          </option>
        </select>
      </FormField>

      <div v-if="!availablePersons.length" class="p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
        <strong>No persons available.</strong> Please add persons in the "Persons" section first.
      </div>

      <FormField
        :id="`stakeholder-role-${index}`"
        label="Role"
        help-text="The role this person has as a stakeholder (e.g., 'Data Entry Manager', 'IT Lead')"
      >
        <input
          :id="`stakeholder-role-${index}`"
          :value="stakeholder.role || ''"
          type="text"
          class="form-input"
          placeholder="e.g., Data Entry Manager"
          @input="update({ ...stakeholder, role: ($event.target as HTMLInputElement).value || undefined })"
        />
      </FormField>

      <FormField
        :id="`stakeholder-role-context-${index}`"
        label="Role Context"
        help-text="Optional context for this stakeholder role (e.g., 'Design phase requirements gathering')"
      >
        <input
          :id="`stakeholder-role-context-${index}`"
          :value="stakeholder.roleContext || ''"
          type="text"
          class="form-input"
          placeholder="e.g., Design phase requirements gathering"
          @input="update({ ...stakeholder, roleContext: ($event.target as HTMLInputElement).value || undefined })"
        />
      </FormField>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import FormField from './FormField.vue'
import type { Stakeholder, Person } from '@/types/canvas'
import { useCanvasData } from '@/composables/useCanvasData'

interface Props {
  stakeholder: Stakeholder
  index: number
  update: (item: Stakeholder) => void
}

const props = defineProps<Props>()
const { canvasData } = useCanvasData()

// Get available persons
const availablePersons = computed<Person[]>(() => {
  return canvasData.value.persons || []
})

// Get person name and info for display
const personName = computed(() => {
  if (!props.stakeholder.personId) return null
  const person = availablePersons.value.find(p => p.id === props.stakeholder.personId)
  return person?.name || 'Unknown Person'
})

const personInfo = computed(() => {
  if (!props.stakeholder.personId) return null
  return availablePersons.value.find(p => p.id === props.stakeholder.personId) || null
})

// New stakeholders (without personId) start expanded so they can be filled in
// Existing stakeholders start collapsed
const isExpanded = ref(!props.stakeholder.personId || props.stakeholder.personId.trim() === '')
</script>
