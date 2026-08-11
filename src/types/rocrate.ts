/**
 * TypeScript interfaces for RO-Crate JSON-LD structure
 * Following RO-Crate 1.2 specification
 */

export interface ROCrateJSONLD {
  '@context': string | string[] | Record<string, unknown> | Array<string | Record<string, unknown>>
  '@graph': ROCrateEntity[]
}

export interface ROCrateEntity {
  '@id': string
  '@type': string | string[]
  [key: string]: unknown
}
