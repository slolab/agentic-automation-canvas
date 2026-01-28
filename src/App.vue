<template>
  <div id="app" class="min-h-screen">
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-start justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Agentic Automation Canvas</h1>
            <p class="text-sm text-gray-600 mt-1">
              Capture project metadata and generate RO-Crate packages
            </p>
          </div>
          <div class="flex items-center gap-3">
            <button
              type="button"
              @click="openInfo"
              class="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              title="Learn about Agentic Automation Canvas"
            >
              <svg
                class="w-4 h-4"
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
              <span>What is this?</span>
            </button>
            <button
              type="button"
              @click="loadExample"
              class="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              title="Load example dataset"
            >
              <svg
                class="w-4 h-4"
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
              <span>Load Example</span>
            </button>
            <ImportButton />
          </div>
        </div>
      </div>
    </header>
    
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <CanvasForm />
    </main>
    
    <!-- Bot Assistant -->
    <BotAssistant />
    
    <!-- Info Overlay -->
    <InfoOverlay ref="infoOverlay" />
    
    <footer class="bg-white border-t border-gray-200 mt-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <p class="text-sm text-gray-500 text-center">
          Agentic Automation Canvas - Built with Vue.js and following W3C standards
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCanvasData } from './composables/useCanvasData'
import { exampleData } from './data/example-data'
import CanvasForm from './components/CanvasForm.vue'
import BotAssistant from './components/BotAssistant.vue'
import ImportButton from './components/ImportButton.vue'
import InfoOverlay from './components/InfoOverlay.vue'

const { importFromROCrate } = useCanvasData()
const infoOverlay = ref<InstanceType<typeof InfoOverlay> | null>(null)

const loadExample = () => {
  if (confirm('This will replace your current data with an example dataset. Continue?')) {
    importFromROCrate(exampleData)
  }
}

const openInfo = () => {
  infoOverlay.value?.open()
}
</script>
