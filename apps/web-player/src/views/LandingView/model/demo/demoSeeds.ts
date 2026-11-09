import type { ArtistEntity } from '@entities/Artist'
import type { TrackEntity } from '@entities/Track'
import { queryOptions } from '@shared/api/client'
import { apiQueryKeys } from '@shared/api/queryKeys'
import {
  DEMO_ARTISTS,
  DEMO_CATEGORIES,
  DEMO_ME,
  DEMO_PLAYLISTS,
  DEMO_TRACK_LIST,
  demoTrack,
} from './demoData'
import type {
  DemoMutationEffect,
  DemoResolver,
  DemoSeed,
} from './demoQueryClient'

/** The demo track lists the scenes show. */
export const DEMO_TRACK_SETS = {
  liked: [0, 1, 3].map(demoTrack),
  playlist: [0, 2, 4, 5, 6].map(demoTrack),
  preview: [1, 0, 3, 4].map(demoTrack),
} as const satisfies Record<string, readonly TrackEntity[]>

const DEMO_ALBUM = { id: 'demo-al1', title: 'Afterglow' }

/** The tracks liked at the start; the like buttons edit this list locally. */
const LIKED_AT_START = [0, 1, 3].map(demoTrack)
/** The artists followed at the start. */
const FOLLOWED_AT_START = DEMO_ARTISTS.slice(0, 2)

/** Every query the landing's real blocks read, under the keys their hooks use. */
export const DEMO_SEEDS: readonly DemoSeed[] = [
  [apiQueryKeys.auth.me, DEMO_ME],
  [apiQueryKeys.tracks.likedAll, LIKED_AT_START],
  [apiQueryKeys.artists.following, FOLLOWED_AT_START],
  [apiQueryKeys.playlists.liked, []],
  [queryOptions('get', '/api/v1/playlists/me', {}).queryKey, DEMO_PLAYLISTS],
  [
    apiQueryKeys.discovery.categories(1, 100),
    {
      data: DEMO_CATEGORIES,
      limit: 100,
      page: 1,
      total: DEMO_CATEGORIES.length,
    },
  ],
  ...DEMO_ARTISTS.map(
    (artist): DemoSeed => [apiQueryKeys.artists.detail(artist.id), artist],
  ),
]

const ALBUMS_KEY = apiQueryKeys.tracks.albums([])

/** The album of any demo track list, whichever tracks the visitor left in it. */
export const resolveDemoQuery: DemoResolver = (key) => {
  const [scope, kind, ids] = key
  if (scope !== ALBUMS_KEY[0] || kind !== ALBUMS_KEY[1] || !Array.isArray(ids))
    return undefined
  return new Map(
    ids.map((id) => {
      const index = DEMO_TRACK_LIST.findIndex((track) => track.id === id)
      return [id, index % 3 === 2 ? null : DEMO_ALBUM] as const
    }),
  )
}

/** The `{ params: { path: { id } } }` an id-addressed mutation sends. */
const pathIdOf = (variables: unknown) => {
  if (typeof variables !== 'object' || variables === null) return null
  const params = 'params' in variables ? variables.params : null
  if (typeof params !== 'object' || params === null) return null
  const path = 'path' in params ? params.path : null
  if (typeof path !== 'object' || path === null) return null
  const id = 'id' in path ? path.id : null
  return typeof id === 'string' ? id : null
}

type ListEffectInput<TItem extends { id: string }> = {
  key: readonly unknown[]
  /** The item to add for an id; `null` removes it instead. */
  add: ((id: string) => TItem | undefined) | null
}

/** Adds an item to (or removes it from) a cached list, as the server's answer would. */
const listEffect =
  <TItem extends { id: string }>({
    key,
    add,
  }: ListEffectInput<TItem>): DemoMutationEffect =>
  ({ client, variables }) => {
    const id = pathIdOf(variables)
    if (!id) return
    client.setQueryData<TItem[]>(key, (list = []) => {
      const rest = list.filter((item) => item.id !== id)
      const item = add?.(id)
      return item ? [item, ...rest] : rest
    })
  }

const findTrack = (id: string) =>
  DEMO_TRACK_LIST.find((track) => track.id === id)
const findArtist = (id: string) =>
  DEMO_ARTISTS.find((artist) => artist.id === id)

/** Likes and follows change the demo cache; every other mutation is a quiet no-op. */
export const DEMO_EFFECTS: Readonly<Record<string, DemoMutationEffect>> = {
  'post /api/v1/tracks/{id}/like': listEffect<TrackEntity>({
    add: findTrack,
    key: apiQueryKeys.tracks.likedAll,
  }),
  'delete /api/v1/tracks/{id}/like': listEffect<TrackEntity>({
    add: null,
    key: apiQueryKeys.tracks.likedAll,
  }),
  'post /api/v1/artists/{id}/follow': listEffect<ArtistEntity>({
    add: findArtist,
    key: apiQueryKeys.artists.following,
  }),
  'delete /api/v1/artists/{id}/follow': listEffect<ArtistEntity>({
    add: null,
    key: apiQueryKeys.artists.following,
  }),
}
