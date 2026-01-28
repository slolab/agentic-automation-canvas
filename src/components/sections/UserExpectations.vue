<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-semibold text-gray-900 mb-4">User Expectations & Requirements</h2>
      <p class="text-sm text-gray-600 mb-6">
        Capture user requirements as PROV-O Plan and P-Plan elements, including user stories and stakeholder values.
      </p>
    </div>

    <div>
      <h3 class="text-lg font-medium text-gray-900 mb-4">Requirements</h3>
      <MultiValueInput
        v-model="localRequirements"
        label="requirement"
        :create-default="() => ({ id: `req-${Date.now()}`, description: '' })"
      >
        <template #input="{ item, index, update }">
          <div class="space-y-3 p-4 border border-gray-200 rounded-lg">
            <FormField
              :id="`req-desc-${index}`"
              label="Description"
              required
            >
              <textarea
                :id="`req-desc-${index}`"
                :value="item.description"
                rows="2"
                class="form-input"
                @input="update({ ...item, description: ($event.target as HTMLTextAreaElement).value })"
              />
            </FormField>
            
            <FormField
              :id="`req-story-${index}`"
              label="User Story"
              help-text="As a [user], I want [feature] so that [benefit]"
            >
              <input
                :id="`req-story-${index}`"
                :value="item.userStory || ''"
                type="text"
                class="form-input"
                @input="update({ ...item, userStory: ($event.target as HTMLInputElement).value })"
              />
            </FormField>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                :id="`req-priority-${index}`"
                label="Priority"
              >
                <select
                  :id="`req-priority-${index}`"
                  :value="item.priority || ''"
                  class="form-input"
                  @change="update({ ...item, priority: ($event.target as HTMLSelectElement).value as any })"
                >
                  <option value="">Select priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </FormField>

              <FormField
                :id="`req-status-${index}`"
                label="Status"
              >
                <select
                  :id="`req-status-${index}`"
                  :value="item.status || ''"
                  class="form-input"
                  @change="update({ ...item, status: ($event.target as HTMLSelectElement).value as any })"
                >
                  <option value="">Select status</option>
                  <option value="planned">Planned</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </FormField>
            </div>

            <!-- Value Model Fields (M0 - Required) -->
            <div class="mt-4 pt-4 border-t border-gray-200">
              <h4 class="text-sm font-medium text-gray-900 mb-3">Value Model (M0)</h4>
              
              <FormField
                :id="`req-unit-${index}`"
                label="Unit of Work"
                help-text="e.g., 'one staging decision', 'one data entry'"
              >
                <input
                  :id="`req-unit-${index}`"
                  :value="item.unitOfWork || ''"
                  type="text"
                  class="form-input"
                  placeholder="e.g., one staging decision"
                  @input="update({ ...item, unitOfWork: ($event.target as HTMLInputElement).value })"
                />
              </FormField>

              <FormField
                :id="`req-volume-${index}`"
                label="Volume Per Month"
                help-text="Number of units processed per month"
              >
                <input
                  :id="`req-volume-${index}`"
                  :value="item.volumePerMonth || ''"
                  type="number"
                  min="0"
                  class="form-input"
                  @input="update({ ...item, volumePerMonth: ($event.target as HTMLInputElement).value ? parseFloat(($event.target as HTMLInputElement).value) : undefined })"
                />
              </FormField>

              <FormField
                :id="`req-baseline-${index}`"
                label="Baseline Minutes Per Unit"
                help-text="Current time spent per unit (single number or 3-point estimate)"
              >
                <input
                  :id="`req-baseline-${index}`"
                  :value="typeof item.baselineMinutesPerUnit === 'number' ? item.baselineMinutesPerUnit : ''"
                  type="number"
                  min="0"
                  class="form-input"
                  placeholder="Single number"
                  @input="update({ ...item, baselineMinutesPerUnit: ($event.target as HTMLInputElement).value ? parseFloat(($event.target as HTMLInputElement).value) : undefined })"
                />
              </FormField>

              <div class="grid grid-cols-3 gap-2">
                <FormField
                  :id="`req-saved-best-${index}`"
                  label="Time Saved (Best)"
                  help-text="Best case minutes saved per unit"
                >
                  <input
                    :id="`req-saved-best-${index}`"
                    :value="item.timeSavedMinutesPerUnit?.best || ''"
                    type="number"
                    min="0"
                    class="form-input"
                    @input="update({ 
                      ...item, 
                      timeSavedMinutesPerUnit: { 
                        ...(item.timeSavedMinutesPerUnit || { likely: 0, worst: 0 }), 
                        best: ($event.target as HTMLInputElement).value ? parseFloat(($event.target as HTMLInputElement).value) : 0 
                      } 
                    })"
                  />
                </FormField>
                <FormField
                  :id="`req-saved-likely-${index}`"
                  label="Time Saved (Likely)"
                  help-text="Most likely minutes saved per unit"
                >
                  <input
                    :id="`req-saved-likely-${index}`"
                    :value="item.timeSavedMinutesPerUnit?.likely || ''"
                    type="number"
                    min="0"
                    class="form-input"
                    @input="update({ 
                      ...item, 
                      timeSavedMinutesPerUnit: { 
                        ...(item.timeSavedMinutesPerUnit || { best: 0, worst: 0 }), 
                        likely: ($event.target as HTMLInputElement).value ? parseFloat(($event.target as HTMLInputElement).value) : 0 
                      } 
                    })"
                  />
                </FormField>
                <FormField
                  :id="`req-saved-worst-${index}`"
                  label="Time Saved (Worst)"
                  help-text="Worst case minutes saved per unit"
                >
                  <input
                    :id="`req-saved-worst-${index}`"
                    :value="item.timeSavedMinutesPerUnit?.worst || ''"
                    type="number"
                    min="0"
                    class="form-input"
                    @input="update({ 
                      ...item, 
                      timeSavedMinutesPerUnit: { 
                        ...(item.timeSavedMinutesPerUnit || { best: 0, likely: 0 }), 
                        worst: ($event.target as HTMLInputElement).value ? parseFloat(($event.target as HTMLInputElement).value) : 0 
                      } 
                    })"
                  />
                </FormField>
              </div>

              <FormField
                :id="`req-value-type-${index}`"
                label="Value Type"
                help-text="Select all that apply"
              >
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      :checked="item.valueType?.includes('time') || false"
                      class="mr-2"
                      @change="handleValueTypeChange(item, update, 'time', $event)"
                    />
                    <span>Time</span>
                  </label>
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      :checked="item.valueType?.includes('quality') || false"
                      class="mr-2"
                      @change="handleValueTypeChange(item, update, 'quality', $event)"
                    />
                    <span>Quality</span>
                  </label>
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      :checked="item.valueType?.includes('risk') || false"
                      class="mr-2"
                      @change="handleValueTypeChange(item, update, 'risk', $event)"
                    />
                    <span>Risk</span>
                  </label>
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      :checked="item.valueType?.includes('enablement') || false"
                      class="mr-2"
                      @change="handleValueTypeChange(item, update, 'enablement', $event)"
                    />
                    <span>Enablement</span>
                  </label>
                </div>
              </FormField>
            </div>

            <!-- Value Model Fields (M1/M2 - Optional) -->
            <div class="mt-4 pt-4 border-t border-gray-200">
              <h4 class="text-sm font-medium text-gray-700 mb-3">Value Model (M1/M2 - Optional)</h4>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  :id="`req-rework-${index}`"
                  label="Rework Rate (%)"
                  help-text="Percentage of units requiring rework"
                >
                  <input
                    :id="`req-rework-${index}`"
                    :value="item.reworkRate || ''"
                    type="number"
                    min="0"
                    max="100"
                    class="form-input"
                    @input="update({ ...item, reworkRate: ($event.target as HTMLInputElement).value ? parseFloat(($event.target as HTMLInputElement).value) : undefined })"
                  />
                </FormField>

                <FormField
                  :id="`req-error-cost-${index}`"
                  label="Error Cost"
                  help-text="Cost of errors (number or text)"
                >
                  <input
                    :id="`req-error-cost-${index}`"
                    :value="item.errorCost || ''"
                    type="text"
                    class="form-input"
                    @input="update({ ...item, errorCost: ($event.target as HTMLInputElement).value || undefined })"
                  />
                </FormField>

                <FormField
                  :id="`req-oversight-${index}`"
                  label="Oversight Minutes Per Unit"
                  help-text="Human review time per unit"
                >
                  <input
                    :id="`req-oversight-${index}`"
                    :value="item.oversightMinutesPerUnit || ''"
                    type="number"
                    min="0"
                    class="form-input"
                    @input="update({ ...item, oversightMinutesPerUnit: ($event.target as HTMLInputElement).value ? parseFloat(($event.target as HTMLInputElement).value) : undefined })"
                  />
                </FormField>

                <FormField
                  :id="`req-confidence-user-${index}`"
                  label="User Confidence"
                >
                  <select
                    :id="`req-confidence-user-${index}`"
                    :value="item.confidenceUser || ''"
                    class="form-input"
                    @change="update({ ...item, confidenceUser: ($event.target as HTMLSelectElement).value || undefined })"
                  >
                    <option value="">Select confidence</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </FormField>

                <FormField
                  :id="`req-confidence-dev-${index}`"
                  label="Developer Confidence"
                >
                  <select
                    :id="`req-confidence-dev-${index}`"
                    :value="item.confidenceDev || ''"
                    class="form-input"
                    @change="update({ ...item, confidenceDev: ($event.target as HTMLSelectElement).value || undefined })"
                  >
                    <option value="">Select confidence</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </FormField>
              </div>

              <FormField
                :id="`req-assumptions-${index}`"
                label="Assumptions"
                help-text="Key assumptions about the value model"
              >
                <textarea
                  :id="`req-assumptions-${index}`"
                  :value="item.assumptions || ''"
                  rows="2"
                  class="form-input"
                  @input="update({ ...item, assumptions: ($event.target as HTMLTextAreaElement).value || undefined })"
                />
              </FormField>
            </div>
          </div>
        </template>
      </MultiValueInput>
    </div>

    <div>
      <h3 class="text-lg font-medium text-gray-900 mb-4">Stakeholders</h3>
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
import type { Requirement, Stakeholder } from '@/types/canvas'
import { useCanvasData } from '@/composables/useCanvasData'

// Helper function to handle value type checkbox changes
function handleValueTypeChange(
  item: Requirement,
  update: (item: Requirement) => void,
  valueType: 'time' | 'quality' | 'risk' | 'enablement',
  event: Event
) {
  const checked = (event.target as HTMLInputElement).checked
  const currentTypes = item.valueType || []
  let newTypes: Array<'time' | 'quality' | 'risk' | 'enablement'>
  
  if (checked) {
    newTypes = [...currentTypes, valueType]
  } else {
    newTypes = currentTypes.filter(t => t !== valueType)
  }
  
  update({ ...item, valueType: newTypes.length > 0 ? newTypes : undefined })
}

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
