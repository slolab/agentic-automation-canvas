import { describe, expect, it } from 'vitest'
import { generateROCrate } from '@/rocrate/export'
import { importROCrateDocument } from '@/rocrate/import'
import {
  AAC_RO_CRATE_PROFILE_ID,
  AAC_SCHEMA_VERSION,
  RO_CRATE_VERSION,
} from '@/schema/contract'
import type { CanvasData } from '@/types/canvas'
import { CurrentCanvasValidationError } from '@/schema/validation'

const canvas: CanvasData = {
  version: '2.4.1',
  project: {
    title: 'Versioned project',
    description: 'Canvas and schema versions are independent.',
    version: '2.4.1',
  },
}

describe('RO-Crate contract identity', () => {
  it('always declares exact schema, profile, and RO-Crate versions', () => {
    const crate = generateROCrate(canvas)
    const root = crate['@graph'].find((entity) => entity['@id'] === './')
    const descriptor = crate['@graph'].find(
      (entity) => entity['@id'] === 'ro-crate-metadata.json',
    )

    expect(root?.['aac:schemaVersion']).toBe(AAC_SCHEMA_VERSION)
    expect(root?.conformsTo).toEqual({ '@id': AAC_RO_CRATE_PROFILE_ID })
    expect(descriptor?.conformsTo).toEqual({
      '@id': `https://w3id.org/ro/crate/${RO_CRATE_VERSION}`,
    })
  })

  it('keeps the canvas version independent from the schema version', () => {
    const crate = generateROCrate(canvas)
    const root = crate['@graph'].find((entity) => entity['@id'] === './')

    expect(root?.['aac:version']).toBe('2.4.1')
    expect(root?.['aac:schemaVersion']).toBe(AAC_SCHEMA_VERSION)
  })

  it('refuses to export data that violates the current schema', () => {
    const invalid = {
      project: { title: '', description: 'Description', invented: true },
    } as unknown as CanvasData

    expect(() => generateROCrate(invalid)).toThrow(CurrentCanvasValidationError)

    try {
      generateROCrate(invalid)
    } catch (error) {
      expect(error).toMatchObject({
        diagnostics: expect.arrayContaining([
          expect.objectContaining({ code: 'schema.additionalProperties' }),
          expect.objectContaining({ code: 'schema.minLength' }),
        ]),
      })
    }
  })

  it('marks an explicitly requested partial export without claiming AAC profile conformance', () => {
    const titleOnly = {
      project: { title: 'Early draft', description: '' },
    } as CanvasData

    const crate = generateROCrate(titleOnly, { allowPartial: true })
    const root = crate['@graph'].find((entity) => entity['@id'] === './')

    expect(root?.['aac:partialCanvas']).toBe(true)
    expect(root?.['aac:schemaVersion']).toBe(AAC_SCHEMA_VERSION)
    expect(root?.conformsTo).toBeUndefined()

    const reopened = importROCrateDocument(crate)
    expect(reopened.canvasData.project.title).toBe('Early draft')
    expect(reopened.canvasData.project.description).toBe('')
    expect(reopened.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'rocrate.profileMissing' }),
    ]))
  })
})
