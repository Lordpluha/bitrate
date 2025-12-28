export const theme = {
  dark: 'dark',
  light: 'light'
} as const

export type theme = (typeof theme)[keyof typeof theme]

export const themes: theme[] = ['dark', 'light']
