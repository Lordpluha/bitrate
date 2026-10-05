import { inject, Injectable } from '@angular/core'
import { canTakeDownEpisode, PodcastRepository, type PodcastEpisode } from '@domain/podcast'
import { ActionNotAllowedError } from '@domain/shared'

export type TakeDownPodcastEpisodeInput = {
  episode: PodcastEpisode
  reason?: string
}

@Injectable({ providedIn: 'root' })
export class TakeDownPodcastEpisodeUseCase {
  private readonly podcasts = inject(PodcastRepository)

  /**
   * @throws {ActionNotAllowedError} When the episode is already taken down.
   */
  async execute({ episode, reason }: TakeDownPodcastEpisodeInput): Promise<void> {
    const decision = canTakeDownEpisode(episode)
    if (!decision.allowed) {
      throw new ActionNotAllowedError(decision.reason)
    }

    await this.podcasts.takeDownEpisode({
      podcastId: episode.podcastId,
      episodeId: episode.id,
      reason,
    })
  }
}
