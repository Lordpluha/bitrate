import { inject, Injectable } from '@angular/core'
import { type Playlist, PlaylistRepository, canRestorePlaylist } from '@domain/playlist'
import { ActionNotAllowedError } from '@domain/shared'

export type RestorePlaylistInput = {
  playlist: Playlist
  reason?: string
}

@Injectable({ providedIn: 'root' })
export class RestorePlaylistUseCase {
  private readonly playlists = inject(PlaylistRepository)

  /**
   * @throws {ActionNotAllowedError} When the playlist is not taken down.
   */
  async execute({ playlist, reason }: RestorePlaylistInput): Promise<void> {
    const decision = canRestorePlaylist(playlist)
    if (!decision.allowed) {
      throw new ActionNotAllowedError(decision.reason)
    }

    await this.playlists.restore({ id: playlist.id, reason })
  }
}
