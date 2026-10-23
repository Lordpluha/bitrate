import { TranslocoPipe } from '@jsverse/transloco'
import { ALBUM_TYPE_KEY } from '@presentation/pages/albums/album-labels'
import { ChangeDetectionStrategy, Component, effect, inject, input, untracked } from '@angular/core'
import { ListArtistAlbumsUseCase } from '@application/artists'
import type { ArtistAlbum } from '@domain/artist'
import { CollectionStatus, Paginator } from '@presentation/components'
import { LocalizedDatePipe } from '@presentation/pipes'
import { createCollection } from '@presentation/state'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmTableImports } from '@spartan-ng/helm/table'

/**
 * The "Albums" section on `/artists/:id`. Page state is local to this component, not URL-bound
 * — see `processing-history.ts`'s same note, which this mirrors. There is no artist↔playlist
 * relation in this schema — `Playlist` belongs to `User` — so this section covers albums only.
 */
@Component({
  selector: 'app-artist-albums',
  imports: [
    CollectionStatus,
    HlmBadgeImports,
    HlmTableImports,
    LocalizedDatePipe,
    Paginator,
    TranslocoPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './artist-albums.html',
})
export class ArtistAlbums {
  private readonly listAlbums = inject(ListArtistAlbumsUseCase)

  readonly artistId = input.required<string>()
  protected readonly typeKey = ALBUM_TYPE_KEY

  protected readonly collection = createCollection<ArtistAlbum>({
    errorMessage: 'artist.albums.error',
    load: (page) => this.listAlbums.execute({ artistId: this.artistId(), page }),
  })

  /** See `processing-history.ts`: a required signal input isn't set yet in the constructor. */
  constructor() {
    effect(() => {
      this.artistId()
      untracked(() => void this.collection.restart())
    })
  }

  protected goToPage(page: number): void {
    void this.collection.goTo(page)
  }
}
