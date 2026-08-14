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
          <p v-if="guidance.followup" class="mt-4 text-sm leading-6 text-gray-700">
            {{ guidance.followup }}
          </p>
          <h3 v-if="guidance.pointsHeading" class="mt-6 font-semibold text-gray-950">
            {{ guidance.pointsHeading }}
          </h3>
          <ul class="mt-5 space-y-3">
            <li v-for="point in guidance.points" :key="point" class="flex items-start gap-3 text-sm leading-6 text-gray-700">
              <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-600" aria-hidden="true" />
              <span>{{ point }}</span>
            </li>
          </ul>
          <template v-if="guidance.terms?.length">
            <h3 class="mt-8 font-semibold text-gray-950">
              {{ guidance.termsHeading ?? 'Key terms' }}
            </h3>
            <dl class="mt-4 space-y-4">
              <div v-for="term in guidance.terms" :key="term.label">
                <dt class="text-sm font-semibold text-gray-950">{{ term.label }}</dt>
                <dd class="mt-1 text-sm leading-6 text-gray-700">{{ term.explanation }}</dd>
              </div>
            </dl>
          </template>
          <div v-if="activeTopic === 'aac'" class="mt-8 border-t border-gray-200 pt-5 text-sm text-gray-600">
            <h3 class="font-semibold text-gray-950">Learn more</h3>
            <p class="mt-2">
              <a :href="`${baseUrl}docs/`" target="_blank" rel="noopener noreferrer" class="text-primary-700 underline hover:text-primary-900">Documentation</a>
              ·
              <a href="https://slolab.github.io/aac-manuscript/" target="_blank" rel="noopener noreferrer" class="text-primary-700 underline hover:text-primary-900">Manuscript</a>
              ·
              <a href="https://arxiv.org/abs/2602.15090" target="_blank" rel="noopener noreferrer" class="text-primary-700 underline hover:text-primary-900">arXiv</a>
            </p>
            <p class="mt-4 text-xs text-gray-500">Application version {{ appVersion }}</p>
          </div>
        </div>
      </aside>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useGuidance, type GuidanceTopic } from '@/composables/useGuidance'
import { approachOptions } from '@/schema/simplifiedCanvasOptions'

interface GuidanceTerm {
  label: string
  explanation: string
}

interface GuidanceContent {
  title: string
  intro: string
  followup?: string
  pointsHeading?: string
  points: string[]
  termsHeading?: string
  terms?: GuidanceTerm[]
}

type ApproachValue = (typeof approachOptions)[number]['value']

const approachExplanations: Record<ApproachValue, string> = {
  'agentic-user-support':
    'Support chatbot that answers user questions and looks up information. Good when there is a large volume of simple but diverse incoming requests.',
  'code-development':
    'AI that writes, reviews, or debugs code. Good when developers spend a lot of time on repetitive coding or troubleshooting.',
  'computer-use':
    'AI that clicks and types in software like a person. Good when you must use tools with no usable API—for example legacy hospital software.',
  'live-event-monitoring':
    'AI that watches ongoing events and alerts or acts when something matters. Typically used for experiment monitoring or cybersecurity.',
  'intelligent-search':
    'AI that finds and summarises relevant information across sources. Good when people dig through many documents or systems to answer one question.',
  'agentic-research-support':
    'AI that helps gather, track, and synthesise evidence for a research question. Good when literature review or evidence collection is slow and repetitive.',
  'data-metadata-curation':
    'AI that cleans, organises, or describes datasets. Good when data is messy, inconsistently labelled, or hard to reuse.',
  'analysis-pipeline-orchestration':
    'AI that runs and steers multi-step analysis workflows. Good when pipelines need many decisions, retries, or hand-offs between tools.',
  'experiment-protocol-design':
    'AI that proposes or refines experimental designs and protocols. Good when planning takes a lot of expert time. But AI is often weak and narrow-minded in niche domains.',
  'laboratory-workflow-coordination':
    'AI that sequences lab steps and coordinates samples, instruments, or people. Good when lab work has many interdependent hand-offs.',
  'unstructured-content-processing':
    'AI that extracts useful information from documents, emails, logs, or notes. Good when important facts are locked in free-form text.',
  other:
    'A pattern not listed above. Select Other and name it in the custom approaches field.',
}

const approachGuidanceTerms: GuidanceTerm[] = approachOptions.map((option) => ({
  label: option.label,
  explanation: approachExplanations[option.value],
}))

const guidanceByTopic: Record<GuidanceTopic, GuidanceContent> = {
  aac: {
    title: 'About Agentic Automation Canvas',
    intro: 'The Agentic Automation Canvas helps teams design, govern, and document automation that uses AI to replace or augment human judgment. It connects user expectations and measurable benefits with the developer assessment of whether those benefits can be delivered responsibly.',
    followup: 'AAC is primarily a communication tool and living project document. Users and developers should complete it together so disagreements, risks, and unjustified automation ideas surface before significant resources are committed.',
    pointsHeading: 'Why use it?',
    points: [
      'Guide decisions prospectively, while the project can still change, instead of documenting choices only after development.',
      'Capture expected value, feasibility, governance, data access, milestones, and evaluation in one structured checklist.',
      'Start with the Simplified view, then use Advanced when the project needs richer technical or governance detail. Both edit the same canvas.',
      'Export a machine-readable RO-Crate with a human preview and AGENTS.md instructions. Even an incomplete canvas can be exported as an explicitly marked partial draft.',
      'Keep work private by default: the application runs in the browser and does not send canvas data to a server.',
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
      'Select one or more patterns below that fit the work; skip ones that do not apply.',
      'Research available tools and comparable solutions before deciding to build.',
    ],
    termsHeading: 'What each potential approach means',
    terms: approachGuidanceTerms,
  },
  'development-reality': {
    title: 'Development Reality',
    intro: 'Surface the conditions that can make a promising idea difficult to build, operate, or sustain.',
    points: [
      'Flag data volume, compute, privacy, security, integration, latency, regulation, and procurement constraints that need investigation.',
      'Check whether a team can build the work and whether somebody can maintain it.',
      'Use the Advanced view to record detailed ownership, stage agents, and governance evidence when they are known.',
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
const baseUrl = import.meta.env.BASE_URL || '/'

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
