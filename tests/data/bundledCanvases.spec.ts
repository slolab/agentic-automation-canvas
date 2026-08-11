/*
Bundled canvases are loaded straight into the app without passing through
recovery, and the dev crate is exported without user review. A schema change
that invalidates them must fail here rather than in the browser.
*/

import { describe, expect, it } from 'vitest'
import { exampleData } from '@/data/example-data'
import { devAllBenefitsCanvas } from '@/data/dev-all-benefits-canvas'
import { generateROCrate } from '@/rocrate/export'
import { validateCurrentCanvas } from '@/schema/validation'

const bundled = {
  'example-data': exampleData,
  'dev-all-benefits-canvas': devAllBenefitsCanvas,
}

describe.each(Object.entries(bundled))('%s', (_name, canvas) => {
  it('conforms to the current AAC schema', () => {
    expect(validateCurrentCanvas(canvas).diagnostics).toEqual([])
  })

  it('exports to an RO-Crate without validation errors', () => {
    expect(() => generateROCrate(canvas)).not.toThrow()
  })
})
