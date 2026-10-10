// Toasts: one family for the app. Desktop stacks bottom-right above the player bar; mobile stacks at the top.
// Sonner-like: collapsed stack shows the newest toast in front and two peeking behind; hover expands it.
import {
  R,
  L,
  Row,
  Col,
  Tx,
  Desktop,
  Mobile,
  MHeader,
  SectionHeader,
  Chips,
  state,
  ART,
} from './ui.mjs'
import { TRACKS, img } from './kit.mjs'

const toast = (kind, title, desc, extra = {}) =>
  R(
    `Toast/${kind}`,
    { width: extra.w ?? 360 },
    { title: { content: title }, desc: { content: desc }, ...(extra.parts ?? {}) },
  )
const media = () =>
  toast('Media', 'Added to queue', 'Night Signal · Mira Sol', {
    parts: { cover: { fill: img(ART.night) } },
  })
const ALL = () => [
  toast('Success', 'Saved to Liked Songs', 'Night Signal · Mira Sol'),
  toast('Error', 'Could not save the playlist', 'Check your connection and try again.'),
  toast('Info', 'Playing on Desktop', 'Playback moved from this phone.'),
  toast('Warning', 'Storage almost full', 'Downloads will pause at 95%.'),
  toast('Undo', 'Removed from Night drive', '1 track removed.'),
  toast('Loading', 'Uploading cover…', 'Night drive · 64%'),
  toast('Offline', 'You are offline', 'Playing from downloads. Changes sync later.'),
  media(),
]
/* collapsed stack: front toast plus two shrinking slivers behind it (flex stand-in for the overlap) */
const stack = (w = 360) =>
  Col({ name: 'Toast Stack', gap: 4, alignItems: 'center', width: w }, [
    toast('Undo', 'Removed from Night drive', '1 track removed.', { w: w - 32 }),
    toast('Success', 'Saved to Liked Songs', 'Night Signal · Mira Sol', { w: w - 16 }),
    media(),
  ])
const home = (m) => [
  SectionHeader('Jump back in'),
  Chips(['All', 'Music', 'Podcasts']),
  ...TRACKS.slice(0, m ? 3 : 4).map((t) =>
    R('Episode Row', {}, { title: { content: t[0] }, meta: { content: `${t[1]} · ${t[3]}` } }),
  ),
]
const corner = (children) => [
  L({ name: 'Spacer', width: 'fill_container', height: 'fill_container' }),
  Row({ name: 'Toast Region', width: 'fill_container', justifyContent: 'end' }, [children]),
]
const D = (name, toasts) => Desktop(name, [...home(false), ...corner(toasts)], { nowPlaying: true })
const M = (name, toasts) =>
  Mobile(name, [toasts, ...home(true)], { header: MHeader('Home', { back: false }) })

export const toasts = {
  title: 'Toasts',
  route: 'system — app-wide toasts (Sonner-style region)',
  context:
    'Feedback that does not block: success, error with Retry, info, warning, Undo, loading with the logo loader, offline and media ("Added to queue"). Bottom-right above the player bar on desktop, top on mobile; newest in front, stack expands on hover, 4 s auto-dismiss (errors stay until closed), swipe to dismiss on touch.',
  desktop: () => D('Toasts', stack()),
  mobile: () => M('Toasts', stack(358)),
  states: [
    state(
      'All variants',
      () =>
        Desktop(
          'All variants',
          [
            Tx('H1', 'Toasts'),
            Row({ name: 'Variants', gap: 24, alignItems: 'start' }, [
              Col({ gap: 12 }, ALL().slice(0, 4)),
              Col({ gap: 12 }, ALL().slice(4)),
            ]),
          ],
          { library: false },
        ),
      () =>
        Mobile(
          'All variants',
          ALL().map((t) => ({ ...t, width: 'fill_container' })),
          { header: MHeader('Toasts') },
        ),
    ),
    state(
      'Expanded stack',
      () =>
        D(
          'Expanded stack',
          Col({ name: 'Toast Stack', gap: 10 }, [
            media(),
            toast('Success', 'Saved to Liked Songs', 'Night Signal · Mira Sol'),
            toast('Undo', 'Removed from Night drive', '1 track removed.'),
          ]),
        ),
      () =>
        M(
          'Expanded stack',
          Col({ name: 'Toast Stack', gap: 8, width: 'fill_container' }, [
            media(),
            toast('Success', 'Saved to Liked Songs', 'Night Signal · Mira Sol', {
              w: 'fill_container',
            }),
          ]),
        ),
    ),
    state(
      'Error with retry',
      () =>
        D(
          'Error',
          toast('Error', 'Could not save the playlist', 'Check your connection and try again.'),
        ),
      () =>
        M(
          'Error',
          toast('Error', 'Could not save the playlist', 'Check your connection and try again.', {
            w: 'fill_container',
          }),
        ),
    ),
    state(
      'Loading to success',
      () =>
        D(
          'Loading',
          Col({ gap: 10 }, [
            toast('Loading', 'Uploading cover…', 'Night drive · 64%'),
            toast('Success', 'Cover updated', 'Night drive'),
          ]),
        ),
      () =>
        M(
          'Loading',
          Col({ gap: 8, width: 'fill_container' }, [
            toast('Loading', 'Uploading cover…', 'Night drive · 64%', { w: 'fill_container' }),
            toast('Success', 'Cover updated', 'Night drive', { w: 'fill_container' }),
          ]),
        ),
    ),
    state(
      'Undo',
      () => D('Undo', toast('Undo', 'Removed from Night drive', '1 track removed.')),
      () =>
        M(
          'Undo',
          toast('Undo', 'Removed from Night drive', '1 track removed.', { w: 'fill_container' }),
        ),
    ),
    state(
      'Offline',
      () =>
        D(
          'Offline',
          toast('Offline', 'You are offline', 'Playing from downloads. Changes sync later.'),
        ),
      () =>
        M(
          'Offline',
          toast('Offline', 'You are offline', 'Playing from downloads. Changes sync later.', {
            w: 'fill_container',
          }),
        ),
    ),
  ],
}
