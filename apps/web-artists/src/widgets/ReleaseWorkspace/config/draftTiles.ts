import type { TileDefinition } from '@features/workspace-layout'

/** The Draft stage's editors in their default order; S is half the column, L all of it. */
export const draftTiles: readonly TileDefinition[] = [
  {
    id: 'timing',
    label: 'release.roadmap.timing',
    sizes: ['S', 'L'],
    size: 'L',
  },
  {
    id: 'tracks',
    label: 'workspace.tracks.title',
    sizes: ['S', 'L'],
    size: 'L',
  },
  {
    id: 'credits',
    label: 'workspace.credits.title',
    sizes: ['S', 'L'],
    size: 'S',
  },
  {
    id: 'rights',
    label: 'workspace.rights.title',
    sizes: ['S', 'L'],
    size: 'S',
  },
]
