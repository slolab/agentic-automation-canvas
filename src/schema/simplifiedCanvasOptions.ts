import { AAC_CURRENT_SCHEMA } from '@/schema/contract'
import type {
  DeveloperFeasibility,
  GovernanceStaging,
  ProjectDefinition,
  RequirementFeasibility,
} from '@/types/canvas'

export type ProblemFrequency = NonNullable<ProjectDefinition['problemFrequency']>
export type TechnicalApproach = NonNullable<
  NonNullable<RequirementFeasibility['technologyApproach']>['approaches']
>[number]
export type TechnologyArchitecture = NonNullable<
  NonNullable<RequirementFeasibility['technologyApproach']>['architecture']
>
export type ConstraintFlag = NonNullable<DeveloperFeasibility['constraintFlags']>[number]
export type TeamStatus = NonNullable<GovernanceStaging['buildTeamStatus']>

function schemaEnum<T extends string>(value: unknown, field: string): readonly T[] {
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    throw new Error(`Current AAC schema value at ${field} is not a string enum`)
  }
  return Object.freeze([...value]) as readonly T[]
}

function typedKeys<T extends object>(value: T): (keyof T & string)[] {
  return Object.keys(value) as (keyof T & string)[]
}

const problemFrequencyLabels: Record<ProblemFrequency, string> = {
  daily: 'Daily',
  weekly: 'About once a week',
  monthly: 'About once a month',
  'few-times-per-year': 'A few times per year',
  'less-than-yearly': 'Less than once per year',
}

const technicalApproachLabels = {
  'agentic-user-support': 'Agentic User Support',
  'unstructured-content-processing': 'Process large volumes of unstructured documents or logs',
  'code-development': 'Write, Test, and Debug Code',
  'computer-use': 'Computer Use',
  'live-event-monitoring': 'Monitor Live Events',
  'intelligent-search': 'Intelligent Search',
  'agentic-research-support': 'Agentic Research Support',
  'data-metadata-curation': 'Data and Metadata Curation',
  'analysis-pipeline-orchestration': 'Analysis and Pipeline Orchestration',
  'experiment-protocol-design': 'Experiment and Protocol Design',
  'simulation-parameter-optimization': 'Simulation and Parameter Optimization',
  'laboratory-workflow-coordination': 'Laboratory Workflow Coordination',
  other: 'Other',
}

const technologyArchitectureLabels: Record<TechnologyArchitecture, string> = {
  none: 'None (deterministic, no LLM required)',
  'simple-prompting': 'Simple prompting',
  rag: 'RAG (retrieval-augmented generation)',
  'fine-tuning': 'Fine-tuning',
  agents: 'Agents (ReAct, MCP, tools)',
  other: 'Other',
}

const constraintLabels = {
  'large-data': 'My data is large (more than 100 GB)',
  'cluster-compute': 'High CPU load or cluster execution is required',
  'large-gpu': 'A GPU with more than 8 GB VRAM is required',
  'personal-data': 'The data contains personal or GDPR-sensitive information',
  'valuable-ip': 'The project handles valuable or confidential intellectual property',
  'external-system-integration': 'External systems, APIs, identities, or credentials are required',
  'restricted-processing-environment': 'Cloud or external processing is restricted',
  'real-time': 'The solution has strict real-time or latency requirements',
  'regulated-or-high-impact': 'Outputs affect regulated, safety-critical, or high-impact decisions',
  'procurement-or-licensing': 'Procurement, licensing, or provider approval may block delivery',
  other: 'Other',
}

const teamStatusLabels: Record<TeamStatus, string> = {
  none: 'No',
  possible: 'Possible, but not committed',
  committed: 'Yes, committed',
}

// These direct accesses are intentional. They make a schema field rename a
// TypeScript error instead of letting a handwritten string path drift until
// somebody happens to exercise the view at runtime.
const requirementProperties =
  AAC_CURRENT_SCHEMA.properties.userExpectations.properties.requirements.items.properties
const technologyApproachProperties =
  requirementProperties.feasibility.properties.technologyApproach.properties
const governanceProperties = AAC_CURRENT_SCHEMA.properties.governance.properties

const problemFrequencyValues = schemaEnum<ProblemFrequency>(
  AAC_CURRENT_SCHEMA.properties.project.properties.problemFrequency['enum'],
  'project.problemFrequency',
)
// These are presentation suggestions, not schema vocabularies. The canonical
// fields accept any non-empty string so custom values remain first-class data.
const technicalApproachValues = Object.freeze(typedKeys(technicalApproachLabels))
const constraintValues = Object.freeze(typedKeys(constraintLabels))
const technologyArchitectureValues = schemaEnum<TechnologyArchitecture>(
  technologyApproachProperties.architecture['enum'],
  'userExpectations.requirements[].feasibility.technologyApproach.architecture',
)
const buildTeamStatusValues = schemaEnum<TeamStatus>(
  governanceProperties.buildTeamStatus['enum'],
  'governance.buildTeamStatus',
)
const maintenanceTeamStatusValues = schemaEnum<TeamStatus>(
  governanceProperties.maintenanceOwnerStatus['enum'],
  'governance.maintenanceOwnerStatus',
)

if (buildTeamStatusValues.join('\u0000') !== maintenanceTeamStatusValues.join('\u0000')) {
  throw new Error('Build and maintenance team statuses must share one simplified-canvas vocabulary')
}

export const frequencyOptions = problemFrequencyValues.map((value) => ({
  value,
  label: problemFrequencyLabels[value],
}))

export const approachOptions = technicalApproachValues.map((value) => ({
  value,
  label: technicalApproachLabels[value],
}))

export const architectureOptions = technologyArchitectureValues.map((value) => ({
  value,
  label: technologyArchitectureLabels[value],
}))

export const constraintOptions = constraintValues.map((value) => ({
  value,
  label: constraintLabels[value],
}))

export const suggestedConstraintValues: readonly string[] = Object.freeze([...constraintValues])

export const teamStatusOptions = buildTeamStatusValues.map((value) => ({
  value,
  label: teamStatusLabels[value],
}))
