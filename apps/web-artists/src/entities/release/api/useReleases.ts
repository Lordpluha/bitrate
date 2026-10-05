import { artistMusicKeys } from '@shared/api/artistMusicKeys'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createRelease,
  getRelease,
  getReleases,
  updateRelease,
} from './releases'

const releaseKeys = {
  artist: artistMusicKeys.artist,
  list: (artistId: string | undefined, page: number) =>
    [...releaseKeys.artist(artistId), 'list', page] as const,
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

export function useReleases(artistId: string | undefined, page: number) {
  return useQuery({
    queryKey: releaseKeys.list(artistId, page),
    queryFn: ({ signal }) => getReleases(page, signal),
    enabled: Boolean(artistId),
    staleTime: 30_000,
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
