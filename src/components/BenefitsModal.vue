<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 overflow-y-auto"
      @click.self="close"
    >
      <!-- Backdrop -->
      <div 
        class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
        @click="close"
        @scroll.prevent
        @wheel.prevent.stop
        @touchmove.prevent.stop
      />
      
      <!-- Modal -->
      <div class="flex min-h-full items-center justify-center p-4">
        <div
          class="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
          @click.stop
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900 flex-1 mr-4">Edit Benefits</h2>
            <button
              @click="close"
              class="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded p-1 flex-shrink-0"
              aria-label="Close modal"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Tabs -->
          <div class="border-b border-gray-200 px-6">
            <nav class="flex gap-4" aria-label="Benefit types">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="activeTab = tab.id"
                class="py-3 px-1 border-b-2 font-medium text-sm transition-colors"
                :class="{
                  'border-primary-500 text-primary-600': activeTab === tab.id,
                  'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': activeTab !== tab.id
                }"
              >
                <div class="flex items-center gap-2">
                  <component :is="tab.icon" class="w-4 h-4" />
                  <span>{{ tab.label }}</span>
                  <span
                    v-if="getBenefitCount(tab.id) > 0"
                    class="px-1.5 py-0.5 text-xs rounded-full bg-primary-100 text-primary-700"
                  >
                    {{ getBenefitCount(tab.id) }}
                  </span>
                </div>
              </button>
            </nav>
          </div>

          <!-- Content -->
          <div class="px-6 py-4 overflow-y-auto max-h-[60vh]">
            <!-- Time Benefits -->
            <div v-show="activeTab === 'time'">
              <TimeBenefitForm
                :benefits="getTypedBenefits('time')"
                @update="updateTypedBenefits('time', $event)"
              />
            </div>

            <!-- Quality Benefits -->
            <div v-show="activeTab === 'quality'">
              <QualityBenefitForm
                :benefits="getTypedBenefits('quality')"
                @update="updateTypedBenefits('quality', $event)"
              />
            </div>

            <!-- Risk Benefits -->
            <div v-show="activeTab === 'risk'">
              <RiskBenefitForm
                :benefits="getTypedBenefits('risk')"
                @update="updateTypedBenefits('risk', $event)"
              />
            </div>

            <!-- Enablement Benefits -->
            <div v-show="activeTab === 'enablement'">
              <EnablementBenefitForm
                :benefits="getTypedBenefits('enablement')"
                @update="updateTypedBenefits('enablement', $event)"
              />
            </div>

            <!-- Cost Benefits -->
            <div v-show="activeTab === 'cost'">
              <CostBenefitForm
                :benefits="getTypedBenefits('cost')"
                @update="updateTypedBenefits('cost', $event)"
              />
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              @click="close"
              class="btn-secondary"
            >
              Cancel
            </button>
            <button
              @click="save"
              class="btn-primary"
            >
              Save Benefits
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, h, onUnmounted } from 'vue'
import type { Benefit } from '@/types/canvas'
import TimeBenefitForm from './benefits/TimeBenefitForm.vue'
import QualityBenefitForm from './benefits/QualityBenefitForm.vue'
import RiskBenefitForm from './benefits/RiskBenefitForm.vue'
import EnablementBenefitForm from './benefits/EnablementBenefitForm.vue'
import CostBenefitForm from './benefits/CostBenefitForm.vue'

interface Props {
  isOpen: boolean
  benefits: Benefit[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  'save': [benefits: Benefit[]]
}>()

// Local copy of benefits for editing
const localBenefits = ref<Benefit[]>([])

// Active tab
const activeTab = ref<'time' | 'quality' | 'risk' | 'enablement' | 'cost'>('time')

// Store scroll position when modal opens
const savedScrollPosition = ref(0)

// Tab configuration with inline SVG icons
const ClockIcon = {
  render: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' })
  ])
}

const CheckCircleIcon = {
  render: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' })
  ])
}

const ShieldIcon = {
  render: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' })
  ])
}

const LightningIcon = {
  render: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M13 10V3L4 14h7v7l9-11h-7z' })
  ])
}

const CurrencyIcon = {
  render: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' })
  ])
}

const tabs = [
  { id: 'time' as const, label: 'Time', icon: ClockIcon },
  { id: 'quality' as const, label: 'Quality', icon: CheckCircleIcon },
  { id: 'risk' as const, label: 'Risk', icon: ShieldIcon },
  { id: 'enablement' as const, label: 'Enablement', icon: LightningIcon },
  { id: 'cost' as const, label: 'Cost', icon: CurrencyIcon },
]

// Watch for modal open to initialize local state and lock body scroll
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    localBenefits.value = props.benefits.map(b => ({ ...b }))
    // Set active tab to first type with benefits, or 'time' by default
    const firstType = props.benefits[0]?.benefitType
    activeTab.value = firstType || 'time'
    // Prevent background scrolling - save current scroll position and lock
    savedScrollPosition.value = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${savedScrollPosition.value}px`
    document.body.style.width = '100%'
    document.body.style.overflow = 'hidden'
  } else {
    // Restore background scrolling and scroll position
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.width = ''
    document.body.style.overflow = ''
    window.scrollTo(0, savedScrollPosition.value)
  }
})

// Ensure body scroll is restored when component is unmounted
onUnmounted(() => {
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.width = ''
  document.body.style.overflow = ''
  if (savedScrollPosition.value > 0) {
    window.scrollTo(0, savedScrollPosition.value)
  }
})

// Get benefits of a specific type
function getTypedBenefits(type: 'time' | 'quality' | 'risk' | 'enablement' | 'cost'): Benefit[] {
  return localBenefits.value.filter(b => b.benefitType === type)
}

// Get count of benefits for a type
function getBenefitCount(type: 'time' | 'quality' | 'risk' | 'enablement' | 'cost'): number {
  return localBenefits.value.filter(b => b.benefitType === type).length
}

// Update benefits of a specific type
function updateTypedBenefits(type: 'time' | 'quality' | 'risk' | 'enablement' | 'cost', benefits: Benefit[]) {
  // Remove all benefits of this type and add the new ones
  const otherBenefits = localBenefits.value.filter(b => b.benefitType !== type)
  localBenefits.value = [...otherBenefits, ...benefits]
}

// Close modal
function close() {
  emit('update:isOpen', false)
}

// Save and close
function save() {
  emit('save', localBenefits.value)
  close()
}
</script>
