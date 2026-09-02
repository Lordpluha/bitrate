#!/usr/bin/env node
/**
 * Fails when first-party UI source paints with Tailwind's built-in palette instead of a
 * design token.
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

const ROOTS = ['apps/web-player/src', 'apps/web-artists/src', 'packages/ui-react/src']

/** Specs and stories may name arbitrary classes — they assert class merging, not appearance. */
const EXEMPT = /\.(unit|int|snapshot|screenshot)-spec\.[jt]sx?$|\.stories\.[jt]sx?$/

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) yield* walk(path)
    else if (/\.[jt]sx?$/.test(path) && !EXEMPT.test(path)) yield path
  }
}

const findings = []
for (const root of ROOTS) {
  for (const file of walk(root)) {
    readFileSync(file, 'utf8')
      .split('\n')
      .forEach((line, i) => {
        for (const hit of line.match(PATTERN) ?? []) findings.push({ file, line: i + 1, hit })
      })
  }
}

if (findings.length === 0) {
  console.log('✅ design tokens: no stock Tailwind colours in first-party UI source')
  process.exit(0)
}

console.error(`✗ ${findings.length} stock Tailwind colour(s) found — use a design token instead:\n`)
for (const f of findings) console.error(`  ${f.file}:${f.line}  ${f.hit}`)
console.error(`
These classes do not go through packages/ui-react/tokens/tokens.json, so the theme switch cannot
reach them. Replace with a semantic role (bg-muted, text-muted-foreground, border-border,
ring-ring, bg-primary, bg-destructive, chart-1…5) or a palette scale the repo defines.
See .claude/rules/styling.md.`)
process.exit(1)
