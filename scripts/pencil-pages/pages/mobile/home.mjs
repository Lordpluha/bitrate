// Native app: Home — greeting, resume tile, quick grid, recommendation rows, recently played.
import { ART, img } from '../../kit.mjs'
import {
  AlbumCard,
  Avatar,
  Col,
  EmptyState,
  ErrorState,
  MobileTrack,
  R,
  Row,
  Skeleton,
  Tx,
} from '../../ui.mjs'
import { AppScreen, Scroller, Section, ms } from './shell.mjs'

const header = () =>
  Row({ name: 'Greeting', width: 'fill_container', justifyContent: 'space_between' }, [
    Tx('H1', 'Good evening, Maya'),
    Avatar('avatar1', 40),
  ])
const resume = () =>
  R(
    'Home/Resume',
    { width: 'fill_container' },
    {
      cover: { fill: img(ART.afterglow) },
      eyebrow: { content: 'RECENTLY PLAYED' },
      title: { content: 'Afterglow' },
      meta: { content: 'Nova & the Static' },
    },
  )
const tile = ([t, art]) =>
  art
    ? R(
        'Quick Tile',
        { width: 'fill_container' },
        { cover: { fill: img(ART[art]) }, title: { content: t } },
      )
    : R('Quick Tile/Liked', { width: 'fill_container' }, { title: { content: t } })
/** Liked Songs plus up to three of the listener's own playlists, two per row. */
const quickGrid = () =>
  Col({ name: 'Quick Grid', gap: 8, width: 'fill_container' }, [
    Row({ width: 'fill_container', gap: 8 }, [
      tile(['Liked Songs']),
      tile(['Night drive', 'night']),
    ]),
    Row({ width: 'fill_container', gap: 8 }, [
      tile(['Road Radio', 'static']),
      tile(['Late set', 'echoes']),
    ]),
  ])
const feedRow = (title, items) => [
  Section(title),
  Scroller(
    'Card Scroller',
    items.map(([t, sub, art]) => AlbumCard(t, sub, art, 148)),
  ),
]
const recent = () => [
  Section('Recently played'),
  MobileTrack('Afterglow', 'Nova & the Static', 'afterglow'),
  MobileTrack('Night Signal', 'Mira Sol', 'night'),
  MobileTrack('Static Lines', 'Kite Harbor', 'static'),
]
const home = () => [
  header(),
  resume(),
  quickGrid(),
  ...feedRow('Made for you', [
    ['Echoes in Motion', 'Lumen Choir', 'echoes'],
    ['Drift Control', 'Mira Sol', 'drift'],
    ['Night Signal', 'Mira Sol', 'night'],
  ]),
  ...feedRow('New releases', [
    ['Static Lines', 'Kite Harbor', 'static'],
    ['Afterglow', 'Nova & the Static', 'afterglow'],
    ['Echoes in Motion', 'Lumen Choir', 'echoes'],
  ]),
  ...recent(),
]
/** A first-time listener: no history yet, so no resume tile and no recently played. */
const fresh = (state) => [header(), quickGrid(), state]

export const homePage = {
  home: {
    title: 'Mobile / Home',
    route: 'app (tabs)/index',
    context:
      'Home: resume, quick grid (Liked Songs + own playlists), GET /recommendations/feed rows, history. The avatar opens Profile.',
    mobile: () => AppScreen('Home', home()),
    states: [
      ms('Loading', () =>
        AppScreen('Loading', [header(), Skeleton('grid', true)], { island: 'idle' }),
      ),
      ms('Empty feed', () =>
        AppScreen(
          'Empty',
          fresh(
            EmptyState(
              'Nothing to recommend yet — play a few tracks and check back.',
              null,
              null,
              'sparkles',
            ),
          ),
          { island: 'idle' },
        ),
      ),
      ms('Error', () =>
        AppScreen(
          'Error',
          fresh(
            ErrorState(
              "We couldn't load your recommendations.",
              null,
              'Try again',
              'triangle-alert',
              null,
            ),
          ),
          { island: 'idle' },
        ),
      ),
      ms('Island idle (nothing queued)', () =>
        AppScreen('Idle island', home(), { island: 'idle' }),
      ),
      ms('Island loading a track', () =>
        AppScreen('Island loading', home(), { island: 'loading' }),
      ),
      ms('Island paused', () => AppScreen('Island paused', home(), { island: 'paused' })),
    ],
  },
}
