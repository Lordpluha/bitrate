export const theme = {
  dark: 'dark',
  light: 'light',
} as const;

export type Theme = (typeof theme)[keyof typeof theme];

export const themes: Theme[] = ['dark', 'light'];
