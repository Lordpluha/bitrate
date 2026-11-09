import type { PrismaService } from '@infra/prisma/prisma.service'
import type { StorageService } from '@infra/storage/storage.types'
import { type Logger, UnprocessableEntityException } from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import { RELEASE_ERRORS } from './errors'
import { hashAudioStream, type StoredMaster } from './release-master'

type ReleaseRecordings = { ownerArtistId: string; releaseId: string; excludingId?: string }

/**
 * Stream older masters outside the transaction, where storage cannot hold the release lock.
 * Each checksum is stored once computed, so an older master is downloaded at most once; one
 * that vanished from storage cannot be compared and is skipped rather than failing the upload.
 */
export async function legacyDuplicateMasterKeys(
  prisma: PrismaService,
  storage: StorageService,
  { ownerArtistId, releaseId, excludingId }: ReleaseRecordings,
  master: StoredMaster,
  logger: Pick<Logger, 'warn'>,
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
    const key = candidate.audioKey
    if (!key) continue
    let sha256: string
    try {
      sha256 = await hashAudioStream((await storage.getObjectStream(key)).stream)
    } catch (error) {
      logger.warn(`Skipped unreadable master ${key} in the duplicate check: ${String(error)}`)
      continue
    }
    // Keyed by object, so a concurrent replacement of the recording's master is never mislabelled.
    await prisma.artistTrackDraft.updateMany({
      where: { audioKey: key, audioSha256: null },
      data: { audioSha256: sha256 },
    })
    if (sha256 === master.sha256) matching.push(key)
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
