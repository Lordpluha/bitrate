// App motion patterns as screen states: command search (layout-animated palette), Now Playing with
// atmosphere mode, mobile player panels (expandable tabs + action tooltips) and the video player.
import { id, img, TRACKS } from './kit.mjs'
import {
  R,
  L,
  Row,
  Col,
  Tx,
  BigCover,
  IconBtn,
  SectionHeader,
  Desktop,
  Mobile,
  MHeader,
  state,
  Select,
  C,
  ART,
} from './ui.mjs'

const W = 1440
const frame = (name, w, h, children, o = {}) => ({
  type: 'frame',
  id: id(),
  name,
  width: w,
  height: h,
  clip: true,
  layout: 'vertical',
  fill: C.background,
  children: children.flat().filter(Boolean),
  ...o,
})
const scrim = (name, w, h, children, o = {}) =>
  frame(name, w, h, children, { fill: C.scrim, alignItems: 'center', gap: 16, ...o })

/* ---------- command search ---------- */
const group = (label) => R('Command/Group', {}, { label: { content: label } })
const item = (icon, label, hint = '', active = false) =>
  R(
    active ? 'Command/Item Active' : 'Command/Item',
    {},
    { icon: { icon }, label: { content: label }, hint: { content: active ? hint || '↵' : hint } },
  )
const media = (title, meta, art, hint = '') =>
  R(
    'Command/Item Media',
    {},
    {
      cover: { fill: img(ART[art]) },
      title: { content: title },
      meta: { content: meta },
      hint: { content: hint },
    },
  )
const palette = (query, results, w = 640) =>
  R(
    'Command/Palette',
    { width: w },
    {
      query: query ? { content: query, fill: C.foreground } : undefined,
      results: {
        type: 'frame',
        id: id(),
        name: 'Results',
        layout: 'vertical',
        width: 'fill_container',
        padding: 8,
        gap: 2,
        children: results,
      },
    },
  )
const RECENT = (m) => [
  group('RECENT'),
  media('Night Signal', 'Track · Mira Sol', 'night', m ? '' : '3 plays today'),
  media('Luma Vale', 'Artist · 210K listeners', 'luma'),
  group('COMMANDS'),
  item('play', 'Play liked songs', 'P L', true),
  item('shuffle', 'Shuffle my library', 'S'),
  item('sparkles', 'Turn on atmosphere mode', 'A'),
  !m && group('GO TO'),
  !m && item('library', 'Library', 'G L'),
  !m && item('list-music', 'Queue', 'G Q'),
]
const TYPED = (m) => [
  group('TRACKS'),
  media('Night Signal', 'Mira Sol · 3:56', 'night', '↵'),
  media('Night Drive Theme', 'Kite Harbor · 4:02', 'static'),
  group('ARTISTS'),
  media('Night Pulse Collective', 'Artist · shared scene', 'stage'),
  group('PLAYLISTS'),
  media('Night drive', 'Playlist · 24 songs', 'drift'),
  !m && group('COMMANDS'),
  !m && item('search', 'Search “night” everywhere', '⌘ ↵', true),
]
const EMPTY = () => [
  Col(
    {
      name: 'No results',
      gap: 6,
      padding: [20, 10],
      width: 'fill_container',
      alignItems: 'center',
    },
    [
      Tx('Body Strong', 'No results for “zzqx”'),
      Tx('Muted', 'Check the spelling or try an artist name.'),
    ],
  ),
  item('search', 'Search everywhere for “zzqx”', '⌘ ↵', true),
]
const cmdDesktop = (name, query, results) =>
  scrim(name, W, 900, [R('Command/Trigger', { width: 640 }), palette(query, results)], {
    padding: [96, 0],
  })
const cmdMobile = (name, query, results) =>
  frame(name, 390, 844, [
    R('Mobile/Status Bar', { width: 'fill_container' }),
    L({ name: 'Sheet', width: 'fill_container', layout: 'vertical', padding: [8, 12], gap: 12 }, [
      palette(query, results, 'fill_container'),
    ]),
  ])

/* ---------- now playing: atmosphere mode ---------- */
const nowPlaying = (on, m) =>
  (m ? Col : Row)(
    {
      name: 'Now Playing',
      gap: m ? 20 : 64,
      alignItems: 'center',
      width: m ? 'fill_container' : undefined,
    },
    [
      BigCover('night', m ? 300 : 440),
      Col({ name: 'Details', gap: 18, width: m ? 'fill_container' : 460 }, [
        Tx('Eyebrow', on ? 'NOW PLAYING · ATMOSPHERE' : 'NOW PLAYING'),
        Tx(m ? 'H2' : 'H1', 'Night Signal'),
        Tx('Muted', 'Mira Sol · Night Signal'),
        R('Seek Bar'),
        R('Transport'),
        Row({ name: 'Mode', gap: 12 }, [
          R(on ? 'Button/Atmosphere Active' : 'Button/Atmosphere'),
          on && !m && Select(null, 'Intensity · Soft', 200),
        ]),
        on &&
          Tx(
            'Caption',
            'A slow gradient glows around the screen in the track colours. Reduced motion keeps it still.',
          ),
      ]),
    ],
  )
const atmosphere = (name, w, h, m) =>
  frame(name, w, h, [
    R(
      'Atmosphere/Frame',
      { width: w, height: h },
      {
        content: {
          type: 'frame',
          id: id(),
          name: 'Content',
          layout: 'vertical',
          width: 'fill_container',
          height: 'fill_container',
          padding: m ? [40, 20] : 48,
          gap: 24,
          alignItems: 'center',
          justifyContent: 'center',
          children: [nowPlaying(true, m)],
        },
      },
    ),
  ])

/* ---------- mobile player panels ---------- */
const TABS = [
  ['mic-vocal', 'Lyrics'],
  ['list-music', 'Queue'],
  ['info', 'Credits'],
  ['cast', 'Devices'],
  ['radio', 'Related'],
]
const tabs = (active) =>
  Row(
    { name: 'Expandable Tabs', gap: 8, width: 'fill_container', justifyContent: 'center' },
    TABS.map(([icon, label], i) =>
      i === active
        ? R('Tabs/Expandable Active', {}, { icon: { icon }, label: { content: label } })
        : R('Tabs/Expandable', {}, { icon: { icon } }),
    ),
  )
const ACTIONS = [
  ['heart'],
  ['list-plus'],
  ['share-2'],
  ['alarm-clock'],
  ['cast', true],
  ['sparkles'],
]
const actions = (tip) =>
  Col({ name: 'Actions', gap: 8, width: 'fill_container', alignItems: 'center' }, [
    tip &&
      Row(
        {
          name: 'Tooltip Row',
          width: 'fill_container',
          justifyContent: 'end',
          padding: [0, 64, 0, 0],
        },
        [
          R(
            'Tooltip/Action',
            {},
            { label: { content: 'Devices' }, hint: { content: '2 nearby · new' } },
          ),
        ],
      ),
    Row(
      { name: 'Action Row', gap: 12, justifyContent: 'center', width: 'fill_container' },
      ACTIONS.map(([icon, badge]) =>
        R(badge ? 'Action/Icon Badge' : 'Action/Icon', {}, { icon: { icon } }),
      ),
    ),
  ])
const LYRICS = () => [
  R('Text/Lyric Past', {}, { text: { content: 'City lights in the rear view' } }),
  R('Text/Lyric Active', {}, { text: { content: 'We keep the signal on' } }),
  R('Text/Lyric', {}, { text: { content: 'Through the static and the rain' } }),
]
const QUEUE = () =>
  TRACKS.slice(1, 4).map((t) =>
    R('Episode Row', {}, { title: { content: t[0] }, meta: { content: `${t[1]} · ${t[3]}` } }),
  )
const panelBody = (active) =>
  R(
    'Surface/Panel',
    { width: 'fill_container' },
    {
      content: {
        type: 'frame',
        id: id(),
        name: 'Panel Content',
        layout: 'vertical',
        gap: 10,
        width: 'fill_container',
        children: active === 1 ? QUEUE() : LYRICS(),
      },
    },
  )
const mobilePlayer = (name, { active = 0, tip = false, open = true } = {}) =>
  frame(name, 390, 844, [
    R('Mobile/Status Bar', { width: 'fill_container' }),
    MHeader('Now playing', { backIcon: 'chevron-down', actions: ['ellipsis'] }),
    L(
      {
        name: 'Content',
        width: 'fill_container',
        height: 'fill_container',
        layout: 'vertical',
        padding: [4, 16, 24, 16],
        gap: 16,
        alignItems: 'center',
      },
      [
        BigCover('night', open ? 220 : 300),
        Row({ width: 'fill_container' }, [
          Col({ gap: 2, width: 'fill_container' }, [
            Tx('H3', 'Night Signal'),
            Tx('Muted', 'Mira Sol'),
          ]),
        ]),
        R('Seek Bar'),
        actions(tip),
        tabs(active),
        open && panelBody(active),
      ],
    ),
  ])

/* ---------- video ---------- */
const VIDEOS = [
  ['Night Signal (Official video)', 'Luma Vale · 128K views', '3:56', 'stage'],
  ['Low Orbit (Live at Afterhours)', 'Luma Vale · 54K views', '5:12', 'luma'],
  ['Making of Night Signal', 'Luma Vale · 21K views', '8:40', 'hero'],
]
const thumb = ([t, meta, d, art], w = 320) =>
  R(
    'Video/Thumbnail',
    { width: w },
    {
      image: { fill: img(ART[art]) },
      title: { content: t },
      meta: { content: meta },
      duration: { content: d },
    },
  )
const videoModal = (m) =>
  scrim(
    'Video player',
    m ? 390 : W,
    m ? 844 : 900,
    [
      Row({ name: 'Bar', width: m ? 'fill_container' : 1120, justifyContent: 'space_between' }, [
        Col({ gap: 2 }, [
          Tx('On Media', 'Night Signal (Official video)'),
          Tx('Caption', 'Luma Vale'),
        ]),
        IconBtn('x'),
      ]),
      R('Video/Player', m ? { width: 358, height: 201, padding: [0, 8, 8, 8] } : {}),
      Tx(
        'Caption',
        'Click a thumbnail to open; the play pill follows the cursor over the thumbnail. Space · M · F control play, mute and fullscreen.',
      ),
    ],
    { justifyContent: 'center', padding: m ? 16 : 40 },
  )

export const APP_STATES = {
  player: [
    state(
      'Command palette',
      () => cmdDesktop('Command palette', null, RECENT(false)),
      () => cmdMobile('Command palette', null, RECENT(true)),
    ),
    state(
      'Command search',
      () => cmdDesktop('Command search', 'night', TYPED(false)),
      () => cmdMobile('Command search', 'night', TYPED(true)),
    ),
    state(
      'Command no results',
      () => cmdDesktop('Command no results', 'zzqx', EMPTY()),
      () => cmdMobile('Command no results', 'zzqx', EMPTY()),
    ),
    state(
      'Now playing',
      () =>
        frame('Now playing', W, 900, [nowPlaying(false, false)], {
          alignItems: 'center',
          justifyContent: 'center',
        }),
      () => mobilePlayer('Now playing', { open: false }),
    ),
    state(
      'Atmosphere mode',
      () => atmosphere('Atmosphere mode', W, 900, false),
      () => atmosphere('Atmosphere mode', 390, 844, true),
    ),
    state(
      'Player panel lyrics',
      null,
      () => mobilePlayer('Panel lyrics', { active: 0 }),
      'mobile-only panel; desktop shows lyrics and queue in the right sidebar',
    ),
    state(
      'Player panel queue',
      null,
      () => mobilePlayer('Panel queue', { active: 1 }),
      'mobile-only panel; desktop shows lyrics and queue in the right sidebar',
    ),
    state(
      'Player action tooltip',
      null,
      () => mobilePlayer('Action tooltip', { tip: true, open: false }),
      'touch: long-press shows the tooltip; desktop shows it on hover in the player bar',
    ),
  ],
  artist: [
    state(
      'Videos',
      () =>
        Desktop(
          'Videos',
          [
            SectionHeader('Videos', 'Show all'),
            Row(
              { name: 'Video Row', gap: 24 },
              VIDEOS.map((v) => thumb(v)),
            ),
          ],
          { nowPlaying: true },
        ),
      () =>
        Mobile(
          'Videos',
          [Tx('H4', 'Videos'), ...VIDEOS.slice(0, 2).map((v) => thumb(v, 'fill_container'))],
          { header: MHeader('Luma Vale') },
        ),
    ),
    state(
      'Video player',
      () => videoModal(false),
      () => videoModal(true),
    ),
  ],
}
