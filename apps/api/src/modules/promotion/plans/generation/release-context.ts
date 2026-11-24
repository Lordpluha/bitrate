import type { Prisma } from '@prisma/client'
import type { ReleaseFacts } from './plan-facts'

/**
 * The release fields a plan or step generation reads (spec "Grounding": public release and
 * profile data only, never listening data or emails).
 */
export const RELEASE_CONTEXT_SELECT = {
  title: true,
  type: true,
  scheduledAt: true,
  deletedAt: true,
  territories: { select: { countryCode: true } },
  trackDrafts: {
    where: { deletedAt: null },
    orderBy: { position: 'asc' },
    select: { title: true, genres: { select: { genre: { select: { name: true } } } } },
  },
  owner: { select: { id: true, username: true, bio: true, promotionProfile: true } },
} as const satisfies Prisma.ReleaseSelect

export type ReleaseContext = Prisma.ReleaseGetPayload<{ select: typeof RELEASE_CONTEXT_SELECT }>

/** The facts the model may state about a release that has a date. */
export function toReleaseFacts(release: ReleaseContext, scheduledAt: Date): ReleaseFacts {
  const drafts = release.trackDrafts
  return {
    title: release.title,
    type: release.type,
    scheduledAt,
    trackTitles: drafts.map((draft) => draft.title),
    genres: [...new Set(drafts.flatMap((d) => d.genres.map((g) => g.genre.name)))],
    territories: release.territories.map((t) => t.countryCode),
    artistName: release.owner.username,
    bio: release.owner.bio,
  }
}
