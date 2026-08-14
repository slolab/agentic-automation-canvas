/**
 * Storage boundary for the app-only benefit display state. It mirrors
 * `persistence/canvas` so the composable never touches Web Storage directly.
 *
 * This state is deliberately not part of the AAC schema; see
 * `types/benefitDisplay` for why it is the one handwritten presentation model.
 */

import { isBenefitDisplayState, type BenefitDisplayState } from '@/types/benefitDisplay'

const BENEFIT_DISPLAY_STORAGE_KEY = 'agentic-automation-canvas-benefit-display'

/**
 * Read the stored display state, or `undefined` when nothing usable is stored.
 * Unrecognised shapes are discarded rather than recovered: this is presentation
 * state that the app rebuilds from the canvas on demand.
 */
export function readPersistedBenefitDisplay(): BenefitDisplayState | undefined {
  let stored: string | null
  let parsed: unknown
  try {
    stored = localStorage.getItem(BENEFIT_DISPLAY_STORAGE_KEY)
    if (stored === null) return undefined
    parsed = JSON.parse(stored)
  } catch (error) {
    console.warn('Failed to load benefit display from storage:', error)
    return undefined
  }

  if (!isBenefitDisplayState(parsed)) {
    console.warn('Stored benefit display does not match the expected display-state shape.')
    return undefined
  }
  return { displayGroups: parsed.displayGroups, displayGroupCount: parsed.displayGroupCount }
}

export function savePersistedBenefitDisplay(state: BenefitDisplayState): void {
  try {
    localStorage.setItem(BENEFIT_DISPLAY_STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.warn('Failed to save benefit display to storage:', error)
  }
}

export function clearPersistedBenefitDisplay(): void {
  try {
    localStorage.removeItem(BENEFIT_DISPLAY_STORAGE_KEY)
  } catch (error) {
    console.warn('Failed to clear benefit display from storage:', error)
  }
}
