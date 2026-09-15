import { inject, Injectable } from '@angular/core'
import { type Artist, ArtistRepository, nextVerification } from '@domain/artist'

/** Flips verification. Which way it flips is the domain's call, not the button's. */
@Injectable({ providedIn: 'root' })
export class ToggleArtistVerificationUseCase {
  private readonly artists = inject(ArtistRepository)

  execute(artist: Artist): Promise<Artist> {
    return this.artists.setVerification({ id: artist.id, verified: nextVerification(artist) })
  }
}
