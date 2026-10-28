import type { BitratePlayerPositionStore } from '@bitrate/player/contract'
import type Hls from 'hls.js'

export const ACTIVE_BUFFER_SECONDS = 10
export const PREFETCH_BUFFER_SECONDS = 10
const POSITION_STORAGE_PREFIX = 'bitrate-player-position:'

type NetworkConnection = {
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g'
  saveData?: boolean
}

const getNetworkConnection = () => {
  if (typeof navigator === 'undefined') return null

  return (
    (navigator as Navigator & { connection?: NetworkConnection }).connection ??
    null
  )
}

/**
 * Data saver or a 2G/3G connection: `<bitrate-player>` reads this as `isConstrained` to delay
 * the first play and prefetch later, and the HLS path drops to its lowest level.
 */
export const isSlowNetwork = () => {
  const connection = getNetworkConnection()

  return (
    connection?.saveData === true ||
    connection?.effectiveType === 'slow-2g' ||
    connection?.effectiveType === '2g' ||
    connection?.effectiveType === '3g'
  )
}

const getLowestHlsLevelIndex = (hls: Hls) => {
  if (hls.levels.length === 0) return -1

  return hls.levels.reduce((lowestLevelIndex, level, levelIndex) => {
    const lowestLevel = hls.levels[lowestLevelIndex]
    if (!lowestLevel) return levelIndex

    return level.bitrate < lowestLevel.bitrate ? levelIndex : lowestLevelIndex
  }, 0)
}

export const applyNetworkAwareHlsQuality = (hls: Hls) => {
  if (!isSlowNetwork()) {
    hls.autoLevelCapping = -1
    hls.currentLevel = -1
    return
  }

  const lowestLevelIndex = getLowestHlsLevelIndex(hls)
  if (lowestLevelIndex === -1) return

  hls.autoLevelCapping = lowestLevelIndex
  hls.currentLevel = lowestLevelIndex
  hls.nextLevel = lowestLevelIndex
}

const getApiUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/'
  return apiUrl.endsWith('/') ? apiUrl : `${apiUrl}/`
}

export const getHlsUrl = (trackId: string) =>
  `${getApiUrl()}api/v1/tracks/stream/${trackId}/hls/master.m3u8`

export const getPlaybackKey = (
  trackId: string,
  playlistId: string | null,
  playbackSequence: number,
) => `${playlistId ?? 'track'}:${trackId}:${playbackSequence}`

export const savePlaybackPosition = (playbackKey: string, position: number) => {
  sessionStorage.setItem(
    `${POSITION_STORAGE_PREFIX}${playbackKey}`,
    String(position),
  )
}

const removePlaybackPosition = (playbackKey: string) => {
  sessionStorage.removeItem(`${POSITION_STORAGE_PREFIX}${playbackKey}`)
}

/** `sessionStorage` resume positions per play key, in the shape the element asks for. */
export const sessionPositionStore: BitratePlayerPositionStore = {
  remove: removePlaybackPosition,
  restore: (playbackKey) => {
    const saved = Number(
      sessionStorage.getItem(`${POSITION_STORAGE_PREFIX}${playbackKey}`),
    )
    return Number.isFinite(saved) && saved > 0 ? saved : null
  },
  save: savePlaybackPosition,
}
