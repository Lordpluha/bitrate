import type { TrackProcessingStatus } from '@prisma/client'
import { STUCK_AFTER_MS } from './constants'
import type { AdminFixturesPrismaClient, AdminFixturesSummary, FixtureTrackIds } from './types'

/** Input to {@link upsertTrack} — always the row's intended, create-time shape. */
type UpsertTrackInput = {
  isrc: string
  title: string
  artistId: string
  audioUrl: string
  processingStatus: TrackProcessingStatus
  processingError: string | null
  processingAttempts: number
  processingStartedAt: Date | null
}

async function upsertTrack(
  prisma: AdminFixturesPrismaClient,
  summary: AdminFixturesSummary,
  input: UpsertTrackInput,
): Promise<{ id: string }> {
  const existing = await prisma.track.findUnique({ where: { isrc: input.isrc } })
  const track = await prisma.track.upsert({
    where: { isrc: input.isrc },
    create: input,
    update: {
      title: input.title,
      processingStatus: input.processingStatus,
      processingError: input.processingError,
      processingAttempts: input.processingAttempts,
      processingStartedAt: input.processingStartedAt,
    },
  })
  if (!existing) summary.tracks += 1
  return track
}

/**
 * Four `FAILED` tracks and three `PROCESSING` tracks whose `processingStartedAt` is older than
 * {@link STUCK_AFTER_MS} — the two pipeline states the panel's catalog and overview screens must
 * be able to show.
 */
export async function seedTracks(
  prisma: AdminFixturesPrismaClient,
  summary: AdminFixturesSummary,
  artistId: string,
): Promise<FixtureTrackIds> {
  const failedTrackIds: string[] = []
  for (let index = 1; index <= 4; index += 1) {
    const track = await upsertTrack(prisma, summary, {
      isrc: `FIXTURE-FAILED-${index}`,
      title: `Fixture Failed Upload ${index}`,
      artistId,
      audioUrl: 'fixture://not-streamable',
      processingStatus: 'FAILED',
      processingError: 'Fixture: transcoding failed after 3 attempts (simulated).',
      processingAttempts: 3,
      processingStartedAt: null,
    })
    failedTrackIds.push(track.id)
  }

  const stuckTrackIds: string[] = []
  const stuckStartedAt = new Date(Date.now() - STUCK_AFTER_MS - 15 * 60 * 1_000)
  for (let index = 1; index <= 3; index += 1) {
    const track = await upsertTrack(prisma, summary, {
      isrc: `FIXTURE-STUCK-${index}`,
      title: `Fixture Stuck Upload ${index}`,
      artistId,
      audioUrl: 'fixture://not-streamable',
      processingStatus: 'PROCESSING',
      processingError: null,
      processingAttempts: 1,
      processingStartedAt: stuckStartedAt,
    })
    stuckTrackIds.push(track.id)
  }

  return { failedTrackIds, stuckTrackIds }
}
