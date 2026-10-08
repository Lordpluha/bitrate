import { describe, expect, it } from '@jest/globals'
import { type ReleaseReadinessInput, releaseReadiness } from './release-readiness'

const ready: ReleaseReadinessInput = {
  upc: '036000291452',
  masterOwnerType: 'ARTIST',
  writersConfirmedAt: new Date('2026-10-05T10:00:00Z'),
  accuracyConfirmedAt: new Date('2026-10-05T10:00:00Z'),
  tracks: [{ id: 'track-1', isrc: 'USRC17607839' }],
  contributors: [{ id: 'credit-1', roles: ['PERFORMER'] }],
  splits: [
    { rightType: 'RECORDING', shareBasisPoints: 10_000 },
    { rightType: 'COMPOSITION', shareBasisPoints: 6_000 },
    { rightType: 'COMPOSITION', shareBasisPoints: 4_000 },
  ],
}

describe('release readiness', () => {
  it('has no blockers or notices for a complete release', () => {
    expect(releaseReadiness(ready)).toEqual({ blockers: [], notices: [] })
  })

  it('requires at least one track', () => {
    expect(releaseReadiness({ ...ready, tracks: [] }).blockers).toEqual([{ code: 'NO_TRACKS' }])
  })

  it('requires the master owner and both rights confirmations', () => {
    const { blockers } = releaseReadiness({
      ...ready,
      masterOwnerType: null,
      writersConfirmedAt: null,
      accuracyConfirmedAt: null,
    })
    expect(blockers).toEqual([
      { code: 'MASTER_OWNER_MISSING' },
      { code: 'WRITERS_NOT_CONFIRMED' },
      { code: 'ACCURACY_NOT_CONFIRMED' },
    ])
  })

  it('names each contributor without a role', () => {
    const { blockers } = releaseReadiness({
      ...ready,
      contributors: [...ready.contributors, { id: 'credit-2', roles: [] }],
    })
    expect(blockers).toEqual([{ code: 'CONTRIBUTOR_ROLES_MISSING', contributorId: 'credit-2' }])
  })

  it('requires exactly 100% for each right type', () => {
    const { blockers } = releaseReadiness({
      ...ready,
      splits: [{ rightType: 'RECORDING', shareBasisPoints: 9_999 }],
    })
    expect(blockers).toEqual([
      { code: 'SPLITS_INCOMPLETE', rightType: 'RECORDING', totalBasisPoints: 9_999 },
      { code: 'SPLITS_INCOMPLETE', rightType: 'COMPOSITION', totalBasisPoints: 0 },
    ])
  })

  it('reports missing identifiers as notices that do not block submission', () => {
    const result = releaseReadiness({
      ...ready,
      upc: null,
      tracks: [...ready.tracks, { id: 'track-2', isrc: null }],
    })
    expect(result.blockers).toEqual([])
    expect(result.notices).toEqual([
      { code: 'UPC_MISSING' },
      { code: 'ISRC_MISSING', trackId: 'track-2' },
    ])
  })
})
