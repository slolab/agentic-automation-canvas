export type DiagnosticSeverity = 'error' | 'warning'

export interface Diagnostic {
  severity: DiagnosticSeverity
  code: string
  path: string
  message: string
  source: 'schema' | 'recovery' | 'ro-crate' | 'persistence'
  schemaVersion?: string
  keyword?: string
  params?: Record<string, unknown>
}

export function logDiagnostics(diagnostics: readonly Diagnostic[]): void {
  diagnostics.forEach((diagnostic) => {
    console.warn(`[${diagnostic.code}] ${diagnostic.path}: ${diagnostic.message}`, diagnostic)
  })
}
