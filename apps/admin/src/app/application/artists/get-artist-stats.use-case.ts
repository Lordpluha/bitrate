import { inject, Injectable } from '@angular/core'
import { countByResourceStatus, type ResourceCounts } from '@application/shared'
import { ArtistRepository } from '@domain/artist'

/** The figures above the artists list: active and deactivated, and how verification stands. */
export type ArtistStats = ResourceCounts & {
  /** Active artists with the verified badge. */
  verified: number
  /** Active artists still waiting for it. */
  unverified: number
}

/** Reads the artists KPIs from the list endpoint — one row per filter, page total only. */
@Injectable({ providedIn: 'root' })
export class GetArtistStatsUseCase {
  private readonly artists = inject(ArtistRepository)

  async execute(): Promise<ArtistStats> {
    const [counts, verified, unverified] = await Promise.all([
      countByResourceStatus((query) => this.artists.list(query)),
      this.artists.list({ page: 1, limit: 1, filter: { status: 'active', verified: true } }),
      this.artists.list({ page: 1, limit: 1, filter: { status: 'active', verified: false } }),
    ])
    return { ...counts, verified: verified.total, unverified: unverified.total }
  }
}
