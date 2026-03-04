export function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value)
}
