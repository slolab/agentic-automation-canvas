import { describe, it, expect } from 'vitest'
import { parseROCrateToCanvas } from '@/utils/import'
import type { ROCrateJSONLD } from '@/types/rocrate'

/** Minimal RO-Crate: root dataset + one project entity, no requirements. */
const minimalRocrateFixture: ROCrateJSONLD = {
  '@context': 'https://w3id.org/ro/crate/1.1/context',
  '@graph': [
    {
      '@id': 'ro-crate-metadata.json',
      '@type': 'schema:CreativeWork',
      conformsTo: { '@id': 'https://w3id.org/ro/crate/1.1' },
      about: { '@id': './' },
    },
    {
      '@id': './',
      '@type': ['schema:Dataset', 'dcat:Dataset'],
      name: 'Crate',
      'aac:version': '0.1.0',
      'aac:versionDate': '2025-01-01',
      about: { '@id': '#project' },
    },
    {
      '@id': '#project',
      '@type': ['schema:Project', 'schema:ResearchProject'],
      name: 'Fixture Project Title',
      description: 'Fixture description',
      'aac:version': '0.1.0',
      'aac:versionDate': '2025-01-01',
    },
  ],
}

describe('parseROCrateToCanvas', () => {
  it('parses minimal crate to canvasData with project.title and project.version', () => {
    const canvasData = parseROCrateToCanvas(minimalRocrateFixture)
    expect(canvasData.project.title).toBe('Fixture Project Title')
    expect(canvasData.project.description).toBe('Fixture description')
    expect(canvasData.project.version).toBe('0.1.0')
  })

  it('graph with root + project only yields no requirements', () => {
    const canvasData = parseROCrateToCanvas(minimalRocrateFixture)
    expect(canvasData.userExpectations?.requirements).toBeUndefined()
  })
})
