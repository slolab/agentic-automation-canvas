/*
The exporter decides whether the crate declares benefit-display.json and the ZIP
writer decides whether it is actually written. They must agree, or the crate
references a file it does not contain.
*/

import JSZip from 'jszip'
import { describe, expect, it } from 'vitest'
import { generateROCrate } from '@/rocrate/export'
import { buildROCrateZipBuffer } from '@/utils/download'
import type { BenefitDisplayState } from '@/types/benefitDisplay'
import { DEFAULT_DISPLAY_GROUP_COUNT } from '@/types/benefitDisplay'
import type { CanvasData } from '@/types/canvas'

const canvas: CanvasData = {
  project: { title: 'Packaged project', description: 'Exercises the ZIP writer.' },
  userExpectations: {
    requirements: [{ id: 'req-1', title: 'A task', benefits: [] }],
  },
}

const customDisplay: BenefitDisplayState = {
  displayGroups: [{ id: 1, benefitType: 'time', metricId: 'processingTime', benefitRefs: [] }],
}

const defaultDisplay: BenefitDisplayState = {
  displayGroups: [],
  displayGroupCount: DEFAULT_DISPLAY_GROUP_COUNT,
}

describe.each([
  ['a customized display state', customDisplay, true],
  ['the default display state', defaultDisplay, false],
  ['no display state', undefined, false],
])('packaging with %s', (_label, benefitDisplay, expectedPresent) => {
  it('declares benefit-display.json exactly when the ZIP contains it', async () => {
    const crate = generateROCrate(canvas, { benefitDisplay })
    const buffer = await buildROCrateZipBuffer(crate, 'packaged', canvas, benefitDisplay)
    const zip = await JSZip.loadAsync(buffer)

    const declared = crate['@graph'].some((entity) => entity['@id'] === 'benefit-display.json')
    const present = zip.file('benefit-display.json') !== null

    expect(declared).toBe(expectedPresent)
    expect(present).toBe(expectedPresent)
  })

  it('writes every file the crate declares as a part', async () => {
    const crate = generateROCrate(canvas, { benefitDisplay })
    const buffer = await buildROCrateZipBuffer(crate, 'packaged', canvas, benefitDisplay)
    const zip = await JSZip.loadAsync(buffer)

    const root = crate['@graph'].find((entity) => entity['@id'] === './')
    const declaredFiles = (Array.isArray(root?.hasPart) ? root.hasPart : [])
      .map((part) => (part as { '@id': string })['@id'])
      .filter((id) => !id.startsWith('#'))

    expect(declaredFiles.length).toBeGreaterThan(0)
    declaredFiles.forEach((id) => {
      expect(zip.file(id), `${id} is declared in hasPart but missing from the ZIP`).not.toBeNull()
    })
  })
})
