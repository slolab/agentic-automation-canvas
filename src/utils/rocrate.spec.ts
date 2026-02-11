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
})
