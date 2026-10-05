import type { ApiPaths, ApiSchemas } from '@bitrate/contracts'
import { z } from 'zod'

/** See `WireArtistSortField` — read from the operation, not an entity field. */
export type WirePodcastSortField = NonNullable<
  ApiPaths['/api/v1/admin/podcasts']['get']['parameters']['query']
>['sort']

/** The `status` (take-down) query parameter's own union, read from the operation directly. */
export type WirePodcastStatus = NonNullable<
  ApiPaths['/api/v1/admin/podcasts']['get']['parameters']['query']
>['status']

type ContractPodcast = Pick<
  ApiSchemas['AdminPodcastEntity'],
  | 'id'
  | 'title'
  | 'publisher'
  | 'cover'
  | 'language'
  | 'explicit'
  | 'episodeCount'
  | 'deletedAt'
  | 'createdAt'
  | 'updatedAt'
>

/** The contract marks these fields optional-and-nullable, so absent and `null` both read as none. */
const podcastDto = z.object({
  id: z.uuid(),
  title: z.string(),
  publisher: z.string(),
  cover: z.string().nullish(),
  language: z.string().nullish(),
  explicit: z.boolean(),
  episodeCount: z.number().int(),
  deletedAt: z.iso.datetime().nullish(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
}) satisfies z.ZodType<ContractPodcast>

export type PodcastDto = z.infer<typeof podcastDto>

type ContractPodcastPage = Omit<ApiSchemas['PaginatedAdminPodcastsEntity'], 'data'> & {
  data: ContractPodcast[]
}

export const podcastPageDto = z.object({
  data: z.array(podcastDto),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
}) satisfies z.ZodType<ContractPodcastPage>

type ContractPodcastEpisode = ApiSchemas['AdminPodcastEpisodeEntity']

export const podcastEpisodeDto = z.object({
  id: z.uuid(),
  podcastId: z.uuid(),
  title: z.string(),
  duration: z.number().int().nullish(),
  releaseDate: z.iso.datetime().nullish(),
  explicit: z.boolean(),
  deletedAt: z.iso.datetime().nullish(),
}) satisfies z.ZodType<ContractPodcastEpisode>

export type PodcastEpisodeDto = z.infer<typeof podcastEpisodeDto>

type ContractPodcastDetail = ContractPodcast &
  Pick<ApiSchemas['AdminPodcastDetailEntity'], 'description'> & {
    episodes: ContractPodcastEpisode[]
  }

export const podcastDetailDto = podcastDto.extend({
  description: z.string().nullish(),
  episodes: z.array(podcastEpisodeDto),
}) satisfies z.ZodType<ContractPodcastDetail>

export type PodcastDetailDto = z.infer<typeof podcastDetailDto>
