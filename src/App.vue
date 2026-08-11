<template>
  <div
    id="app"
    class="flex min-h-screen flex-col overflow-x-clip bg-white"
    @dragenter.prevent="onDragEnter"
    @dragover.prevent
    @dragleave="onDragLeave"
    @drop.prevent="onDrop"
  >
    <header class="sticky top-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur">
      <div class="mx-auto flex min-h-14 max-w-[1800px] items-center gap-4 px-4 py-2 sm:px-6 lg:px-8">
        <div class="flex min-w-0 items-center gap-2.5">
          <img :src="`${baseUrl}logo.svg`" alt="" class="h-9 w-9 shrink-0" />
          <div class="min-w-0">
            <div class="flex items-center gap-1.5">
              <h1 class="truncate text-lg font-bold leading-tight text-gray-950 sm:text-xl">Agentic Automation Canvas</h1>
              <button
                type="button"
                class="shrink-0 rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-600"
                aria-label="Open general information about Agentic Automation Canvas"
                @click="openGeneralGuidance"
              >
                <InfoIcon />
              </button>
            </div>
            <p class="mt-0.5 truncate text-xs text-gray-500">
              <a
                href="https://github.com/slolab/agentic-automation-canvas"
                target="_blank"
                rel="noopener noreferrer"
                class="font-medium text-primary-700 underline hover:text-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-600"
              >View on GitHub</a>,
              Read the paper:
              <a
                href="https://slolab.github.io/aac-manuscript/"
                target="_blank"
                rel="noopener noreferrer"
                class="italic text-primary-700 underline hover:text-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-600"
              >online</a>
              /
              <a
                href="https://arxiv.org/abs/2602.15090"
                target="_blank"
                rel="noopener noreferrer"
                class="italic text-primary-700 underline hover:text-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-600"
              >arXiv</a>
            </p>
          </div>
        </div>

        <div ref="headerActionsRef" class="ml-auto flex min-w-0 flex-1 items-center justify-end gap-1.5 sm:gap-2">
          <button
            type="button"
            role="switch"
            :aria-checked="canvasView === 'detailed'"
            class="inline-flex shrink-0 items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-600"
            :aria-label="canvasView === 'simplified' && hasDetailedContent
              ? 'Detailed Canvas. Additional detailed content is present.'
              : 'Detailed Canvas'"
            @click="toggleCanvasView"
          >
            <span>Detailed Canvas</span>
            <span
              v-if="canvasView === 'simplified' && hasDetailedContent"
              class="h-2 w-2 rounded-full bg-indigo-600 ring-2 ring-indigo-100"
              title="Additional detailed content is present"
              aria-hidden="true"
            />
            <span v-if="canvasView === 'simplified' && hasDetailedContent" class="sr-only">
              Additional detailed content is present
            </span>
            <span
              :class="[
                'relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors',
                canvasView === 'detailed' ? 'bg-primary-600' : 'bg-gray-300',
              ]"
              aria-hidden="true"
            >
              <span
                :class="[
                  'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
                  canvasView === 'detailed' ? 'translate-x-[1.125rem]' : 'translate-x-0.5',
                ]"
              />
            </span>
          </button>
          <template v-if="!hasMeaningfulContent">
            <button
              type="button"
              :class="['header-action', showLoadExampleHint && 'load-example-hint-pulse']"
              aria-label="Show an example canvas"
              @click="loadExample"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.59a1 1 0 0 1 .7.29l5.42 5.42a1 1 0 0 1 .29.7V19a2 2 0 0 1-2 2Z" />
              </svg>
              <span v-show="headerActionsMode !== 'icon'" class="whitespace-nowrap">Show Example</span>
            </button>
            <ImportButton :header-actions-mode="headerActionsMode" />
          </template>
          <template v-else>
            <button
              type="button"
              class="header-action"
              aria-label="Clear all canvas data"
              @click="clearData"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.87 12.14A2 2 0 0 1 16.14 21H7.86a2 2 0 0 1-1.99-1.86L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16" />
              </svg>
              <span v-show="headerActionsMode !== 'icon'">Clear Canvas</span>
            </button>
            <button
              type="button"
              :class="[
                'btn-primary flex shrink-0 items-center gap-2',
                !canDownload && 'cursor-not-allowed opacity-45',
              ]"
              aria-label="Download RO-Crate"
              :aria-disabled="!canDownload"
              :aria-describedby="!canDownload ? 'download-title-requirement' : undefined"
              :title="canDownload ? 'Download this canvas as an RO-Crate' : 'Add a project title to enable download'"
              @click="requestDownloadROCrate"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-4-4 4m0 0-4-4m4 4V4" />
              </svg>
              <span v-show="headerActionsMode === 'full'">Download RO-Crate</span>
              <span v-show="headerActionsMode === 'short'">Download</span>
            </button>
            <span v-if="!canDownload" id="download-title-requirement" class="sr-only">
              Add a project title to enable download.
            </span>
          </template>
        </div>
      </div>
    </header>

    <main
      :class="[
        'mx-auto w-full max-w-[1800px] flex-1 px-4 pb-0 sm:px-6 lg:px-8',
        canvasView === 'detailed' ? 'pt-0' : 'pt-4',
      ]"
    >
      <CanvasForm
        v-model:view-mode="canvasView"
        :highlight-missing="highlightMissing"
      />
    </main>

    <GuidanceSidebar />

    <Teleport to="body">
      <div
        v-if="showPartialDialog"
        class="fixed inset-0 z-[80] flex items-center justify-center p-4"
        @keydown="handlePartialDialogKeydown"
      >
        <div class="absolute inset-0 bg-gray-950/40" aria-hidden="true" @click="closePartialDialog" />
        <section
          ref="partialDialogPanel"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="partial-dialog-title"
          aria-describedby="partial-dialog-description"
          class="relative max-h-[calc(100vh-2rem)] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl"
        >
          <h2 id="partial-dialog-title" class="text-xl font-bold text-gray-950">This canvas is still partial</h2>
          <p id="partial-dialog-description" class="mt-2 text-sm leading-6 text-gray-700">
            {{ pendingMissingPrompts.length }} simplified prompt{{ pendingMissingPrompts.length === 1 ? ' is' : 's are' }} unanswered. You can keep editing, or export a clearly marked partial RO-Crate that does not claim AAC profile conformance.
          </p>
          <ul class="mt-4 max-h-64 space-y-1 overflow-y-auto rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
            <li v-for="prompt in pendingMissingPrompts" :key="prompt.id">
              <strong>{{ prompt.section }}:</strong> {{ prompt.label }}
            </li>
          </ul>
          <div class="mt-6 flex flex-wrap justify-end gap-3">
            <button
              ref="continueEditingButton"
              type="button"
              class="btn-secondary"
              @click="continueEditing"
            >
              Continue editing
            </button>
            <button type="button" class="btn-primary" @click="exportPartialCanvas">
              Export anyway
            </button>
          </div>
        </section>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="isDragging"
        class="pointer-events-none fixed inset-0 z-[90] flex items-center justify-center bg-black/50"
      >
        <div class="max-w-md rounded-xl bg-white px-12 py-10 text-center shadow-2xl">
          <svg class="mx-auto mb-4 h-16 w-16 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-8-4-4m0 0L8 8m4-4v12" />
          </svg>
          <p class="text-lg font-semibold text-gray-900">Drop RO-Crate ZIP to import</p>
          <p class="mt-1 text-sm text-gray-500">This will replace your current canvas data</p>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import CanvasForm from './components/CanvasForm.vue'
import GuidanceSidebar from './components/GuidanceSidebar.vue'
import ImportButton from './components/ImportButton.vue'
import InfoIcon from './components/InfoIcon.vue'
import { useCanvasData } from './composables/useCanvasData'
import { useGuidance } from './composables/useGuidance'
import { useHeaderActionsMode } from './composables/useHeaderActionsMode'
import { exampleData, exampleBenefitDisplay } from './data/example-data'
import { generateROCrate } from '@/rocrate/export'
import { downloadROCrateZip } from './utils/download'
import { ROCrateImportError, importROCrateFromZip, isZipFile } from '@/rocrate/container'
import { formatDiagnostics } from '@/diagnostics'
import { CurrentCanvasValidationError } from '@/schema/validation'
import { hasCustomBenefitDisplay } from '@/types/benefitDisplay'
import {
  hasDetailedCanvasContent,
  hasMeaningfulCanvasContent,
  missingSimplifiedPrompts,
  simplifiedPromptDomId,
  type MissingSimplifiedPrompt,
} from '@/utils/simplifiedCanvasState'

const {
  canvasData,
  benefitDisplay,
  importFromROCrate,
  clearData: clearCanvasData,
  reportDiagnostics,
  validateAll,
  requestSection,
  dataVersion,
} = useCanvasData()
const { openGuidance } = useGuidance()
const headerActionsRef = ref<HTMLElement | null>(null)
const headerActionsMode = useHeaderActionsMode(headerActionsRef, { widthFull: 850, widthShort: 620 })
const baseUrl = import.meta.env.BASE_URL || '/'
const canvasView = ref<'simplified' | 'detailed'>('simplified')
const hasMeaningfulContent = computed(() =>
  hasMeaningfulCanvasContent(canvasData.value) || hasCustomBenefitDisplay(benefitDisplay.value),
)
const hasDetailedContent = computed(() =>
  hasDetailedCanvasContent(canvasData.value) || hasCustomBenefitDisplay(benefitDisplay.value),
)
const canDownload = computed(() => canvasData.value.project.title.trim().length > 0)

const LOAD_EXAMPLE_HINT_KEY = 'aac-load-example-hint-seen'
const showLoadExampleHint = ref(false)
const highlightMissing = ref(false)
const showPartialDialog = ref(false)
const pendingMissingPrompts = ref<MissingSimplifiedPrompt[]>([])
const partialDialogPanel = ref<HTMLElement | null>(null)
const continueEditingButton = ref<HTMLButtonElement | null>(null)
let downloadTrigger: HTMLElement | null = null

onMounted(() => {
  showLoadExampleHint.value = !localStorage.getItem(LOAD_EXAMPLE_HINT_KEY)
})

watch(dataVersion, () => {
  highlightMissing.value = false
})

function openGeneralGuidance(event: MouseEvent) {
  openGuidance('aac', event.currentTarget as HTMLElement)
}

function toggleCanvasView() {
  canvasView.value = canvasView.value === 'simplified' ? 'detailed' : 'simplified'
}

function loadExample() {
  localStorage.setItem(LOAD_EXAMPLE_HINT_KEY, '1')
  showLoadExampleHint.value = false
  highlightMissing.value = false
  importFromROCrate(exampleData, exampleBenefitDisplay)
  canvasView.value = 'simplified'
  requestSection('simplified-canvas')
}

const isDragging = ref(false)
let dragCounter = 0

function onDragEnter(event: DragEvent) {
  if (event.dataTransfer?.types.includes('Files')) {
    dragCounter += 1
    isDragging.value = true
  }
}

function onDragLeave() {
  dragCounter -= 1
  if (dragCounter <= 0) {
    dragCounter = 0
    isDragging.value = false
  }
}

async function onDrop(event: DragEvent) {
  dragCounter = 0
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (!file) return

  if (!isZipFile(file)) {
    alert('Please drop a ZIP file containing an RO-Crate.')
    return
  }
  if (!confirm(`Import RO-Crate from "${file.name}"?\n\nThis will replace your current canvas data.`)) return

  try {
    const result = await importROCrateFromZip(file)
    highlightMissing.value = false
    importFromROCrate(result.canvasData, result.benefitDisplay, result.diagnostics)
    alert('RO-Crate imported successfully!')
  } catch (error) {
    reportImportFailure(error)
  }
}

function reportImportFailure(error: unknown) {
  if (error instanceof ROCrateImportError) {
    reportDiagnostics(error.diagnostics)
    alert(`Could not import this RO-Crate:\n\n${formatDiagnostics(error.diagnostics)}`)
  } else {
    alert(`Error importing RO-Crate: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
  console.error('Import error:', error)
}

function clearData() {
  if (!confirm('Are you sure you want to clear all canvas data? This cannot be undone.')) return
  highlightMissing.value = false
  clearCanvasData()
  canvasView.value = 'simplified'
  requestSection('simplified-canvas')
}

async function requestDownloadROCrate(event: MouseEvent) {
  if (!canvasData.value.project.title.trim()) return
  downloadTrigger = event.currentTarget as HTMLElement
  const missing = missingSimplifiedPrompts(canvasData.value)
  if (missing.length === 0) {
    await performDownload(false)
    return
  }

  highlightMissing.value = true
  pendingMissingPrompts.value = missing
  canvasView.value = 'simplified'
  requestSection('simplified-canvas')
  showPartialDialog.value = true
  await nextTick()
  continueEditingButton.value?.focus()
}

function closePartialDialog() {
  showPartialDialog.value = false
  const target = downloadTrigger
  window.setTimeout(() => target?.focus(), 0)
}

async function continueEditing() {
  const first = pendingMissingPrompts.value[0]
  showPartialDialog.value = false
  canvasView.value = 'simplified'
  requestSection('simplified-canvas')
  await nextTick()
  if (first) {
    const field = document.getElementById(simplifiedPromptDomId(first.id))
    field?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    field?.focus()
  }
}

async function exportPartialCanvas() {
  showPartialDialog.value = false
  await performDownload(true)
  downloadTrigger?.focus()
}

function handlePartialDialogKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    closePartialDialog()
    return
  }
  if (event.key !== 'Tab' || !partialDialogPanel.value) return
  const focusable = [...partialDialogPanel.value.querySelectorAll<HTMLElement>(
    'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
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

async function performDownload(allowPartial: boolean) {
  const validationResult = validateAll()
  if (!allowPartial && !validationResult.isValid) {
    const errorMessages = validationResult.errors.map((error) => `- ${error.field}: ${error.message}`).join('\n')
    alert(`Please fix validation errors before downloading:\n\n${errorMessages}`)
    return
  }

  if (validationResult.warnings.length > 0) {
    const warningMessages = validationResult.warnings.map((warning) => `- ${warning.field}: ${warning.message}`).join('\n')
    if (!confirm(`The following warnings were found:\n\n${warningMessages}\n\nDo you want to proceed with export?`)) return
  }

  const additionalWarnings: string[] = []
  const personIds = new Set((canvasData.value.persons || []).map((person) => person.id))
  canvasData.value.project.creator?.forEach((creatorId, index) => {
    if (!personIds.has(creatorId)) additionalWarnings.push(`Project creator[${index}] references unknown person: ${creatorId}`)
  })
  canvasData.value.governance?.stages?.forEach((stage, stageIndex) => {
    stage.agents?.forEach((agent, agentIndex) => {
      if (agent.type === 'person' && agent.personId && !personIds.has(agent.personId)) {
        additionalWarnings.push(`Stage[${stageIndex}].agent[${agentIndex}] references unknown person: ${agent.personId}`)
      }
    })
  })
  if (additionalWarnings.length > 0 && !confirm(`Additional validation warnings:\n\n${additionalWarnings.join('\n')}\n\nDo you want to proceed with export?`)) return

  try {
    const rocrate = generateROCrate(canvasData.value, {
      benefitDisplay: benefitDisplay.value,
      allowPartial,
    })
    const projectName = canvasData.value.project.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'agentic-automation-project'
    await downloadROCrateZip(rocrate, projectName, canvasData.value, benefitDisplay.value)
  } catch (error) {
    if (error instanceof CurrentCanvasValidationError) {
      alert(`${error.message}. Please fix these fields before exporting:\n\n${formatDiagnostics(error.diagnostics)}`)
    } else {
      alert(`Error generating RO-Crate: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
    console.error('RO-Crate generation error:', error)
  }
}
</script>

<style scoped>
.header-action {
  @apply inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-950 focus:outline-none focus:ring-2 focus:ring-primary-600;
}

.load-example-hint-pulse {
  animation: load-example-pulse 1.5s ease-in-out infinite;
}

@keyframes load-example-pulse {
  0%, 100% { box-shadow: 0 0 0 3px rgb(14 165 233 / 0.5); }
  50% { box-shadow: 0 0 0 8px rgb(14 165 233 / 0); }
}
</style>
