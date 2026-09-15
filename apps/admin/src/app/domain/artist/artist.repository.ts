import type { Page, PageRequest } from '../shared/page'
import type { Artist, ArtistFilter } from './artist'

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
  abstract setVerification(input: SetArtistVerificationInput): Promise<Artist>
  abstract deactivate(id: string): Promise<void>
}
