import JSZip from 'jszip'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AAC_RO_CRATE_PROFILE_ID, AAC_SCHEMA_VERSION } from '@/schema/contract'
import { ROCrateImportError, importROCrateFromZip, isZipFile } from '@/rocrate/container'

afterEach(() => {
  vi.restoreAllMocks()
})

async function zipWith(files: Record<string, string>): Promise<File> {
  const zip = new JSZip()
  Object.entries(files).forEach(([name, content]) => zip.file(name, content))
  const bytes = await zip.generateAsync({ type: 'uint8array' })
  return bytes as unknown as File
}

describe('RO-Crate ZIP container boundary', () => {
  it('recognizes ZIPs by extension or browser MIME type', () => {
    expect(isZipFile({ name: 'canvas.ZIP', type: '' })).toBe(true)
    expect(isZipFile({ name: 'canvas.bin', type: 'application/zip' })).toBe(true)
    expect(isZipFile({ name: 'canvas.json', type: 'application/json' })).toBe(false)
  })

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

  it('fails with structured diagnostics when the crate has no metadata file', async () => {
    const file = await zipWith({ 'readme.txt': 'no crate here' })

    await expect(importROCrateFromZip(file)).rejects.toThrow(ROCrateImportError)
    await expect(importROCrateFromZip(file)).rejects.toMatchObject({
      diagnostics: [
        expect.objectContaining({ severity: 'error', code: 'rocrate.metadataMissing' }),
      ],
    })
  })

  it('preserves graph-level diagnostics when the crate has no JSON-LD graph', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const file = await zipWith({ 'ro-crate-metadata.json': JSON.stringify({ notAGraph: true }) })

    await expect(importROCrateFromZip(file)).rejects.toMatchObject({
      diagnostics: [
        expect.objectContaining({
          severity: 'error',
          code: 'rocrate.graphMissing',
          path: '/@graph',
        }),
      ],
    })
  })

  it('reports unreadable metadata JSON as a structured diagnostic', async () => {
    const file = await zipWith({ 'ro-crate-metadata.json': '{not json' })

    await expect(importROCrateFromZip(file)).rejects.toMatchObject({
      diagnostics: [expect.objectContaining({ code: 'rocrate.metadataUnreadable' })],
    })
  })

  it('rejects a legacy v2 archive instead of silently discarding its prompt answers', async () => {
    const file = await zipWith({
      'aac-v2.json': JSON.stringify({
        format: 'aac-v2',
        frameworkVersion: '2.0-draft.5',
        projectTitle: 'Legacy discovery brief',
        answers: { recent_case: 'A concrete answer that must not disappear.' },
      }),
      'ro-crate-metadata.json': JSON.stringify({
        '@context': 'https://w3id.org/ro/crate/1.2/context',
        '@graph': [
          {
            '@id': 'ro-crate-metadata.json',
            '@type': 'CreativeWork',
            about: { '@id': './' },
          },
          {
            '@id': './',
            '@type': 'Dataset',
            name: 'Legacy discovery brief',
            hasPart: { '@id': 'aac-v2.json' },
          },
        ],
      }),
    })

    await expect(importROCrateFromZip(file)).rejects.toMatchObject({
      diagnostics: [
        expect.objectContaining({
          severity: 'error',
          code: 'rocrate.legacyV2Unsupported',
          path: '/aac-v2.json',
        }),
      ],
    })
  })
})
