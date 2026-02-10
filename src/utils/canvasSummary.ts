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

export interface UserExpectationsBlock {
  taskCount: number
  taskTitles: string[]
  totalTimeSavedHoursPerMonth: number
  benefitTypeCounts: Record<string, number>
}

export interface DeveloperFeasibilityBlock {
  trlCurrent: number | null
  trlTarget: number | null
  technicalRisk: string | null
  effortEstimate: string | null
  feasibilityNotes: string
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

export interface OutcomesBlock {
  deliverableCount: number
  publicationCount: number
  evaluationCount: number
  deliverableTitles: string[]
  keyResults: string[]
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
  const userExpectationsBlock: UserExpectationsBlock = {
    taskCount: requirements.length,
    taskTitles: requirements.slice(0, MAX_TASK_TITLES).map((r) => r.title || 'Untitled task'),
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
  const developerFeasibilityBlock: DeveloperFeasibilityBlock = {
    trlCurrent,
    trlTarget,
    technicalRisk,
    effortEstimate,
    feasibilityNotes: truncate(feas?.feasibilityNotes, MAX_DESC_LEN),
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
  const deliverableTitles = deliverables.slice(0, 3).map((d) => d.title || 'Untitled')
  const keyResults = evaluations.slice(0, 2).map((e) => e.results || e.type).filter(Boolean)
  const outcomesBlock: OutcomesBlock = {
    deliverableCount: deliverables.length,
    publicationCount: publications.length,
    evaluationCount: evaluations.length,
    deliverableTitles,
    keyResults,
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
