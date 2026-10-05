import { inject, Injectable } from '@angular/core'
import { type Playlist, type PlaylistFilter, PlaylistRepository } from '@domain/playlist'
import { DEFAULT_PAGE_SIZE, type Page } from '@domain/shared'

export type ListPlaylistsInput = {
  page: number
  filter?: PlaylistFilter
}

@Injectable({ providedIn: 'root' })
export class ListPlaylistsUseCase {
  private readonly playlists = inject(PlaylistRepository)

  execute({ page, filter = {} }: ListPlaylistsInput): Promise<Page<Playlist>> {
    return this.playlists.list({ page, limit: DEFAULT_PAGE_SIZE, filter })
  }
}
