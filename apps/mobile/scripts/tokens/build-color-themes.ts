import { BRAND_COLORS, COLOR_ROLES } from './color-roles'
import type { CssBlock } from './read-css-blocks'
import { resolveTokenValue } from './resolve-token-value'

type ThemeName = 'dark' | 'light' | 'dim'
type RoleKey = keyof typeof COLOR_ROLES
type ColorTheme = Record<RoleKey, string>

export type ColorThemes = {
  themes: Record<ThemeName, ColorTheme>
  brand: Record<keyof typeof BRAND_COLORS, string>
}

const THEME_SELECTORS: Record<Exclude<ThemeName, 'dark'>, string> = {
  light: ':root.light',
  dim: ':root.dim',
}

/** Merges every block with `selector` into one map, later blocks winning like the cascade. */
function collect(blocks: CssBlock[], selector: string): Record<string, string> {
  return Object.assign({}, ...blocks.filter((b) => b.selector === selector).map((b) => b.vars))
}

function resolveRoles(vars: Record<string, string>): ColorTheme {
  const entries = Object.entries(COLOR_ROLES).map(([key, role]) => [
    key,
    resolveTokenValue(`var(--color-${role})`, vars),
  ])
  return Object.fromEntries(entries) as ColorTheme
}

/**
 * Builds the three colour themes the same way the browser does: `@theme` is the dark default,
 * `:root.light` and `:root.dim` override it, and every `var()` resolves against the merged map.
 */
export function buildColorThemes(blocks: CssBlock[]): ColorThemes {
  const dark = collect(blocks, '@theme')
  const themes = { dark: resolveRoles(dark) } as Record<ThemeName, ColorTheme>

  for (const [name, selector] of Object.entries(THEME_SELECTORS)) {
    themes[name as ThemeName] = resolveRoles({ ...dark, ...collect(blocks, selector) })
  }

  const brand = Object.fromEntries(
    Object.entries(BRAND_COLORS).map(([key, name]) => [key, resolveTokenValue(`var(--color-${name})`, dark)]),
  ) as ColorThemes['brand']

  return { themes, brand }
}
