import { inject, Injectable } from '@angular/core'
import { type Artist, ArtistRepository, isArtistActive } from '@domain/artist'
import { ActionNotAllowedError } from '@domain/shared'

@Injectable({ providedIn: 'root' })
export class DeactivateArtistUseCase {
  private readonly artists = inject(ArtistRepository)

  /**
   * @throws {ActionNotAllowedError} When the account is already deactivated.
   */
  async execute(artist: Artist): Promise<void> {
    if (!isArtistActive(artist)) {
      throw new ActionNotAllowedError(`${artist.username} is already deactivated.`)
    }

    await this.artists.deactivate(artist.id)
  }
}
