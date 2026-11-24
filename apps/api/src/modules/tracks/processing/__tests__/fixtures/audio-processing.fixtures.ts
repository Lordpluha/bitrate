import { jest } from '@jest/globals'
import type { Job } from 'bullmq'

/** Mirrors what the CMAF converter returns for two aligned renditions. */
export const cmafResult = {
  outputDir: '/tmp/bitrate-audio-jobs/track-1-job-1-1/cmaf',
  timescale: 48_000,
  durationTicks: 2_880_000,
  renditions: [128, 192].map((bitrate) => ({
    bitrate,
    path: `/tmp/cmaf/${bitrate}.m4a`,
    size: bitrate * 7_000,
    initRange: [0, 707] as [number, number],
    fragments: [
      { startTicks: 0, durationTicks: 195_584, offset: 929, length: 66_238 },
      { startTicks: 195_584, durationTicks: 196_608, offset: 67_167, length: 66_419 },
    ],
  })),
}

/**
 * What `encryptCmafRenditions` returns for {@link cmafResult}: both renditions encrypted (their
 * fragments grow) plus an unencrypted 128 kbps copy on the same grid (ADR-0077).
 */
export const encryptedCmafResult = (keyId: string) => ({
  outputDir: '/tmp/bitrate-audio-jobs/track-1-job-1-1/cmaf-encrypted',
  timescale: 48_000,
  durationTicks: 2_881_024,
  renditions: [
    ...[128, 192].map((bitrate) => ({ bitrate, encrypted: true })),
    { bitrate: 128, encrypted: false },
  ].map(({ bitrate, encrypted }) => ({
    bitrate,
    path: `/tmp/cmaf-encrypted/${bitrate}${encrypted ? '' : '-clear'}.m4a`,
    size: bitrate * 7_100,
    initRange: [0, 801] as [number, number],
    indexRange: [802, 857] as [number, number],
    fragments: [
      { startTicks: 0, durationTicks: 196_608, offset: 858, length: 66_400 },
      { startTicks: 196_608, durationTicks: 196_608, offset: 67_258, length: 66_600 },
    ],
    encryption: encrypted ? { scheme: 'cbcs' as const, keyId } : null,
  })),
})

/** The payload of a well-formed `convert-audio` job. */
export const jobData = {
  trackId: 'track-1',
  artistId: 'artist-1',
  sourceFileName: 'track.mp3',
  masterKey: 'masters/track.mp3',
  bitrates: ['128k', '192k'],
}

/** Builds a BullMQ job stub carrying `data`, with a spy on `updateProgress`. */
export const buildJob = (
  name: string,
  data: Record<string, unknown> = {},
  overrides: Partial<Job> = {},
): Job =>
  ({
    id: 'job-1',
    name,
    data,
    attemptsMade: 0,
    opts: { attempts: 5 },
    updateProgress: jest.fn().mockResolvedValue(undefined as never),
    ...overrides,
  }) as Job
