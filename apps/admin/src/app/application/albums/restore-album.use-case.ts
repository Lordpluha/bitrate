import { inject, Injectable } from '@angular/core'
import { type Album, AlbumRepository, canRestoreAlbum } from '@domain/album'
import { ActionNotAllowedError } from '@domain/shared'

export type RestoreAlbumInput = {
  album: Album
  reason?: string
}

@Injectable({ providedIn: 'root' })
export class RestoreAlbumUseCase {
  private readonly albums = inject(AlbumRepository)

  /**
   * @throws {ActionNotAllowedError} When the album is not taken down.
   */
  async execute({ album, reason }: RestoreAlbumInput): Promise<void> {
    const decision = canRestoreAlbum(album)
    if (!decision.allowed) {
      throw new ActionNotAllowedError(decision.reason)
    }

    await this.albums.restore({ id: album.id, reason })
  }
}
