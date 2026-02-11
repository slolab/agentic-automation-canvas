import { describe, it, expect } from 'vitest'
import { parseROCrateToCanvas } from '@/utils/import'
import type { ROCrateJSONLD } from '@/types/rocrate'

/** Minimal RO-Crate 1.2: root dataset + one project entity, no requirements. */
const minimalRocrateFixture: ROCrateJSONLD = {
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
      name: 'Crate',
      datePublished: '2025-01-01',
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

/** Legacy RO-Crate 1.1 fixture for backward compatibility testing. */
const legacyRocrateFixture: ROCrateJSONLD = {
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
      name: 'Legacy Crate',
      'aac:version': '0.1.0',
      'aac:versionDate': '2025-01-01',
      about: { '@id': '#project' },
    },
    {
      '@id': '#project',
      '@type': ['schema:Project', 'schema:ResearchProject'],
      name: 'Legacy Project Title',
      description: 'Legacy description',
      'aac:version': '0.1.0',
      'aac:versionDate': '2025-01-01',
    },
  ],
}

describe('parseROCrateToCanvas', () => {
  it('parses minimal 1.2 crate to canvasData with project.title and project.version', () => {
    const canvasData = parseROCrateToCanvas(minimalRocrateFixture)
    expect(canvasData.project.title).toBe('Fixture Project Title')
    expect(canvasData.project.description).toBe('Fixture description')
    expect(canvasData.project.version).toBe('0.1.0')
  })

  it('graph with root + project only yields no requirements', () => {
    const canvasData = parseROCrateToCanvas(minimalRocrateFixture)
    expect(canvasData.userExpectations?.requirements).toBeUndefined()
  })

  it('imports legacy RO-Crate 1.1 crates (backward compatibility)', () => {
    const canvasData = parseROCrateToCanvas(legacyRocrateFixture)
    expect(canvasData.project.title).toBe('Legacy Project Title')
    expect(canvasData.project.description).toBe('Legacy description')
    expect(canvasData.project.version).toBe('0.1.0')
  })
})
