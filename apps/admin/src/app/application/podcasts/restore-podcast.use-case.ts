import { inject, Injectable } from '@angular/core'
import { canRestorePodcast, type Podcast, PodcastRepository } from '@domain/podcast'
import { ActionNotAllowedError } from '@domain/shared'

export type RestorePodcastInput = {
  podcast: Podcast
  reason?: string
}

@Injectable({ providedIn: 'root' })
export class RestorePodcastUseCase {
  private readonly podcasts = inject(PodcastRepository)

  /**
   * @throws {ActionNotAllowedError} When the podcast is not taken down.
   */
  async execute({ podcast, reason }: RestorePodcastInput): Promise<void> {
    const decision = canRestorePodcast(podcast)
    if (!decision.allowed) {
      throw new ActionNotAllowedError(decision.reason)
    }

    await this.podcasts.restore({ id: podcast.id, reason })
  }
}
