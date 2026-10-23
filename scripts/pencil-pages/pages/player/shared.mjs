// Helpers shared by the web-player page specs.
import { TRACKS, img } from '../../kit.mjs'
import {
  ART,
  ArtistCard,
  Button,
  CardRow,
  Col,
  Concept,
  Desktop,
  EmptyState,
  ErrorState,
  MHeader,
  Mobile,
  MobileTrack,
  PlaylistCard,
  R,
  Row,
  Skeleton,
  Tab,
  Tx,
  state,
} from '../../ui.mjs'

export const T5 = TRACKS.slice(0, 5)
export const mrows = (rows) => rows.map((t) => MobileTrack(t[0], t[1], t[4]))
export const title = (t, sub, o = {}) =>
  Col({ name: 'Heading', gap: 8, width: 'fill_container' }, [
    Tx(o.size ?? 'H2', t, { wrap: true }),
    sub && Tx('Paragraph', sub, { wrap: true }),
  ])
export const pageTitle = (t, right, concept) =>
  Row({ name: 'Page Title', width: 'fill_container', justifyContent: 'space_between' }, [
    Row({ gap: 10 }, [Tx('H1', t), concept && Concept()]),
    right,
  ])
/** Loading / error / not-found pairs shared by data screens. */
export const std = (
  m,
  { loading = 'list', error, notFound, mobileOpts = {}, desktopOpts = {} } = {},
) =>
  [
    loading &&
      state(
        'Loading',
        () => Desktop(`${m} loading`, [Skeleton(loading)], desktopOpts),
        () => Mobile(`${m} loading`, [Skeleton(loading, true)], mobileOpts),
      ),
    error &&
      state(
        'Error',
        () => Desktop(`${m} error`, [ErrorState(...error)], desktopOpts),
        () => Mobile(`${m} error`, [ErrorState(...error)], mobileOpts),
      ),
    notFound &&
      state(
        'Not found',
        () => Desktop(`${m} not found`, [EmptyState(...notFound)], desktopOpts),
        () => Mobile(`${m} not found`, [EmptyState(...notFound)], mobileOpts),
      ),
  ].filter(Boolean)

/* ---------------- library / settings shared ---------------- */
export const libHead = () =>
  Row({ width: 'fill_container', alignItems: 'end' }, [
    Col({ gap: 4, width: 'fill_container' }, [Tx('Eyebrow', 'YOUR LIBRARY'), Tx('H1', 'Library')]),
    Button('Create playlist', 'default', { icon: 'plus' }),
  ])
export const libTabs = () =>
  Row({ name: 'Tabs', gap: 4 }, [
    Tab('Playlists', true),
    Tab('Liked tracks'),
    Tab('Albums'),
    Tab('History'),
  ])
export const LIB_ITEMS = [
  ['Night Drive', 'Playlist · 24 songs', 'night'],
  ['Afterglow Sessions', 'Playlist · 18 songs', 'afterglow'],
  ['Static Lines', 'Album · Kite Harbor', 'static'],
  ['Echoes in Motion', 'Album · Lumen Choir', 'echoes'],
  ['Drift Control', 'Album · Mira Sol', 'drift'],
  ['Road Radio', 'Playlist · 31 songs', 'afterglow'],
  ['Low Orbit', 'Playlist · 12 songs', 'static'],
  ['Late Signal', 'Playlist · 9 songs', 'echoes'],
]
export const cardGrid = (items, cols = 5) =>
  Col(
    { name: 'Grid', gap: 22 },
    Array.from({ length: Math.ceil(items.length / cols) }, (_, r) =>
      CardRow(items.slice(r * cols, r * cols + cols).map(([t, m, a]) => PlaylistCard(t, m, a))),
    ),
  )
export const libMobileHeader = () =>
  MHeader('Your Library', { back: false, actions: ['search', 'plus'] })
export const songs = (rows) =>
  Col(
    { name: 'Songs', width: 'fill_container', gap: 0 },
    rows.map((r, i) =>
      R(
        'Chart Row',
        {},
        {
          rank: { content: String(i + 1) },
          trend: { enabled: false },
          cover: { fill: img(ART[r[4]]) },
          title: { content: r[0] },
          artist: { content: r[1] },
          plays: { enabled: false },
          duration: { content: r[3] },
        },
      ),
    ),
  )
export const ARTISTS = [
  ['Nova & the Static', 'afterglow'],
  ['Mira Sol', 'night'],
  ['Kite Harbor', 'static'],
  ['Lumen Choir', 'echoes'],
  ['Luma Vale', 'luma'],
]
export const artistRow = (n = 5) =>
  CardRow(ARTISTS.slice(0, n).map(([a, art]) => ArtistCard(a, 'Artist', art, 150)))
