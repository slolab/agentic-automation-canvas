import { describe, expect, it } from 'vitest'
import { isRecord } from '@/json'
import { validateCurrentCanvas } from '@/schema/validation'
import type { CanvasData } from '@/types/canvas'
import { generateROCrate } from '@/rocrate/export'
import { importROCrateDocument } from '@/rocrate/import'
import { AAC_CURRENT_SCHEMA } from '@/schema/contract'

type JsonSchema = Record<string, unknown>

function resolveSchema(node: JsonSchema): JsonSchema {
  const reference = node.$ref
  if (typeof reference !== 'string' || !reference.startsWith('#/')) return node
  const resolved = reference
    .slice(2)
    .split('/')
    .reduce<unknown>((value, segment) =>
      isRecord(value) ? value[segment.replace(/~1/g, '/').replace(/~0/g, '~')] : undefined,
    AAC_CURRENT_SCHEMA)
  if (!isRecord(resolved)) throw new Error(`Unresolvable schema reference: ${reference}`)
  return resolved
}

function matchesConstProperties(value: unknown, node: JsonSchema): boolean {
  if (!isRecord(value) || !isRecord(node.properties)) return true
  return Object.entries(node.properties).every(([key, property]) =>
    !isRecord(property) || property.const === undefined || value[key] === property.const,
  )
}

/**
 * The round-trip fixture is intentionally schema-exhaustive: every declared
 * field and discriminated union branch must occur at least once. Adding an
 * optional schema field therefore breaks this test until its mapping is covered.
 */
function expectSchemaCoverage(
  schema: JsonSchema,
  candidates: readonly unknown[],
  path = 'canvas',
): void {
  const node = resolveSchema(schema)
  for (const keyword of ['oneOf', 'anyOf', 'allOf'] as const) {
    const branches = node[keyword]
    if (!Array.isArray(branches)) continue
    branches.forEach((branch, index) => {
      if (!isRecord(branch)) return
      const resolvedBranch = resolveSchema(branch)
      const branchCandidates = candidates.filter((candidate) =>
        matchesConstProperties(candidate, resolvedBranch),
      )
      expect(branchCandidates.length, `${path} must cover ${keyword}[${index}]`).toBeGreaterThan(0)
      expectSchemaCoverage(resolvedBranch, branchCandidates, path)
    })
  }

  if (isRecord(node.items)) {
    const items = candidates.flatMap((candidate) => Array.isArray(candidate) ? candidate : [])
    expectSchemaCoverage(node.items, items, `${path}[]`)
  }

  if (!isRecord(node.properties)) return
  Object.entries(node.properties).forEach(([key, propertySchema]) => {
    if (!isRecord(propertySchema)) return
    const propertyCandidates = candidates
      .filter((candidate) =>
        isRecord(candidate) && Object.prototype.hasOwnProperty.call(candidate, key),
      )
      .map((candidate) => (candidate as Record<string, unknown>)[key])
    expect(propertyCandidates.length, `${path}.${key} must be represented`).toBeGreaterThan(0)
    expectSchemaCoverage(propertySchema, propertyCandidates, `${path}.${key}`)
  })
}

const completeCanvas = (): CanvasData => ({
  version: '1.2.3',
  versionDate: '2026-08-01',
  persons: [
    {
      id: 'person-lead',
      name: 'Ada Lovelace',
      affiliation: 'Analytical Engine Lab',
      orcid: 'https://orcid.org/0000-0001-2345-6789',
      functionRoles: ['project-lead', 'researcher'],
      localTitle: 'Principal Investigator',
    },
  ],
  project: {
    title: 'Complete project',
    description: 'Exercises every current round-trip mapping.',
    objective: 'Prevent schema-defined data loss.',
    problemFrequency: 'weekly',
    problemExamples: ['The latest crate import dropped a schema field.'],
    projectStage: 'development',
    startDate: '2026-08-01',
    endDate: '2026-12-01',
    domain: ['research'],
    keywords: ['automation'],
    fundingGrant: 'GRANT-1',
    leadOrganization: 'Analytical Engine Lab',
    projectId: 'https://example.org/projects/complete',
    headlineValue: 'Reliable conversion',
    primaryValueDriver: 'quality',
    roughEstimateValue: 42,
    roughEstimateUnit: 'hours/month',
    creator: ['person-lead'],
    license: 'https://creativecommons.org/licenses/by/4.0/',
    version: '1.2.3',
    versionDate: '2026-08-01',
  },
  userExpectations: {
    requirements: [
      {
        id: 'requirement-1',
        title: 'Preserve a task',
        description: 'Task description',
        userStory: 'As a maintainer, I can round-trip the task.',
        priority: 'high',
        status: 'in-progress',
        value: 'No silent data loss',
        unitOfWork: 'one crate',
        unitCategory: 'item',
        volumePerMonth: 10,
        timeUnit: 'minutes',
        benefits: [
          {
            benefitType: 'time',
            metricId: 'processingTime',
            metricLabel: 'Processing time',
            direction: 'targetIsBetter',
            valueMeaning: 'absolute',
            target: 10,
            aggregationBasis: 'perUnit',
            benefitUnit: 'minutes',
            baseline: { type: 'numeric', value: 30 },
            expected: { type: 'numeric', value: 10 },
            oversightMinutesPerUnit: 2,
            confidenceUser: 'high',
            confidenceDev: 'medium',
            assumptions: 'Stable monthly volume',
          },
          {
            benefitType: 'quality',
            metricId: 'reviewQuality',
            metricLabel: 'Review quality',
            direction: 'increaseIsBetter',
            valueMeaning: 'absolute',
            aggregationBasis: 'perMonth',
            benefitUnit: 'rating',
            baseline: { type: 'categorical', category: 'low' },
            expected: { type: 'categorical', category: 'high' },
            oversightMinutesPerMonth: 20,
          },
          {
            benefitType: 'risk',
            metricId: 'incidentPrevented',
            metricLabel: 'Incident prevented',
            direction: 'boolIsBetter',
            valueMeaning: 'absolute',
            benefitUnit: 'boolean',
            baseline: { type: 'binary', bool: false },
            expected: { type: 'binary', bool: true },
          },
          {
            benefitType: 'unclassified',
            description: 'Fewer manual corrections',
          },
          {
            benefitType: 'unclassified',
            metricLabel: 'Manual corrections per month',
          },
        ],
        dependsOn: [],
        stakeholders: ['person-lead'],
        targetPopulation: 'AAC maintainers',
        feasibility: {
          technicalRisk: 'low',
          effortEstimate: { value: 2, unit: 'weeks' },
          feasibilityNotes: 'Known mapping work',
          algorithms: ['deterministic mapping'],
          tools: ['TypeScript'],
          modelSelection: 'frontier-model',
          modelName: 'Example Model',
          modelCardUri: 'https://example.org/models/example',
          technologyApproach: {
            architecture: 'agents',
            approaches: [
              'agentic-user-support',
              'unstructured-content-processing',
              'code-development',
              'computer-use',
              'live-event-monitoring',
              'intelligent-search',
              'agentic-research-support',
              'data-metadata-curation',
              'analysis-pipeline-orchestration',
              'experiment-protocol-design',
              'laboratory-workflow-coordination',
              'other',
            ],
            customApproaches: [
              'Human-in-the-loop exception routing',
              'Domain-specific quality review',
            ],
            ragDetails: {
              retrievalMethod: 'hybrid',
              embeddingModel: 'example-embedding',
              chunkingStrategy: 'semantic',
            },
            fineTuningDetails: {
              baseModel: 'example-base',
              tuningApproach: 'LoRA',
              dataset: 'dataset-1',
            },
            agenticDetails: {
              framework: ['ReAct'],
              tools: ['RO-Crate validator'],
              orchestration: ['State machine'],
            },
          },
          risks: [
            {
              id: 'risk-1',
              riskCategory: 'technical',
              title: 'Mapping regression',
              description: 'A schema field could be omitted.',
              likelihood: 'low',
              impact: 'high',
              mitigation: 'Run the exhaustive round-trip test.',
              status: 'mitigated',
            },
          ],
          deploymentCost: {
            costPerUnit: 0.5,
            costPerMonth: 5,
            aggregationBasis: 'perMonth',
            currency: 'EUR',
            costNotes: 'Hosting',
          },
        },
        dataAccess: {
          datasetLinks: [
            {
              datasetId: 'dataset-1',
              agentActions: ['read', 'process'],
              notes: 'Read-only processing',
            },
          ],
        },
      },
    ],
  },
  developerFeasibility: {
    trlLevel: { current: 3, target: 6 },
    technicalRisk: 'medium',
    effortEstimate: { value: 4, unit: 'weeks' },
    feasibilityNotes: 'Feasible',
    solutionsToResearch: 'Existing RO-Crate schema mapping tools',
    constraintFlags: [
      'large-data',
      'cluster-compute',
      'large-gpu',
      'personal-data',
      'valuable-ip',
      'external-system-integration',
      'restricted-processing-environment',
      'real-time',
      'regulated-or-high-impact',
      'procurement-or-licensing',
    ],
  },
  governance: {
    buildTeamStatus: 'committed',
    maintenanceOwnerStatus: 'possible',
    stages: [
      {
        id: 'stage-review',
        name: 'Review',
        startDate: '2026-09-01',
        endDate: '2026-09-30',
        agents: [
          {
            personId: 'person-lead',
            role: 'Approver',
            type: 'person',
            roleContext: 'final review',
          },
          {
            name: 'Quality Team',
            role: 'Reviewer',
            type: 'organization',
            roleContext: 'quality gate',
          },
        ],
        milestones: [{ description: 'Review complete', kpi: 'Zero lost fields' }],
        complianceStandards: [
          'Internal policy',
          {
            framework: 'NIST AI RMF',
            clauses: ['GOVERN-1'],
            uri: 'https://www.nist.gov/itl/ai-risk-management-framework',
          },
        ],
        policyCardUri: 'https://example.org/policy-card.json',
      },
    ],
  },
  dataAccess: {
    datasets: [
      {
        id: 'dataset-1',
        title: 'Input dataset',
        description: 'Dataset description',
        format: 'application/json',
        license: 'https://creativecommons.org/licenses/by/4.0/',
        accessRights: 'restricted',
        duoTerms: ['https://purl.org/ga4gh/duo.owl#DUO:0000006'],
        pid: 'https://example.org/datasets/1',
        datasetSheetUri: 'https://example.org/datasets/1/sheet',
        publisher: 'Analytical Engine Lab',
        containsPersonalData: false,
        sensitivityLevel: 'medium',
      },
    ],
  },
  outcomes: {
    deliverables: [
      {
        id: 'deliverable-1',
        title: 'Converter',
        type: 'SoftwareApplication',
        description: 'A lossless converter',
        date: '2026-10-01',
        pid: 'https://example.org/software/converter',
      },
    ],
    publications: [
      {
        id: 'publication-1',
        title: 'Reliable RO-Crate Conversion',
        doi: 'https://doi.org/10.1234/example',
        authors: [
          { type: 'person', personId: 'person-lead' },
          { type: 'organization', name: 'Quality Team' },
        ],
        date: '2026-11-01',
      },
    ],
    evaluations: [
      {
        id: 'evaluation-1',
        type: 'round-trip',
        date: '2026-11-02',
        metrics: { preservedFields: 42, nested: { passed: true } },
        results: 'All fields preserved',
      },
    ],
  },
})

describe('current AAC RO-Crate round trip', () => {
  it('covers every current schema field and discriminated value branch', () => {
    expectSchemaCoverage(AAC_CURRENT_SCHEMA, [completeCanvas()])
  })

  it('preserves the complete schema-defined model', () => {
    const source = completeCanvas()
    expect(validateCurrentCanvas(source).diagnostics).toEqual([])

    const imported = importROCrateDocument(generateROCrate(source))

    expect(imported.diagnostics).toEqual([])
    expect(imported.canvasData).toEqual(source)
    expect(validateCurrentCanvas(imported.canvasData).diagnostics).toEqual([])
  })

  it('reopens a partial draft without deleting its unfinished records', () => {
    // A partial export represents an unanswered required prompt as an empty
    // string. Recovery is built to carry that across a reopen, but only if the
    // parser hands it the empty string instead of `undefined`; otherwise the
    // required property looks missing and the enclosing person or task is
    // dropped, and the blank project title is replaced by a placeholder.
    const source: CanvasData = {
      persons: [{ id: 'person-1', name: '' }],
      project: { title: '', description: '' },
      userExpectations: {
        requirements: [{
          id: 'requirement-1',
          title: '',
          targetPopulation: 'Referral coordinators',
          benefits: [{ benefitType: 'unclassified', description: 'Less waiting' }],
        }],
      },
      dataAccess: { datasets: [{ id: 'dataset-1', title: '', containsPersonalData: true }] },
    }

    const imported = importROCrateDocument(generateROCrate(source, { allowPartial: true }))

    expect(imported.canvasData.project.title).toBe('')
    expect(imported.canvasData.persons).toEqual([{ id: 'person-1', name: '' }])
    const requirement = imported.canvasData.userExpectations?.requirements?.[0]
    expect(requirement?.title).toBe('')
    expect(requirement?.targetPopulation).toBe('Referral coordinators')
    expect(requirement?.benefits).toEqual([
      { benefitType: 'unclassified', description: 'Less waiting' },
    ])
    expect(imported.canvasData.dataAccess?.datasets).toEqual([
      { id: 'dataset-1', title: '', containsPersonalData: true },
    ])
    expect(imported.diagnostics.map((diagnostic) => diagnostic.code)).not.toContain(
      'recovery.invalidFieldDropped',
    )
    expect(imported.diagnostics.map((diagnostic) => diagnostic.code)).not.toContain(
      'recovery.requiredValueDefaulted',
    )
  })

  it('preserves schema-valid logical IDs when crate fragment fallbacks are required', () => {
    const source: CanvasData = {
      persons: [{ id: 'Ada Lovelace', name: 'Ada Lovelace' }],
      project: {
        title: 'Identifier project',
        description: 'Exercises logical IDs that are not safe JSON-LD fragments.',
        creator: ['Ada Lovelace'],
      },
      userExpectations: {
        requirements: [
          {
            id: 'Task 1',
            title: 'Task with a spaced identifier',
            benefits: [],
          },
        ],
      },
    }

    const imported = importROCrateDocument(generateROCrate(source))

    expect(imported.canvasData.persons?.[0].id).toBe('Ada Lovelace')
    expect(imported.canvasData.project.creator).toEqual(['Ada Lovelace'])
    expect(imported.canvasData.userExpectations?.requirements?.[0].id).toBe('Task 1')
  })

  it('derives each exported deliverable id from its own canvas id', () => {
    const crate = generateROCrate({
      project: { title: 'Deliverable identity', description: 'An untitled draft is skipped.' },
      outcomes: {
        deliverables: [
          { id: 'draft-not-titled-yet', title: '', type: 'Report' },
          { id: 'real-report', title: 'Real report', type: 'Report' },
        ],
      },
    })

    const deliverables = crate['@graph'].filter(
      (entity) => entity['aac:outcomeType'] === 'deliverable',
    )
    expect(deliverables).toHaveLength(1)
    expect(deliverables[0]['@id']).toBe('#real-report')
    expect(deliverables[0]['aac:canvasId']).toBe('real-report')

    const root = crate['@graph'].find((entity) => entity['@id'] === './')
    expect(root?.hasPart).toEqual(expect.arrayContaining([{ '@id': '#real-report' }]))
    expect(root?.hasPart).not.toEqual(
      expect.arrayContaining([{ '@id': '#draft-not-titled-yet' }]),
    )
  })

  it('keeps JSON-LD entity identities unique when logical IDs repeat', () => {
    const source: CanvasData = {
      version: '1.0.0',
      versionDate: '2026-08-11',
      persons: [{ id: 'shared', name: 'Shared person' }],
      project: {
        title: 'Identity allocation project',
        description: 'Logical identifiers may repeat across schema sections.',
        creator: ['shared'],
        version: '1.0.0',
        versionDate: '2026-08-11',
      },
      userExpectations: {
        requirements: [
          { id: 'shared', title: 'First duplicate task', benefits: [] },
          { id: 'shared', title: 'Second duplicate task', benefits: [] },
        ],
      },
      governance: {
        stages: [{ id: 'shared', name: 'Shared stage' }],
      },
      dataAccess: {
        datasets: [{ id: 'shared', title: 'Shared dataset' }],
      },
      outcomes: {
        deliverables: [{ id: 'shared', title: 'Shared deliverable', type: 'Report' }],
        publications: [{ id: 'shared', title: 'Shared publication' }],
        evaluations: [{ id: 'shared', type: 'Shared evaluation' }],
      },
    }

    const crate = generateROCrate(source)
    const localIds = crate['@graph']
      .map((entity) => entity['@id'])
      .filter((id) => id.startsWith('#'))
    expect(new Set(localIds).size).toBe(localIds.length)

    const imported = importROCrateDocument(crate)
    expect(imported.canvasData).toEqual(source)
  })
})
