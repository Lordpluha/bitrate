import { inject, Injectable } from '@angular/core'
import { countByResourceStatus, type ResourceCounts } from '@application/shared'
import { PodcastRepository } from '@domain/podcast'

/** Live and taken-down shows, for the KPI strip above the podcasts list. */
@Injectable({ providedIn: 'root' })
export class GetPodcastStatsUseCase {
  private readonly podcasts = inject(PodcastRepository)

  execute(): Promise<ResourceCounts> {
    return countByResourceStatus((query) => this.podcasts.list(query))
  }
}
