<template>
  <div class="relative">
    <input
      :key="inputKey"
      ref="fileInput"
      type="file"
      accept=".zip,application/zip,application/x-zip-compressed"
      class="hidden"
      @change="handleFileSelect"
    />
    <button
      type="button"
      @click="openFileDialog"
      :class="[
        'flex shrink-0 items-center justify-center gap-2 rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        headerActionsMode === 'full' && 'min-w-[14rem]',
      ]"
      :disabled="isImporting"
      title="Import RO-Crate (ZIP)"
      aria-label="Import RO-Crate (ZIP)"
    >
      <svg
        v-if="!isImporting"
        class="w-5 h-5 shrink-0"
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
        class="animate-spin w-5 h-5 shrink-0"
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
      <span v-show="headerActionsMode === 'full'" class="whitespace-nowrap text-center">
        {{ isImporting ? 'Importing…' : 'Import RO-Crate (ZIP)' }}
      </span>
      <span v-show="headerActionsMode === 'short'" class="whitespace-nowrap text-center">
        {{ isImporting ? 'Importing…' : 'Import RO-Crate' }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { HeaderActionsMode } from '@/composables/useHeaderActionsMode'
import { ROCrateImportError, importROCrateFromZip, isZipFile } from '@/rocrate/container'
import { formatDiagnostics } from '@/diagnostics'
import { useCanvasData } from '@/composables/useCanvasData'

withDefaults(
  defineProps<{
    headerActionsMode?: HeaderActionsMode
  }>(),
  { headerActionsMode: 'full' }
)

const { importFromROCrate, reportDiagnostics } = useCanvasData()
const fileInput = ref<HTMLInputElement | null>(null)
const isImporting = ref(false)
const inputKey = ref(0)

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // The accept attribute is only a picker hint; validate dropped/selected files too.
  if (!isZipFile(file)) {
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
    importFromROCrate(result.canvasData, result.benefitDisplay, result.diagnostics)
    // Don't switch tabs - stay on current tab
    alert('RO-Crate imported successfully!')
  } catch (error) {
    if (error instanceof ROCrateImportError) {
      reportDiagnostics(error.diagnostics)
      alert(`Could not import this RO-Crate:\n\n${formatDiagnostics(error.diagnostics)}`)
    } else {
      alert(`Error importing RO-Crate: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
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
