import { useSaveContributor } from './useContributor'

export function useAddContributor(artistId: string) {
  return useSaveContributor(artistId)
}
