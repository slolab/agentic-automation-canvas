<template>
  <div class="space-y-6">
    <div>
      <h2 class="section-header">Persons</h2>
      <p class="section-description">
        Manage all persons involved in the project. Persons can be assigned roles as stakeholders or agents in governance stages. One person entity per human ensures correct role aggregation and provenance.
      </p>
    </div>

    <MultiValueInput
      v-model="localPersons"
      label="person"
      :create-default="() => ({ id: `person-${Date.now()}`, name: '' })"
    >
      <template #input="{ item, index, update }">
        <PersonItem
          :person="item"
          :index="index"
          :update="update"
          :all-persons="localPersons"
        />
      </template>
    </MultiValueInput>

    <!-- Show roles for each person -->
    <div v-if="localPersons.length > 0" class="mt-6 pt-6 border-t-2 border-gray-200">
      <h3 class="subsection-header">Person Roles</h3>
      <p class="text-sm text-gray-600 mb-4">
        Overview of all roles assigned to each person across the project.
      </p>
      <div class="space-y-3">
        <div
          v-for="person in localPersons"
          :key="person.id"
          class="border border-gray-200 rounded-lg p-4"
        >
          <div class="flex items-start justify-between mb-2">
            <div>
              <h4 class="text-sm font-semibold text-gray-900">{{ person.name }}</h4>
              <div class="text-xs text-gray-500 mt-1">
                <span v-if="person.affiliation">{{ person.affiliation }}</span>
                <span v-if="person.affiliation && person.orcid"> • </span>
                <span v-if="person.orcid" class="font-mono">{{ person.orcid }}</span>
              </div>
            </div>
            <span class="text-xs text-gray-500 font-mono">{{ person.id }}</span>
          </div>
          
          <div v-if="getPersonRoles(person.id).length > 0" class="mt-3 space-y-2">
            <div
              v-for="role in getPersonRoles(person.id)"
              :key="`${role.type}-${role.context}`"
              class="text-xs"
            >
              <span
                :class="{
                  'bg-blue-100 text-blue-700': role.type === 'stakeholder',
                  'bg-green-100 text-green-700': role.type === 'agent',
                }"
                class="px-2 py-0.5 rounded font-medium"
              >
                {{ role.type === 'stakeholder' ? 'Stakeholder' : 'Agent' }}
              </span>
              <span class="text-gray-600 ml-2">{{ role.role || 'No role specified' }}</span>
              <span v-if="role.context" class="text-gray-500 ml-2">({{ role.context }})</span>
            </div>
          </div>
          <div v-else class="text-xs text-gray-400 italic mt-2">
            No roles assigned yet
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import MultiValueInput from '../MultiValueInput.vue'
import PersonItem from '../PersonItem.vue'
import type { Person } from '@/types/canvas'
import { useCanvasData } from '@/composables/useCanvasData'

const { canvasData, updatePersons } = useCanvasData()

// Initialize with proper object copying
const initLocalData = () => {
  const persons = canvasData.value.persons || []
  return persons.map((item) => ({ ...item }))
}

const initialData = initLocalData()
const localPersons = ref<Person[]>(initialData)

let isLocalUpdate = false
let isSyncingFromCanvas = false

// Watch for changes from canvasData (e.g., when cleared or imported)
watch(
  () => canvasData.value.persons,
  (newPersons) => {
    // Don't sync if the update came from us
    if (!isLocalUpdate) {
      isSyncingFromCanvas = true
      if (newPersons) {
        localPersons.value = newPersons.map((item) => ({ ...item }))
      } else {
        // Reset when cleared
        localPersons.value = []
      }
      // Reset flag after syncing
      nextTick(() => {
        isSyncingFromCanvas = false
      })
    }
  },
  { deep: true, immediate: true }
)

// Watch for local changes and update canvasData immediately
watch(localPersons, async (newPersons) => {
  // Skip if we're currently syncing from canvasData to avoid circular updates
  if (isSyncingFromCanvas) return
  
  isLocalUpdate = true
  updatePersons([...newPersons])
  await nextTick()
  isLocalUpdate = false
}, { deep: true, immediate: false })

// Get all roles for a person
function getPersonRoles(personId: string): Array<{ type: 'stakeholder' | 'agent'; role?: string; context?: string }> {
  const roles: Array<{ type: 'stakeholder' | 'agent'; role?: string; context?: string }> = []
  
  // Check stakeholders
  if (canvasData.value.userExpectations?.stakeholders) {
    canvasData.value.userExpectations.stakeholders.forEach((stakeholder) => {
      if (stakeholder.personId === personId) {
        roles.push({
          type: 'stakeholder',
          role: stakeholder.role,
          context: stakeholder.roleContext,
        })
      }
    })
  }
  
  // Check agents in governance stages
  if (canvasData.value.governance?.stages) {
    canvasData.value.governance.stages.forEach((stage) => {
      if (stage.agents) {
        stage.agents.forEach((agent) => {
          if (agent.type === 'person' && agent.personId === personId) {
            roles.push({
              type: 'agent',
              role: agent.role,
              context: agent.roleContext || stage.name,
            })
          }
        })
      }
    })
  }
  
  return roles
}
</script>
