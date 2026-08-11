import { describe, it, expect } from 'vitest'
import { generateAgentInstructions } from '@/utils/agent-instructions'
import type { CanvasData } from '@/types/canvas'

function canvasWithLinks(): CanvasData {
  return {
    project: { title: 'Clinical workflow', description: 'De-identify, then extract' },
    userExpectations: {
      requirements: [
        {
          id: 'task-deid',
          title: 'De-identify letters',
          benefits: [],
          dataAccess: {
            datasetLinks: [{ datasetId: 'ds-letters', agentActions: ['read', 'process', 'generate'] }],
          },
        },
        {
          id: 'task-extract',
          title: 'Clinical extraction',
          benefits: [],
          dataAccess: {
            datasetLinks: [{ datasetId: 'ds-clean', agentActions: ['read'], notes: 'only cleaned data' }],
          },
        },
      ],
    },
    dataAccess: {
      datasets: [
        { id: 'ds-letters', title: 'Patient letters', format: 'PDF', accessRights: 'restricted', containsPersonalData: true },
        { id: 'ds-clean', title: 'De-identified corpus', format: 'CSV', accessRights: 'open' },
      ],
    },
  }
}

describe('generateAgentInstructions — task data access', () => {
  it('marks datasets containing personal data in the Data section', () => {
    const md = generateAgentInstructions(canvasWithLinks())
    expect(md).toContain('- Patient letters (PDF, restricted, contains personal data)')
  })

  it('lists per-task agent permissions with actions and notes', () => {
    const md = generateAgentInstructions(canvasWithLinks())
    expect(md).toContain('### Agent data access by task')
    expect(md).toContain('- De-identify letters: Patient letters — read, process, generate')
    expect(md).toContain('- Clinical extraction: De-identified corpus — read (only cleaned data)')
  })

  it('adds a guardrail line when task permissions exist', () => {
    const md = generateAgentInstructions(canvasWithLinks())
    expect(md).toContain('Do not let agents access datasets beyond the permissions listed above.')
  })

  it('omits the per-task subsection when no task links exist', () => {
    const data = canvasWithLinks()
    for (const req of data.userExpectations!.requirements!) {
      delete req.dataAccess
    }
    const md = generateAgentInstructions(data)
    expect(md).not.toContain('### Agent data access by task')
    expect(md).not.toContain('Do not let agents access datasets')
  })

  it('renders unclassified benefits without assuming metric fields', () => {
    const data = canvasWithLinks()
    data.userExpectations!.requirements![0].benefits = [
      { benefitType: 'unclassified', description: 'Reduce manual review time' },
      { benefitType: 'unclassified', metricLabel: 'Minutes saved per case' },
    ]

    const md = generateAgentInstructions(data)
    expect(md).toContain('- Unclassified benefit: Reduce manual review time')
    expect(md).toContain('- Unclassified benefit: Minutes saved per case')
  })
})
