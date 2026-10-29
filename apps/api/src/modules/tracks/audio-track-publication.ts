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

/** Replaces the CMAF rows of one track, including each rendition's byte index. */
async function replaceCmafFiles(
  tx: Prisma.TransactionClient,
  trackId: string,
  cmafPackage: PreparedCmafPackage,
) {
  await tx.trackFile.deleteMany({
    where: {
      trackId,
      format: CMAF_FORMAT,
      bitrate: { notIn: cmafPackage.renditions.map((rendition) => rendition.bitrate) },
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

    await tx.trackFile.upsert({
      where: {
        trackId_format_bitrate: { trackId, format: CMAF_FORMAT, bitrate: rendition.bitrate },
      },
      update: payload,
      create: { trackId, format: CMAF_FORMAT, bitrate: rendition.bitrate, ...payload },
    })
  }
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
