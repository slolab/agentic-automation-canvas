import { describe, it, expect } from 'vitest'
import { generateROCrate } from '@/utils/rocrate'
import type { CanvasData } from '@/types/canvas'

const minimalCanvasData: CanvasData = {
  project: {
    title: 'Minimal Project',
    description: '',
  },
}

describe('generateROCrate', () => {
  it('returns @graph that exists and is an array', () => {
    const out = generateROCrate(minimalCanvasData)
    expect(out['@graph']).toBeDefined()
    expect(Array.isArray(out['@graph'])).toBe(true)
  })

  it('contains root entity with @id "./"', () => {
    const out = generateROCrate(minimalCanvasData)
    const root = out['@graph'].find((e: { '@id': string }) => e['@id'] === './')
    expect(root).toBeDefined()
  })

  it('root has aac:version', () => {
    const out = generateROCrate(minimalCanvasData)
    const root = out['@graph'].find((e: { '@id': string }) => e['@id'] === './') as Record<string, unknown>
    expect(root['aac:version']).toBeDefined()
    expect(typeof root['aac:version']).toBe('string')
  })

  it('with schemaVersion option, root has aac:schemaVersion', () => {
    const out = generateROCrate(minimalCanvasData, { schemaVersion: '0.10.0' })
    const root = out['@graph'].find((e: { '@id': string }) => e['@id'] === './') as Record<string, unknown>
    expect(root['aac:schemaVersion']).toBe('0.10.0')
  })

  it('metadata descriptor conformsTo references RO-Crate 1.2', () => {
    const out = generateROCrate(minimalCanvasData)
    const descriptor = out['@graph'].find(
      (e: { '@id': string }) => e['@id'] === 'ro-crate-metadata.json',
    ) as Record<string, unknown>
    expect(descriptor).toBeDefined()
    expect((descriptor.conformsTo as { '@id': string })['@id']).toBe(
      'https://w3id.org/ro/crate/1.2',
    )
  })

  it('root has datePublished in ISO date format', () => {
    const out = generateROCrate(minimalCanvasData)
    const root = out['@graph'].find((e: { '@id': string }) => e['@id'] === './') as Record<string, unknown>
    expect(root.datePublished).toBeDefined()
    expect(root.datePublished).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('includes license contextual entity when project has license', () => {
    const dataWithLicense: CanvasData = {
      project: {
        title: 'Licensed Project',
        description: '',
        license: 'https://creativecommons.org/licenses/by/4.0/',
      },
    }
    const out = generateROCrate(dataWithLicense)
    const root = out['@graph'].find((e: { '@id': string }) => e['@id'] === './') as Record<string, unknown>
    expect((root.license as { '@id': string })['@id']).toBe(
      'https://creativecommons.org/licenses/by/4.0/',
    )
    const licenseEntity = out['@graph'].find(
      (e: { '@id': string }) => e['@id'] === 'https://creativecommons.org/licenses/by/4.0/',
    )
    expect(licenseEntity).toBeDefined()
  })

  it('does not include license when project has no license', () => {
    const out = generateROCrate(minimalCanvasData)
    const root = out['@graph'].find((e: { '@id': string }) => e['@id'] === './') as Record<string, unknown>
    expect(root.license).toBeUndefined()
  })

  describe('model card URI export', () => {
    const dataWithModelCard: CanvasData = {
      project: { title: 'Model Card Test', description: '' },
      userExpectations: {
        requirements: [
          {
            id: 'req-1',
            title: 'Task with model card',
            benefits: [],
            feasibility: {
              modelSelection: 'frontier-model',
              modelName: 'gpt-4o',
              modelCardUri: 'https://example.com/model-card/gpt-4o',
            },
          },
        ],
      },
    }

    it('emits SoftwareApplication entity for model card URI', () => {
      const out = generateROCrate(dataWithModelCard)
      const modelEntity = out['@graph'].find(
        (e: Record<string, unknown>) => e['@id'] === 'https://example.com/model-card/gpt-4o',
      ) as Record<string, unknown>
      expect(modelEntity).toBeDefined()
      expect(modelEntity['@type']).toBe('schema:SoftwareApplication')
      expect(modelEntity['schema:applicationCategory']).toBe('Machine Learning Model')
      expect(modelEntity['schema:url']).toBe('https://example.com/model-card/gpt-4o')
      expect(modelEntity.name).toBe('gpt-4o')
    })

    it('step entity has aac:model and prov:used reference to model', () => {
      const out = generateROCrate(dataWithModelCard)
      const step = out['@graph'].find(
        (e: Record<string, unknown>) => e['@id'] === '#req-1',
      ) as Record<string, unknown>
      expect(step['aac:model']).toEqual({ '@id': 'https://example.com/model-card/gpt-4o' })
      expect(step['prov:used']).toEqual({ '@id': 'https://example.com/model-card/gpt-4o' })
    })

    it('no model entity emitted when modelCardUri is absent', () => {
      const dataNoModelCard: CanvasData = {
        project: { title: 'No Model Card', description: '' },
        userExpectations: {
          requirements: [
            {
              id: 'req-1',
              title: 'Task without model card',
              benefits: [],
              feasibility: { modelSelection: 'frontier-model', modelName: 'gpt-4o' },
            },
          ],
        },
      }
      const out = generateROCrate(dataNoModelCard)
      const modelEntities = out['@graph'].filter(
        (e: Record<string, unknown>) => e['@type'] === 'schema:SoftwareApplication' && e['schema:applicationCategory'] === 'Machine Learning Model',
      )
      expect(modelEntities).toHaveLength(0)
    })

    it('deduplicates when multiple tasks share the same model URI', () => {
      const dataSharedModel: CanvasData = {
        project: { title: 'Shared Model', description: '' },
        userExpectations: {
          requirements: [
            {
              id: 'req-1',
              title: 'Task 1',
              benefits: [],
              feasibility: { modelName: 'gpt-4o', modelCardUri: 'https://example.com/model-card/gpt-4o' },
            },
            {
              id: 'req-2',
              title: 'Task 2',
              benefits: [],
              feasibility: { modelName: 'gpt-4o', modelCardUri: 'https://example.com/model-card/gpt-4o' },
            },
          ],
        },
      }
      const out = generateROCrate(dataSharedModel)
      const modelEntities = out['@graph'].filter(
        (e: Record<string, unknown>) => e['@id'] === 'https://example.com/model-card/gpt-4o',
      )
      expect(modelEntities).toHaveLength(1)
    })
  })

  describe('dataset sheet URI export', () => {
    it('sets dcat:landingPage when datasetSheetUri is present', () => {
      const dataWithSheet: CanvasData = {
        project: { title: 'Dataset Sheet Test', description: '' },
        dataAccess: {
          datasets: [
            {
              id: 'ds-1',
              title: 'Test Dataset',
              accessRights: 'open',
              datasetSheetUri: 'https://example.com/sheets/ds-1',
            },
          ],
        },
      }
      const out = generateROCrate(dataWithSheet)
      const dsEntity = out['@graph'].find(
        (e: Record<string, unknown>) => e['@id'] === '#dataset-0',
      ) as Record<string, unknown>
      expect(dsEntity['dcat:landingPage']).toEqual({ '@id': 'https://example.com/sheets/ds-1' })
    })

    it('no dcat:landingPage when datasetSheetUri is absent', () => {
      const dataNoSheet: CanvasData = {
        project: { title: 'No Sheet Test', description: '' },
        dataAccess: {
          datasets: [
            { id: 'ds-1', title: 'Test Dataset', accessRights: 'open' },
          ],
        },
      }
      const out = generateROCrate(dataNoSheet)
      const dsEntity = out['@graph'].find(
        (e: Record<string, unknown>) => e['@id'] === '#dataset-0',
      ) as Record<string, unknown>
      expect(dsEntity['dcat:landingPage']).toBeUndefined()
    })
  })
})
