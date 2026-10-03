import { inject, Injectable } from '@angular/core'
import { type Album, AlbumRepository, canTakeDownAlbum } from '@domain/album'
import { ActionNotAllowedError } from '@domain/shared'

export type TakeDownAlbumInput = {
  album: Album
  reason?: string
}

@Injectable({ providedIn: 'root' })
export class TakeDownAlbumUseCase {
  private readonly albums = inject(AlbumRepository)

  /**
   * @throws {ActionNotAllowedError} When the album is already taken down.
   */
  async execute({ album, reason }: TakeDownAlbumInput): Promise<void> {
    const decision = canTakeDownAlbum(album)
    if (!decision.allowed) {
      throw new ActionNotAllowedError(decision.reason)
    }

    await this.albums.takeDown({ id: album.id, reason })
  }
}
