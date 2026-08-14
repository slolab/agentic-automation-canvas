/**
 * The canvas persistence boundary: it owns the storage key and both directions
 * of the local draft, so no caller has to reason about serialization or about
 * recovering data written by an older application build.
 */

import type { Diagnostic } from '@/diagnostics'
import { logDiagnostics } from '@/diagnostics'
import { recoverCanvasToCurrent } from '@/schema/recovery'
import { AAC_SCHEMA_VERSION } from '@/schema/contract'
import { isCurrentCanvas } from '@/schema/validation'
import type { CanvasData } from '@/types/canvas'

const CANVAS_STORAGE_KEY = 'agentic-automation-canvas-data'
const LEGACY_V2_STORAGE_KEY = 'aac-v2-canvas-draft'

export interface PersistedCanvasLoadResult {
  canvasData?: CanvasData
  diagnostics: Diagnostic[]
}

function invalidJsonDiagnostic(error: unknown): Diagnostic {
  return {
    severity: 'error',
    source: 'persistence',
    code: 'persistence.invalidJson',
    path: '/',
    message: error instanceof Error ? error.message : 'Stored canvas is not valid JSON.',
    schemaVersion: AAC_SCHEMA_VERSION,
  }
}

/**
 * Parse and validate a persisted canvas payload.
 *
 * Invalid fragments are recovered best-effort against the current schema so
 * findings never block the user from viewing readable data. Required text the
 * user has not filled in yet is preserved as-is by recovery and produces no
 * findings — an incomplete draft is the normal state of a canvas being edited.
 */
export function loadPersistedCanvas(serialized: string): PersistedCanvasLoadResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(serialized)
  } catch (error) {
    const diagnostics = [invalidJsonDiagnostic(error)]
    logDiagnostics(diagnostics)
    return { diagnostics }
  }

  if (isCurrentCanvas(parsed)) {
    return { canvasData: parsed, diagnostics: [] }
  }

  const recovered = recoverCanvasToCurrent(parsed)
  logDiagnostics(recovered.diagnostics)

  return { canvasData: recovered.data, diagnostics: recovered.diagnostics }
}

/**
 * Read the stored draft, or `undefined` when nothing usable is stored.
 *
 * Web Storage itself can throw (private browsing, disabled cookies). That must
 * degrade to "no saved canvas" rather than prevent the app from starting.
 */
export function readPersistedCanvas(): PersistedCanvasLoadResult | undefined {
  let stored: string | null
  try {
    stored = localStorage.getItem(CANVAS_STORAGE_KEY)
    if (stored === null && localStorage.getItem(LEGACY_V2_STORAGE_KEY) !== null) {
      const diagnostic: Diagnostic = {
        severity: 'warning',
        source: 'persistence',
        code: 'persistence.legacyV2DraftUnsupported',
        path: `/${LEGACY_V2_STORAGE_KEY}`,
        message: 'An experimental AAC v2 browser draft is still stored locally. Its prompt answers cannot be mapped losslessly, so the draft was left untouched.',
      }
      logDiagnostics([diagnostic])
      return { diagnostics: [diagnostic] }
    }
  } catch (error) {
    console.warn('Failed to load canvas data from storage:', error)
    return undefined
  }
  if (stored === null) return undefined
  return loadPersistedCanvas(stored)
}

/**
 * Store the draft. Storage failures (quota, private browsing) are reported and
 * swallowed: losing an autosave must never interrupt editing.
 */
export function savePersistedCanvas(data: CanvasData): void {
  try {
    localStorage.setItem(CANVAS_STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.warn('Failed to save canvas data to storage:', error)
  }
}

export function clearPersistedCanvas(): void {
  try {
    localStorage.removeItem(CANVAS_STORAGE_KEY)
  } catch (error) {
    console.warn('Failed to clear canvas data from storage:', error)
  }
}
