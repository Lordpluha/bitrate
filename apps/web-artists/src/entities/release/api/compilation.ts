import { artistMusicKeys } from '@shared/api/artistMusicKeys'
import { clientFetchClient } from '@shared/api/fetchClient'
import { writeSignal } from '@shared/api/writeTimeout'
import { messageKey } from '@shared/i18n'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { releaseSummarySchema } from '../model/release.schema'
import { advancedRelease, guardedWrite } from './guardedWrite'
import { useReleaseWrite } from './useReleaseRights'

const catalogueSchema = z.object({
  data: z
    .array(
      z.object({
        id: z.uuid(),
        title: z.string(),
        duration: z.number().int().nonnegative().nullable(),
        isrc: z.string().nullable(),
        cover: z.string().nullable(),
      }),
    )
    .max(20),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.literal(20),
})
const addedSchema = z.object({
  release: releaseSummarySchema,
  trackIds: z.array(z.uuid()).min(1).max(50),
})

export function useCompilationCatalogue(
  artistId: string,
  id: string,
  page: number,
  search: string,
) {
  return useQuery({
    queryKey: [
      ...artistMusicKeys.artist(artistId),
      'compilation-catalogue',
      id,
      page,
      search,
    ],
    placeholderData: keepPreviousData,
    retry: false,
    queryFn: async ({ signal }) => {
      const result = await clientFetchClient.GET(
        '/api/v1/artists/me/releases/{id}/catalogue-tracks',
        {
          params: {
            path: { id },
            query: { page, search: search || undefined },
          },
          signal,
        },
      )
      const parsed = catalogueSchema.safeParse(result.data)
      if (!result.response.ok || !parsed.success)
        throw new Error(messageKey('compilation.loadError'))
      return parsed.data
    },
  })
}

interface AddRecordingsRequest {
  id: string
  trackIds: string[]
  expectedUpdatedAt: string
}
async function addRecordings({
  id,
  trackIds,
  expectedUpdatedAt,
}: AddRecordingsRequest) {
  return guardedWrite(
    () =>
      clientFetchClient.POST(
        '/api/v1/artists/me/releases/{id}/compilation-tracks',
        {
          params: { path: { id } },
          body: { trackIds, expectedUpdatedAt },
          signal: writeSignal(),
        },
      ),
    (data) => {
      const parsed = addedSchema.safeParse(data)
      return parsed.success &&
        parsed.data.release.type === 'COMPILATION' &&
        advancedRelease(parsed.data.release, id, expectedUpdatedAt) &&
        parsed.data.trackIds.length === trackIds.length &&
        parsed.data.trackIds.every((track, index) => track === trackIds[index])
        ? parsed.data
        : undefined
    },
    {
      invalid: 'compilation.saveError',
      unconfirmed: 'compilation.saveError',
      conflict: 'compilation.conflict',
      statusMessages: {
        409: (error) =>
          z
            .object({ code: z.literal('errors.release.audio_duplicate') })
            .safeParse(error).success
            ? 'release.error.audioDuplicate'
            : 'compilation.conflict',
      },
    },
  )
}
export const useAddCompilationTracks = (artistId: string) =>
  useReleaseWrite(artistId, addRecordings)
