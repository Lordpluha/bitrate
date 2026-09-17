import type { Sort } from '../shared/sort'

/** An artist account as the operator panel understands it. */
export type Artist = {
  id: string
  username: string
  email: string
  verified: boolean
  monthlyListeners: number
  country: string | null
  createdAt: Date
  /**
   * Set when an operator deactivated the account. Named for what the panel does rather than for
   * the column behind it: deactivating is reversible and erases no catalog.
   */
  deactivatedAt: Date | null
}

/**
 * The columns the artist list can be ordered by. Bound to the contract's `sort` query
 * parameter in `infrastructure/artists/artist.mapper.ts` through an exhaustive record.
 */
export type ArtistSortField = 'username' | 'email' | 'createdAt' | 'monthlyListeners'

/** What an operator can narrow the artist list by. */
export type ArtistFilter = {
  query?: string
  verified?: boolean
  sort?: Sort<ArtistSortField>
}

export function isArtistActive(artist: Artist): boolean {
  return artist.deactivatedAt === null
}

/**
 * Verification is a toggle, so the next state is the only thing a caller has to decide — and it
 * is decided here rather than at each button.
 */
export function nextVerification(artist: Artist): boolean {
  return !artist.verified
}
