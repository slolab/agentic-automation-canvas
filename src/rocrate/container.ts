import type JSZip from 'jszip'
import type { Diagnostic } from '@/diagnostics'
import { logDiagnostics } from '@/diagnostics'
import { isBenefitDisplayState, type BenefitDisplayState } from '@/types/benefitDisplay'
import type { CanvasData } from '@/types/canvas'
import { importROCrateDocument } from '@/rocrate/import'
import { ROCrateContainerError } from '@/rocrate/jsonld'
import { CurrentCanvasValidationError } from '@/schema/validation'

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

/**
 * Raised when a crate cannot be opened at all. It carries the same structured
 * diagnostics as a successful import so callers can display one kind of finding
 * rather than a message string for failures and diagnostics for everything else.
 */
export class ROCrateImportError extends Error {
  readonly diagnostics: Diagnostic[]

  constructor(message: string, diagnostics: Diagnostic[]) {
    super(message)
    this.name = 'ROCrateImportError'
    this.diagnostics = diagnostics
  }
}

const LEGACY_V2_DATA_FILE = 'aac-v2.json'

function containerDiagnostic(code: string, path: string, message: string): Diagnostic {
  return { severity: 'error', source: 'ro-crate', code, path, message }
}

/** Browser file-picker and drop-zone hint; ZIP parsing remains authoritative. */
export function isZipFile(file: Pick<File, 'name' | 'type'>): boolean {
  const fileName = file.name.toLowerCase()
  return fileName.endsWith('.zip')
    || file.type === 'application/zip'
    || file.type === 'application/x-zip-compressed'
}

/** Recover the structured findings an error already carries, or synthesize one. */
function importFailure(error: unknown): ROCrateImportError {
  if (error instanceof ROCrateImportError) return error
  if (error instanceof ROCrateContainerError || error instanceof CurrentCanvasValidationError) {
    return new ROCrateImportError(error.message, error.diagnostics)
  }
  const message = error instanceof Error ? error.message : 'Unknown error'
  return new ROCrateImportError(message, [
    containerDiagnostic('rocrate.importFailed', '/', message),
  ])
}

async function readBenefitDisplay(
  zip: JSZip,
  diagnostics: Diagnostic[],
): Promise<BenefitDisplayState | undefined> {
  const file = zip.file('benefit-display.json')
  if (!file) return undefined

  try {
    const parsed: unknown = JSON.parse(await file.async('string'))
    if (!isBenefitDisplayState(parsed)) {
      throw new Error('benefit-display.json does not match the expected display-state shape.')
    }
    return { displayGroups: parsed.displayGroups, displayGroupCount: parsed.displayGroupCount }
  } catch (error) {
    const diagnostic: Diagnostic = {
      severity: 'warning',
      source: 'ro-crate',
      code: 'rocrate.benefitDisplayInvalid',
      path: '/benefit-display.json',
      message: error instanceof Error ? error.message : 'Failed to parse benefit-display.json.',
    }
    diagnostics.push(diagnostic)
    logDiagnostics([diagnostic])
    return undefined
  }
}

/** Read the ZIP container separately from graph parsing and current-model recovery. */
export async function importROCrateFromZip(file: File): Promise<ImportROCrateResult> {
  try {
    const { default: JSZip } = await import('jszip')
    const zip = await JSZip.loadAsync(file)
    if (zip.file(LEGACY_V2_DATA_FILE)) {
      throw new ROCrateImportError(
        'This archive was created by the retired experimental AAC v2 canvas and cannot be imported without losing its prompt answers.',
        [
          containerDiagnostic(
            'rocrate.legacyV2Unsupported',
            `/${LEGACY_V2_DATA_FILE}`,
            'Legacy AAC v2 prompt answers do not have a lossless mapping to the current canvas schema, so the archive was not imported.',
          ),
        ],
      )
    }
    const metadataFile = zip.file('ro-crate-metadata.json')
    if (!metadataFile) {
      throw new ROCrateImportError('ro-crate-metadata.json not found in ZIP file', [
        containerDiagnostic(
          'rocrate.metadataMissing',
          '/ro-crate-metadata.json',
          'The archive contains no ro-crate-metadata.json.',
        ),
      ])
    }

    const metadataContent = await metadataFile.async('string')
    let metadata: unknown
    try {
      metadata = JSON.parse(metadataContent)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'ro-crate-metadata.json is not valid JSON.'
      throw new ROCrateImportError(message, [
        containerDiagnostic('rocrate.metadataUnreadable', '/ro-crate-metadata.json', message),
      ])
    }

    const imported = importROCrateDocument(metadata)
    const diagnostics = [...imported.diagnostics]
    const benefitDisplay = await readBenefitDisplay(zip, diagnostics)

    return {
      canvasData: imported.canvasData,
      benefitDisplay,
      crateSchemaVersion: imported.crateSchemaVersion,
      crateProfileId: imported.crateProfileId,
      diagnostics,
    }
  } catch (error) {
    const failure = importFailure(error)
    logDiagnostics(failure.diagnostics)
    throw failure
  }
}
