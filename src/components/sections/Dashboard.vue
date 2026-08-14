<template>
  <div class="space-y-6">
    <div>
      <h2 class="section-header flex items-center gap-2">
        <span>Project Dashboard</span>
        <InfoTooltip
          content="<strong>What you see here:</strong> Visual overview of your project including time savings, workflow, and value metrics.<br/><br/><strong>Time Savings:</strong> Total time saved per month (sum of all tasks) and Net time saved (after subtracting oversight). These are calculated from task volume and time saved per unit.<br/><br/><strong>Workflow Visualization:</strong> Shows governance stages in sequence. Stages link to show project progression.<br/><br/><strong>Time Savings per Task:</strong> Progress bars show baseline (full bar), time saved (green), and oversight (grey). Net savings = saved - oversight.<br/><br/><strong>Value Distribution:</strong> Shows how many tasks deliver each value type (time, quality, risk, enablement)."
          position="top"
        />
      </h2>
      <p class="section-description">
        Overview of workflow, time savings, and value metrics for your automation project.
      </p>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 gap-4 mb-6" :class="summaryGridCols">
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 class="text-sm font-medium text-blue-900 mb-1">Total Time Saved</h3>
        <p class="text-2xl font-bold text-blue-700">{{ totalHoursSavedPerMonth }} hrs/month</p>
        <p class="text-xs text-blue-600 mt-1">{{ totalMinutesSavedPerMonth }} minutes/month</p>
      </div>
      <div class="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 class="text-sm font-medium text-green-900 mb-1">Net Time Saved</h3>
        <p class="text-2xl font-bold text-green-700">{{ netHoursSavedPerMonth }} hrs/month</p>
        <p class="text-xs text-green-600 mt-1">After oversight</p>
      </div>
      <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 class="text-sm font-medium text-purple-900 mb-1">Tasks</h3>
        <p class="text-2xl font-bold text-purple-700">{{ taskCount }}</p>
        <p class="text-xs text-purple-600 mt-1">Automation tasks</p>
      </div>
      <div v-if="hasDeploymentCosts" class="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h3 class="text-sm font-medium text-amber-900 mb-1">Deployment Cost</h3>
        <p class="text-2xl font-bold text-amber-700">{{ formatDeploymentCostSummary() }}</p>
        <p class="text-xs text-amber-600 mt-1">per month</p>
      </div>
    </div>

    <!-- Governance Timeline (Gantt-style) -->
    <div v-if="governanceStages.length > 0" class="bg-white border border-gray-200 rounded-lg p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Governance Timeline</h3>
      <div v-if="governanceTimeline && governanceTimeline.stages.length > 0" class="space-y-3">
        <!-- Timeline track -->
        <div
          class="relative w-full bg-gray-50 rounded-md border border-dashed border-gray-200 overflow-hidden"
          :style="{ height: governanceTimeline.height + 'px' }"
        >
          <!-- Stage bars -->
          <div
            v-for="stage in governanceTimeline.stages"
            :key="stage.id"
            class="absolute"
            :style="{
              left: stage.left + '%',
              width: stage.width + '%',
              top: (8 + stage.row * 44) + 'px'
            }"
          >
            <div
              class="rounded-md border text-xs px-2 py-1 shadow-sm flex items-center gap-2 bg-white"
              :class="getGovernanceStageChipClass(stage, stage.index)"
            >
              <span class="font-medium truncate max-w-[10rem] md:max-w-[14rem]">{{ stage.name }}</span>
            </div>
            <div class="mt-1 text-[10px] text-gray-500">
              <span v-if="stage.startDate">{{ formatDate(stage.startDate) }}</span>
              <span v-if="stage.startDate && stage.endDate"> → </span>
              <span v-if="stage.endDate">{{ formatDate(stage.endDate) }}</span>
            </div>
          </div>
          <!-- Bottom axis (in reserved area so chip date labels do not overlap) -->
          <div class="absolute left-0 right-0 bottom-6 h-px bg-gray-300" aria-hidden="true" />
          <div
            v-for="tick in governanceTimeline.axisTicks"
            :key="tick.left"
            class="absolute flex flex-col items-center text-[10px] text-gray-500"
            :style="{ left: tick.left + '%', bottom: '0.25rem', transform: 'translateX(-50%)' }"
          >
            <div class="w-px h-2 bg-gray-400 mb-0.5" />
            <div class="whitespace-nowrap">{{ tick.label }}</div>
          </div>
        </div>
      </div>
      <p v-else class="text-sm text-gray-500 italic">
        Add start and end dates to governance stages to see the timeline.
      </p>
    </div>

    <!-- Task Dependency Graph -->
    <div v-if="requirements.length > 0" class="bg-white border border-gray-200 rounded-lg p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Task Dependency Graph</h3>
        <div v-if="hasDependencies(requirements)" class="flex items-center gap-1">
          <button
            type="button"
            @click="zoomIn"
            class="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
            title="Zoom in"
            aria-label="Zoom in"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v12M6 12h12" />
            </svg>
          </button>
          <button
            type="button"
            @click="zoomOut"
            class="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
            title="Zoom out"
            aria-label="Zoom out"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 12h12" />
            </svg>
          </button>
          <button
            type="button"
            @click="resetZoom"
            class="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
            title="Fit to view"
            aria-label="Fit to view"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
            </svg>
          </button>
        </div>
      </div>
      <p v-if="!hasDependencies(requirements)" class="text-sm text-gray-500 italic mb-4">
        Add dependencies in task details to see workflow connections.
      </p>
      <div
        ref="zoomContainerRef"
        class="mermaid-zoom-container overflow-hidden min-h-[100px] bg-gray-50 rounded-lg relative select-none"
        :class="{ 'cursor-grab': !isPanning, 'cursor-grabbing': isPanning }"
        @mousedown="onMouseDown"
      >
        <div
          ref="mermaidContainerRef"
          class="mermaid-diagram p-4 origin-top-left"
          :style="{ transform: `translate(${panX}px, ${panY}px) scale(${zoom})` }"
        />
      </div>
    </div>

    <!-- Time Savings per Task -->
    <div v-if="requirements.length > 0" class="bg-white border border-gray-200 rounded-lg p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Time Savings per Task</h3>
      
      <!-- Effort Summary Cards (only show if there are tasks with effort estimates) -->
      <div v-if="tasksWithEffort.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div v-if="tasksWithEffort.length > 0" class="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 class="text-sm font-medium text-gray-900 mb-1">Total Effort</h3>
          <p class="text-2xl font-bold text-gray-700">{{ formatTotalEffort() }}</p>
          <p class="text-xs text-gray-600 mt-1">Sum of all task-level effort estimates</p>
        </div>
        <div v-if="tasksWithEffort.length > 0 && totalTimeSavedPersonHours > 0" class="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 class="text-sm font-medium text-green-900 mb-1">Time Benefits</h3>
          <p class="text-2xl font-bold text-green-700">{{ formatTimeSaved(totalTimeSavedPersonHours) }}/month</p>
          <p class="text-xs text-green-600 mt-1">Net time saved per month (other benefit types not shown)</p>
        </div>
        <div v-if="tasksWithEffort.length > 0 && totalAmortizationMonths !== null" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 class="text-sm font-medium text-blue-900 mb-1">Amortization Period</h3>
          <p class="text-2xl font-bold text-blue-700">{{ totalAmortizationMonths.toFixed(1) }} months</p>
          <p class="text-xs text-blue-600 mt-1">Months until effort amortizes</p>
        </div>
      </div>
      
      <div class="space-y-4">
        <div
          v-for="(req, index) in requirements"
          :key="req.id"
          class="border-l-4 pl-4"
          :class="getTaskBorderColor(index)"
        >
          <div class="flex items-start justify-between mb-2">
            <div class="flex-1">
              <div class="flex items-center gap-2 flex-wrap">
                <h4 class="font-medium text-gray-900">{{ req.title || `Task ${index + 1}` }}</h4>
                <span
                  v-if="getTaskFeasibilityRisk(req)"
                  :class="getFeasibilityRiskBadgeClass(getTaskFeasibilityRisk(req)!)"
                  class="px-2 py-0.5 rounded text-xs font-medium capitalize"
                >
                  {{ getTaskFeasibilityRisk(req) }}
                </span>
                <span v-if="getTaskFeasibilityEffort(req)" class="text-xs text-gray-500">
                  {{ getTaskFeasibilityEffort(req) }}
                </span>
                <!-- Benefit type badges -->
                <span
                  v-for="type in getBenefitTypes(req)"
                  :key="type"
                  :class="benefitTypeBadgeClass(type)"
                  class="px-2 py-0 rounded text-xs font-medium"
                >
                  {{ type.charAt(0).toUpperCase() + type.slice(1) }}
                </span>
              </div>
              <p v-if="req.unitOfWork" class="text-sm text-gray-600 mt-1">
                {{ req.unitOfWork }} ({{ req.volumePerMonth || 0 }}/month)
              </p>
            </div>
            <div class="text-right ml-4">
              <div v-if="getNetTimeSaved(req) > 0 || getTimeSavedMinutes(req) > 0" class="text-lg font-semibold text-green-700">
                {{ formatMinutes(getNetTimeSaved(req) * (req.volumePerMonth || 0)) }}
              </div>
              <div class="text-sm text-gray-500">
                Oversight: {{ formatMinutes(getOversightMinutesForReq(req)) }}
              </div>
              <div v-if="getTaskMonthlyCost(req)" class="text-sm text-amber-600 font-medium">
                {{ getTaskMonthlyCost(req) }}/mo
              </div>
            </div>
          </div>
          
          <div class="mt-2">
            <div class="flex items-center gap-2 text-xs text-gray-600">
              <span>Baseline:</span>
              <span class="font-medium">
                {{ formatMinutes(getBaselineMinutes(req) * (req.volumePerMonth || 0)) }}
              </span>
              <span class="mx-2">→</span>
              <template v-if="getOversightMinutesForReq(req) > 0">
                <span>Gross Saved:</span>
                <span class="font-medium">
                  {{ formatMinutes(getTimeSavedMinutes(req) * (req.volumePerMonth || 0)) }}
                </span>
                <span class="ml-2">→</span>
                <span>Net Saved:</span>
                <span class="font-medium text-green-700">
                  {{ formatMinutes(getNetTimeSaved(req) * (req.volumePerMonth || 0)) }}
                </span>
              </template>
              <template v-else>
                <span>Saved:</span>
                <span class="font-medium text-green-700">
                  {{ formatMinutes(getTimeSavedMinutes(req) * (req.volumePerMonth || 0)) }}
                </span>
              </template>
            </div>
            <!-- Progress bar: total bar = total savings, green = net savings, grey = oversight -->
            <div class="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden relative">
              <!-- Net savings bar (green) -->
              <div
                v-if="getNetSavingsPercentage(req) > 0"
                class="h-full bg-green-500 transition-all absolute left-0 top-0"
                :style="{ width: `${getNetSavingsPercentage(req)}%` }"
              />
              <!-- Oversight bar (grey, shows time lost to oversight) -->
              <div
                v-if="getOversightPercentage(req) > 0"
                class="h-full bg-gray-400 transition-all absolute top-0"
                :style="{ 
                  width: `${getOversightPercentage(req)}%`,
                  left: `${getNetSavingsPercentage(req)}%`
                }"
              />
            </div>
            
            <!-- Effort bar (only show if task has effort estimate) -->
            <div v-if="req.feasibility?.effortEstimate?.value !== undefined && req.feasibility.effortEstimate.value > 0" class="mt-3">
              <div class="flex items-center gap-2 text-xs text-gray-600 mb-1">
                <span>Development Effort:</span>
                <span class="font-medium text-purple-700">
                  {{ formatEffort(req.feasibility.effortEstimate) }}
                </span>
                <span v-if="getTimeSavedPersonHours(req) > 0 && getAmortizationMonths(req) !== null" class="ml-2 text-blue-600">
                  ({{ getAmortizationMonths(req)!.toFixed(1) }}mo until amortization)
                </span>
              </div>
              <!-- Effort bar: normalized to max effort across all tasks -->
              <div class="h-2 bg-gray-200 rounded-full overflow-hidden relative">
                <div
                  class="h-full bg-purple-500 transition-all absolute left-0 top-0"
                  :style="{ width: `${getEffortPercentage(req)}%` }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Value Type Breakdown -->
    <div v-if="valueTypeBreakdown.length > 0" class="bg-white border border-gray-200 rounded-lg p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Value Type Distribution</h3>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div
          v-for="item in valueTypeBreakdown"
          :key="item.type"
          class="text-center p-3 rounded-lg"
          :class="getValueTypeColor(item.type)"
        >
          <div class="text-2xl font-bold mb-1">{{ item.count }}</div>
          <div class="text-sm font-medium capitalize">{{ item.type }}</div>
          <div class="text-xs text-gray-600 mt-1">{{ item.percentage }}%</div>
        </div>
      </div>
    </div>

    <!-- Benefit display groups (from Project Definition) -->
    <div v-if="displayGroupsWithBenefits.length > 0" class="bg-white border border-gray-200 rounded-lg p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Display groups</h3>
      <p class="text-xs text-gray-500 mb-4">Groups of benefits (same metric) for display. Define in Project Definition.</p>
      <div class="space-y-4">
        <div
          v-for="group in displayGroupsWithBenefits"
          :key="group.id"
          class="border border-gray-200 rounded-lg p-4"
        >
          <h4 class="text-sm font-semibold text-gray-900 mb-2">
            Display group {{ group.id }}: {{ group.metricLabel }} — {{ group.aggregatedValueDisplay }} ({{ group.benefits.length }} benefit{{ group.benefits.length === 1 ? '' : 's' }})
          </h4>
          <ul class="list-disc list-inside space-y-1 text-sm text-gray-600">
            <li v-for="(item, idx) in group.benefits" :key="idx">
              {{ item.taskDescription }}: {{ item.valueDisplay }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="requirements.length === 0 && governanceStages.length === 0" class="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <h3 class="mt-4 text-sm font-medium text-gray-900">No data to display</h3>
      <p class="mt-2 text-sm text-gray-500">
        Add tasks and governance stages to see visualizations.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import mermaid from 'mermaid'
import { useCanvasData } from '@/composables/useCanvasData'
import InfoTooltip from '../InfoTooltip.vue'
import { getTimeSavedPerUnit, getOversightMinutes } from '@/utils/timeBenefits'
import { formatDisplayGroupValue } from '@/utils/displayGroupValue'
import { getMetricDisplayLabel, formatBenefitValueDisplay } from '@/data/benefitMetrics'
import { generateDependencyMermaid, hasDependencies } from '@/utils/dependencyGraph'
import type { Requirement, ClassifiedBenefit } from '@/types/canvas'
import { getMonthlyDeploymentCost, aggregateDeploymentCosts } from '@/utils/deploymentCost'
import { isBenefitOfType, isClassifiedBenefit } from '@/utils/benefits'

const { canvasData, benefitDisplay } = useCanvasData()

const requirements = computed(() => canvasData.value.userExpectations?.requirements || [])
const governanceStages = computed(() => canvasData.value.governance?.stages || [])

interface GovernanceTimelineStage {
  id: string
  name: string
  startDate?: string
  endDate?: string
  left: number
  width: number
  row: number
  index: number
}

interface GovernanceAxisTick {
  left: number
  label: string
}

interface GovernanceTimeline {
  stages: GovernanceTimelineStage[]
  axisTicks: GovernanceAxisTick[]
  height: number
}

const governanceTimeline = computed<GovernanceTimeline | null>(() => {
  const stages = governanceStages.value
  if (!stages.length) return null

  // Parse dates and filter to those with at least one date
  const parsed = stages.map((s, index) => {
    const start = s.startDate ? new Date(s.startDate).getTime() : NaN
    const end = s.endDate ? new Date(s.endDate).getTime() : NaN
    return { raw: s, index, start, end }
  })

  const validForAxis = parsed.filter(p => !Number.isNaN(p.start) || !Number.isNaN(p.end))
  if (!validForAxis.length) {
    return {
      stages: [],
      axisTicks: [],
      height: 80,
    }
  }

  const minStart = Math.min(...validForAxis.map(p => Number.isNaN(p.start) ? p.end : p.start))
  const maxEnd = Math.max(...validForAxis.map(p => Number.isNaN(p.end) ? p.start : p.end))
  if (!Number.isFinite(minStart) || !Number.isFinite(maxEnd) || minStart === maxEnd) {
    return {
      stages: [],
      axisTicks: [],
      height: 80,
    }
  }

  const totalSpan = maxEnd - minStart
  const rowCount = parsed.length || 1
  const barRowHeight = 44
  const topPadding = 8
  const bottomAxisSpace = 44

  const timelineStages: GovernanceTimelineStage[] = parsed.map((p, idx) => {
    const s = p.raw
    const startMs = !Number.isNaN(p.start) ? p.start : minStart
    const endMs = !Number.isNaN(p.end) ? p.end : startMs + totalSpan * 0.05
    const clampedStart = Math.max(minStart, Math.min(endMs, startMs))
    const clampedEnd = Math.max(clampedStart, Math.min(maxEnd, endMs))
    const left = ((clampedStart - minStart) / totalSpan) * 100
    const width = Math.max(2, ((clampedEnd - clampedStart) / totalSpan) * 100)
    const row = idx
    return {
      id: s.id,
      name: s.name || `Stage ${idx + 1}`,
      startDate: s.startDate,
      endDate: s.endDate,
      left,
      width,
      row,
      index: p.index,
    }
  })

  // Build evenly spaced axis ticks with granularity based on total span
  const dayMs = 24 * 60 * 60 * 1000
  let tickCount = 4
  if (totalSpan > 90 * dayMs && totalSpan <= 365 * dayMs) {
    tickCount = 6
  } else if (totalSpan > 365 * dayMs) {
    tickCount = 7
  }
  const axisTicks: GovernanceAxisTick[] = []
  const step = totalSpan / (tickCount - 1)
  for (let i = 0; i < tickCount; i++) {
    const t = minStart + step * i
    const left = (i / (tickCount - 1)) * 100
    axisTicks.push({
      left,
      label: formatDate(new Date(t).toISOString()),
    })
  }

  const height = topPadding + rowCount * barRowHeight + bottomAxisSpace

  return {
    stages: timelineStages,
    axisTicks,
    height,
  }
})

const dependencyMermaid = computed(() => generateDependencyMermaid(requirements.value))
const mermaidContainerRef = ref<HTMLElement | null>(null)
const zoomContainerRef = ref<HTMLElement | null>(null)
const zoom = ref(1)
const panX = ref(0)
const panY = ref(0)
const isPanning = ref(false)
const panStartX = ref(0)
const panStartY = ref(0)

const ZOOM_MIN = 0.3
const ZOOM_MAX = 3
const ZOOM_STEP = 0.15

function zoomIn() {
  zoom.value = Math.min(ZOOM_MAX, zoom.value + ZOOM_STEP)
}

function zoomOut() {
  zoom.value = Math.max(ZOOM_MIN, zoom.value - ZOOM_STEP)
}

function resetZoom() {
  if (!zoomContainerRef.value || !mermaidContainerRef.value) {
    zoom.value = 1
    panX.value = 0
    panY.value = 0
    return
  }
  const container = zoomContainerRef.value.getBoundingClientRect()
  const svg = mermaidContainerRef.value.querySelector('svg')
  if (!svg) {
    zoom.value = 1
    panX.value = 0
    panY.value = 0
    return
  }
  const svgWidth = svg.scrollWidth || svg.clientWidth
  const svgHeight = svg.scrollHeight || svg.clientHeight
  if (svgWidth === 0 || svgHeight === 0) {
    zoom.value = 1
    panX.value = 0
    panY.value = 0
    return
  }
  // Fit graph into container with some padding
  const padX = 32
  const padY = 32
  const scaleX = (container.width - padX) / svgWidth
  const scaleY = (container.height - padY) / svgHeight
  zoom.value = Math.min(scaleX, scaleY, 1) // Don't zoom above 1x for fit
  // Center the graph
  const scaledWidth = svgWidth * zoom.value
  const scaledHeight = svgHeight * zoom.value
  panX.value = (container.width - scaledWidth) / 2
  panY.value = (container.height - scaledHeight) / 2
}

function onMouseDown(event: MouseEvent) {
  if (event.button !== 0) return // left click only
  isPanning.value = true
  panStartX.value = event.clientX - panX.value
  panStartY.value = event.clientY - panY.value
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

function onMouseMove(event: MouseEvent) {
  if (!isPanning.value) return
  panX.value = event.clientX - panStartX.value
  panY.value = event.clientY - panStartY.value
}

function onMouseUp() {
  isPanning.value = false
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
}

async function renderMermaid() {
  if (!mermaidContainerRef.value || !dependencyMermaid.value) return
  try {
    mermaid.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'loose' })
    const id = `mermaid-dep-${Date.now()}`
    const { svg } = await mermaid.render(id, dependencyMermaid.value)
    mermaidContainerRef.value.innerHTML = svg
    // Auto-fit after SVG is rendered and laid out
    nextTick(() => requestAnimationFrame(() => resetZoom()))
  } catch (err) {
    mermaidContainerRef.value.innerHTML = `<p class="text-sm text-gray-500">Could not render diagram</p>`
  }
}

onMounted(() => renderMermaid())
watch([dependencyMermaid, requirements], () => renderMermaid(), { deep: true })

onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
})

const taskCount = computed(() => requirements.value.length)

// Resolve display groups to task names + aggregated value + per-benefit display
const displayGroupsWithBenefits = computed(() => {
  const reqs = requirements.value
  return benefitDisplay.value.displayGroups
    .filter((g) => g.benefitRefs.length > 0)
    .map((group) => {
      const metricLabel =
        getMetricDisplayLabel(group.benefitType, group.metricId) ||
        group.metricId ||
        `${group.benefitType} / ${group.metricId}`
      const aggregatedValueDisplay = formatDisplayGroupValue(group, reqs)
      const benefits = group.benefitRefs
        .map((ref) => {
          const req = reqs.find((r, i) => (r.id || `req-${i}`) === ref.requirementId)
          const benefit = req?.benefits?.[ref.benefitIndex]
          if (!req || !benefit || !isClassifiedBenefit(benefit)) return null
          const taskDescription = req.title || req.description || ref.requirementId
          const valueDisplay = formatBenefitValueDisplay(benefit)
          return { taskDescription, valueDisplay }
        })
        .filter((b): b is { taskDescription: string; valueDisplay: string } => b != null)
      return { id: group.id, metricLabel, aggregatedValueDisplay, benefits }
    })
})

// Helper to get time benefit from a requirement
function getTimeBenefit(req: Requirement): ClassifiedBenefit | undefined {
  return (req.benefits || []).find(b => isBenefitOfType(b, 'time'))
}


// Calculate total time saved per month (baseline − expected) × volume
const totalMinutesSavedPerMonth = computed(() => {
  return requirements.value.reduce((total, req) => {
    const timeBenefit = getTimeBenefit(req)
    if (!timeBenefit) return total
    const savedPerUnit = getTimeSavedPerUnit(timeBenefit, req)
    const volume = req.volumePerMonth || 0
    return total + (savedPerUnit * volume)
  }, 0)
})

const totalHoursSavedPerMonth = computed(() => {
  return Math.round((totalMinutesSavedPerMonth.value / 60) * 10) / 10
})

// Calculate net time saved (saved per unit × volume − oversight)
const netMinutesSavedPerMonth = computed(() => {
  return requirements.value.reduce((total, req) => {
    const timeBenefit = getTimeBenefit(req)
    if (!timeBenefit) return total
    const savedPerUnit = getTimeSavedPerUnit(timeBenefit, req)
    const volume = req.volumePerMonth || 0
    const grossTimeSaved = savedPerUnit * volume
    const oversightTime = getOversightMinutes(timeBenefit, volume)
    const netTimeSaved = Math.max(0, grossTimeSaved - oversightTime)
    return total + netTimeSaved
  }, 0)
})

const netHoursSavedPerMonth = computed(() => {
  return Math.round((netMinutesSavedPerMonth.value / 60) * 10) / 10
})

// Value type breakdown (from benefits array)
const valueTypeBreakdown = computed(() => {
  const counts: Record<string, number> = {}
  requirements.value.forEach(req => {
    // Get unique benefit types for this requirement
    const benefitTypes = new Set((req.benefits || []).map(b => b.benefitType))
    benefitTypes.forEach(type => {
      counts[type] = (counts[type] || 0) + 1
    })
  })
  
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0)
  if (total === 0) return []
  
  return Object.entries(counts).map(([type, count]) => ({
    type,
    count,
    percentage: Math.round((count / total) * 100)
  }))
})

// Deployment cost aggregation
const deploymentCostTotals = computed(() => aggregateDeploymentCosts(requirements.value))

const hasDeploymentCosts = computed(() => deploymentCostTotals.value.size > 0)

const summaryGridCols = computed(() => hasDeploymentCosts.value ? 'md:grid-cols-4' : 'md:grid-cols-3')

function formatCurrency(amount: number, currency: string): string {
  return `${amount.toFixed(2)} ${currency}`
}

function formatDeploymentCostSummary(): string {
  const totals = deploymentCostTotals.value
  if (totals.size === 0) return '0.00'
  return Array.from(totals.entries())
    .map(([currency, amount]) => formatCurrency(amount, currency))
    .join(' + ')
}

function getTaskMonthlyCost(req: Requirement): string {
  const cost = getMonthlyDeploymentCost(req)
  if (cost === 0) return ''
  const currency = req.feasibility?.deploymentCost?.currency || 'USD'
  return formatCurrency(cost, currency)
}

// Helper functions
function formatMinutes(minutes: number): string {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }
  return `${Math.round(minutes)}m`
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateStr
  }
}

function getBaselineMinutes(req: Requirement): number {
  const timeBenefit = getTimeBenefit(req)
  if (!timeBenefit) return 0
  const baseline = timeBenefit.baseline
  if (baseline.type === 'numeric') return baseline.value
  return 0
}

function getTimeSavedMinutes(req: Requirement): number {
  const timeBenefit = getTimeBenefit(req)
  if (!timeBenefit) return 0
  return getTimeSavedPerUnit(timeBenefit, req)
}

function getNetTimeSaved(req: Requirement): number {
  const timeBenefit = getTimeBenefit(req)
  if (!timeBenefit) return getTimeSavedMinutes(req)
  const timeSaved = getTimeSavedMinutes(req)
  const volume = req.volumePerMonth || 0
  const grossTimeSaved = timeSaved * volume
  const oversightTime = getOversightMinutes(timeBenefit, volume)
  // Return per-unit net savings
  if (volume === 0) return timeSaved
  return Math.max(0, (grossTimeSaved - oversightTime) / volume)
}

function getOversightMinutesForReq(req: Requirement): number {
  const timeBenefit = getTimeBenefit(req)
  if (!timeBenefit) return 0
  return getOversightMinutes(timeBenefit, req.volumePerMonth)
}

// Calculate maximum total time saved across all tasks for normalization
const maxTotalTimeSaved = computed(() => {
  if (requirements.value.length === 0) return 0
  return Math.max(...requirements.value.map(req => {
    const timeSaved = getTimeSavedMinutes(req)
    const volume = req.volumePerMonth || 0
    return timeSaved * volume
  }))
})

// Get net savings percentage (green bar)
function getNetSavingsPercentage(req: Requirement): number {
  if (maxTotalTimeSaved.value === 0) return 0
  const timeBenefit = getTimeBenefit(req)
  if (!timeBenefit) return 0
  const timeSaved = getTimeSavedMinutes(req)
  const volume = req.volumePerMonth || 0
  const grossTimeSaved = timeSaved * volume
  const oversightTime = getOversightMinutes(timeBenefit, volume)
  const netTimeSaved = Math.max(0, grossTimeSaved - oversightTime)
  return Math.round((netTimeSaved / maxTotalTimeSaved.value) * 100)
}

// Get oversight percentage (grey bar)
function getOversightPercentage(req: Requirement): number {
  if (maxTotalTimeSaved.value === 0) return 0
  const timeBenefit = getTimeBenefit(req)
  if (!timeBenefit) return 0
  const volume = req.volumePerMonth || 0
  const oversightTime = getOversightMinutes(timeBenefit, volume)
  return Math.round((oversightTime / maxTotalTimeSaved.value) * 100)
}

function getGovernanceStageChipClass(stage: { name: string }, index: number): string {
  const isValidation = /validation/i.test(stage.name || '')
  if (isValidation) return 'border-amber-500 text-amber-900'

  const palette = [
    'border-sky-500 text-sky-900',
    'border-emerald-500 text-emerald-900',
    'border-rose-500 text-rose-900',
    'border-indigo-500 text-indigo-900',
    'border-teal-500 text-teal-900',
    'border-fuchsia-500 text-fuchsia-900',
  ]
  return palette[index % palette.length]
}

// Per-task feasibility: use req.feasibility, or global DeveloperFeasibility when applicable
function getTaskFeasibility(req: Requirement) {
  if (req.feasibility) return req.feasibility
  // If no task-specific feasibility, use project-level defaults
  return canvasData.value.developerFeasibility || null
}

function getTaskFeasibilityRisk(req: Requirement): string | null {
  const feas = getTaskFeasibility(req)
  const risk = feas?.technicalRisk
  return risk || null
}

function getTaskFeasibilityEffort(req: Requirement): string | null {
  const feas = getTaskFeasibility(req)
  const effort = feas?.effortEstimate
  if (!effort || effort.value === undefined) return null
  const unitLabel = effort.unit === 'person-hours' ? 'person-hours' : 'weeks'
  return `${effort.value} ${unitLabel}`
}

function getFeasibilityRiskBadgeClass(risk: string): string {
  const classes: Record<string, string> = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700',
  }
  return classes[risk.toLowerCase()] || 'bg-gray-100 text-gray-700'
}

function getTaskBorderColor(index: number): string {
  const colors = [
    'border-blue-500',
    'border-green-500',
    'border-yellow-500',
    'border-purple-500',
    'border-pink-500',
  ]
  return colors[index % colors.length]
}

function getValueTypeColor(type: string): string {
  const colors: Record<string, string> = {
    time: 'bg-blue-50 border border-blue-200 text-blue-900',
    quality: 'bg-green-50 border border-green-200 text-green-900',
    risk: 'bg-red-50 border border-red-200 text-red-900',
    enablement: 'bg-purple-50 border border-purple-200 text-purple-900',
    cost: 'bg-amber-50 border border-amber-200 text-amber-900',
  }
  return colors[type] || 'bg-gray-50 border border-gray-200 text-gray-900'
}

// Effort summary functions (similar to DeveloperFeasibility)
const tasksWithEffort = computed(() => {
  return requirements.value.filter((r) => r.feasibility?.effortEstimate?.value !== undefined && r.feasibility.effortEstimate.value > 0)
})

// Calculate total effort (normalize to person-hours for aggregation)
const totalEffortPersonHours = computed(() => {
  return tasksWithEffort.value.reduce((total, req) => {
    const effort = req.feasibility?.effortEstimate
    if (!effort || effort.value === undefined) return total
    // Normalize to person-hours (assume 40 person-hours per week)
    if (effort.unit === 'weeks') {
      return total + (effort.value * 40)
    }
    return total + effort.value
  }, 0)
})

// Get maximum effort for percentage calculation
const maxEffortPersonHours = computed(() => {
  if (tasksWithEffort.value.length === 0) return 0
  const efforts = tasksWithEffort.value.map(req => {
    const effort = req.feasibility?.effortEstimate
    if (!effort || effort.value === undefined) return 0
    if (effort.unit === 'weeks') {
      return effort.value * 40
    }
    return effort.value
  })
  return Math.max(...efforts, 0)
})

// Calculate time saved per month for a requirement (in person-hours)
function getTimeSavedPersonHours(req: Requirement): number {
  const timeBenefit = getTimeBenefit(req)
  if (!timeBenefit) return 0
  
  const savedPerUnit = getTimeSavedPerUnit(timeBenefit, req)
  const volume = req.volumePerMonth || 0
  const grossTimeSaved = savedPerUnit * volume
  const oversightTime = getOversightMinutes(timeBenefit, volume)
  const netTimeSaved = Math.max(0, grossTimeSaved - oversightTime)
  
  // Convert minutes to person-hours
  return netTimeSaved / 60
}

// Calculate total time saved across all tasks with effort estimates
const totalTimeSavedPersonHours = computed(() => {
  return tasksWithEffort.value.reduce((total, req) => {
    return total + getTimeSavedPersonHours(req)
  }, 0)
})

function getEffortPercentage(req: Requirement): number {
  if (maxEffortPersonHours.value === 0) return 0
  const effort = req.feasibility?.effortEstimate
  if (!effort || effort.value === undefined) return 0
  const effortHours = effort.unit === 'weeks' ? effort.value * 40 : effort.value
  return Math.round((effortHours / maxEffortPersonHours.value) * 100)
}

function formatTotalEffort(): string {
  const totalHours = totalEffortPersonHours.value
  if (totalHours === 0) return '0 person-hours'
  
  // Show in weeks if >= 40 hours, otherwise person-hours
  if (totalHours >= 40) {
    const weeks = Math.round((totalHours / 40) * 10) / 10
    return `${weeks} weeks (${totalHours} person-hours)`
  }
  return `${totalHours} person-hours`
}

function formatEffort(effort?: { value: number; unit: 'weeks' | 'person-hours' }): string {
  if (!effort || effort.value === undefined) return ''
  const unitLabel = effort.unit === 'person-hours' ? 'person-hours' : 'weeks'
  return `${effort.value} ${unitLabel}`
}

function formatTimeSaved(hours: number): string {
  if (hours === 0) return '0h'
  if (hours < 1) {
    const minutes = Math.round(hours * 60)
    return `${minutes}m`
  }
  if (hours < 10) {
    return `${Math.round(hours * 10) / 10}h`
  }
  return `${Math.round(hours)}h`
}

// Calculate amortization period (months until effort amortizes) for a task
function getAmortizationMonths(req: Requirement): number | null {
  const effort = req.feasibility?.effortEstimate
  if (!effort || effort.value === undefined || effort.value === 0) return null
  
  const effortHours = effort.unit === 'weeks' ? effort.value * 40 : effort.value
  const monthlyBenefitHours = getTimeSavedPersonHours(req)
  
  if (monthlyBenefitHours === 0) return null
  return effortHours / monthlyBenefitHours
}

// Calculate total amortization period
const totalAmortizationMonths = computed(() => {
  const totalEffort = totalEffortPersonHours.value
  const totalBenefit = totalTimeSavedPersonHours.value
  if (totalEffort === 0 || totalBenefit === 0) return null
  return totalEffort / totalBenefit
})

// Get unique benefit types for a requirement
function getBenefitTypes(req: Requirement): string[] {
  const types = new Set((req.benefits || []).map(b => b.benefitType))
  return Array.from(types)
}

// Badge class for benefit types
function benefitTypeBadgeClass(type: string): string {
  const classes: Record<string, string> = {
    'time': 'bg-green-100 text-green-700',
    'quality': 'bg-blue-100 text-blue-700',
    'risk': 'bg-orange-100 text-orange-700',
    'enablement': 'bg-purple-100 text-purple-700',
    'cost': 'bg-amber-100 text-amber-700'
  }
  return classes[type] || 'bg-gray-100 text-gray-700'
}
</script>

<style scoped>
.mermaid-zoom-container {
  min-height: 200px;
  max-height: 70vh;
}

.mermaid-diagram :deep(svg) {
  max-width: none;
  height: auto;
}
</style>
