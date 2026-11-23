import type { TranslationKey } from '@shared/i18n'
import { z } from 'zod'
import {
  type CellSize,
  firstFreeSpot,
  GRID_COLUMNS,
  type GridTile,
  MAX_TILE_ROWS,
  overlaps,
  readingOrder,
} from './grid'

const tileSizes = ['S', 'M', 'L'] as const
type TilePreset = (typeof tileSizes)[number]

/** Workspace pages whose tiles an artist can arrange; matches the API's page names. */
export type LayoutPage = 'dashboard' | 'analytics' | 'release-draft'

/** A tile a page offers. Sizes are in grid cells. */
export interface TileDefinition {
  id: string
  label: TranslationKey
  /** Its size in the default layout and when it comes back from the drawer. */
  size: CellSize
  /** The smallest size its content still works at. */
  minSize: CellSize
}

/** A tile as the API stores it. Layouts saved before the free grid have no `x` and `y`. */
export interface StoredTile {
  id: string
  /** Legacy width preset; `columns` takes precedence. */
  size: TilePreset
  columns?: number
  rows?: number
  x?: number
  y?: number
  hidden: boolean
}

/** The deepest row the API accepts as a tile's top. */
const MAX_TOP_ROW = 199

export const storedLayoutSchema = z.object({
  tiles: z.array(
    z.object({
      id: z.string(),
      size: z.enum(tileSizes),
      columns: z.number().int().min(1).max(GRID_COLUMNS).optional(),
      rows: z.number().int().min(1).max(MAX_TILE_ROWS).optional(),
      x: z
        .number()
        .int()
        .min(0)
        .max(GRID_COLUMNS - 1)
        .optional(),
      y: z.number().int().min(0).max(MAX_TOP_ROW).optional(),
      hidden: z.boolean(),
    }),
  ),
})

/** Widths of the legacy presets in the twelve-column grid. */
const PRESET_COLUMNS: Record<TilePreset, number> = { S: 4, M: 8, L: 12 }

/** The closest legacy preset, so older clients still read a sensible width. */
const presetFor = (columns: number): TilePreset =>
  columns <= 4 ? 'S' : columns <= 8 ? 'M' : 'L'

const clamp = (value: number, low: number, high: number) =>
  Math.min(high, Math.max(low, value))

/** Places tiles left to right in the given order, starting a new band when a row is full. */
function flow(items: ReadonlyArray<{ id: string } & CellSize>): GridTile[] {
  let x = 0
  let y = 0
  let bandHeight = 0
  return items.map(({ id, w, h }) => {
    if (x + w > GRID_COLUMNS) {
      x = 0
      y += bandHeight
      bandHeight = 0
    }
    const tile = { id, x, y, w, h }
    x += w
    bandHeight = Math.max(bandHeight, h)
    return tile
  })
}

/** Moves each tile down, in reading order, until it overlaps none placed before it. */
function separate(tiles: readonly GridTile[]): GridTile[] {
  const settled: GridTile[] = []
  for (const tile of readingOrder(tiles)) {
    const next = { ...tile }
    while (settled.some((other) => overlaps(next, other))) next.y++
    settled.push(next)
  }
  const byId = new Map(settled.map((tile) => [tile.id, tile]))
  return tiles.map((tile) => byId.get(tile.id) ?? tile)
}

export function defaultLayout(
  definitions: readonly TileDefinition[],
): GridTile[] {
  return flow(definitions.map(({ id, size }) => ({ id, ...size })))
}

/**
 * The page's tiles on the grid from what the API stored. Tiles the page no longer has are
 * dropped; hidden tiles stay off the grid, in the drawer; tiles new to the page take the first
 * free spot. A layout without coordinates flows in its stored order.
 */
export function fromStoredLayout(
  definitions: readonly TileDefinition[],
  stored: readonly StoredTile[],
): GridTile[] {
  if (stored.length === 0) return defaultLayout(definitions)
  const byId = new Map(
    definitions.map((definition) => [definition.id, definition]),
  )
  const listed = new Set<string>()
  const visible: Array<{ tile: StoredTile; definition: TileDefinition }> = []
  for (const tile of stored) {
    const definition = byId.get(tile.id)
    if (!definition || listed.has(tile.id)) continue
    listed.add(tile.id)
    if (!tile.hidden) visible.push({ tile, definition })
  }
  const sized = visible.map(({ tile, definition: { minSize, size } }) => {
    const w = clamp(
      tile.columns ?? PRESET_COLUMNS[tile.size],
      minSize.w,
      GRID_COLUMNS,
    )
    return {
      id: tile.id,
      x: clamp(tile.x ?? 0, 0, GRID_COLUMNS - w),
      y: tile.y ?? 0,
      w,
      h: clamp(tile.rows ?? size.h, minSize.h, MAX_TILE_ROWS),
    }
  })
  const positioned = visible.every(
    ({ tile }) => tile.x !== undefined && tile.y !== undefined,
  )
  const tiles = positioned ? separate(sized) : flow(sized)
  for (const definition of definitions) {
    if (listed.has(definition.id)) continue
    const spot = firstFreeSpot(tiles, definition.size)
    tiles.push({ id: definition.id, ...spot, ...definition.size })
  }
  return tiles
}

/** The whole layout for the API: placed tiles in reading order, then drawer tiles as hidden. */
export function toStoredLayout(
  definitions: readonly TileDefinition[],
  tiles: readonly GridTile[],
): StoredTile[] {
  const placed = new Set(tiles.map((tile) => tile.id))
  return [
    ...readingOrder(tiles).map(({ id, x, y, w, h }) => ({
      id,
      size: presetFor(w),
      columns: w,
      rows: h,
      x,
      y,
      hidden: false,
    })),
    ...definitions
      .filter((definition) => !placed.has(definition.id))
      .map(({ id, size }) => ({
        id,
        size: presetFor(size.w),
        columns: size.w,
        rows: size.h,
        hidden: true,
      })),
  ]
}

const tileKey = ({ id, x, y, w, h }: GridTile) => `${id}:${x}:${y}:${w}:${h}`

/** The same tiles at the same cells, in any order. */
export function sameLayout(
  left: readonly GridTile[],
  right: readonly GridTile[],
) {
  const keys = new Set(left.map(tileKey))
  return (
    left.length === right.length &&
    right.every((tile) => keys.has(tileKey(tile)))
  )
}

const storedKey = (tile: StoredTile) =>
  [tile.id, tile.columns, tile.rows, tile.x, tile.y, tile.hidden].join(':')

/** The API kept exactly what was sent: same tiles, cells and visibility, in the same order. */
export function sameStoredLayout(
  left: readonly StoredTile[],
  right: readonly StoredTile[],
) {
  return (
    left.length === right.length &&
    left.every((tile, index) => {
      const other = right[index]
      return other !== undefined && storedKey(tile) === storedKey(other)
    })
  )
}
