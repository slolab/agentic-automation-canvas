import { afterEach, describe, expect, it, vi } from 'vitest'
import { importROCrateDocument } from '@/rocrate/import'
import { validateCurrentCanvas } from '@/schema/validation'
import { AAC_RO_CRATE_PROFILE_ID } from '@/schema/contract'

const nonCurrentCrate: {
  '@context': string
  '@graph': Array<Record<string, unknown>>
} = {
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
      'aac:schemaVersion': '0.14.0',
      'aac:developerFeasibility': {
        technicalRisk: 'medium',
        legacyOnlyField: true,
      },
      about: { '@id': '#project' },
    },
    {
      '@id': '#project',
      '@type': ['schema:Project', 'schema:ResearchProject'],
      name: 'Recoverable legacy project',
      description: 'Valid siblings remain viewable.',
    },
    {
      '@type': 'schema:CreativeWork',
      name: 'Malformed entity without an id',
    },
  ],
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('tolerant current-model RO-Crate import', () => {
  it('uses one best-effort path for non-current schemas and retains recoverable data', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    const result = importROCrateDocument(nonCurrentCrate)

    expect(result.crateSchemaVersion).toBe('0.14.0')
    expect(result.canvasData.project.title).toBe('Recoverable legacy project')
    expect(validateCurrentCanvas(result.canvasData).diagnostics).toEqual([])
    expect(result.canvasData.developerFeasibility).toEqual({ technicalRisk: 'medium' })
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ severity: 'warning', code: 'rocrate.schemaVersionNonCurrent' }),
        expect.objectContaining({
          severity: 'error',
          code: 'rocrate.invalidEntity',
          path: '/@graph/3',
        }),
        expect.objectContaining({
          code: 'recovery.undeclaredFieldDropped',
          path: '/developerFeasibility/legacyOnlyField',
        }),
      ]),
    )
    expect(warn).toHaveBeenCalled()
  })

  it('warns when the schema version is missing but loads recoverable content', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const crateWithoutVersion = structuredClone(nonCurrentCrate)
    const root = crateWithoutVersion['@graph'][1]
    delete root['aac:schemaVersion']

    const result = importROCrateDocument(crateWithoutVersion)

    expect(result.canvasData.project.title).toBe('Recoverable legacy project')
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'rocrate.profileMissing' }),
        expect.objectContaining({ code: 'rocrate.schemaVersionMissing' }),
      ]),
    )
  })

  it('warns for a non-current profile while preserving recoverable content', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const crate = structuredClone(nonCurrentCrate)
    crate['@graph'][1].conformsTo = { '@id': 'https://w3id.org/aac/profile/99.0.0' }

    const result = importROCrateDocument(crate)

    expect(result.crateProfileId).toBe('https://w3id.org/aac/profile/99.0.0')
    expect(result.canvasData.project.title).toBe('Recoverable legacy project')
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'rocrate.profileNonCurrent' }),
      ]),
    )
  })

  it('treats an unknown future schema like every other non-current version', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const crate = structuredClone(nonCurrentCrate)
    crate['@graph'][1]['aac:schemaVersion'] = '99.0.0'
    crate['@graph'][1].conformsTo = { '@id': AAC_RO_CRATE_PROFILE_ID }

    const result = importROCrateDocument(crate)

    expect(result.canvasData.project.title).toBe('Recoverable legacy project')
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'rocrate.schemaVersionNonCurrent' }),
      ]),
    )
    expect(result.diagnostics).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'rocrate.profileNonCurrent' }),
      ]),
    )
  })

  it('reports unreadable required text instead of opening a silently empty canvas', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    const result = importROCrateDocument({
      '@context': 'https://w3id.org/ro/crate/1.2/context',
      '@graph': [
        { '@id': './', '@type': ['schema:Dataset'], about: { '@id': '#project' } },
        { '@id': '#project', '@type': ['schema:Project'] },
      ],
    })

    expect(result.canvasData.project.title).toBe('Untitled imported project')
    expect(result.canvasData.project.description).toBe(
      'No project description could be recovered.',
    )
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'recovery.requiredValueDefaulted',
          path: '/project/title',
        }),
        expect.objectContaining({
          code: 'recovery.requiredValueDefaulted',
          path: '/project/description',
        }),
      ]),
    )
  })

  it('drops a task and a person the crate gives no readable identity, with findings', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    const result = importROCrateDocument({
      '@context': 'https://w3id.org/ro/crate/1.2/context',
      '@graph': [
        { '@id': './', '@type': ['schema:Dataset'], about: { '@id': '#project' } },
        {
          '@id': '#project',
          '@type': ['schema:Project'],
          name: 'Nameless members',
          description: 'The crate omits a task title and a person name.',
          hasPlan: { '@id': '#plan' },
        },
        { '@id': '#plan', '@type': 'p-plan:Plan', 'p-plan:hasStep': [{ '@id': '#task' }] },
        { '@id': '#task', '@type': 'p-plan:Step', 'aac:benefits': [] },
        { '@id': '#someone', '@type': 'schema:Person' },
      ],
    })

    expect(result.canvasData.userExpectations?.requirements ?? []).toEqual([])
    expect(result.canvasData.persons ?? []).toEqual([])
    expect(
      result.diagnostics.filter((diagnostic) => diagnostic.code === 'recovery.invalidFieldDropped'),
    ).not.toEqual([])
  })

  it('reports incompatible values for known mapped fields instead of silently omitting them', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const crate = structuredClone(nonCurrentCrate)
    Object.assign(crate['@graph'][2], {
      'aac:primaryValueDriver': 'sustainability',
      'aac:roughEstimateValue': 'ten',
      hasPlan: { '@id': '#plan' },
    })
    crate['@graph'].push(
      {
        '@id': '#plan',
        '@type': 'p-plan:Plan',
        'p-plan:hasStep': [{ '@id': '#task' }],
      },
      {
        '@id': '#task',
        '@type': 'p-plan:Step',
        name: 'Future task',
        priority: 'urgent',
        'aac:timeUnit': 'days',
        'aac:benefits': [],
      },
      {
        '@id': '#dataset',
        '@type': 'schema:Dataset',
        name: 'Future dataset',
        'dct:accessRights': 'embargoed',
      },
    )

    const result = importROCrateDocument(crate)

    expect(result.canvasData.project.title).toBe('Recoverable legacy project')
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: '/project/primaryValueDriver' }),
        expect.objectContaining({ path: '/project/roughEstimateValue' }),
        expect.objectContaining({ path: '/userExpectations/requirements/0/priority' }),
        expect.objectContaining({ path: '/userExpectations/requirements/0/timeUnit' }),
        expect.objectContaining({ path: '/dataAccess/datasets/0/accessRights' }),
      ]),
    )
  })
})
