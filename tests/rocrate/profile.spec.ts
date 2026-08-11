import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { describe, expect, it } from 'vitest'
import profile from '../../schema/rocrate-profile.json'
import type { CanvasData } from '@/types/canvas'
import { generateROCrate } from '@/rocrate/export'

const ajv = new Ajv({ allErrors: true, strict: true, strictRequired: false })
addFormats(ajv)
const validateProfile = ajv.compile(profile)

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
})
