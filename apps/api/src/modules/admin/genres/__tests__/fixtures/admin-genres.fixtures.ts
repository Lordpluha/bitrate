/** Builds a genre row as the admin select returns it, with its reference counts. */
export const buildAdminGenre = (
  overrides: Partial<{
    id: string
    slug: string
    name: string
    description: string | null
    color: string | null
    tracks: number
    albums: number
    artists: number
  }> = {},
) => {
  const { tracks = 0, albums = 0, artists = 0, ...fields } = overrides
  return {
    id: 'genre-1',
    slug: 'synthwave',
    name: 'Synthwave',
    description: null,
    color: '#ff00aa',
    cover: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    _count: { tracks, albums, artists },
    ...fields,
  }
}
