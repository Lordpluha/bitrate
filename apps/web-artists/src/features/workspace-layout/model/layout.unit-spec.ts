import { describe, expect, it } from 'vitest'
import { type GridTile, overlaps } from './grid'
import {
  defaultLayout,
  fromStoredLayout,
  type StoredTile,
  sameLayout,
  sameStoredLayout,
  storedLayoutSchema,
  toStoredLayout,
} from './layout'
import { layoutDefinitions as definitions, placedTile } from './layout.fixtures'

function expectNoOverlap(tiles: readonly GridTile[]) {
  for (const [index, tile] of tiles.entries())
    for (const other of tiles.slice(index + 1))
      expect(overlaps(tile, other), `${tile.id} overlaps ${other.id}`).toBe(
        false,
      )
}

describe('defaultLayout', () => {
  it('flows the default sizes left to right, then top to bottom', () => {
    expect(defaultLayout(definitions)).toEqual([
      { id: 'current', x: 0, y: 0, w: 8, h: 4 },
      { id: 'activity', x: 8, y: 0, w: 4, h: 4 },
      { id: 'listening', x: 0, y: 4, w: 6, h: 3 },
    ])
  })
})

describe('fromStoredLayout', () => {
  it('uses the default layout when nothing is stored', () => {
    expect(fromStoredLayout(definitions, [])).toEqual(
      defaultLayout(definitions),
    )
  })

  it('keeps stored positions, sizes and leaves hidden tiles off the grid', () => {
    const stored: StoredTile[] = [
      placedTile('activity', { x: 8, y: 6, w: 4, h: 2 }, 'S'),
      placedTile('current', { x: 0, y: 0, w: 6, h: 3 }),
      { id: 'listening', size: 'M', columns: 6, rows: 3, hidden: true },
    ]
    expect(fromStoredLayout(definitions, stored)).toEqual([
      { id: 'activity', x: 8, y: 6, w: 4, h: 2 },
      { id: 'current', x: 0, y: 0, w: 6, h: 3 },
    ])
  })

  it('flows a legacy layout in stored order, from presets or columns and rows', () => {
    const stored: StoredTile[] = [
      { id: 'listening', size: 'S', hidden: false },
      { id: 'current', size: 'L', hidden: false },
      { id: 'activity', size: 'S', columns: 5, rows: 2, hidden: false },
    ]
    const tiles = fromStoredLayout(definitions, stored)
    expect(tiles).toEqual([
      { id: 'listening', x: 0, y: 0, w: 4, h: 3 },
      { id: 'current', x: 0, y: 3, w: 12, h: 4 },
      { id: 'activity', x: 0, y: 7, w: 5, h: 2 },
    ])
    expectNoOverlap(tiles)
  })

  it('converts legacy hidden tiles to tiles in the drawer', () => {
    const tiles = fromStoredLayout(definitions, [
      { id: 'current', size: 'M', hidden: true },
      { id: 'activity', size: 'S', hidden: false },
      { id: 'listening', size: 'M', hidden: false },
    ])
    expect(tiles.map((tile) => tile.id)).toEqual(['activity', 'listening'])
    expectNoOverlap(tiles)
  })

  it('raises sizes below the minimum and keeps tiles within twelve columns', () => {
    const [tile] = fromStoredLayout(definitions.slice(0, 1), [
      placedTile('current', { x: 11, y: 0, w: 1, h: 1 }, 'S'),
    ])
    expect(tile).toEqual({ id: 'current', x: 8, y: 0, w: 4, h: 3 })
  })

  it('moves overlapping stored tiles down instead of stacking them', () => {
    const tiles = fromStoredLayout(definitions, [
      placedTile('current', { x: 0, y: 0, w: 8, h: 4 }),
      placedTile('activity', { x: 6, y: 2, w: 4, h: 4 }, 'S'),
      placedTile('listening', { x: 6, y: 4, w: 6, h: 3 }),
    ])
    expectNoOverlap(tiles)
    expect(tiles.find((tile) => tile.id === 'current')).toEqual({
      id: 'current',
      x: 0,
      y: 0,
      w: 8,
      h: 4,
    })
  })

  it('drops tiles the page no longer has and adds new ones at the first free spot', () => {
    const tiles = fromStoredLayout(definitions, [
      placedTile('retired', { x: 0, y: 0, w: 12, h: 2 }, 'L'),
      placedTile('current', { x: 0, y: 0, w: 8, h: 4 }),
      placedTile('current', { x: 8, y: 0, w: 4, h: 4 }),
    ])
    expect(tiles).toEqual([
      { id: 'current', x: 0, y: 0, w: 8, h: 4 },
      { id: 'activity', x: 8, y: 0, w: 4, h: 4 },
      { id: 'listening', x: 0, y: 4, w: 6, h: 3 },
    ])
  })
})

describe('toStoredLayout', () => {
  it('stores every tile with coordinates, and drawer tiles as hidden', () => {
    const stored = toStoredLayout(definitions, [
      { id: 'activity', x: 6, y: 3, w: 6, h: 2 },
      { id: 'current', x: 0, y: 0, w: 4, h: 3 },
    ])
    expect(stored).toEqual([
      placedTile('current', { x: 0, y: 0, w: 4, h: 3 }, 'S'),
      placedTile('activity', { x: 6, y: 3, w: 6, h: 2 }),
      { id: 'listening', size: 'M', columns: 6, rows: 3, hidden: true },
    ])
    expect(storedLayoutSchema.safeParse({ tiles: stored }).success).toBe(true)
  })

  it('round-trips through fromStoredLayout', () => {
    const tiles: GridTile[] = [
      { id: 'current', x: 2, y: 1, w: 7, h: 5 },
      { id: 'listening', x: 0, y: 7, w: 12, h: 2 },
    ]
    expect(
      fromStoredLayout(definitions, toStoredLayout(definitions, tiles)),
    ).toEqual(tiles)
  })
})

describe('sameLayout', () => {
  const tiles: GridTile[] = [
    { id: 'current', x: 0, y: 0, w: 8, h: 4 },
    { id: 'activity', x: 8, y: 0, w: 4, h: 4 },
  ]

  it('ignores list order', () => {
    expect(sameLayout(tiles, [...tiles].reverse())).toBe(true)
  })

  it('detects moved, resized, removed and added tiles', () => {
    const [first, second] = tiles as [GridTile, GridTile]
    expect(sameLayout(tiles, [{ ...first, x: 1 }, second])).toBe(false)
    expect(sameLayout(tiles, [{ ...first, h: 5 }, second])).toBe(false)
    expect(sameLayout(tiles, [first])).toBe(false)
    expect(
      sameLayout(tiles, [
        ...tiles,
        { id: 'listening', x: 0, y: 4, w: 6, h: 3 },
      ]),
    ).toBe(false)
  })
})

describe('storedLayoutSchema', () => {
  it('accepts layouts with and without coordinates', () => {
    expect(
      storedLayoutSchema.safeParse({
        tiles: [
          { id: 'a', size: 'S', hidden: false },
          placedTile('b', { x: 6, y: 0, w: 6, h: 2 }),
        ],
      }).success,
    ).toBe(true)
  })

  it('rejects malformed coordinates', () => {
    for (const x of [-1, 12, 1.5, '2'])
      expect(
        storedLayoutSchema.safeParse({
          tiles: [{ id: 'a', size: 'S', x, y: 0, hidden: false }],
        }).success,
      ).toBe(false)
  })
})

describe('sameStoredLayout', () => {
  const stored: StoredTile[] = [
    placedTile('current', { x: 0, y: 0, w: 8, h: 4 }),
    { id: 'activity', size: 'S', columns: 4, rows: 4, hidden: true },
  ]

  it('accepts the same tiles in the same order', () => {
    expect(sameStoredLayout(stored, structuredClone(stored))).toBe(true)
  })

  it('detects a changed cell, visibility or order', () => {
    const [first, second] = stored as [StoredTile, StoredTile]
    expect(sameStoredLayout(stored, [{ ...first, y: 1 }, second])).toBe(false)
    expect(
      sameStoredLayout(stored, [first, { ...second, hidden: false }]),
    ).toBe(false)
    expect(sameStoredLayout(stored, [second, first])).toBe(false)
  })
})
