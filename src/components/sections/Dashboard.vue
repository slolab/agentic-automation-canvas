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
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
    </div>

    <!-- Workflow Visualization -->
    <div v-if="governanceStages.length > 0" class="bg-white border border-gray-200 rounded-lg p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Governance Workflow</h3>
      <div class="overflow-x-auto">
        <div class="flex items-center gap-4 min-w-max pb-4">
          <div
            v-for="(stage, index) in governanceStages"
            :key="stage.id"
            class="flex items-center"
          >
            <div class="flex flex-col items-center">
              <div
                class="w-24 h-24 rounded-lg border-2 flex items-center justify-center text-center p-2"
                :class="getStageColor(index)"
              >
                <span class="text-xs font-medium">{{ stage.name }}</span>
              </div>
              <div v-if="stage.startDate || stage.endDate" class="text-xs text-gray-500 mt-2">
                <div v-if="stage.startDate">{{ formatDate(stage.startDate) }}</div>
                <div v-if="stage.endDate">→ {{ formatDate(stage.endDate) }}</div>
              </div>
            </div>
            <div v-if="index < governanceStages.length - 1" class="mx-2">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Task Dependency Graph -->
    <div v-if="requirements.length > 0" class="bg-white border border-gray-200 rounded-lg p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Task Dependency Graph</h3>
      <p v-if="!hasDependencies(requirements)" class="text-sm text-gray-500 italic mb-4">
        Add dependencies in task details to see workflow connections.
      </p>
      <div ref="mermaidContainerRef" class="mermaid-diagram overflow-x-auto min-h-[100px] flex items-center justify-center p-4 bg-gray-50 rounded-lg" />
    </div>

    <!-- Time Savings per Task -->
    <div v-if="requirements.length > 0" class="bg-white border border-gray-200 rounded-lg p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Time Savings per Task</h3>
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
              </div>
              <p v-if="req.unitOfWork" class="text-sm text-gray-600 mt-1">
                {{ req.unitOfWork }} ({{ req.volumePerMonth || 0 }}/month)
              </p>
            </div>
            <div class="text-right ml-4">
              <div v-if="getTimeSavedMinutes(req) > 0" class="text-lg font-semibold text-green-700">
                {{ formatMinutes(getTimeSavedMinutes(req) * (req.volumePerMonth || 0)) }}
              </div>
              <div v-if="getOversightMinutesForReq(req) > 0" class="text-sm text-gray-500">
                Oversight: {{ formatMinutes(getOversightMinutesForReq(req)) }}
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
              <span>Saved:</span>
              <span class="font-medium text-green-700">
                {{ formatMinutes(getTimeSavedMinutes(req) * (req.volumePerMonth || 0)) }}
              </span>
              <span v-if="getOversightMinutesForReq(req) > 0" class="ml-2">
                (Net: {{ formatMinutes(getNetTimeSaved(req) * (req.volumePerMonth || 0)) }})
              </span>
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
          </div>
        </div>
      </div>
    </div>

    <!-- Value Type Breakdown -->
    <div v-if="valueTypeBreakdown.length > 0" class="bg-white border border-gray-200 rounded-lg p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Value Type Distribution</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          v-for="item in valueTypeBreakdown"
          :key="item.type"
          class="text-center p-4 rounded-lg"
          :class="getValueTypeColor(item.type)"
        >
          <div class="text-2xl font-bold mb-1">{{ item.count }}</div>
          <div class="text-sm font-medium capitalize">{{ item.type }}</div>
          <div class="text-xs text-gray-600 mt-1">{{ item.percentage }}%</div>
        </div>
      </div>
    </div>

    <!-- Unit Category Breakdown -->
    <div v-if="unitCategoryBreakdown.length > 0" class="bg-white border border-gray-200 rounded-lg p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Unit Category Distribution</h3>
      <div class="space-y-3">
        <div
          v-for="item in unitCategoryBreakdown"
          :key="item.category"
          class="flex items-center justify-between"
        >
          <div class="flex items-center gap-3">
            <div class="w-3 h-3 rounded-full" :class="getCategoryColor(item.category)"></div>
            <span class="text-sm font-medium capitalize">{{ item.category }}</span>
          </div>
          <div class="flex items-center gap-4">
            <div class="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                class="h-full transition-all"
                :class="getCategoryColor(item.category)"
                :style="{ width: `${(item.count / requirements.length) * 100}%` }"
              />
            </div>
            <span class="text-sm text-gray-600 w-12 text-right">{{ item.count }}</span>
          </div>
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
import { computed, ref, watch, onMounted } from 'vue'
import mermaid from 'mermaid'
import { useCanvasData } from '@/composables/useCanvasData'
import InfoTooltip from '../InfoTooltip.vue'
import { getTimeSavedPerUnit, getOversightMinutes } from '@/utils/timeBenefits'
import { formatDisplayGroupValue } from '@/utils/displayGroupValue'
import { getMetricDisplayLabel, formatBenefitValueDisplay } from '@/data/benefitMetrics'
import { generateDependencyMermaid, hasDependencies } from '@/utils/dependencyGraph'
import type { Requirement, Benefit } from '@/types/canvas'

const { canvasData, benefitDisplay } = useCanvasData()

const requirements = computed(() => canvasData.value.userExpectations?.requirements || [])
const governanceStages = computed(() => canvasData.value.governance?.stages || [])

const dependencyMermaid = computed(() => generateDependencyMermaid(requirements.value))
const mermaidContainerRef = ref<HTMLElement | null>(null)

async function renderMermaid() {
  if (!mermaidContainerRef.value || !dependencyMermaid.value) return
  try {
    mermaid.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'loose' })
    const id = `mermaid-dep-${Date.now()}`
    const { svg } = await mermaid.render(id, dependencyMermaid.value)
    mermaidContainerRef.value.innerHTML = svg
  } catch (err) {
    mermaidContainerRef.value.innerHTML = `<p class="text-sm text-gray-500">Could not render diagram</p>`
  }
}

onMounted(() => renderMermaid())
watch([dependencyMermaid, requirements], () => renderMermaid(), { deep: true })

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
          if (!req || !benefit) return null
          const taskDescription = req.title || req.description || ref.requirementId
          const valueDisplay = formatBenefitValueDisplay(benefit)
          return { taskDescription, valueDisplay }
        })
        .filter((b): b is { taskDescription: string; valueDisplay: string } => b != null)
      return { id: group.id, metricLabel, aggregatedValueDisplay, benefits }
    })
})

// Helper to get time benefit from a requirement
function getTimeBenefit(req: Requirement): Benefit | undefined {
  return (req.benefits || []).find(b => b.benefitType === 'time')
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

// Unit category breakdown
const unitCategoryBreakdown = computed(() => {
  const counts: Record<string, number> = {}
  requirements.value.forEach(req => {
    const category = req.unitCategory || 'other'
    counts[category] = (counts[category] || 0) + 1
  })
  
  return Object.entries(counts).map(([category, count]) => ({
    category,
    count
  })).sort((a, b) => b.count - a.count)
})

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

function getStageColor(index: number): string {
  const colors = [
    'bg-blue-100 border-blue-300 text-blue-900',
    'bg-green-100 border-green-300 text-green-900',
    'bg-yellow-100 border-yellow-300 text-yellow-900',
    'bg-purple-100 border-purple-300 text-purple-900',
    'bg-pink-100 border-pink-300 text-pink-900',
  ]
  return colors[index % colors.length]
}

// Per-task feasibility: use req.feasibility, or global DeveloperFeasibility when applicable
function getTaskFeasibility(req: Requirement) {
  if (req.feasibility) return req.feasibility
  const df = canvasData.value.developerFeasibility
  if (!df) return null
  const appliesTo = df.appliesToRequirements
  if (appliesTo && appliesTo.length > 0 && !appliesTo.includes(req.id)) return null
  return df
}

function getTaskFeasibilityRisk(req: Requirement): string | null {
  const feas = getTaskFeasibility(req)
  const risk = feas?.technicalRisk
  return risk || null
}

function getTaskFeasibilityEffort(req: Requirement): string | null {
  const feas = getTaskFeasibility(req)
  const effort = feas?.effortEstimate
  return effort?.trim() || null
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

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    item: 'bg-blue-500',
    interaction: 'bg-purple-500',
    computation: 'bg-pink-500',
    other: 'bg-gray-500',
  }
  return colors[category] || 'bg-gray-500'
}
</script>
