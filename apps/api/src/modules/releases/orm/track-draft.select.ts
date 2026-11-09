import type { Prisma } from '@prisma/client'

/** What a workspace shows for an uploaded draft; the storage key never leaves the server. */
export const TRACK_DRAFT_SELECT = {
  id: true,
  sourceTrackId: true,
  title: true,
  version: true,
  status: true,
  duration: true,
  isDemo: true,
  isrc: true,
  audioFileName: true,
  audioSizeBytes: true,
  waveform: true,
} as const satisfies Prisma.ArtistTrackDraftSelect
