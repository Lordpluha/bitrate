import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import {
  type EpisodeTakeDownInput,
  type ListPodcastsQuery,
  type Podcast,
  type PodcastDetail,
  PodcastRepository,
} from '@domain/podcast'
import type { Page, TakeDownInput } from '@domain/shared'
import { firstValueFrom } from 'rxjs'
import { ADMIN_API } from '../http/api.config'
import { buildTakeDownBody } from '../http/take-down.dto'
import { toResourceWriteError } from '../http/to-resource-write-error'
import { fetchPage } from '../http/wire-page'
import { podcastDetailDto, podcastPageDto } from './podcast.dto'
import {
  toPodcast,
  toPodcastDetail,
  toWirePodcastSort,
  toWirePodcastStatus,
} from './podcast.mapper'

@Injectable()
export class HttpPodcastRepository extends PodcastRepository {
  private readonly http = inject(HttpClient)
  private readonly base = `${ADMIN_API}/podcasts`

  override list({ page, limit, filter }: ListPodcastsQuery): Promise<Page<Podcast>> {
    return fetchPage({
      http: this.http,
      url: this.base,
      page,
      limit,
      filters: {
        q: filter.query,
        status: filter.status === undefined ? undefined : toWirePodcastStatus(filter.status),
        sort: filter.sort ? toWirePodcastSort(filter.sort.field) : undefined,
        order: filter.sort?.direction,
      },
      schema: podcastPageDto,
      toDomain: toPodcast,
    })
  }

  override async getById(id: string): Promise<PodcastDetail> {
    const response = await firstValueFrom(this.http.get<unknown>(`${this.base}/${id}`))

    return toPodcastDetail(podcastDetailDto.parse(response))
  }

  override async takeDown({ id, reason }: TakeDownInput): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete(`${this.base}/${id}`, { body: buildTakeDownBody(reason) }),
      )
    } catch (error) {
      throw toResourceWriteError(error, 'deactivate')
    }
  }

  override async restore({ id, reason }: TakeDownInput): Promise<void> {
    try {
      await firstValueFrom(this.http.post(`${this.base}/${id}/restore`, buildTakeDownBody(reason)))
    } catch (error) {
      throw toResourceWriteError(error, 'restore')
    }
  }

  override async takeDownEpisode({
    podcastId,
    episodeId,
    reason,
  }: EpisodeTakeDownInput): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete(`${this.base}/${podcastId}/episodes/${episodeId}`, {
          body: buildTakeDownBody(reason),
        }),
      )
    } catch (error) {
      throw toResourceWriteError(error, 'deactivate')
    }
  }

  override async restoreEpisode({
    podcastId,
    episodeId,
    reason,
  }: EpisodeTakeDownInput): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(
          `${this.base}/${podcastId}/episodes/${episodeId}/restore`,
          buildTakeDownBody(reason),
        ),
      )
    } catch (error) {
      throw toResourceWriteError(error, 'restore')
    }
  }
}
