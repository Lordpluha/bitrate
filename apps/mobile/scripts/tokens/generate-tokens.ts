import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { buildTokenSet } from './build-token-set'
import { renderTokensModule } from './render-tokens-module'

export const TOKENS_DIR = join(__dirname, '../../../../packages/tailwind/src')
export const OUTPUT_FILE = join(__dirname, '../../constants/tokens.gen.ts')

/**
 * Writes `constants/tokens.gen.ts`. With `--check` it only compares and exits non-zero
 * when the committed file has drifted from the tailwind sources.
 */
function main() {
  const next = renderTokensModule(buildTokenSet(TOKENS_DIR))

  if (process.argv.includes('--check')) {
    const current = readFileSync(OUTPUT_FILE, 'utf8')
    if (current !== next) {
      console.error('tokens.gen.ts is stale — run `pnpm --filter @bitrate/mobile tokens`.')
      process.exit(1)
    }
    return
  }

  writeFileSync(OUTPUT_FILE, next)
}

if (require.main === module) main()
