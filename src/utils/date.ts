/** Today as an ISO calendar date (`YYYY-MM-DD`), the format the schema uses. */
export function todayIsoDate(): string {
  return new Date().toISOString().split('T')[0]
}
