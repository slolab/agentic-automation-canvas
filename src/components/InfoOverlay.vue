<template>
  <!-- Overlay backdrop -->
  <Transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      @click.self="close"
    >
      <!-- Backdrop that prevents scrolling -->
      <div 
        class="fixed inset-0 bg-black bg-opacity-50"
        @scroll.prevent
        @wheel.prevent.stop
        @touchmove.prevent.stop
      />
      
      <!-- Modal content -->
      <Transition name="slide-up">
        <div
          v-if="isOpen"
          class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col relative z-10"
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
                <p class="mb-2">
                  The Agentic Automation Canvas helps you design, govern, and document agentic automation solutions that use AI to replace or augment human judgment. It formalises a <strong>bidirectional contract between users and developers</strong>: users capture their expectations with quantified benefit metrics, while developers assess the technical feasibility of delivering those benefits.
                </p>
                <p>
                  The canvas is primarily a <strong>communication tool</strong>. We recommend that users and developers fill it out together — the structured conversation surfaces misalignments early, before significant resources are committed. It is not a contract to be enforced, but a <strong>living document</strong> that evolves alongside your project.
                </p>
              </div>

              <div>
                <h3 class="font-semibold text-gray-900 mb-2">Why use it?</h3>
                <ul class="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Prospective design:</strong> Unlike retrospective documentation (model cards, datasheets), the AAC guides design decisions <em>before and during</em> development, when they can still influence outcomes</li>
                  <li><strong>Quantified benefits:</strong> Capture measurable expectations across five dimensions (time, quality, risk, enablement, cost) with human oversight costs factored in, enabling realistic go/no-go decisions</li>
                  <li><strong>Comprehensive checklist:</strong> Ensures you consider all relevant aspects — user expectations, feasibility, governance, data access, and outcomes</li>
                  <li><strong>Machine-readable output:</strong> Generates FAIR-compliant RO-Crate packages that integrate with research infrastructure and other tools</li>
                  <li><strong>AI-ready:</strong> Every export includes an <code>AGENTS.md</code> file that translates the canvas specification into structured instructions for AI coding agents (GitHub Copilot, Cursor, etc.), bridging design and implementation</li>
                  <li><strong>Track progress:</strong> Compare actual gains vs. initial expectations over time by versioning the canvas alongside your implementation</li>
                  <li><strong>Governance support:</strong> Define decision authority at each development phase, establish milestones, and create an auditable governance trail</li>
                  <li><strong>Private by design:</strong> The application runs entirely in the browser — no server-side processing, and canvas data never leaves your machine</li>
                </ul>
              </div>

              <div>
                <h3 class="font-semibold text-gray-900 mb-2">How does it work?</h3>
                <ol class="list-decimal list-inside space-y-1 ml-2">
                  <li>Sit down with your users <em>and</em> developers to fill out the canvas together — start with scope, then expectations and feasibility</li>
                  <li>The canvas validates your input in real time and guides you through six structured dimensions</li>
                  <li>View the dashboard to see workflow visualizations and benefit metrics</li>
                  <li>Download your completed canvas as an RO-Crate package (ZIP file with metadata, preview, and agent instructions)</li>
                  <li>Place the <code>AGENTS.md</code> file in your project repository for your AI coding assistant to use as a project specification</li>
                  <li>Re-upload the RO-Crate when the project evolves — keep the canvas version synchronised with your implementation milestones</li>
                </ol>
              </div>

              <div>
                <h3 class="font-semibold text-gray-900 mb-2">Version Management</h3>
                <p class="mb-2">
                  The canvas uses semantic versioning to keep your package synchronized with your implementation. Here's the recommended workflow:
                </p>
                <ol class="list-decimal list-inside space-y-1 ml-2">
                  <li><strong>Create from scratch:</strong> Start a new canvas (initializes with version 0.1.0)</li>
                  <li><strong>Download:</strong> Export your canvas as an RO-Crate when you reach a milestone</li>
                  <li><strong>Upload for modification:</strong> Import a previous version of your RO-Crate to continue working</li>
                  <li><strong>Update version:</strong> When you make changes, increment the version number (e.g., 0.1.0 → 0.1.1) to reflect the changes</li>
                  <li><strong>Synchronize with implementation:</strong> Keep the canvas version aligned with your actual implementation version - when you release v1.0.0 of your system, update the canvas to v1.0.0 as well</li>
                </ol>
                <p class="mt-2">
                  The download date is automatically recorded when you import a RO-Crate, and the system will remind you to increment the version when modifying an imported canvas. Follow <a href="https://semver.org/" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-800 underline">semantic versioning standards</a> for guidance on version numbering.
                </p>
              </div>

              <div>
                <h3 class="font-semibold text-gray-900 mb-2">Why RO-Crate?</h3>
                <p class="mb-2">
                  RO-Crate (Research Object Crate) is a standardized packaging format that bundles your project metadata with the data files in a self-contained, portable package. We use RO-Crate because it:
                </p>
                <ul class="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Ensures interoperability:</strong> Your canvas can be read and used by any tool that supports RO-Crate, not just this application</li>
                  <li><strong>Follows FAIR principles:</strong> Makes your project Findable, Accessible, Interoperable, and Reusable</li>
                  <li><strong>Integrates with research infrastructure:</strong> Works with EOSC, research data repositories, and FAIR Digital Object ecosystems</li>
                  <li><strong>Enables validation:</strong> Can be validated against standards to ensure correctness and completeness</li>
                  <li><strong>Preserves provenance:</strong> Captures relationships between people, processes, and data using established ontologies</li>
                  <li><strong>Future-proof:</strong> Based on W3C standards that won't become obsolete, ensuring your metadata remains usable long-term</li>
                </ul>
                <p class="mt-2">
                  Unlike custom JSON or CSV exports, RO-Crate packages are self-describing, include all necessary context, and can be understood by both humans and machines without needing the original application.
                </p>
              </div>

              <div>
                <h3 class="font-semibold text-gray-900 mb-2">Standards-Compliant</h3>
                <p>
                  All outputs follow established W3C and Schema.org standards (RO-Crate, DCAT, PROV-O, P-Plan, FRAPO, DUO), ensuring your project metadata is interoperable and can be integrated with research infrastructure and FAIR Digital Object ecosystems.
                </p>
              </div>

              <div>
                <h3 class="font-semibold text-gray-900 mb-2">Beta Notice</h3>
                <p>
                  The AAC schema is currently in beta. The schema structure and fields may change before the stable 1.0.0 release. We welcome feedback and contributions during this phase.
                </p>
              </div>

              <div>
                <h3 class="font-semibold text-gray-900 mb-2">Learn More</h3>
                <p class="mb-2">
                  For detailed documentation, schema reference, examples, and validation tools, visit the 
                  <a
                    :href="`${baseUrl}docs/`"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-primary-600 hover:text-primary-800 underline"
                  >Agentic Automation Canvas documentation</a>.
                </p>
                <p>
                  Read the manuscript:
                  <a
                    href="https://slolab.github.io/aac-manuscript/"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-primary-600 hover:text-primary-800 underline"
                  >HTML</a> ·
                  <a
                    href="https://arxiv.org/abs/2602.15090"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-primary-600 hover:text-primary-800 underline"
                  >arXiv</a>
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
import { ref, watch, onUnmounted } from 'vue'

const isOpen = ref(false)
const savedScrollPosition = ref(0)
const baseUrl = import.meta.env.BASE_URL || '/'

watch(isOpen, (open) => {
  if (open) {
    // Prevent background scrolling - save current scroll position and lock
    savedScrollPosition.value = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${savedScrollPosition.value}px`
    document.body.style.width = '100%'
    document.body.style.overflow = 'hidden'
  } else {
    // Restore background scrolling and scroll position
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.width = ''
    document.body.style.overflow = ''
    window.scrollTo(0, savedScrollPosition.value)
  }
})

const open = () => {
  isOpen.value = true
}

const close = () => {
  isOpen.value = false
}

// Ensure body scroll is restored when component is unmounted
onUnmounted(() => {
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.width = ''
  document.body.style.overflow = ''
  if (savedScrollPosition.value > 0) {
    window.scrollTo(0, savedScrollPosition.value)
  }
})

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
