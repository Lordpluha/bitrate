// The artist library's component registry: components get stable ids hashed from their name and tree
// path, named parts (overridable children) are recorded in registry-artist.json, and `use` instances a
// component by name. Same contract as the admin library (admin-lib.mjs), so screens read one registry.
import { F, Ref } from '../kit.mjs'
import { stableIds } from '../stable-id.mjs'

/** Creates an empty library: `comp` registers a component, `use` instances one, `part` names a child. */
export function createLibrary() {
  const reg = {}
  const blocks = []
  const stable = stableIds()
  const part = (p, node) => Object.assign(node, { _part: p })
  const restamp = (name, node) => {
    const visit = (n, path) => {
      if (!n || typeof n !== 'object' || !n.id) return
      n.id = stable(`${name}/${path}`)
      ;(n.children ?? []).forEach((c, i) => {
        visit(c, `${path}.${i}`)
      })
    }
    visit(node, '0')
  }
  const comp = (name, node) => {
    restamp(name, node)
    node.reusable = true
    node.name = name
    const parts = {}
    const walk = (n) => {
      if (!n || typeof n !== 'object') return
      /* a fixed-width text needs a width to wrap in; without one it collapses to zero */
      if (
        n.type === 'text' &&
        n.textGrowth === 'fixed-width' &&
        (n.width ?? 'fit_content') === 'fit_content'
      )
        throw new Error(`"${name}": text "${n.name}" is fixed-width without a width`)
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
  const add = (...nodes) => {
    blocks.push(...nodes)
  }
  /** An instance by name; `parts` overrides named parts (the root's own part merges into the ref). */
  const use = (name, o = {}, parts = {}) => {
    const c = reg[name]
    if (!c) throw new Error(`no artist component "${name}"`)
    const desc = {}
    for (const [p, v] of Object.entries(parts)) {
      if (v === undefined) continue
      const pid = c.parts[p]
      if (!pid) throw new Error(`artist component "${name}" has no part "${p}"`)
      if (pid === c.id) Object.assign(o, v)
      else desc[pid] = v
    }
    return Ref(c.id, { name, ...o }, Object.keys(desc).length ? desc : undefined)
  }
  /** Exposes the parts of a nested instance through its owner (`owner.part.inner`). */
  const nest = (owner, partName, inner) => {
    const o = reg[owner].parts
    for (const [p, pid] of Object.entries(reg[inner].parts))
      o[`${partName}.${p}`] = `${o[partName]}/${pid}`
  }
  /** A frame a screen replaces with its own content. */
  const slot = (p, o = {}) =>
    part(
      p,
      F({
        name: 'Slot',
        layout: 'vertical',
        gap: 12,
        width: 'fill_container',
        slot: [],
        ...o,
      }),
    )
  /** Stable ids for the library page's own layout frames (components keep theirs). */
  const stampPage = (root) => {
    const visit = (n, path) => {
      if (!n || typeof n !== 'object' || n.reusable) return
      n.id = stable(`page/${path}`)
      ;(n.children ?? []).forEach((c, i) => {
        visit(c, `${path}.${i}`)
      })
    }
    visit(root, '0')
    return root
  }
  return { reg, blocks, part, comp, add, use, nest, slot, stampPage }
}
