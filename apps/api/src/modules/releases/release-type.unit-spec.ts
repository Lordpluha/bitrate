import { describe, expect, it } from '@jest/globals'
import { AlbumType, type Prisma } from '@prisma/client'
import { mockDeep } from 'jest-mock-extended'
import { refreshReleaseType, releaseTypeForTrackCount } from './release-type'

describe('release format from recording count', () => {
  it.each([
    [0, AlbumType.SINGLE],
    [1, AlbumType.SINGLE],
    [4, AlbumType.SINGLE],
    [5, AlbumType.EP],
    [6, AlbumType.EP],
    [7, AlbumType.ALBUM],
    [50, AlbumType.ALBUM],
  ])('classifies %i recordings as %s', (count, type) => {
    expect(releaseTypeForTrackCount(count)).toBe(type)
  })
  it.each([0, 1, 7])('preserves compilation mode with %i active recordings', async (count) => {
    const tx = mockDeep<Prisma.TransactionClient>()
    tx.artistTrackDraft.count.mockResolvedValue(count)
    await refreshReleaseType(tx, {
      id: 'release',
      updatedAt: new Date(),
      type: AlbumType.COMPILATION,
    })
    expect(tx.release.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ type: AlbumType.COMPILATION }) }),
    )
  })
  it('drops compilation mode once the draft holds an own recording', async () => {
    const tx = mockDeep<Prisma.TransactionClient>()
    tx.artistTrackDraft.count.mockResolvedValueOnce(1).mockResolvedValueOnce(0)
    await refreshReleaseType(tx, {
      id: 'release',
      updatedAt: new Date(),
      type: AlbumType.COMPILATION,
    })
    expect(tx.release.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ type: AlbumType.SINGLE }) }),
    )
  })
})
