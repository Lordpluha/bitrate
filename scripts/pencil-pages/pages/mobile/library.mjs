// Native app: Library (liked songs, own playlists, history) and the Liked Songs list.
import {
  Col,
  EmptyState,
  ErrorState,
  Ic,
  MHeader,
  MobileTrack,
  Play,
  R,
  Row,
  Skeleton,
  Tx,
} from '../../ui.mjs'
import { AppScreen, Section, ms } from './shell.mjs'

const likedRow = () =>
  Row({ name: 'Liked Songs Row', width: 'fill_container', gap: 12 }, [
    R('Media/Liked Cover Small'),
    Col({ gap: 2, width: 'fill_container' }, [
      Tx('Body Strong', 'Liked Songs'),
      Tx('Muted', '124 tracks'),
    ]),
    Ic('chevron-right'),
  ])
const library = () => [
  Tx('H1', 'Library'),
  likedRow(),
  Section('Your playlists'),
  MobileTrack('Night drive', 'Playlist · 18 tracks', 'night'),
  MobileTrack('Road Radio', 'Playlist · 42 tracks', 'static'),
  Section('Listening history'),
  MobileTrack('Afterglow', 'Nova & the Static', 'afterglow'),
  MobileTrack('Drift Control', 'Mira Sol', 'drift'),
]
const libScreen = (name, content) => AppScreen(name, content, { tab: 'library' })

const likedHead = () =>
  Row({ name: 'Liked Actions', width: 'fill_container', justifyContent: 'space_between' }, [
    Tx('Muted', '124 tracks'),
    Play(),
  ])
const liked = () => [
  likedHead(),
  MobileTrack('Afterglow', 'Nova & the Static', 'afterglow'),
  MobileTrack('Night Signal', 'Mira Sol', 'night'),
  MobileTrack('Static Lines', 'Kite Harbor', 'static'),
  MobileTrack('Echoes in Motion', 'Lumen Choir', 'echoes'),
  MobileTrack('Drift Control', 'Mira Sol', 'drift'),
]
const likedScreen = (name, content, island) =>
  AppScreen(name, content, { tab: 'library', header: MHeader('Liked Songs'), island })

export const libraryPages = {
  library: {
    title: 'Mobile / Library',
    route: 'app (tabs)/library',
    context:
      'Library: Liked Songs (GET /tracks/liked), own playlists (GET /playlists/me), history (GET /history).',
    mobile: () => libScreen('Library', library()),
    states: [
      ms('Loading', () => libScreen('Loading', [Tx('H1', 'Library'), Skeleton('list', true)])),
      ms('Empty', () =>
        libScreen('Empty', [
          Tx('H1', 'Library'),
          EmptyState(
            'Your library is empty',
            'Like tracks and create playlists to fill it up.',
            null,
            'library',
          ),
        ]),
      ),
      ms('Error', () =>
        libScreen('Error', [
          Tx('H1', 'Library'),
          ErrorState("We couldn't load your library.", null, 'Try again', 'triangle-alert', null),
        ]),
      ),
    ],
  },
  'library-liked': {
    title: 'Mobile / Liked Songs',
    route: 'app (tabs)/library/liked',
    context: 'Liked Songs: play all from the top or any row.',
    mobile: () => likedScreen('Liked Songs', liked()),
    states: [
      ms('Loading', () => likedScreen('Loading', [Skeleton('list', true)])),
      ms('Empty', () =>
        likedScreen(
          'Empty',
          [EmptyState('Tracks you like will appear here.', null, null, 'heart')],
          'idle',
        ),
      ),
      ms('Error', () =>
        likedScreen('Error', [
          ErrorState("We couldn't load your library.", null, 'Try again', 'triangle-alert', null),
        ]),
      ),
    ],
  },
}
