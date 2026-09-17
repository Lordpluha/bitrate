#!/usr/bin/env node
/**
 * Fails when first-party UI source paints with Tailwind's built-in palette instead of a
 * design token, or — for `packages/player`, which has no Tailwind utilities to check —
 * with a hardcoded hex colour literal instead of a `var(--color-*)` custom property.
 *
 * The repo never clears Tailwind's stock colours (no `--color-*: initial`), so `bg-slate-100`
 * silently resolves to Tailwind's own grey. Such a class is invisible to the token pipeline:
 * no `@theme` layer declares it, `:root.light` never overrides it, and the component simply
 * stops responding to the theme switch. That is how 22 of 29 ui-react components once ended
 * up theme-deaf while `pnpm lint` stayed green.
 *
 * Scales the repo defines itself (green, neutral, blue, red, amber, purple, grey, black,
 * white…) are allowed: those are real palette tokens. Only Tailwind-only scales are rejected.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

/** Colour scales Tailwind ships that this repo's palette does not define. */
const STOCK_SCALES = [
  'orange',
  'slate',
  'gray',
  'zinc',
  'stone',
  'yellow',
  'lime',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'indigo',
  'violet',
  'fuchsia',
  'pink',
  'rose',
]

const UTILITIES =
  'bg|text|border|ring|outline|fill|stroke|from|via|to|decoration|placeholder|caret|accent|divide|shadow'

const PATTERN = new RegExp(
  `\\b(?:[a-z-]+:)*(?:${UTILITIES})-(?:${STOCK_SCALES.join('|')})-\\d+(?:/\\d+)?\\b`,
  'g',
)

/**
 * A literal 3/4/6/8-digit hex colour, bounded so it never matches a CSS id selector
 * (`#root`, whose letters are not all valid hex digits) or a TypeScript private class field
 * (`#bar`, same reason). Only checked for `PLAYER_ROOT` below: `packages/player` styles with
 * `var(--color-*)` custom properties in `<style>` blocks, not Tailwind utilities, so `PATTERN`
 * above can never catch a real violation there — this is the check that root actually needs.
 * Not applied to the other roots: they have a long pre-existing tail of legitimate hex (brand
 * SVG icon fills, a `<meta name="theme-color">` value, devtools `console.log` styling) that a
 * blanket hex ban was never scoped to touch; auditing that tail is a separate task.
 */
const HEX_COLOR_PATTERN = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})\b/g

const PLAYER_ROOT = 'packages/player/src'

const ROOTS = ['apps/web-player/src', 'apps/web-artists/src', 'packages/ui-react/src', PLAYER_ROOT]

/** Specs and stories may name arbitrary classes — they assert class merging, not appearance. */
const EXEMPT = /\.(unit|int|snapshot|screenshot|node|browser)-spec\.[jt]sx?$|\.stories\.[jt]sx?$/

/** `.svelte` only exists under `packages/player/src` today; harmless to allow everywhere. */
function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) yield* walk(path)
    else if (/\.([jt]sx?|svelte)$/.test(path) && !EXEMPT.test(path)) yield path
  }
}

const stockScaleFindings = []
const hexFindings = []
for (const root of ROOTS) {
  for (const file of walk(root)) {
    const lines = readFileSync(file, 'utf8').split('\n')
    lines.forEach((line, i) => {
      for (const hit of line.match(PATTERN) ?? []) {
        stockScaleFindings.push({ file, line: i + 1, hit })
      }
    })
    if (root === PLAYER_ROOT) {
      lines.forEach((line, i) => {
        for (const hit of line.match(HEX_COLOR_PATTERN) ?? []) {
          hexFindings.push({ file, line: i + 1, hit })
        }
      })
    }
  }
}

if (stockScaleFindings.length === 0 && hexFindings.length === 0) {
  console.log('✅ design tokens: no stock Tailwind colours or hardcoded hex literals found')
  process.exit(0)
}

if (stockScaleFindings.length > 0) {
  console.error(
    `✗ ${stockScaleFindings.length} stock Tailwind colour(s) found — use a design token instead:\n`,
  )
  for (const f of stockScaleFindings) console.error(`  ${f.file}:${f.line}  ${f.hit}`)
  console.error(`
These classes do not go through packages/ui-react/tokens/tokens.json, so the theme switch cannot
reach them. Replace with a semantic role (bg-muted, text-muted-foreground, border-border,
ring-ring, bg-primary, bg-destructive, chart-1…5) or a palette scale the repo defines.
See .claude/rules/styling.md.`)
}

if (hexFindings.length > 0) {
  console.error(
    `\n✗ ${hexFindings.length} hardcoded hex colour literal(s) found in packages/player:\n`,
  )
  for (const f of hexFindings) console.error(`  ${f.file}:${f.line}  ${f.hit}`)
  console.error(`
A literal hex colour does not respond to a theme switch. Use a var(--color-*) custom property
instead — it inherits through the shadow DOM boundary while Tailwind utilities cannot.
See .claude/rules/player-rules.md § "Styling".`)
}

process.exit(1)
