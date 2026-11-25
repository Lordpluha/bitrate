import { artistMusicKeys } from '@shared/api/artistMusicKeys'

/** Query keys of AI promotion, scoped to the signed-in artist like the rest of the workspace. */
export const promotionKeys = {
  all: (artistId: string) =>
    [...artistMusicKeys.artist(artistId), 'promotion'] as const,
  profile: (artistId: string) =>
    [...promotionKeys.all(artistId), 'profile'] as const,
  allowance: (artistId: string) =>
    [...promotionKeys.all(artistId), 'allowance'] as const,
  plan: (artistId: string, releaseId: string) =>
    [...promotionKeys.all(artistId), 'plan', releaseId] as const,
  posts: (artistId: string, stepId: string) =>
    [...promotionKeys.all(artistId), 'posts', stepId] as const,
  calendar: (artistId: string) =>
    [...promotionKeys.all(artistId), 'calendar'] as const,
}
