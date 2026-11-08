import { describe, expect, it } from 'vitest'
import {
  readEntityReference,
  readEntityReferences,
  readIdentifier,
  readStringArray,
} from '@/rocrate/jsonld'

describe('RO-Crate boundary value readers', () => {
  it('accepts only object references with a string @id', () => {
    expect(readEntityReference({ '@id': '#valid' })).toEqual({ '@id': '#valid' })
    expect(readEntityReference({ '@id': 42 })).toBeUndefined()
    expect(readEntityReference('#not-an-object-reference')).toBeUndefined()
  })

  it('normalizes scalar and array references while dropping malformed siblings', () => {
    expect(readEntityReferences({ '@id': '#one' })).toEqual([{ '@id': '#one' }])
    expect(readEntityReferences([{ '@id': '#one' }, null, { '@id': 2 }, { '@id': '#two' }])).toEqual([
      { '@id': '#one' },
      { '@id': '#two' },
    ])
  })

  it('reads identifiers and string arrays without trusting unknown values', () => {
    expect(readIdentifier('https://example.org/id')).toBe('https://example.org/id')
    expect(readIdentifier({ '@id': 'https://example.org/ref' })).toBe('https://example.org/ref')
    expect(readIdentifier({ value: 'not-an-id' })).toBeUndefined()
    expect(readStringArray(['one', 2, 'two'])).toEqual(['one', 'two'])
    expect(readStringArray('one')).toBeUndefined()
  })
})
