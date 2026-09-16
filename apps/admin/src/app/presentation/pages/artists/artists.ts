import { DatePipe } from '@angular/common'
import { Component, effect, inject, signal } from '@angular/core'
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop'
import {
  DeactivateArtistUseCase,
  ListArtistsUseCase,
  ToggleArtistVerificationUseCase,
} from '@application/artists'
import { SessionStore } from '@application/session'
import type { Artist } from '@domain/artist'
import { CollectionStatus, Paginator } from '@presentation/components'
import { bindQueryState, createCollection, type TriState } from '@presentation/state'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmInputImports } from '@spartan-ng/helm/input'
import { HlmTableImports } from '@spartan-ng/helm/table'
import { debounceTime, skip } from 'rxjs'
import { artistsQueryCodec } from './artists.query'

/** How long to wait after the last keystroke before a text filter reaches the URL. */
const SEARCH_DEBOUNCE_MS = 300

@Component({
  selector: 'app-artists',
  imports: [
    DatePipe,
    CollectionStatus,
    Paginator,
    HlmBadgeImports,
    HlmButtonImports,
    HlmInputImports,
    HlmTableImports,
  ],
  templateUrl: './artists.html',
})
export class ArtistsPage {
  private readonly listArtists = inject(ListArtistsUseCase)
  private readonly toggleVerificationUseCase = inject(ToggleArtistVerificationUseCase)
  private readonly deactivateArtist = inject(DeactivateArtistUseCase)

  protected readonly canVerify = inject(SessionStore).can('artists:verify')
  protected readonly canDelete = inject(SessionStore).can('artists:delete')

  protected readonly query = bindQueryState({ codec: artistsQueryCodec })
  protected readonly draft = signal(this.query.state().query)
  protected readonly busyId = signal<string | null>(null)

  protected readonly collection = createCollection<Artist>({
    errorMessage: 'Could not load artists.',
    load: (page) =>
      this.listArtists.execute({
        page,
        filter: {
          query: this.query.state().query || undefined,
          verified:
            this.query.state().verified === 'all'
              ? undefined
              : this.query.state().verified === 'verified',
        },
      }),
  })

  constructor() {
    effect(() => {
      const { page } = this.query.state()
      void this.collection.show(page)
    })

    /** Keeps the box in sync with the URL, e.g. after back/forward changes the filter. */
    effect(() => {
      const { query: urlQuery } = this.query.state()
      this.draft.set(urlQuery)
    })

    toObservable(this.draft)
      .pipe(debounceTime(SEARCH_DEBOUNCE_MS), skip(1), takeUntilDestroyed())
      .subscribe((value) => this.query.patch({ query: value, page: 1 }, { replaceUrl: true }))
  }

  protected applyFilters(): void {
    this.query.patch({ query: this.draft(), page: 1 })
  }

  protected setVerifiedFilter(value: TriState): void {
    this.query.patch({ verified: value, page: 1 })
  }

  protected goToPage(page: number): void {
    this.query.patch({ page })
  }

  protected async toggleVerification(artist: Artist): Promise<void> {
    this.busyId.set(artist.id)
    try {
      await this.toggleVerificationUseCase.execute(artist)
      await this.collection.reload()
    } catch {
      this.collection.fail(`Could not change verification for ${artist.username}.`)
    } finally {
      this.busyId.set(null)
    }
  }

  protected async remove(artist: Artist): Promise<void> {
    this.busyId.set(artist.id)
    try {
      await this.deactivateArtist.execute(artist)
      await this.collection.reload()
    } catch {
      this.collection.fail(`Could not deactivate ${artist.username}.`)
    } finally {
      this.busyId.set(null)
    }
  }
}
