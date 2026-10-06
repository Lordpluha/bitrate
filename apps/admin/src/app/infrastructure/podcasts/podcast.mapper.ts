import type { Podcast, PodcastDetail, PodcastEpisode, PodcastSortField } from '@domain/podcast'
import type { ResourceStatus } from '@domain/shared'
import { API_BASE_URL } from '../http/api.config'
import type {
  PodcastDetailDto,
  PodcastDto,
  PodcastEpisodeDto,
  WirePodcastSortField,
  WirePodcastStatus,
} from './podcast.dto'

/** Podcasts have their own cover bucket; a seeded cover may already be an absolute URL. */
function toCoverUrl(cover: string | null | undefined): string | null {
  if (!cover) return null
  if (/^https?:\/\//.test(cover)) return cover
  return `${API_BASE_URL}/static/podcasts/covers/${encodeURIComponent(cover)}`
}

function toDate(value: string | null | undefined): Date | null {
  return value ? new Date(value) : null
}

/** See `track.mapper.ts`'s `TO_WIRE_SORT`. */
const TO_WIRE_SORT = {
  createdAt: 'createdAt',
  title: 'title',
} as const satisfies Record<PodcastSortField, NonNullable<WirePodcastSortField>>

export function toWirePodcastSort(field: PodcastSortField): NonNullable<WirePodcastSortField> {
  return TO_WIRE_SORT[field]
}

/** See `artist.mapper.ts`'s `TO_WIRE_STATUS` — spelled out so a dropped member fails to compile. */
const TO_WIRE_STATUS = {
  active: 'active',
  deactivated: 'deactivated',
  all: 'all',
} as const satisfies Record<ResourceStatus, NonNullable<WirePodcastStatus>>

export function toWirePodcastStatus(status: ResourceStatus): NonNullable<WirePodcastStatus> {
  return TO_WIRE_STATUS[status]
}

export function toPodcast(dto: PodcastDto): Podcast {
  return {
    id: dto.id,
    title: dto.title,
    publisher: dto.publisher,
    coverUrl: toCoverUrl(dto.cover),
    language: dto.language ?? null,
    explicit: dto.explicit,
    episodeCount: dto.episodeCount,
    takenDownAt: toDate(dto.deletedAt),
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
  }
}

function toEpisode(dto: PodcastEpisodeDto): PodcastEpisode {
  return {
    id: dto.id,
    podcastId: dto.podcastId,
    title: dto.title,
    durationSeconds: dto.duration ?? null,
    releaseDate: toDate(dto.releaseDate),
    explicit: dto.explicit,
    takenDownAt: toDate(dto.deletedAt),
  }
}

export function toPodcastDetail(dto: PodcastDetailDto): PodcastDetail {
  return {
    ...toPodcast(dto),
    description: dto.description ?? null,
    episodes: dto.episodes.map(toEpisode),
  }
}
