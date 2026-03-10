import type { Requirement } from '@/types/canvas'

/**
 * Calculate the monthly deployment cost for a single requirement.
 * Returns 0 if no deployment cost is configured.
 */
export function getMonthlyDeploymentCost(req: Requirement): number {
  const dc = req.feasibility?.deploymentCost
  if (!dc) return 0

  if (dc.aggregationBasis === 'perUnit') {
    const costPerUnit = dc.costPerUnit ?? 0
    const volume = req.volumePerMonth ?? 0
    return costPerUnit * volume
  }

  return dc.costPerMonth ?? 0
}

/**
 * Aggregate monthly deployment costs across all requirements, grouped by currency.
 * Returns a Map<currency, totalMonthlyCost>. Empty map if no costs.
 */
export function aggregateDeploymentCosts(requirements: Requirement[]): Map<string, number> {
  const totals = new Map<string, number>()

  for (const req of requirements) {
    const dc = req.feasibility?.deploymentCost
    if (!dc) continue

    const monthly = getMonthlyDeploymentCost(req)
    if (monthly === 0) continue

    const current = totals.get(dc.currency) ?? 0
    totals.set(dc.currency, current + monthly)
  }

  return totals
}

/** Format a deployment cost amount for display (e.g. "12.50 USD"). */
export function formatDeploymentCost(amount: number, currency: string): string {
  return `${amount.toFixed(2)} ${currency}`
}
