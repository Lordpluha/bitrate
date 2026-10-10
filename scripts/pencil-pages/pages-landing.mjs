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
  Chips,
  Panel,
  Logo,
  MobileTrack,
  SettingRow,
  CheckRow,
  state,
  Button,
  Input,
  Badge,
  ART,
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
const sectionD = (name, c, visual, reverse) =>
  L(
    { name, width: 'fill_container', padding: [96, 120], gap: 80, alignItems: 'center' },
    reverse ? [visual(false), copy(c, false)] : [copy(c, false), visual(false)],
  )
const sectionM = (name, c, visual) =>
  L({ name, width: 'fill_container', layout: 'vertical', padding: [48, 16], gap: 24 }, [
    copy(c, true),
    visual(true),
  ])
const feature = (icon, title, desc) =>
  R('Landing/Feature', {}, { icon: { icon }, title: { content: title }, desc: { content: desc } })
const vis = (w) => (mobile) => ({ width: mobile ? 'fill_container' : w })

const SECTIONS = [
  [
    '12 • Play. Save. Return.',
    {
      parts: [['Play.'], ['Save.', 'accent'], ['Return.', 'magenta']],
      desc: 'One listening loop. Built around the music you come back to.',
    },
    (m) =>
      Col({ name: 'Loop Cards', gap: 16, width: m ? 'fill_container' : 640 }, [
        Panel([
          feature(
            'play',
            'Play without losing focus',
            'Your music in the browser. The controls you need, within reach.',
          ),
          R('Seek Bar'),
          R('Transport'),
        ]),
        Panel([
          feature(
            'heart',
            'Save what matters',
            'Like a track. Build a library that sounds more like you.',
          ),
          ...TRACKS.slice(1, 3).map((t) => MobileTrack(t[0], t[1], t[4])),
        ]),
        Panel([
          feature(
            'history',
            'Find your way back',
            'The tracks you keep coming back to. All together in your recents.',
          ),
          ...TRACKS.slice(3, 5).map((t) => MobileTrack(t[0], 'Yesterday', t[4])),
        ]),
      ]),
  ],
  [
    '13 • Artist Release Workspace',
    {
      eyebrow: 'FOR ARTISTS',
      parts: [['Release work,'], ['in one line of sight.', 'accent']],
      desc: 'Versions, tasks and delivery on one timeline. The system suggests. You stay in control.',
      extra: [Tx('Caption', 'Release workspace concept · Demonstration data')],
    },
    (m) =>
      Panel(
        [
          Row({ width: 'fill_container', justifyContent: 'space_between' }, [
            Tx('Eyebrow', 'NEXT IN LINE'),
            Tx('Muted', '2 / 7'),
          ]),
          SettingRow(
            'Release check',
            'Align the master, artwork and metadata. The pitch needs one decision.',
            Badge('Now', 'default'),
          ),
          SettingRow(
            'Prepare delivery',
            'Select services and confirm your release date.',
            Badge('20 min', 'outline'),
          ),
          SettingRow(
            'Post-release review',
            'Review signals and follow-up tasks after the release goes live.',
            Badge('After launch', 'outline'),
          ),
          Tx('Link', 'View full timeline'),
        ],
        vis(600)(m),
      ),
    true,
  ],
  [
    '14 • Playlist Workshop',
    {
      eyebrow: 'PLAYLIST WORKSHOP',
      parts: [['Start with a feeling.'], ['Finish with your playlist.', 'accent']],
      desc: 'Describe the session. Compare a few tracks. Shape a playlist that feels like you — and keep the final say.',
      extra: [
        feature('zap', 'Turn intent into music', 'Describe the mood, the activity or the moment.'),
        feature(
          'layers',
          'Compare and refine',
          'Rank a few tracks. Swap the ones that do not fit.',
        ),
        feature(
          'sliders-horizontal',
          'You stay in control',
          'Approve, reorder or replace. Nothing is final until you say so.',
        ),
      ],
    },
    (m) =>
      Panel(
        [
          Tx('H4', 'Candidate tracks'),
          ...TRACKS.slice(0, m ? 3 : 4).map((t, i) =>
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
        vis(600)(m),
      ),
  ],
  [
    '16 • Your Player. Your Rules.',
    {
      eyebrow: 'MAKE IT YOURS',
      parts: [['Your player.'], ['Your rules.', 'accent']],
      desc: 'Less clutter. More of what you use. Change the layout. Choose your tools. Find your rhythm.',
    },
    (m) =>
      Panel(
        [
          BigCover('night', m ? 326 : 360),
          Row({ width: 'fill_container' }, [
            Col({ gap: 2, width: 'fill_container' }, [
              Tx('H3', 'Night Signal'),
              Tx('Muted', 'Demo artist'),
            ]),
            Ic('heart', 'Primary', 22),
          ]),
          R('Seek Bar'),
          R('Transport'),
        ],
        vis(420)(m),
      ),
    true,
  ],
  [
    '17 • A Library With A Memory',
    {
      eyebrow: 'YOUR COLLECTION, CONNECTED',
      parts: [['A library with'], ['a memory.', 'accent']],
      desc: 'Find it faster. Keep it organised. Bring a version back.',
    },
    (m) =>
      Panel(
        [
          Row({ gap: 12 }, [
            Ic('audio-lines', 'Primary', 22),
            Col({ gap: 2 }, [Tx('H4', 'Night drive'), Tx('Muted', 'Playlist history')]),
          ]),
          SettingRow('Today', '24 tracks', Badge('Current', 'secondary')),
          SettingRow('Yesterday', '21 tracks', Badge('Selected', 'default')),
          SettingRow('Sep 02', '18 tracks', Badge('Saved', 'outline')),
          Tx('Muted', 'Changes in this version · 3 tracks added · 1 removed'),
          Button('Restore this version', 'default', { width: 'fill_container' }),
          Tx('Caption', 'Your current version stays in history.'),
        ],
        vis(560)(m),
      ),
  ],
  [
    '18 • Follow The Sound',
    {
      eyebrow: 'DISCOVER THE CONNECTIONS',
      parts: [['Follow the'], ['sound.', 'accent']],
      desc: 'Explore the artists, influences and scenes behind what you love.',
    },
    (m) =>
      Col({ name: 'Artist', gap: 16, width: m ? 'fill_container' : 620 }, [
        m
          ? R('Artist Hero/Mobile', { width: 'fill_container' }, { name: { content: 'Luma Vale' } })
          : R('Artist Hero', { height: 300 }, { name: { content: 'Luma Vale' } }),
        Chips(['Electronic', 'Dream pop', 'Night']),
        Panel([
          Tx('Body Strong', 'Why this connection'),
          Tx(
            'Paragraph',
            'Dreamlike synth textures, spacious vocals and a shared late-night scene.',
            { wrap: true },
          ),
          ...TRACKS.slice(1, 3).map((t) => MobileTrack(t[0], t[3], t[4])),
        ]),
      ]),
    true,
  ],
  [
    '19 • Same Queue. New Scene.',
    {
      eyebrow: 'KEEP THE SESSION GOING',
      parts: [['Same queue.'], ['New scene.', 'accent']],
      desc: 'Move your listening between devices. Or open the room to friends.',
      extra: [
        feature('smartphone', 'Your devices', 'Move personal playback'),
        feature('users-round', 'Listening room', 'Listen together'),
      ],
    },
    (m) =>
      Panel(
        [
          Tx('H4', 'Your devices'),
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
        vis(480)(m),
      ),
  ],
  [
    '20 • Beyond The Play Button',
    {
      eyebrow: 'MUSIC IS A CONVERSATION',
      parts: [['Beyond the'], ['play button.', 'accent']],
      desc: "Share the moment. Follow a friend's taste. Talk with the artist.",
    },
    (m) =>
      Panel(
        [
          Row({ gap: 12 }, [
            R('Media/Avatar', { width: 56, height: 56, fill: img(ART.avatar2) }),
            Col({ gap: 2 }, [Tx('H4', "Maya's listening"), Tx('Muted', 'Her music, lately.')]),
          ]),
          Chips(['Electronic', 'Ambient', 'UK Garage'], -1),
          ...[
            ['avatar2', 'Maya', 'liked', 'Broken beat', 'night'],
            ['avatar2', 'Maya', 'added', 'Ambient mornings', 'drift'],
          ].map(([av, n, a, item, art]) =>
            R(
              'Activity Row',
              {},
              {
                avatar: { fill: img(ART[av]) },
                name: { content: n },
                action: { content: a },
                item: { content: item },
                time: { content: 'This month' },
                cover: { fill: img(ART[art]) },
                play: { enabled: false },
              },
            ),
          ),
          Button('Explore profile', 'outline', { icon: 'arrow-right' }),
        ],
        vis(560)(m),
      ),
    true,
  ],
]

const hero = (m) =>
  m
    ? L(
        {
          name: '11 • Hero',
          width: 'fill_container',
          layout: 'vertical',
          padding: [32, 16, 48, 16],
          gap: 24,
        },
        [
          headline([['Your music,'], ['already where'], ['you are.', 'accent']], true),
          Tx(
            'Paragraph',
            'Instant access in your browser. Listen, save and return to your library.',
            { wrap: true },
          ),
          Button('Open web player', 'large-default', {
            icon: 'arrow-right',
            width: 'fill_container',
          }),
          Button('Create account', 'large-outline', { width: 'fill_container' }),
          R('Media/Hero Image', { width: 'fill_container', height: 300, fill: img(ART.hero) }),
        ],
      )
    : L(
        {
          name: '11 • Hero',
          width: 'fill_container',
          padding: [96, 120],
          gap: 64,
          alignItems: 'center',
        },
        [
          Col({ name: 'Copy', gap: 24, width: 520 }, [
            headline([['Your music,'], ['already where'], ['you are.', 'accent']]),
            Tx(
              'Paragraph',
              'Instant access in your browser. Listen, save and return to your library.',
              { wrap: true },
            ),
            Row({ gap: 12 }, [
              Button('Open web player', 'large-default', { icon: 'arrow-right' }),
              Button('Create account', 'large-outline'),
            ]),
          ]),
          R('Media/Hero Image', { width: 'fill_container', height: 560, fill: img(ART.hero) }),
        ],
      )
const finale = (m) =>
  L(
    {
      name: '15 • Final CTA',
      width: 'fill_container',
      layout: 'vertical',
      alignItems: 'center',
      padding: m ? [64, 16] : [120, 120],
      gap: 20,
    },
    [
      Tx('Eyebrow', 'READY WHEN YOU ARE'),
      Col({ gap: 0, alignItems: 'center', width: m ? 'fill_container' : 900 }, [
        Tx(style(null, m), 'Pick up where the last track', { wrap: true, textAlign: 'center' }),
        Tx(style('accent', m), 'left off.', { wrap: true, textAlign: 'center' }),
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
    ],
  )
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

const desktop = () =>
  pageFrame('Landing', W, [
    R('Public Header'),
    hero(false),
    ...SECTIONS.map(([n, c, v, rev]) => sectionD(n, c, v, rev)),
    finale(false),
    R('Landing/Footer'),
  ])
const mobile = () =>
  pageFrame('Landing', 390, [
    R('Mobile/Status Bar', { width: 'fill_container' }),
    mobileHeader(),
    hero(true),
    ...SECTIONS.map(([n, c, v]) => sectionM(n, c, v)),
    finale(true),
  ])

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
      CheckRow('I accept the Terms of Use and Privacy Policy'),
      Button('Continue with Google', 'outline', { width: 'fill_container' }),
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
      Button('Continue with Google', 'outline', { width: 'fill_container' }),
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
    'Public landing: hero, the listening loop, artist and playlist tools, discovery, devices, social, final CTA. Concepts are labelled.',
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
  ],
}
