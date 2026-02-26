<template>
  <div class="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200">
    <!-- Collapsed View -->
    <button
      v-if="!isExpanded"
      @click="isExpanded = true"
      class="w-full text-left p-3 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset min-h-[60px]"
    >
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-sm font-medium text-gray-900 truncate">
              {{ person.name || 'Unnamed Person' }}
            </span>
          </div>
          <div class="text-xs text-gray-500">
            <span v-if="person.affiliation">{{ person.affiliation }}</span>
            <span v-if="person.affiliation && person.orcid"> • </span>
            <span v-if="person.orcid" class="font-mono">{{ person.orcid }}</span>
            <span v-if="!person.affiliation && !person.orcid" class="italic">No identity information</span>
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
        <h4 class="text-sm font-semibold text-gray-900">Person {{ index + 1 }}</h4>
        <button
          @click="isExpanded = false"
          class="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded p-1"
          aria-label="Collapse person"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>

      <FormField
        :id="`person-id-${index}`"
        label="Person ID"
        help-text="Unique identifier for this person (e.g., person-0, person-1). Used for referencing in stakeholders and agents."
        tooltip="A unique identifier for this person (e.g., person-0, person-1). This ID is used to reference the person in stakeholders and governance agents. Keep IDs simple and consistent. One person entity per human ensures correct role aggregation across the project."
      >
        <input
          :id="`person-id-${index}`"
          :value="person.id"
          type="text"
          class="form-input font-mono text-sm"
          @input="update({ ...person, id: ($event.target as HTMLInputElement).value })"
        />
      </FormField>

      <FormField
        :id="`person-name-${index}`"
        label="Name"
        tooltip="The person's full name. This is required to identify the person. Use the same name format consistently across the project."
        required
      >
        <input
          :id="`person-name-${index}`"
          :value="person.name"
          type="text"
          class="form-input"
          required
          @input="update({ ...person, name: ($event.target as HTMLInputElement).value })"
        />
      </FormField>

      <FormField
        :id="`person-affiliation-${index}`"
        label="Affiliation"
        help-text="Organization or department (e.g., 'IT Department', 'Operations'). Helps distinguish persons with the same name."
        tooltip="The person's organization or department. Examples: 'IT Department', 'Operations', 'Research Lab', 'Compliance Office'. This helps distinguish persons with the same name and provides context about their role in the organization."
      >
        <input
          :id="`person-affiliation-${index}`"
          :value="person.affiliation || ''"
          type="text"
          class="form-input"
          placeholder="e.g., IT Department"
          @input="update({ ...person, affiliation: ($event.target as HTMLInputElement).value || undefined })"
        />
      </FormField>

      <FormField
        :id="`person-orcid-${index}`"
        label="ORCID"
        help-text="ORCID identifier (e.g., https://orcid.org/0000-0000-0000-0001). Provides a stable identifier for cross-project person linking."
        tooltip="An ORCID (Open Researcher and Contributor ID) provides a persistent identifier for researchers. Format: https://orcid.org/0000-0000-0000-0001. Using ORCID enables stable cross-project person linking and helps maintain provenance across different projects and systems."
      >
        <input
          :id="`person-orcid-${index}`"
          :value="person.orcid || ''"
          type="url"
          class="form-input"
          placeholder="https://orcid.org/0000-0000-0000-0001"
          autocomplete="off"
          @input="update({ ...person, orcid: ($event.target as HTMLInputElement).value || undefined })"
        />
      </FormField>

      <FormField
        :id="`person-function-roles-${index}`"
        label="Functional Roles"
        help-text="Select one or more functional roles for this person. These are standardized roles used across projects."
        tooltip="Functional roles are standardized, controlled terms that describe a person's function in the project. Examples: Project Lead, Developer, Researcher, Data Manager. A person can have multiple functional roles. These roles are used for role aggregation and cross-project analysis."
        :error="functionRolesError"
        required
      >
        <div class="space-y-2">
          <!-- Selected roles as chips -->
          <div v-if="selectedRoles.length > 0" class="flex flex-wrap gap-2">
            <span
              v-for="roleId in selectedRoles"
              :key="roleId"
              class="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-100 text-blue-800 text-sm"
            >
              {{ getRoleLabel(roleId) }}
              <button
                type="button"
                @click="removeFunctionRole(roleId)"
                class="text-blue-600 hover:text-red-600"
                aria-label="Remove role"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          </div>
          <!-- Dropdown for selecting new roles -->
          <select
            :id="`person-function-roles-select-${index}`"
            v-model="selectedRoleId"
            class="form-input"
            @change="handleRoleSelect"
          >
            <option value="">Select a functional role...</option>
            <option
              v-for="role in availableRoles"
              :key="role.id"
              :value="role.id"
            >
              {{ role.label }}
            </option>
          </select>
        </div>
      </FormField>

      <FormField
        :id="`person-local-title-${index}`"
        label="Local Title (Optional)"
        help-text="Free-text position or title (e.g., 'Senior Research Scientist', 'Head of IT')."
        tooltip="A free-text description of this person's position or title within their organization. This is optional and complements functional roles. Examples: 'Senior Research Scientist', 'Head of IT', 'Principal Investigator'."
      >
        <input
          :id="`person-local-title-${index}`"
          :value="person.localTitle || ''"
          type="text"
          class="form-input"
          placeholder="e.g., Senior Research Scientist"
          @change="update({ ...person, localTitle: ($event.target as HTMLInputElement).value || undefined })"
        />
      </FormField>

      <!-- Validation: Check for duplicate IDs -->
      <div v-if="hasDuplicateId" class="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
        <strong>Warning:</strong> Another person already uses this ID. Person IDs must be unique.
      </div>

      <!-- Validation: Check for function roles -->
      <div v-if="functionRolesError" class="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
        <strong>Error:</strong> {{ functionRolesError }}
      </div>

      <!-- Done Button -->
      <div class="pt-4 border-t border-gray-200 mt-4">
        <button
          type="button"
          @click="isExpanded = false"
          class="btn-secondary w-full flex items-center justify-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
          </svg>
          Done (collapse)
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import FormField from './FormField.vue'
import type { Person } from '@/types/canvas'
import functionRolesData from '@/data/function-roles.json'

interface Props {
  person: Person
  index: number
  update: (item: Person) => void
  allPersons: Person[]
}

const props = defineProps<Props>()
// New persons (without name) start expanded so they can be filled in
// Existing persons start collapsed
const isExpanded = ref(!props.person.name || props.person.name.trim() === '')

// Load function roles from vocabulary
const functionRolesList = computed((): { id: string; label: string }[] => {
  return (functionRolesData as any).roles || []
})

// Selected roles
const selectedRoles = computed(() => props.person.functionRoles || [])

// Available roles (not yet selected)
const availableRoles = computed(() => {
  return functionRolesList.value.filter(role => !selectedRoles.value.includes(role.id))
})

// Dropdown selection state
const selectedRoleId = ref('')

// Get role label by ID
function getRoleLabel(roleId: string): string {
  const role = functionRolesList.value.find(r => r.id === roleId)
  return role?.label || roleId
}

// Check for duplicate IDs
const hasDuplicateId = computed(() => {
  return props.allPersons.filter(p => p.id === props.person.id).length > 1
})

// Validate function roles
const functionRolesError = computed(() => {
  const roles = props.person.functionRoles || []
  if (roles.length === 0) {
    return 'At least one functional role is required'
  }
  return undefined
})

// Handle role selection from dropdown
function handleRoleSelect() {
  if (!selectedRoleId.value) return
  const currentRoles = props.person.functionRoles || []
  if (!currentRoles.includes(selectedRoleId.value)) {
    const newRoles = [...currentRoles, selectedRoleId.value]
    props.update({ ...props.person, functionRoles: newRoles })
  }
  // Reset dropdown
  selectedRoleId.value = ''
}

// Remove a function role
function removeFunctionRole(roleId: string) {
  const currentRoles = props.person.functionRoles || []
  const newRoles = currentRoles.filter(r => r !== roleId)
  props.update({ ...props.person, functionRoles: newRoles.length > 0 ? newRoles : undefined })
}

</script>
