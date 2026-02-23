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
  // Version management
  version?: string // Semantic version (e.g., "0.1.0")
  versionDate?: string // ISO date string when version was downloaded/created
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
  primaryValueDriver?: 'time' | 'quality' | 'risk' | 'enablement' | 'cost'
  roughEstimateValue?: number // Optional manual estimate when getting started (before task-level benefits)
  roughEstimateUnit?: string // Unit for rough estimate (e.g., "hours/month", "% error reduction")
  creator?: string[] // Person IDs of project creators
  // License for RO-Crate export (e.g. "https://creativecommons.org/licenses/by/4.0/")
  license?: string
  // Version management (stored at project level for ROcrate compatibility)
  version?: string // Semantic version (e.g., "0.1.0")
  versionDate?: string // ISO date string when version was downloaded/created
}

export interface UserExpectations {
  requirements?: Requirement[]
}

// Benefit value types - numeric, categorical, or binary
export type BenefitValue =
  | { type: 'numeric'; value: number }
  | { type: 'categorical'; category: 'low' | 'medium' | 'high' }
  | { type: 'binary'; bool: boolean }

// Benefit interpretation direction
export type BenefitDirection = 'increaseIsBetter' | 'decreaseIsBetter' | 'targetIsBetter' | 'boolIsBetter'

// Value meaning for baseline/expected
export type ValueMeaning = 'absolute' | 'delta'

// Generalized benefit structure for all benefit types
export interface Benefit {
  benefitType: 'time' | 'quality' | 'risk' | 'enablement' | 'cost'
  metricId: string // Controlled vocabulary + "custom"
  metricLabel: string // Human-readable label
  direction: BenefitDirection // Whether higher/lower/target/bool is better
  valueMeaning: ValueMeaning // Whether values are absolute or deltas
  target?: number // Target value when direction is 'targetIsBetter'
  aggregationBasis?: 'perUnit' | 'perMonth' | 'oneOff' // Default: perUnit
  benefitUnit: string // e.g., "minutes", "%", "incidents/month"
  baseline: BenefitValue
  expected: BenefitValue
  /** Human oversight (for time benefits only). Always in minutes. Subtracted from gross time savings. Mutually exclusive: use oversightMinutesPerUnit for perUnit aggregation, oversightMinutesPerMonth for perMonth aggregation. */
  oversightMinutesPerUnit?: number // Only used when aggregationBasis is 'perUnit'
  oversightMinutesPerMonth?: number // Only used when aggregationBasis is 'perMonth'
  confidenceUser?: 'low' | 'medium' | 'high'
  confidenceDev?: 'low' | 'medium' | 'high'
  assumptions?: string
}

/** Per-task feasibility (optional overrides for project-level feasibility) */
export interface RequirementFeasibility {
  technicalRisk?: 'low' | 'medium' | 'high' | 'critical'
  effortEstimate?: {
    value: number
    unit: 'weeks' | 'person-hours'
  }
  feasibilityNotes?: string
  algorithms?: string[]
  tools?: string[]
  /** Model selection for this task (if different from project-level) */
  modelSelection?: 'open-source' | 'frontier-model' | 'fine-tuned' | 'custom' | 'other' | 'none'
  /** Specific model name/version for this task */
  modelName?: string
  /** URI pointing to the model's model card */
  modelCardUri?: string
  /** Technology approach for this task. Set to 'none' if task is deterministic and doesn't require LLMs */
  technologyApproach?: {
    architecture?: 'none' | 'simple-prompting' | 'rag' | 'fine-tuning' | 'agents' | 'other'
    ragDetails?: { retrievalMethod?: string; embeddingModel?: string; chunkingStrategy?: string }
    fineTuningDetails?: {
      baseModel?: string // Base model that was fine-tuned
      tuningApproach?: string // e.g., LoRA, QLoRA, full fine-tuning
      dataset?: string // Dataset used for fine-tuning
    }
    agenticDetails?: { 
      framework?: string[] // e.g., ReAct, MCP, Plan-and-Execute (single-item array, new entry replaces existing)
      tools?: string[] // e.g., file_search, browser, custom tools
      orchestration?: string[] // e.g., LangGraph (single-item array, new entry replaces existing)
    }
  }
}

export interface Requirement {
  id: string
  title: string
  description?: string
  userStory?: string
  priority?: 'low' | 'medium' | 'high' | 'critical'
  status?: 'planned' | 'in-progress' | 'completed' | 'cancelled'
  value?: string
  // Value model fields
  unitOfWork?: string
  unitCategory?: 'item' | 'interaction' | 'computation' | 'other'
  volumePerMonth?: number
  /** Time unit for this requirement's time benefits. Standardizes all time values. */
  timeUnit?: 'minutes' | 'hours'
  // Generalized benefits array - replaces legacy time/quality/risk fields
  benefits: Benefit[]
  /** IDs of requirements this task depends on (workflow order) */
  dependsOn?: string[]
  /** Person IDs of stakeholders for this task */
  stakeholders?: string[]
  /** Optional per-task feasibility (overrides or complements global DeveloperFeasibility) */
  feasibility?: RequirementFeasibility
}

export interface Person {
  id: string // Unique identifier for the Person (e.g., 'person-0', 'person-1')
  name: string
  affiliation?: string // Optional disambiguation
  orcid?: string // Optional stable identifier (e.g., ORCID)
  functionRoles?: string[] // Functional roles from controlled vocabulary
  localTitles?: string[] // Free-text position/title descriptions
}

/** Project-level feasibility (simple, generic defaults that apply to all tasks unless overridden) */
export interface DeveloperFeasibility {
  /** Technology Readiness Level - project-level maturity assessment */
  trlLevel?: {
    current?: number
    target?: number
  }
  /** Overall technical risk for the project */
  technicalRisk?: 'low' | 'medium' | 'high' | 'critical'
  /** Overall effort estimate for the project */
  effortEstimate?: {
    value: number
    unit: 'weeks' | 'person-hours'
  }
  /** Project-level feasibility notes */
  feasibilityNotes?: string
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
  /** URI pointing to a FAIR dataset sheet */
  datasetSheetUri?: string
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
