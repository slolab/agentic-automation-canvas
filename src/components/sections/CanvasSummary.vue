<template>
  <div class="space-y-6">
    <div>
      <h2 class="section-header flex items-center gap-2">
        <span>Canvas Summary</span>
        <InfoTooltip
          content="<strong>One-page overview:</strong> Inspired by the Business Model Canvas, this view distills your project into six key dimensions. Use it to quickly communicate the essence of your automation project to stakeholders, governance boards, or collaborators."
          position="top"
        />
      </h2>
      <p class="section-description">
        A single-page summary of your agentic automation project. Fill in the other sections to populate this overview.
      </p>
    </div>

    <!-- Classic BMC-style canvas: white bg, thin grey grid, minimal layout -->
    <div class="canvas-bmc-wrapper bg-white border-4 border-black print:shadow-none" style="max-width: 1100px">
      <!-- Header -->
      <div class="canvas-bmc-header flex flex-wrap items-end justify-between gap-4 px-5 py-4 border-b-2 border-black">
        <h3 class="text-xl font-bold text-gray-900">The Agentic Automation Canvas</h3>
        <div class="flex flex-wrap gap-6 text-xs text-gray-500">
          <span><strong class="text-gray-700">Design for:</strong> {{ summary.project.title || '—' }}</span>
          <span><strong class="text-gray-700">Date:</strong> {{ canvasData.project?.versionDate || canvasData.versionDate || canvasData.project?.startDate || today }}</span>
          <span><strong class="text-gray-700">Version:</strong> {{ version }}</span>
        </div>
      </div>

      <!-- Grid: 3 columns; left/right 1/2 each row, middle 2/3 + 1/3 -->
      <div class="canvas-bmc-grid">
        <!-- Left column: 1/2 + 1/2 -->
        <div class="canvas-bmc-col flex flex-col border-r-2 border-black">
          <div class="canvas-bmc-block flex-1 border-b-2 border-black px-4 pt-2 pb-4">
            <h4 class="canvas-bmc-block-title flex items-center gap-2 text-gray-900">
              <CanvasBlockIcon name="project" />
              Project Definition
            </h4>
            <div class="canvas-bmc-content text-sm text-gray-800 space-y-1.5">
              <p class="font-semibold">{{ summary.project.title }}</p>
              <p v-if="summary.project.description" class="text-gray-600">{{ summary.project.description }}</p>
              <p v-if="summary.project.stage" class="text-xs uppercase">{{ summary.project.stage }}</p>
              <p v-if="summary.project.headlineValue" class="font-medium">{{ summary.project.headlineValue }}</p>
              <p v-if="summary.project.primaryValueDriver" class="text-xs">Primary value: {{ summary.project.primaryValueDriver }}</p>
              <div v-if="summary.project.domain.length" class="flex flex-wrap gap-1 text-xs">
                <span v-for="d in summary.project.domain" :key="d" class="text-gray-600">{{ d }}</span>
              </div>
              <p v-if="isEmptyProject(summary.project)" class="italic text-gray-400">Not specified</p>
            </div>
          </div>
          <div class="canvas-bmc-block flex-1 px-4 pt-2 pb-4">
            <h4 class="canvas-bmc-block-title flex items-center gap-2 text-gray-900">
              <CanvasBlockIcon name="governance" />
              Governance
            </h4>
            <div class="canvas-bmc-content text-sm text-gray-800 space-y-1.5">
              <template v-if="summary.governance.stages.length">
                <div v-for="(stage, i) in summary.governance.stages" :key="i" class="border-l-2 border-black pl-2 text-xs">
                  <p class="font-medium">{{ stage.name }}</p>
                  <p v-if="stage.startDate || stage.endDate" class="text-gray-500">{{ stage.startDate }} {{ stage.startDate && stage.endDate ? '→' : '' }} {{ stage.endDate }}</p>
                  <p v-if="stage.agentCount > 0 || stage.milestoneCount > 0" class="text-gray-500">{{ stage.agentCount }} agents, {{ stage.milestoneCount }} milestones</p>
                </div>
              </template>
              <p v-else class="italic text-gray-400">Not specified</p>
            </div>
          </div>
        </div>

        <!-- Middle column: 2/3 + 1/3 -->
        <div class="canvas-bmc-col flex flex-col border-r-2 border-black">
          <div class="canvas-bmc-block flex-[2] border-b-2 border-black px-4 pt-2 pb-4">
            <h4 class="canvas-bmc-block-title flex items-center gap-2 text-gray-900">
              <CanvasBlockIcon name="expectations" />
              User Expectations
            </h4>
            <div class="canvas-bmc-content text-sm text-gray-800 space-y-1.5">
              <p><strong>{{ summary.userExpectations.taskCount }}</strong> tasks</p>
              <div v-if="summary.userExpectations.tasks.length" class="space-y-2">
                <div
                  v-for="(t, i) in summary.userExpectations.tasks"
                  :key="i"
                  class="border-l-2 border-gray-300 pl-2 py-0.5"
                >
                  <p class="font-medium text-gray-900">{{ t.title }}</p>
                  <p v-if="t.userStory" class="text-xs italic mt-0.5 user-story-text">
                    <template v-if="parseUserStory(t.userStory)">
                      <span
                        v-for="(seg, j) in parseUserStory(t.userStory)!"
                        :key="j"
                        :class="seg.formulaic ? 'user-story-formulaic' : 'user-story-content'"
                      >{{ seg.text }}</span>
                    </template>
                    <span v-else class="text-gray-600">{{ t.userStory }}</span>
                  </p>
                </div>
              </div>
              <template v-if="summary.userExpectations.totalTimeSavedHoursPerMonth > 0 || Object.keys(summary.userExpectations.benefitTypeCounts).length">
                <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 mt-2 mb-0.5">Benefits</p>
                <p v-if="summary.userExpectations.totalTimeSavedHoursPerMonth > 0" class="font-medium">
                  ~{{ summary.userExpectations.totalTimeSavedHoursPerMonth }} hrs/month saved
                </p>
                <div v-if="Object.keys(summary.userExpectations.benefitTypeCounts).length" class="flex flex-wrap gap-1 text-xs">
                  <span
                    v-for="(count, type) in summary.userExpectations.benefitTypeCounts"
                    :key="type"
                    class="px-1.5 py-0.5 border border-black text-gray-700 capitalize"
                  >
                    {{ type }} {{ count }}
                  </span>
                </div>
              </template>
              <p v-if="isEmptyUserExpectations(summary.userExpectations)" class="italic text-gray-400">Not specified</p>
            </div>
          </div>
          <div class="canvas-bmc-block flex-[1] px-4 pt-2 pb-4">
            <h4 class="canvas-bmc-block-title flex items-center gap-2 text-gray-900">
              <CanvasBlockIcon name="data" />
              Data Access
            </h4>
            <div class="canvas-bmc-content text-sm text-gray-800 space-y-1.5">
              <template v-if="!isEmptyDataAccess(summary.dataAccess)">
                <p><strong>{{ summary.dataAccess.datasetCount }}</strong> datasets</p>
                <div v-if="Object.keys(summary.dataAccess.accessRightsSummary).length" class="text-xs">
                  <p v-for="(count, ar) in summary.dataAccess.accessRightsSummary" :key="ar">{{ ar }}: {{ count }}</p>
                </div>
                <div v-if="summary.dataAccess.sensitivitySummary.length" class="flex flex-wrap gap-1 text-xs">
                  <span v-for="s in summary.dataAccess.sensitivitySummary" :key="s" class="text-gray-600">{{ s }}</span>
                </div>
              </template>
              <p v-else class="italic text-gray-400">Not specified</p>
            </div>
          </div>
        </div>

        <!-- Right column: 1/2 + 1/2 -->
        <div class="canvas-bmc-col flex flex-col">
          <div class="canvas-bmc-block flex-1 border-b-2 border-black px-4 pt-2 pb-4">
            <h4 class="canvas-bmc-block-title flex items-center gap-2 text-gray-900">
              <CanvasBlockIcon name="feasibility" />
              Developer Feasibility
            </h4>
            <div class="canvas-bmc-content text-sm text-gray-800 space-y-1.5">
              <div v-if="summary.developerFeasibility.trlCurrent !== null || summary.developerFeasibility.trlTarget !== null">
                <span>TRL</span>
                <span v-if="summary.developerFeasibility.trlCurrent !== null">
                  {{ summary.developerFeasibility.trlCurrent }}
                  <span v-if="summary.developerFeasibility.trlTarget !== null">→ {{ summary.developerFeasibility.trlTarget }}</span>
                </span>
                <span v-else-if="summary.developerFeasibility.trlTarget !== null">target {{ summary.developerFeasibility.trlTarget }}</span>
              </div>
              <p v-if="summary.developerFeasibility.technicalRisk">Risk: <span class="capitalize">{{ summary.developerFeasibility.technicalRisk }}</span></p>
              <p v-if="summary.developerFeasibility.effortEstimate">Effort: {{ summary.developerFeasibility.effortEstimate }}</p>
              <p v-if="summary.developerFeasibility.amortizationMonths !== null" class="text-xs">
                ~{{ summary.developerFeasibility.amortizationMonths!.toFixed(1) }} mo until amortization
              </p>
              <p v-if="summary.developerFeasibility.feasibilityNotes" class="text-xs">{{ summary.developerFeasibility.feasibilityNotes }}</p>
              <div v-if="summary.userExpectations.taskCount > 0" class="mt-2">
                <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                  Task-level feasibility: {{ summary.developerFeasibility.tasksWithDedicatedFeasibility.length }} of {{ summary.userExpectations.taskCount }} tasks
                </p>
                <div class="canvas-feasibility-bar h-2.5 bg-gray-300 border border-gray-500 rounded-sm overflow-hidden">
                  <div
                    class="canvas-feasibility-fill h-full transition-all"
                    :style="{ width: `${feasibilityProgress}%` }"
                  />
                </div>
              </div>
              <p v-if="isEmptyDeveloperFeasibility(summary.developerFeasibility) && summary.userExpectations.taskCount === 0" class="italic text-gray-400">Not specified</p>
            </div>
          </div>
          <div class="canvas-bmc-block flex-1 px-4 pt-2 pb-4">
            <h4 class="canvas-bmc-block-title flex items-center gap-2 text-gray-900">
              <CanvasBlockIcon name="outcomes" />
              Outcomes
            </h4>
            <div class="canvas-bmc-content text-sm text-gray-800 space-y-2">
              <template v-if="!isEmptyOutcomes(summary.outcomes)">
                <template v-if="summary.outcomes.deliverables.length">
                  <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {{ summary.outcomes.deliverableCount }} {{ summary.outcomes.deliverableCount === 1 ? 'deliverable' : 'deliverables' }}
                  </p>
                  <ul class="list-none space-y-0.5 text-xs">
                    <li v-for="(d, i) in summary.outcomes.deliverables" :key="'d-' + i">
                      <a
                        v-if="isLink(d.pid)"
                        :href="d.pid!"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-gray-700 hover:underline"
                      >{{ d.title }}</a>
                      <span v-else>{{ d.title }}</span>
                    </li>
                  </ul>
                </template>
                <template v-if="summary.outcomes.publications.length">
                  <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {{ summary.outcomes.publicationCount }} {{ summary.outcomes.publicationCount === 1 ? 'publication' : 'publications' }}
                  </p>
                  <ul class="list-none space-y-0.5 text-xs">
                    <li v-for="(p, i) in summary.outcomes.publications" :key="'p-' + i">
                      <a
                        v-if="isLink(p.doi)"
                        :href="p.doi!"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-gray-700 hover:underline"
                      >{{ p.title }}</a>
                      <span v-else>{{ p.title }}</span>
                    </li>
                  </ul>
                </template>
                <template v-if="summary.outcomes.evaluations.length">
                  <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {{ summary.outcomes.evaluationCount }} {{ summary.outcomes.evaluationCount === 1 ? 'evaluation' : 'evaluations' }}
                  </p>
                  <ul class="list-none space-y-0.5 text-xs">
                    <li v-for="(e, i) in summary.outcomes.evaluations" :key="'e-' + i">
                      <span class="font-medium">{{ e.type }}</span>
                      <span v-if="e.results" class="text-gray-600"> — {{ e.results }}</span>
                    </li>
                  </ul>
                </template>
              </template>
              <p v-else class="italic text-gray-400">Not specified</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="canvas-bmc-footer text-right px-5 py-2 border-t-2 border-black text-xs text-gray-500">
        Generated by the Agentic Automation Canvas · <a href="https://aac.slolab.ai" target="_blank" rel="noopener noreferrer" class="text-gray-600 hover:underline">https://aac.slolab.ai</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCanvasData } from '@/composables/useCanvasData'
import { computeCanvasSummary, type CanvasSummaryData } from '@/utils/canvasSummary'
import InfoTooltip from '../InfoTooltip.vue'
import CanvasBlockIcon from './CanvasBlockIcon.vue'

const { canvasData } = useCanvasData()

const summary = computed<CanvasSummaryData>(() => computeCanvasSummary(canvasData.value))
const today = new Date().toISOString().split('T')[0]
const version = computed(() => canvasData.value.project?.version || canvasData.value.version || '0.1.0')

const feasibilityProgress = computed(() => {
  const n = summary.value.developerFeasibility.tasksWithDedicatedFeasibility.length
  const total = summary.value.userExpectations.taskCount
  if (total === 0) return 0
  return Math.round((n / total) * 100)
})

function isEmptyProject(p: CanvasSummaryData['project']): boolean {
  const noTitle = !p.title || p.title === 'Untitled Project'
  return noTitle && !p.description && !p.stage && !p.headlineValue && !p.primaryValueDriver && p.domain.length === 0
}

function isEmptyUserExpectations(u: CanvasSummaryData['userExpectations']): boolean {
  return u.taskCount === 0 && Object.keys(u.benefitTypeCounts).length === 0 && u.tasks.length === 0
}

function isEmptyDeveloperFeasibility(d: CanvasSummaryData['developerFeasibility']): boolean {
  return (
    d.trlCurrent === null &&
    d.trlTarget === null &&
    !d.technicalRisk &&
    !d.effortEstimate &&
    d.amortizationMonths === null &&
    !d.feasibilityNotes.trim() &&
    d.tasksWithDedicatedFeasibility.length === 0
  )
}

/** True if value looks like a link (starts with http:// or https://) */
function isLink(url: string | undefined): boolean {
  if (!url || !url.trim()) return false
  const s = url.trim().toLowerCase()
  return s.startsWith('http://') || s.startsWith('https://')
}

/** Parse "As a X, I want Y, so that Z" structure. Returns segments or null if pattern not found. Case insensitive; commas before "I want" and "so that" optional. */
function parseUserStory(text: string | undefined): Array<{ text: string; formulaic: boolean }> | null {
  if (!text || !text.trim()) return null
  const t = text.trim()
  // Full pattern: As a/an ROLE [,] I want GOAL [,] so that BENEFIT
  const full = t.match(/^\s*(as\s+an?\s+)([\s\S]+?)(,?\s*i\s+want\s+)([\s\S]+?)(,?\s*so\s+that\s+)([\s\S]*)\s*$/i)
  if (full) {
    return [
      { text: full[1], formulaic: true },
      { text: full[2].trim(), formulaic: false },
      { text: full[3], formulaic: true },
      { text: full[4].trim(), formulaic: false },
      { text: full[5], formulaic: true },
      { text: full[6].trim(), formulaic: false },
    ]
  }
  // Partial: As a/an ROLE [,] I want GOAL (no "so that")
  const partial = t.match(/^\s*(as\s+an?\s+)([\s\S]+?)(,?\s*i\s+want\s+)([\s\S]*)\s*$/i)
  if (partial) {
    return [
      { text: partial[1], formulaic: true },
      { text: partial[2].trim(), formulaic: false },
      { text: partial[3], formulaic: true },
      { text: partial[4].trim(), formulaic: false },
    ]
  }
  return null
}

function isEmptyDataAccess(d: CanvasSummaryData['dataAccess']): boolean {
  return d.datasetCount === 0 && Object.keys(d.accessRightsSummary).length === 0 && d.sensitivitySummary.length === 0
}

function isEmptyOutcomes(o: CanvasSummaryData['outcomes']): boolean {
  return (
    o.deliverableCount === 0 &&
    o.publicationCount === 0 &&
    o.evaluationCount === 0 &&
    o.deliverables.length === 0 &&
    o.publications.length === 0 &&
    o.evaluations.length === 0
  )
}

</script>

<style scoped>
.canvas-bmc-wrapper {
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
}

.canvas-bmc-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  min-height: 320px;
}

@media (max-width: 767px) {
  .canvas-bmc-grid {
    grid-template-columns: 1fr;
  }
  .canvas-bmc-col {
    border-right: none !important;
    border-bottom: 2px solid black;
  }
  .canvas-bmc-col:last-child {
    border-bottom: none;
  }
}

.canvas-bmc-block-title {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
  padding-top: 0.125rem;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid rgb(209 213 219);
}

.canvas-bmc-content {
  min-height: 4rem;
}


.canvas-feasibility-bar {
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.15);
}

.canvas-feasibility-fill {
  background: linear-gradient(180deg, #374151 0%, #1f2937 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.user-story-formulaic {
  color: rgb(156 163 175);
  font-weight: 400;
}

.user-story-content {
  color: rgb(75 85 99);
  font-weight: 500;
}

@media print {
  .canvas-bmc-wrapper {
    break-inside: avoid;
    page-break-inside: avoid;
  }
}
</style>
