import { DatePipe } from '@angular/common'
import { Component, inject, signal } from '@angular/core'
import {
  DeactivateArtistUseCase,
  ListArtistsUseCase,
  ToggleArtistVerificationUseCase,
} from '@application/artists'
import type { Artist } from '@domain/artist'
import { CollectionStatus, Paginator } from '@presentation/components'
import { createCollection } from '@presentation/state'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmInputImports } from '@spartan-ng/helm/input'
import { HlmTableImports } from '@spartan-ng/helm/table'

type VerifiedFilter = 'all' | 'verified' | 'unverified'

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

  protected readonly query = signal('')
  protected readonly verified = signal<VerifiedFilter>('all')
  protected readonly busyId = signal<string | null>(null)

  protected readonly collection = createCollection<Artist>({
    errorMessage: 'Could not load artists.',
    load: (page) =>
      this.listArtists.execute({
        page,
        filter: {
          query: this.query() || undefined,
          verified: this.verified() === 'all' ? undefined : this.verified() === 'verified',
        },
      }),
  })

  constructor() {
    void this.collection.restart()
  }

  protected async applyFilters(): Promise<void> {
    await this.collection.restart()
  }

  protected async setVerifiedFilter(value: VerifiedFilter): Promise<void> {
    this.verified.set(value)
    await this.collection.restart()
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
