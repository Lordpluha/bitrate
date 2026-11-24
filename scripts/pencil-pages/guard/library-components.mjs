// Reads a written .pen library and indexes its reusable components by id for expand-refs.mjs.
import { readFileSync } from 'node:fs'

/** Returns a Map of component id → component node from the library file `file`. */
export function libraryComponents(file) {
  const components = new Map()
  const index = (n) => {
    if (!n || typeof n !== 'object') return
    if (n.reusable) components.set(n.id, n)
    for (const c of n.children ?? []) index(c)
  }
  for (const top of JSON.parse(readFileSync(file, 'utf8')).children) index(top)
  return components
}
