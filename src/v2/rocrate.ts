import JSZip from 'jszip'
import { V2_BLOCKS, V2_FRAMEWORK_VERSION } from './framework'
import { parseV2Canvas } from './storage'
import type { V2CanvasData, V2ROCrate } from './types'

const RO_CRATE_VERSION = 'https://w3id.org/ro/crate/1.2'
const DATA_FILE = 'aac-v2.json'
const FOUNDATION_FILE = 'project-foundation.md'

function displayAnswer(value: string): string {
  return value.trim() || '_Not discussed._'
}

function safeProjectName(projectTitle: string): string {
  return (
    projectTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'aac-v2-foundation'
  )
}

export function generateFoundationMarkdown(canvas: V2CanvasData): string {
  const title = canvas.projectTitle.trim() || 'Untitled project'
  const sections = V2_BLOCKS.map((block) => {
    const prompts = block.prompts
      .map(
        (prompt) =>
          `### ${prompt.question}\n\n${displayAnswer(canvas.answers[prompt.id])}`,
      )
      .join('\n\n')
    return `## ${block.number}. ${block.title}\n\n${prompts}`
  }).join('\n\n')

  return `# ${title}

> Project foundation created with Agentic Automation Canvas v2 (${canvas.frameworkVersion}).
> This is a discovery brief for a first MVP, not implementation approval or production readiness.

${sections}
`
}

export function generateV2ROCrate(canvas: V2CanvasData): V2ROCrate {
  const title = canvas.projectTitle.trim() || 'Untitled AAC v2 project foundation'
  const today = new Date().toISOString().slice(0, 10)
  const description = canvas.answers.project_description.trim()

  return {
    '@context': `${RO_CRATE_VERSION}/context`,
    '@graph': [
      {
        '@id': 'ro-crate-metadata.json',
        '@type': 'CreativeWork',
        about: { '@id': './' },
        conformsTo: { '@id': RO_CRATE_VERSION },
      },
      {
        '@id': './',
        '@type': 'Dataset',
        name: title,
        description:
          description || 'Project foundation captured with Agentic Automation Canvas v2.',
        datePublished: today,
        dateModified: canvas.updatedAt,
        version: canvas.frameworkVersion,
        hasPart: [{ '@id': DATA_FILE }, { '@id': FOUNDATION_FILE }],
      },
      {
        '@id': DATA_FILE,
        '@type': 'File',
        name: 'AAC v2 canvas data',
        encodingFormat: 'application/json',
        version: canvas.frameworkVersion,
        about: { '@id': './' },
      },
      {
        '@id': FOUNDATION_FILE,
        '@type': 'File',
        name: 'Human-readable project foundation',
        encodingFormat: 'text/markdown',
        about: { '@id': './' },
      },
    ],
  }
}

export async function buildV2ROCrateZip(canvas: V2CanvasData): Promise<Blob> {
  const zip = new JSZip()
  zip.file(DATA_FILE, JSON.stringify(canvas, null, 2))
  zip.file(FOUNDATION_FILE, generateFoundationMarkdown(canvas))
  zip.file('ro-crate-metadata.json', JSON.stringify(generateV2ROCrate(canvas), null, 2))
  zip.file(
    'README.md',
    `# AAC v2 project foundation

This RO-Crate contains a partial or completed Agentic Automation Canvas v2 conversation.

- \`${FOUNDATION_FILE}\` is the readable project foundation.
- \`${DATA_FILE}\` preserves the canvas for reopening at the AAC v2 route.
- \`ro-crate-metadata.json\` describes the package as an RO-Crate ${RO_CRATE_VERSION}.

The artifact records a discovery brief for a first MVP. It is not implementation approval, a detailed technical specification, or evidence of production readiness.
`,
  )
  return zip.generateAsync({ type: 'blob' })
}

export async function importV2ROCrate(file: Blob): Promise<V2CanvasData> {
  const zip = await JSZip.loadAsync(await file.arrayBuffer())
  const canvasFile = zip.file(DATA_FILE)
  if (!canvasFile) {
    throw new Error(`The RO-Crate does not contain ${DATA_FILE}.`)
  }
  const contents = await canvasFile.async('string')
  return parseV2Canvas(JSON.parse(contents))
}

export async function downloadV2ROCrate(canvas: V2CanvasData): Promise<void> {
  const blob = await buildV2ROCrateZip(canvas)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${safeProjectName(canvas.projectTitle)}-${V2_FRAMEWORK_VERSION}-rocrate.zip`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
