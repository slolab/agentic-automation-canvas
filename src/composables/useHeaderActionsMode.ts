import { ref, watch, onMounted, onUnmounted, type Ref } from 'vue'

export type HeaderActionsMode = 'full' | 'short' | 'icon'

const WIDTH_FULL = 560
const WIDTH_SHORT = 340

export type UseHeaderActionsModeOptions = {
  /** Min width (px) for full labels. Default 560. Use lower for footer (observed column is ~half row). */
  widthFull?: number
  /** Min width (px) for short labels. Default 340. */
  widthShort?: number
}

/**
 * Observes a container element (must have flex-1 so its width = available space) and returns a mode:
 * - full: show full button labels (container >= widthFull)
 * - short: show shortened labels (widthShort <= container < widthFull)
 * - icon: show only icons (container < widthShort)
 */
export function useHeaderActionsMode(
  containerRef: Ref<HTMLElement | null>,
  options: UseHeaderActionsModeOptions = {}
): Ref<HeaderActionsMode> {
  const widthFull = options.widthFull ?? WIDTH_FULL
  const widthShort = options.widthShort ?? WIDTH_SHORT
  const mode = ref<HeaderActionsMode>('full')

  const updateMode = (width: number) => {
    if (width >= widthFull) {
      mode.value = 'full'
    } else if (width >= widthShort) {
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
