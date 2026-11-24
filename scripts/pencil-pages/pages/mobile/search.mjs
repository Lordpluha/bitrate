// Native app: Search — debounced query over GET /search with result-type chips.
import {
  ArtistCard,
  BigCover,
  Chips,
  EmptyState,
  ErrorState,
  Input,
  MobileTrack,
  Panel,
  Skeleton,
  Tx,
} from '../../ui.mjs'
import { AppScreen, Scroller, Section, ms } from './shell.mjs'

const FILTERS = ['All', 'Tracks', 'Artists', 'Albums', 'Playlists']
const top = (query, filter = 0) => [
  Input(null, query ?? 'What do you want to listen to?'),
  Scroller('Filter Scroller', [Chips(FILTERS, filter)]),
]
const topResult = () =>
  Panel([BigCover('night', 96), Tx('H3', 'Night Signal'), Tx('Muted', 'Mira Sol')], {
    width: 'fill_container',
    gap: 10,
  })
const tracks = () => [
  MobileTrack('Night Signal', 'Mira Sol', 'night'),
  MobileTrack('Late Signal', 'Lumen Choir', 'echoes'),
  MobileTrack('Night drive', 'Kite Harbor', 'static'),
]
const results = () => [
  ...top('night'),
  Tx('H4', 'Top result'),
  topResult(),
  Section('Tracks'),
  ...tracks(),
  Section('Artists'),
  Scroller('Artist Scroller', [
    ArtistCard('Mira Sol', 'Artist', 'avatar2', 120),
    ArtistCard('Night Owls', 'Artist', 'avatar3', 120),
  ]),
  Section('Albums'),
  MobileTrack('Night Signal', 'Album · Mira Sol', 'night'),
  Section('Playlists'),
  MobileTrack('Night drive', 'Playlist · maya', 'drift'),
]
const screen = (name, content) => AppScreen(name, content, { tab: 'search' })

export const searchPage = {
  search: {
    title: 'Mobile / Search',
    route: 'app (tabs)/search',
    context:
      'Search: input debounced 300 ms, chips map to the `types` query param; results grouped by type.',
    mobile: () => screen('Search', results()),
    states: [
      ms('Prompt (empty query)', () =>
        screen('Prompt', [
          ...top(),
          EmptyState(
            'Find your next favourite',
            'Search for tracks, artists, albums and playlists.',
            null,
            'search',
          ),
        ]),
      ),
      ms('Loading', () => screen('Loading', [...top('night'), Skeleton('list', true)])),
      ms('Tracks filter', () => screen('Tracks', [...top('night', 1), ...tracks()])),
      ms('No results', () =>
        screen('No results', [
          ...top('nightx'),
          EmptyState(
            'No results for “nightx”',
            'Check the spelling or try another word.',
            null,
            'search-x',
          ),
        ]),
      ),
      ms('Error', () =>
        screen('Error', [
          ...top('night'),
          ErrorState(
            "Search isn't available right now.",
            null,
            'Try again',
            'triangle-alert',
            null,
          ),
        ]),
      ),
    ],
  },
}
