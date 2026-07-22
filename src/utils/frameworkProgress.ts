/**
 * Completion logic for the six "essentials" boxes on the Canvas Summary.
 *
 * The essentials are the loose entry level of the AAC — the framework level,
 * in framework-vs-standard terms: a small subset of the full standard's
 * fields (summary, benefit, task + user story, feasibility gut-check, data
 * sensitivity, expected deliverable). Same fields, same export — this module
 * only decides which boxes count as answered. The UI says "essentials"
 * because "framework" already means agentic/compliance frameworks elsewhere
 * in the canvas.
 */

import type { CanvasData } from '@/types/canvas'

export interface FrameworkProgress {
  /** Project title + one-line description */
  summary: boolean
  /** Headline value or rough estimate */
  benefit: boolean
  /** At least one task with a title and a user story */
  tasks: boolean
  /** Project-level technical risk gut-check */
  feasibility: boolean
  /** A named dataset with an explicit personal-data answer */
  dataAccess: boolean
  /** A named main deliverable */
  outcomes: boolean
  completeCount: number
}

const filled = (s: string | undefined): boolean => Boolean(s && s.trim())

export function computeFrameworkProgress(data: CanvasData): FrameworkProgress {
  const project = data.project
  const requirements = data.userExpectations?.requirements ?? []
  const datasets = data.dataAccess?.datasets ?? []
  const deliverables = data.outcomes?.deliverables ?? []

  const summary = filled(project.title) && filled(project.description)
  // Number.isFinite also rejects the '' a cleared v-model.number input leaves behind, and null from older data
  const benefit = filled(project.headlineValue) || Number.isFinite(project.roughEstimateValue)
  const tasks = requirements.some((r) => filled(r.title) && filled(r.userStory))
  const feasibility = data.developerFeasibility?.technicalRisk !== undefined
  const dataAccess = datasets.some((d) => filled(d.title) && d.containsPersonalData !== undefined)
  // title AND type: a typeless deliverable would raise a validation error
  const outcomes = deliverables.some((d) => filled(d.title) && filled(d.type))

  const completeCount = [summary, benefit, tasks, feasibility, dataAccess, outcomes].filter(Boolean).length

  return { summary, benefit, tasks, feasibility, dataAccess, outcomes, completeCount }
}
