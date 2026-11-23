/** Columns of the workspace grid; matches the API's `x + columns ≤ 12` rule. */
export const GRID_COLUMNS = 12

/** The tallest a tile may be, in rows; matches the API's `rows` limit. */
export const MAX_TILE_ROWS = 12

/** A size in grid cells. */
export interface CellSize {
  w: number
  h: number
}

/** A rectangle in grid cells; `x` and `y` are its top-left cell, counted from zero. */
export interface CellRect extends CellSize {
  x: number
  y: number
}

/** A tile placed on the grid. Tiles of one layout never overlap. */
export interface GridTile extends CellRect {
  id: string
}

export interface Placement {
  tiles: GridTile[]
  /** The tile got smaller than requested to fit an empty spot. */
  shrunk: boolean
}

const clamp = (value: number, low: number, high: number) =>
  Math.min(high, Math.max(low, value))

export function overlaps(a: CellRect, b: CellRect) {
  return (
    a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h
  )
}

function isFree(rect: CellRect, others: readonly CellRect[]) {
  return others.every((other) => !overlaps(rect, other))
}

const copy = (tiles: readonly GridTile[]) => tiles.map((tile) => ({ ...tile }))

/** Moves every tile `moved` overlaps to just below it, then does the same for each of those. */
function pushBelow(tiles: GridTile[], moved: GridTile) {
  for (const other of tiles) {
    if (other === moved || !overlaps(other, moved)) continue
    other.y = moved.y + moved.h
    pushBelow(tiles, other)
  }
}

/**
 * Puts tile `id` at `target`. It keeps the requested size when that spot is free; otherwise it
 * shrinks to the largest free rectangle there, not below `min`; only when even `min` does not
 * fit, the tiles it overlaps are pushed down.
 */
export function placeTile(
  tiles: readonly GridTile[],
  id: string,
  target: CellRect,
  min: CellSize,
): Placement {
  const next = copy(tiles)
  const tile = next.find((item) => item.id === id)
  if (!tile) return { tiles: next, shrunk: false }
  const others = next.filter((item) => item !== tile)
  const x = clamp(target.x, 0, GRID_COLUMNS - min.w)
  const y = Math.max(0, target.y)
  const w = clamp(target.w, min.w, GRID_COLUMNS - x)
  const h = clamp(target.h, min.h, MAX_TILE_ROWS)
  let best: CellSize | null = null
  for (let width = w; width >= min.w; width--)
    for (let height = h; height >= min.h; height--)
      if (
        (!best || width * height > best.w * best.h) &&
        isFree({ x, y, w: width, h: height }, others)
      )
        best = { w: width, h: height }
  Object.assign(tile, { x, y }, best ?? { w, h })
  if (!best) pushBelow(next, tile)
  return {
    tiles: next,
    shrunk: best !== null && (best.w < target.w || best.h < target.h),
  }
}

/** Resizes tile `id` in whole cells, within `min` and the twelve columns; pushes overlapped tiles down. */
export function resizeTile(
  tiles: readonly GridTile[],
  id: string,
  size: CellSize,
  min: CellSize,
): GridTile[] {
  const next = copy(tiles)
  const tile = next.find((item) => item.id === id)
  if (!tile) return next
  tile.w = clamp(size.w, min.w, GRID_COLUMNS - tile.x)
  tile.h = clamp(size.h, min.h, MAX_TILE_ROWS)
  pushBelow(next, tile)
  return next
}

/** Tiles by row, then by column: how the layout reads and how the phone view stacks it. */
export function readingOrder<T extends CellRect>(tiles: readonly T[]): T[] {
  return [...tiles].sort((a, b) => a.y - b.y || a.x - b.x)
}

/** Moves every tile up as far as it goes, once, in reading order. Columns stay. */
export function compactLayout(tiles: readonly GridTile[]): GridTile[] {
  const next = copy(tiles)
  for (const tile of readingOrder(next)) {
    const others = next.filter((item) => item !== tile)
    while (tile.y > 0 && isFree({ ...tile, y: tile.y - 1 }, others)) tile.y--
  }
  return next
}

/** The first cell from the top left where a tile of `size` fits without overlapping. */
export function firstFreeSpot(
  tiles: readonly CellRect[],
  size: CellSize,
): Pick<CellRect, 'x' | 'y'> {
  const w = clamp(size.w, 1, GRID_COLUMNS)
  for (let y = 0; ; y++)
    for (let x = 0; x <= GRID_COLUMNS - w; x++)
      if (isFree({ x, y, w, h: size.h }, tiles)) return { x, y }
}

/** A resize handle: an edge or a corner of the tile, named by compass direction. */
export type ResizeHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

export const RESIZE_HANDLES: readonly ResizeHandle[] = [
  'n',
  's',
  'e',
  'w',
  'ne',
  'nw',
  'se',
  'sw',
]

/**
 * Resizes tile `id` by dragging `handle` by `delta` cells; the opposite edges stay put. The
 * left and top edges stop at the nearest tile, since tiles only ever move down; growing right
 * or down pushes overlapped tiles down. The size stays within `min` and the grid.
 */
export function resizeTileFrom(
  tiles: readonly GridTile[],
  id: string,
  handle: ResizeHandle,
  delta: { x: number; y: number },
  min: CellSize,
): GridTile[] {
  const next = copy(tiles)
  const tile = next.find((item) => item.id === id)
  if (!tile) return next
  const start = { ...tile }
  const others = next.filter((item) => item !== tile)
  if (handle.includes('e'))
    tile.w = clamp(start.w + delta.x, min.w, GRID_COLUMNS - start.x)
  if (handle.includes('s'))
    tile.h = clamp(start.h + delta.y, min.h, MAX_TILE_ROWS)
  if (handle.includes('w')) {
    const right = start.x + start.w
    const stops = others
      .filter(
        (other) =>
          other.x + other.w <= start.x &&
          other.y < start.y + start.h &&
          start.y < other.y + other.h,
      )
      .map((other) => other.x + other.w)
    tile.x = Math.max(clamp(start.x + delta.x, 0, right - min.w), ...stops)
    tile.w = right - tile.x
  }
  if (handle.includes('n')) {
    const bottom = start.y + start.h
    const stops = others
      .filter(
        (other) =>
          other.y + other.h <= start.y &&
          other.x < tile.x + tile.w &&
          tile.x < other.x + other.w,
      )
      .map((other) => other.y + other.h)
    tile.y = Math.max(
      clamp(
        start.y + delta.y,
        Math.max(0, bottom - MAX_TILE_ROWS),
        bottom - min.h,
      ),
      ...stops,
    )
    tile.h = bottom - tile.y
  }
  pushBelow(next, tile)
  return next
}
