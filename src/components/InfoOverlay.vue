<template>
  <!-- Overlay backdrop -->
  <Transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      @click.self="close"
    >
      <!-- Modal content -->
      <Transition name="slide-up">
        <div
          v-if="isOpen"
          class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          @click.stop
        >
          <!-- Header with close button -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900">About Agentic Automation Canvas</h2>
            <button
              type="button"
              @click="close"
              class="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded p-1"
              aria-label="Close"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="px-6 py-4 overflow-y-auto flex-1">
            <div class="space-y-4 text-sm text-gray-700">
              <div>
                <h3 class="font-semibold text-gray-900 mb-2">What is this?</h3>
                <p>
                  The Agentic Automation Canvas helps you design and document agentic automation solutions that use AI to replace or augment human judgment in routine tasks. It guides you through planning, development, and deployment while capturing all essential aspects of your automation project.
                </p>
              </div>

              <div>
                <h3 class="font-semibold text-gray-900 mb-2">Why use it?</h3>
                <ul class="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Framework for implementation:</strong> Structured approach to designing your automation solution</li>
                  <li><strong>Comprehensive checklist:</strong> Ensures you consider all relevant aspects (user expectations, feasibility, governance, data access)</li>
                  <li><strong>Machine-readable output:</strong> Generates standards-compliant RO-Crate packages for interoperability</li>
                  <li><strong>Track progress:</strong> Compare actual gains vs. initial expectations over time</li>
                  <li><strong>Governance support:</strong> Facilitate use & access decisions and data protection strategies</li>
                </ul>
              </div>

              <div>
                <h3 class="font-semibold text-gray-900 mb-2">How does it work?</h3>
                <ol class="list-decimal list-inside space-y-1 ml-2">
                  <li>Fill out the form sections to capture your project details, requirements, and expectations</li>
                  <li>The canvas validates your input and provides real-time feedback</li>
                  <li>View the dashboard to see workflow visualizations and time savings metrics</li>
                  <li>Download your completed canvas as an RO-Crate package (ZIP file)</li>
                  <li>Use the RO-Crate for project documentation, comparison, and integration with other tools</li>
                </ol>
              </div>

              <div>
                <h3 class="font-semibold text-gray-900 mb-2">Standards-Compliant</h3>
                <p>
                  All outputs follow established W3C and Schema.org standards (RO-Crate, DCAT, PROV-O, P-Plan, FRAPO, DUO), ensuring your project metadata is interoperable and can be integrated with research infrastructure and FAIR Digital Object ecosystems.
                </p>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              @click="close"
              class="w-full btn-primary"
            >
              Got it
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isOpen = ref(false)

const open = () => {
  isOpen.value = true
  document.body.style.overflow = 'hidden'
}

const close = () => {
  isOpen.value = false
  document.body.style.overflow = ''
}

defineExpose({
  open,
  close,
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
