import { inject, Injectable } from '@angular/core'
import { countByResourceStatus, type ResourceCounts } from '@application/shared'
import { PlaylistRepository } from '@domain/playlist'

/** Live and taken-down playlists, for the KPI strip above the playlists list. */
@Injectable({ providedIn: 'root' })
export class GetPlaylistStatsUseCase {
  private readonly playlists = inject(PlaylistRepository)

  execute(): Promise<ResourceCounts> {
    return countByResourceStatus((query) => this.playlists.list(query))
  }
}
