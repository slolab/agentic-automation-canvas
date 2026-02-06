<template>
  <div class="relative inline-flex items-center">
    <button
      type="button"
      :id="`tooltip-trigger-${uniqueId}`"
      ref="triggerRef"
      class="inline-flex items-center justify-center w-4 h-4 rounded-full text-primary-500 hover:text-primary-700 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 transition-colors"
      :aria-describedby="`tooltip-${uniqueId}`"
      @mouseenter="showTooltip"
      @mouseleave="hideTooltip"
      @focus="showTooltip"
      @blur="hideTooltip"
      @click="toggleTooltip"
    >
      <svg
        class="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span class="sr-only">More information</span>
    </button>

    <!-- Tooltip - Teleported to body to escape overflow containers -->
    <Teleport to="body">
      <Transition name="tooltip">
        <div
          v-if="isVisible"
          :id="`tooltip-${uniqueId}`"
          ref="tooltipRef"
          class="fixed z-[9999] px-4 py-3 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg shadow-lg"
          :style="tooltipStyle"
          role="tooltip"
          @mouseenter="showTooltip"
          @mouseleave="hideTooltip"
        >
          <div class="font-semibold text-gray-900 mb-2 text-sm" v-if="title">{{ title }}</div>
          <div class="leading-relaxed font-normal" v-html="content"></div>
          <!-- Arrow -->
          <div
            class="absolute w-2 h-2 bg-white border-r border-b border-gray-200 transform rotate-45"
            :style="arrowStyle"
          ></div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'

const savedScrollPosition = ref(0)

interface Props {
  content: string
  title?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  position: 'top',
})

const uniqueId = `tooltip-${Math.random().toString(36).substr(2, 9)}`
const isVisible = ref(false)
const tooltipRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLElement | null>(null)
const actualPosition = ref<'top' | 'bottom' | 'left' | 'right'>('top')
const tooltipStyle = ref<{ left?: string; top?: string; minWidth: string; maxWidth: string }>({
  minWidth: '280px',
  maxWidth: '400px',
})
const arrowStyle = ref<{ left?: string; top?: string; right?: string; bottom?: string }>({})
const isMobile = ref(false)
let hideTimeout: ReturnType<typeof setTimeout> | null = null

// Check if mobile device
const checkMobile = () => {
  isMobile.value = window.innerWidth < 640 || 'ontouchstart' in window
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  // Clear any pending timeout
  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }
  // Ensure body scroll is restored when component is unmounted
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.width = ''
  document.body.style.overflow = ''
  if (savedScrollPosition.value > 0) {
    window.scrollTo(0, savedScrollPosition.value)
  }
})

// Smart positioning: choose best position based on available space
const calculateBestPosition = async () => {
  await nextTick()
  if (!tooltipRef.value || !triggerRef.value) return
  
  const triggerRect = triggerRef.value.getBoundingClientRect()
  const tooltipRect = tooltipRef.value.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  
  // Use actual tooltip dimensions if available, otherwise estimate
  const tooltipWidth = tooltipRect.width || 350
  const tooltipHeight = tooltipRect.height || 200
  const spacing = 8 // mb-2 = 8px
  
  // Calculate available space in each direction
  const spaceTop = triggerRect.top
  const spaceBottom = viewportHeight - triggerRect.bottom
  const spaceLeft = triggerRect.left
  const spaceRight = viewportWidth - triggerRect.right
  
  // Check if preferred position has enough space
  let bestPosition = props.position
  
  if (props.position === 'top' && spaceTop < tooltipHeight + spacing) {
    // Not enough space at top, try other directions
    if (spaceBottom >= tooltipHeight + spacing) {
      bestPosition = 'bottom'
    } else if (spaceRight >= tooltipWidth + spacing) {
      bestPosition = 'right'
    } else if (spaceLeft >= tooltipWidth + spacing) {
      bestPosition = 'left'
    } else {
      // Fallback: use bottom even if tight, better than going off-screen
      bestPosition = 'bottom'
    }
  } else if (props.position === 'bottom' && spaceBottom < tooltipHeight + spacing) {
    if (spaceTop >= tooltipHeight + spacing) {
      bestPosition = 'top'
    } else if (spaceRight >= tooltipWidth + spacing) {
      bestPosition = 'right'
    } else if (spaceLeft >= tooltipWidth + spacing) {
      bestPosition = 'left'
    } else {
      bestPosition = 'top'
    }
  } else if (props.position === 'left' && spaceLeft < tooltipWidth + spacing) {
    if (spaceRight >= tooltipWidth + spacing) {
      bestPosition = 'right'
    } else if (spaceBottom >= tooltipHeight + spacing) {
      bestPosition = 'bottom'
    } else if (spaceTop >= tooltipHeight + spacing) {
      bestPosition = 'top'
    } else {
      bestPosition = 'right'
    }
  } else if (props.position === 'right' && spaceRight < tooltipWidth + spacing) {
    if (spaceLeft >= tooltipWidth + spacing) {
      bestPosition = 'left'
    } else if (spaceBottom >= tooltipHeight + spacing) {
      bestPosition = 'bottom'
    } else if (spaceTop >= tooltipHeight + spacing) {
      bestPosition = 'top'
    } else {
      bestPosition = 'left'
    }
  }
  
  actualPosition.value = bestPosition
  
  let left = 0
  let top = 0
  let arrowLeft = ''
  let arrowTop = ''
  let arrowRight = ''
  let arrowBottom = ''
  
  switch (bestPosition) {
    case 'top':
      left = triggerRect.left
      top = triggerRect.top - tooltipHeight - spacing
      arrowLeft = '16px'
      arrowBottom = '-4px'
      break
    case 'bottom':
      left = triggerRect.left
      top = triggerRect.bottom + spacing
      arrowLeft = '16px'
      arrowTop = '-4px'
      break
    case 'left':
      left = triggerRect.left - tooltipWidth - spacing
      top = triggerRect.top
      arrowRight = '-4px'
      arrowTop = '16px'
      break
    case 'right':
      left = triggerRect.right + spacing
      top = triggerRect.top
      arrowLeft = '-4px'
      arrowTop = '16px'
      break
  }
  
  // Ensure tooltip stays within viewport bounds
  const padding = 8
  if (left < padding) left = padding
  if (left + tooltipWidth > viewportWidth - padding) {
    left = viewportWidth - tooltipWidth - padding
  }
  if (top < padding) top = padding
  if (top + tooltipHeight > viewportHeight - padding) {
    top = viewportHeight - tooltipHeight - padding
  }
  
  tooltipStyle.value = {
    left: `${left}px`,
    top: `${top}px`,
    minWidth: '280px',
    maxWidth: '400px',
  }
  
  arrowStyle.value = {
    left: arrowLeft || undefined,
    top: arrowTop || undefined,
    right: arrowRight || undefined,
    bottom: arrowBottom || undefined,
  }
}

// Watch for visibility changes to recalculate position and lock scroll on mobile
watch(isVisible, (newVal) => {
  if (newVal) {
    calculateBestPosition()
    // On mobile, lock background scrolling when tooltip is visible
    if (isMobile.value) {
      savedScrollPosition.value = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${savedScrollPosition.value}px`
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'
    }
  } else {
    // Restore background scrolling on mobile
    if (isMobile.value) {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
      window.scrollTo(0, savedScrollPosition.value)
    }
  }
})


const showTooltip = () => {
  if (!isMobile.value) {
    // Clear any pending hide timeout
    if (hideTimeout) {
      clearTimeout(hideTimeout)
      hideTimeout = null
    }
    // Reset to preferred position first
    actualPosition.value = props.position
    isVisible.value = true
  }
}

const hideTooltip = () => {
  if (!isMobile.value) {
    // Add a small delay before hiding to allow mouse movement to tooltip
    hideTimeout = setTimeout(() => {
      isVisible.value = false
      hideTimeout = null
    }, 100) // 100ms delay to allow mouse to move to tooltip
  }
}

const toggleTooltip = () => {
  if (isMobile.value) {
    isVisible.value = !isVisible.value
  }
}

// Close tooltip when clicking outside (mobile)
const handleClickOutside = (event: MouseEvent) => {
  if (isMobile.value && isVisible.value && tooltipRef.value && !tooltipRef.value.contains(event.target as Node)) {
    const trigger = document.getElementById(`tooltip-trigger-${uniqueId}`)
    if (trigger && !trigger.contains(event.target as Node)) {
      isVisible.value = false
    }
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<style scoped>
.tooltip-enter-active,
.tooltip-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.tooltip-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.tooltip-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
