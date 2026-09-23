import { ChangeDetectionStrategy, Component, effect, inject, input, untracked } from '@angular/core'
import { RouterLink } from '@angular/router'
import { ListArtistTracksUseCase } from '@application/artists'
import type { ArtistTrack } from '@domain/artist'
import { CollectionStatus, Paginator } from '@presentation/components'
import { LocalizedDatePipe } from '@presentation/pipes'
import { createCollection } from '@presentation/state'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmTableImports } from '@spartan-ng/helm/table'

/**
 * The "Tracks" section on `/artists/:id`. Page state is local to this component, not URL-bound
 * — see `processing-history.ts`'s same note, which this mirrors.
 */
@Component({
  selector: 'app-artist-tracks',
  imports: [
    LocalizedDatePipe,
    RouterLink,
    CollectionStatus,
    Paginator,
    HlmBadgeImports,
    HlmTableImports,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './artist-tracks.html',
})
export class ArtistTracks {
  private readonly listTracks = inject(ListArtistTracksUseCase)

  readonly artistId = input.required<string>()

  protected readonly collection = createCollection<ArtistTrack>({
    errorMessage: 'Could not load tracks.',
    load: (page) => this.listTracks.execute({ artistId: this.artistId(), page }),
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
