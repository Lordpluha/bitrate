export const Theme = {
  dark: 'dark',
  light: 'light',
  dim: 'dim',
} as const

export type Theme = (typeof Theme)[keyof typeof Theme]

export const Themes = Object.values(Theme)
