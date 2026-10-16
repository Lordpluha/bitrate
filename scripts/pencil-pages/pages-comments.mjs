// Timed comments (SoundCloud-style). Every comment is pinned to a second of the track: avatars sit on the
// waveform, the comment surfaces as a bubble when playback reaches it, the list is ordered by time (tap the
// time to seek), and a new comment is pinned to the current second. Comments can be hidden while listening.
import { id, img, ART, Switch, Alert } from './kit.mjs'
import {
  R,
  L,
  Row,
  Col,
  Tx,
  BigCover,
  IconBtn,
  MHeader,
  EmptyState,
  SettingRow,
  fitStates,
  state,
} from './ui.mjs'

const COMMENTS = [
  ['avatar2', 'Jonah', '0:27', 'This synth entrance gets me every time.', '2 h', '12'],
  ['avatar3', 'Ava', '1:02', 'Volume up for the bridge 🎧', '5 h', '8'],
  ['avatar4', 'Leo', '1:48', 'the drop at 1:48 is unreal 🔥', '1 h', '31', true],
  ['avatar1', 'Maya', '2:21', 'Saving this for the late set.', 'just now', '2'],
  ['avatar2', 'Jonah', '3:04', 'That outro fade 🥲', '1 d', '5'],
]
const row = ([av, name, t, text, ago, likes, current], w = 'fill_container') =>
  R(
    current ? 'Comments/Row Current' : 'Comments/Row',
    { width: w },
    {
      avatar: { fill: img(ART[av]) },
      name: { content: name },
      time: { content: t },
      text: { content: text },
      ago: { content: ago },
      likes: { content: likes },
    },
  )
const bubble = (pad) =>
  L({ name: 'Live Comment', width: 'fill_container', padding: [0, 0, 0, pad] }, [
    R('Comments/Bubble'),
  ])
const times = () =>
  Row({ name: 'Times', width: 'fill_container', justifyContent: 'space_between' }, [
    Tx('Caption', '1:48'),
    Tx('Caption', '3:42'),
  ])
const head = (count = '128') =>
  R('Comments/Header', { width: 'fill_container' }, { count: { content: count } })
const screen = (name, w, h, children, o = {}) => ({
  type: 'frame',
  id: id(),
  name,
  width: w,
  height: h,
  clip: true,
  layout: 'vertical',
  fill: '$ds:--background',
  children,
  ...o,
})

/* desktop: player in the middle, the comment list beside it follows the playhead */
const desk = (
  name,
  {
    wave = 'Comments/Waveform Wide',
    live = true,
    composer = R('Comments/Composer', { width: 'fill_container' }),
    list,
    eyebrow = 'NOW PLAYING · 128 COMMENTS',
  } = {},
) =>
  screen(name, 1440, 900, [
    L(
      {
        name: 'Now Playing',
        width: 'fill_container',
        height: 'fill_container',
        gap: 48,
        padding: 48,
        alignItems: 'center',
      },
      [
        BigCover('afterglow', 340),
        L({ name: 'Player', width: 640, layout: 'vertical', gap: 14 }, [
          Tx('Eyebrow', eyebrow),
          Tx('H1', 'Afterglow'),
          Tx('Muted', 'Nova & the Static'),
          live
            ? bubble(144)
            : L({ name: 'No Live Comment', width: 'fill_container', height: 58 }, []),
          R(wave, { width: 640 }),
          times(),
          R('Transport', { width: 'fill_container' }),
          composer,
        ]),
        L(
          {
            name: 'Comment List',
            width: 'fill_container',
            height: 'fill_container',
            layout: 'vertical',
            gap: 8,
          },
          fitStates(list ?? [head(), ...COMMENTS.map((c) => row(c))], true),
        ),
      ],
    ),
  ])
/* mobile: the bubble rises above the waveform; the full list opens in the drawer */
const mobile = (
  name,
  {
    wave = 'Comments/Waveform',
    live = true,
    composer = R('Comments/Composer', { width: 'fill_container' }),
    extra = [],
  } = {},
) =>
  screen(name, 390, 844, [
    R('Mobile/Status Bar', { width: 'fill_container' }),
    MHeader('Now playing', { backIcon: 'chevron-down', actions: ['ellipsis'] }),
    L(
      {
        name: 'Content',
        width: 'fill_container',
        height: 'fill_container',
        layout: 'vertical',
        gap: 14,
        padding: [4, 16, 24, 16],
      },
      [
        L({ name: 'Cover', width: 'fill_container', justifyContent: 'center' }, [
          BigCover('afterglow', 280),
        ]),
        Col({ gap: 2, width: 'fill_container' }, [
          Tx('H3', 'Afterglow'),
          Tx('Muted', 'Nova & the Static'),
        ]),
        live ? bubble(28) : L({ name: 'No Live Comment', width: 'fill_container', height: 54 }, []),
        R(wave, { width: 'fill_container' }),
        times(),
        R('Transport', { width: 'fill_container' }),
        Row({ name: 'Comment Bar', width: 'fill_container', gap: 8 }, [
          composer,
          IconBtn('messages-square', false),
        ]),
        ...extra,
      ],
    ),
  ])
const drawerList = (items) =>
  screen('All comments', 390, 844, [
    R('Mobile/Status Bar', { width: 'fill_container' }),
    L({ name: 'Mini', width: 'fill_container', padding: [8, 16], gap: 12 }, [
      BigCover('afterglow', 48),
      Col({ gap: 0, width: 'fill_container' }, [
        Tx('Body Strong', 'Afterglow'),
        Tx('Caption', '1:48 / 3:42 · playing'),
      ]),
    ]),
    L(
      {
        name: 'Drawer Slot',
        width: 'fill_container',
        height: 'fill_container',
        layout: 'vertical',
        justifyContent: 'end',
      },
      [
        R(
          'Drawer',
          { width: 'fill_container' },
          {
            footer: { enabled: false },
            content: L(
              {
                name: 'Comments',
                layout: 'vertical',
                gap: 6,
                width: 'fill_container',
                padding: [0, 16],
              },
              items,
            ),
          },
        ),
      ],
    ),
  ])
const write = (mobileW) =>
  R('Comments/Composer Active', { width: mobileW ? 'fill_container' : 'fill_container' })
const hidden = () => [
  SettingRow(
    'Show comments while listening',
    'Markers and bubbles stay hidden; the list is still one tap away.',
    Switch('', false),
  ),
]

export const COMMENT_STATES = [
  state(
    'Comments · listening',
    () => desk('Comments listening'),
    () => mobile('Comments listening'),
  ),
  state(
    'Comments · all',
    null,
    () =>
      drawerList([
        head(),
        ...COMMENTS.map((c) => row(c)),
        R('Comments/Composer', { width: 'fill_container' }),
      ]),
    'desktop keeps the list beside the player',
  ),
  state(
    'Comments · writing',
    () => desk('Comments writing', { composer: write(false) }),
    () => mobile('Comments writing', { composer: write(true), live: false }),
  ),
  state(
    'Comments · empty',
    () =>
      desk('Comments empty', {
        wave: 'Comments/Waveform Wide Empty',
        live: false,
        eyebrow: 'NOW PLAYING · NO COMMENTS YET',
        list: [
          head('0'),
          EmptyState(
            'No comments yet',
            'Leave one at a moment you love; it appears there for everyone.',
            null,
            'message-square-plus',
          ),
        ],
      }),
    () =>
      mobile('Comments empty', {
        wave: 'Comments/Waveform Empty',
        live: false,
        composer: R(
          'Comments/Composer',
          { width: 'fill_container' },
          { placeholder: { content: 'Be the first at' } },
        ),
      }),
  ),
  state(
    'Comments · hidden',
    () =>
      desk('Comments hidden', {
        wave: 'Comments/Waveform Wide Empty',
        live: false,
        list: [head(), ...hidden()],
      }),
    () =>
      mobile('Comments hidden', { wave: 'Comments/Waveform Empty', live: false, extra: hidden() }),
  ),
  state(
    'Comments · loading',
    () =>
      desk('Comments loading', {
        wave: 'Comments/Waveform Wide Empty',
        live: false,
        list: [
          head('—'),
          ...Array.from({ length: 6 }, () =>
            R('Comments/Row Skeleton', { width: 'fill_container' }),
          ),
        ],
      }),
    () =>
      drawerList([
        head('—'),
        ...Array.from({ length: 5 }, () => R('Comments/Row Skeleton', { width: 'fill_container' })),
      ]),
  ),
  state(
    'Comments · error',
    () =>
      desk('Comments error', {
        wave: 'Comments/Waveform Wide Empty',
        live: false,
        list: [
          head('—'),
          Alert('Comments could not load', 'Playback is not affected. Try again in a moment.'),
        ],
      }),
    () =>
      drawerList([
        head('—'),
        Alert('Comments could not load', 'Playback is not affected. Try again in a moment.'),
      ]),
  ),
]
