/**
 * Build an RO-Crate zip for a canvas answered only through the simplified
 * landing page, plus its raw canvas JSON. Import the zip to test casting a
 * simplified canvas into the full one.
 * Uses the same generateROCrate and buildROCrateZipBuffer as the website.
 * Run: npm run build:simplified-rocrate
 * Output: tools/simplified-only.rocrate.zip, schema/examples/simplified-canvas.json
 */

import { writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { generateROCrate } from '../src/rocrate/export'
import { buildROCrateZipBuffer } from '../src/utils/download'
import { simplifiedOnlyCanvas } from '../src/data/simplified-only-canvas'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectName = 'simplified-only'
const repoRoot = join(__dirname, '..')
const outDir = join(repoRoot, 'tools')
const outFile = join(outDir, `${projectName}.rocrate.zip`)
const canvasFile = join(repoRoot, 'schema', 'examples', 'simplified-canvas.json')

async function main() {
  const rocrate = generateROCrate(simplifiedOnlyCanvas)
  const buffer = await buildROCrateZipBuffer(rocrate, projectName, simplifiedOnlyCanvas)
  mkdirSync(outDir, { recursive: true })
  writeFileSync(outFile, Buffer.from(buffer))
  writeFileSync(canvasFile, `${JSON.stringify(simplifiedOnlyCanvas, null, 2)}\n`)
  console.log(`Wrote ${outFile}`)
  console.log(`Wrote ${canvasFile}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
