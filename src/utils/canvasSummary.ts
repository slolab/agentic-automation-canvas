/**
 * Shared logic for generating a one-page canvas summary (BMC-style).
 * Used by both the web app CanvasSummary component and RO-Crate HTML preview.
 */

import type { CanvasData, Requirement } from '@/types/canvas'
import { getTimeSavedPerUnit, getOversightMinutes } from './timeBenefits'

const MAX_DESC_LEN = 120
const MAX_TASK_TITLES = 5

function truncate(text: string | undefined, maxLen: number): string {
  if (!text || !text.trim()) return ''
  const t = text.trim()
  if (t.length <= maxLen) return t
  return t.slice(0, maxLen) + '...'
}

export interface ProjectBlock {
  title: string
  description: string
  stage: string
  headlineValue: string
  primaryValueDriver: string
  domain: string[]
}

export interface TaskSummary {
  title: string
  userStory?: string
}

export interface UserExpectationsBlock {
  taskCount: number
  tasks: TaskSummary[]
  totalTimeSavedHoursPerMonth: number
  benefitTypeCounts: Record<string, number>
}

export interface DeveloperFeasibilityBlock {
  trlCurrent: number | null
  trlTarget: number | null
  technicalRisk: string | null
  effortEstimate: string | null
  amortizationMonths: number | null
  feasibilityNotes: string
  /** Task titles that have task-level feasibility overrides */
  tasksWithDedicatedFeasibility: string[]
}

export interface DeliverableSummary {
  title: string
  pid?: string
}

export interface PublicationSummary {
  title: string
  doi?: string
}

export interface EvaluationSummary {
  type: string
  results?: string
}

export interface OutcomesBlock {
  deliverableCount: number
  publicationCount: number
  evaluationCount: number
  deliverables: DeliverableSummary[]
  publications: PublicationSummary[]
  evaluations: EvaluationSummary[]
}

export interface GovernanceBlock {
  stages: Array<{
    name: string
    startDate: string
    endDate: string
    agentCount: number
    milestoneCount: number
  }>
}

export interface DataAccessBlock {
  datasetCount: number
  accessRightsSummary: Record<string, number>
  sensitivitySummary: string[]
}

export interface CanvasSummaryData {
  project: ProjectBlock
  userExpectations: UserExpectationsBlock
  developerFeasibility: DeveloperFeasibilityBlock
  governance: GovernanceBlock
  dataAccess: DataAccessBlock
  outcomes: OutcomesBlock
}

function getTimeBenefit(req: Requirement) {
  return (req.benefits || []).find((b) => b.benefitType === 'time')
}

function hasDedicatedFeasibility(req: Requirement): boolean {
  const f = req.feasibility
  if (!f) return false
  if (f.technicalRisk) return true
  if (f.effortEstimate?.value != null && f.effortEstimate.value > 0) return true
  if (f.feasibilityNotes?.trim()) return true
  if (f.modelSelection && f.modelSelection !== 'none') return true
  if (f.modelName?.trim()) return true
  const arch = f.technologyApproach?.architecture
  if (arch && arch !== 'none') return true
  return false
}

export function computeCanvasSummary(data: CanvasData): CanvasSummaryData {
  const project = data.project
  const requirements = data.userExpectations?.requirements ?? []
  const governanceStages = data.governance?.stages ?? []
  const datasets = data.dataAccess?.datasets ?? []
  const deliverables = data.outcomes?.deliverables ?? []
  const publications = data.outcomes?.publications ?? []
  const evaluations = data.outcomes?.evaluations ?? []

  // Project block
  const projectBlock: ProjectBlock = {
    title: project.title || 'Untitled Project',
    description: truncate(project.description, MAX_DESC_LEN),
    stage: project.projectStage || '',
    headlineValue: project.headlineValue || '',
    primaryValueDriver: project.primaryValueDriver
      ? project.primaryValueDriver.charAt(0).toUpperCase() + project.primaryValueDriver.slice(1)
      : '',
    domain: project.domain ?? [],
  }

  // User expectations block
  const totalMinutesSavedPerMonth = requirements.reduce<number>((total, req) => {
    const timeBenefit = getTimeBenefit(req)
    if (!timeBenefit) return total
    const savedPerUnit = getTimeSavedPerUnit(timeBenefit, req)
    const volume = req.volumePerMonth ?? 0
    const grossTimeSaved = savedPerUnit * volume
    const oversightTime = getOversightMinutes(timeBenefit, volume)
    const netTimeSaved = Math.max(0, grossTimeSaved - oversightTime)
    return total + netTimeSaved
  }, 0)
  const benefitTypeCounts: Record<string, number> = {}
  requirements.forEach((req) => {
    ;(req.benefits || []).forEach((b) => {
      benefitTypeCounts[b.benefitType] = (benefitTypeCounts[b.benefitType] || 0) + 1
    })
  })
  const tasks: TaskSummary[] = requirements.slice(0, MAX_TASK_TITLES).map((r) => ({
    title: r.title || 'Untitled task',
    userStory: r.userStory?.trim() || undefined,
  }))
  const userExpectationsBlock: UserExpectationsBlock = {
    taskCount: requirements.length,
    tasks,
    totalTimeSavedHoursPerMonth: Math.round((totalMinutesSavedPerMonth / 60) * 10) / 10,
    benefitTypeCounts,
  }

  // Developer feasibility block
  const feas = data.developerFeasibility
  const trlCurrent = feas?.trlLevel?.current ?? null
  const trlTarget = feas?.trlLevel?.target ?? null
  const technicalRisk = feas?.technicalRisk ?? null
  let effortEstimate: string | null = null
  if (feas?.effortEstimate?.value !== undefined) {
    const u = feas.effortEstimate.unit === 'weeks' ? 'weeks' : 'person-hours'
    effortEstimate = `${feas.effortEstimate.value} ${u}`
  }

  // Amortization: total effort / total time saved per month (from tasks with effort)
  let amortizationMonths: number | null = null
  const tasksWithEffort = requirements.filter(
    (r) => r.feasibility?.effortEstimate?.value !== undefined && r.feasibility.effortEstimate.value > 0
  )
  if (tasksWithEffort.length > 0) {
    const totalEffortHours = tasksWithEffort.reduce((sum, req) => {
      const e = req.feasibility?.effortEstimate
      if (!e?.value) return sum
      return sum + (e.unit === 'weeks' ? e.value * 40 : e.value)
    }, 0)
    const totalBenefitHoursPerMonth = tasksWithEffort.reduce((sum, req) => {
      const timeBenefit = getTimeBenefit(req)
      if (!timeBenefit) return sum
      const savedPerUnit = getTimeSavedPerUnit(timeBenefit, req)
      const volume = req.volumePerMonth ?? 0
      const gross = savedPerUnit * volume
      const oversight = getOversightMinutes(timeBenefit, volume)
      const net = Math.max(0, gross - oversight)
      return sum + net / 60
    }, 0)
    if (totalBenefitHoursPerMonth > 0) {
      amortizationMonths = totalEffortHours / totalBenefitHoursPerMonth
    }
  }

  const tasksWithDedicatedFeasibility = requirements
    .filter((r) => hasDedicatedFeasibility(r))
    .map((r) => r.title || 'Untitled task')

  const developerFeasibilityBlock: DeveloperFeasibilityBlock = {
    trlCurrent,
    trlTarget,
    technicalRisk,
    effortEstimate,
    amortizationMonths,
    feasibilityNotes: truncate(feas?.feasibilityNotes, MAX_DESC_LEN),
    tasksWithDedicatedFeasibility,
  }

  // Governance block
  const governanceBlock: GovernanceBlock = {
    stages: governanceStages.map((s) => ({
      name: s.name || 'Unnamed stage',
      startDate: s.startDate ?? '',
      endDate: s.endDate ?? '',
      agentCount: s.agents?.length ?? 0,
      milestoneCount: s.milestones?.length ?? 0,
    })),
  }

  // Data access block
  const accessRightsSummary: Record<string, number> = {}
  const sensitivitySummary: string[] = []
  datasets.forEach((d) => {
    const ar = d.accessRights || 'unspecified'
    accessRightsSummary[ar] = (accessRightsSummary[ar] || 0) + 1
    if (d.sensitivityLevel && !sensitivitySummary.includes(d.sensitivityLevel)) {
      sensitivitySummary.push(d.sensitivityLevel)
    }
  })
  const dataAccessBlock: DataAccessBlock = {
    datasetCount: datasets.length,
    accessRightsSummary,
    sensitivitySummary,
  }

  // Outcomes block
  const outcomesBlock: OutcomesBlock = {
    deliverableCount: deliverables.length,
    publicationCount: publications.length,
    evaluationCount: evaluations.length,
    deliverables: deliverables.slice(0, 5).map((d) => ({
      title: d.title || 'Untitled',
      pid: d.pid?.trim() || undefined,
    })),
    publications: publications.slice(0, 5).map((p) => ({
      title: p.title || 'Untitled',
      doi: p.doi?.trim() || undefined,
    })),
    evaluations: evaluations.slice(0, 5).map((e) => ({
      type: e.type || 'Evaluation',
      results: e.results?.trim() || undefined,
    })),
  }

  return {
    project: projectBlock,
    userExpectations: userExpectationsBlock,
    developerFeasibility: developerFeasibilityBlock,
    governance: governanceBlock,
    dataAccess: dataAccessBlock,
    outcomes: outcomesBlock,
  }
}
