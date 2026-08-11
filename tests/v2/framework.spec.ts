import { describe, expect, it } from 'vitest'
import { V2_BLOCKS, V2_PROMPTS } from '@/v2/framework'

describe('AAC v2 framework definition', () => {
  it('has six visible blocks and twenty-two primary prompts', () => {
    expect(V2_BLOCKS).toHaveLength(6)
    expect(V2_PROMPTS).toHaveLength(22)
  })

  it('uses unique, stable prompt identifiers', () => {
    const ids = V2_PROMPTS.map((prompt) => prompt.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('expresses every primary prompt as a plain question', () => {
    for (const prompt of V2_PROMPTS) {
      expect(prompt.question.trim()).toMatch(/\?$/)
      expect(prompt.guidance.trim().length).toBeGreaterThan(0)
    }
  })

  it('opens with a named user, real case, bounded problem, and evidenced baseline', () => {
    expect(V2_BLOCKS[0].id).toBe('work_today')
    expect(V2_BLOCKS[0].prompts.map((prompt) => prompt.id)).toEqual([
      'project_description',
      'current_people',
      'recent_case',
      'problem_baseline',
    ])
  })

  it('ends with a bounded MVP decision record instead of an abstract gap section', () => {
    expect(V2_BLOCKS.map((block) => block.id)).toEqual([
      'work_today',
      'change',
      'solutions',
      'development_reality',
      'value_and_evidence',
      'mvp',
    ])
    expect(V2_BLOCKS[V2_BLOCKS.length - 1].prompts.map((prompt) => prompt.id)).toEqual([
      'mvp_scope',
      'mvp_user_stories',
      'mvp_collaboration',
      'prebuild_resolutions',
    ])
  })

  it('treats the user organization as the source for development constraints', () => {
    const developmentReality = V2_BLOCKS.find(
      (block) => block.id === 'development_reality',
    )
    expect(
      developmentReality?.prompts.every((prompt) => prompt.perspective === 'user'),
    ).toBe(true)
  })

  it('makes user, developer, and shared contributions visible', () => {
    const perspectives = new Set(V2_PROMPTS.map((prompt) => prompt.perspective))
    expect(perspectives).toEqual(new Set(['user', 'developer', 'shared']))
  })

  it('keeps section guidance behind concise, useful info controls', () => {
    for (const block of V2_BLOCKS) {
      expect(block.tooltip.length).toBeGreaterThan(25)
      expect(block.tooltip.length).toBeLessThan(120)
      expect(block.info.lead.trim().length).toBeGreaterThan(0)
      expect(block.info.sections.length).toBeGreaterThanOrEqual(3)
      expect(
        block.info.sections.every(
          (section) => section.title.trim() && section.body.trim(),
        ),
      ).toBe(true)
    }
  })
})
