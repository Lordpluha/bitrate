import { inject, Injectable } from '@angular/core'
import { type PlaylistDetail, PlaylistRepository } from '@domain/playlist'

@Injectable({ providedIn: 'root' })
export class GetPlaylistUseCase {
  private readonly playlists = inject(PlaylistRepository)

  execute(id: string): Promise<PlaylistDetail> {
    return this.playlists.getById(id)
  }
}
