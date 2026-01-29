<template>
  <div class="space-y-6">
    <div>
      <h2 class="section-header">User Expectations & Requirements</h2>
      <p class="section-description">
        Capture user requirements as <a href="http://purl.org/net/p-plan" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-800 underline font-medium" title="P-Plan (Plan Ontology) - extends PROV-O for representing plans and steps">P-Plan</a> elements (using <a href="https://www.w3.org/TR/prov-o/#Plan" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-800 underline font-medium" title="PROV-O Plan type">PROV-O Plan</a> and <a href="http://purl.org/net/p-plan#Step" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-800 underline font-medium" title="P-Plan Step type">p-plan:Step</a>), including user stories and stakeholder values.
      </p>
    </div>

    <div>
      <h3 class="subsection-header">Requirements</h3>
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
            <div class="mt-6 pt-6 border-t-2 border-gray-200">
              <h4 class="subsubsection-header">Value Model (M0)</h4>
              
              <FormField
                :id="`req-unit-${index}`"
                label="Unit of Work"
                help-text="The specific work item being automated (e.g., 'one document', 'one customer inquiry', 'one analysis run'). This defines what one 'unit' means for volume and time calculations."
                required
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
                :id="`req-unit-category-${index}`"
                label="Unit Category"
                help-text="Standardized category of the work unit. Select the type that best matches your unit of work (case, document, record, message, analysis run, meeting, or other)."
                required
              >
                <select
                  :id="`req-unit-category-${index}`"
                  :value="item.unitCategory || ''"
                  class="form-input"
                  @change="update({ ...item, unitCategory: ($event.target as HTMLSelectElement).value as any || undefined })"
                >
                  <option value="">Select category</option>
                  <option value="case">Case</option>
                  <option value="document">Document</option>
                  <option value="record">Record</option>
                  <option value="message">Message</option>
                  <option value="analysisRun">Analysis Run</option>
                  <option value="meeting">Meeting</option>
                  <option value="other">Other</option>
                </select>
              </FormField>

              <FormField
                :id="`req-volume-${index}`"
                label="Volume Per Month"
                help-text="Average number of units processed per month. Used to calculate total time savings (volume × time saved per unit)."
                required
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
                help-text="Current time spent per unit before automation. Enter a single number (average) or use a 3-point estimate (best/likely/worst) if there's significant variation."
                required
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
                  help-text="Best case scenario: maximum minutes saved per unit (optimistic estimate)"
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
                  help-text="Most likely scenario: expected minutes saved per unit (realistic estimate). This is the primary value used for calculations."
                  required
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
                  help-text="Worst case scenario: minimum minutes saved per unit (conservative estimate)"
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
                help-text="Select all value types this task delivers: Time (saves time), Quality (improves accuracy/consistency), Risk (reduces errors/compliance issues), Enablement (enables new capabilities)"
              >
                <div class="flex flex-wrap gap-3">
                  <label class="form-checkbox-field">
                    <input
                      type="checkbox"
                      :checked="item.valueType?.includes('time') || false"
                      class="form-checkbox-small"
                      @change="handleValueTypeChange(item, update, 'time', $event)"
                    />
                    <span>Time</span>
                  </label>
                  <label class="form-checkbox-field">
                    <input
                      type="checkbox"
                      :checked="item.valueType?.includes('quality') || false"
                      class="form-checkbox-small"
                      @change="handleValueTypeChange(item, update, 'quality', $event)"
                    />
                    <span>Quality</span>
                  </label>
                  <label class="form-checkbox-field">
                    <input
                      type="checkbox"
                      :checked="item.valueType?.includes('risk') || false"
                      class="form-checkbox-small"
                      @change="handleValueTypeChange(item, update, 'risk', $event)"
                    />
                    <span>Risk</span>
                  </label>
                  <label class="form-checkbox-field">
                    <input
                      type="checkbox"
                      :checked="item.valueType?.includes('enablement') || false"
                      class="form-checkbox-small"
                      @change="handleValueTypeChange(item, update, 'enablement', $event)"
                    />
                    <span>Enablement</span>
                  </label>
                </div>
              </FormField>
            </div>

            <!-- Value Model Fields (M1/M2 - Optional) -->
            <div class="mt-6 pt-6 border-t-2 border-gray-200">
              <h4 class="subsubsection-header text-gray-600">Value Model (M1/M2 - Optional)</h4>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  :id="`req-rework-${index}`"
                  label="Rework Rate (%)"
                  help-text="Percentage of units requiring rework due to errors or quality issues. Used to calculate quality impact."
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
                  help-text="Estimated cost or impact of errors (can be a number or descriptive text). Used to quantify risk reduction value."
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
                  label="Human Oversight Minutes Per Unit"
                  help-text="Time required for human review/oversight per unit. This is subtracted from time saved to calculate net time savings. If automation requires no oversight, enter 0."
                >
                  <input
                    :id="`req-oversight-${index}`"
                    :value="item.humanOversightMinutesPerUnit || ''"
                    type="number"
                    min="0"
                    class="form-input"
                    @input="update({ ...item, humanOversightMinutesPerUnit: ($event.target as HTMLInputElement).value ? parseFloat(($event.target as HTMLInputElement).value) : undefined })"
                  />
                </FormField>

                <FormField
                  :id="`req-confidence-user-${index}`"
                  label="User Confidence"
                  help-text="User's confidence level in the time savings estimates (low/medium/high)"
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
                  help-text="Developer's confidence level in technical feasibility and implementation estimates (low/medium/high)"
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
                help-text="Key assumptions underlying the time savings estimates (e.g., document formats, complexity levels, edge cases)"
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
