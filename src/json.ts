/**
 * Plain-JSON helpers shared by schema validation, recovery, persistence, and
 * RO-Crate mapping. Nothing here knows about the AAC domain.
 *
 * The JSON Pointer functions (RFC 6901) are kept together deliberately: Ajv
 * reports findings as pointers, and every consumer that reads, reports, or
 * repairs a finding needs the same escaping rules. Splitting them would
 * reintroduce the partial re-implementations this module replaced.
 */

export type UnknownRecord = Record<string, unknown>

export function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

/** Escape a single reference token: `~` becomes `~0` and `/` becomes `~1`. */
export function encodePointerSegment(segment: string): string {
  return segment.replace(/~/g, '~0').replace(/\//g, '~1')
}

/**
 * Build a pointer from reference tokens. An empty token list is the document
 * root (`''`); a single empty token is the root property named `''` (`'/'`).
 */
export function encodePointer(segments: readonly string[]): string {
  if (segments.length === 0) return ''
  return `/${segments.map(encodePointerSegment).join('/')}`
}

export function decodePointer(pointer: string): string[] {
  if (pointer === '') return []
  return pointer
    .split('/')
    .slice(1)
    .map((segment) => segment.replace(/~1/g, '/').replace(/~0/g, '~'))
}

/** Append one unescaped reference token to an existing pointer. */
export function appendPointer(pointer: string, segment: string): string {
  return `${pointer}/${encodePointerSegment(segment)}`
}

export function parentPointer(pointer: string): string {
  return encodePointer(decodePointer(pointer).slice(0, -1))
}

function arrayIndex(container: readonly unknown[], segment: string): number | undefined {
  if (!/^\d+$/.test(segment)) return undefined
  const index = Number(segment)
  return index < container.length ? index : undefined
}

/** Resolve every token except the last, returning the container to act on. */
function resolveParent(root: unknown, segments: readonly string[]): unknown {
  let current: unknown = root
  for (const segment of segments) {
    if (Array.isArray(current)) {
      const index = arrayIndex(current, segment)
      if (index === undefined) return undefined
      current = current[index]
    } else if (isRecord(current)) {
      current = current[segment]
    } else {
      return undefined
    }
  }
  return current
}

/** True when the pointer resolves to an existing property or array item. */
export function hasAtPath(root: unknown, pointer: string): boolean {
  const segments = decodePointer(pointer)
  if (segments.length === 0) return true

  let current: unknown = root
  for (const segment of segments) {
    if (Array.isArray(current)) {
      const index = arrayIndex(current, segment)
      if (index === undefined) return false
      current = current[index]
    } else if (isRecord(current)) {
      if (!Object.prototype.hasOwnProperty.call(current, segment)) return false
      current = current[segment]
    } else {
      return false
    }
  }
  return true
}

/** Read the value a pointer addresses, or `undefined` when it does not resolve. */
export function readAtPath(root: unknown, pointer: string): unknown {
  const segments = decodePointer(pointer)
  if (segments.length === 0) return root
  if (!hasAtPath(root, pointer)) return undefined
  return resolveParent(root, segments)
}

/**
 * Replace the value a pointer addresses. Returns false unless the pointer
 * already resolves, so this never creates new structure.
 */
export function writeAtPath(root: unknown, pointer: string, value: unknown): boolean {
  const segments = decodePointer(pointer)
  if (segments.length === 0 || !hasAtPath(root, pointer)) return false

  const parent = resolveParent(root, segments.slice(0, -1))
  const key = segments[segments.length - 1]

  if (Array.isArray(parent)) {
    const index = arrayIndex(parent, key)
    if (index === undefined) return false
    parent[index] = value
    return true
  }
  if (!isRecord(parent)) return false
  parent[key] = value
  return true
}

/**
 * Delete the value a pointer addresses, splicing array items so no hole
 * remains. Returns false for the root and for pointers that do not resolve.
 */
export function removeAtPath(root: unknown, pointer: string): boolean {
  const segments = decodePointer(pointer)
  if (segments.length === 0) return false

  const parent = resolveParent(root, segments.slice(0, -1))
  const key = segments[segments.length - 1]

  if (Array.isArray(parent)) {
    const index = arrayIndex(parent, key)
    if (index === undefined) return false
    parent.splice(index, 1)
    return true
  }
  if (isRecord(parent) && Object.prototype.hasOwnProperty.call(parent, key)) {
    delete parent[key]
    return true
  }
  return false
}
