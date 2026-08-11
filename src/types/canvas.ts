/* eslint-disable */
/**
 * Generated from schema/manifest.json and its current AAC JSON Schema.
 * Do not edit by hand. Run `npm run schema:generate` after changing the schema.
 */

/**
 * A classified benefit metric or an unclassified benefit captured by the simplified canvas
 *
 * This interface was referenced by `CanvasData`'s JSON-Schema
 * via the `definition` "Benefit".
 */
export type Benefit = ClassifiedBenefit | UnclassifiedBenefit
/**
 * Indicates whether higher values, lower values, hitting a target, or boolean true is the desired outcome
 */
export type BenefitDirection = 'increaseIsBetter' | 'decreaseIsBetter' | 'targetIsBetter' | 'boolIsBetter'
/**
 * Whether baseline/expected are absolute measured values or improvement deltas
 */
export type ValueMeaning = 'absolute' | 'delta'
/**
 * A benefit value: numeric, categorical, or binary
 *
 * This interface was referenced by `CanvasData`'s JSON-Schema
 * via the `definition` "BenefitValue".
 */
export type BenefitValue =
  | {
      type: 'numeric'
      value: number
    }
  | {
      type: 'categorical'
      category: 'low' | 'medium' | 'high'
    }
  | {
      type: 'binary'
      bool: boolean
    }
export type AgentDataAction = 'read' | 'modify' | 'process' | 'generate'
/**
 * Category of risk
 */
export type RiskCategory = 'technical' | 'data' | 'compliance' | 'operational' | 'ethical' | 'adoption'
/**
 * Probability of the risk occurring
 */
export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical'
/**
 * Current status of the risk
 */
export type RiskStatus = 'identified' | 'mitigated' | 'accepted' | 'resolved'

/**
 * Version 0.17.1 JSON Schema for Agentic Automation Canvas data.
 */
export interface CanvasData {
  /**
   * Semantic version of the canvas (e.g., '0.1.0'). Should follow semantic versioning standards (https://semver.org/).
   */
  version?: string
  /**
   * Date when the version was downloaded or created (ISO date format)
   */
  versionDate?: string
  /**
   * Centralized Person entities. All persons involved in the project are managed here and referenced by stakeholders and agents.
   */
  persons?: Person[]
  project: ProjectDefinition
  userExpectations?: UserExpectations
  developerFeasibility?: DeveloperFeasibility
  governance?: GovernanceStaging
  dataAccess?: DataAccessSensitivity
  outcomes?: OutcomesEvaluation
}
export interface Person {
  /**
   * Unique identifier for the Person (e.g., 'person-0', 'person-1')
   */
  id: string
  name: string
  /**
   * Optional disambiguation field
   */
  affiliation?: string
  /**
   * Optional stable identifier (e.g., ORCID)
   */
  orcid?: string
  /**
   * Functional roles from the AAC controlled vocabulary
   */
  functionRoles?: string[]
  /**
   * Free-text position or title description
   */
  localTitle?: string
}
export interface ProjectDefinition {
  title: string
  description: string
  /**
   * Approximate frequency with which the project problem occurs
   */
  problemFrequency?: 'daily' | 'weekly' | 'monthly' | 'few-times-per-year' | 'less-than-yearly'
  /**
   * Concrete examples of the problem, beginning with the most recent real case
   */
  problemExamples?: string[]
  objective?: string
  projectStage?: string
  startDate?: string
  endDate?: string
  domain?: string[]
  keywords?: string[]
  fundingGrant?: string
  leadOrganization?: string
  projectId?: string
  headlineValue?: string
  primaryValueDriver?: 'time' | 'quality' | 'risk' | 'enablement' | 'cost'
  /**
   * Optional manual estimate of project-level benefit value when getting started (before task-level benefits)
   */
  roughEstimateValue?: number
  /**
   * Unit for the rough estimate (e.g., 'hours/month', '% error reduction', 'incidents prevented/month')
   */
  roughEstimateUnit?: string
  /**
   * Semantic version of the canvas (e.g., '0.1.0'). Should follow semantic versioning standards (https://semver.org/).
   */
  version?: string
  /**
   * Date when the version was downloaded or created (ISO date format)
   */
  versionDate?: string
  /**
   * Person IDs of project creators
   */
  creator?: string[]
  /**
   * License URI for the canvas and its RO-Crate export
   */
  license?: string
}
export interface UserExpectations {
  requirements?: Requirement[]
}
export interface Requirement {
  id: string
  title: string
  description?: string
  userStory?: string
  priority?: 'low' | 'medium' | 'high' | 'critical'
  status?: 'planned' | 'in-progress' | 'completed' | 'cancelled'
  value?: string
  unitOfWork?: string
  unitCategory?: 'item' | 'interaction' | 'computation' | 'other'
  volumePerMonth?: number
  /**
   * Standardized time unit for this requirement's time benefits and oversight. All time values use this unit for consistency.
   */
  timeUnit?: 'minutes' | 'hours'
  /**
   * Array of benefit metrics for this requirement
   */
  benefits: Benefit[]
  /**
   * IDs of requirements this task depends on
   */
  dependsOn?: string[]
  /**
   * Person IDs of stakeholders for this task
   */
  stakeholders?: string[]
  /**
   * The user population whose benefit estimates this task captures (e.g., 'junior researchers', 'clinical staff with 3+ years experience'). Specifying this makes heterogeneity explicit when different user groups are expected to benefit differently from the same type of task.
   */
  targetPopulation?: string
  dataAccess?: RequirementDataAccess
  feasibility?: RequirementFeasibility
}
/**
 * A quantified and classified benefit metric for a requirement
 *
 * This interface was referenced by `CanvasData`'s JSON-Schema
 * via the `definition` "ClassifiedBenefit".
 */
export interface ClassifiedBenefit {
  /**
   * Type of benefit
   */
  benefitType: 'time' | 'quality' | 'risk' | 'enablement' | 'cost'
  /**
   * Identifier for the metric (controlled vocabulary or 'custom')
   */
  metricId: string
  /**
   * Human-readable label for the metric
   */
  metricLabel: string
  /**
   * Original free-form benefit description, retained when a simplified-canvas benefit is classified
   */
  description?: string
  direction: BenefitDirection
  valueMeaning: ValueMeaning
  /**
   * Target value when direction is 'targetIsBetter'
   */
  target?: number
  /**
   * How the benefit value is aggregated
   */
  aggregationBasis?: 'perUnit' | 'perMonth' | 'oneOff'
  /**
   * Unit for the benefit value (e.g., 'minutes', '%', 'incidents/month')
   */
  benefitUnit: string
  baseline: BenefitValue
  expected: BenefitValue
  /**
   * Human oversight per unit in minutes. Only used when aggregationBasis is 'perUnit'. Mutually exclusive with oversightMinutesPerMonth. Subtracted from gross time benefit.
   */
  oversightMinutesPerUnit?: number
  /**
   * Human oversight per month in minutes. Only used when aggregationBasis is 'perMonth'. Mutually exclusive with oversightMinutesPerUnit. Subtracted from gross time benefit.
   */
  oversightMinutesPerMonth?: number
  /**
   * User's confidence in the benefit estimate
   */
  confidenceUser?: 'low' | 'medium' | 'high'
  /**
   * Developer's confidence in the benefit estimate
   */
  confidenceDev?: 'low' | 'medium' | 'high'
  /**
   * Key assumptions underlying the benefit estimate
   */
  assumptions?: string
}
/**
 * A free-form benefit or metric awaiting classification and quantification
 *
 * This interface was referenced by `CanvasData`'s JSON-Schema
 * via the `definition` "UnclassifiedBenefit".
 */
export interface UnclassifiedBenefit {
  /**
   * Marks a lightweight simplified-canvas benefit
   */
  benefitType: 'unclassified'
  /**
   * Free-form expected benefit
   */
  description?: string
  /**
   * Free-form success metric to quantify later
   */
  metricLabel?: string
}
/**
 * Task-level data access: which datasets this task uses and what the agent may do with them. Datasets remain defined once in dataAccess.datasets; tasks reference them by id (edited from the Data Access tab).
 */
export interface RequirementDataAccess {
  /**
   * Links to datasets this task uses, with agent permissions
   */
  datasetLinks?: TaskDatasetLink[]
}
export interface TaskDatasetLink {
  /**
   * Id of a dataset defined in dataAccess.datasets
   */
  datasetId: string
  /**
   * What the agent is allowed to do with this dataset
   */
  agentActions?: AgentDataAction[]
  /**
   * Free-text notes on this task-dataset link
   */
  notes?: string
}
/**
 * Optional per-task feasibility (overrides project-level defaults)
 */
export interface RequirementFeasibility {
  technicalRisk?: 'low' | 'medium' | 'high' | 'critical'
  effortEstimate?: {
    value: number
    unit: 'weeks' | 'person-hours'
  }
  feasibilityNotes?: string
  algorithms?: string[]
  tools?: string[]
  /**
   * Type of model to be used (if applicable). Set to 'none' if task is deterministic.
   */
  modelSelection?: 'open-source' | 'frontier-model' | 'fine-tuned' | 'custom' | 'other' | 'none'
  /**
   * Specific model name or identifier (e.g., 'claude-opus-4-5', 'Qwen2.5-72B-Instruct')
   */
  modelName?: string
  /**
   * URI pointing to the model's model card
   */
  modelCardUri?: string
  /**
   * Potential agentic use cases and selected technology architecture for this task. Set architecture to 'none' if the task is deterministic and doesn't require LLMs.
   */
  technologyApproach?: {
    /**
     * Primary technology architecture. 'none' indicates deterministic task without LLM requirement.
     */
    architecture?: 'none' | 'simple-prompting' | 'rag' | 'fine-tuning' | 'agents' | 'other'
    /**
     * Agentic use-case patterns selected as potential approaches
     */
    approaches?: (
      | 'agentic-user-support'
      | 'unstructured-content-processing'
      | 'code-development'
      | 'computer-use'
      | 'live-event-monitoring'
      | 'intelligent-search'
      | 'agentic-research-support'
      | 'data-metadata-curation'
      | 'analysis-pipeline-orchestration'
      | 'experiment-protocol-design'
      | 'simulation-parameter-optimization'
      | 'laboratory-workflow-coordination'
      | 'other'
    )[]
    /**
     * User-defined potential approaches entered when the controlled vocabulary is insufficient
     */
    customApproaches?: string[]
    ragDetails?: {
      retrievalMethod?: string
      embeddingModel?: string
      chunkingStrategy?: string
    }
    fineTuningDetails?: {
      /**
       * Base model that was fine-tuned
       */
      baseModel?: string
      /**
       * Method used for fine-tuning (e.g., LoRA, QLoRA, full fine-tuning)
       */
      tuningApproach?: string
      /**
       * Dataset used for fine-tuning
       */
      dataset?: string
    }
    agenticDetails?: {
      /**
       * e.g. ReAct, MCP, Plan-and-Execute
       */
      framework?: string[]
      /**
       * MCP tools, custom tools
       */
      tools?: string[]
      /**
       * e.g. LangGraph
       */
      orchestration?: string[]
    }
  }
  /**
   * Per-task risk assessments paralleling benefits
   */
  risks?: Risk[]
  deploymentCost?: DeploymentCost
}
/**
 * A risk assessment for a requirement, paralleling benefit metrics
 *
 * This interface was referenced by `CanvasData`'s JSON-Schema
 * via the `definition` "Risk".
 */
export interface Risk {
  /**
   * Unique identifier for the risk
   */
  id: string
  riskCategory: RiskCategory
  /**
   * Short title for the risk
   */
  title: string
  /**
   * Detailed description of the risk
   */
  description?: string
  likelihood: RiskSeverity
  /**
   * Severity if the risk materialises
   */
  impact: 'low' | 'medium' | 'high' | 'critical'
  /**
   * Strategy to mitigate or address the risk
   */
  mitigation?: string
  status: RiskStatus
}
/**
 * Estimated deployment/operational cost for running this automated task
 */
export interface DeploymentCost {
  /**
   * Cost per interaction/unit of work
   */
  costPerUnit?: number
  /**
   * Flat monthly deployment cost
   */
  costPerMonth?: number
  /**
   * Whether cost is specified per interaction (multiplied by volume) or as a flat monthly figure
   */
  aggregationBasis: 'perUnit' | 'perMonth'
  /**
   * Currency for the cost estimate as a 3-letter code (e.g., USD, EUR, GBP)
   */
  currency: string
  /**
   * Assumptions or notes about the cost estimate
   */
  costNotes?: string
}
/**
 * Project-level feasibility (simple, generic defaults that apply to all tasks unless overridden)
 */
export interface DeveloperFeasibility {
  /**
   * Technology Readiness Level - project-level maturity assessment
   */
  trlLevel?: {
    current?: number
    target?: number
  }
  /**
   * Overall technical risk for the project
   */
  technicalRisk?: 'low' | 'medium' | 'high' | 'critical'
  /**
   * Overall effort estimate for the project
   */
  effortEstimate?: {
    value: number
    unit: 'weeks' | 'person-hours'
  }
  /**
   * Project-level feasibility notes
   */
  feasibilityNotes?: string
  /**
   * Tools, products, services, or other existing solutions that require research
   */
  solutionsToResearch?: string
  /**
   * Lightweight project constraints that require deeper feasibility investigation
   */
  constraintFlags?: (
    | 'large-data'
    | 'cluster-compute'
    | 'large-gpu'
    | 'personal-data'
    | 'valuable-ip'
    | 'external-system-integration'
    | 'restricted-processing-environment'
    | 'real-time'
    | 'regulated-or-high-impact'
    | 'procurement-or-licensing'
  )[]
  /**
   * Whether a person or team is available to build the capability
   */
  buildTeamStatus?: 'none' | 'possible' | 'committed'
  /**
   * Whether a person or team is available to maintain the capability after the first milestone
   */
  maintenanceOwnerStatus?: 'none' | 'possible' | 'committed'
}
export interface GovernanceStaging {
  stages?: GovernanceStage[]
}
export interface GovernanceStage {
  id: string
  name: string
  startDate?: string
  endDate?: string
  agents?: Agent[]
  milestones?: Milestone[]
  /**
   * Compliance standards as plain strings or structured framework references
   */
  complianceStandards?: (string | ComplianceStandard)[]
  /**
   * URI pointing to a Policy Card (machine-readable deployment governance artifact) governing this stage
   */
  policyCardUri?: string
}
export interface Agent {
  /**
   * Reference to Person entity ID (required when type is 'person')
   */
  personId?: string
  /**
   * Name for organization/software agents (required when type is not 'person')
   */
  name?: string
  role?: string
  type: 'person' | 'organization' | 'software'
  /**
   * Optional role context
   */
  roleContext?: string
}
export interface Milestone {
  description: string
  kpi?: string
}
export interface ComplianceStandard {
  /**
   * Name of the compliance framework (e.g., 'NIST AI RMF', 'ISO/IEC 42001', 'EU AI Act')
   */
  framework: string
  /**
   * Specific clauses or tokens (e.g., 'GOVERN-1', 'Article 72')
   */
  clauses?: string[]
  /**
   * URI to the framework or standard document
   */
  uri?: string
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
  /**
   * URI pointing to a FAIR dataset sheet
   */
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
  /**
   * Publication authors. Each author is either a reference to a Person entity or a free-text organization/consortium name.
   */
  authors?: PublicationAuthor[]
  date?: string
}
export interface PublicationAuthor {
  type: 'person' | 'organization'
  /**
   * Reference to Person entity ID (required when type is 'person')
   */
  personId?: string
  /**
   * Name for organization authors (required when type is 'organization')
   */
  name?: string
}
export interface Evaluation {
  id: string
  type: string
  date?: string
  metrics?: {
    [k: string]: unknown
  }
  results?: string
}
