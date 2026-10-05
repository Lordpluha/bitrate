import { inject, Injectable } from '@angular/core'
import { type Podcast, type PodcastFilter, PodcastRepository } from '@domain/podcast'
import { DEFAULT_PAGE_SIZE, type Page } from '@domain/shared'

export type ListPodcastsInput = {
  page: number
  filter?: PodcastFilter
}

@Injectable({ providedIn: 'root' })
export class ListPodcastsUseCase {
  private readonly podcasts = inject(PodcastRepository)

  execute({ page, filter = {} }: ListPodcastsInput): Promise<Page<Podcast>> {
    return this.podcasts.list({ page, limit: DEFAULT_PAGE_SIZE, filter })
  }
}
