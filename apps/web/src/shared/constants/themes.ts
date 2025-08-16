export const theme = {
  dark: 'dark',
  light: 'light'
} as const

// eslint-disable-next-line no-redeclare -- enum for theme
export type theme = (typeof theme)[keyof typeof theme]

export const themes: theme[] = ['dark', 'light']
