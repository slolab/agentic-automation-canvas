<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-4">
      <p class="text-sm text-gray-600 flex-1">
        Track quality improvements like error reduction, precision, recall, or satisfaction metrics.
      </p>
      <button
        @click="addBenefit"
        class="btn-secondary text-sm flex-shrink-0"
      >
        Add Quality Benefit
      </button>
    </div>

    <div v-if="localBenefits.length === 0" class="text-center py-8 text-gray-500">
      <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p>No quality benefits added yet</p>
      <p class="text-xs mt-1">Click "Add Quality Benefit" to track quality improvements</p>
    </div>

    <div
      v-for="(benefit, index) in localBenefits"
      :key="index"
      class="border border-gray-200 rounded-lg p-4 space-y-4"
    >
      <div class="flex items-start justify-between">
        <h4 class="text-sm font-medium text-gray-900">Quality Benefit {{ index + 1 }}</h4>
        <button
          @click="removeBenefit(index)"
          class="text-red-500 hover:text-red-700 text-sm"
        >
          Remove
        </button>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="form-label">Metric</label>
          <select
            :value="benefit.metricId"
            class="form-input"
            @change="handleMetricChange(index, ($event.target as HTMLSelectElement).value)"
          >
            <option value="errorRate">Error Rate</option>
            <option value="reworkRate">Rework Rate</option>
            <option value="precision">Precision</option>
            <option value="recall">Recall</option>
            <option value="satisfaction">Satisfaction Score</option>
            <option value="accuracy">Accuracy</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div v-if="benefit.metricId === 'custom'">
          <label class="form-label">Custom Metric Label</label>
          <input
            :value="benefit.metricLabel"
            type="text"
            class="form-input"
            placeholder="e.g., Consistency Score"
            @input="updateBenefit(index, { metricLabel: ($event.target as HTMLInputElement).value })"
          />
        </div>

        <div>
          <label class="form-label flex items-center gap-1">
            Aggregation Basis
            <InfoTooltip
              content="<strong>Per Unit:</strong> Benefit applies per unit of work (e.g., 8 minutes per document, $5 per transaction). Multiply by volume for total impact.<br/><br/><strong>Per Month:</strong> Benefit is already aggregated per month (e.g., 3 compliance incidents per month, $2500 operational cost per month). Don't multiply by volume.<br/><br/><strong>One-off:</strong> Benefit is a one-time occurrence (e.g., new capability enabled, one-time setup cost). Not per unit or per month."
            />
          </label>
          <select
            :value="benefit.aggregationBasis || 'perUnit'"
            class="form-input"
            @change="updateBenefit(index, { aggregationBasis: ($event.target as HTMLSelectElement).value as any })"
          >
            <option value="perUnit">Per Unit</option>
            <option value="perMonth">Per Month</option>
            <option value="oneOff">One-off</option>
          </select>
        </div>

        <div>
          <label class="form-label">Unit</label>
          <input
            :value="benefit.benefitUnit"
            type="text"
            class="form-input"
            placeholder="e.g., %"
            @input="updateBenefit(index, { benefitUnit: ($event.target as HTMLInputElement).value })"
          />
        </div>
      </div>

      <!-- Baseline -->
      <div>
        <label class="form-label">Baseline Value</label>
        <input
          :value="getNumericValue(benefit.baseline)"
          type="number"
          step="0.1"
          class="form-input"
          placeholder="Current value (e.g., 15 for 15% error rate)"
          @input="updateBenefit(index, { baseline: { type: 'numeric', value: parseFloat(($event.target as HTMLInputElement).value) || 0 } })"
        />
      </div>

      <!-- Expected -->
      <div>
        <label class="form-label">Expected Value (After Automation)</label>
        <input
          :value="getNumericValue(benefit.expected)"
          type="number"
          step="0.1"
          class="form-input"
          placeholder="Expected value (e.g., 3 for 3% error rate)"
          @input="updateBenefit(index, { expected: { type: 'numeric', value: parseFloat(($event.target as HTMLInputElement).value) || 0 } })"
        />
      </div>

      <!-- Confidence -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="form-label flex items-center gap-1">User Confidence <InfoTooltip content="How confident is the <strong>user / domain expert</strong> that this benefit estimate is realistic? Based on their experience with current workflows and understanding of the task. Disagreement between user and developer confidence highlights areas for discussion." position="top" /></label>
          <select
            :value="benefit.confidenceUser || ''"
            class="form-input"
            @change="updateBenefit(index, { confidenceUser: ($event.target as HTMLSelectElement).value as any || undefined })"
          >
            <option value="">Select...</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label class="form-label flex items-center gap-1">Developer Confidence <InfoTooltip content="How confident is the <strong>developer / technical team</strong> that this benefit can be delivered as estimated? Based on technical feasibility, system complexity, and implementation experience. Disagreement between user and developer confidence highlights areas for discussion." position="top" /></label>
          <select
            :value="benefit.confidenceDev || ''"
            class="form-input"
            @change="updateBenefit(index, { confidenceDev: ($event.target as HTMLSelectElement).value as any || undefined })"
          >
            <option value="">Select...</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <!-- Assumptions -->
      <div>
        <label class="form-label">Assumptions</label>
        <textarea
          :value="benefit.assumptions || ''"
          rows="2"
          class="form-input"
          placeholder="Key assumptions underlying the quality improvement estimate"
          @input="updateBenefit(index, { assumptions: ($event.target as HTMLTextAreaElement).value || undefined })"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Benefit, BenefitValue, BenefitDirection, ValueMeaning } from '@/types/canvas'
import InfoTooltip from '../InfoTooltip.vue'

interface Props {
  benefits: Benefit[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update': [benefits: Benefit[]]
}>()

const localBenefits = ref<Benefit[]>([])

watch(() => props.benefits, (newBenefits) => {
  localBenefits.value = newBenefits.map(b => ({ ...b }))
}, { immediate: true, deep: true })

// Metric defaults for direction and valueMeaning
interface MetricDefaults {
  label: string
  unit: string
  direction: BenefitDirection
  valueMeaning: ValueMeaning
}

const metricDefaults: Record<string, MetricDefaults> = {
  'errorRate': { label: 'Error Rate', unit: '%', direction: 'decreaseIsBetter', valueMeaning: 'absolute' },
  'reworkRate': { label: 'Rework Rate', unit: '%', direction: 'decreaseIsBetter', valueMeaning: 'absolute' },
  'precision': { label: 'Precision', unit: '%', direction: 'increaseIsBetter', valueMeaning: 'absolute' },
  'recall': { label: 'Recall', unit: '%', direction: 'increaseIsBetter', valueMeaning: 'absolute' },
  'satisfaction': { label: 'Satisfaction Score', unit: 'score', direction: 'increaseIsBetter', valueMeaning: 'absolute' },
  'accuracy': { label: 'Accuracy', unit: '%', direction: 'increaseIsBetter', valueMeaning: 'absolute' },
  'custom': { label: '', unit: '', direction: 'increaseIsBetter', valueMeaning: 'absolute' }
}

function getMetricLabel(metricId: string): string {
  return metricDefaults[metricId]?.label || metricId
}

function getDefaultUnit(metricId: string): string {
  return metricDefaults[metricId]?.unit || '%'
}

function getMetricDefaults(metricId: string): { direction: BenefitDirection; valueMeaning: ValueMeaning } {
  const defaults = metricDefaults[metricId] || metricDefaults['custom']
  return { direction: defaults.direction, valueMeaning: defaults.valueMeaning }
}

function createDefaultBenefit(): Benefit {
  const defaults = getMetricDefaults('errorRate')
  return {
    benefitType: 'quality',
    metricId: 'errorRate',
    metricLabel: 'Error Rate',
    direction: defaults.direction,
    valueMeaning: defaults.valueMeaning,
    aggregationBasis: 'perUnit',
    benefitUnit: '%',
    baseline: { type: 'numeric', value: 0 },
    expected: { type: 'numeric', value: 0 }
  }
}

function handleMetricChange(index: number, metricId: string) {
  const defaults = getMetricDefaults(metricId)
  updateBenefit(index, {
    metricId,
    metricLabel: getMetricLabel(metricId),
    benefitUnit: getDefaultUnit(metricId),
    direction: defaults.direction,
    valueMeaning: defaults.valueMeaning
  })
}

function addBenefit() {
  localBenefits.value = [...localBenefits.value, createDefaultBenefit()]
  emitUpdate()
}

function removeBenefit(index: number) {
  localBenefits.value = localBenefits.value.filter((_, i) => i !== index)
  emitUpdate()
}

function updateBenefit(index: number, updates: Partial<Benefit>) {
  localBenefits.value = localBenefits.value.map((b, i) => 
    i === index ? { ...b, ...updates } : b
  )
  emitUpdate()
}

function getNumericValue(value: BenefitValue): number {
  if (value.type === 'numeric') return value.value
  return 0
}

function emitUpdate() {
  emit('update', localBenefits.value)
}
</script>
