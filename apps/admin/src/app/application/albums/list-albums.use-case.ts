import { inject, Injectable } from '@angular/core'
import { type Album, type AlbumFilter, AlbumRepository } from '@domain/album'
import { DEFAULT_PAGE_SIZE, type Page } from '@domain/shared'

export type ListAlbumsInput = {
  page: number
  filter?: AlbumFilter
}

@Injectable({ providedIn: 'root' })
export class ListAlbumsUseCase {
  private readonly albums = inject(AlbumRepository)

  execute({ page, filter = {} }: ListAlbumsInput): Promise<Page<Album>> {
    return this.albums.list({ page, limit: DEFAULT_PAGE_SIZE, filter })
  }
}
