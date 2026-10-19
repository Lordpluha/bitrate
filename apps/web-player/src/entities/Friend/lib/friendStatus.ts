import { formatRelativeTime } from '@shared/utils/formatRelativeTime'
import type { FriendPresence } from '@/entities/Friend/api/client/friends.schemas'

type PresenceLabelInput = {
  now?: Date
  presence: FriendPresence
}

/** The Friend Row's status line: what they play, Online, Away · 12 min or Last seen …. */
export const getPresenceLabel = ({
  now = new Date(),
  presence: { lastActiveAt, nowPlaying, status },
}: PresenceLabelInput) => {
  if (nowPlaying)
    return `Listening to ${nowPlaying.title} · ${nowPlaying.artist.username}`
  if (status === 'online') return 'Online'
  if (!lastActiveAt) return 'Offline'
  if (status === 'away') {
    const minutes = Math.max(
      1,
      Math.floor((now.getTime() - lastActiveAt.getTime()) / 60_000),
    )
    return `Away · ${minutes} min`
  }
  return `Last seen ${formatRelativeTime({ date: lastActiveAt, now })}`
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
