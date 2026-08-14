import type { Diagnostic } from '@/diagnostics'
import { isRecord } from '@/json'
import type { ROCrateEntity, ROCrateJSONLD } from '@/types/rocrate'

export interface RecoveredROCrate {
  crate: ROCrateJSONLD
  diagnostics: Diagnostic[]
}

export class ROCrateContainerError extends Error {
  readonly diagnostics: Diagnostic[]

  constructor(diagnostics: Diagnostic[]) {
    super('RO-Crate container has no recoverable JSON-LD graph')
    this.name = 'ROCrateContainerError'
    this.diagnostics = diagnostics
  }
}

export interface EntityReference {
  '@id': string
}

function finding(
  severity: Diagnostic['severity'],
  code: string,
  path: string,
  message: string,
): Diagnostic {
  return { severity, code, path, message, source: 'ro-crate' }
}

function isEntity(value: unknown): value is ROCrateEntity {
  if (!isRecord(value) || typeof value['@id'] !== 'string') return false
  const type = value['@type']
  return (
    typeof type === 'string' ||
    (Array.isArray(type) && type.length > 0 && type.every((item) => typeof item === 'string'))
  )
}

function normalizePlanSteps(
  entity: ROCrateEntity,
  index: number,
  diagnostics: Diagnostic[],
): void {
  const value = entity['p-plan:hasStep']
  if (value === undefined || Array.isArray(value)) return
  if (isRecord(value) && typeof value['@id'] === 'string') {
    entity['p-plan:hasStep'] = [value]
    diagnostics.push(
      finding(
        'warning',
        'rocrate.scalarReferenceNormalized',
        `/@graph/${index}/p-plan:hasStep`,
        'Scalar plan-step reference was normalized to an array.',
      ),
    )
    return
  }
  delete entity['p-plan:hasStep']
  diagnostics.push(
    finding(
      'error',
      'rocrate.invalidReferenceList',
      `/@graph/${index}/p-plan:hasStep`,
      'Unreadable plan-step references were omitted.',
    ),
  )
}

export function recoverROCrateGraph(input: unknown): RecoveredROCrate {
  if (!isRecord(input) || !Array.isArray(input['@graph'])) {
    const diagnostics = [
      finding(
        'error',
        'rocrate.graphMissing',
        '/@graph',
        'RO-Crate has no JSON-LD graph to recover.',
      ),
    ]
    throw new ROCrateContainerError(diagnostics)
  }

  const diagnostics: Diagnostic[] = []
  const graph: ROCrateEntity[] = []

  input['@graph'].forEach((candidate, index) => {
    if (!isEntity(candidate)) {
      diagnostics.push(
        finding(
          'error',
          'rocrate.invalidEntity',
          `/@graph/${index}`,
          'Malformed graph entity was omitted while valid siblings were retained.',
        ),
      )
      return
    }
    const entity = structuredClone(candidate)
    normalizePlanSteps(entity, index, diagnostics)
    graph.push(entity)
  })

  const context = input['@context']
  if (context === undefined) {
    diagnostics.push(
      finding(
        'warning',
        'rocrate.contextMissing',
        '/@context',
        'RO-Crate context is missing; known AAC terms were interpreted best-effort.',
      ),
    )
  }

  return {
    crate: {
      '@context': (context ?? []) as ROCrateJSONLD['@context'],
      '@graph': graph,
    },
    diagnostics,
  }
}

export function readString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

export function readNumber(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined
}

export function readBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined
}

export function readStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined
  return value.filter((item): item is string => typeof item === 'string')
}

export function readEntityReference(value: unknown): EntityReference | undefined {
  if (!isRecord(value) || typeof value['@id'] !== 'string') return undefined
  return { '@id': value['@id'] }
}

export function readEntityReferences(value: unknown): EntityReference[] {
  if (value === undefined || value === null) return []
  const values = Array.isArray(value) ? value : [value]
  return values
    .map(readEntityReference)
    .filter((reference): reference is EntityReference => reference !== undefined)
}

export function readIdentifier(value: unknown): string | undefined {
  return readString(value) ?? readEntityReference(value)?.['@id']
}
