import type { Requirement } from '@/types/canvas'

/**
 * Generate Mermaid flowchart syntax from requirements and their dependencies.
 * Uses safe node IDs (sanitized) and quoted labels for special characters.
 */
export function generateDependencyMermaid(requirements: Requirement[]): string {
  if (requirements.length === 0) return ''

  const idToSafeId = (id: string) => id.replace(/[^a-zA-Z0-9_]/g, '_').replace(/^_+/, '') || 'n'
  const nodes = new Map<string, string>()

  requirements.forEach((req) => {
    const safeId = idToSafeId(req.id)
    nodes.set(req.id, safeId)
  })

  const lines: string[] = ['graph LR']
  requirements.forEach((req) => {
    const safeId = nodes.get(req.id) || idToSafeId(req.id)
    const label = (req.title || req.description || req.id || safeId)
      .replace(/"/g, "'")
      .replace(/\[/g, '(')
      .replace(/\]/g, ')')
      .slice(0, 40)
    lines.push(`    ${safeId}["${label}"]`)
  })
  requirements.forEach((req) => {
    const fromId = nodes.get(req.id) || idToSafeId(req.id)
    ;(req.dependsOn || []).forEach((depId) => {
      const toId = nodes.get(depId) || idToSafeId(depId)
      if (fromId !== toId) {
        lines.push(`    ${toId} --> ${fromId}`)
      }
    })
  })

  return lines.join('\n')
}

/**
 * Check if there are any dependencies in the requirements.
 */
export function hasDependencies(requirements: Requirement[]): boolean {
  return requirements.some((r) => (r.dependsOn || []).length > 0)
}
