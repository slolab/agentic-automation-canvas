import { describe, expect, it } from 'vitest'
import {
  appendPointer,
  decodePointer,
  encodePointer,
  encodePointerSegment,
  hasAtPath,
  isRecord,
  parentPointer,
  readAtPath,
  removeAtPath,
  writeAtPath,
} from '@/json'

describe('isRecord', () => {
  it('accepts plain objects only', () => {
    expect(isRecord({})).toBe(true)
    expect(isRecord({ a: 1 })).toBe(true)
    expect(isRecord([])).toBe(false)
    expect(isRecord(null)).toBe(false)
    expect(isRecord(undefined)).toBe(false)
    expect(isRecord('a')).toBe(false)
    expect(isRecord(0)).toBe(false)
  })
})

describe('JSON Pointer encoding', () => {
  it('escapes reserved characters in segments', () => {
    expect(encodePointerSegment('plain')).toBe('plain')
    expect(encodePointerSegment('a/b')).toBe('a~1b')
    expect(encodePointerSegment('a~b')).toBe('a~0b')
    expect(encodePointerSegment('a~1b')).toBe('a~01b')
  })

  it('round-trips segments through encode and decode', () => {
    const segments = ['project', 'extension/with~tokens', '0', '']
    expect(decodePointer(encodePointer(segments))).toEqual(segments)
  })

  it('represents the document root as an empty pointer', () => {
    expect(encodePointer([])).toBe('')
    expect(decodePointer('')).toEqual([])
  })

  it('distinguishes the root from an empty root property name', () => {
    expect(encodePointer([''])).toBe('/')
    expect(decodePointer('/')).toEqual([''])
  })

  it('appends a single escaped segment', () => {
    expect(appendPointer('', 'project')).toBe('/project')
    expect(appendPointer('/project', 'a/b')).toBe('/project/a~1b')
    expect(appendPointer('', '')).toBe('/')
  })

  it('derives the parent pointer', () => {
    expect(parentPointer('/a/b/c')).toBe('/a/b')
    expect(parentPointer('/a')).toBe('')
    expect(parentPointer('')).toBe('')
    expect(parentPointer('/project/extension~1x')).toBe('/project')
  })
})

describe('hasAtPath', () => {
  const root = { a: { b: [{ c: 1 }] }, empty: undefined }

  it('treats the root pointer as present', () => {
    expect(hasAtPath(root, '')).toBe(true)
  })

  it('walks objects and array indices', () => {
    expect(hasAtPath(root, '/a/b/0/c')).toBe(true)
    expect(hasAtPath(root, '/a/b/1')).toBe(false)
    expect(hasAtPath(root, '/a/missing')).toBe(false)
    expect(hasAtPath(root, '/a/b/notAnIndex')).toBe(false)
    expect(hasAtPath(root, '/a/b/0/c/deeper')).toBe(false)
  })

  it('reports own properties holding undefined as present', () => {
    expect(hasAtPath(root, '/empty')).toBe(true)
  })
})

describe('readAtPath', () => {
  const root = { a: { b: ['first', 'second'] } }

  it('returns the root for an empty pointer', () => {
    expect(readAtPath(root, '')).toBe(root)
  })

  it('reads nested object and array values', () => {
    expect(readAtPath(root, '/a/b/1')).toBe('second')
    expect(readAtPath(root, '/a')).toBe(root.a)
  })

  it('returns undefined for pointers that do not resolve', () => {
    expect(readAtPath(root, '/a/missing')).toBeUndefined()
    expect(readAtPath(root, '/a/b/9')).toBeUndefined()
  })
})

describe('writeAtPath', () => {
  it('replaces existing object and array values', () => {
    const value = { a: { b: ['first'] } }
    expect(writeAtPath(value, '/a/b/0', 'replaced')).toBe(true)
    expect(value.a.b[0]).toBe('replaced')
  })

  it('never creates new structure', () => {
    const value: Record<string, unknown> = { a: 1 }
    expect(writeAtPath(value, '/missing', 2)).toBe(false)
    expect(writeAtPath(value, '', 2)).toBe(false)
    expect(value).toEqual({ a: 1 })
  })
})

describe('removeAtPath', () => {
  it('deletes object properties', () => {
    const value = { keep: 1, drop: 2 }
    expect(removeAtPath(value, '/drop')).toBe(true)
    expect(value).toEqual({ keep: 1 })
  })

  it('splices array items', () => {
    const value = { list: ['a', 'b', 'c'] }
    expect(removeAtPath(value, '/list/1')).toBe(true)
    expect(value.list).toEqual(['a', 'c'])
  })

  it('refuses the root and unknown paths', () => {
    const value = { a: 1 }
    expect(removeAtPath(value, '')).toBe(false)
    expect(removeAtPath(value, '/missing')).toBe(false)
    expect(removeAtPath(value, '/a/deeper')).toBe(false)
    expect(value).toEqual({ a: 1 })
  })

  it('refuses non-numeric and out-of-range array keys', () => {
    const value = { list: ['a'] }
    expect(removeAtPath(value, '/list/x')).toBe(false)
    expect(removeAtPath(value, '/list/5')).toBe(false)
    expect(value.list).toEqual(['a'])
  })

  it('handles escaped property names', () => {
    const value: Record<string, unknown> = { 'a/b': 1, 'c~d': 2 }
    expect(removeAtPath(value, '/a~1b')).toBe(true)
    expect(removeAtPath(value, '/c~0d')).toBe(true)
    expect(value).toEqual({})
  })
})
