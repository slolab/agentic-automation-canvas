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

export interface MetadataFileDescriptor extends ROCrateEntity {
  '@id': 'ro-crate-metadata.json'
  '@type': 'CreativeWork'
  conformsTo: {
    '@id': string
  }
  about: {
    '@id': string
  }
}

export interface RootDataset extends ROCrateEntity {
  '@id': './'
  '@type': 'Dataset' | ['schema:Dataset', 'dcat:Dataset']
  name?: string
  description?: string
  about?: {
    '@id': string
  }
  hasPart?: Array<{ '@id': string }>
}

export interface ProjectEntity extends ROCrateEntity {
  '@type': 'schema:Project' | 'schema:ResearchProject' | ['schema:Project', 'schema:ResearchProject']
  name: string
  description?: string
  startDate?: string
  endDate?: string
  keywords?: string | string[]
  'aac:headlineValue'?: string
  'aac:primaryValueDriver'?: 'time' | 'quality' | 'risk' | 'enablement'
  'aac:roughEstimateValue'?: number
  'aac:roughEstimateUnit'?: string
}

export interface PlanEntity extends ROCrateEntity {
  '@type': 'prov:Plan' | 'p-plan:Plan' | ['prov:Plan', 'p-plan:Plan']
  name?: string
  description?: string
  'p-plan:hasStep'?: Array<{
    '@id': string
  }>
}

export interface ActivityEntity extends ROCrateEntity {
  '@type': 'prov:Activity'
  name?: string
  startedAtTime?: string
  endedAtTime?: string
  wasAssociatedWith?: {
    '@id': string
  } | Array<{ '@id': string }>
  hadPlan?: {
    '@id': string
  }
  wasInformedBy?: {
    '@id': string
  } | Array<{ '@id': string }>
}

export interface DatasetEntity extends ROCrateEntity {
  '@type': 'dcat:Dataset' | 'schema:Dataset'
  name: string
  description?: string
  license?: string | { '@id': string }
  'dct:accessRights'?: string | { '@id': string } | Array<string | { '@id': string }>
  'schema:encodingFormat'?: string
  identifier?: string
  'dct:conformsTo'?: Array<{ '@id': string }>
  'aac:containsPersonalData'?: boolean
}

export interface PersonEntity extends ROCrateEntity {
  '@type': 'Person' | 'schema:Person'
  name: string
  email?: string
  affiliation?: {
    '@id': string
  } | string
  // Person identity management fields
  'aac:roles'?: string[] // Array of role strings
  'schema:affiliation'?: string // Disambiguation field (as string, not object)
  'aac:roleContext'?: string // Role context
  'schema:identifier'?: string | { '@id': string } // For ORCID support
  role?: string
}

export interface OrganizationEntity extends ROCrateEntity {
  '@type': 'Organization'
  name: string
  url?: string
}

export interface CreativeWorkEntity extends ROCrateEntity {
  '@type': 'schema:CreativeWork' | 'schema:ScholarlyArticle' | 'schema:Report' | 'schema:SoftwareApplication'
  name: string
  description?: string
  datePublished?: string
  wasGeneratedBy?: {
    '@id': string
  }
  'aac:evaluationType'?: string
  'aac:milestoneType'?: string
}

export interface ValueModel {
  'aac:unitOfWork'?: string
  'aac:unitCategory'?: 'case' | 'document' | 'record' | 'message' | 'analysisRun' | 'meeting' | 'other'
  'aac:volumePerMonth'?: number
  /** RO-Crate field name (legacy compatibility) - maps to benefit.oversightMinutesPerUnit in internal schema */
  'aac:humanOversightMinutesPerUnit'?: number
  'aac:benefits'?: Array<{
    benefitType: 'time' | 'quality' | 'risk' | 'enablement'
    metricId: string
    metricLabel: string
    aggregationBasis?: 'perUnit' | 'perMonth' | 'oneOff'
    benefitUnit: string
    baseline: unknown
    expected: unknown
    confidenceUser?: 'low' | 'medium' | 'high'
    confidenceDev?: 'low' | 'medium' | 'high'
    assumptions?: string
  }>
}
