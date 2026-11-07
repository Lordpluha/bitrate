import { ConflictException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { RELEASE_ERRORS } from './errors'

export const SOURCE_AVAILABILITY_SELECT = {
  publishedAt: true,
  deletedAt: true,
  moderationBlockedAt: true,
  processingStatus: true,
} satisfies Prisma.TrackSelect

type SourceAvailability = {
  publishedAt: Date | null
  deletedAt: Date | null
  moderationBlockedAt: Date | null
  processingStatus: string
}

export function sourceAvailable(source: SourceAvailability | null): boolean {
  return (
    !!source &&
    source.publishedAt !== null &&
    source.publishedAt <= new Date() &&
    source.deletedAt === null &&
    source.moderationBlockedAt === null &&
    source.processingStatus === 'READY'
  )
}

/** A reviewed recording, currently available through at least one live release owned by this artist. */
export function compilationSourceWhere(
  artistId: string,
  requireVisible = true,
): Prisma.TrackWhereInput {
  return {
    artistId,
    deletedAt: null,
    moderationBlockedAt: null,
    processingStatus: 'READY',
    ...(requireVisible ? { publishedAt: { lte: new Date() } } : {}),
    AND: [
      ...(requireVisible
        ? [
            {
              releases: {
                some: {
                  release: {
                    ownerArtistId: artistId,
                    deletedAt: null,
                    status: 'RELEASED' as const,
                  },
                },
              },
            },
          ]
        : []),
      {
        releases: {
          some: { reused: false, release: { ownerArtistId: artistId, publishedAt: { not: null } } },
        },
      },
    ],
  }
}

/** Locks canonical recordings in a stable order, serializing publication with takedown/deletion. */
export async function lockCompilationSources(
  tx: Prisma.TransactionClient,
  artistId: string,
  ids: readonly string[],
  requireVisible = true,
) {
  if (!ids.length) return
  await tx.$queryRaw(Prisma.sql`SELECT id FROM "Track" WHERE "artistId" = ${artistId}::uuid
    AND id IN (${Prisma.join(ids.map((id) => Prisma.sql`${id}::uuid`))}) ORDER BY id FOR UPDATE`)
  const count = await tx.track.count({
    where: { ...compilationSourceWhere(artistId, requireVisible), id: { in: [...ids] } },
  })
  if (count !== ids.length)
    throw new ConflictException(RELEASE_ERRORS.COMPILATION_SOURCE_UNAVAILABLE)
}

/** Distinct catalogue IDs may still contain the same uploaded bytes across original releases. */
export async function assertDistinctCompilationAudio(
  tx: Prisma.TransactionClient,
  ownerArtistId: string,
  ids: string[],
) {
  const originals = await tx.artistTrackDraft.findMany({
    where: {
      ownerArtistId,
      sourceTrackId: null,
      audioSha256: { not: null },
      release: { tracks: { some: { trackId: { in: ids }, reused: false } } },
    },
    select: {
      position: true,
      audioSha256: true,
      release: {
        select: {
          tracks: {
            where: { trackId: { in: ids }, reused: false },
            select: { trackId: true, position: true },
          },
        },
      },
    },
  })
  const seen = new Map<string, string>()
  for (const original of originals) {
    const sourceId = original.release?.tracks.find(
      (track) => track.position === original.position + 1,
    )?.trackId
    if (!(sourceId && original.audioSha256)) continue
    const previous = seen.get(original.audioSha256)
    if (previous && previous !== sourceId)
      throw new ConflictException(RELEASE_ERRORS.AUDIO_DUPLICATE)
    seen.set(original.audioSha256, sourceId)
  }
}
