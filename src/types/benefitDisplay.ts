/**
 * App-only state for benefit display groups (dashboard).
 * Not part of the canvas schema; stored in benefit-display.json in the crate.
 */

export interface BenefitRef {
  requirementId: string
  benefitIndex: number
}

export interface BenefitDisplayGroup {
  id: number
  benefitType: string
  metricId: string
  benefitRefs: BenefitRef[]
}

export interface BenefitDisplayState {
  displayGroups: BenefitDisplayGroup[]
  /** Number of display group slots (1–N). Default 5 when omitted. */
  displayGroupCount?: number
}
