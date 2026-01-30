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
              <h4 class="font-medium text-gray-900">{{ req.description || `Task ${index + 1}` }}</h4>
              <p v-if="req.unitOfWork" class="text-sm text-gray-600 mt-1">
                {{ req.unitOfWork }} ({{ req.volumePerMonth || 0 }}/month)
              </p>
            </div>
            <div class="text-right ml-4">
              <div v-if="getTimeSavedMinutes(req) > 0" class="text-lg font-semibold text-green-700">
                {{ formatMinutes(getTimeSavedMinutes(req) * (req.volumePerMonth || 0)) }}
              </div>
              <div v-if="req.humanOversightMinutesPerUnit !== undefined" class="text-sm text-gray-500">
                Oversight: {{ formatMinutes(req.humanOversightMinutesPerUnit * (req.volumePerMonth || 0)) }}
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
              <span v-if="req.humanOversightMinutesPerUnit !== undefined" class="ml-2">
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
import { computed } from 'vue'
import { useCanvasData } from '@/composables/useCanvasData'
import InfoTooltip from '../InfoTooltip.vue'
import type { Requirement, Benefit, BenefitValue } from '@/types/canvas'

const { canvasData } = useCanvasData()

const requirements = computed(() => canvasData.value.userExpectations?.requirements || [])
const governanceStages = computed(() => canvasData.value.governance?.stages || [])

const taskCount = computed(() => requirements.value.length)

// Alias for clarity - requirements are tasks
const tasks = computed(() => requirements.value)

// Helper to get time benefit from a requirement
function getTimeBenefit(req: Requirement): Benefit | undefined {
  return (req.benefits || []).find(b => b.benefitType === 'time')
}

// Helper to get likely value from a BenefitValue
function getExpectedLikely(value: BenefitValue): number {
  if (value.type === 'threePoint') return value.likely
  if (value.type === 'numeric') return value.value
  return 0
}

// Calculate total time saved per month (from time benefits)
const totalMinutesSavedPerMonth = computed(() => {
  return requirements.value.reduce((total, req) => {
    const timeBenefit = getTimeBenefit(req)
    if (!timeBenefit) return total
    const timeSaved = getExpectedLikely(timeBenefit.expected)
    const volume = req.volumePerMonth || 0
    return total + (timeSaved * volume)
  }, 0)
})

const totalHoursSavedPerMonth = computed(() => {
  return Math.round((totalMinutesSavedPerMonth.value / 60) * 10) / 10
})

// Calculate net time saved (after oversight)
const netMinutesSavedPerMonth = computed(() => {
  return requirements.value.reduce((total, req) => {
    const timeBenefit = getTimeBenefit(req)
    if (!timeBenefit) return total
    const timeSaved = getExpectedLikely(timeBenefit.expected)
    const oversight = req.humanOversightMinutesPerUnit || 0
    const volume = req.volumePerMonth || 0
    const netSaved = timeSaved - oversight
    return total + (netSaved * volume)
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
  if (baseline.type === 'threePoint') return baseline.likely
  return 0
}

function getTimeSavedMinutes(req: Requirement): number {
  const timeBenefit = getTimeBenefit(req)
  if (!timeBenefit) return 0
  return getExpectedLikely(timeBenefit.expected)
}

function getNetTimeSaved(req: Requirement): number {
  const timeSaved = getTimeSavedMinutes(req)
  const oversight = req.humanOversightMinutesPerUnit || 0
  return Math.max(0, timeSaved - oversight)
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

// Get total savings percentage (full bar width)
function getTotalSavingsPercentage(req: Requirement): number {
  if (maxTotalTimeSaved.value === 0) return 0
  const timeSaved = getTimeSavedMinutes(req)
  const volume = req.volumePerMonth || 0
  const totalTimeSaved = timeSaved * volume
  return Math.round((totalTimeSaved / maxTotalTimeSaved.value) * 100)
}

// Get net savings percentage (green bar)
function getNetSavingsPercentage(req: Requirement): number {
  if (maxTotalTimeSaved.value === 0) return 0
  const timeSaved = getTimeSavedMinutes(req)
  const oversight = req.humanOversightMinutesPerUnit || 0
  const volume = req.volumePerMonth || 0
  const netTimeSaved = Math.max(0, timeSaved - oversight) * volume
  return Math.round((netTimeSaved / maxTotalTimeSaved.value) * 100)
}

// Get oversight percentage (grey bar)
function getOversightPercentage(req: Requirement): number {
  if (maxTotalTimeSaved.value === 0) return 0
  const oversight = req.humanOversightMinutesPerUnit || 0
  const volume = req.volumePerMonth || 0
  const oversightTime = oversight * volume
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
  }
  return colors[type] || 'bg-gray-50 border border-gray-200 text-gray-900'
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    case: 'bg-blue-500',
    document: 'bg-green-500',
    record: 'bg-yellow-500',
    message: 'bg-purple-500',
    analysisRun: 'bg-pink-500',
    meeting: 'bg-indigo-500',
    other: 'bg-gray-500',
  }
  return colors[category] || 'bg-gray-500'
}
</script>
