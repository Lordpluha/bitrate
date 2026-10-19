import type { ApiSchemas } from '@bitrate/contracts'
import type { PlayerSnapshot, PlayerTrack, RepeatMode } from '@/entities/Player'

type ServerRepeatMode = NonNullable<ApiSchemas['UpdatePlayerDto']['repeatMode']>
type ServerPlayerUpdate = Required<
  Pick<
    ApiSchemas['UpdatePlayerDto'],
    | 'currentTrackId'
    | 'deviceId'
    | 'isPlaying'
    | 'positionMs'
    | 'repeatMode'
    | 'shuffle'
  >
>

/** The saved player row (`GET /me/player`), already parsed. */
export type ServerPlayer = {
  currentTrack: PlayerTrack | null
  positionMs: number
  queue: { track: PlayerTrack }[]
  repeatMode: ServerRepeatMode
  shuffle: boolean
}

const REPEAT_TO_SERVER = {
  all: 'context',
  off: 'off',
  one: 'track',
} as const satisfies Record<RepeatMode, ServerRepeatMode>

const REPEAT_FROM_SERVER = {
  context: 'all',
  off: 'off',
  track: 'one',
} as const satisfies Record<ServerRepeatMode, RepeatMode>

type ToServerPlayerUpdateInput = {
  deviceId: string
  snapshot: PlayerSnapshot
}

/** What this device is playing, in the shape `PUT /me/player` takes. */
export const toServerPlayerUpdate = ({
  deviceId,
  snapshot,
}: ToServerPlayerUpdateInput): ServerPlayerUpdate => ({
  currentTrackId: snapshot.currentTrack?.id ?? null,
  deviceId,
  isPlaying: snapshot.isPlaying,
  positionMs: Math.round(snapshot.currentTime * 1000),
  repeatMode: REPEAT_TO_SERVER[snapshot.repeatMode],
  shuffle: snapshot.isShuffled,
})

type ToServerQueueInput = {
  snapshot: PlayerSnapshot
}

/** `UpdateQueueDto` accepts at most this many track ids. */
export const SERVER_QUEUE_LIMIT = 500

/**
 * The ordered list being played (`PUT /me/player/queue`); the current track alone when there is
 * none. A longer list keeps the window that starts at the current track (or its last part).
 */
export const toServerQueue = ({ snapshot }: ToServerQueueInput) => {
  const ids = snapshot.playlist.map(({ id }) => id)
  if (ids.length === 0)
    return { trackIds: snapshot.currentTrack ? [snapshot.currentTrack.id] : [] }

  const start = Math.max(
    0,
    Math.min(snapshot.currentTrackIndex, ids.length - SERVER_QUEUE_LIMIT),
  )
  return { trackIds: ids.slice(start, start + SERVER_QUEUE_LIMIT) }
}

/**
 * A player session to continue from the saved state, paused at the saved position; null when
 * nothing was playing.
 */
export const fromServerPlayer = (
  remote: ServerPlayer,
): Partial<PlayerSnapshot> | null => {
  const { currentTrack } = remote
  if (!currentTrack) return null

  const savedList = remote.queue.map(({ track }) => track)
  const savedIndex = savedList.findIndex(({ id }) => id === currentTrack.id)
  const playlist = savedIndex === -1 ? [currentTrack] : savedList

  return {
    currentPlaylistId: null,
    currentPlaylistName: null,
    currentTime: remote.positionMs / 1000,
    currentTrack,
    currentTrackIndex: savedIndex === -1 ? 0 : savedIndex,
    isShuffled: remote.shuffle,
    playlist,
    queue: [],
    repeatMode: REPEAT_FROM_SERVER[remote.repeatMode],
  }
}

const BROWSERS = [
  ['Edg/', 'Edge'],
  ['OPR/', 'Opera'],
  ['Firefox/', 'Firefox'],
  ['Chrome/', 'Chrome'],
  ['Safari/', 'Safari'],
] as const

const SYSTEMS = [
  ['Android', 'Android'],
  ['iPhone', 'iOS'],
  ['iPad', 'iPadOS'],
  ['Windows', 'Windows'],
  ['Mac OS X', 'macOS'],
  ['CrOS', 'ChromeOS'],
  ['Linux', 'Linux'],
] as const

/** A readable device name such as "Chrome on Linux", shown in the Connect list. */
export const describeBrowser = (userAgent: string) => {
  const browser = BROWSERS.find(([token]) => userAgent.includes(token))?.[1]
  const system = SYSTEMS.find(([token]) => userAgent.includes(token))?.[1]
  if (!browser) return 'Web browser'
  return system ? `${browser} on ${system}` : browser
}
