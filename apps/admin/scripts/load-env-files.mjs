import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseEnv } from 'node:util'

/**
 * Loads env files into `target`, checking them in the order given and never overwriting a variable
 * that is already set. So a real shell variable beats every file, and an earlier file beats a later
 * one. A missing file is skipped silently.
 *
 * The order lives here rather than in `node --env-file-if-exists` flags on purpose: Node lets the
 * *last* flag win, so listing the files in their priority order there would invert it.
 *
 * @returns the files that were actually found and read, in the order they were checked.
 */
export function loadEnvFiles({ root, files, target = process.env }) {
  const loaded = []

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
