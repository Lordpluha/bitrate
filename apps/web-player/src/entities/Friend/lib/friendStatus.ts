import type { I18n } from '@shared/i18n'
import { formatRelativeTime } from '@shared/utils/formatRelativeTime'
import type { FriendPresence } from '@/entities/Friend/api/client/friends.schemas'

type PresenceLabelInput = {
  i18n: I18n
  now?: Date
  presence: FriendPresence
}

/** The Friend Row's status line: what they play, Online, Away · 12 min or Last seen …. */
export const getPresenceLabel = ({
  i18n: { locale, t },
  now = new Date(),
  presence: { lastActiveAt, nowPlaying, status },
}: PresenceLabelInput) => {
  if (nowPlaying)
    return t('presence.listeningTo', {
      artist: nowPlaying.artist.username,
      title: nowPlaying.title,
    })
  if (status === 'online') return t('presence.online')
  if (!lastActiveAt) return t('presence.offline')
  if (status === 'away') {
    const minutes = Math.max(
      1,
      Math.floor((now.getTime() - lastActiveAt.getTime()) / 60_000),
    )
    return t('presence.away', { minutes })
  }
  return t('presence.lastSeen', {
    time: formatRelativeTime({ date: lastActiveAt, locale, now }),
  })
}

/** Where the caller stands with someone: what their row's action should be. */
export type FriendRelation =
  | { kind: 'friends' }
  | { kind: 'incoming'; requestId: string }
  | { kind: 'none' }
  | { kind: 'outgoing'; requestId: string }

type PendingRequest = { id: string; user: { id: string } }

type FriendRelationInput = {
  friendIds: ReadonlySet<string>
  incoming: readonly PendingRequest[]
  outgoing: readonly PendingRequest[]
  userId: string
}

export const getFriendRelation = ({
  friendIds,
  incoming,
  outgoing,
  userId,
}: FriendRelationInput): FriendRelation => {
  if (friendIds.has(userId)) return { kind: 'friends' }
  const sent = outgoing.find(({ user }) => user.id === userId)
  if (sent) return { kind: 'outgoing', requestId: sent.id }
  const received = incoming.find(({ user }) => user.id === userId)
  if (received) return { kind: 'incoming', requestId: received.id }
  return { kind: 'none' }
}
