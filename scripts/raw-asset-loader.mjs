/**
 * Node loader for Vite's `?raw` asset imports.
 *
 * The RO-Crate build scripts reuse the application's export code, which reads
 * the canvas block icons as `import icon from '...svg?raw'`. Vite turns that
 * into the file's text; plain Node rejects the unknown extension. These hooks
 * give the scripts the same behaviour.
 */

import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const RAW_ASSET = /\.svg(\?.*)?$/

// Resolution is left to the preceding hooks so tsconfig path aliases still apply.
export async function load(url, context, nextLoad) {
  if (RAW_ASSET.test(url)) {
    const source = await readFile(fileURLToPath(url.split('?')[0]), 'utf8')
    return {
      format: 'module',
      source: `export default ${JSON.stringify(source)}`,
      shortCircuit: true,
    }
  }
  return nextLoad(url, context)
}
