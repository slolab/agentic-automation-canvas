import type { Diagnostic } from '@/diagnostics'
import { logDiagnostics } from '@/diagnostics'
import { readIdentifier, recoverROCrateGraph } from '@/rocrate/jsonld'
import { AAC_RO_CRATE_PROFILE_ID, AAC_SCHEMA_VERSION } from '@/schema/contract'
import { recoverCanvasToCurrent } from '@/schema/recovery'
import type { CanvasData } from '@/types/canvas'
import type { ROCrateJSONLD } from '@/types/rocrate'
import { mapROCrateToCanvasCandidate } from '@/rocrate/parse'

export interface ROCrateImportResult {
  canvasData: CanvasData
  crateSchemaVersion?: string
  crateProfileId?: string
  diagnostics: Diagnostic[]
}

function finding(code: string, message: string): Diagnostic {
  return {
    severity: 'warning',
    code,
    path: '/',
    message,
    source: 'ro-crate',
  }
}

function schemaVersion(crate: ROCrateJSONLD): string | undefined {
  const root = crate['@graph'].find((entity) => entity['@id'] === './')
  return typeof root?.['aac:schemaVersion'] === 'string'
    ? root['aac:schemaVersion']
    : undefined
}

function profileId(crate: ROCrateJSONLD): string | undefined {
  const root = crate['@graph'].find((entity) => entity['@id'] === './')
  const declarations = Array.isArray(root?.conformsTo) ? root.conformsTo : [root?.conformsTo]
  return declarations
    .map(readIdentifier)
    .find((identifier) => identifier?.startsWith('https://w3id.org/aac/'))
}

function fallbackCanvas(crate: ROCrateJSONLD): unknown {
  const project = crate['@graph'].find((entity) => {
    const types = Array.isArray(entity['@type']) ? entity['@type'] : [entity['@type']]
    return types.some((type) => ['Project', 'ResearchProject', 'schema:Project', 'schema:ResearchProject'].includes(type))
  })
  return {
    project: {
      title: typeof project?.name === 'string' ? project.name : undefined,
      description: typeof project?.description === 'string' ? project.description : undefined,
    },
  }
}

export function importROCrateDocument(input: unknown): ROCrateImportResult {
  const recovered = recoverROCrateGraph(input)
  const diagnostics = [...recovered.diagnostics]
  const crateSchemaVersion = schemaVersion(recovered.crate)
  const crateProfileId = profileId(recovered.crate)

  if (!crateProfileId) {
    diagnostics.push(
      finding(
        'rocrate.profileMissing',
        'Crate has no AAC RO-Crate profile declaration; known terms were interpreted best-effort.',
      ),
    )
  } else if (crateProfileId !== AAC_RO_CRATE_PROFILE_ID) {
    diagnostics.push(
      finding(
        'rocrate.profileNonCurrent',
        `Crate declares AAC RO-Crate profile ${crateProfileId}; current profile is ${AAC_RO_CRATE_PROFILE_ID}. Known terms were interpreted best-effort.`,
      ),
    )
  }

  let parsed: unknown
  try {
    parsed = mapROCrateToCanvasCandidate(recovered.crate)
  } catch (error) {
    diagnostics.push({
      severity: 'error',
      code: 'rocrate.parserFailure',
      path: '/@graph',
      message: error instanceof Error ? error.message : 'RO-Crate parser failed.',
      source: 'ro-crate',
    })
    parsed = fallbackCanvas(recovered.crate)
  }

  if (!crateSchemaVersion) {
    diagnostics.push(
      finding(
        'rocrate.schemaVersionMissing',
        `Crate has no AAC schema version; recoverable values were interpreted as ${AAC_SCHEMA_VERSION}.`,
      ),
    )
  } else if (crateSchemaVersion !== AAC_SCHEMA_VERSION) {
    diagnostics.push(
      finding(
        'rocrate.schemaVersionNonCurrent',
        `Crate uses AAC schema ${crateSchemaVersion}; current schema is ${AAC_SCHEMA_VERSION}. Recoverable values were interpreted best-effort.`,
      ),
    )
  }

  const recoveredCanvas = recoverCanvasToCurrent(parsed)
  diagnostics.push(...recoveredCanvas.diagnostics)
  logDiagnostics(diagnostics)

  return {
    canvasData: recoveredCanvas.data,
    crateSchemaVersion,
    crateProfileId,
    diagnostics,
  }
}
