<template>
  <div class="space-y-6">
    <div>
      <h2 class="section-header">Governance & Staging</h2>
      <p class="section-description">
        How will you manage the project lifecycle? Define the major stages of your project (e.g., Design, Development, Validation, Deployment, Monitoring) with associated agents, milestones, and compliance standards. Stages are represented as <a href="https://www.w3.org/TR/prov-o/#Activity" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-800 underline font-medium" title="PROV-O Activity type - represents processes or workflows">PROV-O Activities</a> and linked sequentially to show the project workflow.
      </p>
    </div>

    <MultiValueInput
      v-model="localStages"
      label="governance stage"
      :create-default="() => ({ id: `stage-${Date.now()}`, name: '' })"
    >
      <template #input="{ item, index, update }">
        <GovernanceStageItem
          :stage="item"
          :index="index"
          :update="update"
        />
      </template>
    </MultiValueInput>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import MultiValueInput from '../MultiValueInput.vue'
import GovernanceStageItem from '../GovernanceStageItem.vue'
import type { GovernanceStage } from '@/types/canvas'
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
</script>
