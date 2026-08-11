import type { Diagnostic } from '@/diagnostics'
import { logDiagnostics } from '@/diagnostics'
import { recoverCanvasToCurrent } from '@/schema/recovery'
import { AAC_SCHEMA_VERSION } from '@/schema/contract'
import { isCurrentCanvas } from '@/schema/validation'
import type { CanvasData } from '@/types/canvas'

export interface PersistedCanvasLoadResult {
  canvasData?: CanvasData
  diagnostics: Diagnostic[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

/**
 * Empty project fields are a normal state while editing a new canvas. They are
 * still reported by JSON Schema, but reopening a draft must not replace what the
 * user entered with recovery placeholders.
 */
function preserveEmptyDraftFields(input: unknown, recovered: CanvasData): void {
  if (!isRecord(input) || !isRecord(input.project)) return

  if (input.project.title === '') recovered.project.title = ''
  if (input.project.description === '') recovered.project.description = ''
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
 * Parse and validate the current application's persisted canvas payload.
 *
 * Invalid optional fragments are recovered best-effort against the current
 * schema so findings never block the user from viewing readable data.
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
  preserveEmptyDraftFields(parsed, recovered.data)
  logDiagnostics(recovered.diagnostics)

  return {
    canvasData: recovered.data,
    diagnostics: recovered.diagnostics,
  }
}
