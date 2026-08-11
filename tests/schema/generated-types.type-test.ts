/*
Compile-time test proving generated types accept schema fields and reject invented top-level, project, and presentation fields.
*/

import type {
  CanvasData,
  DeveloperFeasibility,
  ProjectDefinition,
  Requirement,
} from '@/types/canvas'

export const validProject = {
  title: 'Typed project',
  description: 'Uses only schema-defined fields',
  problemFrequency: 'weekly',
  problemExamples: ['A recent concrete case'],
} satisfies ProjectDefinition

export const validSimplifiedRequirement = {
  id: 'requirement-generated',
  title: 'requirement-generated',
  benefits: [
    { benefitType: 'unclassified', description: 'A free-form benefit' },
    { benefitType: 'unclassified', metricLabel: 'A free-form metric' },
  ],
  feasibility: {
    technologyApproach: {
      approaches: ['agentic-user-support', 'computer-use', 'other'],
      customApproaches: ['Human-in-the-loop exception routing'],
    },
  },
} satisfies Requirement

export const validSimplifiedFeasibility = {
  solutionsToResearch: 'Compare existing products',
  constraintFlags: ['large-data', 'personal-data'],
  buildTeamStatus: 'possible',
  maintenanceOwnerStatus: 'committed',
} satisfies DeveloperFeasibility

export const validCanvas = {
  project: validProject,
  userExpectations: { requirements: [validSimplifiedRequirement] },
  developerFeasibility: validSimplifiedFeasibility,
} satisfies CanvasData

export const invalidProject = {
  title: 'Invalid project',
  description: 'The field below is not in the schema',
  // @ts-expect-error AAC fields must originate in the JSON Schema.
  inventedByUi: true,
} satisfies ProjectDefinition

export const invalidCanvas = {
  project: validProject,
  // @ts-expect-error Top-level AAC fields must originate in the JSON Schema.
  inventedSection: {},
} satisfies CanvasData

export const invalidUiPresentationMap = {
  title: 'project-title',
  // @ts-expect-error Handwritten presentation keys must be generated AAC fields.
  inventedByPresentation: 'invented-input',
} satisfies Partial<Record<keyof ProjectDefinition, string>>
