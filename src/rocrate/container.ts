import JSZip from 'jszip'
import type { Diagnostic } from '@/diagnostics'
import { logDiagnostics } from '@/diagnostics'
import {
  isBenefitDisplayState,
  type BenefitDisplayState,
} from '@/types/benefitDisplay'
import type { CanvasData } from '@/types/canvas'
import { importROCrateDocument } from '@/rocrate/import'

export interface ImportROCrateResult {
  canvasData: CanvasData
  benefitDisplay?: BenefitDisplayState
  /** Schema version declared by the crate root dataset. */
  crateSchemaVersion?: string
  /** Exact AAC RO-Crate profile identifier declared by the root dataset. */
  crateProfileId?: string
  /** Structured validation, recovery, and parsing findings. */
  diagnostics: Diagnostic[]
}

/** Read the ZIP container separately from graph parsing and current-model recovery. */
export async function importROCrateFromZip(file: File): Promise<ImportROCrateResult> {
  try {
    const zip = await JSZip.loadAsync(file)
    const metadataFile = zip.file('ro-crate-metadata.json')

    if (!metadataFile) {
      throw new Error('ro-crate-metadata.json not found in ZIP file')
    }

    const metadataContent = await metadataFile.async('string')
    const imported = importROCrateDocument(JSON.parse(metadataContent) as unknown)
    const diagnostics = [...imported.diagnostics]

    let benefitDisplay: BenefitDisplayState | undefined
    const benefitDisplayFile = zip.file('benefit-display.json')
    if (benefitDisplayFile) {
      try {
        const content = await benefitDisplayFile.async('string')
        const parsed: unknown = JSON.parse(content)
        if (!isBenefitDisplayState(parsed)) {
          throw new Error('benefit-display.json does not match the expected display-state shape.')
        }
        benefitDisplay = {
          displayGroups: parsed.displayGroups,
          displayGroupCount: parsed.displayGroupCount,
        }
      } catch (error) {
        const diagnostic: Diagnostic = {
          severity: 'warning',
          code: 'rocrate.benefitDisplayInvalid',
          path: '/benefit-display.json',
          message:
            error instanceof Error ? error.message : 'Failed to parse benefit-display.json.',
          source: 'ro-crate',
        }
        diagnostics.push(diagnostic)
        logDiagnostics([diagnostic])
      }
    }

    return {
      canvasData: imported.canvasData,
      benefitDisplay,
      crateSchemaVersion: imported.crateSchemaVersion,
      crateProfileId: imported.crateProfileId,
      diagnostics,
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to import RO-Crate: ${error.message}`)
    }
    throw new Error('Failed to import RO-Crate: Unknown error')
  }
}
