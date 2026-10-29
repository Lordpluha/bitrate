import type { BitratePlayerPositionStore } from '@bitrate/player/contract'

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
 * the first play and prefetch later.
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

export const getPlaybackKey = (
  trackId: string,
  playlistId: string | null,
  playbackSequence: number,
) => `${playlistId ?? 'track'}:${trackId}:${playbackSequence}`

const savePlaybackPosition = (playbackKey: string, position: number) => {
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
