// Landing (Original Edition content), composed only from library instances; three themes, mobile, states.
import { TRACKS, img, id, C } from './kit.mjs'
import {
  R,
  L,
  Row,
  Col,
  Tx,
  Ic,
  BigCover,
  MobileTrack,
  Switch,
  Chips,
  Panel,
  Logo,
  SettingRow,
  CheckRow,
  state,
  Button,
  Input,
  Badge,
  ART,
  OAuth,
} from './ui.mjs'

const W = 1440
const style = (tone, mobile) =>
  (mobile ? 'H1' : 'Display') +
  (tone === 'accent' ? ' Accent' : tone === 'magenta' ? ' Magenta' : '')
const headline = (parts, mobile) =>
  Col(
    { name: 'Headline', gap: 0, width: 'fill_container' },
    parts.map(([t, tone]) => Tx(style(tone, mobile), t, { wrap: true })),
  )
const copy = ({ eyebrow, parts, desc, extra = [] }, mobile) =>
  Col({ name: 'Copy', gap: 18, width: mobile ? 'fill_container' : 480 }, [
    eyebrow && Tx('Eyebrow', eyebrow),
    headline(parts, mobile),
    desc && Tx('Paragraph', desc, { wrap: true }),
    ...extra,
  ])
const feature = (icon, title, desc) =>
  R('Landing/Feature', {}, { icon: { icon }, title: { content: title }, desc: { content: desc } })

/* Twelve fullscreen scenes, kept in sync with landing/motion-prototype.html (same order, copy and motion notes).
   Flex cannot overlap layers, so each scene shows the prototype's composition side by side with a motion note. */
const SIGNAL = (size, phase) =>
  R(
    'Landing/Signal',
    {},
    { image: { width: size, height: size, cornerRadius: size / 2 }, phase: { content: phase } },
  )
const TOTAL = 12
const mt = (t, m) => MobileTrack(t[0], m ?? t[1], t[4])
const seek = () => R('Seek Bar')
const step = (kind, label, n) =>
  R(
    `Stepper/Step ${kind}`,
    {},
    kind === 'Done'
      ? { label: { content: label } }
      : { number: { content: String(n) }, label: { content: label } },
  )
const node = (focus, name, sub, art) =>
  R(
    focus ? 'Graph Node/Focus' : 'Graph Node',
    {},
    { avatar: { fill: img(ART[art]) }, label: { content: name }, sub: { content: sub } },
  )
const sphere = (k, label, size) =>
  R(
    `Landing/Partner Sphere ${k}`,
    { width: size, height: size, cornerRadius: size / 2 },
    { label: { content: label } },
  )
const tech = (label, size = 90) =>
  R(
    'Landing/Bubble Tech',
    { width: size, height: size, cornerRadius: size / 2 },
    { label: { content: label } },
  )
const person = (initials) => R('Landing/Bubble Person', {}, { initials: { content: initials } })
const hoverCard = () => R('Landing/Hover Card')
const loopCard = (icon, n, title, desc, body) =>
  Panel([Tx('Eyebrow', n), feature(icon, title, desc), ...body], { width: 'fill_container' })

const SCENES = [
  {
    name: '01 • Signal',
    copy: {
      eyebrow: 'WEB PLAYER',
      parts: [['Your music,'], ['already where'], ['you are.', 'accent']],
      desc: 'Instant access in your browser. Listen, save and return to your library.',
      extra: [
        Row({ gap: 12 }, [
          Button('Open web player', 'large-default', { icon: 'arrow-right' }),
          Button('Create account', 'large-outline'),
        ]),
      ],
    },
    mobileExtra: () => [
      Button('Open web player', 'large-default', { icon: 'arrow-right', width: 'fill_container' }),
      Button('Create account', 'large-outline', { width: 'fill_container' }),
    ],
    signal: [160, 'SIGNAL · SPHERE'],
    ui: (m) =>
      !m &&
      Panel(
        [
          Row({ width: 'fill_container', justifyContent: 'space_between' }, [
            Tx('Eyebrow', 'NOW PLAYING'),
            R('Status/Success', {}, { label: { content: 'Signal stable' } }),
          ]),
          BigCover('night', 392),
          Row({ width: 'fill_container' }, [
            Col({ gap: 2, width: 'fill_container' }, [
              Tx('H3', 'Night Signal'),
              Tx('Muted', 'Demo artist'),
            ]),
            Ic('heart', 'Primary', 22),
          ]),
          seek(),
          !m && R('Transport'),
        ],
        { width: m ? 'fill_container' : 440 },
      ),
    note: 'Enter: letters rise one by one; the player window tilts into 3D and follows the cursor. 3D: noise-displaced sphere behind the glass. Glitch on "you are." and the SIGNAL STABLE label.',
  },
  {
    name: '02 • Play. Save. Return.',
    stack: true,
    copy: {
      parts: [['Play. Save. Return.']],
      desc: 'One listening loop. Built around the music you come back to.',
    },
    signal: [120, 'SIGNAL · WAVE'],
    ui: (m) =>
      (m ? Col : Row)(
        { name: 'Loop Cards', gap: 20, width: 'fill_container', alignItems: 'start' },
        [
          loopCard(
            'play',
            '01',
            'Play without losing focus',
            'The controls you need, within reach.',
            [mt(TRACKS[0]), seek()],
          ),
          !m &&
            loopCard(
              'heart',
              '02',
              'Save what matters',
              'Build a library that sounds like you.',
              TRACKS.slice(1, 4).map((t) => mt(t)),
            ),
          !m &&
            loopCard(
              'history',
              '03',
              'Find your way back',
              'Your returns, together in recents.',
              TRACKS.slice(3, 6).map((t) => mt(t, 'Today')),
            ),
        ],
      ),
    note: 'Enter: three cards rise with a 3D tilt; the seek bar fills, hearts pop. 3D: the surface becomes a wave ribbon over a 72-band particle spectrum.',
  },
  {
    name: '03 • For Artists',
    stack: true,
    copy: {
      eyebrow: 'FOR ARTISTS',
      parts: [['Release work,'], ['in one line of sight.', 'accent']],
      desc: 'Versions, tasks and delivery on one timeline. The system suggests. You stay in control.',
    },
    signal: [110, 'SIGNAL · TORUS'],
    ui: (m) =>
      Panel(
        [
          Row({ width: 'fill_container', gap: 14 }, [
            R('Media/Cover', { width: 48, height: 48, fill: img(ART.afterglow) }),
            Col({ gap: 2, width: 'fill_container' }, [
              Tx('H4', 'Afterglow'),
              Tx('Muted', 'Demo artist · EP'),
            ]),
            R('Status/Info', {}, { label: { content: 'Review in progress' } }),
          ]),
          !m &&
            Row({ name: 'Stepper', width: 'fill_container', gap: 8 }, [
              step('Done', 'Audio'),
              R('Stepper/Connector Done'),
              step('Done', 'Artwork'),
              R('Stepper/Connector Done'),
              step('Done', 'Details'),
              R('Stepper/Connector Done'),
              step('Current', 'Review', 4),
              R('Stepper/Connector'),
              step('Upcoming', 'Delivery', 5),
            ]),
          SettingRow(
            'Release check',
            'Align master, artwork and metadata.',
            Badge('Now', 'default'),
          ),
          SettingRow(
            'Prepare delivery',
            'Select services and confirm the date.',
            Badge('20 min', 'outline'),
          ),
          !m &&
            SettingRow(
              'Post-release review',
              'Signals and follow-up tasks.',
              Badge('After launch', 'outline'),
            ),
          Tx('Caption', 'Release workspace concept · Demonstration data'),
        ],
        { width: 'fill_container' },
      ),
    note: 'Enter: the workspace window rises; steps light up in sequence, tasks and versions slide in. 3D: the signal folds into a torus; particles draw the release timeline with five milestones.',
  },
  {
    name: '04 • Playlist Workshop',
    copy: {
      eyebrow: 'PLAYLIST WORKSHOP · CONCEPT',
      parts: [['Start with a feeling.'], ['Finish with'], ['your playlist.', 'accent']],
      desc: 'Describe the session. Compare a few tracks. Shape a playlist that feels like you.',
      extra: [
        feature('zap', 'Turn intent into music', 'Describe the mood, the activity or the moment.'),
        feature(
          'layers',
          'Compare and refine',
          'Rank a few tracks. Swap the ones that do not fit.',
        ),
      ],
    },
    signal: [130, 'SIGNAL · KNOT'],
    ui: (m) =>
      Panel(
        [
          Tx('Eyebrow', 'YOUR SESSION'),
          Tx('Paragraph', 'Calm late-night focus, 45 minutes, from my liked songs.', {
            wrap: true,
          }),
          Chips(['Calm', 'Late night', '45 min']),
          ...TRACKS.slice(0, m ? 2 : 4).map((t, i) =>
            R(
              m ? 'Candidate Row/Compact' : 'Candidate Row',
              {},
              {
                rank: { content: `#${i + 1}` },
                cover: { fill: img(ART[t[4]]) },
                title: { content: t[0] },
                meta: { content: `${t[1]} · ${t[3]}` },
              },
            ),
          ),
        ],
        { width: m ? 'fill_container' : 560 },
      ),
    note: 'Enter: the prompt types itself, the four-step bar fills, candidates slide in and re-rank every 2.6 s (FLIP). 3D: a trefoil knot; four concentric particle orbits.',
  },
  {
    name: '05 • Your Player. Your Rules.',
    reverse: true,
    copy: {
      eyebrow: 'MAKE IT YOURS',
      parts: [['Your player.'], ['Your rules.', 'accent']],
      desc: 'Less clutter. More of what you use. Change the layout. Choose your tools. Find your rhythm.',
    },
    signal: [120, 'SIGNAL · VINYL'],
    ui: (m) =>
      Panel(
        [
          Tx('H4', 'Make it yours'),
          Chips(['Focus', 'Studio', 'Mini']),
          SettingRow('Lyrics', null, Switch('Lyrics', true)),
          SettingRow('Floating queue', null, Switch('Floating queue', true)),
          SettingRow('Visualizer', null, Switch('Visualizer', false)),
          !m && SettingRow('Credits', null, Switch('Credits', false)),
          Tx('Caption', 'Feature concept · Demo content'),
        ],
        { width: m ? 'fill_container' : 460 },
      ),
    note: 'Enter: the player canvas rises over its back plate; the floating queue is dropped in at −5° and keeps floating; the toggle switches on. 3D: a vinyl with grooves over a perspective floor grid.',
  },
  {
    name: '06 • A Library With A Memory',
    stack: true,
    copy: {
      eyebrow: 'YOUR COLLECTION, CONNECTED',
      parts: [['A library with'], ['a memory.', 'accent']],
      desc: 'Find it faster. Keep it organised. Bring a version back.',
    },
    signal: [110, 'SIGNAL · HELIX'],
    ui: (m) =>
      (m ? Col : Row)({ name: 'Library', gap: 20, width: 'fill_container' }, [
        !m &&
          Panel(
            [Tx('Eyebrow', 'YOUR LIBRARY'), ...TRACKS.slice(0, 4).map((t) => mt(t, 'Playlist'))],
            { width: 260 },
          ),
        !m &&
          Panel([Input(null, 'night'), ...TRACKS.slice(0, 4).map((t) => mt(t))], {
            width: 'fill_container',
          }),
        Panel(
          [
            Tx('H4', 'Night drive · history'),
            SettingRow('Today', '24 tracks', Badge('Current', 'secondary')),
            SettingRow('Yesterday', '21 tracks', Badge('Selected', 'default')),
            SettingRow('Sep 02', '18 tracks', Badge('Saved', 'outline')),
            Button('Restore this version', 'default', { width: 'fill_container' }),
          ],
          { width: m ? 'fill_container' : 340 },
        ),
      ]),
    note: 'Enter: the search types "night", results and history rows cascade in. 3D: a double-helix ribbon (memory); particles stack into three version rings.',
  },
  {
    name: '07 • Follow The Sound',
    copy: {
      eyebrow: 'DISCOVER THE CONNECTIONS',
      parts: [['Follow the'], ['sound.', 'accent']],
      desc: 'Explore the artists, influences and scenes behind what you love.',
    },
    signal: [110, 'SIGNAL · BLOOM'],
    ui: (m) =>
      m
        ? Col({ gap: 12, width: 'fill_container', alignItems: 'center' }, [
            node(true, 'Luma Vale', 'You are here', 'luma'),
            Chips(['Electronic', 'Dream pop', 'Night']),
          ])
        : Col({ name: 'Graph', gap: 22, width: 640, alignItems: 'center' }, [
            Row({ gap: 120 }, [
              node(false, 'Mira Sol', 'Influence', 'avatar1'),
              node(false, 'Night Pulse', 'Shared scene', 'avatar3'),
            ]),
            Row({ gap: 40, alignItems: 'center' }, [
              node(false, 'Static Bloom', 'Similar sound', 'avatar4'),
              node(true, 'Luma Vale', 'You are here', 'luma'),
              node(false, 'Kite Halo', 'Shared scene', 'avatar2'),
            ]),
            Row({ gap: 120 }, [
              node(false, 'Auren Sky', 'Similar sound', 'avatar2'),
              node(false, 'Glass Harbour', 'Similar sound', 'avatar1'),
            ]),
          ]),
    note: 'Enter: eight links draw from Luma Vale, nodes pop from the edges, connection tags fade in. 3D: a spiked bloom sits behind the focus node; particles trace the same graph.',
  },
  {
    name: '08 • Same Queue. New Scene.',
    copy: {
      eyebrow: 'KEEP THE SESSION GOING',
      parts: [['Same queue.'], ['New scene.', 'accent']],
      desc: 'Move your listening between devices. Or open the room to friends.',
      extra: [
        feature('smartphone', 'Your devices', 'Move personal playback'),
        feature('users-round', 'Listening room', 'Listen together'),
      ],
    },
    signal: [110, 'SIGNAL · TWIST'],
    ui: (m) =>
      Panel(
        [
          Row({ width: 'fill_container', justifyContent: 'space_between' }, [
            Tx('H4', 'Room: After hours'),
            R('Status/Success', {}, { label: { content: 'Room live' } }),
          ]),
          Row({ gap: 16, width: 'fill_container' }, [
            BigCover('night', m ? 120 : 160),
            Col({ gap: 6, width: 'fill_container' }, [
              Tx('Eyebrow', 'IN SYNC'),
              Tx('H3', 'Night Signal'),
              Tx('Muted', 'Demo artist'),
              seek(),
            ]),
          ]),
          R(
            'Device Row/Active',
            {},
            {
              icon: { icon: 'smartphone' },
              name: { content: 'This phone' },
              status: { content: 'Ready to play' },
            },
          ),
          R(
            'Device Row',
            {},
            {
              icon: { icon: 'laptop' },
              name: { content: 'Desktop' },
              status: { content: 'Playing' },
            },
          ),
          Button('Move playback to this phone', 'default', { width: 'fill_container' }),
        ],
        { width: m ? 'fill_container' : 520 },
      ),
    note: 'Enter: the phone slides in over the desktop window and the dashed link draws between them; both progress bars tick in sync. 3D: a twisted torus; particles outline both devices.',
  },
  {
    name: '09 • Beyond The Play Button',
    copy: {
      eyebrow: 'MUSIC IS A CONVERSATION',
      parts: [['Beyond the'], ['play button.', 'accent']],
      desc: "Share the moment. Follow a friend's taste. Talk with the artist.",
    },
    signal: [110, 'SIGNAL · VOICE'],
    ui: (m) =>
      Panel(
        [
          Row({ gap: 14, width: 'fill_container' }, [
            BigCover('night', 72),
            Col({ gap: 2, width: 'fill_container' }, [
              Tx('Eyebrow', 'TRACK DISCUSSION'),
              Tx('H3', 'Night Signal'),
              Tx('Muted', 'Demo artist · 24 comments'),
            ]),
          ]),
          ...[
            ['avatar1', 'Maya', 'commented at 0:42', 'That synth swell'],
            ['avatar2', 'Jonah', 'commented at 1:36', 'The whole city at 2 AM'],
            !m && ['avatar3', 'Demo artist', 'replied at 2:28', 'Recorded in one take'],
          ]
            .filter(Boolean)
            .map(([av, n, a, item]) =>
              R(
                'Activity Row',
                {},
                {
                  avatar: { fill: img(ART[av]) },
                  name: { content: n },
                  action: { content: a },
                  item: { content: item },
                  time: { content: 'Today' },
                  cover: { fill: img(ART.night) },
                  play: { enabled: false },
                },
              ),
            ),
          Input(null, 'Comment at 1:38…'),
        ],
        { width: m ? 'fill_container' : 560 },
      ),
    note: 'Enter: comment markers pop on the waveform, comments appear one by one. 3D: the sphere speaks — high noise amplitude; particles ripple out from the friend card.',
  },
  {
    name: '10 • Our Partners',
    copy: {
      eyebrow: 'OUR PARTNERS',
      parts: [['Partners who keep'], ['the signal on air.', 'accent']],
      desc: 'Labels, studios and services we build with. Grab one and throw it — they bounce back.',
      extra: [
        Button('Become a partner', 'large-default', { icon: 'arrow-right' }),
        Tx('Caption', 'Placeholder marks — replace with real partner logos'),
      ],
    },
    mobileExtra: () => [
      Button('Become a partner', 'large-default', { icon: 'arrow-right', width: 'fill_container' }),
    ],
    signal: [90, 'SIGNAL · BLOOM'],
    ui: (m) =>
      Col(
        {
          name: 'Partner Spheres',
          gap: 0,
          width: m ? 'fill_container' : 620,
          alignItems: 'center',
        },
        [
          Row({ gap: 0, alignItems: 'end' }, [
            sphere('Primary', 'ON AIR', m ? 80 : 130),
            sphere('Magenta', 'LABEL', m ? 96 : 150),
            sphere('Blue', 'STUDIO', m ? 76 : 120),
          ]),
          Row({ gap: 0 }, [
            sphere('Blue', 'SYNC', m ? 70 : 110),
            sphere('Primary', 'FM', m ? 100 : 160),
            sphere('Magenta', 'LIVE', m ? 80 : 124),
            !m && sphere('Primary', 'DSP', 100),
          ]),
          Row({ gap: 0, alignItems: 'start' }, [
            sphere('Magenta', 'MIX', m ? 76 : 120),
            sphere('Blue', 'WAVE', m ? 90 : 140),
          ]),
        ],
      ),
    note: 'Interactive: 30 inflated rubber spheres (clearcoat) pulled to the centre, colliding; the cursor pushes them, grab to drag and throw, they squash with speed. Enter: they fly in from the edges.',
  },
  {
    name: '11 • About Our Team',
    copy: {
      eyebrow: 'ABOUT OUR TEAM',
      parts: [['Small team.'], ['Loud signal.', 'accent']],
      desc: 'Two people build Bitrate — the player, the artist portal, the API and everything in between. Hover a bubble to meet us, drag it to play.',
      extra: [
        Row({ gap: 12 }, [
          R(
            'Stat Tile',
            {},
            { label: { content: 'People' }, value: { content: '2' }, sub: { enabled: false } },
          ),
          R(
            'Stat Tile',
            {},
            { label: { content: 'Workspaces' }, value: { content: '9' }, sub: { enabled: false } },
          ),
        ]),
        Row({ gap: 12 }, [
          Button('Join us', 'large-default', { icon: 'arrow-right' }),
          Button('How we work', 'large-outline'),
        ]),
      ],
    },
    mobileExtra: () => [
      Button('Join us', 'large-default', { icon: 'arrow-right', width: 'fill_container' }),
    ],
    signal: [90, 'SIGNAL · SPHERE'],
    ui: (m, open) =>
      Col({ name: 'Team Pit', gap: 0, width: m ? 'fill_container' : 700, alignItems: 'center' }, [
        open && !m && hoverCard(),
        Row({ gap: 0, alignItems: 'end' }, [
          tech('Next.js'),
          person('VT'),
          tech('NestJS', 80),
          !m && tech('Svelte 5', 76),
        ]),
        Row({ gap: 0, alignItems: 'start' }, [
          tech('Redis', 70),
          tech('TanStack Start', 100),
          person('AK'),
          tech('Tauri 2', 74),
          !m && tech('Expo', 70),
        ]),
      ]),
    note: 'Interactive: bubbles fall with gravity and stack in the pit; drag and throw them. Hover a person → shadcn-style hover card with GitHub and repository links; hover a stack bubble → where it lives in the repo.',
  },
]
const FINAL = {
  name: '12 • Start',
  note: 'Enter: the Newton\'s cradle swings in (chrome matcap balls, one sine split between the outer balls); the dome rises behind; glitch on "left off." Footer: the status pill opens the health panel.',
}

const dots = (active) =>
  Col(
    { name: 'Scene Dots', gap: 12, alignItems: 'center' },
    Array.from({ length: TOTAL }, (_, i) =>
      R(i === active ? 'Landing/Scene Dot Active' : 'Landing/Scene Dot'),
    ),
  )
const counter = (i) =>
  R(
    'Landing/Scene Counter',
    {},
    {
      index: { content: String(i + 1).padStart(2, '0') },
      total: { content: String(TOTAL) },
      progress: { width: Math.round((120 * (i + 1)) / TOTAL) },
    },
  )
const note = (text, w = 440) => R('Landing/Motion Note', {}, { note: { content: text, width: w } })
const sceneBar = (i, text) =>
  L(
    {
      name: 'Scene Bar',
      width: 'fill_container',
      padding: [0, 24, 24, 120],
      gap: 24,
      alignItems: 'end',
    },
    [counter(i), L({ name: 'Spacer', width: 'fill_container' }), note(text), R('Assistant/FAB')],
  )
const sceneD = (sc, i, open) => {
  const c = copy(sc.copy, false)
  const v = sc.ui?.(false, open)
  const stage = sc.stack
    ? L(
        {
          name: 'Stage',
          width: 'fill_container',
          height: 'fill_container',
          padding: [40, 64, 0, 120],
          gap: 40,
          alignItems: 'start',
        },
        [
          Col({ name: 'Main', width: 'fill_container', gap: 36 }, [
            Row({ name: 'Head', width: 'fill_container', gap: 40, alignItems: 'start' }, [
              Col({ name: 'Copy', gap: 14, width: 'fill_container' }, c.children),
              SIGNAL(...sc.signal),
            ]),
            v,
          ]),
          L(
            {
              name: 'Rail',
              height: 'fill_container',
              layout: 'vertical',
              justifyContent: 'center',
            },
            [dots(i)],
          ),
        ],
      )
    : L(
        {
          name: 'Stage',
          width: 'fill_container',
          height: 'fill_container',
          padding: [0, 64, 0, 120],
          gap: 32,
          alignItems: 'center',
        },
        [
          ...(sc.reverse ? [v, c] : [c, v]),
          L({ name: 'Spacer', width: 'fill_container' }),
          SIGNAL(...sc.signal),
          dots(i),
        ],
      )
  return L({ name: sc.name, width: 'fill_container', height: 900, layout: 'vertical' }, [
    R('Public Header'),
    stage,
    sceneBar(i, sc.note),
  ])
}
const finalCopy = (m) =>
  Col({ name: 'Copy', gap: 16, alignItems: 'center', width: m ? 'fill_container' : 900 }, [
    Tx('Eyebrow', 'READY WHEN YOU ARE'),
    Col({ gap: 0, alignItems: 'center', width: 'fill_container' }, [
      Tx(style(null, m), 'Pick up where the', { wrap: true, textAlign: 'center' }),
      Tx(style('accent', m), 'last track left off.', { wrap: true, textAlign: 'center' }),
    ]),
    Tx('Paragraph', 'Open Bitrate in the browser and make the next session yours.', {
      wrap: true,
      textAlign: 'center',
      width: m ? 'fill_container' : 560,
    }),
    Button('Open web player', 'large-default', {
      icon: 'arrow-right',
      ...(m ? { width: 'fill_container' } : {}),
    }),
  ])
/* footer with the health status slot: default pill, or a given pill variant */
const footer = (pill) =>
  pill
    ? R(
        'Landing/Footer',
        {},
        {
          status: {
            type: 'frame',
            id: id(),
            name: 'Status Slot',
            children: [R(`Health/Pill ${pill}`)],
          },
        },
      )
    : R('Landing/Footer')
const finalD = (pill, overlay) =>
  L({ name: FINAL.name, width: 'fill_container', height: 900, layout: 'vertical' }, [
    R('Public Header'),
    L(
      {
        name: 'Stage',
        width: 'fill_container',
        height: 'fill_container',
        padding: [0, 64, 0, 120],
        gap: 40,
        alignItems: 'center',
      },
      [
        L({ name: 'Spacer', width: 'fill_container' }),
        Col({ name: 'Centre', gap: 28, alignItems: 'center' }, [
          finalCopy(false),
          R('Landing/Cradle'),
          Tx('Eyebrow', 'ENERGY CARRIES ON. SO DOES YOUR QUEUE.'),
        ]),
        L({ name: 'Spacer', width: 'fill_container' }),
        overlay
          ? L(
              {
                name: 'Overlay',
                layout: 'vertical',
                alignItems: 'end',
                height: 'fill_container',
                justifyContent: 'end',
                padding: [0, 0, 12, 0],
              },
              [overlay],
            )
          : dots(TOTAL - 1),
      ],
    ),
    sceneBar(TOTAL - 1, FINAL.note),
    footer(pill),
  ])

const mobileHeader = () =>
  L(
    {
      name: 'Mobile Header',
      width: 'fill_container',
      height: 64,
      padding: [0, 8, 0, 16],
      justifyContent: 'space_between',
      alignItems: 'center',
    },
    [Logo(), R('Button/Icon Ghost', {}, { icon: { icon: 'menu' } })],
  )
const sceneM = (name, i, signal, body) =>
  L({ name, width: 'fill_container', height: 844, layout: 'vertical', clip: true }, [
    R('Mobile/Status Bar', { width: 'fill_container' }),
    mobileHeader(),
    L(
      {
        name: 'Stage',
        width: 'fill_container',
        height: 'fill_container',
        layout: 'vertical',
        padding: [8, 16],
        gap: 18,
        alignItems: 'center',
      },
      [signal && SIGNAL(...signal), ...body],
    ),
    L(
      {
        name: 'Scene Bar',
        width: 'fill_container',
        padding: [0, 16, 28, 16],
        justifyContent: 'space_between',
        alignItems: 'center',
      },
      [counter(i), Tx('Caption', 'Swipe'), R('Assistant/FAB')],
    ),
  ])
const mobileSignal = ([size, phase], i) => (i === 0 ? null : [Math.min(size, 80), phase])

const pageFrame = (name, w, children) => ({
  type: 'frame',
  id: id(),
  name,
  width: w,
  layout: 'vertical',
  clip: true,
  fill: C.background,
  children: children.flat().filter(Boolean),
})

const desktop = () => pageFrame('Landing', W, [...SCENES.map(sceneD), finalD()])
const mobile = () =>
  pageFrame('Landing', 390, [
    ...SCENES.map((sc, i) =>
      sceneM(sc.name, i, mobileSignal(sc.signal, i), [
        copy({ ...sc.copy, extra: sc.mobileExtra?.() ?? [] }, true),
        sc.ui?.(true),
      ]),
    ),
    sceneM(FINAL.name, TOTAL - 1, null, [finalCopy(true), R('Landing/Cradle')]),
  ])

/* service health: the footer pill opens a panel of every service (demo data until /health exists) */
const SERVICES = [
  ['API', 'NestJS · apps/api'],
  ['Web player', 'apps/web-player'],
  ['Artist portal', 'apps/web-artists'],
  ['Streaming', 'Audio delivery'],
  ['Realtime', 'Socket.io · queue sync'],
  ['Background jobs', 'BullMQ'],
  ['Database', 'PostgreSQL'],
  ['Cache', 'Redis'],
]
const healthPanel = (variant, w = 460) => {
  const status = (i) =>
    variant === 'Degraded' && i === 3
      ? 'Degraded'
      : variant === 'Outage' && i === 4
        ? 'Outage'
        : variant === 'Outage' && i === 3
          ? 'Degraded'
          : variant === 'Checking'
            ? 'Checking'
            : variant === 'Maintenance' && i === 6
              ? 'Maintenance'
              : 'Operational'
  const uptime = {
    Operational: '99.98%',
    Degraded: '99.71%',
    Outage: '98.40%',
    Maintenance: '99.95%',
    Checking: '—',
  }
  return R(
    'Health/Panel',
    { width: w },
    {
      overall: {
        type: 'frame',
        id: id(),
        name: 'Overall',
        children: [R(`Health/Pill ${variant}`)],
      },
      rows: {
        type: 'frame',
        id: id(),
        name: 'Rows',
        layout: 'vertical',
        width: 'fill_container',
        children: SERVICES.map(([n, meta], i) =>
          R(
            `Health/Service ${status(i)}`,
            {},
            { name: { content: n }, meta: { content: `${uptime[status(i)]} · ${meta}` } },
          ),
        ),
      },
      incident: {
        content:
          variant === 'Operational'
            ? 'No incidents in the last 30 days'
            : variant === 'Checking'
              ? 'Fetching the latest checks…'
              : variant === 'Maintenance'
                ? 'Database maintenance · 02:00–02:30 UTC'
                : variant === 'Outage'
                  ? 'Realtime sync is down · investigating'
                  : 'Streaming is slower than usual · monitoring',
      },
    },
  )
}
const healthMobile = (name, variant) =>
  L(
    {
      name,
      width: 'fill_container',
      height: 844,
      layout: 'vertical',
      justifyContent: 'end',
      padding: [0, 12, 20, 12],
      gap: 12,
    },
    [healthPanel(variant, 'fill_container'), R(`Health/Pill ${variant}`)],
  )

/* overlays shown on their own scrim frame: flex has no stacking, so the modal is the frame's content */
const scrimFrame = (name, w, h, panel) => ({
  type: 'frame',
  id: id(),
  name,
  width: w,
  height: h,
  layout: 'vertical',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 16,
  fill: C.scrim,
  children: [panel],
})
const loginModal = (w) =>
  Panel(
    [
      Logo(),
      Tx('H2', 'Sign in'),
      Tx('Paragraph', 'Please login to continue to your account.', { wrap: true }),
      Input('Email Address', 'you@example.com'),
      Input('Password', '••••••••'),
      Tx('Link', 'Forgot password?'),
      Button('Log in', 'large-default', { width: 'fill_container' }),
      R('Auth/Or Divider'),
      OAuth(),
      Row({ gap: 6 }, [Tx('Muted', "Don't have an account?"), Tx('Link', 'Sign up')]),
    ],
    { width: w },
  )
const signUpModal = (w) =>
  Panel(
    [
      Logo(),
      Tx('H2', 'Sign Up'),
      Tx('Paragraph', 'Sign up to enjoy the features of Bitrate.', { wrap: true }),
      Input('Full Name', 'Maya Rivers'),
      Input('Email Address', 'you@example.com'),
      Input('Password', '••••••••'),
      Input('Confirm Password', '••••••••'),
      CheckRow(
        'I am at least 16 years old, I accept the Terms of Use and Community Guidelines, and I have read the Privacy Policy.',
      ),
      Button('Register', 'large-default', { width: 'fill_container' }),
      R('Auth/Or Divider'),
      OAuth(false, { consent: false }),
    ],
    { width: w },
  )
const menu = () =>
  pageFrame('Menu open', 390, [
    R('Mobile/Status Bar', { width: 'fill_container' }),
    L(
      {
        name: 'Mobile Header',
        width: 'fill_container',
        height: 64,
        padding: [0, 8, 0, 16],
        justifyContent: 'space_between',
        alignItems: 'center',
      },
      [Logo(), R('Button/Icon Ghost', {}, { icon: { icon: 'x' } })],
    ),
    Col(
      { name: 'Navigation', width: 'fill_container', padding: [16, 16], gap: 4 },
      [
        ['Premium', 'sparkles'],
        ['Support', 'life-buoy'],
        ['Download', 'download'],
      ].map(([l, _icon]) =>
        R(
          'Setting Row',
          {},
          {
            title: { content: l },
            desc: { enabled: false },
            control: L({ name: 'Chevron' }, [Ic('chevron-right')]),
          },
        ),
      ),
    ),
    L({ name: 'Spacer', width: 'fill_container', height: 360 }),
    Col({ name: 'Actions', width: 'fill_container', padding: [16, 16, 32, 16], gap: 12 }, [
      Button('Register', 'large-default', { width: 'fill_container' }),
      Button('Login', 'large-outline', { width: 'fill_container' }),
    ]),
  ])

export const landing = {
  title: 'Landing',
  route: '/',
  context:
    'Public landing as twelve fullscreen scenes, one per scroll gesture, kept in sync with landing/motion-prototype.html: signal, loop, artists, workshop, your rules, library, discovery, devices, conversation, partners, team, start. Each scene carries its motion note; the footer holds the service-health pill. Concepts and placeholder marks are labelled.',
  desktop,
  mobile,
  states: [
    state(
      'Login modal',
      () => scrimFrame('Login modal', W, 900, loginModal(420)),
      () => scrimFrame('Login modal', 390, 844, loginModal('fill_container')),
    ),
    state(
      'Sign-up modal',
      () => scrimFrame('Sign-up modal', W, 900, signUpModal(440)),
      () => scrimFrame('Sign-up modal', 390, 844, signUpModal('fill_container')),
    ),
    state('Menu open', null, menu, 'the desktop header shows the navigation inline'),
    state(
      'Status open',
      () => pageFrame('Status open', W, [finalD('Operational', healthPanel('Operational'))]),
      () => pageFrame('Status open', 390, [healthMobile('Status open', 'Operational')]),
    ),
    state(
      'Status degraded',
      () => pageFrame('Status degraded', W, [finalD('Degraded', healthPanel('Degraded'))]),
      () => pageFrame('Status degraded', 390, [healthMobile('Status degraded', 'Degraded')]),
    ),
    state(
      'Status outage',
      () => pageFrame('Status outage', W, [finalD('Outage', healthPanel('Outage'))]),
      () => pageFrame('Status outage', 390, [healthMobile('Status outage', 'Outage')]),
    ),
    state(
      'Status maintenance',
      () => pageFrame('Status maintenance', W, [finalD('Maintenance', healthPanel('Maintenance'))]),
      () =>
        pageFrame('Status maintenance', 390, [healthMobile('Status maintenance', 'Maintenance')]),
    ),
    state(
      'Status checking',
      () => pageFrame('Status checking', W, [finalD('Checking', healthPanel('Checking'))]),
      () => pageFrame('Status checking', 390, [healthMobile('Status checking', 'Checking')]),
    ),
    state(
      'Team hover card',
      () => pageFrame('Team hover card', W, [sceneD(SCENES[10], 10, true)]),
      null,
      'hover cards need a pointer; on touch a tap opens the same card',
    ),
  ],
}
