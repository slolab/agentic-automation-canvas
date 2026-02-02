/**
 * Format aggregated value for a display group (time = sum of time saved; others = list of values).
 */

import type { Requirement } from '@/types/canvas'
import type { BenefitDisplayGroup } from '@/types/benefitDisplay'
import { getTimeSavedPerUnit } from '@/utils/timeBenefits'
import { formatBenefitValueDisplay } from '@/data/benefitMetrics'

export function formatDisplayGroupValue(
  group: BenefitDisplayGroup,
  reqs: Requirement[]
): string {
  const refs = group.benefitRefs
  if (refs.length === 0) return '—'
  if (group.benefitType === 'time') {
    let totalMinutes = 0
    for (const ref of refs) {
      const req = reqs.find((r, i) => (r.id || `req-${i}`) === ref.requirementId)
      const benefit = req?.benefits?.[ref.benefitIndex]
      if (!benefit) continue
      const savedPerUnit = getTimeSavedPerUnit(benefit)
      const volume = req?.volumePerMonth || 0
      totalMinutes += savedPerUnit * volume
    }
    if (totalMinutes <= 0) {
      const req = reqs.find((r, i) => (r.id || `req-${i}`) === refs[0].requirementId)
      const first = req?.benefits?.[refs[0].benefitIndex]
      return first ? formatBenefitValueDisplay(first) : '—'
    }
    if (totalMinutes >= 60) {
      const hours = Math.round((totalMinutes / 60) * 10) / 10
      return `${hours} h saved/month`
    }
    return `${Math.round(totalMinutes)} min saved/month`
  }
  // Non-time: list all benefit values consecutively
  const parts: string[] = []
  for (const ref of refs) {
    const req = reqs.find((r, i) => (r.id || `req-${i}`) === ref.requirementId)
    const benefit = req?.benefits?.[ref.benefitIndex]
    if (benefit) parts.push(formatBenefitValueDisplay(benefit))
  }
  return parts.length ? parts.join(', ') : '—'
}
