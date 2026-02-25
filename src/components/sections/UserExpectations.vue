<template>
  <div class="space-y-6">
    <div>
      <h2 class="section-header flex items-center gap-2">
        <span>Tasks & Benefits</span>
        <InfoTooltip
          content="<strong>What goes here:</strong> The automation tasks you need to accomplish.<br/><br/><strong>Benefits:</strong> Each task can have multiple benefits across five types: Time (savings), Quality (improvements), Risk (reduction), Enablement (new capabilities), and Cost (savings). Use the Edit Benefits button to define detailed benefit metrics.<br/><br/><strong>Stakeholders:</strong> Add stakeholders directly to each task from the persons list. This makes it clear which stakeholders are interested in each specific task.<br/><br/><strong>Workflow tip:</strong> Start with task descriptions, then define value model fields and benefits. Add stakeholders per-task after creating persons. Tasks are represented as P-Plan Steps and link to governance stages."
          position="top"
        />
      </h2>
      <p class="section-description">
        What are the essential tasks you need to automate to achieve the project goal? Capture tasks and their requirements as <a href="http://purl.org/net/p-plan" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-800 underline font-medium" title="P-Plan (Plan Ontology) - extends PROV-O for representing plans and steps">P-Plan</a> elements (using <a href="https://www.w3.org/TR/prov-o/#Plan" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-800 underline font-medium" title="PROV-O Plan type">PROV-O Plan</a> and <a href="http://purl.org/net/p-plan#Step" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-800 underline font-medium" title="P-Plan Step type">p-plan:Step</a>), including user stories and stakeholder values.
      </p>
    </div>

    <div>
      <p class="text-sm text-gray-600 mb-2">
        Tasks are elements of the project process. Each element represents a specific automation task that contributes to the overall project goals.
      </p>
      <ul class="text-sm text-gray-600 mb-4 list-disc ml-6 space-y-1">
        <li><strong>Capture benefits</strong> to communicate value to stakeholders—baseline vs expected values show improvement at a glance</li>
        <li>The <strong>visual progress bars</strong> in collapsed task view (green = net savings) provide immediate impact visualization</li>
        <li>Define <strong>volume per month</strong> to calculate total monthly impact from per-unit benefits</li>
      </ul>
      <MultiValueInput
        v-model="localRequirements"
        label="task"
        :create-default="() => ({ id: `req-${Date.now()}`, title: '', benefits: [] })"
      >
        <template #input="{ item, index, update }">
          <RequirementItem
            :requirement="item"
            :index="index"
            :update="update"
          />
        </template>
      </MultiValueInput>
    </div>

    <!-- Stakeholders section removed - stakeholders are now managed per-task -->
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import MultiValueInput from '../MultiValueInput.vue'
import RequirementItem from '../RequirementItem.vue'
import InfoTooltip from '../InfoTooltip.vue'
import type { Requirement } from '@/types/canvas'
import { useCanvasData } from '@/composables/useCanvasData'

const { canvasData, updateUserExpectations } = useCanvasData()

// Initialize with proper object copying
const initLocalData = () => {
  const expectations = canvasData.value.userExpectations
  return {
    requirements: (expectations?.requirements || []).map((item) => ({ 
      ...item, 
      benefits: item.benefits || [] 
    })),
  }
}

const initialData = initLocalData()
const localRequirements = ref<Requirement[]>(initialData.requirements)

let isLocalUpdate = false
let isSyncingFromCanvas = false

// Watch for changes from canvasData (e.g., when cleared or imported)
watch(
  () => canvasData.value.userExpectations,
  (newExpectations) => {
    // Don't sync if the update came from us
    if (!isLocalUpdate) {
      isSyncingFromCanvas = true
      if (newExpectations) {
        localRequirements.value = (newExpectations.requirements || []).map((item) => ({ 
          ...item, 
          benefits: item.benefits || [] 
        }))
      } else {
        // Reset when cleared
        localRequirements.value = []
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
watch(localRequirements, async (newReqs) => {
  // Skip if we're currently syncing from canvasData to avoid circular updates
  if (isSyncingFromCanvas) return
  
  isLocalUpdate = true
  updateUserExpectations({
    requirements: [...newReqs],
  })
  await nextTick()
  isLocalUpdate = false
}, { deep: true, immediate: false })
</script>
