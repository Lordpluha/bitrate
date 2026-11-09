import type { TranslationKey } from '@shared/i18n'
import { z } from 'zod'

const tileSizes = ['S', 'M', 'L'] as const
type TileSize = (typeof tileSizes)[number]

/** Workspace pages whose tiles an artist can arrange; matches the API's page names. */
export type LayoutPage = 'dashboard' | 'analytics' | 'release-draft'

/** A tile a page offers, with legacy presets for existing saved layouts. */
export interface TileDefinition {
  id: string
  label: TranslationKey
  sizes: readonly TileSize[]
  /** Its size in the default layout; one of `sizes`. */
  size: TileSize
}

export interface LayoutTile {
  id: string
  size: TileSize
  columns?: number
  /** Fixed content height in grid rows; omitted means fit the content. */
  rows?: number
  hidden: boolean
}

export const storedLayoutSchema = z.object({
  tiles: z.array(
    z.object({
      id: z.string(),
      size: z.enum(tileSizes),
      columns: z.number().int().min(1).max(12).optional(),
      rows: z.number().int().min(1).max(12).optional(),
      hidden: z.boolean(),
    }),
  ),
})

export function defaultLayout(
  definitions: readonly TileDefinition[],
): LayoutTile[] {
  return definitions.map(({ id, size }) => ({ id, size, hidden: false }))
}

/**
 * The page's tiles in the artist's order. Tiles the page no longer has are dropped, new ones
 * are appended in their default place, and a size the tile no longer allows falls back to
 * its default; so a stored layout never breaks a page that has changed since.
 */
export function mergeLayout(
  definitions: readonly TileDefinition[],
  stored: readonly LayoutTile[],
): LayoutTile[] {
  const byId = new Map(
    definitions.map((definition) => [definition.id, definition]),
  )
  const placed = new Set<string>()
  const merged: LayoutTile[] = []
  for (const tile of stored) {
    const definition = byId.get(tile.id)
    if (!definition || placed.has(tile.id)) continue
    placed.add(tile.id)
    merged.push({
      id: tile.id,
      size: definition.sizes.includes(tile.size) ? tile.size : definition.size,
      ...(tile.columns === undefined ? {} : { columns: tile.columns }),
      ...(tile.rows === undefined ? {} : { rows: tile.rows }),
      hidden: tile.hidden,
    })
  }
  for (const definition of definitions)
    if (!placed.has(definition.id))
      merged.push({ id: definition.id, size: definition.size, hidden: false })
  return merged
}

export function sameLayout(
  left: readonly LayoutTile[],
  right: readonly LayoutTile[],
) {
  return (
    left.length === right.length &&
    left.every((tile, index) => {
      const other = right[index]
      return (
        other !== undefined &&
        tile.id === other.id &&
        tileColumns(tile) === tileColumns(other) &&
        tile.rows === other.rows &&
        tile.hidden === other.hidden
      )
    })
  )
}

/** Numeric widths take precedence; existing presets keep their original geometry. */
export function tileColumns(
  tile: Pick<LayoutTile, 'size' | 'columns'>,
  variant: 'thirds' | 'halves' = 'thirds',
): number {
  if (tile.columns !== undefined) return tile.columns
  if (variant === 'halves') return tile.size === 'S' ? 6 : 12
  return { S: 4, M: 8, L: 12 }[tile.size]
}

export function clampColumns(columns: number): number {
  return Math.min(12, Math.max(1, Math.round(columns)))
}

export function columnsAfterDrag(
  start: number,
  delta: number,
  columnWidth: number,
): number {
  return clampColumns(start + delta / columnWidth)
}

/** The row pitch includes the gap, so a one-row card has exactly rowHeight pixels. */
export function rowsForHeight(height: number, rowHeight: number, gap: number) {
  return Math.max(1, Math.ceil((height + gap) / (rowHeight + gap)))
}
