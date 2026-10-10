// Landing (Original Edition content), composed only from library instances; three themes, mobile, states.
import { TRACKS, img, id, C } from './kit.mjs'
import {
  R,
  L,
  Row,
  Col,
  Tx,
  Ic,
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

/* fullscreen scenes: one scene per scroll gesture; the 3D signal morphs between them (see motion-prototype.html) */
const SIGNAL = (size, phase) =>
  R(
    'Landing/Signal',
    {},
    { image: { width: size, height: size, cornerRadius: size / 2 }, phase: { content: phase } },
  )
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
    signal: [560, 'SIGNAL · SPHERE'],
    note: 'Enter: letters rise one by one, the sphere breathes. 3D: noise-displaced sphere tilts toward the cursor. Exit: particles flatten into a wave.',
  },
  {
    name: '02 • Play. Save. Return.',
    copy: {
      eyebrow: 'ONE LISTENING LOOP',
      parts: [['Play.'], ['Save.', 'accent'], ['Return.', 'magenta']],
      desc: 'Built around the music you come back to.',
    },
    signal: [180, 'SIGNAL · WAVE'],
    ui: (m) =>
      Col({ name: 'Loop Cards', gap: 12, width: 'fill_container' }, [
        Panel([
          feature('play', 'Play without losing focus', 'The controls you need, within reach.'),
          R('Seek Bar'),
        ]),
        !m &&
          Panel([feature('heart', 'Save what matters', 'Build a library that sounds like you.')]),
        !m &&
          Panel([feature('history', 'Find your way back', 'Your returns, together in recents.')]),
      ]),
    note: 'Enter: cards rise with a 3D tilt, the seek bar fills. 3D: particles ride a sine wave under the cards. Exit: cards fall away upward.',
  },
  {
    name: '03 • For Artists',
    reverse: true,
    copy: {
      eyebrow: 'FOR ARTISTS',
      parts: [['Release work,'], ['in one line'], ['of sight.', 'accent']],
      desc: 'Versions, tasks and delivery on one timeline. The system suggests. You stay in control.',
      extra: [Tx('Caption', 'Release workspace concept · Demonstration data')],
    },
    mobileExtra: () => [Tx('Caption', 'Release workspace concept · Demonstration data')],
    signal: [160, 'SIGNAL · RING'],
    ui: (m) =>
      Panel([
        Row({ width: 'fill_container', justifyContent: 'space_between' }, [
          Tx('Eyebrow', 'NEXT IN LINE'),
          Tx('Muted', '2 / 7'),
        ]),
        SettingRow(
          'Release check',
          'Align the master, artwork and metadata.',
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
      ]),
    note: 'Enter: steps light up in sequence, checks slide in. 3D: particles orbit as a flat ring around the sphere. Exit: ring collapses inward.',
  },
  {
    name: '04 • Playlist Workshop',
    copy: {
      eyebrow: 'PLAYLIST WORKSHOP · CONCEPT',
      parts: [['Start with a feeling.'], ['Finish with'], ['your playlist.', 'accent']],
      desc: 'Describe the session. Compare a few tracks. Keep the final say.',
      extra: [Chips(['Calm', 'Late night', '45 min', 'From liked songs'])],
    },
    signal: [150, 'SIGNAL · ORBITS'],
    ui: (m) =>
      Panel(
        TRACKS.slice(0, m ? 2 : 4).map((t, i) =>
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
      ),
    note: 'Enter: chips pop in. Loop: candidates re-rank every 2.6 s (FLIP). 3D: particles split into four orbits, one per candidate. Exit: orbits unwind.',
  },
  {
    name: '05 • Follow The Sound',
    reverse: true,
    copy: {
      eyebrow: 'DISCOVER THE CONNECTIONS',
      parts: [['Follow'], ['the sound.', 'accent']],
      desc: 'Explore the artists, influences and scenes behind what you love.',
      extra: [Chips(['Electronic', 'Dream pop', 'Night'])],
    },
    signal: [140, 'SIGNAL · GRAPH'],
    ui: (m) =>
      m
        ? R('Artist Hero/Mobile', { width: 'fill_container' }, { name: { content: 'Luma Vale' } })
        : R(
            'Artist Hero',
            { width: 'fill_container', height: 300 },
            { name: { content: 'Luma Vale' } },
          ),
    note: 'Enter: related artists burst from the centre node. 3D: particles gather into five hubs joined by links. Background: outlined genre marquee.',
  },
  {
    name: '06 • Same Queue. New Scene.',
    copy: {
      eyebrow: 'KEEP THE SESSION GOING',
      parts: [['Same queue.'], ['New scene.', 'accent']],
      desc: 'Move your listening between devices, or open the room to friends.',
    },
    signal: [140, 'SIGNAL · SPLIT'],
    ui: () =>
      Panel([
        R(
          'Device Row/Active',
          {},
          {
            icon: { icon: 'smartphone' },
            name: { content: 'This phone' },
            status: { content: 'Playing' },
          },
        ),
        R(
          'Device Row',
          {},
          {
            icon: { icon: 'laptop' },
            name: { content: 'Desktop' },
            status: { content: 'Paused · in sync' },
          },
        ),
        R('Seek Bar'),
      ]),
    note: 'Enter: devices slide in, progress bars tick in sync. 3D: the sphere flattens into a wave over two particle clouds. Exit: clouds merge.',
  },
]
const FINAL = {
  name: '07 • Start',
  signal: [320, 'SIGNAL · BURST'],
  note: 'Enter: the sphere swells and bursts into a particle field; magnetic CTA follows the cursor. Exit: none — last scene.',
}

const dots = (active) =>
  Col(
    { name: 'Scene Dots', gap: 14, alignItems: 'center' },
    Array.from({ length: 7 }, (_, i) =>
      R(i === active ? 'Landing/Scene Dot Active' : 'Landing/Scene Dot'),
    ),
  )
const counter = (i) =>
  R(
    'Landing/Scene Counter',
    {},
    {
      index: { content: String(i + 1).padStart(2, '0') },
      progress: { width: Math.round((120 * (i + 1)) / 7) },
    },
  )
const note = (text, w = 420) => R('Landing/Motion Note', {}, { note: { content: text, width: w } })
const sceneBar = (i, text) =>
  L(
    {
      name: 'Scene Bar',
      width: 'fill_container',
      padding: [0, 120, 32, 120],
      justifyContent: 'space_between',
      alignItems: 'end',
    },
    [counter(i), note(text)],
  )
const sceneD = (sc, i) => {
  const c = copy(sc.copy, false)
  const v = Col({ name: 'Visual', gap: 24, width: 600, alignItems: 'center' }, [
    SIGNAL(...sc.signal),
    sc.ui?.(false),
  ])
  return L({ name: sc.name, width: 'fill_container', height: 900, layout: 'vertical' }, [
    R('Public Header'),
    L(
      {
        name: 'Stage',
        width: 'fill_container',
        height: 'fill_container',
        padding: [0, 64, 0, 120],
        gap: 64,
        alignItems: 'center',
      },
      [...(sc.reverse ? [v, c] : [c, v]), L({ name: 'Spacer', width: 'fill_container' }), dots(i)],
    ),
    sceneBar(i, sc.note),
  ])
}
const finalCopy = (m) =>
  Col({ name: 'Copy', gap: 18, alignItems: 'center', width: m ? 'fill_container' : 900 }, [
    Tx('Eyebrow', 'READY WHEN YOU ARE'),
    Col({ gap: 0, alignItems: 'center', width: 'fill_container' }, [
      Tx(style(null, m), 'Pick up where', { wrap: true, textAlign: 'center' }),
      Tx(style(null, m), 'the last track', { wrap: true, textAlign: 'center' }),
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
  ])
const finalD = () =>
  L({ name: FINAL.name, width: 'fill_container', height: 900, layout: 'vertical' }, [
    R('Public Header'),
    L(
      {
        name: 'Stage',
        width: 'fill_container',
        height: 'fill_container',
        padding: [0, 64, 0, 120],
        gap: 48,
        alignItems: 'center',
      },
      [
        L({ name: 'Spacer', width: 'fill_container' }),
        Col({ name: 'Centre', gap: 24, alignItems: 'center' }, [
          SIGNAL(...FINAL.signal),
          finalCopy(false),
        ]),
        L({ name: 'Spacer', width: 'fill_container' }),
        dots(6),
      ],
    ),
    sceneBar(6, FINAL.note),
    R('Landing/Footer'),
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
  L({ name, width: 'fill_container', height: 844, layout: 'vertical' }, [
    R('Mobile/Status Bar', { width: 'fill_container' }),
    mobileHeader(),
    L(
      {
        name: 'Stage',
        width: 'fill_container',
        height: 'fill_container',
        layout: 'vertical',
        padding: [8, 16],
        gap: 20,
        alignItems: 'center',
      },
      [SIGNAL(...signal), ...body],
    ),
    L(
      {
        name: 'Scene Bar',
        width: 'fill_container',
        padding: [0, 16, 28, 16],
        justifyContent: 'space_between',
        alignItems: 'center',
      },
      [counter(i), Tx('Caption', 'Swipe')],
    ),
  ])
const mobileSignal = ([size, phase], i) => [i === 0 ? 220 : Math.min(size, 120), phase]

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
    sceneM(FINAL.name, 6, [200, FINAL.signal[1]], [finalCopy(true)]),
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
    'Public landing as seven fullscreen scenes, one per scroll gesture: signal hero, listening loop, artists, playlist workshop, discovery, devices, final CTA. A 3D signal sphere morphs between scenes; each scene carries its motion note. Live motion: landing/motion-prototype.html. Concepts are labelled.',
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
