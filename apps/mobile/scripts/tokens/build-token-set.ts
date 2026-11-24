import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { buildColorThemes } from './build-color-themes'
import { buildScales } from './build-scales'
import { readCssBlocks } from './read-css-blocks'
import type { TokenSet } from './render-tokens-module'

/** The stylesheets that declare tokens, relative to `packages/tailwind/src`. */
const TOKEN_FILES = [
  'palette.css',
  'layout.css',
  'typography.css',
  'themes/base.css',
  'themes/global/surfaces.css',
  'themes/global/text.css',
  'themes/global/status.css',
]

/** Reads the tailwind token sources under `tokensDir` and builds the mobile token set. */
export function buildTokenSet(tokensDir: string): TokenSet {
  const blocks = TOKEN_FILES.flatMap((file) => readCssBlocks(readFileSync(join(tokensDir, file), 'utf8')))
  return { ...buildColorThemes(blocks), ...buildScales(blocks) }
}
