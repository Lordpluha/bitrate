import { PrismaService } from '@infra/prisma/prisma.service'
import { Injectable } from '@nestjs/common'

/** Results per group; the search dialog links to full lists for more. */
const GROUP_LIMIT = 5

/**
 * Title search across the artist's own releases, track drafts and release tasks for the
 * workspace's global search. Case-insensitive substring match; deleted items never appear.
 */
@Injectable()
export class ArtistSearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(ownerArtistId: string, q: string) {
    const title = { contains: q, mode: 'insensitive' as const }
    const ownedRelease = { ownerArtistId, deletedAt: null }
    const [releases, tracks, tasks] = await Promise.all([
      this.prisma.release.findMany({
        where: { ...ownedRelease, title },
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        take: GROUP_LIMIT,
        select: { id: true, title: true, type: true, status: true },
      }),
      this.prisma.artistTrackDraft.findMany({
        where: { ownerArtistId, deletedAt: null, title },
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        take: GROUP_LIMIT,
        select: { id: true, title: true, status: true, releaseId: true },
      }),
      this.prisma.releaseTask.findMany({
        where: { release: ownedRelease, title },
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        take: GROUP_LIMIT,
        select: {
          id: true,
          title: true,
          status: true,
          release: { select: { id: true, title: true } },
        },
      }),
    ])
    return { releases, tracks, tasks }
  }
}
