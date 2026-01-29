<template>
  <div class="space-y-6">
    <div>
      <h2 class="section-header">Governance & Staging</h2>
      <p class="section-description">
        Define governance stages as <a href="https://www.w3.org/TR/prov-o/#Activity" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-800 underline font-medium" title="PROV-O Activity type - represents processes or workflows">PROV-O Activities</a> with associated <a href="https://www.w3.org/TR/prov-o/#Agent" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-800 underline font-medium" title="PROV-O Agent type">agents</a> (via <a href="https://www.w3.org/TR/prov-o/#wasAssociatedWith" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-800 underline font-medium" title="PROV-O wasAssociatedWith property">wasAssociatedWith</a>), milestones, and compliance standards. Stages are linked via <a href="https://www.w3.org/TR/prov-o/#wasInformedBy" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-800 underline font-medium" title="PROV-O wasInformedBy property">wasInformedBy</a> to show workflow dependencies.
      </p>
    </div>

    <MultiValueInput
      v-model="localStages"
      label="governance stage"
      :create-default="() => ({ id: `stage-${Date.now()}`, name: '' })"
    >
      <template #input="{ item, index, update }">
        <div class="space-y-4 p-4 border border-gray-200 rounded-lg">
          <FormField
            :id="`stage-name-${index}`"
            label="Stage Name"
            required
          >
            <select
              :id="`stage-name-${index}`"
              :value="item.name"
              class="form-input"
              @change="update({ ...item, name: ($event.target as HTMLSelectElement).value })"
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
                :value="item.startDate || ''"
                type="date"
                class="form-input"
                @input="update({ ...item, startDate: ($event.target as HTMLInputElement).value })"
              />
            </FormField>

            <FormField
              :id="`stage-end-${index}`"
              label="End Date"
            >
              <input
                :id="`stage-end-${index}`"
                :value="item.endDate || ''"
                type="date"
                class="form-input"
                :min="item.startDate"
                @input="update({ ...item, endDate: ($event.target as HTMLInputElement).value })"
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
              v-for="(agent, agentIndex) in (item.agents || [])"
              :key="agentIndex"
              class="mb-2 p-2 bg-gray-50 rounded flex items-center justify-between"
            >
              <span class="text-sm">{{ agent.name }} ({{ agent.type }})</span>
              <button
                type="button"
                @click="removeAgent(item, agentIndex)"
                class="text-red-600 hover:text-red-800 text-sm"
              >
                Remove
              </button>
            </div>
            <button
              type="button"
              @click="showAddAgent = index"
              class="btn-secondary text-sm"
            >
              Add Agent
            </button>
            <div v-if="showAddAgent === index" class="mt-2 p-3 bg-gray-50 rounded space-y-2">
              <input
                v-model="newAgent.name"
                type="text"
                placeholder="Agent name"
                class="form-input text-sm"
              />
              <select
                v-model="newAgent.type"
                class="form-input text-sm"
              >
                <option value="person">Person</option>
                <option value="organization">Organization</option>
                <option value="software">Software</option>
              </select>
              <input
                v-model="newAgent.role"
                type="text"
                placeholder="Role (optional)"
                class="form-input text-sm"
              />
              <div class="flex gap-2">
                <button
                  type="button"
                  @click="addAgent(item, index)"
                  class="btn-primary text-sm"
                >
                  Add
                </button>
                <button
                  type="button"
                  @click="showAddAgent = null; newAgent = { name: '', type: 'person' }"
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
              v-for="(milestone, milestoneIndex) in (item.milestones || [])"
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
                  @click="removeMilestone(item, milestoneIndex)"
                  class="text-red-600 hover:text-red-800 text-sm ml-2"
                >
                  Remove
                </button>
              </div>
            </div>
            <button
              type="button"
              @click="showAddMilestone = index"
              class="btn-secondary text-sm"
            >
              Add Milestone
            </button>
            <div v-if="showAddMilestone === index" class="mt-2 p-3 bg-gray-50 rounded space-y-2">
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
                  @click="addMilestone(item, index)"
                  class="btn-primary text-sm"
                >
                  Add
                </button>
                <button
                  type="button"
                  @click="showAddMilestone = null; newMilestone = { description: '', kpi: '' }"
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
              v-for="(standard, standardIndex) in (item.complianceStandards || [])"
              :key="standardIndex"
              class="mb-2 p-2 bg-gray-50 rounded flex items-center justify-between"
            >
              <span class="text-sm">{{ standard }}</span>
              <button
                type="button"
                @click="removeCompliance(item, standardIndex)"
                class="text-red-600 hover:text-red-800 text-sm ml-2"
              >
                Remove
              </button>
            </div>
            <button
              type="button"
              @click="showAddCompliance = index"
              class="btn-secondary text-sm"
            >
              Add Compliance Standard
            </button>
            <div v-if="showAddCompliance === index" class="mt-2 p-3 bg-gray-50 rounded space-y-2">
              <input
                v-model="newCompliance"
                type="text"
                placeholder="e.g., GDPR"
                class="form-input text-sm"
              />
              <div class="flex gap-2">
                <button
                  type="button"
                  @click="addCompliance(item, index)"
                  class="btn-primary text-sm"
                >
                  Add
                </button>
                <button
                  type="button"
                  @click="showAddCompliance = null; newCompliance = ''"
                  class="btn-secondary text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </MultiValueInput>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import FormField from '../FormField.vue'
import MultiValueInput from '../MultiValueInput.vue'
import type { GovernanceStage, Agent, Milestone } from '@/types/canvas'
import { useCanvasData } from '@/composables/useCanvasData'

const { canvasData, updateGovernance } = useCanvasData()

// Initialize with proper deep copying of nested arrays
const initLocalStages = (): GovernanceStage[] => {
  const stages = canvasData.value.governance?.stages || []
  return stages.map((stage) => ({
    ...stage,
    agents: stage.agents ? stage.agents.map(a => ({ ...a })) : undefined,
    milestones: stage.milestones ? stage.milestones.map(m => typeof m === 'string' ? { description: m, kpi: '' } : { ...m }) : undefined,
    complianceStandards: stage.complianceStandards ? [...stage.complianceStandards] : undefined,
  }))
}

const localStages = ref<GovernanceStage[]>(initLocalStages())

const showAddAgent = ref<number | null>(null)
const newAgent = ref<Agent>({ name: '', type: 'person' })
const showAddMilestone = ref<number | null>(null)
const newMilestone = ref<Milestone>({ description: '', kpi: '' })
const showAddCompliance = ref<number | null>(null)
const newCompliance = ref<string>('')

let isLocalUpdate = false
let isSyncingFromCanvas = false

// Watch for changes from canvasData (e.g., when cleared or imported)
watch(
  () => canvasData.value.governance,
  (newGovernance) => {
    // Don't sync if the update came from us
    if (!isLocalUpdate) {
      isSyncingFromCanvas = true
      if (newGovernance && newGovernance.stages) {
        // Deep copy stages with nested arrays (agents, milestones, complianceStandards)
        localStages.value = newGovernance.stages.map((stage) => ({
          ...stage,
          agents: stage.agents ? stage.agents.map(a => ({ ...a })) : undefined,
          milestones: stage.milestones ? stage.milestones.map(m => typeof m === 'string' ? { description: m, kpi: '' } : { ...m }) : undefined,
          complianceStandards: stage.complianceStandards ? [...stage.complianceStandards] : undefined,
        }))
      } else {
        // Reset when cleared
        localStages.value = []
      }
      // Reset flag after syncing
      nextTick(() => {
        isSyncingFromCanvas = false
      })
    }
  },
  { deep: true, immediate: false }
)

// Watch for local changes and update canvasData immediately
watch(localStages, async () => {
  // Skip if we're currently syncing from canvasData to avoid circular updates
  if (isSyncingFromCanvas) return
  
  isLocalUpdate = true
  updateGovernance({ stages: [...localStages.value] })
  await nextTick()
  isLocalUpdate = false
}, { deep: true, immediate: false })

const addAgent = (stage: GovernanceStage, stageIndex: number) => {
  if (newAgent.value.name.trim()) {
    // Create a new array with updated stage
    const updatedStages = localStages.value.map((s, i) => {
      if (i === stageIndex) {
        const updatedAgents = [...(stage.agents || []), { ...newAgent.value }]
        return { ...stage, agents: updatedAgents }
      }
      return s
    })
    localStages.value = updatedStages
    newAgent.value = { name: '', type: 'person' }
    showAddAgent.value = null
  }
}

const removeAgent = (stage: GovernanceStage, agentIndex: number) => {
  const stageIndex = localStages.value.findIndex(s => s.id === stage.id)
  if (stageIndex !== -1 && stage.agents) {
    // Create a new array with updated stage
    const updatedStages = localStages.value.map((s, i) => {
      if (i === stageIndex) {
        const updatedAgents = stage.agents!.filter((_, idx) => idx !== agentIndex)
        return { ...stage, agents: updatedAgents }
      }
      return s
    })
    localStages.value = updatedStages
  }
}

const addMilestone = (stage: GovernanceStage, stageIndex: number) => {
  if (newMilestone.value.description.trim()) {
    // Create a new array with updated stage
    const updatedStages = localStages.value.map((s, i) => {
      if (i === stageIndex) {
        const updatedMilestones = [...(stage.milestones || []), { ...newMilestone.value }]
        return { ...stage, milestones: updatedMilestones }
      }
      return s
    })
    localStages.value = updatedStages
    newMilestone.value = { description: '', kpi: '' }
    showAddMilestone.value = null
  }
}

const removeMilestone = (stage: GovernanceStage, milestoneIndex: number) => {
  const stageIndex = localStages.value.findIndex(s => s.id === stage.id)
  if (stageIndex !== -1 && stage.milestones) {
    // Create a new array with updated stage
    const updatedStages = localStages.value.map((s, i) => {
      if (i === stageIndex) {
        const updatedMilestones = stage.milestones!.filter((_, idx) => idx !== milestoneIndex)
        return { ...stage, milestones: updatedMilestones }
      }
      return s
    })
    localStages.value = updatedStages
  }
}

const addCompliance = (stage: GovernanceStage, stageIndex: number) => {
  if (newCompliance.value.trim()) {
    // Create a new array with updated stage
    const updatedStages = localStages.value.map((s, i) => {
      if (i === stageIndex) {
        const updatedCompliance = [...(stage.complianceStandards || []), newCompliance.value.trim()]
        return { ...stage, complianceStandards: updatedCompliance }
      }
      return s
    })
    localStages.value = updatedStages
    newCompliance.value = ''
    showAddCompliance.value = null
  }
}

const removeCompliance = (stage: GovernanceStage, complianceIndex: number) => {
  const stageIndex = localStages.value.findIndex(s => s.id === stage.id)
  if (stageIndex !== -1 && stage.complianceStandards) {
    // Create a new array with updated stage
    const updatedStages = localStages.value.map((s, i) => {
      if (i === stageIndex) {
        const updatedCompliance = stage.complianceStandards!.filter((_, idx) => idx !== complianceIndex)
        return { ...stage, complianceStandards: updatedCompliance }
      }
      return s
    })
    localStages.value = updatedStages
  }
}
</script>
