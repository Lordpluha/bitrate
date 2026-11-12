import { describe, expect, it } from 'vitest'
import {
  type CellRect,
  compactLayout,
  firstFreeSpot,
  type GridTile,
  placeTile,
  type ResizeHandle,
  readingOrder,
  resizeTile,
  resizeTileFrom,
} from './grid'

const min = { w: 2, h: 2 }

const byId = (tiles: readonly GridTile[], id: string) =>
  tiles.find((tile) => tile.id === id)

describe('placeTile', () => {
  const tiles: GridTile[] = [
    { id: 'a', x: 0, y: 0, w: 4, h: 3 },
    { id: 'b', x: 4, y: 0, w: 4, h: 3 },
    { id: 'c', x: 8, y: 0, w: 4, h: 3 },
  ]

  it('keeps the size when the target spot is free', () => {
    const result = placeTile(tiles, 'a', { x: 2, y: 5, w: 4, h: 3 }, min)
    expect(result.shrunk).toBe(false)
    expect(byId(result.tiles, 'a')).toEqual({ id: 'a', x: 2, y: 5, w: 4, h: 3 })
    expect(byId(result.tiles, 'b')).toEqual(tiles[1])
  })

  it('shrinks to the largest free rectangle at the spot', () => {
    // Above the lowered 'c' only a 4×2 gap is free.
    const lowered: GridTile[] = [
      { id: 'a', x: 0, y: 4, w: 4, h: 3 },
      { id: 'b', x: 0, y: 0, w: 8, h: 3 },
      { id: 'c', x: 8, y: 2, w: 4, h: 3 },
    ]
    const result = placeTile(lowered, 'a', { x: 8, y: 0, w: 4, h: 3 }, min)
    expect(result.shrunk).toBe(true)
    expect(byId(result.tiles, 'a')).toEqual({ id: 'a', x: 8, y: 0, w: 4, h: 2 })
    expect(byId(result.tiles, 'c')).toEqual(lowered[2])
  })

  it('pushes overlapped tiles down when even the minimum does not fit', () => {
    const result = placeTile(tiles, 'a', { x: 4, y: 0, w: 4, h: 3 }, min)
    expect(result.shrunk).toBe(false)
    expect(byId(result.tiles, 'a')).toEqual({ id: 'a', x: 4, y: 0, w: 4, h: 3 })
    expect(byId(result.tiles, 'b')).toEqual({ id: 'b', x: 4, y: 3, w: 4, h: 3 })
    expect(byId(result.tiles, 'c')).toEqual(tiles[2])
  })

  it('pushes recursively, so displaced tiles never overlap', () => {
    const stacked: GridTile[] = [
      { id: 'a', x: 6, y: 0, w: 6, h: 2 },
      { id: 'b', x: 0, y: 0, w: 6, h: 2 },
      { id: 'c', x: 0, y: 2, w: 6, h: 2 },
    ]
    const result = placeTile(stacked, 'a', { x: 0, y: 0, w: 6, h: 2 }, min)
    expect(byId(result.tiles, 'b')).toEqual({ id: 'b', x: 0, y: 2, w: 6, h: 2 })
    expect(byId(result.tiles, 'c')).toEqual({ id: 'c', x: 0, y: 4, w: 6, h: 2 })
  })

  it('keeps the tile inside the twelve columns and above row zero', () => {
    const result = placeTile(tiles, 'a', { x: 11, y: -3, w: 4, h: 3 }, min)
    const placed = byId(result.tiles, 'a')
    expect(placed?.x).toBe(10)
    expect(placed?.y).toBe(0)
    expect((placed?.x ?? 0) + (placed?.w ?? 0)).toBeLessThanOrEqual(12)
  })

  it('does not change the input', () => {
    const before = structuredClone(tiles)
    placeTile(tiles, 'a', { x: 4, y: 0, w: 4, h: 3 }, min)
    expect(tiles).toEqual(before)
  })
})

describe('resizeTile', () => {
  const tiles: GridTile[] = [
    { id: 'a', x: 0, y: 0, w: 4, h: 2 },
    { id: 'b', x: 0, y: 2, w: 4, h: 2 },
    { id: 'c', x: 0, y: 4, w: 4, h: 2 },
  ]

  it('changes the size in whole cells and pushes overlapped tiles down', () => {
    const next = resizeTile(tiles, 'a', { w: 6, h: 3 }, min)
    expect(byId(next, 'a')).toEqual({ id: 'a', x: 0, y: 0, w: 6, h: 3 })
    expect(byId(next, 'b')).toEqual({ id: 'b', x: 0, y: 3, w: 4, h: 2 })
    expect(byId(next, 'c')).toEqual({ id: 'c', x: 0, y: 5, w: 4, h: 2 })
  })

  it('never goes below the minimum', () => {
    expect(byId(resizeTile(tiles, 'a', { w: 0, h: -2 }, min), 'a')).toEqual({
      id: 'a',
      x: 0,
      y: 0,
      w: 2,
      h: 2,
    })
  })

  it('never grows past the twelfth column', () => {
    const shifted: GridTile[] = [{ id: 'a', x: 9, y: 0, w: 2, h: 2 }]
    expect(byId(resizeTile(shifted, 'a', { w: 8, h: 2 }, min), 'a')?.w).toBe(3)
  })
})

describe('compactLayout', () => {
  it('pulls every tile up once, in reading order, keeping columns', () => {
    const tiles: GridTile[] = [
      { id: 'low', x: 0, y: 6, w: 6, h: 2 },
      { id: 'right', x: 6, y: 3, w: 6, h: 2 },
      { id: 'top', x: 0, y: 1, w: 6, h: 2 },
    ]
    expect(compactLayout(tiles)).toEqual([
      { id: 'low', x: 0, y: 2, w: 6, h: 2 },
      { id: 'right', x: 6, y: 0, w: 6, h: 2 },
      { id: 'top', x: 0, y: 0, w: 6, h: 2 },
    ])
  })

  it('stops a tile under the first tile above it', () => {
    const tiles: GridTile[] = [
      { id: 'wide', x: 0, y: 0, w: 12, h: 2 },
      { id: 'under', x: 4, y: 5, w: 4, h: 2 },
    ]
    expect(byId(compactLayout(tiles), 'under')?.y).toBe(2)
  })
})

describe('firstFreeSpot', () => {
  it('finds the first spot from the top left that fits the size', () => {
    const tiles: GridTile[] = [
      { id: 'a', x: 0, y: 0, w: 8, h: 2 },
      { id: 'b', x: 0, y: 2, w: 3, h: 2 },
    ]
    expect(firstFreeSpot(tiles, { w: 4, h: 2 })).toEqual({ x: 8, y: 0 })
    expect(firstFreeSpot(tiles, { w: 5, h: 2 })).toEqual({ x: 3, y: 2 })
  })

  it('uses the top left of an empty grid', () => {
    expect(firstFreeSpot([], { w: 12, h: 3 })).toEqual({ x: 0, y: 0 })
  })
})

describe('readingOrder', () => {
  it('orders tiles by row, then column', () => {
    const tiles: GridTile[] = [
      { id: 'c', x: 0, y: 4, w: 4, h: 2 },
      { id: 'b', x: 6, y: 0, w: 4, h: 2 },
      { id: 'a', x: 0, y: 0, w: 4, h: 2 },
    ]
    expect(readingOrder(tiles).map((tile) => tile.id)).toEqual(['a', 'b', 'c'])
  })
})

describe('resizeTileFrom', () => {
  const tiles: GridTile[] = [
    { id: 'left', x: 0, y: 2, w: 3, h: 3 },
    { id: 'above', x: 4, y: 0, w: 4, h: 2 },
    { id: 'tile', x: 5, y: 3, w: 4, h: 3 },
    { id: 'below', x: 5, y: 6, w: 4, h: 2 },
  ]

  it.each<[ResizeHandle, number, number, CellRect]>([
    ['w', -1, 0, { x: 4, y: 3, w: 5, h: 3 }],
    ['w', -9, 0, { x: 3, y: 3, w: 6, h: 3 }],
    ['n', 0, -5, { x: 5, y: 2, w: 4, h: 4 }],
    ['nw', 5, 5, { x: 7, y: 4, w: 2, h: 2 }],
    ['e', 1, 4, { x: 5, y: 3, w: 5, h: 3 }],
    ['s', -3, -1, { x: 5, y: 3, w: 4, h: 2 }],
  ])(
    'resizes %s by (%i, %i), respecting neighbors and opposite edges',
    (handle, x, y, expected) => {
      const next = resizeTileFrom(tiles, 'tile', handle, { x, y }, min)
      expect(byId(next, 'tile')).toEqual({ id: 'tile', ...expected })
    },
  )

  it('grows from the right and bottom edges and pushes overlapped tiles down', () => {
    const next = resizeTileFrom(tiles, 'tile', 'se', { x: 2, y: 1 }, min)
    expect(byId(next, 'tile')).toEqual({ id: 'tile', x: 5, y: 3, w: 6, h: 4 })
    expect(byId(next, 'below')).toEqual({ id: 'below', x: 5, y: 7, w: 4, h: 2 })
  })

  it('stays inside the grid from every side', () => {
    const lone: GridTile[] = [{ id: 'tile', x: 2, y: 1, w: 4, h: 2 }]
    expect(
      byId(resizeTileFrom(lone, 'tile', 'nw', { x: -9, y: -9 }, min), 'tile'),
    ).toEqual({ id: 'tile', x: 0, y: 0, w: 6, h: 3 })
    expect(
      byId(resizeTileFrom(lone, 'tile', 'e', { x: 20, y: 0 }, min), 'tile')?.w,
    ).toBe(10)
  })
})
