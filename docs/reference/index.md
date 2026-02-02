# Schema Reference

This section provides detailed reference documentation for all types and properties in the AAC schema.

!!! info "Ontology Alignment"
    The reference tables include an **Ontology** column indicating which standard vocabulary each generic field maps to. Fields marked with an ontology (e.g., "Schema.org", "DCAT/Dublin Core") align with established standards. Complex object types show "—" (not applicable). Custom AAC-specific fields are marked with "AAC". See the [schema ontology alignment](../schema/index.md#ontology-alignment) section for more details.

## Main Schema Properties

| Property | Type | Required | Description | Constraints | Ontology |
|----------|------|----------|-------------|-------------|----------|
| `dataAccess` | object | No |  |  | — |
| `developerFeasibility` | object | No |  |  | — |
| `governance` | object | No |  |  | — |
| `outcomes` | object | No |  |  | — |
| `persons` | array of object | No | Centralized Person entities. All persons involved in the project are managed here and referenced by stakeholders and agents. |  | — |
| `project` | object | Yes |  |  | — |
| `userExpectations` | object | No |  |  | — |
| `version` | string | No | Semantic version of the canvas (e.g., '0.9.0'). Should follow semantic versioning standards (https://semver.org/). | Pattern: `^\d+\.\d+\.\d+(-[\w\-]+)?(\+[\w\-]+)?$` | AAC |
| `versionDate` | string | No | Date when the version was downloaded or created (ISO date format) | Format: `date` | AAC |

## Benefit

A benefit metric for a requirement

| Property | Type | Required | Description | Constraints | Ontology |
|----------|------|----------|-------------|-------------|----------|
| `aggregationBasis` | string | No | How the benefit value is aggregated | Enum: `perUnit`, `perMonth`, `oneOff`<br>Default: `perUnit` | AAC |
| `assumptions` | string | No | Key assumptions underlying the benefit estimate |  | AAC |
| `baseline` | BenefitValue | Yes | Baseline value before automation |  | AAC |
| `benefitType` | string | Yes | Type of benefit | Enum: `time`, `quality`, `risk`, `enablement` | AAC |
| `benefitUnit` | string | Yes | Unit for the benefit value (e.g., 'minutes', '%', 'incidents/month') |  | AAC |
| `confidenceDev` | string | No | Developer's confidence in the benefit estimate | Enum: `low`, `medium`, `high` | AAC |
| `confidenceUser` | string | No | User's confidence in the benefit estimate | Enum: `low`, `medium`, `high` | AAC |
| `direction` | string | Yes | Indicates whether higher values, lower values, hitting a target, or boolean true is the desired outcome | Enum: `increaseIsBetter`, `decreaseIsBetter`, `targetIsBetter`, `boolIsBetter` | AAC |
| `expected` | BenefitValue | Yes | Expected value after automation |  | AAC |
| `metricId` | string | Yes | Identifier for the metric (controlled vocabulary or 'custom') |  | AAC |
| `metricLabel` | string | Yes | Human-readable label for the metric |  | AAC |
| `target` | number | No | Target value when direction is 'targetIsBetter' |  | AAC |
| `valueMeaning` | string | Yes | Whether baseline/expected are absolute measured values or improvement deltas | Enum: `absolute`, `delta` | AAC |

## DataAccess

| Property | Type | Required | Description | Constraints | Ontology |
|----------|------|----------|-------------|-------------|----------|
| `datasets` | array of object | No |  |  | — |

## DataAccess Dataset

| Property | Type | Required | Description | Constraints | Ontology |
|----------|------|----------|-------------|-------------|----------|
| `accessRights` | string | Yes |  |  | DCAT/Dublin Core |
| `containsPersonalData` | boolean | No |  |  | AAC |
| `description` | string | No |  |  | Schema.org |
| `duoTerms` | array of string | No |  |  | DCAT/Dublin Core |
| `format` | string | No |  |  | Schema.org |
| `id` | string | Yes |  |  | AAC |
| `license` | string | No |  | Format: `uri` | Schema.org |
| `pid` | string | No |  | Format: `uri` | Schema.org |
| `publisher` | string | No |  |  | Schema.org |
| `sensitivityLevel` | string | No |  |  | AAC |
| `title` | string | Yes |  |  | Schema.org |

## DeveloperFeasibility

| Property | Type | Required | Description | Constraints | Ontology |
|----------|------|----------|-------------|-------------|----------|
| `agenticExplanation` | string | No | Explanation of how agentic capabilities are added (autonomy, tool use, etc.) - clarifying that LLMs are not inherently agentic |  | AAC |
| `algorithms` | array of string | No |  |  | AAC |
| `baselineCapability` | object | No |  |  | — |
| `effortEstimate` | string | No |  |  | AAC |
| `expectedGains` | object | No |  |  | — |
| `feasibilityNotes` | string | No |  |  | AAC |
| `implementationDifficulty` | object | No |  |  | — |
| `modelName` | string | No | Specific model name or identifier (e.g., 'GPT-4', 'Llama 3.1', 'Claude Sonnet') |  | AAC |
| `modelSelection` | string | No | Type of base model to be used | Enum: `open-source`, `frontier-model`, `fine-tuned`, `custom`, `other` | AAC |
| `technicalRisk` | string | No |  | Enum: `low`, `medium`, `high`, `critical` | AAC |
| `tools` | array of string | No |  |  | AAC |
| `trlLevel` | object | No |  |  | — |

## DeveloperFeasibility BaselineCapability

| Property | Type | Required | Description | Constraints | Ontology |
|----------|------|----------|-------------|-------------|----------|
| `customInstructionsComplexity` | string | No | Complexity of custom instructions needed | Enum: `low`, `medium`, `high` | AAC |
| `limitations` | string | No | Key limitations of naive model performance |  | AAC |
| `requiresCustomInstructions` | boolean | No | Whether the task requires extensive custom instructions/prompts |  | AAC |
| `successRate` | number | No | Estimated success rate of naive model (0-100%) | Minimum: 0<br>Maximum: 100 | AAC |
| `taskPerformance` | string | No | How well the naive model performs the task without custom system | Enum: `excellent`, `good`, `moderate`, `poor`, `fails` | AAC |

## DeveloperFeasibility ExpectedGains

| Property | Type | Required | Description | Constraints | Ontology |
|----------|------|----------|-------------|-------------|----------|
| `headroom` | string | No | Headroom for improvement - gap between baseline and potential | Enum: `low`, `medium`, `high` | AAC |
| `justification` | string | No | Explanation of why gains are expected and what enables them |  | AAC |
| `performanceImprovement` | string | No | Expected improvement in performance from agentic system | Enum: `minimal`, `moderate`, `significant`, `transformative` | AAC |

## DeveloperFeasibility ImplementationDifficulty

| Property | Type | Required | Description | Constraints | Ontology |
|----------|------|----------|-------------|-------------|----------|
| `baselineComparisonRequired` | boolean | No | Whether baseline comparison is necessary for validation |  | AAC |
| `securityLevel` | string | No | Security level of the task, affecting validation requirements | Enum: `low`, `medium`, `high`, `critical` | AAC |
| `skillAdditionDifficulty` | string | No | Difficulty of adding the necessary skills (e.g., via AGENTS.md, tools, etc.) | Enum: `very-easy`, `easy`, `moderate`, `difficult`, `very-difficult` | AAC |
| `validationMonitoringRequired` | boolean | No | Whether validation and monitoring are required (depends on security level) |  | AAC |

## DeveloperFeasibility TrlLevel

| Property | Type | Required | Description | Constraints | Ontology |
|----------|------|----------|-------------|-------------|----------|
| `current` | integer | No |  | Minimum: 1<br>Maximum: 9 | AAC |
| `target` | integer | No |  | Minimum: 1<br>Maximum: 9 | AAC |

## Governance

| Property | Type | Required | Description | Constraints | Ontology |
|----------|------|----------|-------------|-------------|----------|
| `stages` | array of object | No |  |  | — |

## Governance Stage

| Property | Type | Required | Description | Constraints | Ontology |
|----------|------|----------|-------------|-------------|----------|
| `agents` | array of object | No |  |  | — |
| `complianceStandards` | array of string | No |  |  | AAC |
| `endDate` | string | No |  | Format: `date` | Schema.org |
| `id` | string | Yes |  |  | AAC |
| `milestones` | array of string | No |  |  | P-Plan |
| `name` | string | Yes |  |  | Schema.org |
| `startDate` | string | No |  | Format: `date` | Schema.org |

## Governance Stage Agent

| Property | Type | Required | Description | Constraints | Ontology |
|----------|------|----------|-------------|-------------|----------|
| `name` | string | No | Name for organization/software agents (required when type is not 'person') |  | Schema.org |
| `personId` | string | No | Reference to Person entity ID (required when type is 'person') |  | AAC |
| `role` | string | No |  |  | AAC |
| `roleContext` | string | No | Optional role context |  | AAC |
| `type` | string | Yes |  | Enum: `person`, `organization`, `software` | AAC |

## Outcomes

| Property | Type | Required | Description | Constraints | Ontology |
|----------|------|----------|-------------|-------------|----------|
| `deliverables` | array of object | No |  |  | FRAPO |
| `evaluations` | array of object | No |  |  | — |
| `publications` | array of object | No |  |  | — |

## Outcomes Deliverable

| Property | Type | Required | Description | Constraints | Ontology |
|----------|------|----------|-------------|-------------|----------|
| `date` | string | No |  | Format: `date` | Schema.org |
| `description` | string | No |  |  | Schema.org |
| `id` | string | Yes |  |  | AAC |
| `pid` | string | No |  | Format: `uri` | Schema.org |
| `title` | string | Yes |  |  | Schema.org |
| `type` | string | Yes |  |  | AAC |

## Outcomes Evaluation

| Property | Type | Required | Description | Constraints | Ontology |
|----------|------|----------|-------------|-------------|----------|
| `date` | string | No |  | Format: `date` | Schema.org |
| `id` | string | Yes |  |  | AAC |
| `metrics` | object | No |  |  | — |
| `results` | string | No |  |  | AAC |
| `type` | string | Yes |  |  | AAC |

## Outcomes Publication

| Property | Type | Required | Description | Constraints | Ontology |
|----------|------|----------|-------------|-------------|----------|
| `authors` | array of string | No |  |  | Schema.org |
| `date` | string | No |  | Format: `date` | Schema.org |
| `doi` | string | No |  | Format: `uri` | Schema.org |
| `id` | string | Yes |  |  | AAC |
| `title` | string | Yes |  |  | Schema.org |

## Person

| Property | Type | Required | Description | Constraints | Ontology |
|----------|------|----------|-------------|-------------|----------|
| `affiliation` | string | No | Optional disambiguation field |  | Schema.org |
| `id` | string | Yes | Unique identifier for the Person (e.g., 'person-0', 'person-1') |  | AAC |
| `name` | string | Yes |  | Min length: 1 | Schema.org |
| `orcid` | string | No | Optional stable identifier (e.g., ORCID) | Format: `uri` | Schema.org |

## Project

| Property | Type | Required | Description | Constraints | Ontology |
|----------|------|----------|-------------|-------------|----------|
| `description` | string | Yes |  | Min length: 1 | Schema.org |
| `domain` | array of string | No |  |  | AAC |
| `endDate` | string | No |  | Format: `date` | Schema.org |
| `fundingGrant` | string | No |  |  | FRAPO |
| `headlineValue` | string | No |  |  | AAC |
| `keywords` | array of string | No |  |  | Schema.org |
| `leadOrganization` | string | No |  |  | FRAPO |
| `objective` | string | No |  |  | Schema.org |
| `primaryValueDriver` | string | No |  | Enum: `time`, `quality`, `risk`, `enablement` | AAC |
| `projectId` | string | No |  | Format: `uri` | Schema.org |
| `projectStage` | string | Yes |  |  | FRAPO |
| `roughEstimateUnit` | string | No | Unit for the rough estimate (e.g., 'hours/month', '% error reduction', 'incidents prevented/month') |  | AAC |
| `roughEstimateValue` | number | No | Optional manual estimate of project-level benefit value when getting started (before task-level benefits) | Minimum: 0 | AAC |
| `startDate` | string | No |  | Format: `date` | Schema.org |
| `title` | string | Yes |  | Min length: 1 | Schema.org |
| `version` | string | No | Semantic version of the canvas (e.g., '0.9.0'). Should follow semantic versioning standards (https://semver.org/). | Pattern: `^\d+\.\d+\.\d+(-[\w\-]+)?(\+[\w\-]+)?$` | AAC |
| `versionDate` | string | No | Date when the version was downloaded or created (ISO date format) | Format: `date` | AAC |

## UserExpectations

| Property | Type | Required | Description | Constraints | Ontology |
|----------|------|----------|-------------|-------------|----------|
| `requirements` | array of object | No |  |  | P-Plan |
| `stakeholders` | array of object | No |  |  | — |

## UserExpectations Requirement

| Property | Type | Required | Description | Constraints | Ontology |
|----------|------|----------|-------------|-------------|----------|
| `benefits` | array of [Benefit](#benefit) | Yes | Array of benefit metrics for this requirement |  | AAC |
| `description` | string | Yes |  |  | Schema.org |
| `humanOversightMinutesPerUnit` | number | No |  | Minimum: 0 | AAC |
| `id` | string | Yes |  |  | AAC |
| `priority` | string | No |  | Enum: `low`, `medium`, `high`, `critical` | AAC |
| `stakeholder` | string | No |  |  | AAC |
| `status` | string | No |  | Enum: `planned`, `in-progress`, `completed`, `cancelled` | AAC |
| `unitCategory` | string | No |  | Enum: `case`, `document`, `record`, `message`, `analysisRun`, `meeting`, `other` | AAC |
| `unitOfWork` | string | No |  | Min length: 1 | AAC |
| `userStory` | string | No |  |  | P-Plan |
| `value` | string | No |  |  | AAC |
| `volumePerMonth` | number | No |  | Minimum: 1 | AAC |

## UserExpectations Stakeholder

| Property | Type | Required | Description | Constraints | Ontology |
|----------|------|----------|-------------|-------------|----------|
| `personId` | string | Yes | Reference to Person entity ID (required) |  | AAC |
| `role` | string | No |  |  | AAC |
| `roleContext` | string | No | Optional role context |  | AAC |
| `values` | array of string | No |  |  | AAC |
