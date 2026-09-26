import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseEnv } from 'node:util'

/** Parameters for {@link loadEnvFiles}. */
export type LoadEnvFilesInput = {
  /** Directory the file names are resolved against. */
  root: string
  /** File names, checked in this order — the first one to define a variable wins. */
  files: readonly string[]
  /** The object variables are written into. Defaults to `process.env`. */
  target?: NodeJS.ProcessEnv
}

/**
 * Loads env files into `target`, checking them in the order given and never overwriting a
 * variable that is already set. So a real shell variable beats every file, and an earlier file
 * beats a later one. A missing file is skipped silently.
 *
 * TypeScript port of `apps/admin/scripts/load-env-files.mjs` for the seed layer — same order,
 * same "first wins" semantics, so `apps/api`'s own `.env.local`/`.env` split behaves identically
 * to the admin panel's. The order lives here rather than in `node --env-file-if-exists` flags on
 * purpose: Node lets the *last* flag win, so listing the files in their priority order there
 * would invert it.
 *
 * A seed entrypoint that reads `process.env` at module load (a `new Pool({ connectionString:
 * process.env.DATABASE_URL })` outside any function) must call this — or import a module that
 * does — before that statement runs. See `bootstrap-env.ts`.
 *
 * @returns the files that were actually found and read, in the order they were checked.
 */
export function loadEnvFiles({ root, files, target = process.env }: LoadEnvFilesInput): string[] {
  const loaded: string[] = []

  for (const name of files) {
    const path = resolve(root, name)
    if (!existsSync(path)) continue

    for (const [key, value] of Object.entries(parseEnv(readFileSync(path, 'utf8')))) {
      if (target[key] === undefined) target[key] = value
    }
    loaded.push(name)
  }

  return loaded
}
