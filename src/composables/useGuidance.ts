import { readonly, ref } from 'vue'

export type GuidanceTopic =
  | 'aac'
  | 'problem'
  | 'change-value'
  | 'solutions'
  | 'development-reality'
  | 'first-milestone'

const isOpen = ref(false)
const activeTopic = ref<GuidanceTopic>('aac')
let returnFocusTo: HTMLElement | null = null

export function useGuidance() {
  function openGuidance(topic: GuidanceTopic, trigger?: HTMLElement | null) {
    activeTopic.value = topic
    returnFocusTo = trigger ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null)
    isOpen.value = true
  }

  function closeGuidance() {
    isOpen.value = false
    const target = returnFocusTo
    returnFocusTo = null
    window.setTimeout(() => target?.focus(), 0)
  }

  return {
    isOpen: readonly(isOpen),
    activeTopic: readonly(activeTopic),
    openGuidance,
    closeGuidance,
  }
}
