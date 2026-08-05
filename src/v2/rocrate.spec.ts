import JSZip from 'jszip'
import { describe, expect, it } from 'vitest'
import { V2_FRAMEWORK_VERSION } from './framework'
import {
  buildV2ROCrateZip,
  generateFoundationMarkdown,
  generateV2ROCrate,
  importV2ROCrate,
} from './rocrate'
import { createEmptyV2Canvas } from './storage'

describe('AAC v2 RO-Crate', () => {
  it('generates the RO-Crate 1.2 metadata descriptor and versioned root dataset', () => {
    const canvas = createEmptyV2Canvas()
    const crate = generateV2ROCrate(canvas)
    const descriptor = crate['@graph'].find(
      (entity) => entity['@id'] === 'ro-crate-metadata.json',
    )
    const root = crate['@graph'].find((entity) => entity['@id'] === './')

    expect(crate['@context']).toBe('https://w3id.org/ro/crate/1.2/context')
    expect(descriptor?.conformsTo).toEqual({ '@id': 'https://w3id.org/ro/crate/1.2' })
    expect(root?.version).toBe(V2_FRAMEWORK_VERSION)
    expect(root?.hasPart).toEqual([
      { '@id': 'aac-v2.json' },
      { '@id': 'project-foundation.md' },
    ])
  })

  it('turns incomplete work into a readable foundation without implying implementation approval', () => {
    const canvas = createEmptyV2Canvas()
    canvas.projectTitle = 'Assisted sample triage'
    canvas.answers.project_description =
      'Scientists wait too long for the first review; sample collection is outside scope.'

    const markdown = generateFoundationMarkdown(canvas)

    expect(markdown).toContain('# Assisted sample triage')
    expect(markdown).toContain(canvas.answers.project_description)
    expect(markdown).toContain('_Not discussed._')
    expect(markdown).toContain('not implementation approval or production readiness')
  })

  it('packages partial work and reopens it without losing framework answers', async () => {
    const canvas = createEmptyV2Canvas()
    canvas.projectTitle = 'Assisted sample triage'
    canvas.answers.mvp_user_stories =
      'As a lab scientist, I can see why a sample was flagged before I decide what to do.'
    canvas.answers.progress_metrics =
      'Review time: 25 current − 3 tool − 7 review = 15 minutes net.'

    const blob = await buildV2ROCrateZip(canvas)
    const zip = await JSZip.loadAsync(await blob.arrayBuffer())
    const reopened = await importV2ROCrate(blob)

    expect(zip.file('ro-crate-metadata.json')).not.toBeNull()
    expect(zip.file('project-foundation.md')).not.toBeNull()
    expect(zip.file('aac-v2.json')).not.toBeNull()
    expect(reopened).toEqual(canvas)
  })
})
