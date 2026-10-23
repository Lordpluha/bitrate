/** The status tones every glass block shares — the same four roles the badges carry. */
export type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'error'

/** The tinted icon square for a tone: KPI tiles, messages, list shortcuts. */
export const TONE_ICON_CLASS: Readonly<Record<Tone, string>> = {
  neutral: 'bg-foreground/7 text-muted-foreground',
  info: 'bg-info-surface text-info-text',
  success: 'bg-success-surface text-success-text',
  warning: 'bg-warning-surface text-warning-text',
  error: 'bg-error-surface text-error-text',
}
