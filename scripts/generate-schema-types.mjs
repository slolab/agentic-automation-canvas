import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { compile } from 'json-schema-to-typescript'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const manifestPath = resolve(repositoryRoot, 'schema/manifest.json')
const currentSchemaAliasPath = resolve(repositoryRoot, 'schema/canvas-schema.json')
const currentProfileAliasPath = resolve(repositoryRoot, 'schema/rocrate-profile.json')
const canvasTypesPath = resolve(repositoryRoot, 'src/types/canvas.ts')
const contractModulePath = resolve(repositoryRoot, 'src/schema/contract.ts')
const checkOnly = process.argv.includes('--check')

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'))
}

async function generatedArtifacts() {
  const manifest = await readJson(manifestPath)
  const schemaPath = resolve(repositoryRoot, 'schema', manifest.currentSchema)
  const profilePath = resolve(repositoryRoot, 'schema', manifest.currentProfile)
  const schema = await readJson(schemaPath)
  const profile = await readJson(profilePath)
  const schemaId = schema.$id
  const profileId = profile.$id

  if (typeof schemaId !== 'string') {
    throw new Error(`Current AAC schema has no $id: ${schemaPath}`)
  }
  if (typeof profileId !== 'string') {
    throw new Error(`Current AAC RO-Crate profile has no $id: ${profilePath}`)
  }
  if (manifest.schemas[manifest.currentVersion] !== manifest.currentSchema) {
    throw new Error('Schema manifest currentVersion and currentSchema disagree')
  }
  if (manifest.profiles[manifest.currentProfileVersion] !== manifest.currentProfile) {
    throw new Error('Schema manifest currentProfileVersion and currentProfile disagree')
  }
  const expectedSchemaId = `https://w3id.org/aac/schema/${manifest.currentVersion}/aac.schema.json`
  if (schemaId !== expectedSchemaId) {
    throw new Error(`Schema manifest version and current schema $id disagree: ${schemaId}`)
  }
  const expectedProfileId = `https://w3id.org/aac/profile/${manifest.currentProfileVersion}`
  if (profileId !== expectedProfileId) {
    throw new Error(`Schema manifest version and current profile $id disagree: ${profileId}`)
  }

  const canvasTypes = await compile(schema, 'CanvasData', {
    bannerComment: [
      '/* eslint-disable */',
      '/**',
      ' * Generated from schema/manifest.json and its current AAC JSON Schema.',
      ' * Do not edit by hand. Run `npm run schema:generate` after changing the schema.',
      ' */',
    ].join('\n'),
    cwd: dirname(schemaPath),
    unreachableDefinitions: true,
    style: {
      semi: false,
      singleQuote: true,
      trailingComma: 'all',
    },
  })

  const currentSchemaAlias = `${JSON.stringify(
    {
      ...schema,
      $id: 'https://w3id.org/aac/schema/aac.schema.json',
      $comment: `Current AAC schema alias for ${manifest.currentVersion}; exact schema: ${schemaId}`,
    },
    null,
    2,
  )}\n`
  const currentProfileAlias = `${JSON.stringify(
    {
      ...profile,
      $id: 'https://w3id.org/aac/schema/rocrate-profile.json',
      $comment: `Current AAC RO-Crate profile alias for ${manifest.currentProfileVersion}; exact profile: ${profileId}`,
    },
    null,
    2,
  )}\n`

  const contractModule = [
    '/* eslint-disable */',
    '/** Generated from schema/manifest.json. Do not edit by hand. */',
    `import currentSchema from '../../schema/${manifest.currentSchema}'`,
    '',
    `export const AAC_SCHEMA_VERSION = '${manifest.currentVersion}' as const`,
    `export const AAC_SCHEMA_ID = '${schemaId}' as const`,
    'export const AAC_CURRENT_SCHEMA = currentSchema',
    '',
    `export const AAC_RO_CRATE_PROFILE_VERSION = '${manifest.currentProfileVersion}' as const`,
    `export const AAC_RO_CRATE_PROFILE_ID = '${profileId}' as const`,
    `export const RO_CRATE_VERSION = '${manifest.roCrateVersion}' as const`,
    `export const RO_CRATE_CONTEXT = 'https://w3id.org/ro/crate/${manifest.roCrateVersion}/context' as const`,
    '',
  ].join('\n')

  return new Map([
    [currentSchemaAliasPath, currentSchemaAlias],
    [currentProfileAliasPath, currentProfileAlias],
    [canvasTypesPath, canvasTypes],
    [contractModulePath, contractModule],
  ])
}

async function main() {
  const artifacts = await generatedArtifacts()
  const stale = []

  for (const [path, expected] of artifacts) {
    const relativePath = path.slice(repositoryRoot.length + 1)
    let actual
    try {
      actual = await readFile(path, 'utf8')
    } catch {
      actual = undefined
    }

    if (actual === expected) continue
    stale.push(relativePath)
    if (!checkOnly) await writeFile(path, expected, 'utf8')
  }

  if (stale.length === 0) {
    console.log('AAC schema-derived artifacts are current.')
    return
  }
  if (checkOnly) {
    console.error(`AAC schema-derived artifacts are stale: ${stale.join(', ')}`)
    console.error('Run `npm run schema:generate` and commit the generated output.')
    process.exitCode = 1
    return
  }
  console.log(`Generated ${stale.join(', ')}.`)
}

await main()
