import type { PrismaService } from '@infra/prisma/prisma.service'
import { RELEASE_ERRORS } from '@modules/releases/errors'
import { NotFoundException } from '@nestjs/common'

/** The caller's own, undeleted release; another artist's release reads as not found. */
export async function findOwnedRelease(prisma: PrismaService, artistId: string, releaseId: string) {
  const release = await prisma.release.findFirst({
    where: { id: releaseId, ownerArtistId: artistId, deletedAt: null },
    select: { scheduledAt: true },
  })
  if (!release) throw new NotFoundException(RELEASE_ERRORS.NOT_FOUND)
  return release
}
