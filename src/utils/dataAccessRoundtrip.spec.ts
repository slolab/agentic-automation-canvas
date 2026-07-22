import { describe, it, expect } from 'vitest'
import { generateROCrate } from '@/utils/rocrate'
import { parseROCrateToCanvas } from '@/utils/import'
import type { ROCrateJSONLD } from '@/types/rocrate'
import type { CanvasData } from '@/types/canvas'

/**
 * Export → import roundtrips for task-level data access.
 * Links reference datasets by canvas dataset id, so ids must survive the trip.
 */

function clinicalCanvas(): CanvasData {
  return {
    project: { title: 'Clinical workflow', description: 'De-identify, then extract' },
    userExpectations: {
      requirements: [
        {
          id: 'task-deid',
          title: 'De-identify letters',
          benefits: [],
          feasibility: { modelSelection: 'open-source' },
          dataAccess: {
            datasetLinks: [{ datasetId: 'ds-letters', agentActions: ['read', 'process', 'generate'] }],
          },
        },
        {
          id: 'task-extract',
          title: 'Clinical extraction',
          benefits: [],
          feasibility: { modelSelection: 'frontier-model', modelCardUri: 'https://example.org/model-card' },
          dataAccess: {
            datasetLinks: [{ datasetId: 'ds-clean', agentActions: ['read', 'process'], notes: 'only cleaned data' }],
          },
        },
      ],
    },
    dataAccess: {
      datasets: [
        { id: 'ds-letters', title: 'Patient letters', accessRights: 'restricted', containsPersonalData: true },
        { id: 'ds-clean', title: 'De-identified corpus', accessRights: 'open', containsPersonalData: false },
      ],
    },
  }
}

describe('task data access roundtrip', () => {
  it('preserves canvas dataset ids as crate @ids (like requirement ids)', () => {
    const crate = generateROCrate(clinicalCanvas())
    const ids = crate['@graph'].map((e: { '@id': string }) => e['@id'])
    expect(ids).toContain('#ds-letters')
    expect(ids).toContain('#ds-clean')
  })

  it('exports aac:dataAccess on the step and links the step to datasets via prov:used', () => {
    const crate = generateROCrate(clinicalCanvas())
    const step = crate['@graph'].find((e: { '@id': string }) => e['@id'] === '#task-deid') as Record<string, unknown>
    expect(step).toBeDefined()
    expect(step['aac:dataAccess']).toEqual({
      datasetLinks: [{ datasetId: 'ds-letters', agentActions: ['read', 'process', 'generate'] }],
    })
    const used = step['prov:used']
    const usedIds = (Array.isArray(used) ? used : [used]).map((u) => (u as { '@id': string })['@id'])
    expect(usedIds).toContain('#ds-letters')
  })

  it('keeps the model reference in prov:used alongside dataset links', () => {
    const crate = generateROCrate(clinicalCanvas())
    const step = crate['@graph'].find((e: { '@id': string }) => e['@id'] === '#task-extract') as Record<string, unknown>
    const used = step['prov:used']
    const usedIds = (Array.isArray(used) ? used : [used]).map((u) => (u as { '@id': string })['@id'])
    expect(usedIds).toContain('https://example.org/model-card')
    expect(usedIds).toContain('#ds-clean')
  })

  it('roundtrips datasetLinks through export and import unchanged', () => {
    const crate = generateROCrate(clinicalCanvas()) as unknown as ROCrateJSONLD
    const imported = parseROCrateToCanvas(crate)

    const reqs = imported.userExpectations?.requirements ?? []
    const deid = reqs.find((r) => r.id === 'task-deid')
    const extract = reqs.find((r) => r.id === 'task-extract')

    expect(deid?.dataAccess?.datasetLinks).toEqual([
      { datasetId: 'ds-letters', agentActions: ['read', 'process', 'generate'] },
    ])
    expect(extract?.dataAccess?.datasetLinks).toEqual([
      { datasetId: 'ds-clean', agentActions: ['read', 'process'], notes: 'only cleaned data' },
    ])

    // the datasets the links point at still exist under the same ids
    const datasetIds = (imported.dataAccess?.datasets ?? []).map((d) => d.id)
    expect(datasetIds).toContain('ds-letters')
    expect(datasetIds).toContain('ds-clean')
  })

  it('roundtrips links whose dataset id is not a valid crate fragment (e.g. a URI)', () => {
    const data = clinicalCanvas()
    data.dataAccess!.datasets![0].id = 'https://doi.org/10.1234/abc'
    data.userExpectations!.requirements![0].dataAccess!.datasetLinks![0].datasetId =
      'https://doi.org/10.1234/abc'

    const crate = generateROCrate(data) as unknown as ROCrateJSONLD
    const imported = parseROCrateToCanvas(crate)

    // whatever id the dataset comes back under, the link must still point at it
    const deid = imported.userExpectations?.requirements?.find((r) => r.id === 'task-deid')
    const linkId = deid?.dataAccess?.datasetLinks?.[0]?.datasetId
    const datasetIds = (imported.dataAccess?.datasets ?? []).map((d) => d.id)
    expect(linkId).toBeTruthy()
    expect(datasetIds).toContain(linkId)
  })

  it('never emits duplicate @ids when fallback and preserved dataset ids collide', () => {
    const data = clinicalCanvas()
    data.dataAccess!.datasets = [
      // index 0 fails the fragment regex, so its fallback would be #dataset-0…
      { id: 'https://doi.org/10.1234/abc', title: 'External corpus' },
      // …which must not collide with this preserved id or with the task-deid step
      { id: 'dataset-0', title: 'Legacy corpus' },
      { id: 'task-deid', title: 'Same id as a task' },
    ]
    const crate = generateROCrate(data)
    const ids = crate['@graph'].map((e: { '@id': string }) => e['@id'])
    expect(new Set(ids).size).toBe(ids.length)
  })
})
