import { inject, Injectable } from '@angular/core'
import { canTakeDownPodcast, type Podcast, PodcastRepository } from '@domain/podcast'
import { ActionNotAllowedError } from '@domain/shared'

export type TakeDownPodcastInput = {
  podcast: Podcast
  reason?: string
}

@Injectable({ providedIn: 'root' })
export class TakeDownPodcastUseCase {
  private readonly podcasts = inject(PodcastRepository)

  /**
   * @throws {ActionNotAllowedError} When the podcast is already taken down.
   */
  async execute({ podcast, reason }: TakeDownPodcastInput): Promise<void> {
    const decision = canTakeDownPodcast(podcast)
    if (!decision.allowed) {
      throw new ActionNotAllowedError(decision.reason)
    }

    await this.podcasts.takeDown({ id: podcast.id, reason })
  }
}
