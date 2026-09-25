import { inject, Injectable } from '@angular/core'
import { type Artist, ArtistRepository, canRestoreArtist } from '@domain/artist'
import { ActionNotAllowedError } from '@domain/shared'

export type RestoreArtistInput = {
  artist: Artist
  reason?: string
}

@Injectable({ providedIn: 'root' })
export class RestoreArtistUseCase {
  private readonly artists = inject(ArtistRepository)

  /**
   * @throws {ActionNotAllowedError} When the account is not deactivated.
   */
  async execute({ artist, reason }: RestoreArtistInput): Promise<void> {
    const decision = canRestoreArtist(artist)
    if (!decision.allowed) {
      throw new ActionNotAllowedError(decision.reason)
    }

    await this.artists.restore({ id: artist.id, reason })
  }
}
