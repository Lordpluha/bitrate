import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import type { ViteUserConfig } from 'vitest/config'

/**
 * What the unit and integration configs genuinely have in common — aliases, the React plugin,
 * the jsdom setup — and nothing else.
 *
 * The two configs are separate files rather than `projects` in one, so `test:unit` loads only
 * the unit config: a broken integration config can no longer stop the unit run, and neither
 * can be made to run the other's specs by a stray `--project` typo. This module is shared
 * *data*, not a shared config — it defines no `include`, no environment settings and no
 * timeouts, because those are exactly what distinguishes the two layers.
 */
export const testRoot = resolve(import.meta.dirname, '../..')

export const alias = {
  '@app': resolve(testRoot, 'src'),
  '@entities': resolve(testRoot, 'src/entities'),
  '@features': resolve(testRoot, 'src/features'),
  '@shared': resolve(testRoot, 'src/shared'),
  '@views': resolve(testRoot, 'src/views'),
  '@tests': resolve(testRoot, 'tests'),
  '@widgets': resolve(testRoot, 'src/widgets'),
}

export const sharedConfig = {
  root: testRoot,
  plugins: [react()],
  resolve: { alias },
} satisfies ViteUserConfig
