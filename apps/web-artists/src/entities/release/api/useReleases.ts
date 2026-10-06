import { artistMusicKeys } from '@shared/api/artistMusicKeys'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createRelease, getRelease, updateRelease } from './releases'

const releaseKeys = {
  artist: artistMusicKeys.artist,
  detail: (artistId: string, id: string) =>
    [...releaseKeys.artist(artistId), 'detail', id] as const,
}

export function useRelease(artistId: string, id: string) {
  return useQuery({
    queryKey: releaseKeys.detail(artistId, id),
    queryFn: ({ signal }) => getRelease(id, signal),
    retry: false,
    gcTime: 0,
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}

export function useUpdateRelease(artistId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateRelease,
    retry: false,
    onSuccess: (release) => {
      queryClient.setQueryData(
        releaseKeys.detail(artistId, release.id),
        release,
      )
      void queryClient.invalidateQueries({
        queryKey: releaseKeys.artist(artistId),
        predicate: (query) => query.queryKey[2] !== 'detail',
      })
    },
  })
}

export function useCreateRelease(artistId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createRelease,
    retry: false,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: releaseKeys.artist(artistId) }),
  })
}
