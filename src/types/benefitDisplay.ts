/**
 * App-only state for benefit display groups (dashboard).
 * Not part of the canvas schema; stored in benefit-display.json in the crate.
 */

import type { Benefit } from '@/types/canvas'

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
  /** Number of display group slots (1–N). Default 5 when omitted. */
  displayGroupCount?: number
}

const benefitTypes = {
  time: true,
  quality: true,
  risk: true,
  enablement: true,
  cost: true,
} as const satisfies Record<Benefit['benefitType'], true>

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

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
