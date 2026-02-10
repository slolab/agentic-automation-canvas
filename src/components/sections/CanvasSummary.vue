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

    <!-- BMC-style grid: 3 columns x 2 rows -->
    <div
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 print:grid-cols-3 print:gap-3"
      style="max-width: 1200px"
    >
      <!-- Project Definition -->
      <div class="canvas-block bg-blue-50 border border-blue-200 rounded-lg p-4 print:break-inside-avoid">
        <h3 class="canvas-block-title text-blue-900">Project Definition</h3>
        <div class="canvas-block-content text-sm text-blue-800 space-y-2">
          <p class="font-semibold">{{ summary.project.title }}</p>
          <p v-if="summary.project.description" class="text-blue-700">{{ summary.project.description }}</p>
          <div v-if="summary.project.stage" class="flex flex-wrap gap-1">
            <span class="px-2 py-0.5 rounded text-xs font-medium bg-blue-200 text-blue-800">
              {{ summary.project.stage }}
            </span>
          </div>
          <p v-if="summary.project.headlineValue" class="font-medium">{{ summary.project.headlineValue }}</p>
          <p v-if="summary.project.primaryValueDriver" class="text-xs">
            Primary value: {{ summary.project.primaryValueDriver }}
          </p>
          <div v-if="summary.project.domain.length" class="flex flex-wrap gap-1">
            <span
              v-for="d in summary.project.domain"
              :key="d"
              class="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700"
            >
              {{ d }}
            </span>
          </div>
          <p v-if="isEmptyProject(summary.project)" class="italic text-blue-600">Not specified</p>
        </div>
      </div>

      <!-- User Expectations -->
      <div class="canvas-block bg-green-50 border border-green-200 rounded-lg p-4 print:break-inside-avoid">
        <h3 class="canvas-block-title text-green-900">User Expectations</h3>
        <div class="canvas-block-content text-sm text-green-800 space-y-2">
          <p><strong>{{ summary.userExpectations.taskCount }}</strong> tasks</p>
          <ul v-if="summary.userExpectations.taskTitles.length" class="list-disc list-inside text-xs space-y-0.5">
            <li v-for="(t, i) in summary.userExpectations.taskTitles" :key="i">{{ t }}</li>
          </ul>
          <template v-if="summary.userExpectations.totalTimeSavedHoursPerMonth > 0 || Object.keys(summary.userExpectations.benefitTypeCounts).length">
            <p class="text-xs font-semibold uppercase tracking-wide text-green-700 mt-2 mb-1">Benefits</p>
            <p v-if="summary.userExpectations.totalTimeSavedHoursPerMonth > 0" class="font-medium">
              ~{{ summary.userExpectations.totalTimeSavedHoursPerMonth }} hrs/month saved
            </p>
            <div v-if="Object.keys(summary.userExpectations.benefitTypeCounts).length" class="flex flex-wrap gap-1">
              <span
                v-for="(count, type) in summary.userExpectations.benefitTypeCounts"
                :key="type"
                :class="benefitTypeBadgeClass(type)"
                class="px-2 py-0.5 rounded text-xs font-medium capitalize"
              >
                {{ type }} {{ count }}
              </span>
            </div>
          </template>
          <p v-if="isEmptyUserExpectations(summary.userExpectations)" class="italic text-green-600">Not specified</p>
        </div>
      </div>

      <!-- Developer Feasibility -->
      <div class="canvas-block bg-amber-50 border border-amber-200 rounded-lg p-4 print:break-inside-avoid">
        <h3 class="canvas-block-title text-amber-900">Developer Feasibility</h3>
        <div class="canvas-block-content text-sm text-amber-800 space-y-2">
          <div v-if="summary.developerFeasibility.trlCurrent !== null || summary.developerFeasibility.trlTarget !== null">
            <span>TRL</span>
            <span v-if="summary.developerFeasibility.trlCurrent !== null">
              {{ summary.developerFeasibility.trlCurrent }}
              <span v-if="summary.developerFeasibility.trlTarget !== null">
                → {{ summary.developerFeasibility.trlTarget }}
              </span>
            </span>
            <span v-else-if="summary.developerFeasibility.trlTarget !== null">
              target {{ summary.developerFeasibility.trlTarget }}
            </span>
          </div>
          <p v-if="summary.developerFeasibility.technicalRisk">
            Risk: <span class="capitalize">{{ summary.developerFeasibility.technicalRisk }}</span>
          </p>
          <p v-if="summary.developerFeasibility.effortEstimate">
            Effort: {{ summary.developerFeasibility.effortEstimate }}
          </p>
          <p v-if="summary.developerFeasibility.feasibilityNotes" class="text-xs">
            {{ summary.developerFeasibility.feasibilityNotes }}
          </p>
          <p v-if="isEmptyDeveloperFeasibility(summary.developerFeasibility)" class="italic text-amber-600">Not specified</p>
        </div>
      </div>

      <!-- Governance -->
      <div class="canvas-block bg-purple-50 border border-purple-200 rounded-lg p-4 print:break-inside-avoid">
        <h3 class="canvas-block-title text-purple-900">Governance</h3>
        <div class="canvas-block-content text-sm text-purple-800 space-y-2">
          <template v-if="summary.governance.stages.length">
            <div
              v-for="(stage, i) in summary.governance.stages"
              :key="i"
              class="border-l-2 border-purple-300 pl-2 text-xs"
            >
              <p class="font-medium">{{ stage.name }}</p>
              <p v-if="stage.startDate || stage.endDate" class="text-purple-600">
                {{ stage.startDate }} {{ stage.startDate && stage.endDate ? '→' : '' }} {{ stage.endDate }}
              </p>
              <p v-if="stage.agentCount > 0 || stage.milestoneCount > 0" class="text-purple-600">
                {{ stage.agentCount }} agents, {{ stage.milestoneCount }} milestones
              </p>
            </div>
          </template>
          <p v-else class="italic text-purple-600">Not specified</p>
        </div>
      </div>

      <!-- Data Access -->
      <div class="canvas-block bg-rose-50 border border-rose-200 rounded-lg p-4 print:break-inside-avoid">
        <h3 class="canvas-block-title text-rose-900">Data Access</h3>
        <div class="canvas-block-content text-sm text-rose-800 space-y-2">
          <template v-if="!isEmptyDataAccess(summary.dataAccess)">
            <p><strong>{{ summary.dataAccess.datasetCount }}</strong> datasets</p>
            <div v-if="Object.keys(summary.dataAccess.accessRightsSummary).length" class="text-xs">
              <p v-for="(count, ar) in summary.dataAccess.accessRightsSummary" :key="ar">
                {{ ar }}: {{ count }}
              </p>
            </div>
            <div v-if="summary.dataAccess.sensitivitySummary.length" class="flex flex-wrap gap-1">
              <span
                v-for="s in summary.dataAccess.sensitivitySummary"
                :key="s"
                class="px-2 py-0.5 rounded text-xs bg-rose-100 text-rose-700"
              >
                {{ s }}
              </span>
            </div>
          </template>
          <p v-else class="italic text-rose-600">Not specified</p>
        </div>
      </div>

      <!-- Outcomes -->
      <div class="canvas-block bg-slate-50 border border-slate-200 rounded-lg p-4 print:break-inside-avoid">
        <h3 class="canvas-block-title text-slate-900">Outcomes</h3>
        <div class="canvas-block-content text-sm text-slate-800 space-y-2">
          <template v-if="!isEmptyOutcomes(summary.outcomes)">
            <p>
              {{ summary.outcomes.deliverableCount }} deliverables,
              {{ summary.outcomes.publicationCount }} publications,
              {{ summary.outcomes.evaluationCount }} evaluations
            </p>
            <ul v-if="summary.outcomes.deliverableTitles.length" class="list-disc list-inside text-xs space-y-0.5">
              <li v-for="(t, i) in summary.outcomes.deliverableTitles" :key="i">{{ t }}</li>
            </ul>
            <ul v-if="summary.outcomes.keyResults.length" class="list-disc list-inside text-xs space-y-0.5">
              <li v-for="(r, i) in summary.outcomes.keyResults" :key="'r-' + i">{{ r }}</li>
            </ul>
          </template>
          <p v-else class="italic text-slate-600">Not specified</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCanvasData } from '@/composables/useCanvasData'
import { computeCanvasSummary, type CanvasSummaryData } from '@/utils/canvasSummary'
import InfoTooltip from '../InfoTooltip.vue'

const { canvasData } = useCanvasData()

const summary = computed<CanvasSummaryData>(() => computeCanvasSummary(canvasData.value))

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

function benefitTypeBadgeClass(type: string): string {
  const classes: Record<string, string> = {
    time: 'bg-green-100 text-green-700',
    quality: 'bg-blue-100 text-blue-700',
    risk: 'bg-orange-100 text-orange-700',
    enablement: 'bg-purple-100 text-purple-700',
    cost: 'bg-amber-100 text-amber-700',
  }
  return classes[type] || 'bg-gray-100 text-gray-700'
}
</script>

<style scoped>
.canvas-block-title {
  @apply text-sm font-semibold uppercase tracking-wide mb-3 pb-1 border-b border-current border-opacity-30;
}

.canvas-block-content {
  min-height: 4rem;
}

@media print {
  .canvas-block {
    break-inside: avoid;
    page-break-inside: avoid;
  }
}
</style>
