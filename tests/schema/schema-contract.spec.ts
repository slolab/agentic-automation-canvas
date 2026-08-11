/*
Checks the selected current contract, reconciled fields, and closed structural objects.
*/

import { describe, expect, it } from 'vitest'
import manifest from '../../schema/manifest.json'
import {
  AAC_CURRENT_SCHEMA,
  AAC_RO_CRATE_PROFILE_ID,
  AAC_RO_CRATE_PROFILE_PATH,
  AAC_RO_CRATE_PROFILE_VERSION,
  AAC_SCHEMA_ID,
  AAC_SCHEMA_PATH,
  AAC_SCHEMA_VERSION,
  RO_CRATE_CONTEXT,
  RO_CRATE_VERSION,
} from '@/schema/contract'

type JsonSchema = Record<string, unknown>

const valueAt = (schema: JsonSchema, ...path: string[]): unknown =>
  path.reduce<unknown>((node, key) => {
    if (!node || typeof node !== 'object' || Array.isArray(node)) return undefined
    return (node as JsonSchema)[key]
  }, schema)

const property = (schema: JsonSchema, ...path: string[]): JsonSchema => {
  const value = valueAt(schema, ...path)
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Expected JSON Schema object at ${path.join('.')}`)
  }
  return value as JsonSchema
}

describe('versioned AAC schema contract', () => {
  it('generates one current contract from the manifest', () => {
    expect(AAC_SCHEMA_VERSION).toBe(manifest.currentVersion)
    expect(AAC_SCHEMA_PATH).toBe(manifest.currentSchema)
    expect(AAC_CURRENT_SCHEMA.$id).toBe(AAC_SCHEMA_ID)
    expect(AAC_RO_CRATE_PROFILE_VERSION).toBe(manifest.currentProfileVersion)
    expect(AAC_RO_CRATE_PROFILE_PATH).toBe(manifest.currentProfile)
    expect(AAC_SCHEMA_ID).toBe(
      `https://w3id.org/aac/schema/${manifest.currentVersion}/aac.schema.json`,
    )
    expect(AAC_RO_CRATE_PROFILE_ID).toBe(
      `https://w3id.org/aac/profile/${manifest.currentProfileVersion}`,
    )
    expect(RO_CRATE_VERSION).toBe(manifest.roCrateVersion)
    expect(RO_CRATE_CONTEXT).toBe(`https://w3id.org/ro/crate/${manifest.roCrateVersion}/context`)
  })

  it('contains every known field that drifted into the TypeScript model', () => {
    const personProperties = property(AAC_CURRENT_SCHEMA, 'properties', 'persons', 'items', 'properties')
    expect(personProperties).toHaveProperty('functionRoles')
    expect(personProperties).toHaveProperty('localTitle')

    const projectProperties = property(AAC_CURRENT_SCHEMA, 'properties', 'project', 'properties')
    expect(projectProperties).toHaveProperty('creator')
    expect(projectProperties).toHaveProperty('license')
  })

  it('describes milestones with the current object shape', () => {
    const milestoneItems = property(
      AAC_CURRENT_SCHEMA,
      'properties',
      'governance',
      'properties',
      'stages',
      'items',
      'properties',
      'milestones',
      'items',
    )

    expect(milestoneItems.type).toBe('object')
    expect(milestoneItems.required).toEqual(['description'])
    expect(milestoneItems.properties).toMatchObject({
      description: { type: 'string' },
      kpi: { type: 'string' },
    })
  })

  it('rejects undeclared fields at every structural object boundary', () => {
    const openStructuralObjects: string[] = []

    const visit = (value: unknown, path: string): void => {
      if (Array.isArray(value)) {
        value.forEach((item, index) => visit(item, `${path}/${index}`))
        return
      }
      if (!value || typeof value !== 'object') return

      const node = value as JsonSchema
      if (node.type === 'object' && node.additionalProperties === undefined) {
        openStructuralObjects.push(path)
      }
      Object.entries(node).forEach(([key, child]) => visit(child, `${path}/${key}`))
    }

    visit(AAC_CURRENT_SCHEMA, '#')
    expect(openStructuralObjects).toEqual([])
    expect(
      valueAt(
        AAC_CURRENT_SCHEMA,
        'properties',
        'outcomes',
        'properties',
        'evaluations',
        'items',
        'properties',
        'metrics',
        'additionalProperties',
      ),
    ).toBe(true)
  })
})
