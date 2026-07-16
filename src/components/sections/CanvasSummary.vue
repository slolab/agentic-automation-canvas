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
        A single-page summary of your agentic automation project. Start with the six essentials right here — the full detail lives in the other sections.
      </p>
    </div>

    <!-- Essentials guidance: start simple, go deeper when ready -->
    <div
      v-if="fwProgress.completeCount < 6"
      class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary-200 bg-primary-50 px-4 py-3"
      style="max-width: 1100px"
    >
      <p class="text-sm text-primary-900 m-0">
        <strong>Start simple:</strong> fill in the essentials below. Click a block title to open the full section when you're ready.
      </p>
      <span class="text-sm font-semibold text-primary-700 whitespace-nowrap">{{ fwProgress.completeCount }}/6 essentials</span>
    </div>
    <div
      v-else
      class="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-800"
      style="max-width: 1100px"
    >
      <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      Essentials complete — click a block title to fill in the remaining fields.
    </div>

    <!-- Classic BMC-style canvas: white bg, thin grey grid, minimal layout -->
    <div class="canvas-bmc-wrapper bg-white border-4 border-black print:shadow-none" style="max-width: 1100px">
      <!-- Header -->
      <div class="canvas-bmc-header flex flex-wrap items-center justify-between gap-4 px-5 py-4 border-b-2 border-black">
        <h3 class="text-xl font-semibold text-gray-900">The Agentic Automation Canvas</h3>
        <div class="text-xl">
          <span class="font-semibold text-gray-900">Design for:</span>
          <span class="text-gray-500 ml-1">{{ summary.project.title || '—' }}</span>
        </div>
      </div>

      <!-- Grid: 3 columns; left/right 1/2 each row, middle 2/3 + 1/3 -->
      <div class="canvas-bmc-grid">
        <!-- Left column: 1/2 + 1/2 -->
        <div class="canvas-bmc-col flex flex-col border-r-2 border-black">
          <div class="canvas-bmc-block flex-1 border-b-2 border-black px-4 pt-2 pb-4">
            <h4 class="canvas-bmc-block-title flex flex-wrap items-center gap-2 text-gray-900">
              <button type="button" class="canvas-bmc-block-title-link" @click="requestSection('project')">
                Project Definition
              </button>
              <button
                type="button"
                class="canvas-fw-chip"
                :class="{ 'canvas-fw-chip--done': fwProgress.summary && fwProgress.benefit }"
                @click="toggleFwEdit('project')"
              >
                <template v-if="fwProgress.summary && fwProgress.benefit">essentials ✓</template>
                <template v-else>essentials {{ (fwProgress.summary ? 1 : 0) + (fwProgress.benefit ? 1 : 0) }}/2</template>
              </button>
              <CanvasBlockIcon name="project" />
            </h4>
            <div class="canvas-bmc-content text-sm text-gray-800 space-y-1.5">
              <div v-if="showProjectStrip" class="canvas-fw-strip" @focusout="onStripFocusOut('project', $event)">
                <label class="canvas-fw-label" for="fw-project-title">Summary — what is this project?</label>
                <input
                  id="fw-project-title"
                  class="canvas-fw-input font-semibold"
                  type="text"
                  placeholder="Project title"
                  :value="canvasData.project.title"
                  @input="updateProject({ title: ($event.target as HTMLInputElement).value })"
                />
                <textarea
                  id="fw-project-description"
                  class="canvas-fw-input"
                  rows="2"
                  placeholder="One or two sentences on what it does and for whom"
                  :value="canvasData.project.description"
                  @input="updateProject({ description: ($event.target as HTMLTextAreaElement).value })"
                ></textarea>
                <label class="canvas-fw-label" for="fw-project-benefit">Headline value — what do you hope to gain?</label>
                <input
                  id="fw-project-benefit"
                  class="canvas-fw-input"
                  type="text"
                  placeholder="e.g. Saves clinician time on letter triage"
                  :value="canvasData.project.headlineValue || ''"
                  @input="updateProject({ headlineValue: ($event.target as HTMLInputElement).value })"
                />
              </div>
              <template v-if="!showProjectStrip">
                <p class="font-semibold">{{ summary.project.title }}</p>
                <p v-if="summary.project.description" class="text-gray-600">{{ summary.project.description }}</p>
                <p v-if="summary.project.headlineValue" class="font-medium">{{ summary.project.headlineValue }}</p>
              </template>
              <p v-if="summary.project.stage" class="text-xs uppercase">{{ summary.project.stage }}</p>
              <p v-if="summary.project.primaryValueDriver" class="text-xs">Primary value: {{ summary.project.primaryValueDriver }}</p>
              <div v-if="summary.project.domain.length" class="flex flex-wrap gap-1 text-xs">
                <span v-for="d in summary.project.domain" :key="d" class="text-gray-600">{{ d }}</span>
              </div>
            </div>
          </div>
          <div class="canvas-bmc-block flex-1 px-4 pt-2 pb-4">
            <h4 class="canvas-bmc-block-title flex items-center gap-2 text-gray-900">
              <button type="button" class="canvas-bmc-block-title-link" @click="requestSection('governance')">
                Governance
              </button>
              <CanvasBlockIcon name="governance" />
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
            <h4 class="canvas-bmc-block-title flex flex-wrap items-center gap-2 text-gray-900">
              <button type="button" class="canvas-bmc-block-title-link" @click="requestSection('user-expectations')">
                User Expectations
              </button>
              <button
                type="button"
                class="canvas-fw-chip"
                :class="{ 'canvas-fw-chip--done': fwProgress.tasks }"
                @click="toggleFwEdit('tasks')"
              >
                <template v-if="fwProgress.tasks">essentials ✓</template>
                <template v-else>essentials — first task</template>
              </button>
              <CanvasBlockIcon name="expectations" />
            </h4>
            <div class="canvas-bmc-content text-sm text-gray-800 space-y-1.5">
              <div v-if="showTasksStrip" class="canvas-fw-strip" @focusout="onStripFocusOut('tasks', $event)">
                <label class="canvas-fw-label" for="fw-task-title">First task — what should be automated?</label>
                <input
                  id="fw-task-title"
                  class="canvas-fw-input font-medium"
                  type="text"
                  placeholder="e.g. De-identify incoming letters"
                  :value="firstTask?.title || ''"
                  @input="patchFirstTask({ title: ($event.target as HTMLInputElement).value })"
                />
                <textarea
                  id="fw-task-story"
                  class="canvas-fw-input"
                  rows="2"
                  placeholder="As a …, I want …, so that …"
                  :value="firstTask?.userStory || ''"
                  @input="patchFirstTask({ userStory: ($event.target as HTMLTextAreaElement).value })"
                ></textarea>
                <label class="canvas-fw-label" for="fw-task-audience">Target population — who benefits?</label>
                <input
                  id="fw-task-audience"
                  class="canvas-fw-input"
                  type="text"
                  placeholder="e.g. clinicians triaging referrals"
                  :value="firstTask?.targetPopulation || ''"
                  @input="patchFirstTask({ targetPopulation: ($event.target as HTMLInputElement).value })"
                />
              </div>
              <p><strong>{{ summary.userExpectations.taskCount }}</strong> tasks</p>
              <div v-if="visibleTasks.length" class="space-y-2">
                <div
                  v-for="(t, i) in visibleTasks"
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
                  <button
                    v-for="(count, type) in summary.userExpectations.benefitTypeCounts"
                    :key="type"
                    type="button"
                    class="canvas-benefit-tag"
                    @click="requestSection('project')"
                  >
                    {{ type }} {{ count }}
                  </button>
                </div>
              </template>
              <p v-if="isEmptyUserExpectations(summary.userExpectations) && !showTasksStrip" class="italic text-gray-400">Not specified</p>
            </div>
          </div>
          <div class="canvas-bmc-block flex-[1] px-4 pt-2 pb-4">
            <h4 class="canvas-bmc-block-title flex flex-wrap items-center gap-2 text-gray-900">
              <button type="button" class="canvas-bmc-block-title-link" @click="requestSection('data-access')">
                Data Access
              </button>
              <button
                type="button"
                class="canvas-fw-chip"
                :class="{ 'canvas-fw-chip--done': fwProgress.dataAccess }"
                @click="toggleFwEdit('dataAccess')"
              >
                <template v-if="fwProgress.dataAccess">essentials ✓</template>
                <template v-else>essentials — main dataset</template>
              </button>
              <CanvasBlockIcon name="data" />
            </h4>
            <div class="canvas-bmc-content text-sm text-gray-800 space-y-1.5">
              <div v-if="showDataAccessStrip" class="canvas-fw-strip" @focusout="onStripFocusOut('dataAccess', $event)">
                <label class="canvas-fw-label" for="fw-dataset-title">Main dataset — what data does it touch?</label>
                <input
                  id="fw-dataset-title"
                  class="canvas-fw-input"
                  type="text"
                  placeholder="e.g. Incoming patient letters"
                  :value="firstDataset?.title || ''"
                  @input="patchFirstDataset({ title: ($event.target as HTMLInputElement).value })"
                />
                <select
                  id="fw-dataset-personal"
                  class="canvas-fw-input"
                  :value="personalDataAnswer"
                  @change="setPersonalDataAnswer(($event.target as HTMLSelectElement).value)"
                >
                  <option value="">Contains personal data?</option>
                  <option value="yes">Yes — contains personal data</option>
                  <option value="no">No personal data</option>
                </select>
              </div>
              <template v-if="!isEmptyDataAccess(summary.dataAccess)">
                <p><strong>{{ summary.dataAccess.datasetCount }}</strong> datasets</p>
                <div v-if="Object.keys(summary.dataAccess.accessRightsSummary).length" class="text-xs">
                  <p v-for="(count, ar) in summary.dataAccess.accessRightsSummary" :key="ar">{{ ar }}: {{ count }}</p>
                </div>
                <div v-if="summary.dataAccess.sensitivitySummary.length" class="flex flex-wrap gap-1 text-xs">
                  <span v-for="s in summary.dataAccess.sensitivitySummary" :key="s" class="text-gray-600">{{ s }}</span>
                </div>
              </template>
              <p v-else-if="!showDataAccessStrip" class="italic text-gray-400">Not specified</p>
            </div>
          </div>
        </div>

        <!-- Right column: 1/2 + 1/2 -->
        <div class="canvas-bmc-col flex flex-col">
          <div class="canvas-bmc-block flex-1 border-b-2 border-black px-4 pt-2 pb-4">
            <h4 class="canvas-bmc-block-title flex flex-wrap items-center gap-2 text-gray-900">
              <button type="button" class="canvas-bmc-block-title-link" @click="requestSection('developer-feasibility')">
                Developer Feasibility
              </button>
              <button
                type="button"
                class="canvas-fw-chip"
                :class="{ 'canvas-fw-chip--done': fwProgress.feasibility }"
                @click="toggleFwEdit('feasibility')"
              >
                <template v-if="fwProgress.feasibility">essentials ✓</template>
                <template v-else>essentials — risk gut-check</template>
              </button>
              <CanvasBlockIcon name="feasibility" />
            </h4>
            <div class="canvas-bmc-content text-sm text-gray-800 space-y-1.5">
              <div v-if="showFeasibilityStrip" class="canvas-fw-strip" @focusout="onStripFocusOut('feasibility', $event)">
                <label class="canvas-fw-label" for="fw-feasibility-risk">Overall technical risk — how risky does this feel?</label>
                <select
                  id="fw-feasibility-risk"
                  class="canvas-fw-input"
                  :value="canvasData.developerFeasibility?.technicalRisk || ''"
                  @change="setTechnicalRisk(($event.target as HTMLSelectElement).value)"
                >
                  <option value="">Select risk level…</option>
                  <option value="low">Low — mature tech, clear path</option>
                  <option value="medium">Medium — some unknowns</option>
                  <option value="high">High — significant unknowns</option>
                  <option value="critical">Critical — unproven approach</option>
                </select>
              </div>
              <div v-if="summary.developerFeasibility.trlCurrent !== null || summary.developerFeasibility.trlTarget !== null">
                <span>TRL</span>
                <span v-if="summary.developerFeasibility.trlCurrent !== null">
                  {{ summary.developerFeasibility.trlCurrent }}
                  <span v-if="summary.developerFeasibility.trlTarget !== null">→ {{ summary.developerFeasibility.trlTarget }}</span>
                </span>
                <span v-else-if="summary.developerFeasibility.trlTarget !== null">target {{ summary.developerFeasibility.trlTarget }}</span>
              </div>
              <p v-if="summary.developerFeasibility.technicalRisk && !showFeasibilityStrip">Risk: <span class="capitalize">{{ summary.developerFeasibility.technicalRisk }}</span></p>
              <p v-if="summary.developerFeasibility.effortEstimate">Effort: {{ summary.developerFeasibility.effortEstimate }}</p>
              <p v-if="summary.developerFeasibility.amortizationMonths !== null" class="text-xs">
                ~{{ summary.developerFeasibility.amortizationMonths!.toFixed(1) }} mo until amortization
              </p>
              <p v-if="Object.keys(summary.developerFeasibility.deploymentCostTotalsPerMonth).length > 0">
                Total deployment cost: {{ formatDeploymentCostSummary(summary.developerFeasibility.deploymentCostTotalsPerMonth) }}/mo
              </p>
              <p v-if="summary.developerFeasibility.feasibilityNotes">{{ summary.developerFeasibility.feasibilityNotes }}</p>
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
              <p v-if="isEmptyDeveloperFeasibility(summary.developerFeasibility) && summary.userExpectations.taskCount === 0 && !showFeasibilityStrip" class="italic text-gray-400">Not specified</p>
            </div>
          </div>
          <div class="canvas-bmc-block flex-1 px-4 pt-2 pb-4">
            <h4 class="canvas-bmc-block-title flex flex-wrap items-center gap-2 text-gray-900">
              <button type="button" class="canvas-bmc-block-title-link" @click="requestSection('outcomes')">
                Outcomes
              </button>
              <button
                type="button"
                class="canvas-fw-chip"
                :class="{ 'canvas-fw-chip--done': fwProgress.outcomes }"
                @click="toggleFwEdit('outcomes')"
              >
                <template v-if="fwProgress.outcomes">essentials ✓</template>
                <template v-else>essentials — main deliverable</template>
              </button>
              <CanvasBlockIcon name="outcomes" />
            </h4>
            <div class="canvas-bmc-content text-sm text-gray-800 space-y-2">
              <div v-if="showOutcomesStrip" class="canvas-fw-strip" @focusout="onStripFocusOut('outcomes', $event)">
                <label class="canvas-fw-label" for="fw-deliverable-title">Main deliverable — what will exist at the end?</label>
                <input
                  id="fw-deliverable-title"
                  class="canvas-fw-input"
                  type="text"
                  placeholder="e.g. Triage dashboard"
                  :value="firstDeliverable?.title || ''"
                  @input="patchFirstDeliverable({ title: ($event.target as HTMLInputElement).value })"
                />
                <input
                  id="fw-deliverable-type"
                  class="canvas-fw-input"
                  type="text"
                  placeholder="Type — e.g. Software, Report, Dataset"
                  :value="firstDeliverable?.type || ''"
                  @input="patchFirstDeliverable({ type: ($event.target as HTMLInputElement).value })"
                />
              </div>
              <template v-if="!isEmptyOutcomes(summary.outcomes)">
                <template v-if="visibleDeliverables.length">
                  <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {{ summary.outcomes.deliverableCount }} {{ summary.outcomes.deliverableCount === 1 ? 'deliverable' : 'deliverables' }}
                  </p>
                  <ul class="list-none space-y-0.5 text-xs">
                    <li v-for="(d, i) in visibleDeliverables" :key="'d-' + i">
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
              <p v-else-if="!showOutcomesStrip" class="italic text-gray-400">Not specified</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="canvas-bmc-footer flex flex-wrap items-center justify-between gap-4 px-5 py-2 border-t-2 border-black text-xs text-gray-500">
        <span>
          Date: {{ canvasData.project?.versionDate || canvasData.versionDate || canvasData.project?.startDate || today }} · Version: {{ version }}
        </span>
        <span>
          Generated by the Agentic Automation Canvas · <a href="https://aac.slolab.ai" target="_blank" rel="noopener noreferrer" class="text-gray-600 hover:underline">https://aac.slolab.ai</a>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useCanvasData } from '@/composables/useCanvasData'
import { computeCanvasSummary, type CanvasSummaryData, isLink, parseUserStory } from '@/utils/canvasSummary'
import { computeFrameworkProgress } from '@/utils/frameworkProgress'
import { formatDeploymentCost } from '@/utils/deploymentCost'
import type { Dataset, Deliverable, Requirement } from '@/types/canvas'
import InfoTooltip from '../InfoTooltip.vue'
import CanvasBlockIcon from './CanvasBlockIcon.vue'

const {
  canvasData,
  requestSection,
  updateProject,
  updateUserExpectations,
  updateDeveloperFeasibility,
  updateDataAccess,
  updateOutcomes,
} = useCanvasData()

const summary = computed<CanvasSummaryData>(() => computeCanvasSummary(canvasData.value))
const today = new Date().toISOString().split('T')[0]
const version = computed(() => canvasData.value.project?.version || canvasData.value.version || '0.1.0')

// ── Essentials strips: the six loose entry boxes, one subset field group per block ──

const fwProgress = computed(() => computeFrameworkProgress(canvasData.value))

type FwBlock = 'project' | 'tasks' | 'feasibility' | 'dataAccess' | 'outcomes'
const blockComplete = computed<Record<FwBlock, boolean>>(() => ({
  project: fwProgress.value.summary && fwProgress.value.benefit,
  tasks: fwProgress.value.tasks,
  feasibility: fwProgress.value.feasibility,
  dataAccess: fwProgress.value.dataAccess,
  outcomes: fwProgress.value.outcomes,
}))

// Strips start open where the box is incomplete. Completing a box must NOT
// collapse its strip by itself — the first keystroke of the last field would
// close the editor mid-typing. A complete strip collapses when focus leaves
// its block, or from its chip (guide, don't force).
const fwEdit = ref<Record<FwBlock, boolean>>({
  project: !blockComplete.value.project,
  tasks: !blockComplete.value.tasks,
  feasibility: !blockComplete.value.feasibility,
  dataAccess: !blockComplete.value.dataAccess,
  outcomes: !blockComplete.value.outcomes,
})

function toggleFwEdit(block: FwBlock) {
  fwEdit.value[block] = !fwEdit.value[block]
}

// A box edited back to incomplete (e.g. its title cleared) reopens its strip
watch(blockComplete, (now, prev) => {
  for (const block of Object.keys(now) as FwBlock[]) {
    if (prev[block] && !now[block]) fwEdit.value[block] = true
  }
})

function onStripFocusOut(block: FwBlock, event: FocusEvent) {
  const strip = event.currentTarget as HTMLElement
  const next = event.relatedTarget as HTMLElement | null
  // focus moved within this block (another strip field, the chip, the title) → keep editing
  if (next && strip.closest('.canvas-bmc-block')?.contains(next)) return
  if (blockComplete.value[block]) fwEdit.value[block] = false
}

const showProjectStrip = computed(() => fwEdit.value.project)
const showTasksStrip = computed(() => fwEdit.value.tasks)
const showFeasibilityStrip = computed(() => fwEdit.value.feasibility)
const showDataAccessStrip = computed(() => fwEdit.value.dataAccess)
const showOutcomesStrip = computed(() => fwEdit.value.outcomes)

const firstTask = computed<Requirement | undefined>(() => canvasData.value.userExpectations?.requirements?.[0])
const firstDataset = computed<Dataset | undefined>(() => canvasData.value.dataAccess?.datasets?.[0])
const firstDeliverable = computed<Deliverable | undefined>(() => canvasData.value.outcomes?.deliverables?.[0])

// Hide the first item from the rendered lists while its strip edits it (avoids double display)
const visibleTasks = computed(() =>
  showTasksStrip.value ? summary.value.userExpectations.tasks.slice(1) : summary.value.userExpectations.tasks
)
const visibleDeliverables = computed(() =>
  showOutcomesStrip.value ? summary.value.outcomes.deliverables.slice(1) : summary.value.outcomes.deliverables
)

function patchFirstTask(patch: Partial<Requirement>) {
  const requirements = canvasData.value.userExpectations?.requirements || []
  if (requirements.length === 0) {
    updateUserExpectations({ requirements: [{ id: `req-${Date.now()}`, title: '', benefits: [], ...patch }] })
  } else {
    const updated = [...requirements]
    updated[0] = { ...updated[0], ...patch }
    updateUserExpectations({ requirements: updated })
  }
}

function setTechnicalRisk(value: string) {
  updateDeveloperFeasibility({
    technicalRisk: (value || undefined) as 'low' | 'medium' | 'high' | 'critical' | undefined,
  })
}

function patchFirstDataset(patch: Partial<Dataset>) {
  const datasets = canvasData.value.dataAccess?.datasets || []
  if (datasets.length === 0) {
    updateDataAccess({ datasets: [{ id: `dataset-${Date.now()}`, title: '', ...patch }] })
  } else {
    const updated = [...datasets]
    updated[0] = { ...updated[0], ...patch }
    updateDataAccess({ datasets: updated })
  }
}

const personalDataAnswer = computed(() => {
  const value = firstDataset.value?.containsPersonalData
  if (value === true) return 'yes'
  if (value === false) return 'no'
  return ''
})

function setPersonalDataAnswer(answer: string) {
  patchFirstDataset({ containsPersonalData: answer === '' ? undefined : answer === 'yes' })
}

function patchFirstDeliverable(patch: Partial<Deliverable>) {
  const deliverables = canvasData.value.outcomes?.deliverables || []
  if (deliverables.length === 0) {
    updateOutcomes({ deliverables: [{ id: `deliverable-${Date.now()}`, title: '', type: '', ...patch }] })
  } else {
    const updated = [...deliverables]
    updated[0] = { ...updated[0], ...patch }
    updateOutcomes({ deliverables: updated })
  }
}

const feasibilityProgress = computed(() => {
  const n = summary.value.developerFeasibility.tasksWithDedicatedFeasibility.length
  const total = summary.value.userExpectations.taskCount
  if (total === 0) return 0
  return Math.round((n / total) * 100)
})

function formatDeploymentCostSummary(totals: Record<string, number>): string {
  const entries = Object.entries(totals).filter(([, amount]) => amount > 0)
  if (entries.length === 0) return ''
  return entries.map(([currency, amount]) => formatDeploymentCost(amount, currency)).join(' + ')
}

function isEmptyUserExpectations(u: CanvasSummaryData['userExpectations']): boolean {
  return u.taskCount === 0 && Object.keys(u.benefitTypeCounts).length === 0 && u.tasks.length === 0
}

function isEmptyDeveloperFeasibility(d: CanvasSummaryData['developerFeasibility']): boolean {
  const hasDeploymentCost = Object.keys(d.deploymentCostTotalsPerMonth).length > 0
  return (
    d.trlCurrent === null &&
    d.trlTarget === null &&
    !d.technicalRisk &&
    !d.effortEstimate &&
    d.amortizationMonths === null &&
    !d.feasibilityNotes.trim() &&
    d.tasksWithDedicatedFeasibility.length === 0 &&
    !hasDeploymentCost
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

.canvas-bmc-block-title-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
  text-align: left;
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  color: inherit;
  text-transform: uppercase;
  cursor: pointer;
}
.canvas-bmc-block-title-link:hover {
  text-decoration: underline;
}

.canvas-benefit-tag {
  padding: 0.125rem 0.375rem;
  border: 1px solid black;
  font-size: 0.75rem;
  color: rgb(55 65 81);
  text-transform: capitalize;
  background: none;
  cursor: pointer;
}
.canvas-benefit-tag:hover {
  background: rgb(243 244 246);
}

.canvas-bmc-content {
  min-height: 4rem;
}

/* Subtly grey out other panels when hovering one (overlay avoids icon wiggle from opacity transitions) */
.canvas-bmc-block {
  position: relative;
}
.canvas-bmc-block::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.6);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease;
}
.canvas-bmc-wrapper:has(.canvas-bmc-block:hover) .canvas-bmc-block:not(:hover)::after {
  opacity: 1;
}

.canvas-feasibility-bar {
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.15);
}

.canvas-feasibility-fill {
  background: linear-gradient(180deg, #374151 0%, #1f2937 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* Essentials strips: seamless inputs for the loose entry level */
.canvas-fw-chip {
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  padding: 0.1rem 0.5rem;
  border: 1px solid rgb(209 213 219);
  border-radius: 9999px;
  color: rgb(107 114 128);
  background: rgb(249 250 251);
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  /* chips live inside the uppercase block-title h4 */
  text-transform: none;
}
.canvas-fw-chip:hover {
  border-color: rgb(14 165 233);
  color: rgb(2 132 199);
}
.canvas-fw-chip--done {
  color: rgb(21 128 61);
  border-color: rgb(187 247 208);
  background: rgb(240 253 244);
}
.canvas-fw-strip {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin-bottom: 0.625rem;
}
.canvas-fw-label {
  font-size: 0.625rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgb(107 114 128);
  font-weight: 600;
}
.canvas-fw-input {
  width: 100%;
  font-size: 0.8125rem;
  padding: 0.3rem 0.45rem;
  border: 1px dashed rgb(203 213 225);
  border-radius: 0.25rem;
  background: rgb(249 250 251);
  color: rgb(17 24 39);
}
.canvas-fw-input::placeholder {
  color: rgb(156 163 175);
  font-style: italic;
}
.canvas-fw-input:focus {
  outline: none;
  border-style: solid;
  border-color: rgb(14 165 233);
  background: white;
  box-shadow: 0 0 0 1px rgb(14 165 233 / 0.3);
}

@media print {
  .canvas-fw-chip,
  .canvas-fw-strip {
    display: none;
  }
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
