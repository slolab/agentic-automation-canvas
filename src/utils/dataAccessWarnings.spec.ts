import { describe, it, expect } from 'vitest'
import { evaluateTaskDatasetLink, collectDataAccessFlags } from './dataAccessWarnings'
import type { CanvasData, Dataset, Requirement, TaskDatasetLink } from '@/types/canvas'

function makeRequirement(overrides: Partial<Requirement> = {}): Requirement {
  return {
    id: 'task-1',
    title: 'Extract key information',
    benefits: [],
    ...overrides,
  }
}

function makeDataset(overrides: Partial<Dataset> = {}): Dataset {
  return {
    id: 'ds-1',
    title: 'Patient letters',
    ...overrides,
  }
}

function makeLink(overrides: Partial<TaskDatasetLink> = {}): TaskDatasetLink {
  return {
    datasetId: 'ds-1',
    agentActions: ['read'],
    ...overrides,
  }
}

function frontierTask(overrides: Partial<Requirement> = {}): Requirement {
  return makeRequirement({
    feasibility: { modelSelection: 'frontier-model' },
    ...overrides,
  })
}

describe('evaluateTaskDatasetLink', () => {
  it('returns null for an open, non-personal dataset even with a frontier model', () => {
    const flag = evaluateTaskDatasetLink(
      frontierTask(),
      makeDataset({ accessRights: 'open', containsPersonalData: false }),
      makeLink({ agentActions: ['read', 'process'] })
    )
    expect(flag).toBeNull()
  })

  it('warns when a frontier model reads a restricted dataset', () => {
    const flag = evaluateTaskDatasetLink(
      frontierTask(),
      makeDataset({ accessRights: 'restricted' }),
      makeLink({ agentActions: ['read'] })
    )
    expect(flag).not.toBeNull()
    expect(flag!.level).toBe('warning')
    expect(flag!.message).toContain('data-processing agreement')
  })

  it('warns when a frontier model processes a dataset containing personal data', () => {
    const flag = evaluateTaskDatasetLink(
      frontierTask(),
      makeDataset({ accessRights: 'open', containsPersonalData: true }),
      makeLink({ agentActions: ['process'] })
    )
    expect(flag).not.toBeNull()
    expect(flag!.level).toBe('warning')
  })

  it('does not flag an on-premise/open-source model touching personal data (clinical step 1)', () => {
    const flag = evaluateTaskDatasetLink(
      makeRequirement({ feasibility: { modelSelection: 'open-source' } }),
      makeDataset({ accessRights: 'restricted', containsPersonalData: true }),
      makeLink({ agentActions: ['read', 'process', 'generate'] })
    )
    expect(flag).toBeNull()
  })

  it('does not flag a deterministic task (modelSelection none) on sensitive data', () => {
    const flag = evaluateTaskDatasetLink(
      makeRequirement({ feasibility: { modelSelection: 'none' } }),
      makeDataset({ accessRights: 'confidential' }),
      makeLink({ agentActions: ['process'] })
    )
    expect(flag).toBeNull()
  })

  it('does not warn when the agent only generates into a sensitive dataset', () => {
    const flag = evaluateTaskDatasetLink(
      frontierTask(),
      makeDataset({ accessRights: 'highly-restricted' }),
      makeLink({ agentActions: ['generate'] })
    )
    expect(flag).toBeNull()
  })

  it('hints to specify the model when a sensitive dataset is touched and no model is set', () => {
    const flag = evaluateTaskDatasetLink(
      makeRequirement(),
      makeDataset({ accessRights: 'restricted' }),
      makeLink({ agentActions: ['read'] })
    )
    expect(flag).not.toBeNull()
    expect(flag!.level).toBe('hint')
    expect(flag!.message.toLowerCase()).toContain('model')
  })

  it('hints to specify agent actions when a sensitive dataset is linked without actions', () => {
    const flag = evaluateTaskDatasetLink(
      frontierTask(),
      makeDataset({ accessRights: 'restricted' }),
      makeLink({ agentActions: [] })
    )
    expect(flag).not.toBeNull()
    expect(flag!.level).toBe('hint')
    expect(flag!.message.toLowerCase()).toContain('do with')
  })
})

describe('collectDataAccessFlags', () => {
  function clinicalCanvas(): CanvasData {
    // Sebastian's acceptance scenario: on-premise de-identification, then frontier
    // model on the cleaned corpus. Correctly configured → no flags at all.
    return {
      project: { title: 'Clinical workflow', description: '' },
      userExpectations: {
        requirements: [
          makeRequirement({
            id: 'task-deid',
            title: 'De-identify letters',
            feasibility: { modelSelection: 'open-source' },
            dataAccess: {
              datasetLinks: [
                { datasetId: 'ds-letters', agentActions: ['read', 'process', 'generate'] },
              ],
            },
          }),
          makeRequirement({
            id: 'task-extract',
            title: 'Clinical extraction',
            feasibility: { modelSelection: 'frontier-model' },
            dataAccess: {
              datasetLinks: [
                { datasetId: 'ds-clean', agentActions: ['read', 'process'] },
              ],
            },
          }),
        ],
      },
      dataAccess: {
        datasets: [
          makeDataset({ id: 'ds-letters', title: 'Patient letters', accessRights: 'restricted', containsPersonalData: true }),
          makeDataset({ id: 'ds-clean', title: 'De-identified corpus', accessRights: 'open', containsPersonalData: false }),
        ],
      },
    }
  }

  it('produces no flags for the correctly configured clinical workflow', () => {
    expect(collectDataAccessFlags(clinicalCanvas())).toEqual([])
  })

  it('flags exactly the misconfigured link when the frontier task reads raw letters', () => {
    const data = clinicalCanvas()
    data.userExpectations!.requirements![1].dataAccess!.datasetLinks!.push({
      datasetId: 'ds-letters',
      agentActions: ['read'],
    })
    const flags = collectDataAccessFlags(data)
    expect(flags).toHaveLength(1)
    expect(flags[0].taskId).toBe('task-extract')
    expect(flags[0].datasetId).toBe('ds-letters')
    expect(flags[0].level).toBe('warning')
  })

  it('ignores links to datasets that no longer exist', () => {
    const data = clinicalCanvas()
    data.userExpectations!.requirements![0].dataAccess!.datasetLinks!.push({
      datasetId: 'ds-deleted',
      agentActions: ['read'],
    })
    expect(collectDataAccessFlags(data)).toEqual([])
  })
})
