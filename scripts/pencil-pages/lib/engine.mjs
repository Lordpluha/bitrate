// Library build engine: loads the library, reserves its ids and turns built nodes into reusable
// components with stable ids, recording their ids and overridable parts in the registry.
import { readFileSync } from 'node:fs'
import { setMode, reserve, C, T, I, F, img, ART } from '../kit.mjs'
import { stableIds } from '../stable-id.mjs'

/* the library addresses its own nodes without the `ds:` alias; set before any block module
   evaluates its token constants (every block module imports this one) */
setMode('lib')

let stable
/** Reads the library file and reserves its ids, except those of the pages rebuilt here. */
export const loadLibrary = (libF) => {
  const lib = JSON.parse(readFileSync(libF, 'utf8'))
  const ids = []
  /* ids of the page-blocks page are regenerated deterministically below, so they are not reserved */
  const collect = (n) => {
    if (Array.isArray(n)) return n.forEach(collect)
    if (!n || typeof n !== 'object') return
    if (
      n.name === '00E • Page Blocks' ||
      n.name === '09 • Toasts' ||
      n.name === '10 • Context Menu'
    )
      return
    if (n.id) ids.push(n.id)
    Object.values(n).forEach(collect)
  }
  collect(lib.children)
  reserve(ids)
  /* stable ids: a component's nodes get ids hashed from its name and their position in the tree */
  stable = stableIds(new Set(ids))
  return lib
}
/** A stable id for `key`, unique across the library. */
export const stableId = (key) => stable(key)

export const reg = {}
export const part = (p, node) => Object.assign(node, { _part: p })
export const restamp = (name, node) => {
  const visit = (n, path) => {
    if (!n || typeof n !== 'object' || !n.id) return
    n.id = stable(`${name}/${path}`)
    ;(n.children ?? []).forEach((c, i) => {
      visit(c, `${path}.${i}`)
    })
  }
  visit(node, '0')
}
const cells = new WeakMap()
/** The page-blocks cell size a component asked for in comp(), if any. */
export const cellOf = (node) => cells.get(node)
/**
 * Makes `node` the reusable component `name`: stable ids, parts recorded in the registry. `cell` sizes
 * its page-blocks cell when its width follows its parent: 'medium' (480) or 'wide' (960).
 */
export const comp = (name, node, { cell } = {}) => {
  restamp(name, node)
  if (cell) cells.set(node, cell)
  node.reusable = true
  node.name = name
  const parts = {}
  const walk = (n) => {
    if (!n || typeof n !== 'object') return
    if (n._part) {
      parts[n._part] = n.id
      delete n._part
    }
    ;(n.children ?? []).forEach(walk)
  }
  walk(node)
  reg[name] = { id: node.id, parts }
  return node
}
export const txt = (name, content, o) => comp(name, part('text', T(content, o)))
export const icn = (name, fill) => comp(name, I('circle', { fill, width: 20, height: 20 }))
export const cover = (o = {}) =>
  F({ name: 'Cover', width: 48, height: 48, cornerRadius: 8, fill: img(ART.afterglow), ...o })
export const gradient = (a, b, rot = 225) => ({
  type: 'gradient',
  gradientType: 'linear',
  rotation: rot,
  colors: [
    { color: a, position: 0 },
    { color: b, position: 1 },
  ],
})
export const slot = (p, o = {}) =>
  part(p, F({ name: 'Slot', layout: 'vertical', gap: 12, width: 'fill_container', slot: [], ...o }))
export const muted = (s, o = {}) => T(s, { fontSize: 13, fill: C.mutedForeground, ...o })
export const iconBtn = (icon) =>
  F(
    {
      name: 'Icon Button',
      width: 36,
      height: 36,
      cornerRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      stroke: C.border,
      strokeWidth: 1,
    },
    [I(icon, { width: 18, height: 18, fill: C.foreground })],
  )
const stampTree = (n, key) => {
  if (!n || typeof n !== 'object') return
  if (n.id) n.id = stable(key)
  ;(n.children ?? []).forEach((c, i) => {
    stampTree(c, `${key}.${i}`)
  })
}
/** Stamps nodes swapped into instances (`descendants`) under `n`, keyed by their owner's id. */
export const stampSwapped = (n) => {
  if (!n || typeof n !== 'object') return
  for (const [k, v] of Object.entries(n.descendants ?? {}))
    if (v?.type) stampTree(v, `${n.id}/d:${k}`)
  ;(n.children ?? []).forEach(stampSwapped)
  Object.values(n.descendants ?? {}).forEach(stampSwapped)
}
