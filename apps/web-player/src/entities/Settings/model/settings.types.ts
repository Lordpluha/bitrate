import type { Locale } from '@/shared/i18n'

export type StreamingQuality = 'Automatic' | 'Low' | 'Normal' | 'High'

export type InterfaceLanguage = Locale

export type SettingsSnapshot = {
  /** Audio */
  language: InterfaceLanguage
  streamingQuality: StreamingQuality
  normalizeVolume: boolean
  /** Library and display */
  compactLibrary: boolean
  nowPlayingPanel: boolean
  /** Videos and canvas */
  musicVideos: boolean
  canvas: boolean
  otherVideos: boolean
  /** Privacy */
  listeningActivity: boolean
  followersVisible: boolean
  profilePlaylistsVisible: boolean
}

export type SettingsKey = keyof SettingsSnapshot
