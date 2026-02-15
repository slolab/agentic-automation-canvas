<template>
  <div id="app" class="flex flex-col min-h-screen">
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <img :src="`${baseUrl}logo.svg`" alt="" class="h-10 w-10 shrink-0" />
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Agentic Automation Canvas</h1>
            <p class="text-sm text-gray-600 mt-1">
              Stop guessing—structured guidance for expectations, progress, and governance
            </p>
            </div>
          </div>
          <div ref="headerActionsRef" class="flex min-w-0 flex-1 flex-nowrap items-center justify-end gap-3">
            <button
              type="button"
              @click="openInfo"
              class="flex shrink-0 items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              title="Learn about Agentic Automation Canvas"
            >
              <svg
                class="w-4 h-4 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span v-show="headerActionsMode === 'full'">What is this?</span>
              <span v-show="headerActionsMode === 'short'">About</span>
            </button>
            <button
              type="button"
              @click="loadExample"
              :class="[
                'flex shrink-0 items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors',
                showLoadExampleHint && 'load-example-hint-pulse',
              ]"
              title="Load example dataset"
            >
              <svg
                class="w-4 h-4 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span v-show="headerActionsMode === 'full'">Load Example</span>
              <span v-show="headerActionsMode === 'short'">Example</span>
            </button>
            <ImportButton :header-actions-mode="headerActionsMode" />
          </div>
        </div>
      </div>
    </header>
    
    <main class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 w-full">
      <CanvasForm />
    </main>
    
    <!-- Bot Assistant -->
    <BotAssistant />
    
    <!-- Info Overlay -->
    <InfoOverlay ref="infoOverlay" />
    
    <footer class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 min-w-0">
        <div class="flex flex-nowrap items-center gap-4 min-w-0">
          <div
            class="flex min-w-0 flex-col gap-1 text-sm text-gray-500"
            :class="footerActionsMode === 'icon' ? 'flex-[2]' : 'flex-1'"
          >
            <div class="flex flex-wrap items-center gap-2 sm:gap-3">
              <p class="font-medium text-gray-700">Agentic Automation Canvas</p>
              <a
                href="https://github.com/slolab/agentic-automation-canvas"
                target="_blank"
                rel="noopener noreferrer"
                class="text-primary-600 hover:text-primary-800 underline flex items-center gap-1 shrink-0"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span>View on GitHub</span>
              </a>
            </div>
            <div class="flex flex-wrap items-center gap-2 sm:gap-3">
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 border border-primary-200 shrink-0"
                title="App version (from package.json at build time)"
              >
                v{{ appVersion }}
              </span>
              <span class="text-gray-400 text-xs italic">Schema subject to change until v1.0 release</span>
            </div>
          </div>
          <a
            href="https://slolab.ai"
            target="_blank"
            rel="noopener noreferrer"
            class="flex shrink-0 items-center gap-1.5"
            title="slolab"
          >
            <img src="/slolab.png" alt="slolab" class="h-8 w-auto" />
            <span class="text-[10px] sm:text-xs leading-tight text-gray-400 whitespace-nowrap">
              made by<br />slolab
            </span>
          </a>
          <div ref="footerActionsRef" class="flex min-w-0 flex-1 flex-nowrap items-center justify-end gap-3">
            <a
              :href="`${baseUrl}docs/`"
              target="_blank"
              rel="noopener noreferrer"
              class="flex shrink-0 items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              title="View documentation"
            >
              <svg
                class="w-4 h-4 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <span v-show="footerActionsMode === 'full'">Documentation</span>
              <span v-show="footerActionsMode === 'short'">Docs</span>
            </a>
            <button
              type="button"
              @click="clearData"
              class="flex shrink-0 items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              title="Clear all form data"
            >
              <svg
                class="w-4 h-4 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              <span v-show="footerActionsMode === 'full'">Clear Form</span>
              <span v-show="footerActionsMode === 'short'">Clear</span>
            </button>
            <button
              type="button"
              @click="downloadROCrate"
              :disabled="!canDownload"
              class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex shrink-0 items-center gap-2"
            >
              <svg
                class="w-5 h-5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              <span v-show="footerActionsMode === 'full'">Download RO-Crate</span>
              <span v-show="footerActionsMode === 'short'">Download</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCanvasData } from './composables/useCanvasData'
import { useHeaderActionsMode } from './composables/useHeaderActionsMode'
import { exampleData, exampleBenefitDisplay } from './data/example-data'
import { generateROCrate, validateForExport, hasBlockingErrors } from './utils/rocrate'
import { downloadROCrateZip } from './utils/download'
import CanvasForm from './components/CanvasForm.vue'
import BotAssistant from './components/BotAssistant.vue'
import ImportButton from './components/ImportButton.vue'
import InfoOverlay from './components/InfoOverlay.vue'

const { canvasData, benefitDisplay, importFromROCrate, clearData: clearCanvasData, validateAll } = useCanvasData()
const infoOverlay = ref<InstanceType<typeof InfoOverlay> | null>(null)
const headerActionsRef = ref<HTMLElement | null>(null)
const headerActionsMode = useHeaderActionsMode(headerActionsRef)
const footerActionsRef = ref<HTMLElement | null>(null)
// Footer right column is ~half the row; use lower breakpoints so full labels can show
const footerActionsMode = useHeaderActionsMode(footerActionsRef, { widthFull: 480, widthShort: 260 })
const baseUrl = import.meta.env.BASE_URL || '/'
// Injected at build time from package.json (vite.config.ts define)
const appVersion = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '—'

const LOAD_EXAMPLE_HINT_KEY = 'aac-load-example-hint-seen'
const showLoadExampleHint = ref(false)

onMounted(() => {
  showLoadExampleHint.value = !localStorage.getItem(LOAD_EXAMPLE_HINT_KEY)
})

const loadExample = () => {
  localStorage.setItem(LOAD_EXAMPLE_HINT_KEY, '1')
  showLoadExampleHint.value = false
  if (confirm('This will replace your current data with an example dataset. Continue?')) {
    importFromROCrate(exampleData, exampleBenefitDisplay)
    // Don't switch tabs - stay on current tab
  }
}

const openInfo = () => {
  infoOverlay.value?.open()
}

const validation = computed(() => validateAll())

const canDownload = computed(() => {
  return validation.value.isValid && !!(canvasData.value.project.title && canvasData.value.project.description)
})

const clearData = () => {
  if (confirm('Are you sure you want to clear all form data? This cannot be undone.')) {
    clearCanvasData()
  }
}

const downloadROCrate = async () => {
  const validationResult = validateAll()
  
  // Block on errors
  if (!validationResult.isValid) {
    const errorMessages = validationResult.errors.map(e => `- ${e.field}: ${e.message}`).join('\n')
    alert(`Please fix validation errors before downloading:\n\n${errorMessages}`)
    return
  }

  // Show warnings but allow export
  if (validationResult.warnings.length > 0) {
    const warningMessages = validationResult.warnings.map(w => `- ${w.field}: ${w.message}`).join('\n')
    const proceed = confirm(`The following warnings were found. You can still export, but consider addressing them:\n\n${warningMessages}\n\nDo you want to proceed with export?`)
    if (!proceed) {
      return
    }
  }

  // Additional validation: check for null values and reference resolution
  const additionalWarnings: string[] = []
  
  // Check Person references
  const personIds = new Set((canvasData.value.persons || []).map(p => p.id))
  
  // Check creator references
  if (canvasData.value.project.creator) {
    canvasData.value.project.creator.forEach((creatorId, idx) => {
      if (!personIds.has(creatorId)) {
        additionalWarnings.push(`Project creator[${idx}] references unknown person: ${creatorId}`)
      }
    })
  }
  
  
  // Check agent references
  if (canvasData.value.governance?.stages) {
    canvasData.value.governance.stages.forEach((stage, stageIdx) => {
      if (stage.agents) {
        stage.agents.forEach((agent, agentIdx) => {
          if (agent.type === 'person' && agent.personId && !personIds.has(agent.personId)) {
            additionalWarnings.push(`Stage[${stageIdx}].agent[${agentIdx}] references unknown person: ${agent.personId}`)
          }
        })
      }
    })
  }
  
  if (additionalWarnings.length > 0) {
    const proceed = confirm(`Additional validation warnings:\n\n${additionalWarnings.join('\n')}\n\nDo you want to proceed with export?`)
    if (!proceed) {
      return
    }
  }

  // Validate for RO-Crate export (benefit semantics, aggregation consistency)
  const exportErrors = validateForExport(canvasData.value)
  
  // Block export if there are critical errors
  if (hasBlockingErrors(exportErrors)) {
    const errorMessages = exportErrors
      .filter(e => e.severity === 'error')
      .map(e => `${e.path}: ${e.message}`)
      .join('\n\n')
    alert(`Export blocked due to validation errors:\n\n${errorMessages}\n\nPlease fix these issues before exporting.`)
    return
  }
  
  // Show warnings but allow proceeding
  const warnings = exportErrors.filter(e => e.severity === 'warning')
  if (warnings.length > 0) {
    const warningMessages = warnings.map(e => `${e.path}: ${e.message}`).join('\n\n')
    const proceed = confirm(`Export validation warnings:\n\n${warningMessages}\n\nDo you want to proceed anyway?`)
    if (!proceed) {
      return
    }
  }

  try {
    const rocrate = generateROCrate(canvasData.value, {
      benefitDisplay: benefitDisplay.value,
      schemaVersion: appVersion !== '—' ? appVersion : undefined,
    })
    
    // Validate RO-Crate structure: check for null values
    const nullValues: string[] = []
    const checkForNulls = (obj: any, path: string = '') => {
      if (obj === null) {
        nullValues.push(path || 'root')
        return
      }
      if (Array.isArray(obj)) {
        obj.forEach((item, idx) => {
          if (item === null) {
            nullValues.push(`${path}[${idx}]`)
          } else if (typeof item === 'object') {
            checkForNulls(item, `${path}[${idx}]`)
          }
        })
      } else if (typeof obj === 'object') {
        Object.keys(obj).forEach(key => {
          const newPath = path ? `${path}.${key}` : key
          checkForNulls(obj[key], newPath)
        })
      }
    }
    checkForNulls(rocrate)
    
    if (nullValues.length > 0) {
      console.warn('RO-Crate contains null values:', nullValues)
      // Note: We'll filter these out in generateROCrate, but warn here
    }
    
    const projectName = canvasData.value.project.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'agentic-automation-project'
    
    await downloadROCrateZip(rocrate, projectName, canvasData.value, benefitDisplay.value)
  } catch (error) {
    alert(`Error generating RO-Crate: ${error instanceof Error ? error.message : 'Unknown error'}`)
    console.error('RO-Crate generation error:', error)
  }
}
</script>

<style scoped>
.load-example-hint-pulse {
  animation: load-example-pulse 1.5s ease-in-out infinite;
}
@keyframes load-example-pulse {
  0%, 100% {
    box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.5);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(14, 165, 233, 0);
  }
}
</style>
