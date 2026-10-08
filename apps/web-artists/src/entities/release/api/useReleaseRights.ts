import { artistMusicKeys } from '@shared/api/artistMusicKeys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  saveRights,
  saveSplits,
  saveTrackIsrc,
  submitRelease,
  withdrawRelease,
} from './rights'

/** Every confirmed write refreshes the artist's Music and workspace caches. */
function useReleaseWrite<Request, Result>(
  artistId: string,
  write: (request: Request) => Promise<Result>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: write,
    retry: false,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: artistMusicKeys.artist(artistId),
      }),
  })
}

export const useSaveRights = (artistId: string) =>
  useReleaseWrite(artistId, saveRights)
export const useSaveSplits = (artistId: string) =>
  useReleaseWrite(artistId, saveSplits)
export const useSaveTrackIsrc = (artistId: string) =>
  useReleaseWrite(artistId, saveTrackIsrc)
export const useSubmitRelease = (artistId: string) =>
  useReleaseWrite(artistId, submitRelease)
export const useWithdrawRelease = (artistId: string) =>
  useReleaseWrite(artistId, withdrawRelease)
