/**
 * TypeScript interfaces for RO-Crate JSON-LD structure
 * Following RO-Crate 1.1 specification
 */

export interface ROCrateJSONLD {
  '@context': string
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
  '@type': 'Dataset'
  name?: string
  description?: string
  about?: {
    '@id': string
  }
  hasPart?: Array<{ '@id': string }>
}

export interface ProjectEntity extends ROCrateEntity {
  '@type': 'Project' | 'ResearchProject' | ['Project', 'ResearchProject']
  name: string
  description?: string
  startDate?: string
  endDate?: string
  keywords?: string | string[]
}

export interface PlanEntity extends ROCrateEntity {
  '@type': 'Plan' | 'p-plan:Plan' | ['Plan', 'p-plan:Plan']
  name?: string
  description?: string
  'p-plan:hasStep'?: Array<{
    '@id': string
    '@type': 'p-plan:Step'
    description?: string
    [key: string]: unknown
  }>
}

export interface ActivityEntity extends ROCrateEntity {
  '@type': 'Activity'
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
  '@type': 'Dataset'
  name: string
  description?: string
  license?: string | { '@id': string }
  accessRights?: string | { '@id': string } | Array<string | { '@id': string }>
  format?: string
  identifier?: string
}

export interface PersonEntity extends ROCrateEntity {
  '@type': 'Person'
  name: string
  email?: string
  affiliation?: {
    '@id': string
  }
}

export interface OrganizationEntity extends ROCrateEntity {
  '@type': 'Organization'
  name: string
  url?: string
}

export interface CreativeWorkEntity extends ROCrateEntity {
  '@type': 'CreativeWork' | 'ScholarlyArticle' | 'Report' | 'SoftwareApplication'
  name: string
  description?: string
  datePublished?: string
  wasGeneratedBy?: {
    '@id': string
  }
}
