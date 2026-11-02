import { apiBaseUrl } from '@shared/api'
import type { TranslationKey } from '@shared/i18n'

/** Mirrors the API limits so oversized or unsupported files are refused before uploading. */
const MAX_COVER_BYTES = 20 * 1024 * 1024
const MAX_AUDIO_BYTES = 512 * 1024 * 1024

export const COVER_ACCEPT = 'image/jpeg,image/png,image/webp'
const COVER_TYPES = new Set(COVER_ACCEPT.split(','))

/** Browsers report WAV and FLAC under several MIME names; the API accepts each of them. */
const AUDIO_TYPES = new Set([
  'audio/wav',
  'audio/x-wav',
  'audio/wave',
  'audio/flac',
  'audio/x-flac',
  'audio/mpeg',
  'audio/ogg',
])
export const AUDIO_ACCEPT = `.wav,.flac,.mp3,.ogg,${[...AUDIO_TYPES].join(',')}`

/** Public covers uploaded through the API live under its `/static` route. */
const API_STATIC_PREFIX = '/static/'

/** Resolves a stored cover path to a URL the portal can load from the API origin. */
export function releaseCoverUrl(cover: string): string {
  return cover.startsWith(API_STATIC_PREFIX) ? `${apiBaseUrl}${cover}` : cover
}

/** Owner-only playback route of an uploaded master; the session cookie authorizes it. */
export function releaseAudioUrl(releaseId: string, trackId: string): string {
  return `${apiBaseUrl}/api/v1/releases/${releaseId}/tracks/${trackId}/audio`
}

/** What is wrong with a chosen cover, as a catalog key, or null when it can be uploaded. */
export function coverFileProblem(file: File): TranslationKey | null {
  if (!COVER_TYPES.has(file.type)) return 'media.coverType'
  if (file.size > MAX_COVER_BYTES) return 'media.coverSize'
  return null
}

/** What is wrong with a chosen master, as a catalog key, or null when it can be uploaded. */
export function audioFileProblem(file: File): TranslationKey | null {
  if (!AUDIO_TYPES.has(file.type)) return 'media.audioType'
  if (file.size > MAX_AUDIO_BYTES) return 'media.audioSize'
  return null
}

/** A readable default title: the file name without its extension and separators. */
export function titleFromFileName(name: string): string {
  const base = name
    .replace(/\.[^.]+$/, '')
    .replace(/[_]+/g, ' ')
    .trim()
  return base.slice(0, 255)
}

const BYTE_UNITS = ['B', 'KB', 'MB', 'GB'] as const

export function formatBytes(bytes: number): string {
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < BYTE_UNITS.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${unit === 0 ? value : value.toFixed(1)} ${BYTE_UNITS[unit]}`
}
