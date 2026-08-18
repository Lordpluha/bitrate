'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { trackManifestSchema } from '@/entities/Player/api/client'
import type { TrackManifest } from '@/entities/Player/model/manifest.types'
import { fetchWithAuthRefresh } from '@/shared/api/client'
import { apiQueryKeys } from '@/shared/api/queryKeys'
import { getApiUrl } from '@/shared/utils/mediaUrl'

/**
 * Resolves a track's playback manifest through the React Query cache, so the
 * same track is fetched once no matter how many slots ask for it.
 *
 * Returns null — rather than throwing — for tracks the API has no CMAF
 * renditions for, which is the signal to keep using the legacy HLS path.
 */
export const useManifestResolver = () => {
  const queryClient = useQueryClient()

  return useCallback(
    async (trackId: string): Promise<TrackManifest | null> => {
      try {
        return await queryClient.fetchQuery({
          queryKey: apiQueryKeys.tracks.manifest(trackId),
          queryFn: async () => {
            /**
             * Same reasoning as the fragment fetch: retry once through a
             * refresh before treating a 401 as "no manifest, use legacy HLS" —
             * an expired token should not silently downgrade playback quality.
             */
            const response = await fetchWithAuthRefresh(
              getApiUrl(`/api/v1/tracks/${trackId}/manifest`),
            )

            /** No manifest: a legacy track, not an error worth surfacing. */
            if (!response.ok) return null

            return trackManifestSchema.parse(await response.json())
          },
          staleTime: Number.POSITIVE_INFINITY,
          gcTime: Number.POSITIVE_INFINITY,
          retry: false,
        })
      } catch {
        return null
      }
    },
    [queryClient],
  )
}

export type ManifestResolver = ReturnType<typeof useManifestResolver>
