export const apiQueryKeys = {
  albums: {
    all: ['albums'] as const,
    artist: (artistId: string) => ['albums', 'artist', artistId] as const,
    detail: (albumId: string) => ['albums', 'detail', albumId] as const,
    liked: ['albums', 'liked'] as const,
    list: (params: {
      artistId?: string
      page?: number
      limit?: number
      title?: string
    }) => ['albums', 'list', params] as const,
  },
  artists: {
    all: ['artists'] as const,
    detail: (artistId: string) => ['artists', 'detail', artistId] as const,
    following: ['artists', 'following'] as const,
    list: (params: { page?: number; limit?: number }) =>
      ['artists', 'list', params] as const,
    related: (artistId: string) => ['artists', 'related', artistId] as const,
  },
  discovery: {
    all: ['discovery'] as const,
    categories: (page: number, limit: number) =>
      ['discovery', 'categories', { page, limit }] as const,
    categoryPlaylists: (slug: string, page: number, limit: number) =>
      ['discovery', 'category-playlists', { slug, page, limit }] as const,
    charts: (
      scope: string,
      country: string | undefined,
      page: number,
      limit: number,
      genre?: string,
    ) =>
      ['discovery', 'charts', { scope, country, page, limit, genre }] as const,
    artistPlaylists: (artistId: string, page: number, limit: number) =>
      ['discovery', 'artist-playlists', { artistId, page, limit }] as const,
    artistCharts: (scope: string, page: number, limit: number) =>
      ['discovery', 'artist-charts', { scope, page, limit }] as const,
    feed: ['discovery', 'feed'] as const,
    topArtists: (range: string, page: number, limit: number) =>
      ['discovery', 'top-artists', { range, page, limit }] as const,
    topTracks: (range: string, page: number, limit: number) =>
      ['discovery', 'top-tracks', { range, page, limit }] as const,
  },
  auth: {
    me: ['auth', 'me'] as const,
  },
  history: {
    all: ['history'] as const,
    list: (params: { page?: number; limit?: number }) =>
      ['history', 'list', params] as const,
  },
  playlists: {
    all: ['playlists'] as const,
    detail: (playlistId: string) =>
      ['playlists', 'detail', playlistId] as const,
    list: (params: { page?: number; limit?: number }) =>
      ['playlists', 'list', params] as const,
    liked: ['playlists', 'liked'] as const,
    mine: ['playlists', 'mine'] as const,
  },
  me: {
    all: ['me'] as const,
    notifications: (page: number, limit: number) =>
      ['me', 'notifications', { page, limit }] as const,
    playerDevices: ['me', 'player', 'devices'] as const,
    settings: ['me', 'settings'] as const,
    subscription: ['me', 'subscription'] as const,
  },
  search: {
    all: ['search'] as const,
    history: (page: number, limit: number) =>
      ['search', 'history', { page, limit }] as const,
    results: (params: { query: string; types?: string[]; limit?: number }) =>
      ['search', 'results', params] as const,
  },
  tracks: {
    all: ['tracks'] as const,
    albums: (trackIds: string[]) => ['tracks', 'albums', trackIds] as const,
    artist: (artistId: string) => ['tracks', 'artist', artistId] as const,
    artistTop: (artistId: string, limit: number) =>
      ['tracks', 'artist', artistId, 'top', { limit }] as const,
    detail: (trackId: string) => ['tracks', 'detail', trackId] as const,
    liked: (params: { page?: number; limit?: number }) =>
      ['tracks', 'liked', params] as const,
    likedAll: ['tracks', 'liked', 'all'] as const,
    manifest: (trackId: string) => ['tracks', 'manifest', trackId] as const,
    list: (params: {
      artistId?: string
      page?: number
      limit?: number
      title?: string
    }) => ['tracks', 'list', params] as const,
  },
  friends: {
    all: ['friends'] as const,
    list: ['friends', 'list'] as const,
    requests: (direction: 'incoming' | 'outgoing') =>
      ['friends', 'requests', direction] as const,
  },
  users: {
    all: ['users'] as const,
    byId: (userId: string) => ['users', 'by-id', userId] as const,
    following: ['users', 'following'] as const,
    followingActivity: ['users', 'following', 'activity'] as const,
    follows: (userId: string, kind: 'followers' | 'following', limit: number) =>
      ['users', 'follows', userId, kind, { limit }] as const,
  },
} as const
