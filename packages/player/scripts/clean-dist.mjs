/**
 * Removes `dist/` before a build — mirrors `packages/ui-react/scripts/clean-dist.mjs`, for the
 * same reason: `dist/types` is written by `vite-plugin-dts`, not by rollup, so Vite's
 * `build.emptyOutDir` (which only empties `dist/esm`) never clears it on its own.
 */
import { rm } from 'node:fs/promises'

await rm(new URL('../dist', import.meta.url), { force: true, recursive: true })
