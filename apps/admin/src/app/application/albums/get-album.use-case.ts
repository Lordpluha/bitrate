import { inject, Injectable } from '@angular/core'
import { type AlbumDetail, AlbumRepository } from '@domain/album'

@Injectable({ providedIn: 'root' })
export class GetAlbumUseCase {
  private readonly albums = inject(AlbumRepository)

  execute(id: string): Promise<AlbumDetail> {
    return this.albums.getById(id)
  }
}
