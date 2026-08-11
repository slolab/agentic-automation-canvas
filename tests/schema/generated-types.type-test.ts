/*
Compile-time test proving generated types accept schema fields and reject invented top-level, project, and presentation fields.
*/

import type { CanvasData, ProjectDefinition } from '@/types/canvas'

export const validProject = {
  title: 'Typed project',
  description: 'Uses only schema-defined fields',
} satisfies ProjectDefinition

export const validCanvas = {
  project: validProject,
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
