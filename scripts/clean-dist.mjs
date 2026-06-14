#!/usr/bin/env node
import { readdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'

function remove(dir, target, depth = 0) {
  if (depth > 6) return
  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const e of entries) {
    if (e.name === 'node_modules') continue
    const p = join(dir, e.name)
    if (!e.isDirectory()) continue
    if (e.name === target) {
      rmSync(p, { recursive: true, force: true })
    } else {
      remove(p, target, depth + 1)
    }
  }
}

remove('.', 'dist')
console.log('dist/ folders removed')
