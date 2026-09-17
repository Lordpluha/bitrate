import type { ResourceStatus } from '../shared/resource-status'
import type { Sort } from '../shared/sort'

/** A listener account. Named `User` because that is what the API and the database call it. */
export type User = {
  id: string
  username: string
  email: string
  emailVerifiedAt: Date | null
  createdAt: Date
  /** See `Artist.deactivatedAt` — same rule, same reason for the name. */
  deactivatedAt: Date | null
}

/** Activity counts shown on the listener detail page. */
export type UserCounts = {
  playlists: number
  likedTracks: number
  listeningHistory: number
  reportsFiled: number
  activeSessions: number
}

/** A listener's full detail view — the directory row plus activity counts. */
export type UserDetail = User & { counts: UserCounts }

/** The columns the listener list can be ordered by. */
export type UserSortField = 'username' | 'email' | 'createdAt'

export type UserFilter = {
  query?: string
  status?: ResourceStatus
  sort?: Sort<UserSortField>
}

export function isUserActive(user: User): boolean {
  return user.deactivatedAt === null
}
