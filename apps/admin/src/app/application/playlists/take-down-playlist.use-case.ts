import { inject, Injectable } from '@angular/core'
import { type Playlist, PlaylistRepository, canTakeDownPlaylist } from '@domain/playlist'
import { ActionNotAllowedError } from '@domain/shared'

export type TakeDownPlaylistInput = {
  playlist: Playlist
  reason?: string
}

@Injectable({ providedIn: 'root' })
export class TakeDownPlaylistUseCase {
  private readonly playlists = inject(PlaylistRepository)

  /**
   * @throws {ActionNotAllowedError} When the playlist is already taken down.
   */
  async execute({ playlist, reason }: TakeDownPlaylistInput): Promise<void> {
    const decision = canTakeDownPlaylist(playlist)
    if (!decision.allowed) {
      throw new ActionNotAllowedError(decision.reason)
    }

    await this.playlists.takeDown({ id: playlist.id, reason })
  }
}
