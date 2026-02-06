<template>
  <div class="space-y-6">
    <div>
      <h2 class="section-header flex items-center gap-2">
        <span>Persons</span>
        <InfoTooltip
          content="<strong>What goes here:</strong> All people involved in the project. Create one person entry per human, then reference them in Stakeholders and Governance Agents sections.<br/><br/><strong>Why one person per human:</strong> This ensures correct role aggregation - the same person can be both a stakeholder and an agent in different stages, and their roles are properly tracked. Use Person ID to reference persons elsewhere.<br/><br/><strong>Workflow tip:</strong> Add persons first, then assign them roles in other sections. Use ORCID for researchers to enable cross-project linking."
          position="top"
        />
      </h2>
      <p class="section-description">
        Manage all persons involved in the project. Persons can be assigned roles as stakeholders or agents in governance stages. One person entity per human ensures correct role aggregation and provenance.
      </p>
    </div>

    <MultiValueInput
      v-model="localPersons"
      label="person"
      :create-default="createDefaultPerson"
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
          
          <!-- Functional Roles -->
          <div v-if="person.functionRoles && person.functionRoles.length > 0" class="mt-3">
            <div class="text-xs font-medium text-gray-700 mb-1">Functional Roles:</div>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="roleId in person.functionRoles"
                :key="roleId"
                class="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700"
              >
                {{ getRoleLabel(roleId) }}
              </span>
            </div>
          </div>
          
          <!-- Local Titles -->
          <div v-if="person.localTitles && person.localTitles.length > 0" class="mt-2">
            <div class="text-xs font-medium text-gray-700 mb-1">Local Titles:</div>
            <div class="text-xs text-gray-600">{{ person.localTitles.join(', ') }}</div>
          </div>
          
          <!-- Project Assignments -->
          <div v-if="getPersonAssignments(person.id).length > 0" class="mt-3 space-y-2">
            <div class="text-xs font-medium text-gray-700 mb-1">Project Assignments:</div>
            <div
              v-for="assignment in getPersonAssignments(person.id)"
              :key="`${assignment.type}-${assignment.context}`"
              class="text-xs"
            >
              <span
                :class="{
                  'bg-blue-100 text-blue-700': assignment.type === 'stakeholder',
                  'bg-green-100 text-green-700': assignment.type === 'agent',
                }"
                class="px-2 py-0.5 rounded font-medium"
              >
                {{ assignment.type === 'stakeholder' ? 'Stakeholder' : 'Agent' }}
              </span>
              <span v-if="assignment.context" class="text-gray-500 ml-2">({{ assignment.context }})</span>
            </div>
          </div>
          
          <div v-if="(!person.functionRoles || person.functionRoles.length === 0) && getPersonAssignments(person.id).length === 0" class="text-xs text-gray-400 italic mt-2">
            No functional roles assigned yet
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import MultiValueInput from '../MultiValueInput.vue'
import PersonItem from '../PersonItem.vue'
import InfoTooltip from '../InfoTooltip.vue'
import type { Person } from '@/types/canvas'
import { useCanvasData } from '@/composables/useCanvasData'
import functionRolesData from '@/data/function-roles.json'

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

// Generate next sequential person ID (e.g., person-0, person-1, person-2)
function getNextPersonId(): string {
  const existingIds = localPersons.value.map(p => p.id)
  const personIdPattern = /^person-(\d+)$/
  
  // Extract all numbers from existing person-<number> IDs
  const usedNumbers = existingIds
    .map(id => {
      const match = id.match(personIdPattern)
      return match ? parseInt(match[1], 10) : -1
    })
    .filter(num => num >= 0)
  
  // Find the next available number
  if (usedNumbers.length === 0) {
    return 'person-0'
  }
  
  const maxNumber = Math.max(...usedNumbers)
  return `person-${maxNumber + 1}`
}

// Create default person with sequential ID
function createDefaultPerson(): Person {
  return {
    id: getNextPersonId(),
    name: '',
    functionRoles: []
  }
}

// Get role label from ID
function getRoleLabel(roleId: string): string {
  const role = (functionRolesData as any).roles?.find((r: any) => r.id === roleId)
  return role?.label || roleId
}

// Get project assignments for a person (stakeholder/agent assignments)
function getPersonAssignments(personId: string): Array<{ type: 'stakeholder' | 'agent'; context?: string }> {
  const assignments: Array<{ type: 'stakeholder' | 'agent'; context?: string }> = []
  const taskStakeholderPersonIds = new Set<string>()
  
  // Check stakeholders from tasks (per-task stakeholders) - preferred format
  if (canvasData.value.userExpectations?.requirements) {
    canvasData.value.userExpectations.requirements.forEach((req) => {
      if (req.stakeholders && req.stakeholders.includes(personId)) {
        taskStakeholderPersonIds.add(personId)
        assignments.push({
          type: 'stakeholder',
          context: req.title || req.id,
        })
      }
    })
  }
  
  // Also check legacy stakeholders format for backward compatibility
  // Only include if person is not already a stakeholder in any task (avoid duplicates)
  if (!taskStakeholderPersonIds.has(personId) && canvasData.value.userExpectations?.stakeholders) {
    canvasData.value.userExpectations.stakeholders.forEach((stakeholder) => {
      if (stakeholder.personId === personId) {
        assignments.push({
          type: 'stakeholder',
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
            assignments.push({
              type: 'agent',
              context: agent.roleContext || stage.name,
            })
          }
        })
      }
    })
  }
  
  return assignments
}
</script>
