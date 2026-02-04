import { ref, watch, onMounted, onUnmounted, type Ref } from 'vue'

export type HeaderActionsMode = 'full' | 'short' | 'icon'

const WIDTH_FULL = 560
const WIDTH_SHORT = 340

/**
 * Observes a container element (must have flex-1 so its width = available space) and returns a mode:
 * - full: show full button labels (container >= 560px) — high enough to avoid RO-Crate button wrapping
 * - short: show shortened labels (340px <= container < 560px)
 * - icon: show only icons (container < 340px) — before short labels can wrap to two/three lines
 */
export function useHeaderActionsMode(containerRef: Ref<HTMLElement | null>): Ref<HeaderActionsMode> {
  const mode = ref<HeaderActionsMode>('full')

  const updateMode = (width: number) => {
    if (width >= WIDTH_FULL) {
      mode.value = 'full'
    } else if (width >= WIDTH_SHORT) {
      mode.value = 'short'
    } else {
      mode.value = 'icon'
    }
  }

  let observer: ResizeObserver | null = null
  let observedEl: HTMLElement | null = null

  const observe = () => {
    const el = containerRef.value
    if (!el || typeof window === 'undefined') return
    if (observedEl === el) return
    disconnect()
    observedEl = el
    updateMode(el.getBoundingClientRect().width)
    observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      updateMode(entry.contentRect.width)
    })
    observer.observe(el)
  }

  const disconnect = () => {
    if (observer && observedEl) {
      observer.unobserve(observedEl)
      observer.disconnect()
      observer = null
      observedEl = null
    }
  }

  watch(containerRef, (el) => {
    disconnect()
    if (el) observe()
  })

  onMounted(() => {
    if (containerRef.value) observe()
  })

  onUnmounted(disconnect)

  return mode
}
