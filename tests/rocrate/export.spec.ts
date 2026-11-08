import { describe, it, expect } from 'vitest'
import { generateROCrate } from '@/rocrate/export'
import type { CanvasData } from '@/types/canvas'
import { AAC_SCHEMA_VERSION } from '@/schema/contract'

const minimalCanvasData: CanvasData = {
  project: {
    title: 'Minimal Project',
    description: 'Description',
  },
}

describe('generateROCrate', () => {
  it('exports an empty canvas as an explicitly marked partial draft', () => {
    const out = generateROCrate(
      { project: { title: '', description: '' } },
      { allowPartial: true },
    )
    const root = out['@graph'].find((entity) => entity['@id'] === './')
    const project = out['@graph'].find((entity) => entity['@id'] === '#project')

    expect(root).toMatchObject({
      name: 'Agentic Automation Project',
      'aac:partialCanvas': true,
    })
    expect(root).not.toHaveProperty('conformsTo')
    expect(project).toMatchObject({ name: '', description: '' })
  })

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

  it('root always has the current aac:schemaVersion', () => {
    const out = generateROCrate(minimalCanvasData)
    const root = out['@graph'].find((e: { '@id': string }) => e['@id'] === './') as Record<string, unknown>
    expect(root['aac:schemaVersion']).toBe(AAC_SCHEMA_VERSION)
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
        description: 'Description',
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
      project: { title: 'Model Card Test', description: 'Description' },
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
        project: { title: 'No Model Card', description: 'Description' },
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
        project: { title: 'Shared Model', description: 'Description' },
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
        project: { title: 'Dataset Sheet Test', description: 'Description' },
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
      // canvas dataset ids are preserved as crate @ids
      const dsEntity = out['@graph'].find(
        (e: Record<string, unknown>) => e['@id'] === '#ds-1',
      ) as Record<string, unknown>
      expect(dsEntity['dcat:landingPage']).toEqual({ '@id': 'https://example.com/sheets/ds-1' })
    })

    it('no dcat:landingPage when datasetSheetUri is absent', () => {
      const dataNoSheet: CanvasData = {
        project: { title: 'No Sheet Test', description: 'Description' },
        dataAccess: {
          datasets: [
            { id: 'ds-1', title: 'Test Dataset', accessRights: 'open' },
          ],
        },
      }
      const out = generateROCrate(dataNoSheet)
      const dsEntity = out['@graph'].find(
        (e: Record<string, unknown>) => e['@id'] === '#ds-1',
      ) as Record<string, unknown>
      expect(dsEntity['dcat:landingPage']).toBeUndefined()
    })
  })

  it('exports deploymentCost in feasibility blob', () => {
    const data: CanvasData = {
      project: { title: 'Test', description: 'Desc' },
      userExpectations: {
        requirements: [
          {
            id: 'req-1',
            title: 'Task with cost',
            benefits: [],
            feasibility: {
              deploymentCost: {
                costPerUnit: 0.05,
                aggregationBasis: 'perUnit' as const,
                currency: 'USD' as const,
                costNotes: 'GPT-4o pricing',
              },
            },
          },
        ],
      },
    }
    const out = generateROCrate(data)
    const step = out['@graph'].find((entity) => entity['@id'] === '#req-1')
    const feasibility = step?.['aac:feasibility']
    expect(feasibility).toBeTypeOf('object')
    expect((feasibility as Record<string, unknown>).deploymentCost).toEqual({
      costPerUnit: 0.05,
      aggregationBasis: 'perUnit',
      currency: 'USD',
      costNotes: 'GPT-4o pricing',
    })
  })

  it('@context maps aac: to the persistent w3id.org namespace', () => {
    const out = generateROCrate(minimalCanvasData)
    const contextObj = (out['@context'] as Array<unknown>).find(
      (c): c is Record<string, string> => typeof c === 'object' && c !== null,
    ) as Record<string, string>
    expect(contextObj.aac).toBe('https://w3id.org/aac/schema/')
  })

  it('emits fundingGrant as a FRAPO Grant entity linked via frapo:isFundedBy', () => {
    const data: CanvasData = {
      project: {
        title: 'Funded Project',
        description: 'Description',
        fundingGrant: 'ERC-2024-STG-101234567',
      },
    }
    const out = generateROCrate(data)
    // frapo namespace registered in @context
    const contextObj = (out['@context'] as Array<unknown>).find(
      (c): c is Record<string, string> => typeof c === 'object' && c !== null,
    ) as Record<string, string>
    expect(contextObj.frapo).toBe('http://purl.org/cerif/frapo/')
    // project references the grant
    const project = out['@graph'].find(
      (e: { '@id': string }) => e['@id'] === '#project',
    ) as Record<string, unknown>
    const grantRef = project['frapo:isFundedBy'] as { '@id': string }
    expect(grantRef).toBeDefined()
    // grant entity carries the grant number
    const grant = out['@graph'].find(
      (e: { '@id': string }) => e['@id'] === grantRef['@id'],
    ) as Record<string, unknown>
    expect(grant['@type']).toBe('frapo:Grant')
    expect(grant['frapo:hasGrantNumber']).toBe('ERC-2024-STG-101234567')
  })

  it('does not emit a Grant entity when fundingGrant is absent', () => {
    const out = generateROCrate(minimalCanvasData)
    const grant = out['@graph'].find((e: { '@type'?: unknown }) => e['@type'] === 'frapo:Grant')
    expect(grant).toBeUndefined()
    const project = out['@graph'].find(
      (e: { '@id': string }) => e['@id'] === '#project',
    ) as Record<string, unknown>
    expect(project['frapo:isFundedBy']).toBeUndefined()
  })
})
