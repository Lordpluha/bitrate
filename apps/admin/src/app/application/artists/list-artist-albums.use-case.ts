import { inject, Injectable } from '@angular/core'
import { type ArtistAlbum, ArtistRepository } from '@domain/artist'
import type { Page } from '@domain/shared'

export type ListArtistAlbumsInput = {
  artistId: string
  page: number
}

@Injectable({ providedIn: 'root' })
export class ListArtistAlbumsUseCase {
  private readonly artists = inject(ArtistRepository)

  execute({ artistId, page }: ListArtistAlbumsInput): Promise<Page<ArtistAlbum>> {
    return this.artists.listAlbums(artistId, page)
  }
}
