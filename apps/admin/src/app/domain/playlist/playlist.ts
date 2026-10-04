import type { PolicyDecision } from '../shared/policy-decision'
import { POLICY_ALLOWED } from '../shared/policy-decision'
import type { ResourceStatus } from '../shared/resource-status'
import type { Sort } from '../shared/sort'

/** The columns the playlist list can be ordered by; bound to the contract in `playlist.mapper.ts`. */
export type PlaylistSortField = 'createdAt' | 'title'

/** A public playlist as one row of the operator list. */
export type Playlist = {
  id: string
  title: string
  ownerId: string
  ownerUsername: string
  /** `false` once an operator hid it, or its owner made it private. */
  isPublic: boolean
  followersCount: number
  trackCount: number
  /** Set when an operator took the playlist down; independent of {@link Playlist.isPublic}. */
  takenDownAt: Date | null
  createdAt: Date
  updatedAt: Date
}

/** One track on a playlist, as seen from the playlist detail page. */
export type PlaylistTrack = {
  id: string
  title: string
  /** Zero-based position in the playlist. */
  position: number
}

/** A playlist's full detail view: the row, its metadata and its first tracks in order. */
export type PlaylistDetail = Playlist & {
  description: string | null
  collaborative: boolean
  /** Only the first 50; `trackCount` holds the full total. */
  tracks: PlaylistTrack[]
}

/** What an operator can narrow the playlist list by. */
export type PlaylistFilter = {
  query?: string
  status?: ResourceStatus
  ownerId?: string
  sort?: Sort<PlaylistSortField>
}

/** Only what the client can know locally; the API stays the enforcement point on a 409. */
export function canHidePlaylist(playlist: Playlist): PolicyDecision {
  if (!playlist.isPublic) {
    return { allowed: false, reason: `"${playlist.title}" is already hidden.` }
  }

  return POLICY_ALLOWED
}

/**
 * The client cannot tell an operator hide from an owner's own choice of privacy; the API refuses
 * the latter with a 409, so a private playlist is offered here and checked there.
 */
export function canUnhidePlaylist(playlist: Playlist): PolicyDecision {
  if (playlist.isPublic) {
    return { allowed: false, reason: `"${playlist.title}" is already public.` }
  }

  return POLICY_ALLOWED
}

export function canTakeDownPlaylist(playlist: Playlist): PolicyDecision {
  if (playlist.takenDownAt !== null) {
    return { allowed: false, reason: `"${playlist.title}" is already taken down.` }
  }

  return POLICY_ALLOWED
}

export function canRestorePlaylist(playlist: Playlist): PolicyDecision {
  if (playlist.takenDownAt === null) {
    return { allowed: false, reason: `"${playlist.title}" is not taken down.` }
  }

  return POLICY_ALLOWED
}
