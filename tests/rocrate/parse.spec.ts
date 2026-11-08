import { describe, it, expect } from 'vitest'
import { mapROCrateToCanvasCandidate } from '@/rocrate/parse'
import { generateROCrate } from '@/rocrate/export'
import { recoverCanvasToCurrent } from '@/schema/recovery'
import type { ROCrateJSONLD } from '@/types/rocrate'

/** Minimal RO-Crate 1.2: root dataset + one project entity, no requirements. */
const minimalRocrateFixture: ROCrateJSONLD = {
  '@context': 'https://w3id.org/ro/crate/1.2/context',
  '@graph': [
    {
      '@id': 'ro-crate-metadata.json',
      '@type': 'schema:CreativeWork',
      conformsTo: { '@id': 'https://w3id.org/ro/crate/1.2' },
      about: { '@id': './' },
    },
    {
      '@id': './',
      '@type': ['schema:Dataset', 'dcat:Dataset'],
      name: 'Crate',
      datePublished: '2025-01-01',
      'aac:version': '0.1.0',
      'aac:versionDate': '2025-01-01',
      about: { '@id': '#project' },
    },
    {
      '@id': '#project',
      '@type': ['schema:Project', 'schema:ResearchProject'],
      name: 'Fixture Project Title',
      description: 'Fixture description',
      'aac:version': '0.1.0',
      'aac:versionDate': '2025-01-01',
    },
  ],
}

/** Older RO-Crate 1.1 fixture for best-effort known-term recovery. */
const olderRocrateFixture: ROCrateJSONLD = {
  '@context': 'https://w3id.org/ro/crate/1.1/context',
  '@graph': [
    {
      '@id': 'ro-crate-metadata.json',
      '@type': 'schema:CreativeWork',
      conformsTo: { '@id': 'https://w3id.org/ro/crate/1.1' },
      about: { '@id': './' },
    },
    {
      '@id': './',
      '@type': ['schema:Dataset', 'dcat:Dataset'],
      name: 'Legacy Crate',
      'aac:version': '0.1.0',
      'aac:versionDate': '2025-01-01',
      about: { '@id': '#project' },
    },
    {
      '@id': '#project',
      '@type': ['schema:Project', 'schema:ResearchProject'],
      name: 'Legacy Project Title',
      description: 'Legacy description',
      'aac:version': '0.1.0',
      'aac:versionDate': '2025-01-01',
    },
  ],
}

const parseCurrent = (crate: ROCrateJSONLD) =>
  recoverCanvasToCurrent(mapROCrateToCanvasCandidate(crate)).data

describe('mapROCrateToCanvasCandidate', () => {
  it('parses minimal 1.2 crate to canvasData with project.title and project.version', () => {
    const canvasData = parseCurrent(minimalRocrateFixture)
    expect(canvasData.project.title).toBe('Fixture Project Title')
    expect(canvasData.project.description).toBe('Fixture description')
    expect(canvasData.project.version).toBe('0.1.0')
  })

  it('graph with root + project only yields no requirements', () => {
    const canvasData = parseCurrent(minimalRocrateFixture)
    expect(canvasData.userExpectations?.requirements).toBeUndefined()
  })

  it('recovers known terms from an older RO-Crate 1.1 context', () => {
    const canvasData = parseCurrent(olderRocrateFixture)
    expect(canvasData.project.title).toBe('Legacy Project Title')
    expect(canvasData.project.description).toBe('Legacy description')
    expect(canvasData.project.version).toBe('0.1.0')
  })

  it('follows root about instead of depending on project entity order', () => {
    const crate = structuredClone(minimalRocrateFixture)
    crate['@graph'].splice(2, 0, {
      '@id': '#unrelated-project',
      '@type': 'schema:Project',
      name: 'Unrelated project',
      description: 'Must not be selected merely because it appears first.',
    })

    const canvasData = parseCurrent(crate)

    expect(canvasData.project.title).toBe('Fixture Project Title')
    expect(canvasData.project.description).toBe('Fixture description')
  })

  it('follows project hasPlan instead of depending on plan entity order', () => {
    const crate = generateROCrate({
      project: { title: 'Plan project', description: 'Uses its referenced plan.' },
      userExpectations: {
        requirements: [{ id: 'actual-task', title: 'Actual task', benefits: [] }],
      },
    })
    crate['@graph'].splice(
      2,
      0,
      {
        '@id': '#unrelated-plan',
        '@type': 'p-plan:Plan',
        'p-plan:hasStep': [{ '@id': '#unrelated-task' }],
      },
      {
        '@id': '#unrelated-task',
        '@type': 'p-plan:Step',
        name: 'Unrelated task',
        'aac:benefits': [],
      },
    )

    const canvasData = parseCurrent(crate)

    expect(canvasData.userExpectations?.requirements).toHaveLength(1)
    expect(canvasData.userExpectations?.requirements?.[0].title).toBe('Actual task')
  })

  describe('model card URI import', () => {
    it('preserves modelCardUri through feasibility blob round-trip', () => {
      const crate: ROCrateJSONLD = {
        '@context': 'https://w3id.org/ro/crate/1.2/context',
        '@graph': [
          ...minimalRocrateFixture['@graph'],
          {
            '@id': '#user-plan',
            '@type': ['prov:Plan', 'p-plan:Plan'],
            name: 'User Plan',
            'p-plan:hasStep': [{ '@id': '#req-1' }],
          },
          {
            '@id': '#req-1',
            '@type': 'p-plan:Step',
            name: 'Task with model card',
            description: 'desc',
            'aac:benefits': [],
            'aac:feasibility': {
              modelSelection: 'frontier-model',
              modelName: 'gpt-4o',
              modelCardUri: 'https://example.com/model-card/gpt-4o',
            },
          },
        ],
      }
      const canvasData = parseCurrent(crate)
      const req = canvasData.userExpectations?.requirements?.[0]
      expect(req?.feasibility?.modelCardUri).toBe('https://example.com/model-card/gpt-4o')
    })

    it('imports modelCardUri from aac:model reference fallback', () => {
      const crate: ROCrateJSONLD = {
        '@context': 'https://w3id.org/ro/crate/1.2/context',
        '@graph': [
          ...minimalRocrateFixture['@graph'],
          {
            '@id': '#user-plan',
            '@type': ['prov:Plan', 'p-plan:Plan'],
            name: 'User Plan',
            'p-plan:hasStep': [{ '@id': '#req-1' }],
          },
          {
            '@id': '#req-1',
            '@type': 'p-plan:Step',
            name: 'Task with model ref',
            description: 'desc',
            'aac:benefits': [],
            'aac:feasibility': { modelSelection: 'frontier-model' },
            'aac:model': { '@id': 'https://example.com/model-card/gpt-4o' },
          },
          {
            '@id': 'https://example.com/model-card/gpt-4o',
            '@type': 'schema:SoftwareApplication',
            name: 'gpt-4o',
            'schema:applicationCategory': 'Machine Learning Model',
          },
        ],
      }
      const canvasData = parseCurrent(crate)
      const req = canvasData.userExpectations?.requirements?.[0]
      expect(req?.feasibility?.modelCardUri).toBe('https://example.com/model-card/gpt-4o')
      expect(req?.feasibility?.modelName).toBe('gpt-4o')
    })
  })

  describe('dataset sheet URI import', () => {
    it('imports datasetSheetUri from dcat:landingPage on dataset entity', () => {
      const crate: ROCrateJSONLD = {
        '@context': 'https://w3id.org/ro/crate/1.2/context',
        '@graph': [
          ...minimalRocrateFixture['@graph'],
          {
            '@id': '#dataset-0',
            '@type': 'dcat:Dataset',
            name: 'Test Dataset',
            'dct:accessRights': 'open',
            'dcat:landingPage': { '@id': 'https://example.com/sheets/ds-1' },
          },
        ],
      }
      const canvasData = parseCurrent(crate)
      const ds = canvasData.dataAccess?.datasets?.[0]
      expect(ds?.datasetSheetUri).toBe('https://example.com/sheets/ds-1')
    })

    it('uses schema:url as a best-effort datasetSheetUri fallback', () => {
      const crate: ROCrateJSONLD = {
        '@context': 'https://w3id.org/ro/crate/1.2/context',
        '@graph': [
          ...minimalRocrateFixture['@graph'],
          {
            '@id': '#dataset-0',
            '@type': 'dcat:Dataset',
            name: 'Legacy Dataset',
            'dct:accessRights': 'open',
            'schema:url': 'https://example.com/legacy/sheet',
          },
        ],
      }
      const canvasData = parseCurrent(crate)
      const ds = canvasData.dataAccess?.datasets?.[0]
      expect(ds?.datasetSheetUri).toBe('https://example.com/legacy/sheet')
    })
  })

  it('imports deploymentCost from feasibility blob', () => {
    const crate: ROCrateJSONLD = {
      '@context': 'https://w3id.org/ro/crate/1.2/context',
      '@graph': [
        ...minimalRocrateFixture['@graph'],
        {
          '@id': '#plan',
          '@type': 'p-plan:Plan',
          'p-plan:hasStep': [{ '@id': '#req-1' }],
        },
        {
          '@id': '#req-1',
          '@type': 'p-plan:Step',
          name: 'Task with cost',
          description: 'desc',
          'aac:benefits': [],
          'aac:feasibility': {
            deploymentCost: {
              costPerMonth: 50,
              aggregationBasis: 'perMonth',
              currency: 'EUR',
              costNotes: 'GPU instance',
            },
          },
        },
      ],
    }
    const canvasData = parseCurrent(crate)
    const req = canvasData.userExpectations?.requirements?.[0]
    expect(req?.feasibility?.deploymentCost).toEqual({
      costPerMonth: 50,
      aggregationBasis: 'perMonth',
      currency: 'EUR',
      costNotes: 'GPU instance',
    })
  })

  it('applies legacy requirement-level oversight to an embedded time benefit', () => {
    const crate: ROCrateJSONLD = {
      '@context': 'https://w3id.org/ro/crate/1.2/context',
      '@graph': [
        ...minimalRocrateFixture['@graph'],
        {
          '@id': '#plan',
          '@type': 'p-plan:Plan',
          'p-plan:hasStep': [{ '@id': '#req-1' }],
        },
        {
          '@id': '#req-1',
          '@type': 'p-plan:Step',
          name: 'Legacy task',
          'aac:humanOversightMinutesPerUnit': 12,
          'aac:benefits': [
            {
              benefitType: 'time',
              metricId: 'processingTime',
              metricLabel: 'Processing time',
              direction: 'decreaseIsBetter',
              valueMeaning: 'absolute',
              benefitUnit: 'minutes',
              baseline: { type: 'numeric', value: 30 },
              expected: { type: 'numeric', value: 10 },
            },
          ],
        },
      ],
    }

    const canvasData = parseCurrent(crate)

    expect(canvasData.userExpectations?.requirements?.[0].benefits[0]).toMatchObject({
      benefitType: 'time',
      oversightMinutesPerUnit: 12,
    })
  })

  it('maps centralized people and their stage-specific governance roles', () => {
    const crate: ROCrateJSONLD = {
      '@context': 'https://w3id.org/ro/crate/1.2/context',
      '@graph': [
        ...minimalRocrateFixture['@graph'],
        {
          '@id': '#person-alice',
          '@type': 'schema:Person',
          name: 'Alice Example',
          'aac:canvasId': 'person-alice',
          'aac:functionRoles': ['domain-expert'],
          'aac:localTitle': 'Principal Investigator',
        },
        {
          '@id': '#role-alice-reviewer',
          '@type': 'schema:Role',
          'schema:member': { '@id': '#person-alice' },
          'schema:roleName': 'reviewer',
          'aac:roleContext': 'stage-agent',
          'aac:stageId': '#stage-review',
          'aac:agentRoleContext': 'accountable',
        },
        {
          '@id': '#stage-review',
          '@type': 'prov:Activity',
          name: 'Review',
          startedAtTime: '2026-03-01T00:00:00Z',
          wasAssociatedWith: [{ '@id': '#person-alice' }],
          hasMilestone: [{ '@id': '#milestone-approved' }],
          'aac:policyCardUri': 'https://example.org/policy-card',
        },
        {
          '@id': '#milestone-approved',
          '@type': 'schema:Action',
          name: 'Approval complete',
          description: 'All checks passed',
        },
      ],
    }

    const canvasData = parseCurrent(crate)

    expect(canvasData.persons).toEqual([
      expect.objectContaining({
        id: 'person-alice',
        name: 'Alice Example',
        functionRoles: ['domain-expert'],
        localTitle: 'Principal Investigator',
      }),
    ])
    expect(canvasData.governance?.stages?.[0]).toMatchObject({
      id: 'stage-review',
      name: 'Review',
      startDate: '2026-03-01',
      agents: [
        {
          personId: 'person-alice',
          role: 'reviewer',
          roleContext: 'accountable',
          type: 'person',
        },
      ],
      milestones: [{ description: 'Approval complete', kpi: 'All checks passed' }],
      policyCardUri: 'https://example.org/policy-card',
    })
  })

  it('maps deliverables, publications, and evaluations into one outcomes section', () => {
    const crate: ROCrateJSONLD = {
      '@context': 'https://w3id.org/ro/crate/1.2/context',
      '@graph': [
        ...minimalRocrateFixture['@graph'],
        {
          '@id': '#person-alice',
          '@type': 'schema:Person',
          name: 'Alice Example',
          'aac:canvasId': 'person-alice',
        },
        {
          '@id': '#prototype',
          '@type': 'schema:CreativeWork',
          name: 'Prototype',
          description: 'Working demonstrator',
          'aac:outcomeType': 'deliverable',
        },
        {
          '@id': '#publication',
          '@type': 'schema:ScholarlyArticle',
          name: 'Findings',
          identifier: 'https://doi.org/10.1234/example',
          author: [
            {
              '@id': '#person-alice',
              '@type': 'schema:Person',
              name: 'Alice Example',
            },
          ],
        },
        {
          '@id': '#evaluation',
          '@type': 'schema:CreativeWork',
          name: 'Accuracy evaluation',
          description: 'Passed',
          'aac:evaluationType': 'accuracy',
          'aac:metrics': { score: 0.95 },
        },
      ],
    }

    const canvasData = parseCurrent(crate)

    expect(canvasData.outcomes).toMatchObject({
      deliverables: [
        {
          id: 'prototype',
          title: 'Prototype',
          type: 'CreativeWork',
          description: 'Working demonstrator',
        },
      ],
      publications: [
        {
          id: 'publication',
          title: 'Findings',
          doi: 'https://doi.org/10.1234/example',
          authors: [{ type: 'person', personId: 'person-alice' }],
        },
      ],
      evaluations: [
        {
          id: 'evaluation',
          type: 'accuracy',
          results: 'Passed',
          metrics: { score: 0.95 },
        },
      ],
    })
  })

  it('derives canvas ids from absolute entity URIs without mangling their fragments', () => {
    const canvasData = parseCurrent({
      '@context': 'https://w3id.org/ro/crate/1.2/context',
      '@graph': [
        {
          '@id': './',
          '@type': ['schema:Dataset', 'dcat:Dataset'],
          about: { '@id': '#project' },
        },
        {
          '@id': '#project',
          '@type': ['schema:Project', 'schema:ResearchProject'],
          name: 'External identifiers',
          description: 'Entities identified by absolute URIs.',
        },
        {
          '@id': 'https://example.org/people#alice',
          '@type': 'schema:Person',
          name: 'Alice',
        },
        {
          '@id': 'https://example.org/data#input',
          '@type': 'dcat:Dataset',
          name: 'Input dataset',
        },
      ],
    })

    expect(canvasData.persons?.[0].id).toBe('https://example.org/people#alice')
    expect(canvasData.dataAccess?.datasets?.[0].id).toBe('https://example.org/data#input')
  })

  it('recovers fundingGrant from a FRAPO Grant entity (export→import roundtrip)', () => {
    const crate = generateROCrate({
      project: {
        title: 'Funded Project',
        description: 'Desc',
        fundingGrant: 'ERC-2024-STG-101234567',
      },
    })
    const canvasData = parseCurrent(crate)
    expect(canvasData.project.fundingGrant).toBe('ERC-2024-STG-101234567')
  })
})
