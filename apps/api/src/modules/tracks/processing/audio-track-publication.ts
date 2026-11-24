import type { PrismaService } from '@infra/prisma/prisma.service'
import type { Prisma } from '@prisma/client'
import {
  CMAF_CODEC,
  CMAF_FORMAT,
  type PreparedCmafPackage,
  StaleAudioJobError,
} from './audio-artifact.types'

/** Everything needed to turn a finished conversion into a playable track. */
export type PublishTrackFilesInput = {
  prisma: PrismaService
  trackId: string
  sourceFileName: string
  cmafPackage: PreparedCmafPackage
}

/**
 * Replaces the CMAF rows of one track, including each rendition's byte index. A rendition is
 * identified by its bitrate and whether it is encrypted (ADR-0077), so rows of the previous
 * generation that this one does not have are deleted pair by pair.
 */
async function replaceCmafFiles(
  tx: Prisma.TransactionClient,
  trackId: string,
  cmafPackage: PreparedCmafPackage,
) {
  await tx.trackFile.deleteMany({
    where: {
      trackId,
      format: CMAF_FORMAT,
      NOT: {
        OR: cmafPackage.renditions.map(({ bitrate, encrypted }) => ({ bitrate, encrypted })),
      },
    },
  })

  for (const rendition of cmafPackage.renditions) {
    const payload = {
      codec: CMAF_CODEC,
      url: rendition.audioKey,
      size: rendition.size,
      initRangeStart: rendition.initRange[0],
      initRangeEnd: rendition.initRange[1],
      fragments: rendition.fragments,
    }

    const identity = {
      trackId,
      format: CMAF_FORMAT,
      bitrate: rendition.bitrate,
      encrypted: rendition.encrypted,
    }
    await tx.trackFile.upsert({
      where: { trackId_format_bitrate_encrypted: identity },
      update: payload,
      create: { ...identity, ...payload },
    })
  }
}

/**
 * Points the track at this generation's content key, or removes the previous one when this
 * generation is unencrypted, in the transaction that publishes the files — so a listener never
 * gets a key that does not match the renditions (ADR-0077).
 */
async function replaceContentKey(
  tx: Prisma.TransactionClient,
  trackId: string,
  contentKey: PreparedCmafPackage['contentKey'],
) {
  if (!contentKey) {
    await tx.trackContentKey.deleteMany({ where: { trackId } })
    return
  }
  const { keyId, wrappedKey, iv, authTag } = contentKey
  const row = {
    keyId,
    wrappedKey: new Uint8Array(wrappedKey),
    iv: new Uint8Array(iv),
    authTag: new Uint8Array(authTag),
  }
  await tx.trackContentKey.upsert({
    where: { trackId },
    update: row,
    create: { trackId, ...row },
  })
}

/**
 * Persists every artifact row and marks the track READY, atomically.
 *
 * The final write matches on `audioUrl` so a newer upload that landed mid-job
 * cannot be published under this job's artifacts.
 *
 * @throws StaleAudioJobError when a newer source has replaced this job's.
 */
export async function publishTrackFiles({
  prisma,
  trackId,
  sourceFileName,
  cmafPackage,
}: PublishTrackFilesInput): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await replaceCmafFiles(tx, trackId, cmafPackage)
    await replaceContentKey(tx, trackId, cmafPackage.contentKey)

    const published = await tx.track.updateMany({
      where: { id: trackId, audioUrl: sourceFileName },
      data: {
        processingStatus: 'READY',
        processingError: null,
        processingFinishedAt: new Date(),
        fragmentTimescale: cmafPackage.timescale,
        durationTicks: cmafPackage.durationTicks,
      },
    })

    if (published.count !== 1) throw new StaleAudioJobError()
  })
}
