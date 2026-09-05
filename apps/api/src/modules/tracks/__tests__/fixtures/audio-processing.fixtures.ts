import { jest } from '@jest/globals'
import type { Job } from 'bullmq'

/** Mirrors what the CMAF converter returns for two aligned renditions. */
export const cmafResult = {
  outputDir: '/storage/.processing/track-1-job-1-1/cmaf',
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

/** The payload of a well-formed `convert-audio` job. */
export const jobData = {
  trackId: 'track-1',
  artistId: 'artist-1',
  sourceFileName: 'track.mp3',
  inputPath: '/storage/track.mp3',
  outputDir: '/storage',
  format: 'opus',
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
