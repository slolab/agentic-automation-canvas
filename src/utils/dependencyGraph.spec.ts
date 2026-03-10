import { describe, it, expect } from 'vitest'
import { generateDependencyMermaid, hasDependencies } from './dependencyGraph'
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

  it('truncates labels to 40 characters', () => {
    const longTitle = 'A'.repeat(50)
    const reqs = [makeReq({ id: 'x', title: longTitle })]
    const result = generateDependencyMermaid(reqs)
    const match = result.match(/x\["(.+?)"\]/)
    expect(match).toBeTruthy()
    expect(match![1].length).toBe(40)
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
