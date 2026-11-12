import type { TileDefinition } from '@features/workspace-layout'

/**
 * Dashboard tiles in their default order: work first, then catalogue, then data. Sizes are
 * cells of the 12-column workspace grid.
 */
export const dashboardTiles: readonly TileDefinition[] = [
  {
    id: 'current',
    label: 'dashboard.current',
    size: { w: 8, h: 6 },
    minSize: { w: 4, h: 4 },
  },
  {
    id: 'attention',
    label: 'dashboard.attention.title',
    size: { w: 4, h: 6 },
    minSize: { w: 3, h: 2 },
  },
  {
    id: 'numbers',
    label: 'dashboard.numbers.title',
    size: { w: 8, h: 3 },
    minSize: { w: 4, h: 2 },
  },
  {
    id: 'premiere',
    label: 'dashboard.premiere.title',
    size: { w: 4, h: 3 },
    minSize: { w: 3, h: 2 },
  },
  {
    id: 'releases',
    label: 'music.table.yourReleases',
    size: { w: 8, h: 6 },
    minSize: { w: 4, h: 3 },
  },
  {
    id: 'coming-up',
    label: 'dashboard.upcoming.title',
    size: { w: 4, h: 6 },
    minSize: { w: 3, h: 3 },
  },
  {
    id: 'activity',
    label: 'dashboard.activity.title',
    size: { w: 8, h: 4 },
    minSize: { w: 4, h: 3 },
  },
  {
    id: 'listening',
    label: 'dashboard.listening.title',
    size: { w: 4, h: 4 },
    minSize: { w: 3, h: 3 },
  },
]
