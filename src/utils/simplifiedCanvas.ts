import type {
  Benefit,
  GovernanceStage,
  GovernanceStaging,
  Milestone,
  Person,
  Requirement,
  UserExpectations,
} from '@/types/canvas'

export type CanvasIdFactory = (prefix: string) => string
export type PrimaryRequirementPatch = Partial<Omit<Requirement, 'id' | 'title'>>
export type UnclassifiedBenefitField = 'description' | 'metricLabel'
export type FirstStagePatch = Partial<Pick<GovernanceStage, 'startDate' | 'endDate'>>

let fallbackIdSequence = 0

export const createCanvasId: CanvasIdFactory = (prefix) => {
  fallbackIdSequence += 1
  const randomPart = Math.random().toString(36).slice(2, 8)
  return `${prefix}-${Date.now()}-${fallbackIdSequence}-${randomPart}`
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

/**
 * Treat person agents on the first stage as the simplified team list. Existing
 * Person entities are reused, new ones are created, and removing a chip only
 * removes the first-stage link so references elsewhere remain intact.
 */
export function setFirstStageTeam(
  currentPersons: readonly Person[] | undefined,
  currentGovernance: GovernanceStaging | undefined,
  names: readonly string[],
  createId: CanvasIdFactory = createCanvasId,
): { persons: Person[]; governance: GovernanceStaging | undefined } {
  const normalizedNames = names
    .map((name) => name.trim())
    .filter((name, index, all) => (
      name.length > 0
      && all.findIndex((candidate) => candidate.toLocaleLowerCase() === name.toLocaleLowerCase()) === index
    ))

  const persons: Person[] = (currentPersons ?? []).map((person) => ({ ...person }))
  if (normalizedNames.length === 0 && primaryStageIndex(currentGovernance?.stages ?? []) === -1) {
    return { persons, governance: currentGovernance }
  }

  const ensured = ensureFirstStage(currentGovernance, createId)
  const stages = ensured.governance.stages!
  const stage = stages[ensured.stageIndex]
  const existingAgents = stage.agents ?? []
  const nonPersonAgents = existingAgents.filter((agent) => agent.type !== 'person')

  const personAgents = normalizedNames.map((name) => {
    let person = persons.find(
      (candidate) => candidate.name.trim().toLocaleLowerCase() === name.toLocaleLowerCase(),
    )
    if (!person) {
      person = { id: createId('person'), name }
      persons.push(person)
    }

    const existingAgent = existingAgents.find(
      (agent) => agent.type === 'person' && agent.personId === person!.id,
    )
    return existingAgent ?? { type: 'person' as const, personId: person.id }
  })

  stages[ensured.stageIndex] = {
    ...stage,
    agents: [...nonPersonAgents, ...personAgents],
  }

  return {
    persons,
    governance: { ...ensured.governance, stages },
  }
}

export function firstStageTeamNames(
  persons: readonly Person[] | undefined,
  governance: GovernanceStaging | undefined,
): string[] {
  const stages = governance?.stages ?? []
  const index = primaryStageIndex(stages)
  if (index === -1) return []

  return (stages[index].agents ?? [])
    .filter((agent) => agent.type === 'person' && agent.personId)
    .map((agent) => persons?.find((person) => person.id === agent.personId)?.name.trim() ?? '')
    .filter((name) => name.length > 0)
}
