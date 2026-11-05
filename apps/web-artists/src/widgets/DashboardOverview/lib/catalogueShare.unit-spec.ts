import { describe, expect, it } from 'vitest'
import { catalogueShare } from './catalogueShare'

const counts = (
  releases: number,
  released: number,
  inReview: number,
  drafts: number,
) => ({
  releases,
  released,
  inReview,
  drafts,
  tracks: 0,
})

describe('catalogueShare', () => {
  it('groups the releases no named status covers as other', () => {
    const shares = catalogueShare(counts(6, 4, 0, 1))
    expect(shares.map(({ key, count }) => [key, count])).toEqual([
      ['live', 4],
      ['drafts', 1],
      ['other', 1],
    ])
  })

  it('leaves out empty groups', () => {
    expect(catalogueShare(counts(0, 0, 0, 0))).toEqual([])
  })

  it('never reports a negative remainder', () => {
    const shares = catalogueShare(counts(1, 1, 1, 0))
    expect(shares.map((share) => share.key)).toEqual(['live', 'review'])
  })
})
