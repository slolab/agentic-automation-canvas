import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { describe, expect, it } from 'vitest'
import profile from '../../schema/rocrate-profile.json'
import completeExample from '../../schema/examples/complete-example.json'
import minimalExample from '../../schema/examples/minimal-example.json'
import type { CanvasData } from '@/types/canvas'
import type { ROCrateJSONLD } from '@/types/rocrate'
import { generateROCrate } from '@/rocrate/export'
import { AAC_RO_CRATE_PROFILE_ID, AAC_SCHEMA_VERSION } from '@/schema/contract'

const ajv = new Ajv({ allErrors: true, strict: true, strictRequired: false })
addFormats(ajv)
const validateProfile = ajv.compile(profile)
const checkedInExamples: Array<[string, ROCrateJSONLD]> = [
  ['minimal-example.json', minimalExample],
  ['complete-example.json', completeExample],
]

describe('current AAC RO-Crate profile', () => {
  it('validates actual exporter output and retains governance activities in hasPart', () => {
    const canvas: CanvasData = {
      project: {
        title: 'Profile project',
        description: 'Validates the versioned profile.',
      },
      governance: {
        stages: [{ id: 'review-stage', name: 'Review' }],
      },
    }

    const crate = generateROCrate(canvas)
    expect(validateProfile(crate), JSON.stringify(validateProfile.errors, null, 2)).toBe(true)

    const root = crate['@graph'].find((entity) => entity['@id'] === './')
    expect(root?.hasPart).toEqual(
      expect.arrayContaining([{ '@id': '#review-stage' }]),
    )
  })

  it.each(checkedInExamples)('%s validates against the current profile', (filename, fixture) => {
    expect(validateProfile(fixture), `${filename}: ${JSON.stringify(validateProfile.errors, null, 2)}`).toBe(true)

    const root = fixture['@graph'].find((entity) => entity['@id'] === './')
    expect(root?.['aac:schemaVersion']).toBe(AAC_SCHEMA_VERSION)
    expect(root?.conformsTo).toEqual({ '@id': AAC_RO_CRATE_PROFILE_ID })
  })
})
