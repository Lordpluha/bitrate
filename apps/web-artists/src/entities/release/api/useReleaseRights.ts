import { artistMusicKeys } from '@shared/api/artistMusicKeys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  cancelPremiere,
  publishRelease,
  republishRelease,
  reviseRelease,
  saveRights,
  saveSplits,
  saveTrackIsrc,
  submitRelease,
  unpublishRelease,
  withdrawRelease,
} from './rights'
import { releaseWorkspaceKey } from './useReleaseWorkspace'

/**
 * Artist caches that show release state a draft write can change. Analytics,
 * notifications, profile and sessions do not depend on it, so they are left alone.
 */
const RELEASE_LISTING_SCOPES = [
  'catalogue',
  'counts',
  'dashboard',
  'delivery',
  'search',
] as const

/** A confirmed write refreshes this release's workspace and the listings that show it. */
export function useReleaseWrite<Request extends { id: string }, Result>(
  artistId: string,
  write: (request: Request) => Promise<Result>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: write,
    retry: false,
    onSuccess: (_result, request) =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: releaseWorkspaceKey(artistId, request.id),
        }),
        ...RELEASE_LISTING_SCOPES.map((scope) =>
          queryClient.invalidateQueries({
            queryKey: [...artistMusicKeys.artist(artistId), scope],
          }),
        ),
      ]),
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
export const useReviseRelease = (artistId: string) =>
  useReleaseWrite(artistId, reviseRelease)
export const usePublishRelease = (artistId: string) =>
  useReleaseWrite(artistId, publishRelease)
export const useCancelPremiere = (artistId: string) =>
  useReleaseWrite(artistId, cancelPremiere)
export const useUnpublishRelease = (artistId: string) =>
  useReleaseWrite(artistId, unpublishRelease)
export const useRepublishRelease = (artistId: string) =>
  useReleaseWrite(artistId, republishRelease)
