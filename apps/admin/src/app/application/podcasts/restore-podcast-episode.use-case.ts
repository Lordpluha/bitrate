import { inject, Injectable } from '@angular/core'
import { canRestoreEpisode, PodcastRepository, type PodcastEpisode } from '@domain/podcast'
import { ActionNotAllowedError } from '@domain/shared'

export type RestorePodcastEpisodeInput = {
  episode: PodcastEpisode
  reason?: string
}

@Injectable({ providedIn: 'root' })
export class RestorePodcastEpisodeUseCase {
  private readonly podcasts = inject(PodcastRepository)

  /**
   * @throws {ActionNotAllowedError} When the episode is not taken down.
   */
  async execute({ episode, reason }: RestorePodcastEpisodeInput): Promise<void> {
    const decision = canRestoreEpisode(episode)
    if (!decision.allowed) {
      throw new ActionNotAllowedError(decision.reason)
    }

    await this.podcasts.restoreEpisode({
      podcastId: episode.podcastId,
      episodeId: episode.id,
      reason,
    })
  }
}
