import { inject, Injectable } from '@angular/core'
import { type Artist, ArtistRepository, canRevokeArtistSessions } from '@domain/artist'
import { ActionNotAllowedError } from '@domain/shared'

export type RevokeArtistSessionsInput = {
  artist: Artist
  reason?: string
}

@Injectable({ providedIn: 'root' })
export class RevokeArtistSessionsUseCase {
  private readonly artists = inject(ArtistRepository)

  /**
   * @throws {ActionNotAllowedError} When the account is already deactivated.
   * @returns How many sessions were revoked.
   */
  async execute({ artist, reason }: RevokeArtistSessionsInput): Promise<number> {
    const decision = canRevokeArtistSessions(artist)
    if (!decision.allowed) {
      throw new ActionNotAllowedError(decision.reason)
    }

    return this.artists.revokeSessions({ id: artist.id, reason })
  }
}
