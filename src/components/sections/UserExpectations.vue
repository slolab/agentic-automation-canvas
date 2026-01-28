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
import { ref, watch } from 'vue'
import FormField from '../FormField.vue'
import MultiValueInput from '../MultiValueInput.vue'
import type { Requirement, Stakeholder } from '@/types/canvas'
import { useCanvasData } from '@/composables/useCanvasData'

const { canvasData, updateUserExpectations } = useCanvasData()

const localRequirements = ref<Requirement[]>(
  canvasData.value.userExpectations?.requirements || []
)
const localStakeholders = ref<Stakeholder[]>(
  canvasData.value.userExpectations?.stakeholders || []
)

// Watch for local changes and update canvasData immediately
watch(localRequirements, (newReqs) => {
  updateUserExpectations({
    requirements: [...newReqs],
    stakeholders: [...localStakeholders.value],
  })
}, { deep: true, immediate: false })

watch(localStakeholders, (newStakeholders) => {
  updateUserExpectations({
    requirements: [...localRequirements.value],
    stakeholders: [...newStakeholders],
  })
}, { deep: true, immediate: false })
</script>
