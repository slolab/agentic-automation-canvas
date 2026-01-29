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
              {{ stage.name || 'Unnamed Stage' }}
            </span>
            <span
              v-if="stage.startDate || stage.endDate"
              class="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700"
            >
              {{ formatDateRange(stage.startDate, stage.endDate) }}
            </span>
          </div>
          <div class="flex items-center gap-4 text-xs text-gray-600">
            <span v-if="stage.agents && stage.agents.length > 0" class="flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {{ stage.agents.length }} agent{{ stage.agents.length !== 1 ? 's' : '' }}
            </span>
            <span v-if="stage.milestones && stage.milestones.length > 0" class="flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ stage.milestones.length }} milestone{{ stage.milestones.length !== 1 ? 's' : '' }}
            </span>
            <span v-if="stage.complianceStandards && stage.complianceStandards.length > 0" class="flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              {{ stage.complianceStandards.length }} standard{{ stage.complianceStandards.length !== 1 ? 's' : '' }}
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
        <h4 class="text-sm font-semibold text-gray-900">Stage {{ index + 1 }}</h4>
        <button
          @click="isExpanded = false"
          class="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded p-1"
          aria-label="Collapse stage"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>

      <FormField
        :id="`stage-name-${index}`"
        label="Stage Name"
        required
      >
        <select
          :id="`stage-name-${index}`"
          :value="stage.name"
          class="form-input"
          @change="update({ ...stage, name: ($event.target as HTMLSelectElement).value })"
        >
          <option value="">Select stage</option>
          <option value="Design">Design</option>
          <option value="Development">Development</option>
          <option value="Validation">Validation</option>
          <option value="Deployment">Deployment</option>
          <option value="Monitoring">Monitoring</option>
        </select>
      </FormField>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          :id="`stage-start-${index}`"
          label="Start Date"
        >
          <input
            :id="`stage-start-${index}`"
            :value="stage.startDate || ''"
            type="date"
            class="form-input"
            @input="update({ ...stage, startDate: ($event.target as HTMLInputElement).value })"
          />
        </FormField>

        <FormField
          :id="`stage-end-${index}`"
          label="End Date"
        >
          <input
            :id="`stage-end-${index}`"
            :value="stage.endDate || ''"
            type="date"
            class="form-input"
            :min="stage.startDate"
            @input="update({ ...stage, endDate: ($event.target as HTMLInputElement).value })"
          />
        </FormField>
      </div>

      <div>
        <label class="form-label mb-2">
          Agents
          <span class="text-xs text-gray-500 font-normal ml-2">
            (<a href="https://www.w3.org/TR/prov-o/#Agent" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-800 underline" title="PROV-O Agent type">PROV-O Agents</a>)
          </span>
        </label>
        <div
          v-for="(agent, agentIndex) in (stage.agents || [])"
          :key="agentIndex"
          class="mb-2 p-2 bg-gray-50 rounded"
        >
          <div class="flex items-center justify-between mb-1">
            <span class="text-sm font-medium">
              {{ agent.type === 'person' ? getPersonName(agent.personId) : agent.name }} ({{ agent.type }})
            </span>
            <button
              type="button"
              @click="removeAgent(agentIndex)"
              class="text-red-600 hover:text-red-800 text-sm"
            >
              Remove
            </button>
          </div>
          <div v-if="agent.role" class="text-xs text-gray-600 mb-1">
            Role: {{ agent.role }}
          </div>
          <div v-if="agent.type === 'person' && agent.personId" class="text-xs text-gray-500 space-y-0.5">
            <div v-if="getPersonInfo(agent.personId)?.affiliation">Affiliation: {{ getPersonInfo(agent.personId)?.affiliation }}</div>
            <div v-if="getPersonInfo(agent.personId)?.orcid">ORCID: {{ getPersonInfo(agent.personId)?.orcid }}</div>
            <div v-if="agent.roleContext">Context: {{ agent.roleContext }}</div>
          </div>
        </div>
        <button
          type="button"
          @click="showAddAgent = true"
          class="btn-secondary text-sm"
        >
          Add Agent
        </button>
        <div v-if="showAddAgent" class="mt-2 p-3 bg-gray-50 rounded space-y-2">
          <select
            v-model="newAgent.type"
            class="form-input text-sm"
          >
            <option value="person">Person</option>
            <option value="organization">Organization</option>
            <option value="software">Software</option>
          </select>
          
          <!-- Person selection (for person type) -->
          <div v-if="newAgent.type === 'person'">
            <select
              v-model="newAgent.personId"
              class="form-input text-sm"
              :class="{ 'border-red-300': !newAgent.personId }"
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
            <p v-if="!availablePersons.length" class="text-xs text-yellow-600 mt-1">
              No persons available. Please add persons in the "Persons" section first.
            </p>
          </div>
          
          <!-- Name input (for organization/software type) -->
          <input
            v-else
            v-model="newAgent.name"
            type="text"
            placeholder="Agent name"
            class="form-input text-sm"
          />
          
          <input
            v-model="newAgent.role"
            type="text"
            placeholder="Role (optional)"
            class="form-input text-sm"
          />
          
          <!-- Role context (for person type) -->
          <input
            v-if="newAgent.type === 'person'"
            v-model="newAgent.roleContext"
            type="text"
            placeholder="Role Context (e.g., Design phase technical oversight)"
            class="form-input text-sm"
          />
          
          <div class="flex gap-2">
            <button
              type="button"
              @click="addAgent"
              class="btn-primary text-sm"
              :disabled="newAgent.type === 'person' && !newAgent.personId"
            >
              Add
            </button>
            <button
              type="button"
              @click="showAddAgent = false; resetNewAgent()"
              class="btn-secondary text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <div>
        <label class="form-label mb-2">
          Milestones
          <span class="text-xs text-gray-500 font-normal ml-2">
            (Key deliverables or checkpoints for this stage)
          </span>
        </label>
        <div
          v-for="(milestone, milestoneIndex) in (stage.milestones || [])"
          :key="milestoneIndex"
          class="mb-2 p-3 bg-gray-50 rounded space-y-2"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1 space-y-2">
              <div class="text-sm font-medium text-gray-700">{{ milestone.description }}</div>
              <div v-if="milestone.kpi" class="text-xs text-gray-600">KPI: {{ milestone.kpi }}</div>
            </div>
            <button
              type="button"
              @click="removeMilestone(milestoneIndex)"
              class="text-red-600 hover:text-red-800 text-sm ml-2"
            >
              Remove
            </button>
          </div>
        </div>
        <button
          type="button"
          @click="showAddMilestone = true"
          class="btn-secondary text-sm"
        >
          Add Milestone
        </button>
        <div v-if="showAddMilestone" class="mt-2 p-3 bg-gray-50 rounded space-y-2">
          <input
            v-model="newMilestone.description"
            type="text"
            placeholder="Milestone description"
            class="form-input text-sm"
          />
          <input
            v-model="newMilestone.kpi"
            type="text"
            placeholder="KPI / Criteria (optional)"
            class="form-input text-sm"
          />
          <div class="flex gap-2">
            <button
              type="button"
              @click="addMilestone"
              class="btn-primary text-sm"
            >
              Add
            </button>
            <button
              type="button"
              @click="showAddMilestone = false; newMilestone = { description: '', kpi: '' }"
              class="btn-secondary text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <div>
        <label class="form-label mb-2">Compliance Standards</label>
        <p class="text-xs text-gray-500 mb-2">
          Regulatory or compliance standards that apply to this stage (e.g., GDPR, HIPAA, ISO 27001). Add one standard per entry.
        </p>
        <div
          v-for="(standard, standardIndex) in (stage.complianceStandards || [])"
          :key="standardIndex"
          class="mb-2 p-2 bg-gray-50 rounded flex items-center justify-between"
        >
          <span class="text-sm">{{ standard }}</span>
          <button
            type="button"
            @click="removeCompliance(standardIndex)"
            class="text-red-600 hover:text-red-800 text-sm ml-2"
          >
            Remove
          </button>
        </div>
        <button
          type="button"
          @click="showAddCompliance = true"
          class="btn-secondary text-sm"
        >
          Add Compliance Standard
        </button>
        <div v-if="showAddCompliance" class="mt-2 p-3 bg-gray-50 rounded space-y-2">
          <input
            v-model="newCompliance"
            type="text"
            placeholder="e.g., GDPR"
            class="form-input text-sm"
          />
          <div class="flex gap-2">
            <button
              type="button"
              @click="addCompliance"
              class="btn-primary text-sm"
            >
              Add
            </button>
            <button
              type="button"
              @click="showAddCompliance = false; newCompliance = ''"
              class="btn-secondary text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import FormField from './FormField.vue'
import type { GovernanceStage, Agent, Milestone, Person } from '@/types/canvas'
import { useCanvasData } from '@/composables/useCanvasData'

interface Props {
  stage: GovernanceStage
  index: number
  update: (item: GovernanceStage) => void
}

const props = defineProps<Props>()
const { canvasData } = useCanvasData()

// New stages (without name) start expanded
const isExpanded = ref(!props.stage.name || props.stage.name.trim() === '')

const showAddAgent = ref(false)
const newAgent = ref<Agent>({ type: 'person' })
const showAddMilestone = ref(false)
const newMilestone = ref<Milestone>({ description: '', kpi: '' })
const showAddCompliance = ref(false)
const newCompliance = ref<string>('')

// Get available persons
const availablePersons = computed<Person[]>(() => {
  return canvasData.value.persons || []
})

// Helper functions
function getPersonName(personId?: string): string {
  if (!personId) return 'Unassigned Person'
  const person = availablePersons.value.find(p => p.id === personId)
  return person?.name || 'Unknown Person'
}

function getPersonInfo(personId?: string): Person | null {
  if (!personId) return null
  return availablePersons.value.find(p => p.id === personId) || null
}

function resetNewAgent() {
  newAgent.value = { type: 'person' }
}

function formatDateRange(start?: string, end?: string): string {
  if (!start && !end) return ''
  if (start && end) {
    return `${new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
  }
  if (start) {
    return `From ${new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
  }
  return `Until ${new Date(end!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
}

function addAgent() {
  // Validation: person type requires personId, non-person types require name
  if (newAgent.value.type === 'person') {
    if (!newAgent.value.personId) {
      return // Don't add if no person selected
    }
  } else {
    if (!newAgent.value.name?.trim()) {
      return // Don't add if no name provided
    }
  }
  
  const updatedAgents = [...(props.stage.agents || []), { ...newAgent.value }]
  props.update({ ...props.stage, agents: updatedAgents })
  resetNewAgent()
  showAddAgent.value = false
}

function removeAgent(agentIndex: number) {
  const updatedAgents = (props.stage.agents || []).filter((_, idx) => idx !== agentIndex)
  props.update({ ...props.stage, agents: updatedAgents })
}

function addMilestone() {
  if (newMilestone.value.description.trim()) {
    const updatedMilestones = [...(props.stage.milestones || []), { ...newMilestone.value }]
    props.update({ ...props.stage, milestones: updatedMilestones })
    newMilestone.value = { description: '', kpi: '' }
    showAddMilestone.value = false
  }
}

function removeMilestone(milestoneIndex: number) {
  const updatedMilestones = (props.stage.milestones || []).filter((_, idx) => idx !== milestoneIndex)
  props.update({ ...props.stage, milestones: updatedMilestones })
}

function addCompliance() {
  if (newCompliance.value.trim()) {
    const updatedCompliance = [...(props.stage.complianceStandards || []), newCompliance.value.trim()]
    props.update({ ...props.stage, complianceStandards: updatedCompliance })
    newCompliance.value = ''
    showAddCompliance.value = false
  }
}

function removeCompliance(complianceIndex: number) {
  const updatedCompliance = (props.stage.complianceStandards || []).filter((_, idx) => idx !== complianceIndex)
  props.update({ ...props.stage, complianceStandards: updatedCompliance })
}
</script>
