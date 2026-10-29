// Web-player page specs: player.
import { Ref, TRACKS, img } from '../../kit.mjs'
import {
  ART,
  AlbumCard,
  BigCover,
  Button,
  CardRow,
  Chips,
  Col,
  Cover,
  Desktop,
  EmptyState,
  Fill,
  Ic,
  IconBtn,
  L,
  MHeader,
  Mobile,
  MobileTrack,
  Panel,
  R,
  Row,
  SectionHeader,
  Tab,
  TrackTable,
  Tx,
  state,
} from '../../ui.mjs'
import { APP_STATES } from '../../pages-app.mjs'
import { COMMENT_STATES } from '../../pages-comments.mjs'
import { homeContent as islandHome } from '../../pages-island.mjs'
import {
  mrows,
  pageTitle,
  std,
  libHead,
  libTabs,
  LIB_ITEMS,
  cardGrid,
  libMobileHeader,
  artistRow,
} from './shared.mjs'

/* helpers used above */
function quickGrid(cols = 4) {
  const items = [
    ['Liked Songs'],
    ['Night Drive', 'night'],
    ['Afterglow Sessions', 'afterglow'],
    ['Static Lines', 'static'],
    ['Echoes in Motion', 'echoes'],
    ['Drift Control', 'drift'],
    ['Signal On Air', 'night'],
    ['Road Radio', 'afterglow'],
  ]
  const tile = ([t, art]) =>
    art
      ? R('Quick Tile', {}, { cover: { fill: img(ART[art]) }, title: { content: t } })
      : R('Quick Tile/Liked', {}, { title: { content: t } })
  return Col(
    { name: 'Quick Grid', gap: 8, width: 'fill_container' },
    Array.from({ length: Math.ceil(items.length / cols) }, (_, r) =>
      Row({ width: 'fill_container', gap: 8 }, items.slice(r * cols, r * cols + cols).map(tile)),
    ),
  )
}
function homeAll() {
  return [
    Chips(['All', 'Music']),
    Col({ gap: 4 }, [Tx('Eyebrow', 'MADE FOR MAYA'), Tx('H1', 'Good evening, Maya')]),
    quickGrid(),
    SectionHeader('Recommended for you'),
    CardRow(LIB_ITEMS.slice(0, 4).map(([t, m, a]) => AlbumCard(t, m, a, 176))),
    SectionHeader('Popular artists'),
    artistRow(4),
  ]
}
/* mobile Home follows the island concept: resume where you stopped, tune by feeling, bento tiles */
function homeMobile() {
  return islandHome()
}
function deviceRows() {
  return [
    R(
      'Device Row/Active',
      {},
      { name: { content: 'This computer' }, status: { content: 'Playing here' } },
    ),
    ...[
      ['speaker', 'Studio speaker', 'Available'],
      ['smartphone', "Maya's iPhone", 'Available'],
      ['tablet', 'Smart display', 'Available'],
    ].map(([icon, n, st]) =>
      R('Device Row', {}, { icon: { icon }, name: { content: n }, status: { content: st } }),
    ),
    Tx('Link', "Don't see your device?"),
  ]
}
function devices() {
  return Panel(
    [Tx('H4', 'Bitrate Connect'), Tx('Muted', 'Afterglow · Nova & the Static'), ...deviceRows()],
    { width: 340 },
  )
}
function nowPlayingMobile() {
  return [
    BigCover('afterglow', 342),
    Row({ width: 'fill_container' }, [
      Col({ gap: 4, width: 'fill_container' }, [
        Tx('H1', 'Afterglow'),
        Tx('Muted', 'Nova & the Static'),
      ]),
      Ic('heart', 'Primary', 24),
    ]),
    R('Seek Bar'),
    R('Transport'),
    Row({ width: 'fill_container', justifyContent: 'space_between' }, [
      Row({ gap: 8 }, [Ic('monitor-speaker', 'Primary'), Tx('Link', 'This phone')]),
      Row({ gap: 4 }, [IconBtn('mic-vocal'), IconBtn('list-music')]),
    ]),
  ]
}

export const playerPages = {
  /* ---------- main app ---------- */
  player: {
    extraStates: [...COMMENT_STATES, ...APP_STATES.player],
    file: 'web-player-main.pen',
    title: 'Home',
    route: '/main',
    context: 'Player home: library quick grid, recommendations, artists, recently played.',
    desktop: () => Desktop('Home', homeAll(), { nowPlaying: true }),
    mobile: () => Mobile('Home', homeMobile()),
    states: [
      state(
        'Bitrate Connect',
        () =>
          Desktop(
            'Devices',
            [
              Row(
                { width: 'fill_container', height: 'fill_container', gap: 24, alignItems: 'end' },
                [Col({ width: 'fill_container', gap: 24 }, homeAll().slice(0, 3)), devices()],
              ),
            ],
            { nowPlaying: true },
          ),
        () =>
          Mobile(
            'Devices',
            [
              Fill([], { height: 'fill_container' }),
              R(
                'Surface/Sheet',
                { width: 'fill_container' },
                {
                  content: L(
                    { name: 'Sheet Content', layout: 'vertical', gap: 8, width: 'fill_container' },
                    [
                      Tx('H4', 'Bitrate Connect'),
                      Tx('Muted', 'Afterglow · Nova & the Static'),
                      ...deviceRows(),
                    ],
                  ),
                },
              ),
            ],
            { mini: false },
          ),
      ),
      state(
        'Library expanded',
        () => Desktop('Library', [libHead(), libTabs(), cardGrid(LIB_ITEMS)], { library: false }),
        () =>
          Mobile(
            'Library',
            LIB_ITEMS.slice(0, 7).map(([t, m, a]) => MobileTrack(t, m, a)),
            { tab: 'library', header: libMobileHeader() },
          ),
      ),
      state(
        'Now playing expanded',
        () =>
          Desktop(
            'Now playing',
            [
              Row(
                { width: 'fill_container', height: 'fill_container', gap: 40, alignItems: 'start' },
                [
                  Col({ width: 420, gap: 16 }, [
                    BigCover('afterglow', 420),
                    Row({ width: 'fill_container' }, [
                      Col({ gap: 4, width: 'fill_container' }, [
                        Tx('H1', 'Afterglow'),
                        Tx('Muted', 'Nova & the Static'),
                      ]),
                      Ic('heart', 'Primary', 24),
                    ]),
                    Row({ gap: 8 }, [Tab('Audio', true), Tab('Watch clip')]),
                  ]),
                  Col({ width: 'fill_container', gap: 14 }, [
                    Tx('Eyebrow', 'LYRICS'),
                    Tx('Lyric Past', 'Streetlights fade to violet,'),
                    Tx('Lyric Active', 'the city hums an afterglow'),
                    Tx('Lyric', 'and nowhere left to go.'),
                    SectionHeader('Up next', 'Clear'),
                    ...mrows(TRACKS.slice(2, 5)),
                  ]),
                ],
              ),
            ],
            { library: false },
          ),
        () =>
          Mobile('Now playing', nowPlayingMobile(), {
            mini: false,
            header: MHeader('Afterglow Sessions', {
              backIcon: 'chevron-down',
              actions: ['ellipsis'],
            }),
          }),
      ),
      state(
        'Collapsed library',
        () => Desktop('Collapsed', homeAll(), { nowPlaying: true, library: false }),
        null,
        'the phone has no library sidebar to collapse',
      ),
      state(
        'Track details hover',
        () =>
          Desktop(
            'Hover',
            [
              ...homeAll().slice(0, 3),
              Fill([], { height: 'fill_container' }),
              Row({ width: 'fill_container' }, [
                Ref(
                  'K5fBgt',
                  { name: 'Tooltip / Track details' },
                  { owwOU: { content: 'Track details' } },
                ),
              ]),
            ],
            { nowPlaying: true },
          ),
        null,
        'hover does not exist on touch screens',
      ),
      state(
        'Mini player',
        () =>
          Desktop(
            'Mini player',
            [
              ...homeAll().slice(0, 3),
              Fill([], { height: 'fill_container' }),
              Row({ width: 'fill_container', justifyContent: 'end' }, [
                Ref('H4C7bY', { name: 'Mini Player' }),
              ]),
            ],
            { nowPlaying: false },
          ),
        null,
        'the floating mini player is a desktop window; the phone uses the Mini Bar shown on every mobile frame',
      ),
      ...std('Home', {
        loading: 'grid',
        error: ['Recommendations are unavailable', 'Your recommendations could not be loaded.'],
      }),
    ],
  },

  queue: {
    title: 'Queue',
    route: '/main/queue',
    context: 'Now playing, next in queue, next from the context.',
    desktop: () =>
      Desktop(
        'Queue',
        [
          pageTitle('Queue', Button('Clear queue', 'ghost')),
          Tx('H4', 'Now playing'),
          TrackTable([TRACKS[0]]),
          Tx('H4', 'Next in queue'),
          TrackTable(TRACKS.slice(1, 3), { playing: -1 }),
          Tx('H4', 'Next from: Night Drive'),
          TrackTable(TRACKS.slice(3, 6), { playing: -1 }),
        ],
        { nowPlaying: true },
      ),
    mobile: () =>
      Mobile(
        'Queue',
        [
          Tx('Body Strong', 'Now playing'),
          MobileTrack(TRACKS[0][0], TRACKS[0][1], TRACKS[0][4]),
          Tx('Body Strong', 'Next in queue'),
          ...mrows(TRACKS.slice(1, 3)),
          Tx('Body Strong', 'Next from: Night Drive'),
          ...mrows(TRACKS.slice(3, 6)),
        ],
        { mini: false, header: MHeader('Queue', { actions: ['trash-2'] }) },
      ),
    states: [
      state(
        'Empty',
        () =>
          Desktop('Empty', [
            Tx('H1', 'Queue'),
            EmptyState(
              'Your queue is empty',
              'Play something and the tracks lined up next will show up here.',
              'Find something to play →',
              'list-music',
            ),
          ]),
        () =>
          Mobile(
            'Empty',
            [
              EmptyState(
                'Your queue is empty',
                'Play something and the tracks lined up next will show up here.',
                'Find something to play →',
                'list-music',
              ),
            ],
            { mini: false, header: MHeader('Queue') },
          ),
      ),
    ],
  },
  lyrics: {
    title: 'Lyrics',
    route: '/main/lyrics',
    context: 'Full-screen synced lyrics of the playing track.',
    desktop: () =>
      Desktop('Lyrics', [
        Row({ gap: 14 }, [
          Cover('afterglow', 56),
          Col({ gap: 2 }, [Tx('Body Strong', 'Afterglow'), Tx('Link', 'Nova & the Static')]),
        ]),
        Col({ name: 'Lines', gap: 14, width: 'fill_container' }, [
          Tx('Lyric Past', 'Streetlights fade to violet,'),
          Tx('Lyric Past', 'we keep the volume low,'),
          Tx('Lyric Active', 'the city hums an afterglow'),
          Tx('Lyric', 'and nowhere left to go.'),
          Tx('Lyric', 'Hold the signal steady,'),
        ]),
      ]),
    mobile: () =>
      Mobile(
        'Lyrics',
        [
          Row({ gap: 12 }, [
            Cover('afterglow', 48),
            Col({ gap: 2 }, [Tx('Body Strong', 'Afterglow'), Tx('Link', 'Nova & the Static')]),
          ]),
          ...[
            ['Lyric Past', 'Streetlights fade to violet,'],
            ['Lyric Active', 'the city hums an afterglow'],
            ['Lyric', 'and nowhere left to go.'],
          ].map(([s, l]) => Tx(s, l, { wrap: true })),
        ],
        { header: MHeader('Lyrics') },
      ),
    states: [
      state(
        'Nothing playing',
        () =>
          Desktop('Nothing', [
            EmptyState(
              'Nothing is playing',
              'Start a track and its lyrics will appear here.',
              'Find something to play →',
              'mic-vocal',
            ),
          ]),
        () =>
          Mobile(
            'Nothing',
            [
              EmptyState(
                'Nothing is playing',
                'Start a track and its lyrics will appear here.',
                'Find something to play →',
                'mic-vocal',
              ),
            ],
            { header: MHeader('Lyrics') },
          ),
      ),
      state(
        'No lyrics',
        () =>
          Desktop('No lyrics', [
            Row({ gap: 14 }, [
              Cover('static', 56),
              Col({ gap: 2 }, [Tx('Body Strong', 'Static Lines'), Tx('Link', 'Kite Harbor')]),
            ]),
            EmptyState(
              'No lyrics for this track',
              "Lyrics haven't been added to this track yet.",
              null,
              'mic-vocal',
            ),
          ]),
        () =>
          Mobile(
            'No lyrics',
            [
              EmptyState(
                'No lyrics for this track',
                "Lyrics haven't been added to this track yet.",
                null,
                'mic-vocal',
              ),
            ],
            { header: MHeader('Lyrics') },
          ),
      ),
    ],
  },
}
