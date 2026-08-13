import type {
  Benefit,
  DataAccessSensitivity,
  Dataset,
  GovernanceStage,
  GovernanceStaging,
  Milestone,
  Requirement,
  UserExpectations,
} from '@/types/canvas'

export type CanvasIdFactory = (prefix: string) => string
// `title` is patchable but never generated: the simplified canvas does not ask
// for a task title, while the canvas summary essentials strip does.
export type PrimaryRequirementPatch = Partial<Omit<Requirement, 'id'>>
export type UnclassifiedBenefitField = 'description' | 'metricLabel'
export type FirstStagePatch = Partial<Pick<GovernanceStage, 'startDate' | 'endDate'>>

let fallbackIdSequence = 0

export const createCanvasId: CanvasIdFactory = (prefix) => {
  fallbackIdSequence += 1
  const randomPart = Math.random().toString(36).slice(2, 8)
  return `${prefix}-${Date.now()}-${fallbackIdSequence}-${randomPart}`
}

/**
 * The task title the user actually authored, or an empty string. The simplified
 * canvas does not ask for a task title, so the requirement it creates carries
 * `title === id` (see `patchPrimaryRequirement`). That generated identifier is a
 * technical parent value and must never be presented as user content.
 */
export function authoredRequirementTitle(
  requirement: Pick<Requirement, 'id' | 'title'>,
): string {
  const title = requirement.title?.trim() ?? ''
  return title && title !== requirement.id ? title : ''
}

/**
 * Map classified-benefit indexes across a lightweight-benefit edit. Classified
 * objects are retained by identity; the map lets index-based UI metadata follow
 * them when deleting an earlier unclassified entry necessarily shifts the array.
 */
export function retainedClassifiedBenefitIndexes(
  before: readonly Benefit[],
  after: readonly Benefit[],
): ReadonlyMap<number, number> {
  const indexes = new Map<number, number>()
  before.forEach((benefit, oldIndex) => {
    if (benefit.benefitType === 'unclassified') return
    const newIndex = after.indexOf(benefit)
    if (newIndex >= 0) indexes.set(oldIndex, newIndex)
  })
  return indexes
}

/**
 * Patch the simplified canvas' canonical requirement without replacing later
 * requirements. The schema-required title deliberately duplicates the generated
 * identifier because the simplified view does not ask the user for a task title.
 */
export function patchPrimaryRequirement(
  current: UserExpectations | undefined,
  updates: PrimaryRequirementPatch,
  createId: CanvasIdFactory = createCanvasId,
): UserExpectations {
  const requirements = [...(current?.requirements ?? [])]

  if (requirements.length === 0) {
    const id = createId('requirement')
    requirements.push({ id, title: id, benefits: [] })
  }

  requirements[0] = {
    ...requirements[0],
    ...updates,
  }

  return {
    ...(current ?? {}),
    requirements,
  }
}

/** Replace one kind of lightweight entry while retaining all classified benefits. */
export function replacePrimaryUnclassifiedBenefits(
  current: UserExpectations | undefined,
  field: UnclassifiedBenefitField,
  values: readonly string[],
  createId: CanvasIdFactory = createCanvasId,
): UserExpectations {
  const prepared = patchPrimaryRequirement(current, {}, createId)
  const primary = prepared.requirements![0]
  const normalizedValues = values
    .map((value) => value.trim())
    .filter((value, index, all) => value.length > 0 && all.indexOf(value) === index)
  const benefits: Benefit[] = [...primary.benefits]
  const matchingIndexes = benefits.flatMap((benefit, index) => (
    benefit.benefitType === 'unclassified' && benefit[field]
      ? [index]
      : []
  ))
  const otherField: UnclassifiedBenefitField = field === 'description' ? 'metricLabel' : 'description'

  // Update existing lightweight entries in place. Classified benefit positions are
  // used by app-only dashboard references, so rebuilding the array by benefit type
  // would silently retarget those references even when only wording changed.
  matchingIndexes.slice(0, normalizedValues.length).forEach((benefitIndex, valueIndex) => {
    const benefit = benefits[benefitIndex]
    if (benefit.benefitType !== 'unclassified') return
    benefits[benefitIndex] = {
      ...benefit,
      [field]: normalizedValues[valueIndex],
    }
  })

  // Remove surplus entries from the end so any unavoidable index movement is
  // minimized. A combined description/metric entry keeps its other value and slot.
  matchingIndexes.slice(normalizedValues.length).reverse().forEach((benefitIndex) => {
    const benefit = benefits[benefitIndex]
    if (benefit.benefitType !== 'unclassified') return
    const otherValue = benefit[otherField]?.trim()
    if (otherValue) {
      benefits[benefitIndex] = { benefitType: 'unclassified', [otherField]: otherValue }
    } else {
      benefits.splice(benefitIndex, 1)
    }
  })

  normalizedValues.slice(matchingIndexes.length).forEach((value) => {
    benefits.push({ benefitType: 'unclassified', [field]: value })
  })

  return patchPrimaryRequirement(
    prepared,
    { benefits },
    createId,
  )
}

/** Ensure the schema parent for a simplified dataset answer exists. */
export function ensureFirstDataset(
  current: DataAccessSensitivity | undefined,
  createId: CanvasIdFactory = createCanvasId,
): { dataAccess: DataAccessSensitivity; datasetIndex: number } {
  const datasets = [...(current?.datasets ?? [])]
  if (datasets.length === 0) {
    datasets.push({ id: createId('dataset'), title: '' })
  }

  return {
    dataAccess: { ...(current ?? {}), datasets },
    datasetIndex: 0,
  }
}

/** Patch dataset zero while preserving every later dataset. */
export function patchFirstDataset(
  current: DataAccessSensitivity | undefined,
  updates: Partial<Dataset>,
  createId: CanvasIdFactory = createCanvasId,
): DataAccessSensitivity {
  const { dataAccess, datasetIndex } = ensureFirstDataset(current, createId)
  const datasets = dataAccess.datasets!
  datasets[datasetIndex] = { ...datasets[datasetIndex], ...updates }
  return { ...dataAccess, datasets }
}

/**
 * Constraint flags that describe the project data rather than its delivery. The
 * detailed model expresses them on a dataset, so checking one has to bring the
 * dataset record into existence.
 */
const datasetConstraintFlags = ['large-data', 'personal-data'] as const

export interface ConstraintToggle {
  /** The checkbox the user just clicked */
  flag: string
  checked: boolean
  /** The full suggested-flag set after the click */
  flags: readonly string[]
}

/** True when dataset 0 holds nothing the user authored. */
function isGeneratedDataset(dataset: Dataset | undefined): boolean {
  if (!dataset) return false
  const { id: _id, title, ...rest } = dataset
  return (title ?? '') === '' && Object.keys(rest).length === 0
}

/**
 * Bring the dataset a data constraint implies into existence, and keep its
 * personal-data answer in step with that one checkbox.
 *
 * This is deliberately driven by the click rather than by the resulting flag
 * set: "personal-data was just unchecked" and "another checkbox changed while
 * personal-data is off" produce the same flag set but must not produce the same
 * data. Reading only the set would erase a `containsPersonalData` the user
 * entered in the detailed view, and re-create a dataset they deleted there, on
 * every unrelated constraint edit.
 *
 * Custom free-text constraints never imply a dataset. Later datasets and every
 * other field are never touched.
 */
export function applyDatasetConstraintToggle(
  current: DataAccessSensitivity | undefined,
  toggle: ConstraintToggle,
  createId: CanvasIdFactory = createCanvasId,
): DataAccessSensitivity | undefined {
  if (!datasetConstraintFlags.some((flag) => flag === toggle.flag)) return current

  if (toggle.checked) {
    if (toggle.flag === 'personal-data') {
      return patchFirstDataset(current, { containsPersonalData: true }, createId)
    }
    // Nothing to record beyond the dataset's existence, so an existing one is
    // returned untouched rather than rebuilt.
    return (current?.datasets?.length ?? 0) > 0
      ? current
      : ensureFirstDataset(current, createId).dataAccess
  }

  if (toggle.flag !== 'personal-data') return current

  const existingDatasets = current?.datasets ?? []
  // An explicit "no personal data" given in the detailed view is the user's own
  // statement, so only the answer this checkbox wrote is cleared.
  if (existingDatasets[0]?.containsPersonalData !== true) return current

  const datasets = [...existingDatasets]
  const { containsPersonalData: _cleared, ...rest } = datasets[0]
  datasets[0] = rest

  // Unchecking the only reason the dataset existed leaves nothing behind.
  const stillNeeded = datasetConstraintFlags.some((flag) => toggle.flags.includes(flag))
  if (!stillNeeded && datasets.length === 1 && isGeneratedDataset(datasets[0])) {
    const { datasets: _datasets, ...withoutDatasets } = current ?? {}
    return Object.keys(withoutDatasets).length > 0 ? withoutDatasets : undefined
  }

  return { ...current, datasets }
}

function primaryStageIndex(stages: readonly GovernanceStage[]): number {
  return stages.length > 0 ? 0 : -1
}

/** Ensure the hidden schema parent for the simplified first milestone exists. */
export function ensureFirstStage(
  current: GovernanceStaging | undefined,
  createId: CanvasIdFactory = createCanvasId,
): { governance: GovernanceStaging; stageIndex: number } {
  const stages = [...(current?.stages ?? [])]
  let stageIndex = primaryStageIndex(stages)

  if (stageIndex === -1) {
    stages.push({ id: createId('stage'), name: 'Planning', milestones: [] })
    stageIndex = stages.length - 1
  }

  return {
    governance: { ...(current ?? {}), stages },
    stageIndex,
  }
}

/** Patch milestone zero on the first stage while preserving every other stage. */
export function patchFirstStageMilestone(
  current: GovernanceStaging | undefined,
  updates: Partial<Milestone>,
  createId: CanvasIdFactory = createCanvasId,
): GovernanceStaging {
  const { governance, stageIndex } = ensureFirstStage(current, createId)
  const stages = governance.stages!
  const stage = stages[stageIndex]
  const milestones = [...(stage.milestones ?? [])]

  milestones[0] = Object.assign(
    { description: '' },
    milestones[0] ?? {},
    updates,
  )
  stages[stageIndex] = { ...stage, milestones }

  return { ...governance, stages }
}

/** Patch simplified fields on the first stage while preserving every nested record. */
export function patchFirstStage(
  current: GovernanceStaging | undefined,
  updates: FirstStagePatch,
  createId: CanvasIdFactory = createCanvasId,
): GovernanceStaging {
  const { governance, stageIndex } = ensureFirstStage(current, createId)
  const stages = governance.stages!
  stages[stageIndex] = { ...stages[stageIndex], ...updates }
  return { ...governance, stages }
}
