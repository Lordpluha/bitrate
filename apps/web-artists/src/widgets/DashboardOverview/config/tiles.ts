import type { TileDefinition } from '@features/workspace-layout'

/** Dashboard tiles in their default order: work first, then catalogue, then data. */
export const dashboardTiles: readonly TileDefinition[] = [
  { id: 'current', label: 'dashboard.current', sizes: ['M', 'L'], size: 'M' },
  {
    id: 'attention',
    label: 'dashboard.attention.title',
    sizes: ['S', 'M', 'L'],
    size: 'S',
  },
  {
    id: 'numbers',
    label: 'dashboard.numbers.title',
    sizes: ['S', 'M', 'L'],
    size: 'M',
  },
  {
    id: 'premiere',
    label: 'dashboard.premiere.title',
    sizes: ['S', 'M'],
    size: 'S',
  },
  {
    id: 'releases',
    label: 'music.table.yourReleases',
    sizes: ['M', 'L'],
    size: 'M',
  },
  {
    id: 'coming-up',
    label: 'dashboard.upcoming.title',
    sizes: ['S', 'M', 'L'],
    size: 'S',
  },
  {
    id: 'activity',
    label: 'dashboard.activity.title',
    sizes: ['S', 'M', 'L'],
    size: 'M',
  },
  {
    id: 'listening',
    label: 'dashboard.listening.title',
    sizes: ['S', 'M', 'L'],
    size: 'S',
  },
]
