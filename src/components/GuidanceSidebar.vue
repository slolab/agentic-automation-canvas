<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[70]"
      @keydown="handleKeydown"
    >
      <div class="absolute inset-0 bg-gray-950/30" aria-hidden="true" @click="closeGuidance" />
      <aside
        ref="panel"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="`${activeTopic}-guidance-title`"
        class="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-gray-200 bg-white shadow-2xl"
      >
        <header class="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5">
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.14em] text-primary-700">Canvas guidance</p>
            <h2 :id="`${activeTopic}-guidance-title`" class="mt-1 text-xl font-bold text-gray-950">
              {{ guidance.title }}
            </h2>
          </div>
          <button
            ref="closeButton"
            type="button"
            class="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-600"
            aria-label="Close guidance"
            @click="closeGuidance"
          >
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M4.293 4.293a1 1 0 0 1 1.414 0L10 8.586l4.293-4.293a1 1 0 1 1 1.414 1.414L11.414 10l4.293 4.293a1 1 0 0 1-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 0 1-1.414-1.414L8.586 10 4.293 5.707a1 1 0 0 1 0-1.414Z" />
            </svg>
          </button>
        </header>

        <div class="flex-1 overflow-y-auto px-6 py-6">
          <p class="text-base leading-7 text-gray-700">{{ guidance.intro }}</p>
          <ul class="mt-5 space-y-3">
            <li v-for="point in guidance.points" :key="point" class="flex items-start gap-3 text-sm leading-6 text-gray-700">
              <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-600" aria-hidden="true" />
              <span>{{ point }}</span>
            </li>
          </ul>
          <p v-if="activeTopic === 'aac'" class="mt-8 border-t border-gray-200 pt-4 text-xs text-gray-500">
            Application version {{ appVersion }}
          </p>
        </div>
      </aside>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useGuidance, type GuidanceTopic } from '@/composables/useGuidance'

interface GuidanceContent {
  title: string
  intro: string
  points: string[]
}

const guidanceByTopic: Record<GuidanceTopic, GuidanceContent> = {
  aac: {
    title: 'Agentic Automation Canvas',
    intro: 'AAC helps a team turn a real operational need into a shared, reviewable project artifact before committing to a technical solution.',
    points: [
      'Start in the simplified canvas and work from the problem toward one bounded first milestone.',
      'Use the detailed canvas when the project needs richer feasibility, governance, data-access, or evaluation information.',
      'Both views edit the same canonical canvas, so you can move between them without copying or losing data.',
      'Export an RO-Crate when you want to review, share, or continue the project elsewhere.',
    ],
  },
  problem: {
    title: 'Problem',
    intro: 'Ground the project in a need that people actually experience, not in a preferred technology.',
    points: [
      'Name the friction and its consequences in plain language.',
      'Identify who experiences it and roughly how often.',
      'Use the most recent real case to keep the discussion concrete and testable.',
    ],
  },
  'change-value': {
    title: 'Change and Value',
    intro: 'Describe what should become different and the evidence that would make the change worth pursuing.',
    points: [
      'State the desired outcome without prescribing the implementation.',
      'Explain why the need deserves attention now.',
      'Separate expected benefits into short items and name observable success measures.',
    ],
  },
  solutions: {
    title: 'Solutions',
    intro: 'Identify where agentic behaviour may help without committing to a technical architecture.',
    points: [
      'Record prior attempts, workarounds, pilots, and what they taught you.',
      'Select the agentic work patterns that match the real need, including scientific research and laboratory workflows.',
      'Research available tools and comparable solutions before deciding to build.',
    ],
  },
  'development-reality': {
    title: 'Development Reality',
    intro: 'Surface the conditions that can make a promising idea difficult to build, operate, or sustain.',
    points: [
      'Flag data volume, compute, privacy, security, integration, latency, regulation, and procurement constraints that need investigation.',
      'Check whether a team can build the work and whether somebody can maintain it.',
      'Name the people and organization that can own the next stage when they are known.',
    ],
  },
  'first-milestone': {
    title: 'First Milestone',
    intro: 'Bound the first piece of work tightly enough that the team can learn and decide what to do next.',
    points: [
      'Describe one concrete result, not the entire future product.',
      'State observable completion evidence that another person could verify.',
      'Prefer a milestone that tests the riskiest assumption with limited time and scope.',
    ],
  },
}

const { isOpen, activeTopic, closeGuidance } = useGuidance()
const guidance = computed(() => guidanceByTopic[activeTopic.value])
const panel = ref<HTMLElement | null>(null)
const closeButton = ref<HTMLButtonElement | null>(null)
const appVersion = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '—'

watch(isOpen, async (open) => {
  if (!open) return
  await nextTick()
  closeButton.value?.focus()
})

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    closeGuidance()
    return
  }
  if (event.key !== 'Tab' || !panel.value) return

  const focusable = [...panel.value.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )]
  if (focusable.length === 0) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}
</script>
