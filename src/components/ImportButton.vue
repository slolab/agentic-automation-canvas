<template>
  <div class="relative">
    <input
      :key="inputKey"
      ref="fileInput"
      type="file"
      class="hidden"
      @change="handleFileSelect"
    />
    <button
      type="button"
      @click="openFileDialog"
      class="flex items-center gap-2 px-4 py-2 rounded-md font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      :disabled="isImporting"
    >
      <svg
        v-if="!isImporting"
        class="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
        />
      </svg>
      <svg
        v-else
        class="animate-spin w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span>{{ isImporting ? 'Importing...' : 'Import RO-Crate (ZIP)' }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { importROCrateFromZip } from '@/utils/import'
import { useCanvasData } from '@/composables/useCanvasData'

const { importFromROCrate } = useCanvasData()
const fileInput = ref<HTMLInputElement | null>(null)
const isImporting = ref(false)
const inputKey = ref(0)

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // Validate file type in JavaScript (more reliable than accept attribute)
  const fileName = file.name.toLowerCase()
  const isValidZip = fileName.endsWith('.zip') || 
                     file.type === 'application/zip' || 
                     file.type === 'application/x-zip-compressed'
  
  if (!isValidZip) {
    alert('Please select a ZIP file')
    // Reset input
    if (fileInput.value) {
      fileInput.value.value = ''
    }
    return
  }

  isImporting.value = true

  try {
    const result = await importROCrateFromZip(file)
    importFromROCrate(result.canvasData, result.benefitDisplay, result.crateSchemaVersion, true)
    alert('RO-Crate imported successfully!')
  } catch (error) {
    alert(`Error importing RO-Crate: ${error instanceof Error ? error.message : 'Unknown error'}`)
    console.error('Import error:', error)
  } finally {
    isImporting.value = false
    // Increment key to force Vue to recreate the input element
    // This ensures fresh file picker state for the next open
    inputKey.value++
  }
}

const openFileDialog = () => {
  if (fileInput.value) {
    // Reset value to clear any previous selection
    fileInput.value.value = ''
    fileInput.value.click()
  }
}
</script>
