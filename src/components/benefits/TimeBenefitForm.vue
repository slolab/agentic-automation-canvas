<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-4">
      <p class="text-sm text-gray-600 flex-1">
        Track task duration before and after automation. Baseline = duration before; expected = duration after. Time savings can be derived as (baseline − expected) × volume.
      </p>
      <button
        @click="addBenefit"
        class="btn-secondary text-sm flex-shrink-0"
      >
        Add Time Benefit
      </button>
    </div>

    <div v-if="localBenefits.length === 0" class="text-center py-8 text-gray-500">
      <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p>No time benefits added yet</p>
      <p class="text-xs mt-1">Click "Add Time Benefit" to start tracking time savings</p>
    </div>

    <div
      v-for="(benefit, index) in localBenefits"
      :key="index"
      class="border border-gray-200 rounded-lg p-4 space-y-4"
    >
      <div class="flex items-start justify-between">
        <h4 class="text-sm font-medium text-gray-900">Time Benefit {{ index + 1 }}</h4>
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
            <option value="processingTime">Processing time</option>
            <option value="cycleTime">Cycle time</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div v-if="benefit.metricId === 'custom'">
          <label class="form-label">Custom Metric Label</label>
          <input
            :value="benefit.metricLabel"
            type="text"
            class="form-input"
            placeholder="e.g., Review Time"
            @input="updateBenefit(index, { metricLabel: ($event.target as HTMLInputElement).value })"
          />
        </div>

        <div>
          <label class="form-label">Aggregation Basis</label>
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
            placeholder="e.g., minutes"
            @input="updateBenefit(index, { benefitUnit: ($event.target as HTMLInputElement).value })"
          />
        </div>
      </div>

      <!-- Baseline -->
      <div>
        <label class="form-label">Baseline (task duration before automation)</label>
        <input
          :value="getNumericValue(benefit.baseline)"
          type="number"
          min="0"
          class="form-input"
          placeholder="e.g. minutes per unit"
          @input="updateBenefit(index, { baseline: { type: 'numeric', value: parseFloat(($event.target as HTMLInputElement).value) || 0 } })"
        />
      </div>

      <!-- Expected -->
      <div>
        <label class="form-label">Expected (task duration after automation)</label>
        <input
          :value="getNumericValue(benefit.expected)"
          type="number"
          min="0"
          class="form-input"
          placeholder="e.g. minutes per unit"
          @input="updateBenefit(index, { expected: { type: 'numeric', value: parseFloat(($event.target as HTMLInputElement).value) || 0 } })"
        />
      </div>

      <!-- Confidence -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="form-label">User Confidence</label>
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
          <label class="form-label">Developer Confidence</label>
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
          placeholder="Key assumptions underlying the duration estimate"
          @input="updateBenefit(index, { assumptions: ($event.target as HTMLTextAreaElement).value || undefined })"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Benefit, BenefitValue, BenefitDirection, ValueMeaning } from '@/types/canvas'

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
  direction: BenefitDirection
  valueMeaning: ValueMeaning
}

const metricDefaults: Record<string, MetricDefaults> = {
  'processingTime': { label: 'Processing time', direction: 'decreaseIsBetter', valueMeaning: 'absolute' },
  'cycleTime': { label: 'Cycle time', direction: 'decreaseIsBetter', valueMeaning: 'absolute' },
  'custom': { label: '', direction: 'decreaseIsBetter', valueMeaning: 'absolute' }
}

function getMetricLabel(metricId: string): string {
  return metricDefaults[metricId]?.label || metricId
}

function getMetricDefaults(metricId: string): { direction: BenefitDirection; valueMeaning: ValueMeaning } {
  const defaults = metricDefaults[metricId] || metricDefaults['custom']
  return { direction: defaults.direction, valueMeaning: defaults.valueMeaning }
}

function createDefaultBenefit(): Benefit {
  const defaults = getMetricDefaults('processingTime')
  return {
    benefitType: 'time',
    metricId: 'processingTime',
    metricLabel: 'Processing time',
    direction: defaults.direction,
    valueMeaning: defaults.valueMeaning,
    aggregationBasis: 'perUnit',
    benefitUnit: 'minutes',
    baseline: { type: 'numeric', value: 0 },
    expected: { type: 'numeric', value: 0 }
  }
}

function handleMetricChange(index: number, metricId: string) {
  const defaults = getMetricDefaults(metricId)
  updateBenefit(index, {
    metricId,
    metricLabel: getMetricLabel(metricId),
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
