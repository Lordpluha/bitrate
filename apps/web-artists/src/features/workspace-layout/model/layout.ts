import type { TranslationKey } from '@shared/i18n'
import { z } from 'zod'

const tileSizes = ['S', 'M', 'L'] as const
export type TileSize = (typeof tileSizes)[number]

/** Workspace pages whose tiles an artist can arrange; matches the API's page names. */
export type LayoutPage = 'dashboard' | 'analytics' | 'release-draft'

/** A tile a page offers: its name and the sizes that keep its content readable. */
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
  hidden: boolean
}

export const storedLayoutSchema = z.object({
  tiles: z.array(
    z.object({ id: z.string(), size: z.enum(tileSizes), hidden: z.boolean() }),
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
    left.every(
      (tile, index) =>
        tile.id === right[index]?.id &&
        tile.size === right[index]?.size &&
        tile.hidden === right[index]?.hidden,
    )
  )
}
