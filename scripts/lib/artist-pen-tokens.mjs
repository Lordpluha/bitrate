/**
 * The artist workspace library's own variables (pencil/web-artist-design/design-system/artist.lib.pen).
 *
 * apps/web-artists paints its workspace with component roles from
 * packages/tailwind/src/themes/components/artist-workspace.css, which the player's library keeps in
 * code. The artist library exposes them, so its glass, aurora and status colours are the code's:
 * - every `--color-artist-*` role becomes `--artist-*` (a colour per theme; a bare `var()` to another
 *   exported role stays an alias),
 * - every `--shadow-artist-*` becomes the colour `--artist-shadow-*` (fully transparent where the theme
 *   sets `none`, so a shadow switches off with the theme),
 * - every numeric `--artist-*` setting (panel opacity, grain, washes) becomes a number
 *   variable, a percentage as a 0–1 fraction (the CSS diagonal stops are a conversion from Pencil
 *   and are not exported).
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const THEMES = ['Dark', 'Light', 'Dim']
const SOURCE = 'packages/tailwind/src/themes/components/artist-workspace.css'
const BLOCK =
  /((?:@theme(?:\s+inline)?|:root\.light|:root\.dim)(?:\s*,\s*(?::root\.light|:root\.dim))*)\s*\{([^}]*)\}/g
const THEME_OF = { '@theme': 'Dark', ':root.light': 'Light', ':root.dim': 'Dim' }

/** Every custom property of the file per theme; a selector list sets each of its themes. */
const declarations = (css) => {
  const out = { Dark: {}, Light: {}, Dim: {} }
  for (const [, selectors, body] of css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(BLOCK))
    for (const sel of selectors.split(',').map((s) => s.trim().replace(/\s+inline$/, '')))
      for (const [, name, value] of body.matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/g))
        out[THEME_OF[sel]][name] = value.trim()
  return out
}
const pick = (decls, theme, name) => decls[theme][name] ?? decls.Dark[name]
const number = (raw) => (raw.endsWith('%') ? Number.parseFloat(raw) / 100 : Number(raw))
const perTheme = (values, type) =>
  values.every((v) => v === values[0])
    ? { type, value: values[0] }
    : { type, value: values.map((value, i) => ({ value, theme: { Mode: THEMES[i] } })) }

/**
 * Returns the artist roles as Pencil variables. `resolve(theme, cssValue)` turns a colour into hex
 * with the whole token set (as the shared roles resolve); `exported` names the variables the library
 * already holds, so an alias to one of them stays an alias.
 */
export function artistVariables(root, { resolve, toHex, exported }) {
  const decls = declarations(readFileSync(join(root, SOURCE), 'utf8'))
  const vars = {}
  const colours = Object.keys(decls.Dark).filter((n) => n.startsWith('color-artist-'))
  const names = new Set([...exported, ...colours.map((n) => `--${n.slice(6)}`)])
  for (const name of colours) {
    const values = THEMES.map((theme) => {
      const raw = pick(decls, theme, name)
      const alias = raw.match(/^var\(--color-([a-z0-9-]+)\)$/)
      if (alias && names.has(`--${alias[1]}`)) return `$--${alias[1]}`
      return toHex(resolve(theme, raw))
    })
    vars[`--${name.slice(6)}`] = perTheme(values, 'color')
  }
  for (const name of Object.keys(decls.Dark).filter((n) => n.startsWith('shadow-artist-'))) {
    const values = THEMES.map((theme) => {
      const raw = pick(decls, theme, name)
      if (raw === 'none') return '#00000000'
      const colour = raw.match(/(var\([^)]+\)|#[0-9a-fA-F]{3,8})\s*$/)
      if (!colour) throw new Error(`--${name}: no colour in "${raw}"`)
      return toHex(resolve(theme, colour[1]))
    })
    vars[`--artist-shadow-${name.slice('shadow-artist-'.length)}`] = perTheme(values, 'color')
  }
  /* the diagonal stops map a Pencil 135° gradient onto CSS; the library draws that gradient natively */
  const numeric = (n) => n.startsWith('artist-') && !n.startsWith('artist-diagonal-')
  for (const name of Object.keys(decls.Dark).filter(numeric)) {
    const values = THEMES.map((theme) => number(pick(decls, theme, name)))
    if (values.some(Number.isNaN)) continue
    vars[`--${name}`] = perTheme(values, 'number')
  }
  return vars
}
