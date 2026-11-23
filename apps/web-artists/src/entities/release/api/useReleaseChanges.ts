import { artistMusicKeys } from '@shared/api/artistMusicKeys'
import { useQuery } from '@tanstack/react-query'
import {
  getReleaseChanges,
  submitReleaseChanges,
  withdrawReleaseChanges,
} from './changes'
import { useReleaseWrite } from './useReleaseRights'

const releaseChangesKey = (artistId: string, id: string) =>
  [...artistMusicKeys.artist(artistId), 'changes', id] as const

/** Pending changes and the latest decision for each title, cover and recording. */
export function useReleaseChanges(
  artistId: string,
  id: string,
  enabled = true,
) {
  return useQuery({
    queryKey: releaseChangesKey(artistId, id),
    queryFn: ({ signal }) => getReleaseChanges(id, signal),
    enabled,
    retry: false,
  })
}

/** Refreshes the release's changes too: `useReleaseWrite` already covers its listings. */
export const useSubmitReleaseChanges = (artistId: string) =>
  useReleaseWrite(artistId, submitReleaseChanges)
export const useWithdrawReleaseChanges = (artistId: string) =>
  useReleaseWrite(artistId, withdrawReleaseChanges)
