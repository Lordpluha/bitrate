import { artistMusicKeys } from '@shared/api/artistMusicKeys'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  type ContributorRequest,
  getContributor,
  saveContributor,
} from './contributors'

export function useContributor(
  artistId: string,
  id: string,
  contributorId: string,
) {
  return useQuery({
    queryKey: [
      ...artistMusicKeys.artist(artistId),
      'contributor',
      id,
      contributorId,
    ],
    queryFn: ({ signal }) => getContributor(id, contributorId, signal),
    retry: false,
    gcTime: 0,
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}

export function useSaveContributor(artistId: string, contributorId?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: ContributorRequest) =>
      saveContributor(request, contributorId),
    retry: false,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: artistMusicKeys.artist(artistId),
      }),
  })
}
