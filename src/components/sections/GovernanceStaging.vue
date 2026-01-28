<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Governance & Staging</h2>
      <p class="text-sm text-gray-600 mb-6">
        Define governance stages as PROV-O Activities with associated agents, milestones, and compliance standards.
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
            <label class="form-label mb-2">Agents</label>
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

          <FormField
            :id="`stage-milestones-${index}`"
            label="Milestones"
            help-text="Key milestones for this stage (one per line)"
          >
            <textarea
              :id="`stage-milestones-${index}`"
              :value="(item.milestones || []).join('\n')"
              rows="3"
              class="form-input"
              @input="update({ ...item, milestones: ($event.target as HTMLTextAreaElement).value.split('\n').filter(m => m.trim()) })"
            />
          </FormField>

          <FormField
            :id="`stage-compliance-${index}`"
            label="Compliance Standards"
            help-text="Regulatory or compliance standards (e.g., GDPR, HIPAA, GxP)"
          >
            <input
              :id="`stage-compliance-${index}`"
              :value="(item.complianceStandards || []).join(', ')"
              type="text"
              class="form-input"
              placeholder="GDPR, HIPAA"
              @input="update({ ...item, complianceStandards: ($event.target as HTMLInputElement).value.split(',').map(s => s.trim()).filter(s => s) })"
            />
          </FormField>
        </div>
      </template>
    </MultiValueInput>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import FormField from '../FormField.vue'
import MultiValueInput from '../MultiValueInput.vue'
import type { GovernanceStage, Agent } from '@/types/canvas'
import { useCanvasData } from '@/composables/useCanvasData'

const { canvasData, updateGovernance } = useCanvasData()

const localStages = ref<GovernanceStage[]>(
  canvasData.value.governance?.stages || []
)

const showAddAgent = ref<number | null>(null)
const newAgent = ref<Agent>({ name: '', type: 'person' })

// Watch for local changes and update canvasData immediately
watch(localStages, () => {
  updateGovernance({ stages: [...localStages.value] })
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
</script>
