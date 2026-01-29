/**
 * TypeScript interfaces for Agentic Automation Canvas data model
 * Aligned with schema/canvas-schema.json
 */

export interface CanvasData {
  project: ProjectDefinition
  persons?: Person[] // Centralized Person management
  userExpectations?: UserExpectations
  developerFeasibility?: DeveloperFeasibility
  governance?: GovernanceStaging
  dataAccess?: DataAccessSensitivity
  outcomes?: OutcomesEvaluation
}

export interface ProjectDefinition {
  title: string
  description: string
  objective?: string
  projectStage?: string
  startDate?: string
  endDate?: string
  domain?: string[]
  keywords?: string[]
  fundingGrant?: string
  leadOrganization?: string
  projectId?: string
  // Project-level value summary
  headlineValue?: string
  aggregateExpectedHoursSavedPerMonth?: number
  primaryValueDriver?: 'time' | 'quality' | 'risk' | 'enablement'
}

export interface UserExpectations {
  requirements?: Requirement[]
  stakeholders?: Stakeholder[]
}

export interface Requirement {
  id: string
  description: string
  userStory?: string
  priority?: 'low' | 'medium' | 'high' | 'critical'
  status?: 'planned' | 'in-progress' | 'completed' | 'cancelled'
  stakeholder?: string
  value?: string
  // Value model fields (M0 - required)
  unitOfWork?: string
  unitCategory?: 'case' | 'document' | 'record' | 'message' | 'analysisRun' | 'meeting' | 'other'
  volumePerMonth?: number
  baselineMinutesPerUnit?: number | { best: number; likely: number; worst: number }
  timeSavedMinutesPerUnit?: { best: number; likely: number; worst: number }
  valueType?: Array<'time' | 'quality' | 'risk' | 'enablement'>
  // Value model fields (M1/M2 - optional)
  reworkRate?: number
  errorCost?: string | number
  humanOversightMinutesPerUnit?: number
  confidenceUser?: 'low' | 'medium' | 'high'
  confidenceDev?: 'low' | 'medium' | 'high'
  assumptions?: string
}

export interface Person {
  id: string // Unique identifier for the Person (e.g., 'person-0', 'person-1')
  name: string
  affiliation?: string // Optional disambiguation
  orcid?: string // Optional stable identifier (e.g., ORCID)
}

export interface Stakeholder {
  personId: string // Reference to Person entity ID
  role?: string
  values?: string[]
  roleContext?: string // Optional role context for this stakeholder role
}

export interface DeveloperFeasibility {
  trlLevel?: {
    current?: number
    target?: number
  }
  technicalRisk?: 'low' | 'medium' | 'high' | 'critical'
  algorithms?: string[]
  tools?: string[]
  effortEstimate?: string
  feasibilityNotes?: string
  modelSelection?: 'open-source' | 'frontier-model' | 'fine-tuned' | 'custom' | 'other'
  modelName?: string
  baselineCapability?: {
    taskPerformance?: 'excellent' | 'good' | 'moderate' | 'poor' | 'fails'
    successRate?: number
    limitations?: string
    requiresCustomInstructions?: boolean
    customInstructionsComplexity?: 'low' | 'medium' | 'high'
  }
  expectedGains?: {
    performanceImprovement?: 'minimal' | 'moderate' | 'significant' | 'transformative'
    headroom?: 'low' | 'medium' | 'high'
    justification?: string
  }
  implementationDifficulty?: {
    skillAdditionDifficulty?: 'very-easy' | 'easy' | 'moderate' | 'difficult' | 'very-difficult'
    baselineComparisonRequired?: boolean
    validationMonitoringRequired?: boolean
    securityLevel?: 'low' | 'medium' | 'high' | 'critical'
  }
  agenticExplanation?: string
}

export interface GovernanceStaging {
  stages?: GovernanceStage[]
}

export interface Milestone {
  description: string
  kpi?: string
}

export interface GovernanceStage {
  id: string
  name: string
  startDate?: string
  endDate?: string
  agents?: Agent[]
  milestones?: Milestone[]
  complianceStandards?: string[]
}

export interface Agent {
  // For person-type agents: reference to Person entity
  // For organization/software: name directly
  personId?: string // Reference to Person entity ID (when type === 'person')
  name?: string // Name for organization/software agents (when type !== 'person')
  role?: string
  type: 'person' | 'organization' | 'software'
  roleContext?: string // Optional role context for this agent role
}

export interface DataAccessSensitivity {
  datasets?: Dataset[]
}

export interface Dataset {
  id: string
  title: string
  description?: string
  format?: string
  license?: string
  accessRights?: 'open' | 'restricted' | 'confidential' | 'highly-restricted'
  duoTerms?: string[]
  pid?: string
  publisher?: string
  containsPersonalData?: boolean
  sensitivityLevel?: string
}

export interface OutcomesEvaluation {
  deliverables?: Deliverable[]
  publications?: Publication[]
  evaluations?: Evaluation[]
}

export interface Deliverable {
  id: string
  title: string
  type: string
  description?: string
  date?: string
  pid?: string
}

export interface Publication {
  id: string
  title: string
  doi?: string
  authors?: string[]
  date?: string
}

export interface Evaluation {
  id: string
  type: string
  date?: string
  metrics?: Record<string, unknown>
  results?: string
}
