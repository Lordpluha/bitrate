import type Hls from 'hls.js'

export const ACTIVE_BUFFER_SECONDS = 10
export const PREFETCH_BUFFER_SECONDS = 10
export const POSITION_STORAGE_PREFIX = 'spotify-player-position:'

const PREFETCH_AFTER_BUFFER_SECONDS = 8
const PREFETCH_REMAINING_SECONDS = 45
const SLOW_NETWORK_START_BUFFER_SECONDS = 3
const SLOW_NETWORK_PREFETCH_BUFFER_SECONDS = 8
const SLOW_NETWORK_PREFETCH_REMAINING_SECONDS = 30

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

const isSlowNetwork = () => {
  const connection = getNetworkConnection()

  return (
    connection?.saveData === true ||
    connection?.effectiveType === 'slow-2g' ||
    connection?.effectiveType === '2g' ||
    connection?.effectiveType === '3g'
  )
}

const getBufferedAhead = (element: HTMLAudioElement) => {
  const { buffered, currentTime } = element

  for (let index = 0; index < buffered.length; index += 1) {
    if (
      buffered.start(index) <= currentTime &&
      buffered.end(index) >= currentTime
    ) {
      return buffered.end(index) - currentTime
    }
  }

  return 0
}

export const shouldDelayInitialPlayback = (element: HTMLAudioElement) =>
  isSlowNetwork() &&
  element.currentTime < 1 &&
  getBufferedAhead(element) < SLOW_NETWORK_START_BUFFER_SECONDS

export const shouldPrefetchNextTrack = (element: HTMLAudioElement) => {
  const bufferedAhead = getBufferedAhead(element)
  const duration = element.duration
  const remaining = duration - element.currentTime

  if (!Number.isFinite(duration)) return false

  if (!isSlowNetwork()) {
    return (
      remaining <= PREFETCH_REMAINING_SECONDS &&
      (bufferedAhead >= PREFETCH_AFTER_BUFFER_SECONDS || element.paused)
    )
  }

  return (
    remaining <= SLOW_NETWORK_PREFETCH_REMAINING_SECONDS &&
    bufferedAhead >= SLOW_NETWORK_PREFETCH_BUFFER_SECONDS
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

export const removePlaybackPosition = (playbackKey: string) => {
  sessionStorage.removeItem(`${POSITION_STORAGE_PREFIX}${playbackKey}`)
}

export const restorePlaybackPosition = (
  element: HTMLAudioElement,
  playbackKey: string,
) => {
  const savedPosition = Number(
    sessionStorage.getItem(`${POSITION_STORAGE_PREFIX}${playbackKey}`),
  )

  if (
    Number.isFinite(savedPosition) &&
    savedPosition > 0 &&
    savedPosition < element.duration
  ) {
    element.currentTime = savedPosition
  }
}
