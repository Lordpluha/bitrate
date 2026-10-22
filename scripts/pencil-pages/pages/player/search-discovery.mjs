// Web-player page specs: search discovery.
import { TRACKS, img } from '../../kit.mjs'
import {
  ART,
  AlbumCard,
  Alert,
  Badge,
  BigCover,
  Button,
  C,
  CardRow,
  Chip,
  Chips,
  Col,
  Desktop,
  Divider,
  EmptyState,
  ErrorState,
  Ic,
  Input,
  MHeader,
  Mobile,
  Panel,
  PlaylistCard,
  Progress,
  R,
  Row,
  SectionHeader,
  Skeleton,
  Tab,
  Tx,
  state,
} from '../../ui.mjs'
import { T5, mrows, pageTitle, std, LIB_ITEMS, songs } from './shared.mjs'

/* ---------------- music pages ---------------- */
const GENRES = [
  ['Pop', C.magenta500],
  ['Hip-Hop', C.amber600],
  ['Electronic', C.purple600],
  ['Rock', C.red600],
  ['Indie', C.green600],
  ['Jazz', C.blue600],
  ['Podcasts', C.neutral700],
  ['Charts', C.purple800],
  ['Chill', C.blue800],
  ['Workout', C.red800],
]
const genre = ([g, c], w = 192, h = 120) =>
  R('Genre Tile', { width: w, height: h, fill: c }, { label: { content: g } })
const gridOf = (items, cols, cell, gap = 20) =>
  Col(
    { name: 'Grid', gap },
    Array.from({ length: Math.ceil(items.length / cols) }, (_, r) =>
      Row({ gap }, items.slice(r * cols, r * cols + cols).map(cell)),
    ),
  )
const searchTabs = () => Chips(['All', 'Songs', 'Artists', 'Albums', 'Playlists', 'Profiles'])
function chart(n, mobile) {
  const trend = ['arrow-up', 'arrow-down', 'minus']
  return TRACKS.slice(0, n).map((r, i) =>
    R(
      'Chart Row',
      {},
      {
        rank: { content: String(i + 1) },
        trend: { icon: trend[i % 3] },
        cover: { fill: img(ART[r[4]]) },
        title: { content: r[0] },
        artist: { content: r[1] },
        plays: mobile ? { enabled: false } : { content: `${(9.8 - i * 0.7).toFixed(1)}M plays` },
        duration: { content: r[3] },
      },
    ),
  )
}
function node(label, sub, _art) {
  return R('Graph Node', {}, { label: { content: label }, sub: { content: sub } })
}
function stepper(current, compact) {
  const names = ['Purpose', 'Questions', 'Candidates', 'Review']
  const parts = []
  names.forEach((s, i) => {
    const kind =
      i < current
        ? 'Stepper/Step Done'
        : i === current
          ? 'Stepper/Step Current'
          : 'Stepper/Step Upcoming'
    parts.push(
      R(
        kind,
        {},
        {
          label: compact ? { enabled: false } : { content: s },
          ...(i >= current ? { number: { content: String(i + 1) } } : {}),
        },
      ),
    )
    if (i < names.length - 1)
      parts.push(R(i < current ? 'Stepper/Connector Done' : 'Stepper/Connector'))
  })
  return Row({ name: 'Stepper', width: 'fill_container', gap: 10 }, parts)
}
function candidate([t, a, , d, art], i) {
  return R(
    'Candidate Row',
    {},
    {
      rank: { content: `#${i + 1}` },
      cover: { fill: img(ART[art]) },
      title: { content: t },
      meta: { content: `${a} · ${d}` },
    },
  )
}

export const searchDiscoveryPages = {
  search: {
    more: ['track', '20 of 312 results'],
    title: 'Search',
    route: '/main/search (?q=, ?category=)',
    context: 'Browse all; results with type tabs; category pages.',
    desktop: () => Desktop('Search', [Tx('H1', 'Browse all'), gridOf(GENRES, 5, (g) => genre(g))]),
    mobile: () =>
      Mobile(
        'Search',
        [
          Tx('H2', 'Search'),
          Input(null, 'What do you want to play?'),
          Tx('H4', 'Browse all'),
          gridOf(GENRES.slice(0, 8), 2, (g) => genre(g, 171, 96), 12),
        ],
        { tab: 'search' },
      ),
    states: [
      state(
        'Results',
        () =>
          Desktop('Results', [
            searchTabs(),
            Row({ width: 'fill_container', gap: 24, alignItems: 'start' }, [
              Col({ width: 420, gap: 12 }, [
                Tx('H3', 'Top result'),
                Panel([
                  BigCover('night', 96),
                  Tx('H2', 'Night Signal'),
                  Row({ gap: 8 }, [Badge('Song', 'secondary'), Tx('Muted', 'Mira Sol')]),
                ]),
              ]),
              Col({ width: 'fill_container', gap: 8 }, [
                Tx('H3', 'Songs'),
                songs(TRACKS.slice(0, 4)),
              ]),
            ]),
            SectionHeader('Jump in: night playlists', null),
            CardRow(
              [
                ['Night Drive', 'Playlist', 'night'],
                ['Late Signal', 'Playlist', 'echoes'],
                ['After Hours', 'Playlist', 'afterglow'],
                ['Low Orbit', 'Playlist', 'static'],
                ['Night Static', 'Playlist', 'drift'],
              ].map(([t, m, a]) => PlaylistCard(t, m, a)),
            ),
          ]),
        () =>
          Mobile(
            'Results',
            [
              Input(null, 'night'),
              Chips(['All', 'Songs', 'Artists', 'Albums']),
              ...mrows(TRACKS.slice(0, 6)),
            ],
            { tab: 'search' },
          ),
      ),
      state(
        'No results',
        () =>
          Desktop('No results', [
            searchTabs(),
            EmptyState(
              'No results found for "neon tide"',
              'Please make sure your words are spelled correctly, or use fewer or different keywords.',
              null,
              'search-x',
            ),
          ]),
        () =>
          Mobile(
            'No results',
            [
              Input(null, 'neon tide'),
              EmptyState(
                'No results found for "neon tide"',
                'Please make sure your words are spelled correctly, or use fewer or different keywords.',
                null,
                'search-x',
              ),
            ],
            { tab: 'search' },
          ),
      ),
      state(
        'Partial results',
        () =>
          Desktop('Partial', [
            searchTabs(),
            Alert(
              'Some result types could not be loaded.',
              'Songs are shown; artists and albums will load when the service recovers.',
            ),
            songs(TRACKS.slice(0, 4)),
          ]),
        () =>
          Mobile(
            'Partial',
            [
              Input(null, 'night'),
              Alert('Some result types could not be loaded.', 'Showing songs only.'),
              ...mrows(TRACKS.slice(0, 4)),
            ],
            { tab: 'search' },
          ),
      ),
      state(
        'Category',
        () =>
          Desktop('Category', [
            R(
              'Collection Header',
              {},
              {
                cover: { enabled: false },
                type: { content: 'Category' },
                title: { content: 'Electronic' },
                owner: { enabled: false },
                meta: { content: 'Popular Electronic · Featured charts' },
              },
            ),
            SectionHeader('Popular Electronic'),
            CardRow(LIB_ITEMS.slice(0, 5).map(([t, m, a]) => AlbumCard(t, m, a))),
          ]),
        () =>
          Mobile(
            'Category',
            [
              Tx('H1', 'Electronic'),
              SectionHeader('Popular Electronic'),
              ...mrows(TRACKS.slice(0, 5)),
            ],
            { tab: 'search' },
          ),
      ),
      ...std('Search', {
        loading: 'grid',
        error: [
          'Search is unavailable',
          'Something went wrong while searching. Try again in a moment.',
          'Try again →',
        ],
        mobileOpts: { tab: 'search' },
      }),
    ],
  },
  charts: {
    more: ['chart', '50 of 100'],
    title: 'Trending & charts',
    route: 'concept — roadmap "Trending & charts"',
    context: 'Top tracks, artists and albums. Concept.',
    desktop: () =>
      Desktop('Charts', [
        pageTitle('Trending & charts', null, true),
        Row({ gap: 4 }, [
          Tab('Top songs', true),
          Tab('Top artists'),
          Tab('Top albums'),
          Tab('Rising'),
        ]),
        Col({ gap: 0, width: 'fill_container' }, chart(8)),
      ]),
    mobile: () =>
      Mobile('Charts', [Chips(['Top songs', 'Top artists', 'Rising']), ...chart(7, true)], {
        tab: 'search',
        header: MHeader('Charts'),
      }),
    states: std('Charts', {
      loading: 'chart',
      error: ['Charts are unavailable', 'Try again in a moment.'],
      mobileOpts: { tab: 'search' },
    }),
  },
  discovery: {
    title: 'Discovery',
    route: 'concept — backlog "Smart Recommendations", "Music Discovery Graph"',
    context: 'Listener-controlled recommendation filters and the influence graph. Concept.',
    desktop: () =>
      Desktop(
        'Discovery',
        [
          pageTitle('Discover', null, true),
          Row({ gap: 8 }, [
            Chip('Unknown artists', true),
            Chip('Less popular'),
            Chip('Synth pop'),
            Chip('Night'),
            Chip('2020s'),
            Button('More filters', 'ghost', { icon: 'sliders-horizontal' }),
          ]),
          Panel([
            Row(
              { width: 'fill_container', justifyContent: 'space_between', alignItems: 'center' },
              [
                Col({ gap: 24 }, [
                  node('Lumen Choir', 'Influence', 'echoes'),
                  node('Kite Harbor', 'Influence', 'static'),
                ]),
                Ic('arrow-right', 'Muted', 28),
                R('Graph Node/Focus', {}, { label: { content: 'Luma Vale' } }),
                Ic('arrow-right', 'Primary', 28),
                Col({ gap: 24 }, [
                  node('Mira Sol', 'Similar', 'night'),
                  node('Nova & the Static', 'Similar', 'afterglow'),
                ]),
                Ic('arrow-right', 'Info', 28),
                Col(
                  { gap: 10 },
                  ['Synth pop', 'Dream pop', 'Night drive'].map((g) => Chip(g)),
                ),
              ],
            ),
          ]),
          SectionHeader('Picked with your filters'),
          CardRow(LIB_ITEMS.slice(0, 5).map(([t, m, a]) => AlbumCard(t, m, a))),
        ],
        { library: false },
      ),
    mobile: () =>
      Mobile(
        'Discovery',
        [
          Chips(['Unknown artists', 'Synth pop', 'Night']),
          Panel([
            R('Graph Node/Focus', {}, { label: { content: 'Luma Vale' } }),
            Row({ gap: 8 }, [
              node('Mira Sol', 'Similar', 'night'),
              node('Lumen Choir', 'Influence', 'echoes'),
            ]),
          ]),
          Tx('H4', 'Picked with your filters'),
          ...mrows(TRACKS.slice(5, 8)),
        ],
        {
          tab: 'search',
          header: MHeader('Discover', { back: false, actions: ['sliders-horizontal'] }),
        },
      ),
    states: [
      state(
        'No matches',
        () =>
          Desktop(
            'No matches',
            [
              pageTitle('Discover', null, true),
              Row({ gap: 8 }, [
                Chip('Unknown artists', true),
                Chip('Polka', true),
                Chip('1950s', true),
              ]),
              EmptyState(
                'Nothing matches these filters',
                'Loosen a filter to see more music.',
                'Clear filters →',
                'sliders-horizontal',
              ),
            ],
            { library: false },
          ),
        () =>
          Mobile(
            'No matches',
            [
              EmptyState(
                'Nothing matches these filters',
                'Loosen a filter to see more music.',
                'Clear filters →',
                'sliders-horizontal',
              ),
            ],
            { tab: 'search', header: MHeader('Discover', { back: false }) },
          ),
      ),
      ...std('Discovery', {
        loading: 'grid',
        error: ['Recommendations are unavailable', 'Your recommendations could not be loaded.'],
        desktopOpts: { library: false },
        mobileOpts: { tab: 'search' },
      }),
    ],
  },
  'ai-playlist-builder': {
    title: 'Playlist builder',
    route: 'concept — backlog "AI Playlist Builder", PRODUCT.md explorations',
    context: 'Goal-driven builder: 3–5 step questionnaire, then ranked candidate batches. Concept.',
    desktop: () =>
      Desktop(
        'Builder',
        [
          pageTitle('Build a playlist', null, true),
          stepper(2),
          Row({ width: 'fill_container', gap: 24, alignItems: 'start' }, [
            Col({ width: 'fill_container', gap: 10 }, [
              Row({ width: 'fill_container', justifyContent: 'space_between' }, [
                Tx('H4', 'Batch 2 of 4 — rank, keep or reject'),
                Button('Regenerate batch', 'outline', { icon: 'refresh-cw' }),
              ]),
              ...T5.map(candidate),
            ]),
            Panel(
              [
                Tx('Body Strong', 'Your brief'),
                Tx(
                  'Paragraph',
                  'Late-night drive home, calm but not sleepy, about 45 minutes. Start from liked songs.',
                  { wrap: true },
                ),
                Divider(),
                Tx('Muted', 'Kept so far · 7 tracks · 28 min'),
                Progress(),
                Button('Review playlist', 'default', { width: 'fill_container' }),
              ],
              { width: 320 },
            ),
          ]),
        ],
        { library: false },
      ),
    mobile: () =>
      Mobile(
        'Builder',
        [
          stepper(2, true),
          Tx('H3', 'Rank, keep or reject'),
          ...TRACKS.slice(0, 4).map((t, i) =>
            R(
              'Candidate Row/Compact',
              {},
              {
                rank: { content: `#${i + 1}` },
                cover: { fill: img(ART[t[4]]) },
                title: { content: t[0] },
                meta: { content: t[1] },
              },
            ),
          ),
          Button('Regenerate batch', 'outline', { icon: 'refresh-cw', width: 'fill_container' }),
        ],
        { mini: false, header: MHeader('Build a playlist') },
      ),
    states: [
      state(
        'Questionnaire',
        () =>
          Desktop(
            'Questions',
            [
              pageTitle('Build a playlist', null, true),
              stepper(1),
              Panel(
                [
                  Tx('Eyebrow', 'QUESTION 2 OF 4'),
                  Tx('H2', 'What should it feel like?'),
                  Chips(['Calm', 'Focused', 'Euphoric', 'Melancholic', 'Energetic']),
                  Divider(),
                  Tx('Body Strong', 'Start from'),
                  Chips(['Liked songs', 'Everything']),
                  Row({ gap: 10 }, [Button('Back', 'ghost'), Button('Next', 'default')]),
                ],
                { width: 720 },
              ),
            ],
            { library: false },
          ),
        () =>
          Mobile(
            'Questions',
            [
              stepper(1, true),
              Tx('Eyebrow', 'QUESTION 2 OF 4'),
              Tx('H2', 'What should it feel like?'),
              Chips(['Calm', 'Focused', 'Euphoric']),
              Button('Next', 'large-default', { width: 'fill_container' }),
            ],
            { mini: false, header: MHeader('Build a playlist') },
          ),
      ),
      state(
        'Generating',
        () =>
          Desktop(
            'Generating',
            [pageTitle('Build a playlist', null, true), stepper(2), Skeleton('list')],
            { library: false },
          ),
        () =>
          Mobile('Generating', [stepper(2, true), Skeleton('list', true)], {
            mini: false,
            header: MHeader('Build a playlist'),
          }),
      ),
      state(
        'Error',
        () =>
          Desktop(
            'Error',
            [
              pageTitle('Build a playlist', null, true),
              stepper(2),
              ErrorState('Candidates could not be generated', 'Your answers are saved. Try again.'),
            ],
            { library: false },
          ),
        () =>
          Mobile(
            'Error',
            [ErrorState('Candidates could not be generated', 'Your answers are saved. Try again.')],
            { mini: false, header: MHeader('Build a playlist') },
          ),
      ),
    ],
  },
}
