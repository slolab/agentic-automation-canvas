/**
 * Advisory compliance flags for task-level data access.
 *
 * A flag is raised when the combination of a task's model selection, a linked
 * dataset's sensitivity, and the agent's permitted actions suggests the user
 * may need a data-processing agreement, GDPR review, or enterprise licence.
 * Flags are advisory only — they never block the form (guide, don't force).
 */

import type { AgentDataAction, CanvasData, Dataset, Requirement, TaskDatasetLink } from '@/types/canvas'

export interface DataAccessFlag {
  taskId: string
  datasetId: string
  level: 'warning' | 'hint'
  message: string
}

const SENSITIVE_ACCESS_RIGHTS = new Set(['restricted', 'confidential', 'highly-restricted'])

/** Actions through which an agent consumes dataset content (generate alone does not) */
const CONSUMING_ACTIONS: AgentDataAction[] = ['read', 'modify', 'process']

function isSensitive(dataset: Dataset): boolean {
  if (dataset.containsPersonalData) return true
  return dataset.accessRights !== undefined && SENSITIVE_ACCESS_RIGHTS.has(dataset.accessRights)
}

function sensitivityLabel(dataset: Dataset): string {
  const parts: string[] = []
  if (dataset.accessRights && SENSITIVE_ACCESS_RIGHTS.has(dataset.accessRights)) {
    parts.push(dataset.accessRights)
  }
  if (dataset.containsPersonalData) {
    parts.push('contains personal data')
  }
  return parts.join(', ')
}

export function evaluateTaskDatasetLink(
  req: Requirement,
  dataset: Dataset,
  link: TaskDatasetLink
): DataAccessFlag | null {
  if (!isSensitive(dataset)) return null

  const actions = link.agentActions ?? []
  if (actions.length === 0) {
    return {
      taskId: req.id,
      datasetId: dataset.id,
      level: 'hint',
      message: `Specify what the agent may do with "${dataset.title}" in task "${req.title}" (read / modify / process / generate).`,
    }
  }

  const consumes = actions.some((a) => CONSUMING_ACTIONS.includes(a))
  if (!consumes) return null

  const model = req.feasibility?.modelSelection
  if (model === undefined) {
    return {
      taskId: req.id,
      datasetId: dataset.id,
      level: 'hint',
      message: `Task "${req.title}" lets an agent access the sensitive dataset "${dataset.title}" — select a model in Feasibility & Risks to check compliance.`,
    }
  }

  if (model === 'frontier-model') {
    return {
      taskId: req.id,
      datasetId: dataset.id,
      level: 'warning',
      message: `"${dataset.title}" (${sensitivityLabel(dataset)}) is accessed by an agent using a frontier model in task "${req.title}" — you may need a data-processing agreement (DPA), GDPR review, or an enterprise licence with the model provider.`,
    }
  }

  return null
}

/** Evaluate every task↔dataset link in the canvas. Links to deleted datasets are ignored. */
export function collectDataAccessFlags(data: CanvasData): DataAccessFlag[] {
  const requirements = data.userExpectations?.requirements ?? []
  const datasets = data.dataAccess?.datasets ?? []
  const datasetById = new Map(datasets.map((d) => [d.id, d]))

  const flags: DataAccessFlag[] = []
  for (const req of requirements) {
    for (const link of req.dataAccess?.datasetLinks ?? []) {
      const dataset = datasetById.get(link.datasetId)
      if (!dataset) continue
      const flag = evaluateTaskDatasetLink(req, dataset, link)
      if (flag) flags.push(flag)
    }
  }
  return flags
}
