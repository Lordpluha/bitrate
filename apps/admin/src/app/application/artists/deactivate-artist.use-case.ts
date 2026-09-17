import { inject, Injectable } from '@angular/core'
import { type Artist, ArtistRepository, canDeactivateArtist } from '@domain/artist'
import { ActionNotAllowedError } from '@domain/shared'

export type DeactivateArtistInput = {
  artist: Artist
  reason?: string
}

@Injectable({ providedIn: 'root' })
export class DeactivateArtistUseCase {
  private readonly artists = inject(ArtistRepository)

  /**
   * @throws {ActionNotAllowedError} When the account is already deactivated.
   */
  async execute({ artist, reason }: DeactivateArtistInput): Promise<void> {
    const decision = canDeactivateArtist(artist)
    if (!decision.allowed) {
      throw new ActionNotAllowedError(decision.reason)
    }

    await this.artists.deactivate({ id: artist.id, reason })
  }
}
