import type { PrismaService } from '@infra/prisma/prisma.service'

/** The reported entity, resolved to what the operator needs to link to and judge it. `null`
 * when the entity type is unrecognised or the row no longer exists — never a 500. */
export type ModerationSubject = {
  kind: string
  id: string
  title: string
  deletedAt: Date | null
  parentId: string | null
} | null

/** A reported entity's row, reduced to what the operator needs to link to and judge it. */
type SubjectRow = { id: string; title: string; deletedAt: Date | null; parentId: string | null }

/** Reads one reportable entity by id; `null` when the row no longer exists. */
type SubjectResolver = (prisma: PrismaService, id: string) => Promise<SubjectRow | null>

const TITLE_SELECT = { id: true, title: true, deletedAt: true } as const
const USERNAME_SELECT = { id: true, username: true, deletedAt: true } as const

/** What {@link TITLE_SELECT} reads. */
type TitledRow = { id: string; title: string; deletedAt: Date | null }

/** What {@link USERNAME_SELECT} reads. */
type AccountRow = { id: string; username: string; deletedAt: Date | null }

/** A titled entity (track, album, …) with no parent. */
const titled = (row: TitledRow | null): SubjectRow | null =>
  row && { id: row.id, title: row.title, deletedAt: row.deletedAt, parentId: null }

/** An account (user, artist), shown by its username. */
const account = (row: AccountRow | null): SubjectRow | null =>
  row && { id: row.id, title: row.username, deletedAt: row.deletedAt, parentId: null }

/**
 * How each reportable entity type resolves, keyed by the lower-cased `entityType`. A `Map`, not
 * an object, so a free-text type such as `constructor` can never hit a prototype member.
 */
export const SUBJECT_RESOLVERS = new Map<string, SubjectResolver>([
  [
    'track',
    async (prisma, id) =>
      titled(await prisma.track.findUnique({ where: { id }, select: TITLE_SELECT })),
  ],
  [
    'album',
    async (prisma, id) =>
      titled(await prisma.album.findUnique({ where: { id }, select: TITLE_SELECT })),
  ],
  [
    'playlist',
    async (prisma, id) =>
      titled(await prisma.playlist.findUnique({ where: { id }, select: TITLE_SELECT })),
  ],
  [
    'podcast',
    async (prisma, id) =>
      titled(await prisma.podcast.findUnique({ where: { id }, select: TITLE_SELECT })),
  ],
  [
    'artist',
    async (prisma, id) =>
      account(await prisma.artist.findUnique({ where: { id }, select: USERNAME_SELECT })),
  ],
  [
    'user',
    async (prisma, id) =>
      account(await prisma.user.findUnique({ where: { id }, select: USERNAME_SELECT })),
  ],
  [
    'episode',
    async (prisma, id) => {
      const row = await prisma.episode.findUnique({
        where: { id },
        select: { ...TITLE_SELECT, podcastId: true },
      })
      return (
        row && { id: row.id, title: row.title, deletedAt: row.deletedAt, parentId: row.podcastId }
      )
    },
  ],
])
