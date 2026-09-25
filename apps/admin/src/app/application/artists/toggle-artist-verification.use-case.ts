import { inject, Injectable } from '@angular/core'
import {
  type Artist,
  ArtistRepository,
  canChangeVerification,
  nextVerification,
} from '@domain/artist'
import { ActionNotAllowedError } from '@domain/shared'

/** Flips verification. Which way it flips is the domain's call, not the button's. */
@Injectable({ providedIn: 'root' })
export class ToggleArtistVerificationUseCase {
  private readonly artists = inject(ArtistRepository)

  /**
   * @throws {ActionNotAllowedError} When the account is deactivated — the API refuses this with
   * a 409.
   */
  execute(artist: Artist): Promise<Artist> {
    const decision = canChangeVerification(artist)
    if (!decision.allowed) {
      throw new ActionNotAllowedError(decision.reason)
    }

    return this.artists.setVerification({ id: artist.id, verified: nextVerification(artist) })
  }
}
