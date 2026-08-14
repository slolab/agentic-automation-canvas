<template>
  <div class="canvas-shell">
    <header class="canvas-project-bar">
      <div class="min-w-0 flex-1">
        <label id="project-title-label" for="simplified-project-title" class="canvas-project-label">
          Project title
        </label>
        <input
          id="simplified-project-title"
          type="text"
          class="canvas-project-input"
          placeholder="Untitled project"
          :value="canvasData.project.title"
          @input="updateProjectTitle"
        />
      </div>
    </header>

    <div class="canvas-board" aria-label="Simplified Agentic Automation Canvas">
      <section class="canvas-cell canvas-cell-problem" aria-labelledby="problem-heading">
        <div class="simplified-card-heading canvas-accent-problem">
          <span class="simplified-card-number">1</span>
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-2">
              <h3 id="problem-heading" class="simplified-card-title">Problem</h3>
              <button type="button" class="canvas-guidance-button" aria-label="Open guidance for Problem" @click="openTopic('problem', $event)">
                <InfoIcon />
              </button>
            </div>
            <p class="simplified-card-description">Ground the proposal in a real, recurring problem before discussing a solution.</p>
          </div>
        </div>

        <div class="grid gap-y-2">
          <div>
            <label for="problem-description" class="canvas-label">Problem description</label>
            <textarea
              id="problem-description"
              rows="3"
              class="canvas-input canvas-textarea"
              placeholder="What frictions/problem do you want to solve, and what are the consequences?"
              :value="canvasData.project.description"
              @input="updateProjectText('description', $event)"
            />
          </div>

          <div>
            <label for="problem-audience" class="canvas-label">Who experiences this problem?</label>
            <input
              id="problem-audience"
              type="text"
              class="canvas-input"
              placeholder="For example: clinical staff triaging referrals"
              :value="primaryRequirement?.targetPopulation ?? ''"
              @input="updateTargetPopulation"
            />
          </div>

          <div>
            <label for="problem-frequency" class="canvas-label">How often do you experience this problem?</label>
            <select
              id="problem-frequency"
              class="canvas-input canvas-select"
              :value="canvasData.project.problemFrequency ?? ''"
              @change="updateProblemFrequency"
            >
              <option value="">Select a rough frequency</option>
              <option v-for="option in frequencyOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>

          <div>
            <div class="flex flex-wrap items-end justify-between gap-2">
              <div>
                <label for="problem-example-0" class="canvas-label">Most recent concrete case</label>
              </div>
              <button
                type="button"
                class="canvas-add-button"
                @click="addProblemExample"
              >
                + example
              </button>
            </div>
            <div class="space-y-1">
              <div v-for="(example, index) in problemExampleRows" :key="index" class="flex items-start gap-2">
                <textarea
                  :id="`problem-example-${index}`"
                  rows="3"
                  class="canvas-input canvas-textarea"
                  :aria-label="`Problem example ${index + 1}`"
                  :placeholder="index === 0 ? 'Describe what happened in the most recent case' : 'Describe another concrete case'"
                  :value="example"
                  @input="updateProblemExample(index, $event)"
                />
                <button
                  v-if="problemExampleRows.length > 1 || example"
                  type="button"
                  class="canvas-remove-button"
                  :aria-label="`Remove problem example ${index + 1}`"
                  @click="removeProblemExample(index)"
                >
                  <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M8 2a1 1 0 0 0-.9.55L6.38 4H3a1 1 0 1 0 0 2h.29l.85 10.2A2 2 0 0 0 6.13 18h7.74a2 2 0 0 0 1.99-1.8L16.71 6H17a1 1 0 1 0 0-2h-3.38l-.72-1.45A1 1 0 0 0 12 2H8Zm1.62 2h.76l.5 1H9.12l.5-1ZM6.15 6l.83 10h6.04l.83-10h-7.7Z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="canvas-cell canvas-cell-change" aria-labelledby="change-heading">
        <div class="simplified-card-heading canvas-accent-change">
          <span class="simplified-card-number">2</span>
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-2">
              <h3 id="change-heading" class="simplified-card-title">Change and Value</h3>
              <button type="button" class="canvas-guidance-button" aria-label="Open guidance for Change and Value" @click="openTopic('change-value', $event)">
                <InfoIcon />
              </button>
            </div>
            <p class="simplified-card-description">Which behaviour should change and how do we measure value?</p>
          </div>
        </div>

        <div class="space-y-2">
          <div>
            <label for="desired-change" class="canvas-label">What should happen differently?</label>
            <textarea
              id="desired-change"
              rows="3"
              class="canvas-input canvas-textarea"
              placeholder="Describe the changed outcome or way of working"
              :value="canvasData.project.objective ?? ''"
              @input="updateProjectText('objective', $event)"
            />
          </div>

          <div>
            <label for="why-now" class="canvas-label">Why is this important right now?</label>
            <textarea
              id="why-now"
              rows="3"
              class="canvas-input canvas-textarea"
              placeholder="What makes this worth addressing now?"
              :value="canvasData.project.headlineValue ?? ''"
              @input="updateProjectText('headlineValue', $event)"
            />
          </div>

          <div>
            <label for="expected-benefits" class="canvas-label">Expected benefits</label>
            <TagEntryInput
              id="expected-benefits"
              v-model="benefitDescriptions"
              placeholder="Type a benefit and press Enter"
              item-label="benefits"
              described-by="expected-benefits-help"
              compact
            />
            <p id="expected-benefits-help" class="sr-only">Keep each item brief. You can classify and quantify it later.</p>
          </div>

          <div>
            <label for="success-metrics" class="canvas-label">How will you know it worked?</label>
            <TagEntryInput
              id="success-metrics"
              v-model="successMetrics"
              placeholder="Type a success measure and press Enter"
              item-label="metrics"
              described-by="success-metrics-help"
              compact
            />
            <p id="success-metrics-help" class="sr-only">Name the evidence first; baseline, target, and unit can be added later.</p>
          </div>
        </div>
      </section>

      <section class="canvas-cell canvas-cell-solutions" aria-labelledby="solutions-heading">
        <div class="simplified-card-heading canvas-accent-solutions">
          <span class="simplified-card-number">3</span>
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-2">
              <h3 id="solutions-heading" class="simplified-card-title">Solutions</h3>
              <button type="button" class="canvas-guidance-button" aria-label="Open guidance for Solutions" @click="openTopic('solutions', $event)">
                <InfoIcon />
              </button>
            </div>
            <p class="simplified-card-description">Explore where agentic behaviour may help, then research what already exists.</p>
          </div>
        </div>

        <div class="space-y-2">
          <div>
            <label for="previous-attempts" class="canvas-label">What has been tried, and what happened?</label>
            <textarea
              id="previous-attempts"
              rows="3"
              class="canvas-input canvas-textarea"
              placeholder="Include manual workarounds, tools, pilots, and what was learned"
              :value="canvasData.developerFeasibility?.feasibilityNotes ?? ''"
              @input="updateDeveloperText('feasibilityNotes', $event)"
            />
          </div>

          <fieldset id="solution-approaches">
            <legend class="canvas-label">Potential Approaches</legend>
            <div class="grid grid-cols-2 gap-x-2 gap-y-1">
              <label v-for="option in approachOptions" :key="option.value" class="canvas-check">
                <input
                  type="checkbox"
                  class="form-checkbox-small"
                  :checked="selectedApproaches.includes(option.value)"
                  @change="toggleApproach(option.value, $event)"
                />
                <span>{{ option.label }}</span>
              </label>
            </div>
          </fieldset>

          <div v-if="selectedApproaches.includes('other') || customApproaches.length > 0">
            <label for="custom-approaches" class="canvas-label">Other Potential Approaches</label>
            <TagEntryInput
              id="custom-approaches"
              v-model="customApproaches"
              placeholder="Type an approach and press Enter"
              item-label="approaches"
              :disabled="!selectedApproaches.includes('other')"
              compact
            />
            <p v-if="!selectedApproaches.includes('other')" class="mt-1 text-[0.65rem] leading-4 text-gray-500">
              Select Other to edit these saved approaches.
            </p>
          </div>

          <div>
            <label for="solutions-research" class="canvas-label">Tools or existing solutions (please research)</label>
            <textarea
              id="solutions-research"
              rows="3"
              class="canvas-input canvas-textarea"
              placeholder="Products, services, internal tools, or comparable solutions to investigate"
              :value="canvasData.developerFeasibility?.solutionsToResearch ?? ''"
              @input="updateDeveloperText('solutionsToResearch', $event)"
            />
          </div>
        </div>
      </section>

      <section class="canvas-cell canvas-cell-reality" aria-labelledby="reality-heading">
        <div class="simplified-card-heading canvas-accent-reality">
          <span class="simplified-card-number">4</span>
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-2">
              <h3 id="reality-heading" class="simplified-card-title">Development Reality</h3>
              <button type="button" class="canvas-guidance-button" aria-label="Open guidance for Development Reality" @click="openTopic('development-reality', $event)">
                <InfoIcon />
              </button>
            </div>
            <p class="simplified-card-description">Flag constraints that need deeper investigation and check whether somebody can own the work.</p>
          </div>
        </div>

        <fieldset>
          <legend class="canvas-label">Constraints to investigate</legend>
          <div class="grid grid-cols-2 gap-x-3 gap-y-1 2xl:grid-cols-3">
            <label v-for="option in constraintOptions" :key="option.value" class="canvas-check">
              <input
                type="checkbox"
                class="form-checkbox-small mt-0.5"
                :checked="selectedConstraints.includes(option.value)"
                @change="toggleConstraint(option.value, $event)"
              />
              <span>{{ option.label }}</span>
            </label>
          </div>
        </fieldset>

        <div v-if="selectedConstraints.includes('other') || customConstraints.length > 0" class="mt-2">
          <label for="custom-constraints" class="canvas-label">Other constraints</label>
          <TagEntryInput
            id="custom-constraints"
            v-model="customConstraints"
            placeholder="Type a constraint and press Enter"
            item-label="constraints"
            :disabled="!selectedConstraints.includes('other')"
            compact
          />
          <p v-if="!selectedConstraints.includes('other')" class="mt-1 text-[0.65rem] leading-4 text-gray-500">
            Select Other to edit these saved constraints.
          </p>
        </div>

        <div class="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
          <div>
            <label for="build-team-status" class="canvas-label">Team available to build?</label>
            <select
              id="build-team-status"
              class="canvas-input canvas-select"
              :value="canvasData.governance?.buildTeamStatus ?? ''"
              @change="updateTeamStatus('buildTeamStatus', $event)"
            >
              <option value="">Not answered</option>
              <option v-for="option in teamStatusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
          </div>
          <div>
            <label for="maintenance-status" class="canvas-label">Owner available to maintain long-term?</label>
            <select
              id="maintenance-status"
              class="canvas-input canvas-select"
              :value="canvasData.governance?.maintenanceOwnerStatus ?? ''"
              @change="updateTeamStatus('maintenanceOwnerStatus', $event)"
            >
              <option value="">Not answered</option>
              <option v-for="option in teamStatusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
          </div>
        </div>
      </section>

      <section class="canvas-cell canvas-cell-milestone" aria-labelledby="milestone-heading">
        <div class="simplified-card-heading canvas-accent-milestone">
          <span class="simplified-card-number">5</span>
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-2">
              <h3 id="milestone-heading" class="simplified-card-title">First Milestone</h3>
              <button type="button" class="canvas-guidance-button" aria-label="Open guidance for First Milestone" @click="openTopic('first-milestone', $event)">
                <InfoIcon />
              </button>
            </div>
            <p class="simplified-card-description">Define the first bounded result and the evidence that will prove it is complete.</p>
          </div>
        </div>

        <div class="grid gap-3">
          <div>
            <label for="first-milestone" class="canvas-label">What is the first milestone?</label>
            <textarea
              id="first-milestone"
              rows="3"
              class="canvas-input canvas-textarea canvas-milestone-input"
              placeholder="Describe one bounded result, not the whole project"
              :value="firstMilestone?.description ?? ''"
              @input="updateMilestoneText('description', $event)"
            />
          </div>
          <div>
            <label for="milestone-kpi" class="canvas-label">How will we know it is complete?</label>
            <textarea
              id="milestone-kpi"
              rows="3"
              class="canvas-input canvas-textarea canvas-milestone-input"
              placeholder="State an observable completion criterion"
              :value="firstMilestone?.kpi ?? ''"
              @input="updateMilestoneText('kpi', $event)"
            />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="first-stage-start-date" class="canvas-label">When can this stage begin?</label>
              <input
                id="first-stage-start-date"
                type="date"
                class="canvas-input"
                :value="firstStage?.startDate ?? ''"
                :max="firstStage?.endDate"
                @input="updateStageDate('startDate', $event)"
              />
            </div>
            <div>
              <label for="first-stage-end-date" class="canvas-label">Target date for this stage</label>
              <input
                id="first-stage-end-date"
                type="date"
                class="canvas-input"
                :value="firstStage?.endDate ?? ''"
                :min="firstStage?.startDate"
                @input="updateStageDate('endDate', $event)"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import TagEntryInput from '@/components/TagEntryInput.vue'
import InfoIcon from '@/components/InfoIcon.vue'
import { useCanvasData } from '@/composables/useCanvasData'
import { useGuidance, type GuidanceTopic } from '@/composables/useGuidance'
import {
  approachOptions,
  constraintOptions,
  frequencyOptions,
  suggestedConstraintValues,
  teamStatusOptions,
  type ConstraintFlag,
  type ProblemFrequency,
  type TeamStatus,
  type TechnicalApproach,
} from '@/schema/simplifiedCanvasOptions'

type ProjectTextField = 'description' | 'objective' | 'headlineValue'
type DeveloperTextField = 'feasibilityNotes' | 'solutionsToResearch'
type TeamStatusField =
  | 'buildTeamStatus'
  | 'maintenanceOwnerStatus'

const {
  canvasData,
  updateProject,
  updateDeveloperFeasibility,
  updateGovernance,
  applyDatasetConstraintToggle,
  patchPrimaryRequirement,
  replacePrimaryUnclassifiedBenefits,
  patchFirstStageMilestone,
  patchFirstStage,
} = useCanvasData()
const { openGuidance } = useGuidance()

function openTopic(topic: GuidanceTopic, event: Event) {
  openGuidance(topic, event.currentTarget as HTMLElement)
}

const primaryRequirement = computed(
  () => canvasData.value.userExpectations?.requirements?.[0],
)

const benefitDescriptions = computed<string[]>({
  get: () => (primaryRequirement.value?.benefits ?? [])
    .filter((benefit) => benefit.benefitType === 'unclassified' && benefit.description)
    .map((benefit) => benefit.description!),
  set: (values) => replacePrimaryUnclassifiedBenefits('description', values),
})

const successMetrics = computed<string[]>({
  get: () => (primaryRequirement.value?.benefits ?? [])
    .filter((benefit) => benefit.benefitType === 'unclassified' && benefit.metricLabel)
    .map((benefit) => benefit.metricLabel!),
  set: (values) => replacePrimaryUnclassifiedBenefits('metricLabel', values),
})

const selectedApproaches = computed(
  () => primaryRequirement.value?.feasibility?.technologyApproach?.approaches ?? [],
)

const customApproaches = computed<string[]>({
  get: () => [...(primaryRequirement.value?.feasibility?.technologyApproach?.customApproaches ?? [])],
  set: (values) => updateTechnologyApproach({
    customApproaches: values.length > 0 ? values : undefined,
  }),
})

const selectedConstraints = computed(
  () => (canvasData.value.developerFeasibility?.constraintFlags ?? [])
    .filter((value) => suggestedConstraintValues.includes(value)),
)

const customConstraints = computed<string[]>({
  get: () => (canvasData.value.developerFeasibility?.constraintFlags ?? [])
    .filter((value) => !suggestedConstraintValues.includes(value)),
  set: (values) => updateDeveloperFeasibility({
    constraintFlags: [...selectedConstraints.value, ...values],
  }),
})

const firstStage = computed(
  () => canvasData.value.governance?.stages?.[0],
)

const firstMilestone = computed(
  () => firstStage.value?.milestones?.[0],
)

const problemExampleRows = ref<string[]>(
  canvasData.value.project.problemExamples?.length
    ? [...canvasData.value.project.problemExamples]
    : [''],
)

watch(
  () => canvasData.value.project.problemExamples,
  (examples) => {
    const canonical = examples ?? []
    const localNonEmpty = problemExampleRows.value.filter((value) => value.trim().length > 0)
    const reflectsLocalEdit = (
      canonical.length === localNonEmpty.length
      && canonical.every((value, index) => value === localNonEmpty[index])
    )
    if (reflectsLocalEdit) return
    problemExampleRows.value = canonical.length > 0 ? [...canonical] : ['']
  },
  { deep: true },
)

function eventValue(event: Event): string {
  return (event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value
}

function updateProjectTitle(event: Event) {
  updateProject({ title: eventValue(event) })
}

function updateProjectText(field: ProjectTextField, event: Event) {
  updateProject({ [field]: eventValue(event) })
}

function updateDeveloperText(field: DeveloperTextField, event: Event) {
  updateDeveloperFeasibility({ [field]: eventValue(event) })
}

function updateTargetPopulation(event: Event) {
  patchPrimaryRequirement({ targetPopulation: eventValue(event) })
}

function updateProblemFrequency(event: Event) {
  const value = eventValue(event) as ProblemFrequency | ''
  updateProject({ problemFrequency: value || undefined })
}

function updateProblemExample(index: number, event: Event) {
  while (problemExampleRows.value.length <= index) problemExampleRows.value.push('')
  problemExampleRows.value[index] = eventValue(event)
  const nonEmpty = problemExampleRows.value.filter((value) => value.trim().length > 0)
  updateProject({ problemExamples: nonEmpty.length > 0 ? nonEmpty : undefined })
}

function addProblemExample() {
  problemExampleRows.value.push('')
}

function removeProblemExample(index: number) {
  problemExampleRows.value.splice(index, 1)
  if (problemExampleRows.value.length === 0) problemExampleRows.value.push('')
  const nonEmpty = problemExampleRows.value.filter((value) => value.trim().length > 0)
  updateProject({ problemExamples: nonEmpty.length > 0 ? nonEmpty : undefined })
}

function toggleApproach(value: TechnicalApproach, event: Event) {
  const checked = (event.target as HTMLInputElement).checked
  const approaches = checked
    ? [...new Set([...selectedApproaches.value, value])]
    : selectedApproaches.value.filter((candidate) => candidate !== value)
  updateTechnologyApproach({ approaches })
}

function updateTechnologyApproach(
  updates: {
    approaches?: TechnicalApproach[]
    customApproaches?: string[]
  },
) {
  const feasibility = primaryRequirement.value?.feasibility ?? {}
  patchPrimaryRequirement({
    feasibility: {
      ...feasibility,
      technologyApproach: {
        ...(feasibility.technologyApproach ?? {}),
        ...updates,
      },
    },
  })
}

function toggleConstraint(value: ConstraintFlag, event: Event) {
  const checked = (event.target as HTMLInputElement).checked
  const constraintFlags = checked
    ? [...new Set([...selectedConstraints.value, value])]
    : selectedConstraints.value.filter((candidate) => candidate !== value)
  updateDeveloperFeasibility({ constraintFlags: [...constraintFlags, ...customConstraints.value] })
  applyDatasetConstraintToggle({ flag: value, checked, flags: constraintFlags })
}

function updateTeamStatus(field: TeamStatusField, event: Event) {
  const value = eventValue(event) as TeamStatus | ''
  updateGovernance({ [field]: value || undefined })
}

function updateMilestoneText(field: 'description' | 'kpi', event: Event) {
  patchFirstStageMilestone({ [field]: eventValue(event) })
}

function updateStageDate(field: 'startDate' | 'endDate', event: Event) {
  patchFirstStage({ [field]: eventValue(event) || undefined })
}
</script>

<style scoped>
.canvas-shell {
  @apply mx-auto max-w-[1800px];
}

.canvas-project-bar {
  @apply mb-3 flex items-end justify-between gap-6 border-b-2 border-gray-900 pb-2;
}

.canvas-project-label {
  @apply block text-[0.65rem] font-bold uppercase tracking-[0.16em] text-gray-500;
}

.canvas-project-input {
  @apply block w-full rounded-sm border-0 bg-transparent p-0 text-2xl font-bold tracking-tight text-gray-950 placeholder-gray-300 outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2;
}

.canvas-board {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-template-rows: minmax(0, 56fr) minmax(0, 44fr);
  grid-template-areas:
    'problem change solutions'
    'reality reality milestone';
  height: clamp(32rem, calc(100vh - 9.5rem), 58rem);
  min-height: 0;
  border: 3px solid rgb(17 24 39);
  background: rgb(17 24 39);
  gap: 2px;
}

.canvas-cell {
  @apply min-h-0 overflow-auto bg-white p-3 pb-1;
}

.canvas-cell-problem { grid-area: problem; }
.canvas-cell-change { grid-area: change; }
.canvas-cell-solutions { grid-area: solutions; }
.canvas-cell-reality { grid-area: reality; }
.canvas-cell-milestone { grid-area: milestone; }

.simplified-card-heading {
  @apply -mx-3 -mt-3 mb-2 flex items-start gap-2 border-b border-gray-300 px-3 py-1.5;
}

.simplified-card-number {
  @apply inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-950 text-xs font-bold text-white;
}

.simplified-card-title {
  @apply text-sm font-extrabold uppercase tracking-[0.08em] text-gray-950;
}

.simplified-card-description {
  @apply mt-0.5 text-[0.68rem] leading-4 text-gray-600;
}

.canvas-guidance-button {
  @apply -mr-1 shrink-0 rounded p-1 text-gray-500 hover:bg-white/80 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-600;
}

.canvas-accent-problem { @apply bg-rose-50; }
.canvas-accent-change { @apply bg-emerald-50; }
.canvas-accent-solutions { @apply bg-violet-50; }
.canvas-accent-reality { @apply bg-amber-50; }
.canvas-accent-milestone { @apply bg-sky-50; }

.canvas-label {
  @apply mb-0.5 block text-[0.65rem] font-bold uppercase leading-4 tracking-[0.04em] text-gray-700;
}

.canvas-input {
  @apply block w-full border-0 border-b border-gray-300 bg-gray-50 px-2 py-1 text-xs leading-5 text-gray-900 placeholder-gray-400 outline-none transition;
  @apply hover:border-gray-500 focus:border-primary-600 focus:bg-primary-50 focus:ring-0;
  border-radius: 0;
}

.canvas-textarea {
  @apply resize-none;
}

.canvas-select {
  @apply appearance-none pr-6;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 16 16'%3E%3Cpath fill='%234b5563' d='M4.427 5.427l3.396 3.396a.25.25 0 00.354 0l3.396-3.396A.25.25 0 0011.396 5H4.604a.25.25 0 00-.177.427z'/%3E%3C/svg%3E");
  background-position: right 0.35rem center;
  background-repeat: no-repeat;
}

.canvas-check {
  @apply flex min-w-0 cursor-pointer items-start gap-1.5 text-[0.68rem] leading-4 text-gray-700;
}

.canvas-check:hover {
  @apply text-gray-950;
}

.canvas-add-button {
  @apply shrink-0 px-1.5 py-0.5 text-[0.65rem] font-bold text-primary-700 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500;
}

.canvas-remove-button {
  @apply mt-0.5 shrink-0 p-1 text-gray-400 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500;
}

.canvas-remove-button svg {
  @apply h-4 w-4;
}

.canvas-milestone-input {
  min-height: 3.25rem;
}

@media (max-width: 1279px) {
  .canvas-board {
    display: block;
    height: auto;
  }

  .canvas-cell {
    overflow: visible;
    border-bottom: 2px solid rgb(17 24 39);
  }

  .canvas-cell:last-child {
    border-bottom: 0;
  }
}
</style>
