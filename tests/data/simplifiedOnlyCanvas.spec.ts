/*
The simplified-only fixture backs tools/simplified-only.rocrate.zip, the crate
used to test casting a simplified canvas into the full one. It is only useful
while it stays exactly that: every simplified prompt answered, nothing a
simplified user could not have entered, and a lossless RO-Crate round trip.
*/

import { describe, expect, it } from 'vitest'
import { simplifiedOnlyCanvas } from '@/data/simplified-only-canvas'
import { generateROCrate } from '@/rocrate/export'
import { importROCrateDocument } from '@/rocrate/import'
import { validateCurrentCanvas } from '@/schema/validation'
import { computeCanvasSummary } from '@/utils/canvasSummary'
import { computeFrameworkProgress } from '@/utils/frameworkProgress'
import {
  hasMeaningfulCanvasContent,
  missingSimplifiedPrompts,
} from '@/utils/simplifiedCanvasState'

describe('simplified-only canvas fixture', () => {
  it('conforms to the current AAC schema', () => {
    expect(validateCurrentCanvas(simplifiedOnlyCanvas).diagnostics).toEqual([])
  })

  it('answers every simplified prompt', () => {
    expect(missingSimplifiedPrompts(simplifiedOnlyCanvas)).toEqual([])
    expect(hasMeaningfulCanvasContent(simplifiedOnlyCanvas)).toBe(true)
  })

  it('survives an RO-Crate round trip unchanged', () => {
    const imported = importROCrateDocument(generateROCrate(simplifiedOnlyCanvas))

    expect(imported.diagnostics).toEqual([])
    // Serialized, as the app persists it: the importer leaves unset optional
    // fields present-but-undefined, which JSON drops.
    expect(JSON.parse(JSON.stringify(imported.canvasData))).toEqual(simplifiedOnlyCanvas)
  })

  it('fills the advanced canvas summary with its simplified answers', () => {
    const summary = computeCanvasSummary(simplifiedOnlyCanvas)

    expect(summary.project.problemFrequency).toBe('About once a week')
    expect(summary.userExpectations.expectedBenefitCount).toBe(2)
    expect(summary.userExpectations.successMetricCount).toBe(2)
    expect(summary.developerFeasibility.constraints).toContain('Personal data')
    expect(summary.developerFeasibility.approaches.length).toBeGreaterThan(0)
    expect(summary.governance.buildTeamStatus).toBe('Possible, but not committed')
    expect(summary.governance.firstMilestone?.kpi).toBeTruthy()
    expect(summary.dataAccess.personalDataCount).toBe(1)

    // The dataset name and a deliverable stay open questions for the full canvas
    const progress = computeFrameworkProgress(simplifiedOnlyCanvas)
    expect(progress.completeCount).toBe(4)
    expect(progress.dataAccess).toBe(false)
    expect(progress.outcomes).toBe(false)
  })
})
