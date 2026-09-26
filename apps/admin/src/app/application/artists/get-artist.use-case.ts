import { inject, Injectable } from '@angular/core'
import { type ArtistDetail, ArtistRepository } from '@domain/artist'

@Injectable({ providedIn: 'root' })
export class GetArtistUseCase {
  private readonly artists = inject(ArtistRepository)

  execute(id: string): Promise<ArtistDetail> {
    return this.artists.getById(id)
  }
}
