import { describe, it, expect } from 'vitest'
import { generateDependencyMermaid, hasDependencies, wrapLabel } from '@/utils/dependencyGraph'
import type { Requirement } from '@/types/canvas'

function makeReq(overrides: Partial<Requirement> & { id: string }): Requirement {
  return {
    title: '',
    description: '',
    dependsOn: [],
    benefits: [],
    ...overrides,
  } as Requirement
}

describe('generateDependencyMermaid', () => {
  it('uses top-to-bottom direction', () => {
    const reqs = [makeReq({ id: 'a', title: 'Task A' })]
    const result = generateDependencyMermaid(reqs)
    expect(result).toMatch(/^graph TB/)
  })

  it('returns empty string for no requirements', () => {
    expect(generateDependencyMermaid([])).toBe('')
  })

  it('creates nodes with sanitized labels', () => {
    const reqs = [makeReq({ id: 'task-1', title: 'My "Task" [1]' })]
    const result = generateDependencyMermaid(reqs)
    expect(result).toContain('task_1["My \'Task\' (1)"]')
  })

  it('creates edges from dependency to dependent', () => {
    const reqs = [
      makeReq({ id: 'a', title: 'A' }),
      makeReq({ id: 'b', title: 'B', dependsOn: ['a'] }),
    ]
    const result = generateDependencyMermaid(reqs)
    expect(result).toContain('a --> b')
  })

  it('wraps long labels onto multiple lines', () => {
    const reqs = [makeReq({ id: 'x', title: 'Extract key information from documents and emails' })]
    const result = generateDependencyMermaid(reqs)
    expect(result).toContain('<br/>')
  })

  it('does not create self-referencing edges', () => {
    const reqs = [makeReq({ id: 'a', title: 'A', dependsOn: ['a'] })]
    const result = generateDependencyMermaid(reqs)
    expect(result).not.toContain('a --> a')
  })

  it('falls back to id when title and description are empty', () => {
    const reqs = [makeReq({ id: 'task-1', title: '', description: '' })]
    const result = generateDependencyMermaid(reqs)
    expect(result).toContain('task_1["task-1"]')
  })
})

describe('wrapLabel', () => {
  it('returns short text unchanged', () => {
    expect(wrapLabel('Hello world', 30)).toBe('Hello world')
  })

  it('wraps at word boundaries', () => {
    expect(wrapLabel('Extract key information from documents', 30)).toBe(
      'Extract key information from<br/>documents'
    )
  })

  it('handles multiple wraps', () => {
    const result = wrapLabel('This is a very long label that should wrap onto multiple lines', 20)
    expect(result).toBe('This is a very long<br/>label that should<br/>wrap onto multiple<br/>lines')
  })

  it('does not break a single long word', () => {
    expect(wrapLabel('Superlongwordwithoutspaces', 10)).toBe('Superlongwordwithoutspaces')
  })
})

describe('hasDependencies', () => {
  it('returns false for an empty requirements array', () => {
    expect(hasDependencies([])).toBe(false)
  })

  it('returns false when no requirements have dependsOn', () => {
    const reqs = [makeReq({ id: 'a' })]
    expect(hasDependencies(reqs)).toBe(false)
  })

  it('returns true when at least one requirement has dependsOn', () => {
    const reqs = [
      makeReq({ id: 'a' }),
      makeReq({ id: 'b', dependsOn: ['a'] }),
    ]
    expect(hasDependencies(reqs)).toBe(true)
  })
})
