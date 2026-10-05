import { inject, Injectable } from '@angular/core'
import { type PodcastDetail, PodcastRepository } from '@domain/podcast'

@Injectable({ providedIn: 'root' })
export class GetPodcastUseCase {
  private readonly podcasts = inject(PodcastRepository)

  execute(id: string): Promise<PodcastDetail> {
    return this.podcasts.getById(id)
  }
}
