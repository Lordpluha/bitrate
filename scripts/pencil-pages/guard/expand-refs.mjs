// Expands library instances into plain trees so their layout can be estimated: each ref becomes a
// copy of its component with the instance's own size and its `descendants` overrides applied
// (property merges or whole-node replacements), nested instances included.

const bare = (s) => String(s).replace(/^[^:/]+:/, '')
const key = (path) => path.split('/').map(bare).join('/')

/**
 * Returns `node` with every ref replaced by its expanded component (`components`: id → node).
 * `path` is the id path inside the enclosing component (null outside any), `overrides` its
 * descendants keyed by that path.
 */
export function expandRefs(node, components, overrides = {}, path = null) {
  if (!node || typeof node !== 'object') return node
  const here = path === null ? null : path ? `${path}/${bare(node.id)}` : bare(node.id)
  const own = here === null ? undefined : overrides[here]
  if (own?.type) return expandRefs(own, components)
  const merged = own ? { ...node, ...own } : node
  if (merged.type === 'ref') {
    const component = components.get(bare(merged.ref))
    if (!component) return merged
    const inner = {}
    for (const [k, v] of Object.entries(merged.descendants ?? {})) inner[key(k)] = v
    /* overrides addressed through this instance from an outer one win over its own */
    if (here !== null)
      for (const [k, v] of Object.entries(overrides)) {
        if (!k.startsWith(`${here}/`)) continue
        const rest = k.slice(here.length + 1)
        inner[rest] = v.type ? v : { ...inner[rest], ...v }
      }
    const { ref: _ref, descendants: _d, type: _t, children: _c, ...size } = merged
    return {
      ...component,
      ...size,
      reusable: false,
      children: (component.children ?? []).map((c) => expandRefs(c, components, inner, '')),
    }
  }
  return {
    ...merged,
    children: (merged.children ?? []).map((c) => expandRefs(c, components, overrides, here)),
  }
}
