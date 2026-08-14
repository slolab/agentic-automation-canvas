/*
Compiles the current schema with Ajv and converts errors into stable structured diagnostics. Also provides the current type guard and assertion.
*/

import Ajv, { type ErrorObject } from 'ajv'
import addFormats from 'ajv-formats'
import { appendPointer } from '@/json'
import { AAC_CURRENT_SCHEMA, AAC_SCHEMA_VERSION } from '@/schema/contract'
import type { CanvasData } from '@/types/canvas'
import type { Diagnostic } from '@/diagnostics'

export interface SchemaDiagnostic extends Diagnostic {
  source: 'schema'
  keyword: string
  schemaPath: string
  schemaVersion: string
  params: Record<string, unknown>
}

export interface CanvasValidationResult {
  valid: boolean
  diagnostics: SchemaDiagnostic[]
}

export class CurrentCanvasValidationError extends Error {
  readonly diagnostics: SchemaDiagnostic[]

  constructor(diagnostics: SchemaDiagnostic[]) {
    super(`Canvas does not conform to AAC schema ${AAC_SCHEMA_VERSION}`)
    this.name = 'CurrentCanvasValidationError'
    this.diagnostics = diagnostics
  }
}

const ajv = new Ajv({
  allErrors: true,
  strict: true,
  strictRequired: false,
})
addFormats(ajv)

const validate = ajv.compile<CanvasData>(AAC_CURRENT_SCHEMA)

/**
 * Point findings at the offending property rather than its parent, so callers
 * can report, navigate to, and repair exactly the value Ajv rejected.
 */
function diagnosticPath(error: ErrorObject): string {
  const base = error.instancePath || ''
  if (error.keyword === 'additionalProperties') {
    return appendPointer(base, String(error.params.additionalProperty))
  }
  if (error.keyword === 'required') {
    return appendPointer(base, String(error.params.missingProperty))
  }
  return base || '/'
}

function toDiagnostic(error: ErrorObject): SchemaDiagnostic {
  return {
    severity: 'error',
    source: 'schema',
    code: `schema.${error.keyword}`,
    path: diagnosticPath(error),
    keyword: error.keyword,
    schemaPath: error.schemaPath,
    message: error.message ?? 'Schema validation failed',
    schemaVersion: AAC_SCHEMA_VERSION,
    params: { ...error.params },
  }
}

export function validateCurrentCanvas(value: unknown): CanvasValidationResult {
  const valid = validate(value)
  return {
    valid,
    diagnostics: valid
      ? []
      : (validate.errors ?? []).map(toDiagnostic),
  }
}

export function isCurrentCanvas(value: unknown): value is CanvasData {
  return validate(value)
}

export function assertCurrentCanvas(value: unknown): asserts value is CanvasData {
  const result = validateCurrentCanvas(value)
  if (!result.valid) throw new CurrentCanvasValidationError(result.diagnostics)
}
