import {
  V2_FORMAT,
  V2_FRAMEWORK_VERSION,
  V2_PROMPTS,
  type V2PromptId,
} from './framework'
import type { V2CanvasData } from './types'

const STORAGE_KEY = 'aac-v2-canvas-draft'

function emptyAnswers(): Record<V2PromptId, string> {
  return Object.fromEntries(V2_PROMPTS.map((prompt) => [prompt.id, ''])) as Record<
    V2PromptId,
    string
  >
}

export function createEmptyV2Canvas(): V2CanvasData {
  return {
    format: V2_FORMAT,
    frameworkVersion: V2_FRAMEWORK_VERSION,
    projectTitle: '',
    updatedAt: new Date().toISOString(),
    answers: emptyAnswers(),
  }
}

export function parseV2Canvas(value: unknown): V2CanvasData {
  if (!value || typeof value !== 'object') {
    throw new Error('This file does not contain an AAC v2 canvas.')
  }

  const candidate = value as Partial<V2CanvasData>
  if (candidate.format !== V2_FORMAT) {
    throw new Error('This is not an AAC v2 canvas. V1 imports are intentionally unsupported.')
  }
  if (candidate.frameworkVersion !== V2_FRAMEWORK_VERSION) {
    throw new Error(
      `This canvas uses framework ${candidate.frameworkVersion || 'unknown'}; this test route uses ${V2_FRAMEWORK_VERSION}.`,
    )
  }

  const sourceAnswers: Record<string, unknown> =
    candidate.answers && typeof candidate.answers === 'object'
      ? (candidate.answers as Record<string, unknown>)
      : {}
  const answers = emptyAnswers()
  for (const prompt of V2_PROMPTS) {
    const answer = sourceAnswers[prompt.id]
    answers[prompt.id] = typeof answer === 'string' ? answer : ''
  }

  return {
    format: V2_FORMAT,
    frameworkVersion: V2_FRAMEWORK_VERSION,
    projectTitle: typeof candidate.projectTitle === 'string' ? candidate.projectTitle : '',
    updatedAt:
      typeof candidate.updatedAt === 'string' ? candidate.updatedAt : new Date().toISOString(),
    answers,
  }
}

export function loadV2Draft(): V2CanvasData {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return createEmptyV2Canvas()

  try {
    return parseV2Canvas(JSON.parse(stored))
  } catch {
    return createEmptyV2Canvas()
  }
}

export function saveV2Draft(canvas: V2CanvasData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(canvas))
}

export function clearV2Draft(): void {
  localStorage.removeItem(STORAGE_KEY)
}
