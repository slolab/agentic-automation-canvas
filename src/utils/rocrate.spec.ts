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
})
