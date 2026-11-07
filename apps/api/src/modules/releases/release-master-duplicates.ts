import type { PrismaService } from '@infra/prisma/prisma.service'
import type { StorageService } from '@infra/storage/storage.types'
import { UnprocessableEntityException } from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import { RELEASE_ERRORS } from './errors'
import { hashAudioStream, type StoredMaster } from './release-master'

type ReleaseRecordings = { ownerArtistId: string; releaseId: string; excludingId?: string }

/** Stream older masters outside the transaction, where storage cannot hold the release lock. */
export async function legacyDuplicateMasterKeys(
  prisma: PrismaService,
  storage: StorageService,
  { ownerArtistId, releaseId, excludingId }: ReleaseRecordings,
  master: StoredMaster,
): Promise<string[]> {
  const candidates = await prisma.artistTrackDraft.findMany({
    where: {
      ownerArtistId,
      releaseId,
      release: { deletedAt: null },
      deletedAt: null,
      ...(excludingId ? { id: { not: excludingId } } : {}),
      audioKey: { not: null },
      audioSha256: null,
      audioSizeBytes: master.sizeBytes,
    },
    select: { audioKey: true },
  })
  const matching: string[] = []
  for (const candidate of candidates) {
    if (!candidate.audioKey) continue
    const object = await storage.getObjectStream(candidate.audioKey)
    if ((await hashAudioStream(object.stream)) === master.sha256) matching.push(candidate.audioKey)
  }
  return matching
}

/** Caller holds the parent lock, so concurrent additions and replacements cannot both pass. */
export async function assertUniqueReleaseMaster(
  tx: Prisma.TransactionClient,
  { ownerArtistId, releaseId, excludingId }: ReleaseRecordings,
  master: StoredMaster,
  legacyDuplicates: string[],
): Promise<void> {
  const duplicates = await tx.artistTrackDraft.findMany({
    where: {
      ownerArtistId,
      releaseId,
      deletedAt: null,
      ...(excludingId ? { id: { not: excludingId } } : {}),
      OR: [
        { audioSha256: master.sha256 },
        ...(legacyDuplicates.length ? [{ audioKey: { in: legacyDuplicates } }] : []),
      ],
    },
    select: { id: true },
    take: 1,
  })
  if (duplicates.length) throw new UnprocessableEntityException(RELEASE_ERRORS.AUDIO_DUPLICATE)
}
