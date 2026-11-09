import { AlbumType, type Prisma } from '@prisma/client'
import { RELEASE_SUMMARY_SELECT } from './orm'

/** Ordinary drafts use active recording count; catalogue compilations keep their explicit format. */
export function releaseTypeForTrackCount(count: number): AlbumType {
  if (count >= 7) return AlbumType.ALBUM
  if (count >= 5) return AlbumType.EP
  return AlbumType.SINGLE
}

/**
 * The caller holds the release row lock while changing its recordings. A compilation stays one
 * while it holds only catalogue recordings (an emptied one included); an own upload turns it into
 * an ordinary draft detected from its recording count.
 */
export async function refreshReleaseType(
  tx: Prisma.TransactionClient,
  release: { id: string; updatedAt: Date; type?: AlbumType },
) {
  const live = { releaseId: release.id, deletedAt: null }
  const count = await tx.artistTrackDraft.count({ where: live })
  const compilation =
    release.type === AlbumType.COMPILATION &&
    count ===
      (await tx.artistTrackDraft.count({ where: { ...live, sourceTrackId: { not: null } } }))
  return tx.release.update({
    where: { id: release.id },
    data: {
      type: compilation ? AlbumType.COMPILATION : releaseTypeForTrackCount(count),
      updatedAt: release.updatedAt,
    },
    select: RELEASE_SUMMARY_SELECT,
  })
}
