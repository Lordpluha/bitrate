import { inject, Injectable } from '@angular/core'
import { countByResourceStatus, type ResourceCounts } from '@application/shared'
import { AlbumRepository } from '@domain/album'

/** Live and taken-down albums, for the KPI strip above the albums list. */
@Injectable({ providedIn: 'root' })
export class GetAlbumStatsUseCase {
  private readonly albums = inject(AlbumRepository)

  execute(): Promise<ResourceCounts> {
    return countByResourceStatus((query) => this.albums.list(query))
  }
}
