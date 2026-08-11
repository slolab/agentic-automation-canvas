import JSZip from 'jszip'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AAC_RO_CRATE_PROFILE_ID, AAC_SCHEMA_VERSION } from '@/schema/contract'
import { importROCrateFromZip } from '@/rocrate/container'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('RO-Crate ZIP container boundary', () => {
  it('reports malformed optional display metadata without blocking the canvas', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const zip = new JSZip()
    zip.file(
      'ro-crate-metadata.json',
      JSON.stringify({
        '@context': 'https://w3id.org/ro/crate/1.2/context',
        '@graph': [
          {
            '@id': './',
            '@type': ['schema:Dataset', 'dcat:Dataset'],
            'aac:schemaVersion': AAC_SCHEMA_VERSION,
            conformsTo: { '@id': AAC_RO_CRATE_PROFILE_ID },
          },
          {
            '@id': '#project',
            '@type': ['schema:Project', 'schema:ResearchProject'],
            name: 'Recovered from ZIP',
            description: 'Optional metadata does not block the project.',
          },
        ],
      }),
    )
    zip.file('benefit-display.json', JSON.stringify({ displayGroups: 'invalid' }))
    const bytes = await zip.generateAsync({ type: 'uint8array' })

    const result = await importROCrateFromZip(bytes as unknown as File)

    expect(result.canvasData.project.title).toBe('Recovered from ZIP')
    expect(result.benefitDisplay).toBeUndefined()
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'rocrate.benefitDisplayInvalid',
          path: '/benefit-display.json',
        }),
      ]),
    )
  })
})
