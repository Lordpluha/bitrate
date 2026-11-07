import { AlbumType, type Prisma } from '@prisma/client'
import { RELEASE_SUMMARY_SELECT } from './orm'

/** Ordinary drafts use active recording count; catalogue compilations keep their explicit format. */
export function releaseTypeForTrackCount(count: number): AlbumType {
  if (count >= 7) return AlbumType.ALBUM
  if (count >= 5) return AlbumType.EP
  return AlbumType.SINGLE
}

/** The caller holds the release row lock while changing its recordings. */
export async function refreshReleaseType(
  tx: Prisma.TransactionClient,
  release: { id: string; updatedAt: Date; type?: AlbumType },
) {
  const count = await tx.artistTrackDraft.count({
    where: { releaseId: release.id, deletedAt: null },
  })
  return tx.release.update({
    where: { id: release.id },
    data: {
      type:
        release.type === AlbumType.COMPILATION
          ? AlbumType.COMPILATION
          : releaseTypeForTrackCount(count),
      updatedAt: release.updatedAt,
    },
    select: RELEASE_SUMMARY_SELECT,
  })
}
