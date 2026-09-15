import { inject, Injectable } from '@angular/core'
import { type Artist, type ArtistFilter, ArtistRepository } from '@domain/artist'
import { DEFAULT_PAGE_SIZE, type Page } from '@domain/shared'

export type ListArtistsInput = {
  page: number
  filter?: ArtistFilter
}

/**
 * Use cases are `@Injectable` so Angular wires them, which is the one concession this layer makes
 * to the framework. It depends on the port, never on the HTTP adapter behind it.
 */
@Injectable({ providedIn: 'root' })
export class ListArtistsUseCase {
  private readonly artists = inject(ArtistRepository)

  execute({ page, filter = {} }: ListArtistsInput): Promise<Page<Artist>> {
    return this.artists.list({ page, limit: DEFAULT_PAGE_SIZE, filter })
  }
}
