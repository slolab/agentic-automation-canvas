import { describe, it, expect } from 'vitest'
import { isHttpUrl } from '@/utils/url'

describe('isHttpUrl', () => {
  it('returns true for http:// URLs', () => {
    expect(isHttpUrl('http://example.com')).toBe(true)
  })

  it('returns true for https:// URLs', () => {
    expect(isHttpUrl('https://example.com')).toBe(true)
  })

  it('is case-insensitive', () => {
    expect(isHttpUrl('HTTPS://EXAMPLE.COM')).toBe(true)
    expect(isHttpUrl('Http://Example.com')).toBe(true)
  })

  it('returns false for non-HTTP URIs', () => {
    expect(isHttpUrl('urn:isbn:0451450523')).toBe(false)
    expect(isHttpUrl('ftp://example.com')).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isHttpUrl('')).toBe(false)
  })
})
