import type { Requirement } from '@/types/canvas'

/**
 * Wrap a label into multiple lines at word boundaries for Mermaid rendering.
 */
export function wrapLabel(text: string, maxLineWidth: number): string {
  if (text.length <= maxLineWidth) return text
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''
  for (const word of words) {
    if (currentLine && (currentLine + ' ' + word).length > maxLineWidth) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = currentLine ? currentLine + ' ' + word : word
    }
  }
  if (currentLine) lines.push(currentLine)
  return lines.join('<br/>')
}

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

  const lines: string[] = ['graph TB']
  requirements.forEach((req) => {
    const safeId = nodes.get(req.id) || idToSafeId(req.id)
    const rawLabel = (req.title || req.description || req.id || safeId)
      .replace(/"/g, "'")
      .replace(/\[/g, '(')
      .replace(/\]/g, ')')
    const label = wrapLabel(rawLabel, 30)
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
