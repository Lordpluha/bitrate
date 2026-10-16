import type { Locale } from '@/shared/i18n'

export const STREAMING_QUALITIES = [
  'Automatic',
  'Low',
  'Normal',
  'High',
] as const
export type StreamingQuality = (typeof STREAMING_QUALITIES)[number]

export type InterfaceLanguage = Locale

export type SettingsSnapshot = {
  /** Audio */
  language: InterfaceLanguage
  streamingQuality: StreamingQuality
  /** Library and display */
  compactLibrary: boolean
  nowPlayingPanel: boolean
}

export type SettingsKey = keyof SettingsSnapshot
