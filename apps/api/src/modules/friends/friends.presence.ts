/** Activity this recent counts as online; a playing client saves its state every 15 seconds. */
const ONLINE_MS = 2 * 60_000
/** Activity this recent counts as away; anything older is offline. */
const AWAY_MS = 15 * 60_000

export type PresenceStatus = 'online' | 'away' | 'offline'

type PresenceInput<TTrack> = {
  /** The latest `lastSeenAt` of the friend's player devices. */
  deviceSeenAt: Date | null
  now: Date
  player: { isPlaying: boolean; track: TTrack | null; updatedAt: Date } | null
  /** `showListeningActivity` is on and no private session is running. */
  sharesListening: boolean
}

export type Presence<TTrack> = {
  lastActiveAt: Date | null
  /** Only while a shared track is playing right now. */
  nowPlaying: TTrack | null
  status: PresenceStatus
}

const latest = (dates: Array<Date | null>) =>
  dates.reduce<Date | null>((max, date) => (date && (!max || date > max) ? date : max), null)

/**
 * A friend's presence from the player data the API already keeps: no separate tracking.
 * Online within 2 minutes of the last player activity, away within 15, offline after.
 */
export const derivePresence = <TTrack>({
  deviceSeenAt,
  now,
  player,
  sharesListening,
}: PresenceInput<TTrack>): Presence<TTrack> => {
  const lastActiveAt = latest([player?.updatedAt ?? null, deviceSeenAt])
  const idleMs = lastActiveAt ? now.getTime() - lastActiveAt.getTime() : Number.POSITIVE_INFINITY
  const status: PresenceStatus =
    idleMs < ONLINE_MS ? 'online' : idleMs < AWAY_MS ? 'away' : 'offline'
  const isListening =
    sharesListening &&
    player?.isPlaying === true &&
    now.getTime() - player.updatedAt.getTime() < ONLINE_MS
  return { lastActiveAt, nowPlaying: isListening ? player.track : null, status }
}
