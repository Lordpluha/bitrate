import { colorThemes, fontSize, fontWeight, spacing } from './tokens.gen'

/**
 * Theme values bridged from `packages/tailwind/src` — one palette, three themes (dark is the
 * default, light and dim mirror `:root.light` / `:root.dim`). Never hard-code a hex in a
 * component; read a role through `useTheme()` instead.
 */
export { colorThemes, spacing }

export type ThemeName = keyof typeof colorThemes
export type ColorName = keyof typeof colorThemes.dark
export type ThemeColors = Record<ColorName, string>

/** Text presets — the web typography scale picked for a phone screen. */
export const typography = {
  display: { fontSize: fontSize['3xl'], fontWeight: fontWeight.black, lineHeight: 36 },
  title: { fontSize: fontSize['2xl'], fontWeight: fontWeight.bold, lineHeight: 30 },
  heading: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, lineHeight: 24 },
  body: { fontSize: fontSize.base, fontWeight: fontWeight.normal, lineHeight: 22 },
  bodyStrong: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, lineHeight: 22 },
  caption: { fontSize: fontSize.sm, fontWeight: fontWeight.normal, lineHeight: 18 },
  label: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, lineHeight: 16 },
} as const

export type TypographyVariant = keyof typeof typography

/** Minimum touch target, in points (WCAG / platform HIG). */
export const MIN_TOUCH_TARGET = 44
