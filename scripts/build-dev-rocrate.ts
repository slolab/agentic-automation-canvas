/**
 * Build dev RO-Crate zip with all benefit types represented once.
 * Uses the same generateROCrate and buildROCrateZipBuffer as the website.
 * Run: npm run build:dev-rocrate
 * Output: tools/dev-all-benefits.rocrate.zip (upload manually in dev)
 */

import { writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { generateROCrate } from '../src/utils/rocrate'
import { buildROCrateZipBuffer } from '../src/utils/download'
import { devAllBenefitsCanvas, devBenefitDisplay } from '../src/data/dev-all-benefits-canvas'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectName = 'dev-all-benefits'
const outDir = join(__dirname, '..', 'tools')
const outFile = join(outDir, `${projectName}.rocrate.zip`)

async function main() {
  // Use 0.9.0 so loading this crate in the current app triggers the schema-version mismatch warning
  const rocrate = generateROCrate(devAllBenefitsCanvas, {
    benefitDisplay: devBenefitDisplay,
    schemaVersion: '0.9.0',
  })
  const buffer = await buildROCrateZipBuffer(rocrate, projectName, devAllBenefitsCanvas, devBenefitDisplay)
  mkdirSync(outDir, { recursive: true })
  writeFileSync(outFile, Buffer.from(buffer))
  console.log(`Wrote ${outFile}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
