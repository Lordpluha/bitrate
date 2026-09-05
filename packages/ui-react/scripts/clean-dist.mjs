/**
 * Removes `dist/` before a build.
 *
 * This is not redundant with `build.emptyOutDir` in vite.config.ts. That flag empties the
 * directories rollup actually writes — `dist/esm` and `dist/cjs` — and nothing else.
 * `dist/types` is produced by `vite-plugin-dts`, which is not a rollup output, so Vite never
 * clears it. Without this script a deleted component keeps its stale `.d.ts` there: the
 * type still resolves for consumers while the implementation it describes is gone.
 */
import { rm } from 'node:fs/promises'

await rm(new URL('../dist', import.meta.url), { force: true, recursive: true })
