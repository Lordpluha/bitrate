import type { CellRect } from './grid'
import type { StoredTile, TileDefinition } from './layout'

/** A visible saved tile, with the same geometry used by the grid assertions. */
export function placedTile(
  id: string,
  { x, y, w, h }: CellRect,
  size: StoredTile['size'] = 'M',
): StoredTile {
  return { id, size, columns: w, rows: h, x, y, hidden: false }
}

export const layoutDefinitions: TileDefinition[] = [
  {
    id: 'current',
    label: 'dashboard.current',
    size: { w: 8, h: 4 },
    minSize: { w: 4, h: 3 },
  },
  {
    id: 'activity',
    label: 'dashboard.activity.title',
    size: { w: 4, h: 4 },
    minSize: { w: 3, h: 2 },
  },
  {
    id: 'listening',
    label: 'dashboard.listening.title',
    size: { w: 6, h: 3 },
    minSize: { w: 3, h: 2 },
  },
]
