<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-4">
      <p class="text-sm text-gray-600 flex-1">
        Track risk reduction metrics like compliance incidents, data exposure, or audit findings.
      </p>
      <button
        @click="addBenefit"
        class="btn-secondary text-sm flex-shrink-0"
      >
        Add Risk Benefit
      </button>
    </div>

    <div v-if="localBenefits.length === 0" class="text-center py-8 text-gray-500">
      <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
      <p>No risk benefits added yet</p>
      <p class="text-xs mt-1">Click "Add Risk Benefit" to track risk reduction</p>
    </div>

    <div
      v-for="(benefit, index) in localBenefits"
      :key="index"
      class="border border-gray-200 rounded-lg p-4 space-y-4"
    >
      <div class="flex items-start justify-between">
        <h4 class="text-sm font-medium text-gray-900">Risk Benefit {{ index + 1 }}</h4>
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
            <option value="complianceIncidents">Compliance Incidents</option>
            <option value="dataExposureRisk">Data Exposure Risk</option>
            <option value="auditFindings">Audit Findings</option>
            <option value="probabilityOfHarm">Probability of Harm</option>
            <option value="securityVulnerabilities">Security Vulnerabilities</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div v-if="benefit.metricId === 'custom'">
          <label class="form-label">Custom Metric Label</label>
          <input
            :value="benefit.metricLabel"
            type="text"
            class="form-input"
            placeholder="e.g., Policy Violations"
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
            <option value="categorical">Categorical (Low/Medium/High)</option>
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
            :value="benefit.aggregationBasis || 'perMonth'"
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
            placeholder="e.g., incidents/month"
            @input="updateBenefit(index, { benefitUnit: ($event.target as HTMLInputElement).value })"
          />
        </div>
      </div>

      <!-- Baseline -->
      <div>
        <label class="form-label">Baseline Risk Level</label>
        <template v-if="getValueType(benefit.baseline) === 'categorical'">
          <select
            :value="getCategoricalValue(benefit.baseline)"
            class="form-input"
            @change="updateBenefit(index, { baseline: { type: 'categorical', category: ($event.target as HTMLSelectElement).value as any } })"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
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
        <label class="form-label">Expected Risk Level (After Automation)</label>
        <template v-if="getValueType(benefit.expected) === 'categorical'">
          <select
            :value="getCategoricalValue(benefit.expected)"
            class="form-input"
            @change="updateBenefit(index, { expected: { type: 'categorical', category: ($event.target as HTMLSelectElement).value as any } })"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
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
          placeholder="Key assumptions underlying the risk reduction estimate"
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
  isCategorical: boolean
}

const metricDefaults: Record<string, MetricDefaults> = {
  'complianceIncidents': { label: 'Compliance Incidents', unit: 'incidents/month', direction: 'decreaseIsBetter', valueMeaning: 'absolute', isCategorical: false },
  'dataExposureRisk': { label: 'Data Exposure Risk', unit: 'risk level', direction: 'decreaseIsBetter', valueMeaning: 'absolute', isCategorical: true },
  'auditFindings': { label: 'Audit Findings', unit: 'findings/audit', direction: 'decreaseIsBetter', valueMeaning: 'absolute', isCategorical: false },
  'probabilityOfHarm': { label: 'Probability of Harm', unit: '%', direction: 'decreaseIsBetter', valueMeaning: 'absolute', isCategorical: false },
  'securityVulnerabilities': { label: 'Security Vulnerabilities', unit: 'vulnerabilities', direction: 'decreaseIsBetter', valueMeaning: 'absolute', isCategorical: false },
  'custom': { label: '', unit: '', direction: 'decreaseIsBetter', valueMeaning: 'absolute', isCategorical: false }
}

function getMetricLabel(metricId: string): string {
  return metricDefaults[metricId]?.label || metricId
}

function getDefaultUnit(metricId: string): string {
  return metricDefaults[metricId]?.unit || 'incidents/month'
}

function getMetricDefaults(metricId: string): { direction: BenefitDirection; valueMeaning: ValueMeaning } {
  const defaults = metricDefaults[metricId] || metricDefaults['custom']
  return { direction: defaults.direction, valueMeaning: defaults.valueMeaning }
}

function isCategoricalMetric(metricId: string): boolean {
  return metricDefaults[metricId]?.isCategorical || false
}

function createDefaultBenefit(): Benefit {
  const defaults = getMetricDefaults('complianceIncidents')
  return {
    benefitType: 'risk',
    metricId: 'complianceIncidents',
    metricLabel: 'Compliance Incidents',
    direction: defaults.direction,
    valueMeaning: defaults.valueMeaning,
    aggregationBasis: 'perMonth',
    benefitUnit: 'incidents/month',
    baseline: { type: 'categorical', category: 'high' },
    expected: { type: 'categorical', category: 'low' }
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
  const useCategorical = isCategoricalMetric(metricId)
  const defaults = getMetricDefaults(metricId)
  const updates: Partial<Benefit> = {
    metricId,
    metricLabel: getMetricLabel(metricId),
    benefitUnit: getDefaultUnit(metricId),
    direction: defaults.direction,
    valueMeaning: defaults.valueMeaning
  }
  
  if (useCategorical) {
    updates.baseline = { type: 'categorical', category: 'high' }
    updates.expected = { type: 'categorical', category: 'low' }
  } else {
    updates.baseline = { type: 'numeric', value: 0 }
    updates.expected = { type: 'numeric', value: 0 }
  }
  
  updateBenefit(index, updates)
}

function handleValueTypeChange(index: number, valueType: string) {
  const updates: Partial<Benefit> = {}
  
  if (valueType === 'categorical') {
    updates.baseline = { type: 'categorical', category: 'high' }
    updates.expected = { type: 'categorical', category: 'low' }
  } else {
    updates.baseline = { type: 'numeric', value: 0 }
    updates.expected = { type: 'numeric', value: 0 }
  }
  
  updateBenefit(index, updates)
}

function getValueType(value: BenefitValue): string {
  return value.type === 'categorical' ? 'categorical' : 'numeric'
}

function getNumericValue(value: BenefitValue): number {
  if (value.type === 'numeric') return value.value
  return 0
}

function getCategoricalValue(value: BenefitValue): string {
  if (value.type === 'categorical') return value.category
  return 'medium'
}

function emitUpdate() {
  emit('update', localBenefits.value)
}
</script>
