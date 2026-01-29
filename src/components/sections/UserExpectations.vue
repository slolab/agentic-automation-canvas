<template>
  <div class="space-y-6">
    <div>
      <h2 class="section-header">User Expectations & Requirements</h2>
      <p class="section-description">
        Capture user requirements as <a href="http://purl.org/net/p-plan" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-800 underline font-medium" title="P-Plan (Plan Ontology) - extends PROV-O for representing plans and steps">P-Plan</a> elements (using <a href="https://www.w3.org/TR/prov-o/#Plan" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-800 underline font-medium" title="PROV-O Plan type">PROV-O Plan</a> and <a href="http://purl.org/net/p-plan#Step" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-800 underline font-medium" title="P-Plan Step type">p-plan:Step</a>), including user stories and stakeholder values.
      </p>
    </div>

    <div>
      <h3 class="subsection-header">Tasks</h3>
      <p class="text-sm text-gray-600 mb-4">
        Tasks are elements of the project process. Each task represents a specific automation task that contributes to the overall project goals. Define what needs to be automated, estimate the value it will deliver, and track its progress.
      </p>
      <MultiValueInput
        v-model="localRequirements"
        label="task"
        :create-default="() => ({ id: `req-${Date.now()}`, description: '' })"
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

    <div>
      <h3 class="subsection-header">Stakeholders</h3>
      <MultiValueInput
        v-model="localStakeholders"
        label="stakeholder"
        :create-default="() => ({ name: '' })"
      >
        <template #input="{ item, index, update }">
          <div class="space-y-3 p-4 border border-gray-200 rounded-lg">
            <FormField
              :id="`stakeholder-name-${index}`"
              label="Name"
              required
            >
              <input
                :id="`stakeholder-name-${index}`"
                :value="item.name"
                type="text"
                class="form-input"
                required
                @input="update({ ...item, name: ($event.target as HTMLInputElement).value })"
              />
            </FormField>

            <FormField
              :id="`stakeholder-role-${index}`"
              label="Role"
            >
              <input
                :id="`stakeholder-role-${index}`"
                :value="item.role || ''"
                type="text"
                class="form-input"
                @input="update({ ...item, role: ($event.target as HTMLInputElement).value })"
              />
            </FormField>
          </div>
        </template>
      </MultiValueInput>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import FormField from '../FormField.vue'
import MultiValueInput from '../MultiValueInput.vue'
import RequirementItem from '../RequirementItem.vue'
import type { Requirement, Stakeholder } from '@/types/canvas'
import { useCanvasData } from '@/composables/useCanvasData'

const { canvasData, updateUserExpectations } = useCanvasData()

// Initialize with proper object copying
const initLocalData = () => {
  const expectations = canvasData.value.userExpectations
  return {
    requirements: (expectations?.requirements || []).map((item) => ({ ...item })),
    stakeholders: (expectations?.stakeholders || []).map((item) => ({ ...item })),
  }
}

const initialData = initLocalData()
const localRequirements = ref<Requirement[]>(initialData.requirements)
const localStakeholders = ref<Stakeholder[]>(initialData.stakeholders)

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
        localRequirements.value = (newExpectations.requirements || []).map((item) => ({ ...item }))
        localStakeholders.value = (newExpectations.stakeholders || []).map((item) => ({ ...item }))
      } else {
        // Reset when cleared
        localRequirements.value = []
        localStakeholders.value = []
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
watch(localRequirements, async (newReqs) => {
  // Skip if we're currently syncing from canvasData to avoid circular updates
  if (isSyncingFromCanvas) return
  
  isLocalUpdate = true
  updateUserExpectations({
    requirements: [...newReqs],
    stakeholders: [...localStakeholders.value],
  })
  await nextTick()
  isLocalUpdate = false
}, { deep: true, immediate: false })

watch(localStakeholders, async (newStakeholders) => {
  // Skip if we're currently syncing from canvasData to avoid circular updates
  if (isSyncingFromCanvas) return
  
  isLocalUpdate = true
  updateUserExpectations({
    requirements: [...localRequirements.value],
    stakeholders: [...newStakeholders],
  })
  await nextTick()
  isLocalUpdate = false
}, { deep: true, immediate: false })
</script>
