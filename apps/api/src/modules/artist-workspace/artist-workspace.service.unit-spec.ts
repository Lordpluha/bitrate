import { beforeEach, describe, expect, it } from '@jest/globals'
import { ArtistWorkspacePage } from '@prisma/client'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { ArtistWorkspaceService } from './artist-workspace.service'
import { SaveWorkspaceLayoutSchema } from './dtos/workspace-layout.dto'

const tiles = [
  { id: 'current-release', size: 'L' as const, columns: 7, rows: 5, hidden: false },
  { id: 'activity', size: 'S' as const, hidden: true },
]

describe('ArtistWorkspaceService', () => {
  let service: ArtistWorkspaceService
  let prisma: PrismaMock

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    service = new ArtistWorkspaceService(prisma)
  })

  it('returns an empty layout when the artist has not arranged the page', async () => {
    prisma.artistWorkspaceLayout.findUnique.mockResolvedValue(null)
    await expect(service.layout('artist-1', 'dashboard')).resolves.toEqual({
      page: 'dashboard',
      tiles: [],
      updatedAt: null,
    })
  })

  it("reads only the caller's layout for the requested page", async () => {
    const updatedAt = new Date('2026-11-03T10:00:00Z')
    prisma.artistWorkspaceLayout.findUnique.mockResolvedValue({ tiles, updatedAt } as never)
    await expect(service.layout('artist-1', 'release-draft')).resolves.toEqual({
      page: 'release-draft',
      tiles,
      updatedAt,
    })
    expect(prisma.artistWorkspaceLayout.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          artistId_page: { artistId: 'artist-1', page: ArtistWorkspacePage.RELEASE_DRAFT },
        },
      }),
    )
  })

  it('treats a stored layout that no longer validates as the default', async () => {
    prisma.artistWorkspaceLayout.findUnique.mockResolvedValue({
      tiles: [{ id: 'x', size: 'XL', hidden: false }],
      updatedAt: new Date(),
    } as never)
    await expect(service.layout('artist-1', 'analytics')).resolves.toMatchObject({
      tiles: [],
      updatedAt: null,
    })
  })

  it('upserts the whole layout under the caller and page', async () => {
    const updatedAt = new Date('2026-11-03T11:00:00Z')
    prisma.artistWorkspaceLayout.upsert.mockResolvedValue({ updatedAt } as never)
    await expect(service.saveLayout('artist-1', 'dashboard', { tiles })).resolves.toEqual({
      page: 'dashboard',
      tiles,
      updatedAt,
    })
    expect(prisma.artistWorkspaceLayout.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { artistId_page: { artistId: 'artist-1', page: ArtistWorkspacePage.DASHBOARD } },
        create: { artistId: 'artist-1', page: ArtistWorkspacePage.DASHBOARD, tiles },
        update: { tiles },
      }),
    )
  })

  it("resets by deleting only the caller's layout for that page", async () => {
    prisma.artistWorkspaceLayout.deleteMany.mockResolvedValue({ count: 1 })
    await expect(service.resetLayout('artist-1', 'analytics')).resolves.toEqual({
      page: 'analytics',
      tiles: [],
      updatedAt: null,
    })
    expect(prisma.artistWorkspaceLayout.deleteMany).toHaveBeenCalledWith({
      where: { artistId: 'artist-1', page: ArtistWorkspacePage.ANALYTICS },
    })
  })
})

describe('SaveWorkspaceLayoutSchema', () => {
  it('accepts every integer column width and preserves it', () => {
    for (let columns = 1; columns <= 12; columns++) {
      const input = { tiles: [{ ...tiles[0], columns }] }
      expect(SaveWorkspaceLayoutSchema.parse(input)).toEqual(input)
    }
  })

  it('accepts heights 1–12 and rejects malformed heights', () => {
    for (let rows = 1; rows <= 12; rows++) {
      const input = { tiles: [{ ...tiles[0], rows }] }
      expect(SaveWorkspaceLayoutSchema.parse(input)).toEqual(input)
    }
    for (const rows of [0, 13, -1, 2.5, '6', null])
      expect(SaveWorkspaceLayoutSchema.safeParse({ tiles: [{ ...tiles[0], rows }] }).success).toBe(
        false,
      )
  })

  it('rejects invalid column widths', () => {
    for (const columns of [0, 13, -1, 2.5, '6', null])
      expect(
        SaveWorkspaceLayoutSchema.safeParse({ tiles: [{ ...tiles[0], columns }] }).success,
      ).toBe(false)
  })

  it('accepts a full layout', () => {
    expect(SaveWorkspaceLayoutSchema.safeParse({ tiles }).success).toBe(true)
  })

  it('rejects a tile listed twice', () => {
    const result = SaveWorkspaceLayoutSchema.safeParse({ tiles: [tiles[0], tiles[0]] })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe('validation.workspace.duplicate_tiles')
  })

  it('rejects unknown sizes, malformed ids and extra keys', () => {
    for (const tile of [
      { id: 'activity', size: 'XL', hidden: false },
      { id: 'Activity!', size: 'S', hidden: false },
      { id: 'activity', size: 'S', hidden: false, x: 1 },
    ])
      expect(SaveWorkspaceLayoutSchema.safeParse({ tiles: [tile] }).success).toBe(false)
  })

  it('rejects more tiles than any page has', () => {
    const many = Array.from({ length: 25 }, (_, index) => ({
      id: `tile-${index}`,
      size: 'M',
      hidden: false,
    }))
    expect(SaveWorkspaceLayoutSchema.safeParse({ tiles: many }).success).toBe(false)
  })
})
