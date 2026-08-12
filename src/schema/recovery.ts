import type { Diagnostic } from '@/diagnostics'
import {
  decodePointer,
  hasAtPath,
  isRecord,
  parentPointer,
  readAtPath,
  removeAtPath,
  writeAtPath,
} from '@/json'
import {
  assertCurrentCanvas,
  validateCurrentCanvas,
  type CanvasValidationResult,
  type SchemaDiagnostic,
} from '@/schema/validation'
import { AAC_SCHEMA_VERSION } from '@/schema/contract'
import type { CanvasData } from '@/types/canvas'

export interface CanvasRecoveryResult {
  data: CanvasData
  diagnostics: Diagnostic[]
}

const DEFAULT_PROJECT_TITLE = 'Untitled imported project'
const DEFAULT_PROJECT_DESCRIPTION = 'No project description could be recovered.'

function recoveryDiagnostic(code: string, path: string, message: string): Diagnostic {
  return {
    severity: 'warning',
    code,
    path,
    message,
    source: 'recovery',
    schemaVersion: AAC_SCHEMA_VERSION,
  }
}

function pushUnique(diagnostics: Diagnostic[], diagnostic: Diagnostic): void {
  const duplicate = diagnostics.some(
    (candidate) =>
      candidate.code === diagnostic.code &&
      candidate.path === diagnostic.path &&
      candidate.message === diagnostic.message,
  )
  if (!duplicate) diagnostics.push(diagnostic)
}

/**
 * Stand-in for required text the user has not entered yet. Every `minLength: 1`
 * field in the schema is a bare string with no `maxLength`, `pattern`, or
 * `format`, so any non-empty value satisfies the constraint without tripping
 * another keyword. The token is namespaced so it cannot plausibly collide with
 * text a user typed, and it is only interpreted when a substitution happened.
 */
const INCOMPLETE_TEXT_PLACEHOLDER = 'aac:incomplete-value'

/**
 * An empty string where the schema demands `minLength: 1` means the field has
 * not been filled in yet — the normal state of a canvas being edited. Without
 * this substitution, recovery would drop the empty value, then see the required
 * property missing and delete the whole enclosing item, destroying a task,
 * person, or risk the user had just created.
 *
 * Substituting a placeholder can only remove `minLength` findings, never
 * introduce one, so a single validation pass finds every candidate.
 */
function stashIncompleteText(value: Record<string, unknown>): boolean {
  const pointers = validateCurrentCanvas(value)
    .diagnostics
    .filter((diagnostic) => diagnostic.keyword === 'minLength' && diagnostic.params.limit === 1)
    .map((diagnostic) => diagnostic.path)
    .filter((path) => readAtPath(value, path) === '')

  pointers.forEach((path) => writeAtPath(value, path, INCOMPLETE_TEXT_PLACEHOLDER))
  return pointers.length > 0
}

/**
 * Put the empty strings back. This walks the recovered document instead of
 * replaying the stashed pointers because recovery may splice array items and
 * shift the indices those pointers referred to.
 */
function restoreIncompleteText(value: unknown): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      if (item === INCOMPLETE_TEXT_PLACEHOLDER) value[index] = ''
      else restoreIncompleteText(item)
    })
    return
  }
  if (!isRecord(value)) return
  Object.entries(value).forEach(([key, item]) => {
    if (item === INCOMPLETE_TEXT_PLACEHOLDER) value[key] = ''
    else restoreIncompleteText(item)
  })
}

function ensureRequiredProject(value: Record<string, unknown>, diagnostics: Diagnostic[]): void {
  if (!isRecord(value.project)) {
    value.project = {}
    pushUnique(
      diagnostics,
      recoveryDiagnostic(
        'recovery.requiredValueDefaulted',
        '/project',
        'Missing project object was replaced with a visible placeholder.',
      ),
    )
  }

  const project = value.project as Record<string, unknown>
  if (typeof project.title !== 'string' || project.title.trim() === '') {
    project.title = DEFAULT_PROJECT_TITLE
    pushUnique(
      diagnostics,
      recoveryDiagnostic(
        'recovery.requiredValueDefaulted',
        '/project/title',
        'Unreadable project title was replaced with a visible placeholder.',
      ),
    )
  }
  if (typeof project.description !== 'string' || project.description.trim() === '') {
    project.description = DEFAULT_PROJECT_DESCRIPTION
    pushUnique(
      diagnostics,
      recoveryDiagnostic(
        'recovery.requiredValueDefaulted',
        '/project/description',
        'Unreadable project description was replaced with a visible placeholder.',
      ),
    )
  }
}

function normalizeKnownCurrentShapes(
  value: Record<string, unknown>,
  diagnostics: Diagnostic[],
): void {
  const developerFeasibility = value.developerFeasibility
  if (isRecord(developerFeasibility)) {
    const readinessFields = ['buildTeamStatus', 'maintenanceOwnerStatus'] as const
    readinessFields.forEach((field) => {
      if (!(field in developerFeasibility)) return
      const governance = isRecord(value.governance) ? value.governance : {}
      if (!(field in governance)) governance[field] = developerFeasibility[field]
      delete developerFeasibility[field]
      value.governance = governance
      pushUnique(
        diagnostics,
        recoveryDiagnostic(
          'recovery.governanceReadinessMoved',
          `/governance/${field}`,
          `Legacy developerFeasibility.${field} was moved to governance.${field}.`,
        ),
      )
    })
  }

  const governance = value.governance
  if (!isRecord(governance) || !Array.isArray(governance.stages)) return

  governance.stages.forEach((stage, stageIndex) => {
    if (!isRecord(stage) || !Array.isArray(stage.milestones)) return
    stage.milestones = stage.milestones.map((milestone, milestoneIndex) => {
      if (typeof milestone !== 'string') return milestone
      pushUnique(
        diagnostics,
        recoveryDiagnostic(
          'recovery.milestoneConverted',
          `/governance/stages/${stageIndex}/milestones/${milestoneIndex}`,
          'String milestone was converted to the current milestone object shape.',
        ),
      )
      return { description: milestone }
    })
  })
}

function groupAdditionalProperties(
  validation: CanvasValidationResult,
): Map<string, SchemaDiagnostic[]> {
  const groups = new Map<string, SchemaDiagnostic[]>()
  validation.diagnostics
    .filter((diagnostic) => diagnostic.keyword === 'additionalProperties')
    .forEach((diagnostic) => {
      const group = groups.get(diagnostic.path) ?? []
      group.push(diagnostic)
      groups.set(diagnostic.path, group)
    })
  return groups
}

function reportUndeclaredField(path: string, diagnostics: Diagnostic[]): void {
  pushUnique(
    diagnostics,
    recoveryDiagnostic(
      'recovery.undeclaredFieldDropped',
      path,
      `Field is not accepted by AAC schema ${AAC_SCHEMA_VERSION} at this location and was dropped.`,
    ),
  )
}

type ValidationScore = readonly [nonAdditionalErrors: number, totalErrors: number]

function validationScore(validation: CanvasValidationResult): ValidationScore {
  return [
    validation.diagnostics.filter(
      (diagnostic) => diagnostic.keyword !== 'additionalProperties',
    ).length,
    validation.diagnostics.length,
  ]
}

function compareScores(left: ValidationScore, right: ValidationScore): number {
  return left[0] - right[0] || left[1] - right[1]
}

/**
 * Ajv reports errors from every failing `oneOf`/`anyOf` branch. This remains
 * true when a branch is reached through `$ref`: the diagnostic's schema path
 * points at the referenced definition and no longer contains `oneOf`/`anyOf`.
 * Consequently, a field valid in the selected branch can look like an ordinary
 * additional property in another branch.
 *
 * Probe every candidate deletion against the complete validation result and
 * keep only the best repair. Removing the real extension improves the selected
 * branch, whereas removing a required field such as a classified benefit's
 * `baseline` or `expected` introduces a new non-additional error and is
 * rejected by the score.
 */
function dropBestUndeclaredField(
  value: Record<string, unknown>,
  validation: CanvasValidationResult,
  diagnostics: Diagnostic[],
): boolean {
  const currentScore = validationScore(validation)
  let best:
    | {
        path: string
        score: ValidationScore
        findingCount: number
      }
    | undefined

  groupAdditionalProperties(validation).forEach((findings, path) => {
    if (!hasAtPath(value, path)) return

    const candidate = structuredClone(value)
    if (!removeAtPath(candidate, path)) return
    const score = validationScore(validateCurrentCanvas(candidate))
    if (compareScores(score, currentScore) >= 0) return

    if (
      !best ||
      compareScores(score, best.score) < 0 ||
      (compareScores(score, best.score) === 0 &&
        (
          findings.length > best.findingCount
          || (
            findings.length === best.findingCount
            && path.localeCompare(best.path, undefined, { numeric: true }) > 0
          )
        ))
    ) {
      best = { path, score, findingCount: findings.length }
    }
  })

  if (!best || !removeAtPath(value, best.path)) return false
  reportUndeclaredField(best.path, diagnostics)
  return true
}

function pathDepth(path: string): number {
  return decodePointer(path).length
}

function selectInvalidDiagnostic(
  value: Record<string, unknown>,
  validation: CanvasValidationResult,
): SchemaDiagnostic | undefined {
  return validation.diagnostics
    .filter((diagnostic) => diagnostic.keyword !== 'additionalProperties')
    .sort((left, right) => {
      const leftExists = hasAtPath(value, left.path) ? 1 : 0
      const rightExists = hasAtPath(value, right.path) ? 1 : 0
      return (
        rightExists - leftExists ||
        pathDepth(right.path) - pathDepth(left.path) ||
        right.path.localeCompare(left.path, undefined, { numeric: true })
      )
    })[0]
}

function dropInvalidValue(
  value: Record<string, unknown>,
  validation: CanvasValidationResult,
  diagnostics: Diagnostic[],
): boolean {
  const diagnostic = selectInvalidDiagnostic(value, validation)
  if (!diagnostic) return false

  const targetPath = diagnostic.keyword === 'required'
    ? parentPointer(diagnostic.path)
    : diagnostic.path
  if (!targetPath || !removeAtPath(value, targetPath)) return false

  const reason = targetPath === diagnostic.path
    ? diagnostic.code
    : `${diagnostic.code} at ${diagnostic.path}`
  pushUnique(
    diagnostics,
    recoveryDiagnostic(
      'recovery.invalidFieldDropped',
      targetPath,
      `Value incompatible with the current schema was dropped (${reason}).`,
    ),
  )
  return true
}

function recoverInvalidFields(value: Record<string, unknown>, diagnostics: Diagnostic[]): void {
  const seenStates = new Set<string>()

  for (;;) {
    ensureRequiredProject(value, diagnostics)
    const validation = validateCurrentCanvas(value)
    if (validation.valid) return

    const state = JSON.stringify(value)
    if (seenStates.has(state)) break
    seenStates.add(state)

    if (dropBestUndeclaredField(value, validation, diagnostics)) continue
    if (dropInvalidValue(value, validation, diagnostics)) continue
    break
  }

  if (!validateCurrentCanvas(value).valid) {
    const existingProject = isRecord(value.project) ? value.project : {}
    const project = {
      title: typeof existingProject.title === 'string'
        ? existingProject.title
        : DEFAULT_PROJECT_TITLE,
      description: typeof existingProject.description === 'string'
        ? existingProject.description
        : DEFAULT_PROJECT_DESCRIPTION,
    }
    Object.keys(value).forEach((key) => delete value[key])
    value.project = project
    ensureRequiredProject(value, diagnostics)
    pushUnique(
      diagnostics,
      recoveryDiagnostic(
        'recovery.unrecoverableFragmentsDropped',
        '/',
        'Unrecoverable optional sections were dropped so the project remains viewable.',
      ),
    )
  }
}

/**
 * Recover an untrusted canvas candidate into the current generated model.
 *
 * This is deliberately version-agnostic: every non-current source follows the
 * same current-schema validation and best-effort recovery path.
 *
 * The result conforms structurally to the current schema, which is what earns
 * the `CanvasData` type. It is not necessarily *valid* against it: required text
 * the user has not filled in is returned as an empty string so an in-progress
 * canvas survives a reload. Export re-validates strictly and rejects those.
 */
export function recoverCanvasToCurrent(input: unknown): CanvasRecoveryResult {
  const diagnostics: Diagnostic[] = []
  const cloned = isRecord(input) ? structuredClone(input) : {}

  const hasIncompleteText = stashIncompleteText(cloned)
  ensureRequiredProject(cloned, diagnostics)
  normalizeKnownCurrentShapes(cloned, diagnostics)
  recoverInvalidFields(cloned, diagnostics)
  assertCurrentCanvas(cloned)
  if (hasIncompleteText) restoreIncompleteText(cloned)

  return { data: cloned, diagnostics }
}
