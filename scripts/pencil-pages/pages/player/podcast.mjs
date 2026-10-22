// Web-player page specs: podcast.
import { img } from '../../kit.mjs'
import {
  ART,
  Alert,
  Badge,
  BigCover,
  Button,
  Chips,
  Col,
  Concept,
  Desktop,
  EmptyState,
  ErrorState,
  IconBtn,
  Input,
  MHeader,
  Mobile,
  MoreRows,
  Panel,
  R,
  Row,
  SectionHeader,
  SettingRow,
  Skeleton,
  Tab,
  Tx,
  state,
} from '../../ui.mjs'

/* podcasts */
const EPISODES = [
  [
    'Ep. 12 — Mixing for headphones',
    '8 Oct 2026',
    '48 min',
    'How Mira Sol builds a mix that holds up on cheap earbuds and studio monitors alike.',
    'progress',
  ],
  [
    'Ep. 11 — The second album',
    '1 Oct 2026',
    '52 min',
    'Nova & the Static on writing again after a record that went further than they expected.',
    'default',
  ],
  [
    'Ep. 10 — Live from the night bus',
    '24 Sep 2026',
    '39 min',
    'A field recording special: three artists, one route, the city at 2 AM.',
    'played',
  ],
  [
    'Ep. 9 — Credits that pay',
    '17 Sep 2026',
    '44 min',
    'Splits, roles and why the contributor list matters on release day.',
    'default',
  ],
  [
    'Ep. 8 — Remixes and rights',
    '10 Sep 2026',
    '41 min',
    'When a remix becomes its own track, and who owns what.',
    'played',
  ],
]
function epRow([t, d, dur, desc, kind], playing, guest) {
  const name = playing
    ? 'Podcast/Episode Playing'
    : ({ progress: 'Podcast/Episode Progress', played: 'Podcast/Episode Played' }[kind] ??
      'Podcast/Episode')
  return R(
    name,
    {},
    {
      cover: { fill: img(ART.stage) },
      title: { content: t },
      date: { content: d },
      duration: { content: dur },
      desc: { content: desc },
      save: guest ? { enabled: false } : undefined,
    },
  )
}
function podHead(m, guest) {
  const actions = Row({ name: 'Actions', gap: 12 }, [
    R('Button/Play'),
    !guest && Button('Follow', 'outline', { icon: 'plus' }),
    IconBtn('share-2'),
    IconBtn('ellipsis'),
    !m && Concept(),
  ])
  const meta = Row({ name: 'Meta', gap: 8 }, [
    Tx('Muted', '48 episodes'),
    Tx('Muted', '·'),
    Tx('Muted', 'Weekly'),
    Badge('EN', 'outline'),
    Badge('Explicit', 'outline'),
  ])
  return m
    ? Col({ name: 'Show', gap: 14, width: 'fill_container', alignItems: 'center' }, [
        BigCover('stage', 220),
        Col({ gap: 4, width: 'fill_container' }, [
          Tx('Eyebrow', 'PODCAST'),
          Tx('H2', 'Signal & Noise'),
          Tx('Link', 'Bitrate Studios'),
          meta,
        ]),
        Tx('Paragraph', 'Conversations with the people who make the music you love.', {
          wrap: true,
        }),
        actions,
      ])
    : Col({ name: 'Show', gap: 20, width: 'fill_container' }, [
        Row({ width: 'fill_container', gap: 28, alignItems: 'end' }, [
          BigCover('stage', 232),
          Col({ gap: 8, width: 'fill_container' }, [
            Tx('Eyebrow', 'PODCAST'),
            Tx('Display', 'Signal & Noise'),
            Tx('Body Strong', 'Bitrate Studios'),
            meta,
            Tx(
              'Paragraph',
              'Conversations with the people who make the music you love — producers, writers and the ones behind the credits.',
              { wrap: true },
            ),
          ]),
        ]),
        actions,
      ])
}
function podShow(m, o = {}) {
  const tabs = Row({ name: 'Tabs', gap: 4 }, [Tab('Episodes', !o.about), Tab('About', !!o.about)])
  const filters = Row(
    { name: 'Filters', width: 'fill_container', gap: 12, justifyContent: 'space_between' },
    [
      Chips(['Newest', 'Unplayed', 'Saved'], o.saved ? 2 : 0),
      !m && Input(null, o.search ? 'mixing' : 'Search episodes', 260),
    ],
  )
  let list = EPISODES
  if (o.saved) list = EPISODES.filter((e) => e[4] !== 'played').slice(0, 2)
  if (o.search) list = EPISODES.slice(0, 1)
  const rows = Col(
    { name: 'Episodes', gap: 2, width: 'fill_container' },
    list.slice(0, m ? 3 : 5).map((e, i) => epRow(e, o.playing && i === 1, o.guest)),
  )
  const about = Panel(
    [
      Tx('H4', 'About'),
      Tx(
        'Paragraph',
        'Signal & Noise is a weekly show from Bitrate Studios. Each episode sits down with the producers, writers and engineers behind records you know.',
        { wrap: true },
      ),
      SettingRow('Publisher', null, Tx('Body Strong', 'Bitrate Studios')),
      SettingRow('Language', null, Tx('Body Strong', 'English')),
      SettingRow('Content', null, Badge('Explicit', 'outline')),
    ],
    { width: m ? 'fill_container' : 640 },
  )
  const body = [
    podHead(m, o.guest),
    tabs,
    ...(o.about
      ? [about]
      : [
          filters,
          m && o.search && Input(null, 'mixing'),
          o.search && Tx('Muted', '1 episode for “mixing”'),
          rows,
          o.more && MoreRows(m, 'track', '20 of 48'),
          o.guest &&
            Alert(
              'Save episodes for later',
              'Log in to keep episodes in Your episodes and pick up where you left off.',
            ),
        ]),
  ]
  return m
    ? Mobile('Podcast', body, { header: MHeader('', { actions: ['share-2'] }), height: 1200 })
    : Desktop('Podcast', body, { library: false, nowPlaying: !!o.playing, height: 1300 })
}
function podPlayer(m) {
  const body = [
    BigCover('stage', m ? 300 : 360),
    Col({ gap: 2, width: m ? 'fill_container' : 520 }, [
      Tx('Eyebrow', 'SIGNAL & NOISE · EP. 12'),
      Tx(m ? 'H2' : 'H1', 'Mixing for headphones'),
      Tx('Link', 'Bitrate Studios'),
    ]),
    Col({ gap: 18, width: m ? 'fill_container' : 520 }, [
      R('Podcast/Seek Chapters'),
      R('Podcast/Transport'),
    ]),
    !m &&
      Panel(
        [
          Tx('H4', 'Chapters'),
          R(
            'Podcast/Chapter',
            {},
            {
              time: { content: '00:00' },
              title: { content: 'Cold open' },
              duration: { content: '4 min' },
            },
          ),
          R(
            'Podcast/Chapter',
            {},
            {
              time: { content: '04:10' },
              title: { content: 'Why earbuds lie' },
              duration: { content: '9 min' },
            },
          ),
          R(
            'Podcast/Chapter Active',
            {},
            {
              time: { content: '13:20' },
              title: { content: 'Headphone mixes' },
              duration: { content: '14 min' },
            },
          ),
          R(
            'Podcast/Chapter',
            {},
            {
              time: { content: '27:40' },
              title: { content: 'Listener questions' },
              duration: { content: '20 min' },
            },
          ),
        ],
        { width: 520 },
      ),
  ]
  return m
    ? Mobile(
        'Now playing (podcast)',
        [Col({ gap: 20, width: 'fill_container', alignItems: 'center' }, body)],
        {
          mini: false,
          header: MHeader('Now playing', { backIcon: 'chevron-down', actions: ['ellipsis'] }),
        },
      )
    : Desktop(
        'Now playing (podcast)',
        [
          Row({ width: 'fill_container', gap: 56, justifyContent: 'center', alignItems: 'start' }, [
            Col({ gap: 20, alignItems: 'center' }, body.slice(0, 3)),
            body[3],
          ]),
        ],
        { library: false, height: 1000 },
      )
}
function podEpisode(m) {
  const e = EPISODES[0]
  const body = [
    Row({ gap: 20, width: 'fill_container', alignItems: 'end' }, [
      BigCover('stage', m ? 120 : 180),
      Col({ gap: 6, width: 'fill_container' }, [
        Tx('Link', 'Signal & Noise'),
        Tx(m ? 'H3' : 'H1', 'Mixing for headphones', { wrap: true }),
        Tx('Muted', `${e[1]} · ${e[2]} · 23 min left`),
      ]),
    ]),
    Row({ gap: 12 }, [
      Button('Resume', 'large-default', { icon: 'play' }),
      IconBtn('bookmark-check'),
      IconBtn('share-2'),
      !m && Concept(),
    ]),
    Panel(
      [
        Tx('H4', 'Show notes'),
        Tx(
          'Paragraph',
          `${e[3]} We talk reference tracks, mono checks and the one plug-in Mira never turns off.`,
          { wrap: true },
        ),
      ],
      { width: 'fill_container' },
    ),
    Panel(
      [
        Tx('H4', 'Chapters'),
        R(
          'Podcast/Chapter',
          {},
          {
            time: { content: '00:00' },
            title: { content: 'Cold open' },
            duration: { content: '4 min' },
          },
        ),
        R(
          'Podcast/Chapter Active',
          {},
          {
            time: { content: '13:20' },
            title: { content: 'Headphone mixes' },
            duration: { content: '14 min' },
          },
        ),
        R(
          'Podcast/Chapter',
          {},
          {
            time: { content: '27:40' },
            title: { content: 'Listener questions' },
            duration: { content: '20 min' },
          },
        ),
      ],
      { width: 'fill_container' },
    ),
    SectionHeader('More episodes'),
    ...EPISODES.slice(1, 3).map((x) => epRow(x)),
  ]
  return m
    ? Mobile('Episode', body, { header: MHeader(''), height: 1500 })
    : Desktop('Episode', body, { library: false, height: 1300 })
}

export const podcastPages = {
  podcast: {
    title: 'Podcast',
    route: '/main/podcast/[id]',
    context:
      'Podcast show: header with play latest / follow / share, Episodes and About tabs, filters, episode search and rich episode rows (date, duration, description, progress, played, save). Concept (not in code yet): follow, progress, playing episodes in the player, chapters; the code today lists the first 50 episodes and lets signed-in listeners save them.',
    desktop: () => podShow(false),
    mobile: () => podShow(true),
    states: [
      state(
        'Episode playing',
        () => podShow(false, { playing: true }),
        () => podShow(true, { playing: true }),
      ),
      state(
        'About',
        () => podShow(false, { about: true }),
        () => podShow(true, { about: true }),
      ),
      state(
        'Saved filter',
        () => podShow(false, { saved: true }),
        () => podShow(true, { saved: true }),
      ),
      state(
        'Search episodes',
        () => podShow(false, { search: true }),
        () => podShow(true, { search: true }),
      ),
      state(
        'Signed out',
        () => podShow(false, { guest: true }),
        () => podShow(true, { guest: true }),
      ),
      state(
        'Loading more',
        () => podShow(false, { more: true }),
        () => podShow(true, { more: true }),
      ),
      state(
        'Now playing (podcast)',
        () => podPlayer(false),
        () => podPlayer(true),
      ),
      state(
        'Episode',
        () => podEpisode(false),
        () => podEpisode(true),
      ),
      state(
        'Empty',
        () =>
          Desktop(
            'Empty',
            [
              podHead(false),
              EmptyState(
                'No episodes have been published yet.',
                'New episodes will appear here.',
                null,
                'podcast',
              ),
            ],
            { library: false },
          ),
        () =>
          Mobile(
            'Empty',
            [
              podHead(true),
              EmptyState(
                'No episodes have been published yet.',
                'New episodes will appear here.',
                null,
                'podcast',
              ),
            ],
            { header: MHeader('') },
          ),
      ),
      state(
        'Loading',
        () => Desktop('Loading', [Skeleton('collection')], { library: false }),
        () => Mobile('Loading', [Skeleton('collection', true)], { header: MHeader('') }),
      ),
      state(
        'Error',
        () =>
          Desktop(
            'Error',
            [
              ErrorState(
                'Podcast not found',
                'This podcast may have been removed or is temporarily unavailable.',
                'Try again',
              ),
            ],
            { library: false },
          ),
        () =>
          Mobile(
            'Error',
            [
              ErrorState(
                'Podcast not found',
                'This podcast may have been removed or is temporarily unavailable.',
                'Try again',
              ),
            ],
            { header: MHeader('') },
          ),
      ),
    ],
  },
}
