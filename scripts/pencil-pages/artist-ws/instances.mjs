// Instances of the artist library (`artist`, registry-artist.json) by name, text, buttons, status chips
// and layout-only frames: the base the screen helpers in ui.mjs build on.
import { readFileSync } from 'node:fs'
import { Ref } from '../kit.mjs'
import { L } from '../ui.mjs'

const reg = JSON.parse(readFileSync(new URL('../registry-artist.json', import.meta.url), 'utf8'))

/** The instance, text, button and layout helpers. */
export function artistInstances() {
  const W = (name, o = {}, parts = {}) => {
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
    return Ref(c.id, { name: o.name ?? name, ...o }, Object.keys(desc).length ? desc : undefined)
  }
  const wrap = { width: 'fill_container', textGrowth: 'fixed-width' }
  const Tx = (style, content, o = {}) =>
    W(`Text/${style}`, { name: String(content).slice(0, 28), ...o, content })
  const P = (style, content) => Tx(style, content, wrap)
  const Row = (o, ch) => L({ name: 'Row', gap: 8, alignItems: 'center', ...o }, ch)
  const Col = (o, ch) =>
    L({ name: 'Column', layout: 'vertical', gap: 12, width: 'fill_container', ...o }, ch)
  /** A slot replacement keeps the slot's own layout. */
  const fill = (name, nodes, o = {}) =>
    L({ name, layout: 'vertical', gap: 12, width: 'fill_container', ...o }, nodes)
  const inline = (name, nodes) => L({ name, gap: 8, alignItems: 'center' }, nodes)
  const Btn = (label, variant = 'Secondary', icon = null, o = {}) =>
    W(
      `Button/${variant}`,
      { name: `Button / ${label}`, ...o },
      { label: { content: label }, icon: icon ? { icon } : { enabled: false } },
    )
  const St = (tone, label, icon) =>
    W(
      `Status/${tone}`,
      { name: `Status / ${label}` },
      { label: { content: label }, ...(icon ? { icon: { icon } } : {}) },
    )
  const AI = () => St('Brand', 'Created with AI', 'sparkles')
  return { W, wrap, Tx, P, Row, Col, fill, inline, Btn, St, AI }
}
