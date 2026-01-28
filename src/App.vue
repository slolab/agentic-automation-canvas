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
          <ImportButton />
        </div>
      </div>
    </header>
    
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <CanvasForm />
    </main>
    
    <!-- Bot Assistant -->
    <BotAssistant />
    
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
import CanvasForm from './components/CanvasForm.vue'
import BotAssistant from './components/BotAssistant.vue'
import ImportButton from './components/ImportButton.vue'
</script>
