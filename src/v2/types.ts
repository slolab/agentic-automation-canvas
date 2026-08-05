import type { V2PromptId } from './framework'

export interface V2CanvasData {
  format: 'aac-v2'
  frameworkVersion: string
  projectTitle: string
  updatedAt: string
  answers: Record<V2PromptId, string>
}

export interface V2ROCrateEntity {
  '@id': string
  '@type': string | string[]
  [key: string]: unknown
}

export interface V2ROCrate {
  '@context': string
  '@graph': V2ROCrateEntity[]
}

