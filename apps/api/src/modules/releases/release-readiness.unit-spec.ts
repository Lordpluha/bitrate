import { describe, expect, it } from '@jest/globals'
import type { ReadinessRecord } from './orm'
import {
  type ReleaseReadinessInput,
  readinessFromRecord,
  releaseReadiness,
} from './release-readiness'

const ready: ReleaseReadinessInput = {
  upc: '036000291452',
  cover: '/static/releases/covers/cover.jpg',
  masterOwnerType: 'ARTIST',
  tracks: [{ id: 'track-1', isrc: 'USRC17607839', hasAudio: true, hasGenres: true }],
  contributors: [{ id: 'credit-1', roles: ['PERFORMER'] }],
  splits: [
    { rightType: 'RECORDING', shareBasisPoints: 6_000 },
    { rightType: 'RECORDING', shareBasisPoints: 4_000 },
  ],
}

describe('release readiness', () => {
  it('has no blockers or notices for a complete release', () => {
    expect(releaseReadiness(ready)).toEqual({ blockers: [], notices: [] })
  })

  it('requires at least one track', () => {
    expect(releaseReadiness({ ...ready, tracks: [] }).blockers).toEqual([{ code: 'NO_TRACKS' }])
  })

  it('requires the master owner but no songwriter confirmation', () => {
    const { blockers } = releaseReadiness({ ...ready, masterOwnerType: null })
    expect(blockers).toEqual([{ code: 'MASTER_OWNER_MISSING' }])
  })

  it('names each contributor without a role', () => {
    const { blockers } = releaseReadiness({
      ...ready,
      contributors: [...ready.contributors, { id: 'credit-2', roles: [] }],
    })
    expect(blockers).toEqual([{ code: 'CONTRIBUTOR_ROLES_MISSING', contributorId: 'credit-2' }])
  })

  it('requires exactly 100% of the master', () => {
    const { blockers } = releaseReadiness({
      ...ready,
      splits: [{ rightType: 'RECORDING', shareBasisPoints: 9_999 }],
    })
    expect(blockers).toEqual([
      { code: 'SPLITS_INCOMPLETE', rightType: 'RECORDING', totalBasisPoints: 9_999 },
    ])
  })

  it('ignores publishing shares, which artists no longer split', () => {
    const { blockers } = releaseReadiness({
      ...ready,
      splits: [...ready.splits, { rightType: 'COMPOSITION', shareBasisPoints: 2_500 }],
    })
    expect(blockers).toEqual([])
  })

  it('reports missing identifiers as notices that do not block submission', () => {
    const result = releaseReadiness({
      ...ready,
      upc: null,
      tracks: [...ready.tracks, { id: 'track-2', isrc: null, hasAudio: true, hasGenres: true }],
    })
    expect(result.blockers).toEqual([])
    expect(result.notices).toEqual([
      { code: 'UPC_MISSING' },
      { code: 'ISRC_MISSING', trackId: 'track-2' },
    ])
  })

  it('requires genres on each recording', () => {
    const { blockers } = releaseReadiness({
      ...ready,
      tracks: [
        ...ready.tracks,
        { id: 'track-2', isrc: 'USRC17607840', hasAudio: true, hasGenres: false },
      ],
    })
    expect(blockers).toEqual([{ code: 'TRACK_GENRES_MISSING', trackId: 'track-2' }])
  })
})

describe('readiness from a stored release', () => {
  const draftRecording = {
    id: 'draft-1',
    isrc: null,
    audioKey: 'masters/draft-1.wav',
    sourceTrackId: null,
    sourceTrack: null,
    _count: { genres: 0 },
  }
  const record = (
    trackDrafts: ReadinessRecord['trackDrafts'],
    tracks: ReadinessRecord['tracks'] = [],
  ): ReadinessRecord => ({
    status: 'DRAFT',
    updatedAt: new Date('2026-11-10T10:00:00Z'),
    upc: null,
    cover: null,
    masterOwnerType: null,
    trackDrafts,
    tracks,
    contributors: [],
    splits: [],
  })

  it('needs genres on an uploaded recording until the artist picks one', () => {
    const [bare, tagged] = [0, 2].map(
      (genres) =>
        readinessFromRecord(record([{ ...draftRecording, _count: { genres } }])).tracks[0],
    )
    expect(bare).toMatchObject({ id: 'draft-1', hasGenres: false })
    expect(tagged).toMatchObject({ id: 'draft-1', hasGenres: true })
  })

  it('keeps the catalogue genres of reused and already linked tracks', () => {
    const reused = {
      ...draftRecording,
      id: 'draft-2',
      audioKey: null,
      sourceTrackId: 'track-9',
      sourceTrack: {
        publishedAt: new Date('2026-10-01T10:00:00Z'),
        deletedAt: null,
        moderationBlockedAt: null,
        processingStatus: 'READY' as const,
        isrc: null,
      },
    }
    const { tracks } = readinessFromRecord(
      record([reused], [{ track: { id: 'track-8', isrc: null } }]),
    )
    expect(tracks.map(({ hasGenres }) => hasGenres)).toEqual([true, true])
  })
})
