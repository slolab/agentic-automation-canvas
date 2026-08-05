<template>
  <span class="v2-info-control">
    <button
      ref="trigger"
      class="v2-info-button"
      type="button"
      :aria-label="label"
      :aria-describedby="tooltipId"
      @mouseenter="showTooltip"
      @mouseleave="hideTooltip"
      @focus="showTooltip"
      @blur="hideTooltip"
      @click="openPanel"
    >
      <span aria-hidden="true">i</span>
    </button>

    <Teleport to="body">
      <Transition name="v2-info-tooltip">
        <span
          v-if="tooltipVisible"
          :id="tooltipId"
          ref="tooltipElement"
          class="v2-info-tooltip"
          role="tooltip"
          :style="tooltipStyle"
        >
          {{ tooltip }}
        </span>
      </Transition>
    </Teleport>
  </span>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps<{
  label: string
  tooltip: string
}>()

const emit = defineEmits<{
  open: [trigger: HTMLButtonElement]
}>()

const tooltipId = `v2-info-tooltip-${props.label
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '')}`
const trigger = ref<HTMLButtonElement | null>(null)
const tooltipElement = ref<HTMLElement | null>(null)
const tooltipVisible = ref(false)
const tooltipStyle = ref<Record<string, string>>({})

async function showTooltip(): Promise<void> {
  tooltipVisible.value = true
  await nextTick()
  positionTooltip()
}

function hideTooltip(): void {
  tooltipVisible.value = false
}

function positionTooltip(): void {
  if (!trigger.value || !tooltipElement.value) return

  const triggerRect = trigger.value.getBoundingClientRect()
  const tooltipRect = tooltipElement.value.getBoundingClientRect()
  const edge = 12
  const gap = 8
  const idealLeft = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2
  const left = Math.min(
    window.innerWidth - tooltipRect.width - edge,
    Math.max(edge, idealLeft),
  )
  const roomBelow = window.innerHeight - triggerRect.bottom
  const top =
    roomBelow >= tooltipRect.height + gap + edge
      ? triggerRect.bottom + gap
      : triggerRect.top - tooltipRect.height - gap

  tooltipStyle.value = {
    left: `${left}px`,
    top: `${Math.max(edge, top)}px`,
  }
}

function openPanel(): void {
  hideTooltip()
  if (trigger.value) emit('open', trigger.value)
}

onMounted(() => {
  window.addEventListener('resize', hideTooltip)
  window.addEventListener('scroll', hideTooltip, true)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', hideTooltip)
  window.removeEventListener('scroll', hideTooltip, true)
})
</script>

<style scoped>
.v2-info-control {
  display: inline-flex;
}

.v2-info-button {
  display: grid;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  place-items: center;
  padding: 0;
  border: 1px solid #98a39e;
  border-radius: 50%;
  cursor: pointer;
  color: #44534e;
  background: transparent;
  font-family: Georgia, serif;
  font-size: 13px;
  font-style: italic;
  font-weight: 700;
  line-height: 1;
  transition:
    border-color 120ms ease,
    color 120ms ease,
    background 120ms ease;
}

.v2-info-button:hover,
.v2-info-button:focus-visible {
  border-color: #146c5b;
  outline: none;
  color: #0d5a4b;
  background: #e8f4f0;
}

.v2-info-button:focus-visible {
  box-shadow: 0 0 0 3px rgba(20, 108, 91, 0.18);
}

.v2-info-tooltip {
  position: fixed;
  z-index: 60;
  width: max-content;
  max-width: min(280px, calc(100vw - 24px));
  box-sizing: border-box;
  padding: 8px 10px;
  border: 1px solid #43514c;
  border-radius: 6px;
  box-shadow: 0 6px 18px rgba(23, 32, 30, 0.18);
  color: #fffefa;
  background: #26332f;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
  font-size: 11px;
  font-style: normal;
  font-weight: 550;
  line-height: 1.35;
  pointer-events: none;
}

.v2-info-tooltip-enter-active,
.v2-info-tooltip-leave-active {
  transition:
    opacity 90ms ease,
    transform 90ms ease;
}

.v2-info-tooltip-enter-from,
.v2-info-tooltip-leave-to {
  opacity: 0;
  transform: translateY(-2px);
}
</style>
