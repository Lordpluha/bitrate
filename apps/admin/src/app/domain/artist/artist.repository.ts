import type { Page, PageRequest, TakeDownInput } from '../shared'
import type { Artist, ArtistDetail, ArtistFilter } from './artist'
import type { ArtistAlbum, ArtistTrack } from './artist-publications'

export type ListArtistsQuery = PageRequest & {
  filter: ArtistFilter
}

export type SetArtistVerificationInput = {
  id: string
  verified: boolean
}

/**
 * The port the artist screens talk to.
 *
 * An abstract class rather than an `InjectionToken`, so it is both the compile-time type and the
 * runtime DI token while this layer stays free of `@angular/core` — the dependency rule this
 * whole tree exists to hold.
 */
export abstract class ArtistRepository {
  abstract list(query: ListArtistsQuery): Promise<Page<Artist>>
  abstract getById(id: string): Promise<ArtistDetail>
  abstract setVerification(input: SetArtistVerificationInput): Promise<Artist>
  /** Soft-deletes the account — the API also revokes its sessions. */
  abstract deactivate(input: TakeDownInput): Promise<void>
  abstract restore(input: TakeDownInput): Promise<void>
  /** @returns How many sessions were revoked. */
  abstract revokeSessions(input: TakeDownInput): Promise<number>
  /** Newest first. */
  abstract listTracks(artistId: string, page: number): Promise<Page<ArtistTrack>>
  /** Newest first. */
  abstract listAlbums(artistId: string, page: number): Promise<Page<ArtistAlbum>>
}
