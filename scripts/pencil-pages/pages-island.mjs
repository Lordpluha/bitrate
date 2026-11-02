// Mobile island player: the navigation is one floating island that carries playback. It shrinks while you
// scroll, briefly widens with live activity (Jam, Bitrate Connect, releases), offers quick actions on hold and
// blooms into the player. Prototype: pencil/web-player-design/mobile-island/island-prototype.html
import { id, img, ART } from './kit.mjs'
import {
  R,
  L,
  Row,
  Col,
  Tx,
  Blank,
  BigCover,
  IconBtn,
  Skeleton,
  ErrorState,
  EmptyState,
  fitStates,
  state,
  Chips,
  MobileTrack,
  Button,
} from './ui.mjs'

const TABS = ['home', 'search', 'library']
/** The island with one tab active: the active tab gets the soft pill and the foreground icon. */
const Island = (tab = 'home', o = {}) =>
  R(
    'Mobile/Island',
    o,
    Object.fromEntries(
      TABS.flatMap((t) => [
        [t, t === tab ? { fill: '$ds:--secondary' } : undefined],
        [`${t}Icon`, t === tab ? { fill: '$ds:--foreground' } : undefined],
      ]),
    ),
  )
const Compact = (o = {}) => R('Mobile/Island Compact', o)
/** Mid-swipe: split cover in the ring and the neighbour's title above the island. */
const Skipping = (cue, o = {}) =>
  Col({ name: 'Skipping', gap: 10, alignItems: 'center' }, [
    R('Mobile/Island Cue', {}, { text: { content: cue } }),
    R('Mobile/Island Skipping', o, {
      home: { fill: '$ds:--secondary' },
      homeIcon: { fill: '$ds:--foreground' },
    }),
  ])
const Live = (kind, o = {}) => {
  const L1 = {
    jam: {
      title: 'Jonah joined your Jam',
      desc: 'Listening to Afterglow with you',
      action: 'Say hi',
    },
    connect: {
      title: 'Bitrate Connect · Desktop',
      desc: 'Move playback to this phone?',
      action: 'Move',
    },
  }[kind]
  return R('Mobile/Island Live', o, {
    title: { content: L1.title },
    desc: { content: L1.desc },
    actionLabel: { content: L1.action },
    avatar: kind === 'connect' ? { enabled: false } : undefined,
  })
}
/** A phone screen whose navigation floats: content scrolls under the island, which sits 18px above the edge. */
const Screen = (name, content, { island, overlay = [] } = {}) => ({
  id: id(),
  type: 'frame',
  name,
  width: 390,
  height: 844,
  clip: true,
  layout: 'vertical',
  fill: '$ds:--background',
  children: [
    R('Mobile/Status Bar', { width: 'fill_container' }),
    L(
      {
        name: 'Content',
        width: 'fill_container',
        height: 'fill_container',
        layout: 'vertical',
        gap: 22,
        padding: [8, 16, 12, 16],
        clip: true,
      },
      fitStates(content, true),
    ),
    ...overlay,
    island &&
      L(
        {
          name: 'Island Slot',
          width: 'fill_container',
          padding: [8, 16, 18, 16],
          justifyContent: 'center',
        },
        [island.node],
      ),
  ].filter(Boolean),
})
const slot = (node) => ({ node })

const header = (title, sub) => [
  Row({ name: 'Header', width: 'fill_container', gap: 12 }, [
    R('Media/Avatar', { width: 36, height: 36, fill: img(ART.avatar1) }),
    Col({ gap: 0, width: 'fill_container' }, [
      Tx('Eyebrow', 'SAT · 21:40 · LATE SET'),
      Tx('Body Strong', 'Evening, Maya'),
    ]),
    IconBtn('bell'),
  ]),
  Col({ name: 'Title', gap: 4, width: 'fill_container' }, [Tx('H2', title), Tx('Muted', sub)]),
]
export const homeContent = () => [
  ...header('Pick up the signal.', 'You left off on Desktop an hour ago.'),
  R('Home/Resume', { width: 'fill_container' }),
  R('Home/Tuner', { width: 'fill_container' }),
  Row({ name: 'Space Head', width: 'fill_container', justifyContent: 'space_between' }, [
    Tx('H4', 'Your space'),
    Tx('Eyebrow', 'HOLD A TILE TO REARRANGE'),
  ]),
  Row({ name: 'Bento 1', width: 'fill_container', gap: 10 }, [
    R('Home/Tile Friends', { width: 'fill_container' }),
    R('Home/Tile Week', { width: 'fill_container' }),
  ]),
  R('Home/Tile Artist Note', { width: 'fill_container' }),
  Row({ name: 'Bento 2', width: 'fill_container', gap: 10 }, [
    R('Home/Tile Offline', { width: 'fill_container' }),
    R('Home/Tile Mix', { width: 'fill_container' }),
  ]),
]
const scrolledContent = () => homeContent().slice(3)
/* Library carries Jam as a filter: Everything shows the live Jam above the timeline, Jam lists them all */
const libHead = (active) => [
  Col({ name: 'Title', gap: 4, width: 'fill_container', padding: [12, 0, 0, 0] }, [
    Tx('H2', 'Your library remembers.'),
    Tx('Muted', 'Everything you played, saved and changed, in order.', { wrap: true }),
  ]),
  /* the filter row scrolls sideways when it overflows: it bleeds past the edge so the cut chip shows there is more */
  L({ name: 'Filter Scroller', width: 374, clip: true }, [
    Chips(['Everything', 'Jam · 2', 'Saved', 'Downloads', 'Offline'], active),
  ]),
]
const lateSet = () =>
  R(
    'Jam/Card',
    { width: 'fill_container' },
    {
      cover: {
        fill: {
          type: 'image',
          url: '../design-system/assets/albums/album-static-lines.webp',
          mode: 'cover',
        },
      },
      title: { content: 'Late set crew' },
      meta: { content: 'Starts at 23:00 · 6 going' },
      actionLabel: { content: 'Remind me', fill: '$ds:--foreground' },
      action: { fill: '$ds:--secondary' },
      footer: { enabled: false },
    },
  )
const libraryContent = () => [
  ...libHead(0),
  Row({ name: 'Live Head', width: 'fill_container', justifyContent: 'space_between' }, [
    Tx('H4', 'Live now'),
    Tx('Link', 'All Jams'),
  ]),
  R('Jam/Card', { width: 'fill_container' }),
  Tx('Eyebrow', 'TONIGHT'),
  MobileTrack('Afterglow', 'Played 4 times · Nova & the Static', 'afterglow'),
  MobileTrack('Night drive', 'Playlist · 3 tracks added', 'night'),
  Tx('Eyebrow', 'YESTERDAY'),
  MobileTrack('Drift Control', "Saved from Jonah's Jam", 'drift'),
]
const jamContent = () => [
  ...libHead(1),
  Tx('Muted', 'Listen together: one queue, everyone hears the same second.', { wrap: true }),
  R('Jam/Card', { width: 'fill_container' }),
  lateSet(),
  Button('Start a Jam from what you are playing', 'outline', {
    width: 'fill_container',
    icon: 'plus',
  }),
]
const nowPlaying = () => ({
  id: id(),
  type: 'frame',
  name: 'Now playing',
  width: 390,
  height: 844,
  clip: true,
  layout: 'vertical',
  fill: {
    type: 'gradient',
    gradientType: 'linear',
    rotation: 180,
    colors: [
      { color: '$ds:--primary', position: 0 },
      { color: '$ds:--background', position: 0.62 },
    ],
  },
  children: [
    R('Mobile/Status Bar', { width: 'fill_container' }),
    L(
      {
        name: 'Player',
        width: 'fill_container',
        height: 'fill_container',
        layout: 'vertical',
        gap: 18,
        padding: [8, 22, 24, 22],
      },
      [
        Row({ name: 'Top', width: 'fill_container', justifyContent: 'space_between' }, [
          IconBtn('chevron-down'),
          Col({ gap: 0, alignItems: 'center' }, [
            Tx('Caption', 'Playing from'),
            Tx('Body Strong', 'Night drive'),
          ]),
          IconBtn('ellipsis'),
        ]),
        BigCover('afterglow', 346),
        Row({ name: 'Meta', width: 'fill_container' }, [
          Col({ gap: 4, width: 'fill_container' }, [
            Tx('H2', 'Afterglow'),
            Tx('Muted', 'Nova & the Static'),
          ]),
          IconBtn('heart'),
        ]),
        R('Seek Bar', { width: 'fill_container' }),
        R('Transport', { width: 'fill_container' }),
        Row({ name: 'Signal', gap: 8 }, [
          R('Player/Quality Badge'),
          R(
            'Player/Quality Badge',
            {},
            { dot: { enabled: false }, icon: { enabled: true }, text: { content: 'This phone' } },
          ),
        ]),
      ],
    ),
  ],
})
const board = () =>
  Blank('Island states', 1440, 900, [
    Tx('H3', 'The island carries playback'),
    Tx(
      'Muted',
      'Default with tabs · swipe sideways to skip · compact while scrolling · live activity · quick actions on hold',
    ),
    Row({ name: 'States', gap: 40, alignItems: 'center' }, [
      Col({ gap: 24, alignItems: 'center' }, [
        Island('home'),
        Skipping('NEXT · STATIC LINES'),
        Compact(),
      ]),
      Col({ gap: 24, alignItems: 'center' }, [
        Live('jam'),
        Live('connect'),
        R('Mobile/Island Actions'),
      ]),
    ]),
  ])

export const mobileIsland = {
  title: 'Mobile island player',
  route: 'concept — mobile web player navigation',
  context:
    'Navigation is one floating island that carries playback: artwork with a progress ring, three tabs (Home, Search, Library — Jam lives in Library as a filter with live Jams on top) and play. It shrinks to artwork + track while scrolling down, widens for live activity (Jam, Bitrate Connect, releases), shows quick actions on hold and blooms into the player on tap or swipe up. Swipe anywhere on it sideways to skip: the neighbour’s cover slides into the ring with its title above the island, past 46px it commits, short of it springs back; the compact island adds a next button; the first visit nudges the cover once. Home resumes, tunes by feeling and shows bento tiles instead of shelves.',
  desktop: board,
  mobile: () => Screen('Home', homeContent(), { island: slot(Island('home')) }),
  states: [
    state(
      'Scrolling',
      null,
      () => Screen('Scrolling', scrolledContent(), { island: slot(Compact()) }),
      'mobile concept',
    ),
    state(
      'Skipping',
      null,
      () => Screen('Skipping', homeContent(), { island: slot(Skipping('NEXT · STATIC LINES')) }),
      'mobile concept · swipe the island sideways; past 46px it commits',
    ),
    state(
      'Skip hint',
      null,
      () =>
        Screen('Skip hint', homeContent(), { island: slot(Skipping('SWIPE THE ISLAND TO SKIP')) }),
      'mobile concept · first visit only: the cover nudges once',
    ),
    state(
      'Jam joined',
      null,
      () => Screen('Jam joined', homeContent(), { island: slot(Live('jam')) }),
      'mobile concept',
    ),
    state(
      'Bitrate Connect',
      null,
      () => Screen('Bitrate Connect', homeContent(), { island: slot(Live('connect')) }),
      'mobile concept',
    ),
    state(
      'Quick actions',
      null,
      () =>
        Screen('Quick actions', homeContent(), {
          island: slot(Island('home')),
          overlay: [
            L(
              {
                name: 'Actions Slot',
                width: 'fill_container',
                padding: [0, 16],
                justifyContent: 'center',
              },
              [R('Mobile/Island Actions')],
            ),
          ],
        }),
      'mobile concept',
    ),
    state('Now playing', null, nowPlaying, 'mobile concept'),
    state(
      'Library',
      null,
      () => Screen('Library', libraryContent(), { island: slot(Island('library')) }),
      'mobile concept · Jam is a Library filter, live Jams on top',
    ),
    state(
      'Library · Jam',
      null,
      () => Screen('Library Jam', jamContent(), { island: slot(Island('library')) }),
      'mobile concept',
    ),
    state(
      'Loading',
      null,
      () =>
        Screen(
          'Loading',
          [...header('Pick up the signal.', 'Finding where you left off…'), Skeleton('grid', true)],
          { island: slot(Island('home')) },
        ),
      'mobile concept',
    ),
    state(
      'Library · no Jams',
      null,
      () =>
        Screen(
          'No Jams',
          [
            ...libHead(1),
            EmptyState(
              'No Jams right now',
              'Start one from what you are playing, or wait for a friend to invite you.',
              'Start a Jam',
              'users-round',
            ),
          ],
          { island: slot(Island('library')) },
        ),
      'mobile concept',
    ),
    state(
      'Error',
      null,
      () =>
        Screen(
          'Error',
          [
            ErrorState(
              'Could not load your home',
              'Check your connection. Playback and downloads keep working.',
            ),
          ],
          { island: slot(Island('home')) },
        ),
      'mobile concept',
    ),
  ],
}
