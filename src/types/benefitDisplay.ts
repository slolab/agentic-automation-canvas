/**
 * App-only state for benefit display groups (dashboard).
 * Not part of the canvas schema; stored in benefit-display.json in the crate.
 */

import { isRecord } from '@/json'
import type { Benefit } from '@/types/canvas'

/** Slot-count bounds for the dashboard's benefit display groups. */
export const MIN_DISPLAY_GROUPS = 1
export const MAX_DISPLAY_GROUPS = 15
export const DEFAULT_DISPLAY_GROUP_COUNT = 5

export interface BenefitRef {
  requirementId: string
  benefitIndex: number
}

export interface BenefitDisplayGroup {
  id: number
  benefitType: Benefit['benefitType']
  metricId: string
  benefitRefs: BenefitRef[]
}

export interface BenefitDisplayState {
  displayGroups: BenefitDisplayGroup[]
  /** Number of display group slots; `DEFAULT_DISPLAY_GROUP_COUNT` when omitted. */
  displayGroupCount?: number
}

/**
 * True when the state differs from the default and therefore has to be written
 * to `benefit-display.json`. The exporter and the ZIP writer must agree on this,
 * or the crate would declare a file it does not contain.
 */
export function hasCustomBenefitDisplay(state: BenefitDisplayState | undefined): boolean {
  if ((state?.displayGroups?.length ?? 0) > 0) return true
  return (
    state?.displayGroupCount != null &&
    state.displayGroupCount !== DEFAULT_DISPLAY_GROUP_COUNT
  )
}

const benefitTypes = {
  time: true,
  quality: true,
  risk: true,
  enablement: true,
  cost: true,
} as const satisfies Record<Benefit['benefitType'], true>

/** Runtime guard for the explicitly app-only presentation exception. */
export function isBenefitDisplayState(value: unknown): value is BenefitDisplayState {
  if (!isRecord(value) || !Array.isArray(value.displayGroups)) return false
  return (
    (value.displayGroupCount === undefined || typeof value.displayGroupCount === 'number') &&
    value.displayGroups.every(
      (group) =>
        isRecord(group) &&
        typeof group.id === 'number' &&
        typeof group.benefitType === 'string' &&
        Object.prototype.hasOwnProperty.call(benefitTypes, group.benefitType) &&
        typeof group.metricId === 'string' &&
        Array.isArray(group.benefitRefs) &&
        group.benefitRefs.every(
          (reference) =>
            isRecord(reference) &&
            typeof reference.requirementId === 'string' &&
            typeof reference.benefitIndex === 'number',
        ),
    )
  )
}
