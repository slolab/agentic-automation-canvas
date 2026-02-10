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
          <div class="canvas-bmc-block flex-1 border-b-2 border-black p-4">
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
          <div class="canvas-bmc-block flex-1 p-4">
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
          <div class="canvas-bmc-block flex-[2] border-b-2 border-black p-4">
            <h4 class="canvas-bmc-block-title flex items-center gap-2 text-gray-900">
              <CanvasBlockIcon name="expectations" />
              User Expectations
            </h4>
            <div class="canvas-bmc-content text-sm text-gray-800 space-y-1.5">
              <p><strong>{{ summary.userExpectations.taskCount }}</strong> tasks</p>
              <ul v-if="summary.userExpectations.taskTitles.length" class="list-disc list-inside text-xs space-y-0.5">
                <li v-for="(t, i) in summary.userExpectations.taskTitles" :key="i">{{ t }}</li>
              </ul>
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
          <div class="canvas-bmc-block flex-[1] p-4">
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
          <div class="canvas-bmc-block flex-1 border-b-2 border-black p-4">
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
              <p v-if="summary.developerFeasibility.feasibilityNotes" class="text-xs">{{ summary.developerFeasibility.feasibilityNotes }}</p>
              <p v-if="isEmptyDeveloperFeasibility(summary.developerFeasibility)" class="italic text-gray-400">Not specified</p>
            </div>
          </div>
          <div class="canvas-bmc-block flex-1 p-4">
            <h4 class="canvas-bmc-block-title flex items-center gap-2 text-gray-900">
              <CanvasBlockIcon name="outcomes" />
              Outcomes
            </h4>
            <div class="canvas-bmc-content text-sm text-gray-800 space-y-1.5">
              <template v-if="!isEmptyOutcomes(summary.outcomes)">
                <p>{{ summary.outcomes.deliverableCount }} deliverables, {{ summary.outcomes.publicationCount }} publications, {{ summary.outcomes.evaluationCount }} evaluations</p>
                <ul v-if="summary.outcomes.deliverableTitles.length" class="list-disc list-inside text-xs space-y-0.5">
                  <li v-for="(t, i) in summary.outcomes.deliverableTitles" :key="i">{{ t }}</li>
                </ul>
                <ul v-if="summary.outcomes.keyResults.length" class="list-disc list-inside text-xs space-y-0.5">
                  <li v-for="(r, i) in summary.outcomes.keyResults" :key="'r-' + i">{{ r }}</li>
                </ul>
              </template>
              <p v-else class="italic text-gray-400">Not specified</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="canvas-bmc-footer px-5 py-2 border-t-2 border-black text-xs text-gray-500">
        Generated by Agentic Automation Canvas · <a href="https://aac.slolab.ai" target="_blank" rel="noopener noreferrer" class="text-gray-600 hover:underline">https://aac.slolab.ai</a>
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

function isEmptyProject(p: CanvasSummaryData['project']): boolean {
  const noTitle = !p.title || p.title === 'Untitled Project'
  return noTitle && !p.description && !p.stage && !p.headlineValue && !p.primaryValueDriver && p.domain.length === 0
}

function isEmptyUserExpectations(u: CanvasSummaryData['userExpectations']): boolean {
  return u.taskCount === 0 && Object.keys(u.benefitTypeCounts).length === 0
}

function isEmptyDeveloperFeasibility(d: CanvasSummaryData['developerFeasibility']): boolean {
  return (
    d.trlCurrent === null &&
    d.trlTarget === null &&
    !d.technicalRisk &&
    !d.effortEstimate &&
    !d.feasibilityNotes.trim()
  )
}

function isEmptyDataAccess(d: CanvasSummaryData['dataAccess']): boolean {
  return d.datasetCount === 0 && Object.keys(d.accessRightsSummary).length === 0 && d.sensitivitySummary.length === 0
}

function isEmptyOutcomes(o: CanvasSummaryData['outcomes']): boolean {
  return (
    o.deliverableCount === 0 &&
    o.publicationCount === 0 &&
    o.evaluationCount === 0 &&
    o.deliverableTitles.length === 0 &&
    o.keyResults.length === 0
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
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
  padding-bottom: 0.25rem;
  border-bottom: 1px solid rgb(209 213 219);
}

.canvas-bmc-content {
  min-height: 4rem;
}


@media print {
  .canvas-bmc-wrapper {
    break-inside: avoid;
    page-break-inside: avoid;
  }
}
</style>
