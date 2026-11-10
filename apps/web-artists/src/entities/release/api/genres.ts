import { clientFetchClient } from '@shared/api/fetchClient'
import { writeSignal } from '@shared/api/writeTimeout'
import { messageKey } from '@shared/i18n'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { genreOptionSchema } from '../model/genre'
import { releaseSummarySchema } from '../model/release.schema'
import { advancedRelease, guardedWrite } from './guardedWrite'
import { useReleaseWrite } from './useReleaseRights'

/** Admins edit the catalogue rarely; one read serves every dialog for a while. */
const GENRES_STALE_MS = 10 * 60_000

const genresKey = ['genres'] as const
const catalogueSchema = z.array(genreOptionSchema)

export function useGenres() {
  return useQuery({
    queryKey: genresKey,
    queryFn: ({ signal }) => getGenres(signal),
    staleTime: GENRES_STALE_MS,
    retry: false,
  })
}

async function getGenres(signal: AbortSignal) {
  const result = await clientFetchClient.GET('/api/v1/artists/me/genres', {
    signal,
  })
  const parsed = catalogueSchema.safeParse(result.data)
  if (!result.response.ok || !parsed.success)
    throw new Error(messageKey('media.genres.loadFailed'))
  return parsed.data
}

const savedGenresSchema = z.object({
  release: releaseSummarySchema,
  track: z.object({ id: z.uuid(), genres: z.array(genreOptionSchema) }),
})

export interface TrackGenresRequest {
  id: string
  trackId: string
  genreIds: string[]
  expectedUpdatedAt: string
}

/** Replaces a recording's genres; confirmed only when the API echoes exactly that set. */
export function saveTrackGenres({
  id,
  trackId,
  genreIds,
  expectedUpdatedAt,
}: TrackGenresRequest) {
  return guardedWrite(
    () =>
      clientFetchClient.PATCH(
        '/api/v1/artists/me/releases/{id}/tracks/{trackId}',
        {
          params: { path: { id, trackId } },
          body: { genreIds, expectedUpdatedAt },
          signal: writeSignal(),
        },
      ),
    (data) => {
      const parsed = savedGenresSchema.safeParse(data)
      if (
        !parsed.success ||
        parsed.data.track.id !== trackId ||
        !advancedRelease(parsed.data.release, id, expectedUpdatedAt)
      )
        return undefined
      const saved = new Set(parsed.data.track.genres.map((genre) => genre.id))
      return saved.size === genreIds.length &&
        genreIds.every((genreId) => saved.has(genreId))
        ? parsed.data
        : undefined
    },
    {
      invalid: messageKey('release.error.genresInvalid'),
      unconfirmed: messageKey('release.error.genresUnconfirmed'),
    },
  )
}

export const useSaveTrackGenres = (artistId: string) =>
  useReleaseWrite(artistId, saveTrackGenres)
