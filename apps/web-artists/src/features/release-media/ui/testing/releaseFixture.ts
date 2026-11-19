import { releaseWorkspaceSchema } from '@entities/release'

export const RELEASE_ID = '019a0000-0000-7000-8000-000000000201'
export const TRACK_ID = '019a0000-0000-7000-8000-000000000301'
export const HOUSE = {
  id: '019a0000-0000-7000-8000-000000000401',
  slug: 'house',
  name: 'House',
}
export const TECHNO = {
  id: '019a0000-0000-7000-8000-000000000402',
  slug: 'techno',
  name: 'Techno',
}
export const AMBIENT = {
  id: '019a0000-0000-7000-8000-000000000403',
  slug: 'ambient',
  name: 'Ambient',
}
export const POP = {
  id: '019a0000-0000-7000-8000-000000000404',
  slug: 'pop',
  name: 'Pop',
}

/** A draft workspace with one uploaded recording, validated like an API response. */
export function draftRelease(genres: (typeof HOUSE)[] = []) {
  return releaseWorkspaceSchema.parse({
    id: RELEASE_ID,
    title: 'Night Signal',
    type: 'SINGLE',
    status: 'DRAFT',
    upc: null,
    scheduledAt: null,
    createdAt: '2026-11-01T10:00:00.000Z',
    updatedAt: '2026-11-02T10:00:00.000Z',
    artistName: 'Demo artist',
    cover: null,
    isDemo: false,
    trackCount: 1,
    participantCount: 0,
    trackDrafts: [
      {
        id: TRACK_ID,
        title: 'Night drive',
        duration: 200,
        isDemo: false,
        isrc: null,
        hasAudio: true,
        audioFileName: 'night-drive.wav',
        audioSizeBytes: 1024,
        version: 'ORIGINAL',
        status: 'DRAFT',
        genres,
      },
    ],
    tracks: [],
    participants: [],
    submittedAt: null,
    rights: {
      masterOwnerType: null,
      masterOwnerName: null,
      writersConfirmedAt: null,
      accuracyConfirmedAt: null,
    },
    splits: [],
    readiness: { blockers: [], notices: [] },
    latestReview: null,
  })
}
