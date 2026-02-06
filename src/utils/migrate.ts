/**
 * Normalize canvas data from older schema to current schema.
 * No legacy compatibility: map what we can, drop the rest, collect warnings.
 */

import type { CanvasData, Requirement, Benefit } from '@/types/canvas'

const UNIT_CATEGORY_MAP: Record<string, 'item' | 'interaction' | 'computation' | 'other'> = {
  case: 'item',
  document: 'item',
  record: 'item',
  message: 'interaction',
  meeting: 'interaction',
  analysisRun: 'computation',
  other: 'other',
}

const VALID_UNIT_CATEGORIES = new Set(['item', 'interaction', 'computation', 'other'])

export interface NormalizeResult {
  data: CanvasData
  warnings: string[]
}

/**
 * Normalize canvas data to current schema. Maps old fields to new, drops unmappable.
 */
export function normalizeCanvasData(data: CanvasData): NormalizeResult {
  const warnings: string[] = []
  const requirements = data.userExpectations?.requirements ?? []

  const migratedTitleCount = { current: 0 }
  const migratedUnitCategoryCount = { current: 0 }
  const unmappedUnitCategories = new Set<string>()

  const normalizedReqs: Requirement[] = requirements.map((req) => {
    const r = req as Requirement & { title?: string; description?: string }
    const hasTitle = 'title' in r && r.title != null && String(r.title).trim() !== ''
    const hasDescription = 'description' in r && r.description != null && String(r.description).trim() !== ''

    let title: string
    let description: string | undefined
    if (hasTitle) {
      title = String(r.title).trim()
      description = hasDescription ? String(r.description).trim() : undefined
    } else {
      title = hasDescription ? String(r.description).trim() : ''
      if (hasDescription && title.length > 0) {
        migratedTitleCount.current += 1
      }
      description = undefined
    }

    const rawCategory = r.unitCategory as string | undefined
    let unitCategory: 'item' | 'interaction' | 'computation' | 'other' = 'other'
    if (rawCategory != null && String(rawCategory).trim() !== '') {
      const mapped = UNIT_CATEGORY_MAP[rawCategory as keyof typeof UNIT_CATEGORY_MAP]
      if (mapped) {
        unitCategory = mapped
        if (rawCategory !== unitCategory) {
          migratedUnitCategoryCount.current += 1
        }
      } else if (!VALID_UNIT_CATEGORIES.has(rawCategory)) {
        unmappedUnitCategories.add(rawCategory)
        unitCategory = 'other'
      } else {
        unitCategory = rawCategory as 'item' | 'interaction' | 'computation' | 'other'
      }
    }

    const benefits: Benefit[] = (r.benefits ?? []).map((b) => ({ ...b }))

    return {
      ...r,
      id: r.id,
      title,
      description: description || undefined,
      unitCategory,
      benefits,
      userStory: r.userStory,
      priority: r.priority,
      status: r.status,
      stakeholder: r.stakeholder,
      value: r.value,
      unitOfWork: r.unitOfWork,
      volumePerMonth: r.volumePerMonth,
      humanOversightMinutesPerUnit: r.humanOversightMinutesPerUnit,
      dependsOn: r.dependsOn,
      feasibility: r.feasibility,
    } as Requirement
  })

  if (migratedTitleCount.current > 0) {
    warnings.push(
      `${migratedTitleCount.current} requirement(s) had description used as title.`
    )
  }
  if (migratedUnitCategoryCount.current > 0) {
    warnings.push(
      `${migratedUnitCategoryCount.current} unit category/categories mapped to new values (item, interaction, computation, other).`
    )
  }
  if (unmappedUnitCategories.size > 0) {
    warnings.push(
      `Unmapped unit categories dropped (set to 'other'): ${[...unmappedUnitCategories].join(', ')}.`
    )
  }

  const project = data.project
  const primaryValueDriver = project?.primaryValueDriver
  const validDrivers = ['time', 'quality', 'risk', 'enablement', 'cost']
  if (
    primaryValueDriver &&
    !validDrivers.includes(primaryValueDriver as string)
  ) {
    warnings.push(
      `Project primaryValueDriver '${primaryValueDriver}' is not in current schema; field cleared.`
    )
  }

  const normalizedProject = {
    ...project,
    primaryValueDriver:
      primaryValueDriver && validDrivers.includes(primaryValueDriver as string)
        ? primaryValueDriver
        : undefined,
  }

  const result: CanvasData = {
    ...data,
    project: normalizedProject,
    userExpectations: {
      ...data.userExpectations,
      requirements: normalizedReqs,
    },
  }

  return { data: result, warnings }
}
