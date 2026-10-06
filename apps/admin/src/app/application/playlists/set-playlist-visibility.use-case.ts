import { inject, Injectable } from '@angular/core'
import {
  canHidePlaylist,
  canUnhidePlaylist,
  type Playlist,
  PlaylistRepository,
} from '@domain/playlist'
import { ActionNotAllowedError } from '@domain/shared'

export type SetPlaylistVisibilityInput = {
  playlist: Playlist
  /** `false` hides the playlist; `true` un-hides one an operator hid. */
  isPublic: boolean
  reason?: string
}

@Injectable({ providedIn: 'root' })
export class SetPlaylistVisibilityUseCase {
  private readonly playlists = inject(PlaylistRepository)

  /**
   * @throws {ActionNotAllowedError} When the playlist is already in the requested visibility.
   */
  async execute({ playlist, isPublic, reason }: SetPlaylistVisibilityInput): Promise<void> {
    const decision = isPublic ? canUnhidePlaylist(playlist) : canHidePlaylist(playlist)
    if (!decision.allowed) {
      throw new ActionNotAllowedError(decision.reason)
    }

    await this.playlists.setVisibility({ id: playlist.id, isPublic, reason })
  }
}
