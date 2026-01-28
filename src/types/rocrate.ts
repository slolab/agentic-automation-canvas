/**
 * TypeScript interfaces for RO-Crate JSON-LD structure
 * Following RO-Crate 1.1 specification
 */

export interface ROCrateJSONLD {
  '@context': string | string[] | Record<string, unknown>
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
  'aac:aggregateExpectedHoursSavedPerMonth'?: number
  'aac:primaryValueDriver'?: 'time' | 'quality' | 'risk' | 'enablement'
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
  'aac:baselineMinutesPerUnit'?: number | { best: number; likely: number; worst: number }
  'aac:timeSavedMinutesPerUnit'?: { best: number; likely: number; worst: number }
  'aac:valueType'?: Array<'time' | 'quality' | 'risk' | 'enablement'>
  'aac:reworkRate'?: number
  'aac:errorCost'?: string | number
  'aac:humanOversightMinutesPerUnit'?: number
  'aac:confidenceUser'?: 'low' | 'medium' | 'high'
  'aac:confidenceDev'?: 'low' | 'medium' | 'high'
  'aac:assumptions'?: string
}
