<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-4">
      <p class="text-sm text-gray-600 flex-1">
        Track new capabilities enabled by automation, coverage improvements, or latency reductions.
      </p>
      <button
        @click="addBenefit"
        class="btn-secondary text-sm flex-shrink-0"
      >
        Add Enablement Benefit
      </button>
    </div>

    <div v-if="localBenefits.length === 0" class="text-center py-8 text-gray-500">
      <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      <p>No enablement benefits added yet</p>
      <p class="text-xs mt-1">Click "Add Enablement Benefit" to track new capabilities</p>
    </div>

    <div
      v-for="(benefit, index) in localBenefits"
      :key="index"
      class="border border-gray-200 rounded-lg p-4 space-y-4"
    >
      <div class="flex items-start justify-between">
        <h4 class="text-sm font-medium text-gray-900">Enablement Benefit {{ index + 1 }}</h4>
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
            <option value="newCapability">New Capability</option>
            <option value="coverage">Coverage</option>
            <option value="latencyToAnswer">Latency to Answer</option>
            <option value="throughput">Throughput</option>
            <option value="availability">Availability</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div v-if="benefit.metricId === 'custom'">
          <label class="form-label">Custom Metric Label</label>
          <input
            :value="benefit.metricLabel"
            type="text"
            class="form-input"
            placeholder="e.g., New Workflow Types"
            @input="updateBenefit(index, { metricLabel: ($event.target as HTMLInputElement).value })"
          />
        </div>

        <div>
          <label class="form-label">Value Type</label>
          <select
            :value="getValueType(benefit.baseline)"
            class="form-input"
            @change="handleValueTypeChange(index, ($event.target as HTMLSelectElement).value)"
          >
            <option value="binary">Binary (Yes/No)</option>
            <option value="numeric">Numeric</option>
          </select>
        </div>

        <div>
          <label class="form-label flex items-center gap-1">
            Aggregation Basis
            <InfoTooltip
              content="<strong>Per Unit:</strong> Benefit applies per unit of work (e.g., 8 minutes per document, $5 per transaction). Multiply by volume for total impact.<br/><br/><strong>Per Month:</strong> Benefit is already aggregated per month (e.g., 3 compliance incidents per month, $2500 operational cost per month). Don't multiply by volume.<br/><br/><strong>One-off:</strong> Benefit is a one-time occurrence (e.g., new capability enabled, one-time setup cost). Not per unit or per month."
            />
          </label>
          <select
            :value="benefit.aggregationBasis || 'oneOff'"
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
            placeholder="e.g., capabilities"
            @input="updateBenefit(index, { benefitUnit: ($event.target as HTMLInputElement).value })"
          />
        </div>
      </div>

      <!-- Baseline -->
      <div>
        <label class="form-label">Baseline</label>
        <template v-if="getValueType(benefit.baseline) === 'binary'">
          <div class="flex items-center gap-4">
            <label class="form-checkbox-field flex-1">
              <input
                type="radio"
                :name="`baseline-${index}`"
                :checked="!getBinaryValue(benefit.baseline)"
                class="form-checkbox-small"
                @change="updateBenefit(index, { baseline: { type: 'binary', bool: false } })"
              />
              <span>Not Available</span>
            </label>
            <label class="form-checkbox-field flex-1">
              <input
                type="radio"
                :name="`baseline-${index}`"
                :checked="getBinaryValue(benefit.baseline)"
                class="form-checkbox-small"
                @change="updateBenefit(index, { baseline: { type: 'binary', bool: true } })"
              />
              <span>Available</span>
            </label>
          </div>
        </template>
        <template v-else>
          <input
            :value="getNumericValue(benefit.baseline)"
            type="number"
            min="0"
            step="0.1"
            class="form-input"
            placeholder="Current value"
            @input="updateBenefit(index, { baseline: { type: 'numeric', value: parseFloat(($event.target as HTMLInputElement).value) || 0 } })"
          />
        </template>
      </div>

      <!-- Expected -->
      <div>
        <label class="form-label">Expected (After Automation)</label>
        <template v-if="getValueType(benefit.expected) === 'binary'">
          <div class="flex items-center gap-4">
            <label class="form-checkbox-field flex-1">
              <input
                type="radio"
                :name="`expected-${index}`"
                :checked="!getBinaryValue(benefit.expected)"
                class="form-checkbox-small"
                @change="updateBenefit(index, { expected: { type: 'binary', bool: false } })"
              />
              <span>Not Available</span>
            </label>
            <label class="form-checkbox-field flex-1">
              <input
                type="radio"
                :name="`expected-${index}`"
                :checked="getBinaryValue(benefit.expected)"
                class="form-checkbox-small"
                @change="updateBenefit(index, { expected: { type: 'binary', bool: true } })"
              />
              <span>Available</span>
            </label>
          </div>
        </template>
        <template v-else>
          <input
            :value="getNumericValue(benefit.expected)"
            type="number"
            min="0"
            step="0.1"
            class="form-input"
            placeholder="Expected value"
            @input="updateBenefit(index, { expected: { type: 'numeric', value: parseFloat(($event.target as HTMLInputElement).value) || 0 } })"
          />
        </template>
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
          placeholder="Key assumptions underlying the enablement benefit"
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
  isBinary: boolean
}

const metricDefaults: Record<string, MetricDefaults> = {
  'newCapability': { label: 'New Capability', unit: 'capability', direction: 'boolIsBetter', valueMeaning: 'absolute', isBinary: true },
  'coverage': { label: 'Coverage', unit: 'cases covered', direction: 'increaseIsBetter', valueMeaning: 'absolute', isBinary: false },
  'latencyToAnswer': { label: 'Latency to Answer', unit: 'seconds', direction: 'decreaseIsBetter', valueMeaning: 'absolute', isBinary: false },
  'throughput': { label: 'Throughput', unit: 'units/hour', direction: 'increaseIsBetter', valueMeaning: 'absolute', isBinary: false },
  'availability': { label: 'Availability', unit: '%', direction: 'increaseIsBetter', valueMeaning: 'absolute', isBinary: false },
  'custom': { label: '', unit: '', direction: 'increaseIsBetter', valueMeaning: 'absolute', isBinary: false }
}

function getMetricLabel(metricId: string): string {
  return metricDefaults[metricId]?.label || metricId
}

function getDefaultUnit(metricId: string): string {
  return metricDefaults[metricId]?.unit || 'units'
}

function getMetricDefaults(metricId: string): { direction: BenefitDirection; valueMeaning: ValueMeaning } {
  const defaults = metricDefaults[metricId] || metricDefaults['custom']
  return { direction: defaults.direction, valueMeaning: defaults.valueMeaning }
}

function isBinaryMetric(metricId: string): boolean {
  return metricDefaults[metricId]?.isBinary || false
}

function createDefaultBenefit(): Benefit {
  const defaults = getMetricDefaults('newCapability')
  return {
    benefitType: 'enablement',
    metricId: 'newCapability',
    metricLabel: 'New Capability',
    direction: defaults.direction,
    valueMeaning: defaults.valueMeaning,
    aggregationBasis: 'oneOff',
    benefitUnit: 'capability',
    baseline: { type: 'binary', bool: false },
    expected: { type: 'binary', bool: true }
  }
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

function handleMetricChange(index: number, metricId: string) {
  const useBinary = isBinaryMetric(metricId)
  const defaults = getMetricDefaults(metricId)
  const updates: Partial<Benefit> = {
    metricId,
    metricLabel: getMetricLabel(metricId),
    benefitUnit: getDefaultUnit(metricId),
    direction: defaults.direction,
    valueMeaning: defaults.valueMeaning
  }
  
  if (useBinary) {
    updates.baseline = { type: 'binary', bool: false }
    updates.expected = { type: 'binary', bool: true }
  } else {
    updates.baseline = { type: 'numeric', value: 0 }
    updates.expected = { type: 'numeric', value: 0 }
  }
  
  updateBenefit(index, updates)
}

function handleValueTypeChange(index: number, valueType: string) {
  const updates: Partial<Benefit> = {}
  
  if (valueType === 'binary') {
    updates.baseline = { type: 'binary', bool: false }
    updates.expected = { type: 'binary', bool: true }
  } else {
    updates.baseline = { type: 'numeric', value: 0 }
    updates.expected = { type: 'numeric', value: 0 }
  }
  
  updateBenefit(index, updates)
}

function getValueType(value: BenefitValue): string {
  return value.type === 'binary' ? 'binary' : 'numeric'
}

function getNumericValue(value: BenefitValue): number {
  if (value.type === 'numeric') return value.value
  return 0
}

function getBinaryValue(value: BenefitValue): boolean {
  if (value.type === 'binary') return value.bool
  return false
}

function emitUpdate() {
  emit('update', localBenefits.value)
}
</script>
