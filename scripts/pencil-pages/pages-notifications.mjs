// Notification mode: one switch with three exclusive modes. Off — nothing appears anywhere (no pop-ups, no
// system notifications, no badge, an empty inbox). In the app — toasts only while Bitrate is open. Always —
// only system notifications from the OS, whether Bitrate is open or closed, never duplicated inside the app.
import { Alert } from './kit.mjs'
import {
  R,
  L,
  Row,
  Col,
  Tx,
  Panel,
  Desktop,
  Mobile,
  MHeader,
  Blank,
  Skeleton,
  EmptyState,
  Button,
  state,
} from './ui.mjs'

const MODES = {
  off: ['bell-off', 'Off', 'Nothing reaches you: no pop-ups, no system notifications, no badges.'],
  app: [
    'app-window',
    'In the app',
    'Pop-ups appear only while Bitrate is open. Nothing on your lock screen or desktop.',
  ],
  always: [
    'bell-ring',
    'Always',
    'As system notifications on your phone or computer, even when Bitrate is closed. No pop-ups inside the app.',
  ],
}
/** One mode card; `tag` labels it (Default, Allowed, Needs permission, Blocked by the system). */
const Mode = (k, { selected, blocked, tag } = {}) => {
  const [icon, title, desc] = MODES[k]
  return R(
    blocked
      ? 'Notifications/Mode Blocked'
      : selected
        ? 'Notifications/Mode Selected'
        : 'Notifications/Mode',
    { width: 'fill_container' },
    {
      icon: { icon },
      title: { content: title },
      desc: { content: desc },
      tag: tag ? undefined : { enabled: false },
      tagText: tag ? { content: tag } : undefined,
    },
  )
}
/** The switch: three exclusive cards, one selected. */
export const Switch = (sel, { always = 'Needs permission', blocked = false } = {}) =>
  Col({ name: 'Notification Mode', gap: 10, width: 'fill_container' }, [
    Mode('off', { selected: sel === 'off' }),
    Mode('app', { selected: sel === 'app', tag: 'Default' }),
    Mode('always', {
      selected: sel === 'always',
      blocked,
      tag: blocked ? 'Blocked by the system' : always,
    }),
  ])
const head = () => [
  Tx('H4', 'Notifications'),
  Tx('Muted', 'Choose how Bitrate reaches you. One mode is active at a time.', { wrap: true }),
]
/** What the chosen mode looks like, shown next to (desktop) or under (mobile) the switch. */
const preview = (mode) =>
  Panel(
    [
      Tx('Eyebrow', 'WHAT YOU WILL SEE'),
      mode === 'off'
        ? Col({ name: 'Nothing', gap: 6, width: 'fill_container' }, [
            Tx('Body Strong', 'Nothing at all'),
            Tx(
              'Muted',
              'Releases, Jam invites and Bitrate Connect handoffs stay silent, and the bell has no badge. You can switch back here anytime.',
              { wrap: true },
            ),
          ])
        : mode === 'app'
          ? Col({ name: 'Toast', gap: 8, width: 'fill_container' }, [
              R(
                'Toast/Media',
                { width: 'fill_container' },
                {
                  title: { content: 'New from Mira Sol' },
                  desc: { content: 'Night Signal · single' },
                  action: { enabled: false },
                },
              ),
              Tx('Caption', 'Shown while you use Bitrate, then saved to your inbox.', {
                wrap: true,
              }),
            ])
          : Col({ name: 'System', gap: 8, width: 'fill_container' }, [
              R('Notifications/System Banner', { width: 'fill_container' }),
              Tx('Caption', 'Delivered by your system, even when Bitrate is closed.', {
                wrap: true,
              }),
            ]),
    ],
    { width: 'fill_container', gap: 12 },
  )

/** Settings › Notifications: the switch with its preview; `extra` adds alerts or dialogs to the flow. */
const settings = (mobile, mode, { switchOpts, extra = [], aside, previewOff = false } = {}) => {
  const sw = Panel(
    [...head(), Switch(mode, switchOpts), ...extra, ...(mobile && aside ? [aside] : [])],
    { width: 'fill_container', gap: 12 },
  )
  return mobile
    ? Mobile('Notifications', [sw, !previewOff && preview(mode)].filter(Boolean), {
        header: MHeader('Notifications'),
        mini: false,
        tab: 'home',
      })
    : Desktop('Notifications', [
        Tx('H1', 'Settings'),
        Row(
          { name: 'Notification Settings', width: 'fill_container', gap: 24, alignItems: 'start' },
          [
            Col({ name: 'Switch Column', width: 520, gap: 16 }, [sw]),
            Col(
              { name: 'Preview Column', width: 'fill_container', gap: 16 },
              [aside ?? (previewOff ? null : preview(mode))].filter(Boolean),
            ),
          ],
        ),
      ])
}
const blockedAlert = () => [
  R(
    'Alert/Warning',
    { width: 'fill_container' },
    {
      text: {
        content:
          'System notifications are blocked for Bitrate. Allow them in your browser or system settings to use “Always”. You stay on “In the app” until then.',
      },
    },
  ),
  Row({ gap: 8 }, [Button('How to allow', 'outline', { icon: 'external-link' })]),
]
const savingError = () => [
  Alert(
    'Could not change the mode',
    'You are still on “In the app”. Check your connection and try again.',
  ),
]
/** The OS-level surfaces: a phone lock screen and a desktop corner, with Bitrate closed. */
const lockScreen = () =>
  Blank('Lock screen', 390, 844, [
    Col({ name: 'Clock', gap: 0, alignItems: 'center' }, [
      Tx('Muted', 'Saturday 11 October'),
      Tx('Display', '21:40'),
    ]),
    Col({ name: 'Banners', gap: 10, width: 'fill_container' }, [
      R('Notifications/System Banner', { width: 'fill_container' }),
      R(
        'Notifications/System Banner',
        { width: 'fill_container' },
        {
          title: { content: 'Jonah invited you to a Jam' },
          desc: { content: 'Listening to Luma Vale · tap to join' },
          time: { content: '2 min ago' },
          cover: {
            fill: {
              type: 'image',
              url: '../design-system/assets/avatars/avatar2.jpg',
              mode: 'cover',
            },
          },
        },
      ),
    ]),
  ])
const desktopCorner = () =>
  Blank('Desktop', 1440, 900, [
    L(
      {
        name: 'Corner',
        width: 'fill_container',
        height: 'fill_container',
        layout: 'vertical',
        alignItems: 'end',
        gap: 10,
      },
      [
        R('Notifications/System Banner'),
        R(
          'Notifications/System Banner',
          {},
          {
            title: { content: 'Bitrate Connect · Desktop' },
            desc: { content: 'Playback moved to this computer' },
            cover: { enabled: false },
          },
        ),
      ],
    ),
  ])
/** In the app: the toast appears in the app's own toast region while you use it. */
const inApp = (mobile) =>
  mobile
    ? Mobile('In the app', [
        R(
          'Toast/Media',
          { width: 'fill_container' },
          {
            title: { content: 'New from Mira Sol' },
            desc: { content: 'Night Signal · single' },
            action: { enabled: false },
          },
        ),
        Tx('H2', 'Good to see you'),
        Skeleton('grid', true),
      ])
    : Desktop('In the app', [
        Tx('H1', 'Home'),
        Skeleton('grid'),
        L({ name: 'Toast Region', width: 'fill_container', justifyContent: 'end' }, [
          R(
            'Toast/Media',
            { width: 360 },
            {
              title: { content: 'New from Mira Sol' },
              desc: { content: 'Night Signal · single' },
              action: { enabled: false },
            },
          ),
        ]),
      ])
const inboxOff = (mobile) => {
  const empty = EmptyState(
    'Notifications are off',
    'You chose not to receive any. Turn them on in Settings whenever you like.',
    'Notification settings',
    'bell-off',
  )
  return mobile
    ? Mobile('Inbox off', [empty], { header: MHeader('Notifications') })
    : Desktop('Inbox off', [Tx('H1', 'Notifications'), empty])
}

export const notificationSettings = {
  title: 'Notification mode',
  route: 'concept — /main/preferences#notifications',
  context:
    'One switch, three exclusive modes: Off (nothing anywhere, no badge, inbox empty), In the app (toasts only while Bitrate is open; default), Always (system notifications only, open or closed, no in-app duplicates). Choosing Always explains it first, then asks the system for permission; if the system blocks it, the previous mode stays.',
  desktop: () => settings(false, 'app'),
  mobile: () => settings(true, 'app'),
  states: [
    state(
      'Off',
      () => settings(false, 'off'),
      () => settings(true, 'off'),
    ),
    state(
      'Always · explain',
      () =>
        settings(false, 'app', {
          aside: R('Notifications/Explainer', { width: 'fill_container' }),
        }),
      () =>
        Mobile('Always', [R('Notifications/Explainer', { width: 'fill_container' })], {
          header: MHeader('Always'),
          mini: false,
        }),
    ),
    state(
      'Always · system asks',
      () => settings(false, 'app', { aside: R('Notifications/Permission Prompt') }),
      () =>
        settings(true, 'app', {
          aside: R('Notifications/Permission Prompt', { width: 'fill_container' }),
          previewOff: true,
        }),
    ),
    state(
      'Always on',
      () => settings(false, 'always', { switchOpts: { always: 'Allowed' } }),
      () => settings(true, 'always', { switchOpts: { always: 'Allowed' } }),
    ),
    state(
      'Always · blocked',
      () => settings(false, 'app', { switchOpts: { blocked: true }, extra: blockedAlert() }),
      () => settings(true, 'app', { switchOpts: { blocked: true }, extra: blockedAlert() }),
    ),
    state('Always · app closed', desktopCorner, lockScreen),
    state(
      'In the app · while using',
      () => inApp(false),
      () => inApp(true),
    ),
    state(
      'Off · inbox',
      () => inboxOff(false),
      () => inboxOff(true),
    ),
    state(
      'Loading',
      () => Desktop('Loading', [Tx('H1', 'Settings'), Skeleton('settings')]),
      () =>
        Mobile('Loading', [Skeleton('settings', true)], {
          header: MHeader('Notifications'),
          mini: false,
        }),
    ),
    state(
      'Saving failed',
      () => settings(false, 'app', { extra: savingError() }),
      () => settings(true, 'app', { extra: savingError() }),
    ),
  ],
}
