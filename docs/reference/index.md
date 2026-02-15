# Schema Reference

This section provides detailed reference documentation for all types and properties in the AAC schema.

!!! info "Ontology Alignment"
    The reference tables include an **Ontology** column indicating which standard vocabulary each generic field maps to. Fields marked with an ontology (e.g., "Schema.org", "DCAT/Dublin Core") align with established standards. Complex object types show "—" (not applicable). Custom AAC-specific fields are marked with "AAC". See the [schema ontology alignment](../schema/index.md#ontology-alignment) section for more details.

## Main Schema Properties

| Property | Type | Required | Description | Constraints | Ontology |
|----------|------|----------|-------------|-------------|----------|
| `dataAccess` | object | No |  |  | — |
| `developerFeasibility` | object | No | Project-level feasibility (simple, generic defaults that apply to all tasks unless overridden) |  | — |
| `governance` | object | No |  |  | — |
| `outcomes` | object | No |  |  | — |
| `persons` | array of object | No | Centralized Person entities. All persons involved in the project are managed here and referenced by stakeholders and agents. |  | — |
| `project` | object | Yes |  |  | — |
| `userExpectations` | object | No |  |  | — |
| `version` | string | No | Semantic version of the canvas (e.g., '0.1.0'). Should follow semantic versioning standards (https://semver.org/). | Pattern: `^\d+\.\d+\.\d+(-[\w\-]+)?(\+[\w\-]+)?$` | AAC |
| `versionDate` | string | No | Date when the version was downloaded or created (ISO date format) | Format: `date` | AAC |

## Benefit

A benefit metric for a requirement

| Property | Type | Required | Description | Constraints | Ontology |
|----------|------|----------|-------------|-------------|----------|
| `aggregationBasis` | string | No | How the benefit value is aggregated | Enum: `perUnit`, `perMonth`, `oneOff`<br>Default: `perUnit` | AAC |
| `assumptions` | string | No | Key assumptions underlying the benefit estimate |  | AAC |
| `baseline` | BenefitValue | Yes | Baseline value before automation |  | AAC |
| `benefitType` | string | Yes | Type of benefit | Enum: `time`, `quality`, `risk`, `enablement`, `cost` | AAC |
| `benefitUnit` | string | Yes | Unit for the benefit value (e.g., 'minutes', '%', 'incidents/month') |  | AAC |
| `confidenceDev` | string | No | Developer's confidence in the benefit estimate | Enum: `low`, `medium`, `high` | AAC |
| `confidenceUser` | string | No | User's confidence in the benefit estimate | Enum: `low`, `medium`, `high` | AAC |
| `direction` | string | Yes | Indicates whether higher values, lower values, hitting a target, or boolean true is the desired outcome | Enum: `increaseIsBetter`, `decreaseIsBetter`, `targetIsBetter`, `boolIsBetter` | AAC |
| `expected` | BenefitValue | Yes | Expected value after automation |  | AAC |
| `metricId` | string | Yes | Identifier for the metric (controlled vocabulary or 'custom') |  | AAC |
| `metricLabel` | string | Yes | Human-readable label for the metric |  | AAC |
| `oversightMinutesPerMonth` | number | No | Human oversight per month in minutes. Only used when aggregationBasis is 'perMonth'. Mutually exclusive with oversightMinutesPerUnit. Subtracted from gross time benefit. | Minimum: 0 | AAC |
| `oversightMinutesPerUnit` | number | No | Human oversight per unit in minutes. Only used when aggregationBasis is 'perUnit'. Mutually exclusive with oversightMinutesPerMonth. Subtracted from gross time benefit. | Minimum: 0 | AAC |
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

Project-level feasibility (simple, generic defaults that apply to all tasks unless overridden)

| Property | Type | Required | Description | Constraints | Ontology |
|----------|------|----------|-------------|-------------|----------|
| `effortEstimate` | object | No | Overall effort estimate for the project |  | — |
| `feasibilityNotes` | string | No | Project-level feasibility notes |  | AAC |
| `technicalRisk` | string | No | Overall technical risk for the project | Enum: `low`, `medium`, `high`, `critical` | AAC |
| `trlLevel` | object | No | Technology Readiness Level - project-level maturity assessment |  | — |

## DeveloperFeasibility EffortEstimate

Overall effort estimate for the project

| Property | Type | Required | Description | Constraints | Ontology |
|----------|------|----------|-------------|-------------|----------|
| `unit` | string | Yes |  | Enum: `weeks`, `person-hours` | AAC |
| `value` | number | Yes |  | Minimum: 0 | AAC |

## DeveloperFeasibility TrlLevel

Technology Readiness Level - project-level maturity assessment

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
| `primaryValueDriver` | string | No |  | Enum: `time`, `quality`, `risk`, `enablement`, `cost` | AAC |
| `projectId` | string | No |  | Format: `uri` | Schema.org |
| `projectStage` | string | Yes |  |  | FRAPO |
| `roughEstimateUnit` | string | No | Unit for the rough estimate (e.g., 'hours/month', '% error reduction', 'incidents prevented/month') |  | AAC |
| `roughEstimateValue` | number | No | Optional manual estimate of project-level benefit value when getting started (before task-level benefits) | Minimum: 0 | AAC |
| `startDate` | string | No |  | Format: `date` | Schema.org |
| `title` | string | Yes |  | Min length: 1 | Schema.org |
| `version` | string | No | Semantic version of the canvas (e.g., '0.1.0'). Should follow semantic versioning standards (https://semver.org/). | Pattern: `^\d+\.\d+\.\d+(-[\w\-]+)?(\+[\w\-]+)?$` | AAC |
| `versionDate` | string | No | Date when the version was downloaded or created (ISO date format) | Format: `date` | AAC |

## UserExpectations

| Property | Type | Required | Description | Constraints | Ontology |
|----------|------|----------|-------------|-------------|----------|
| `requirements` | array of object | No |  |  | P-Plan |

## UserExpectations Requirement

| Property | Type | Required | Description | Constraints | Ontology |
|----------|------|----------|-------------|-------------|----------|
| `benefits` | array of [Benefit](#benefit) | Yes | Array of benefit metrics for this requirement |  | AAC |
| `dependsOn` | array of string | No | IDs of requirements this task depends on |  | AAC |
| `description` | string | No |  |  | Schema.org |
| `feasibility` | object | No | Optional per-task feasibility (overrides project-level defaults) |  | — |
| `id` | string | Yes |  |  | AAC |
| `priority` | string | No |  | Enum: `low`, `medium`, `high`, `critical` | AAC |
| `stakeholders` | array of string | No | Person IDs of stakeholders for this task |  | AAC |
| `status` | string | No |  | Enum: `planned`, `in-progress`, `completed`, `cancelled` | AAC |
| `timeUnit` | string | No | Standardized time unit for this requirement's time benefits and oversight. All time values use this unit for consistency. | Enum: `minutes`, `hours` | AAC |
| `title` | string | Yes |  | Min length: 1 | Schema.org |
| `unitCategory` | string | No |  | Enum: `item`, `interaction`, `computation`, `other` | AAC |
| `unitOfWork` | string | No |  | Min length: 1 | AAC |
| `userStory` | string | No |  |  | P-Plan |
| `value` | string | No |  |  | AAC |
| `volumePerMonth` | number | No |  | Minimum: 1 | AAC |

## UserExpectations Requirement Feasibility

Optional per-task feasibility (overrides project-level defaults)

| Property | Type | Required | Description | Constraints | Ontology |
|----------|------|----------|-------------|-------------|----------|
| `algorithms` | array of string | No |  |  | AAC |
| `effortEstimate` | object | No |  |  | — |
| `feasibilityNotes` | string | No |  |  | AAC |
| `modelName` | string | No | Specific model name or identifier (e.g., 'claude-opus-4-5', 'Qwen2.5-72B-Instruct') |  | AAC |
| `modelSelection` | string | No | Type of model to be used (if applicable). Set to 'none' if task is deterministic. | Enum: `open-source`, `frontier-model`, `fine-tuned`, `custom`, `other`, `none` | AAC |
| `technicalRisk` | string | No |  | Enum: `low`, `medium`, `high`, `critical` | AAC |
| `technologyApproach` | object | No | Technology architecture approach for this task. Set architecture to 'none' if task is deterministic and doesn't require LLMs. |  | — |
| `tools` | array of string | No |  |  | AAC |

## UserExpectations Requirement Feasibility EffortEstimate

| Property | Type | Required | Description | Constraints | Ontology |
|----------|------|----------|-------------|-------------|----------|
| `unit` | string | Yes |  | Enum: `weeks`, `person-hours` | AAC |
| `value` | number | Yes |  | Minimum: 0 | AAC |

## UserExpectations Requirement Feasibility TechnologyApproach

Technology architecture approach for this task. Set architecture to 'none' if task is deterministic and doesn't require LLMs.

| Property | Type | Required | Description | Constraints | Ontology |
|----------|------|----------|-------------|-------------|----------|
| `agenticDetails` | object | No |  |  | — |
| `architecture` | string | No | Primary technology architecture. 'none' indicates deterministic task without LLM requirement. | Enum: `none`, `simple-prompting`, `rag`, `fine-tuning`, `agents`, `other` | AAC |
| `fineTuningDetails` | object | No |  |  | — |
| `ragDetails` | object | No |  |  | — |

## UserExpectations Requirement Feasibility TechnologyApproach AgenticDetails

| Property | Type | Required | Description | Constraints | Ontology |
|----------|------|----------|-------------|-------------|----------|
| `framework` | array of string | No | e.g. ReAct, MCP, Plan-and-Execute |  | AAC |
| `orchestration` | array of string | No | e.g. LangGraph |  | AAC |
| `tools` | array of string | No | MCP tools, custom tools |  | AAC |

## UserExpectations Requirement Feasibility TechnologyApproach FineTuningDetails

| Property | Type | Required | Description | Constraints | Ontology |
|----------|------|----------|-------------|-------------|----------|
| `baseModel` | string | No | Base model that was fine-tuned |  | AAC |
| `dataset` | string | No | Dataset used for fine-tuning |  | AAC |
| `tuningApproach` | string | No | Method used for fine-tuning (e.g., LoRA, QLoRA, full fine-tuning) |  | AAC |

## UserExpectations Requirement Feasibility TechnologyApproach RagDetails

| Property | Type | Required | Description | Constraints | Ontology |
|----------|------|----------|-------------|-------------|----------|
| `chunkingStrategy` | string | No |  |  | AAC |
| `embeddingModel` | string | No |  |  | AAC |
| `retrievalMethod` | string | No |  |  | AAC |
