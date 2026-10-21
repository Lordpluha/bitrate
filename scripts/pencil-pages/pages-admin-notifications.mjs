// Admin console — Notification settings (Settings → Notifications), after the admin prototype: channels,
// the event × channel matrix (cards on phones), a live preview, delivery, thresholds and escalation.
import { A, Btn, MShell, Pill, Seg, Shell, Tx } from './admin-ui.mjs'
import { L, Row, state } from './ui.mjs'

const W = { width: 'fill_container' }
const CH = [
  ['inapp', 'bell', 'In-app', 'Bell and island in the admin console'],
  ['email', 'mail', 'Email', 'mara.ops@bitrate.fm'],
  ['push', 'smartphone', 'Push', 'This browser and the mobile app'],
  ['slack', 'hash', 'Slack', '#mod-alerts'],
]
const EVENTS = [
  [
    'MODERATION',
    [
      ['report.new', 'New report filed', 'Every report entering the queue', 'Normal', [1, 0, 0, 0]],
      [
        'report.escalated',
        'Report escalated',
        'A moderator asked for a second opinion',
        'High',
        [1, 1, 0, 0],
      ],
      ['report.sla', 'SLA breach', 'A report waits longer than the SLA', 'Critical', [1, 1, 1, 1]],
    ],
  ],
  [
    'RELEASES',
    [
      [
        'release.submitted',
        'Release submitted for review',
        'An artist sent a release to review',
        'Normal',
        [1, 1, 0, 0],
      ],
      [
        'release.resubmitted',
        'Changes resubmitted',
        'A release came back after requested changes',
        'Normal',
        [1, 0, 0, 0],
      ],
    ],
  ],
  [
    'CATALOG',
    [
      [
        'track.failed',
        'Track processing failed',
        'An upload could not be processed',
        'High',
        [1, 1, 0, 0],
      ],
      [
        'pipeline.stuck',
        'Pipeline stuck',
        'Tracks wait in processing too long',
        'Critical',
        [1, 1, 1, 1],
      ],
    ],
  ],
  [
    'ACCOUNTS',
    [
      [
        'artist.verify',
        'Artist verification request',
        'An artist asked for the verified badge',
        'Normal',
        [1, 0, 0, 0],
      ],
      [
        'signup.spike',
        'Unusual sign-up spike',
        'Sign-ups exceed the usual rate',
        'High',
        [1, 1, 0, 0],
      ],
    ],
  ],
  [
    'SECURITY',
    [
      [
        'staff.login',
        'New staff sign-in',
        'A staff account signed in from a new device',
        'High',
        [1, 1, 0, 0],
      ],
      [
        'role.changed',
        'Role or permissions changed',
        'Someone changed staff access',
        'Critical',
        [1, 1, 1, 1],
      ],
      [
        'signin.failed',
        'Repeated failed sign-ins',
        'Several failed attempts on a staff account',
        'Critical',
        [1, 1, 1, 1],
      ],
    ],
  ],
]
const PRIO = { Critical: 'Down', High: 'Warn', Normal: 'Flat' }
const prio = (p) =>
  A(`Pill/${PRIO[p]}`, { name: 'Priority' }, { label: { content: p }, icon: { enabled: false } })
/* Slack is off by default; push is unavailable when the browser blocks it */
const chOn = (k, o) => !(k === 3 && !o.slack) && !(k === 2 && o.blocked)

const Tile = (title, meta, icon, nodes, { accent, w = 'fill_container' } = {}) =>
  A(
    accent ? 'Admin/Tile Accent' : 'Admin/Tile',
    { name: `Tile / ${title}`, width: w },
    {
      icon: { icon },
      title: { content: title },
      meta: { content: meta },
      actions: { enabled: false },
      content: L(
        { name: 'Tile Content', layout: 'vertical', gap: 0, width: 'fill_container' },
        nodes.flat().filter(Boolean),
      ),
    },
  )
const channels = (o) =>
  CH.map(([key, icon, name, detail], k) => {
    const blocked = key === 'push' && o.blocked
    const on = key === 'slack' ? o.slack : !blocked
    return A(
      on ? 'Admin/Channel Row/On' : 'Admin/Channel Row/Off',
      { name: `Channel / ${name}` },
      {
        icon: { icon },
        name: { content: name },
        detail: { content: detail },
        status: blocked
          ? A(
              'Pill/Down',
              { name: 'Status' },
              { label: { content: 'Blocked' }, icon: { enabled: false } },
            )
          : A(
              on ? 'Pill/Up' : 'Pill/Flat',
              { name: 'Status' },
              {
                label: { content: on ? (k === 1 ? 'Verified' : 'Connected') : 'Off' },
                icon: { enabled: false },
              },
            ),
        toggle: A(on ? 'Switch/On' : 'Switch/Off', {
          name: 'Toggle',
          ...(blocked ? { opacity: 0.4 } : {}),
        }),
      },
    )
  })
const preview = (o) => [
  A('Admin/Preview/Push', W, {
    title: { content: 'SLA breach' },
    body: { content: '3 reports have waited over 6 h' },
  }),
  L({ name: 'Gap', width: 'fill_container', height: 10 }),
  A('Admin/Preview/Mail', W, {
    subject: { content: '[Critical] SLA breach' },
    body: { content: '3 reports have waited over 6 h.' },
  }),
  L({ name: 'Gap', width: 'fill_container', height: 12 }),
  A('Admin/Route', W, {
    label: { content: 'Delivered to' },
    chips: L(
      { name: 'Chips', gap: 6 },
      CH.filter((_, k) => chOn(k, o)).map(([, , name]) => Pill('Up', name)),
    ),
  }),
]
const matrix = (o) => [
  A(
    'Admin/Matrix/Head',
    W,
    Object.fromEntries(
      [0, 1, 2, 3].filter((k) => !chOn(k, o)).map((k) => [`h${k}`, { opacity: 0.4 }]),
    ),
  ),
  ...EVENTS.flatMap(([group, list]) => [
    A('Admin/Matrix/Group', W, { label: { content: group } }),
    ...list.map(([id, title, desc, p, on]) =>
      A(
        id === 'report.sla' ? 'Admin/Matrix/Row Selected' : 'Admin/Matrix/Row',
        { name: `Event / ${title}`, width: 'fill_container' },
        {
          title: { content: title },
          desc: { content: desc },
          prio: prio(p),
          ...Object.fromEntries(
            on.map((v, k) => [
              `c${k}`,
              A(v && chOn(k, o) ? 'Checkbox/On' : 'Checkbox/Off', {
                name: `Channel ${k}`,
                ...(chOn(k, o) ? {} : { opacity: 0.35 }),
              }),
            ]),
          ),
        },
      ),
    ),
  ]),
]
const eventCards = (o) =>
  EVENTS.flatMap(([group, list]) => [
    Tx('Eyebrow', group, { name: 'Group' }),
    ...list.map(([id, title, , p, on]) =>
      A(
        id === 'report.sla' ? 'Admin/Event Card Selected' : 'Admin/Event Card',
        { name: `Event / ${title}`, width: 'fill_container' },
        {
          title: { content: title },
          prio: prio(p),
          ...Object.fromEntries(
            CH.map(([, icon, name], k) => [
              `ch${k}`,
              A(
                on[k] && chOn(k, o) ? 'Admin/Channel Chip/On' : 'Admin/Channel Chip/Off',
                { name, ...(chOn(k, o) ? {} : { opacity: 0.4 }) },
                { icon: { icon }, label: { content: name } },
              ),
            ]),
          ),
        },
      ),
    ),
  ])
const time = (v) => A('Admin/Time Input', { name: `Time / ${v}` }, { value: { content: v } })
const delivery = (o) => [
  A('Admin/Field Stack', W, {
    label: { content: 'Digest' },
    control: L({ name: 'Control', gap: 8 }, [
      Seg(['Instant', 'Hourly', 'Daily', 'Weekly'], o.daily ? 'Daily' : 'Instant'),
    ]),
  }),
  o.daily
    ? A('Admin/Field', W, {
        label: { content: 'Send at' },
        desc: { content: 'Your time zone · Europe/Kyiv' },
        control: L({ name: 'Control', gap: 8 }, [time('09:00')]),
      })
    : null,
  A('Admin/Field', W, {
    label: { content: 'Quiet hours' },
    desc: { content: 'Pause non-critical alerts overnight' },
  }),
  A('Admin/Field', W, {
    label: { content: 'From' },
    desc: { enabled: false },
    control: L({ name: 'Control', gap: 8, alignItems: 'center' }, [
      time('22:00'),
      Tx('Muted', 'to'),
      time('07:00'),
    ]),
  }),
  A('Admin/Field', W, {
    label: { content: 'Critical alerts bypass quiet hours' },
    desc: { enabled: false },
  }),
]
const slider = (label, value, pct, w) =>
  A(
    'Admin/Slider',
    { name: `Slider / ${label}`, width: 'fill_container' },
    { label: { content: label }, value: { content: value }, fill: { width: Math.round(pct * w) } },
  )
const thresholds = (m) => {
  const w = m ? 290 : 300
  return [
    slider('SLA breach after', '6 h', 0.22, w),
    slider('Failed tracks per hour', '5', 0.08, w),
    slider('Sign-up spike at', '3×', 0.17, w),
  ]
}
const role = (r, on) =>
  A(
    on ? 'Admin/Role Chip/On' : 'Admin/Role Chip/Off',
    { name: `Role / ${r}` },
    { label: { content: r } },
  )
const escalation = () => [
  A('Admin/Field Stack', W, {
    label: { content: 'Escalate after' },
    control: L({ name: 'Control', gap: 8 }, [Seg(['5m', '15m', '30m', '1h'], '15m')]),
  }),
  A('Admin/Field Stack', W, {
    label: { content: 'to' },
    control: L({ name: 'Roles', layout: 'vertical', gap: 6 }, [
      Row({ name: 'Roles 1', gap: 6 }, [role('Super admin', true), role('Moderator', false)]),
      Row({ name: 'Roles 2', gap: 6 }, [role('Operations', false), role('On-call', true)]),
    ]),
  }),
]
const header = (m, o) =>
  A(m ? 'Admin/Page Header Compact' : 'Admin/Page Header', W, {
    eyebrow: { content: 'SETTINGS · NOTIFICATIONS' },
    title: { content: 'Notifications', width: 'fill_container', textGrowth: 'fixed-width' },
    accent: { enabled: false },
    subtitle: { content: 'Choose what reaches you, where and when. Changes save automatically.' },
    ...(m
      ? {}
      : {
          actions: L({ name: 'Actions', gap: 10, alignItems: 'center' }, [
            A(o.saving ? 'Admin/Save State/Saving' : 'Admin/Save State/Saved', {
              name: 'Save state',
            }),
            Btn('Default', 'Send test', 'send'),
          ]),
        }),
  })
const mActions = (o) =>
  Row({ name: 'Actions', width: 'fill_container', gap: 8 }, [
    A(o.saving ? 'Admin/Save State/Saving' : 'Admin/Save State/Saved', { name: 'Save state' }),
    L({ name: 'Spacer', width: 'fill_container', height: 1 }),
    Btn('Default', 'Send test', 'send'),
  ])
const banner = () =>
  A('Admin/Banner', W, {
    icon: { icon: 'bell-off' },
    title: { content: 'Browser notifications are blocked' },
    desc: { content: 'Allow notifications for this site in the browser settings, then try again.' },
  })
const toast = (m) =>
  Row({ name: 'Toast Row', width: 'fill_container', justifyContent: 'end' }, [
    A(
      'Admin/Preview/Push',
      { name: 'Toast', width: m ? 'fill_container' : 360 },
      { title: { content: 'SLA breach' }, body: { content: '3 reports have waited over 6 h' } },
    ),
  ])
function page(m, o = {}) {
  if (o.loading) {
    const ld = (w) => A('Admin/Loader/Form', { name: 'Loader', width: w, ...(m ? {} : {}) })
    return [
      header(m, o),
      m ? mActions(o) : null,
      ...(m
        ? [ld('fill_container'), ld('fill_container'), ld('fill_container')]
        : [
            Row({ name: 'Row 1', ...W, gap: 16, alignItems: 'start' }, [
              ld('fill_container'),
              ld('fill_container'),
            ]),
            ld('fill_container'),
            Row({ name: 'Row 3', ...W, gap: 16, alignItems: 'start' }, [
              ld('fill_container'),
              ld('fill_container'),
              ld('fill_container'),
            ]),
          ]),
    ].filter(Boolean)
  }
  if (o.error)
    return [
      header(m, o),
      A(
        'Admin/Tile',
        { name: 'Tile / Notifications', width: 'fill_container', height: m ? 420 : 520 },
        {
          icon: { icon: 'triangle-alert' },
          title: { content: 'Notification settings' },
          meta: { content: 'Couldn’t load' },
          actions: { enabled: false },
          content: L(
            {
              name: 'Tile Content',
              layout: 'vertical',
              width: 'fill_container',
              height: 'fill_container',
            },
            [
              A(
                'Admin/Tile Message/Error',
                { name: 'Error', width: 'fill_container', height: 'fill_container' },
                {
                  title: { content: 'Couldn’t load your notification settings' },
                  desc: { content: 'Nothing was changed. Try again in a moment.' },
                  'action.label': { content: 'Try again' },
                },
              ),
            ],
          ),
        },
      ),
    ]
  const tChannels = Tile('Channels', 'Where alerts can reach you', 'bell', channels(o))
  const tPreview = Tile('Preview', 'How the selected event arrives', 'eye', preview(o), {
    accent: true,
  })
  const tEvents = Tile(
    'Events',
    m
      ? 'Tap a channel to switch it for an event.'
      : 'Pick channels per event. Click an event to preview it.',
    'list-checks',
    m
      ? [L({ name: 'Cards', layout: 'vertical', gap: 8, width: 'fill_container' }, eventCards(o))]
      : matrix(o),
  )
  const tDelivery = Tile('Delivery', 'Digest and quiet hours', 'clock', delivery(o))
  const tThresholds = Tile('Thresholds', 'When an alert fires', 'sliders-horizontal', thresholds(m))
  const tEscalation = Tile(
    'Escalation',
    'Unacknowledged critical alerts',
    'shield-alert',
    escalation(),
  )
  return [
    o.test ? toast(m) : null,
    header(m, o),
    m ? mActions(o) : null,
    o.blocked ? banner() : null,
    ...(m
      ? [tChannels, tPreview, tEvents, tDelivery, tThresholds, tEscalation]
      : [
          Row({ name: 'Row 1', ...W, gap: 16, alignItems: 'start' }, [tChannels, tPreview]),
          tEvents,
          Row({ name: 'Row 3', ...W, gap: 16, alignItems: 'start' }, [
            tDelivery,
            tThresholds,
            tEscalation,
          ]),
        ]),
  ].filter(Boolean)
}
const PAGE = { page: 'notifications' }
const D =
  (label, o, opts = {}) =>
  () =>
    Shell(label, page(false, o), { ...PAGE, height: 1860, ...opts })
const M =
  (label, o, h, opts = {}) =>
  () =>
    MShell(label, page(true, o), h, { ...PAGE, ...opts })

export const notificationsPage = {
  title: 'Admin / Notifications',
  route: '/settings/notifications (staff session; personal settings)',
  context:
    'Notification settings for each operator, after the admin prototype: channels with their status, an event × channel matrix with priorities (event cards with channel chips on phones), a live preview of the push and the email for the selected event, digest and quiet hours, thresholds and escalation. Changes save automatically; the island reports Saved and Test sent. Not-found is not drawn: the route always exists for a signed-in operator.',
  desktop: (theme) => Shell('Notifications', page(false), { ...PAGE, height: 1860, theme }),
  mobile: () => MShell('Notifications', page(true), 3880, PAGE),
  states: [
    state(
      'Loading',
      D('Loading', { loading: true }, { height: 1100 }),
      M('Loading', { loading: true }, 1270),
    ),
    state(
      'Load error',
      D('Load error', { error: true }, { height: 1100 }),
      M('Load error', { error: true }, 900),
    ),
    state(
      'Push blocked',
      D('Push blocked', { blocked: true }, { height: 1950 }),
      M('Push blocked', { blocked: true }, 4010),
    ),
    state(
      'Test sent',
      D('Test sent', { test: true }, { height: 1960, pocket: { icon: 'send', text: 'Test sent' } }),
      M('Test sent', { test: true }, 3965),
    ),
    state(
      'Daily digest · saving',
      D(
        'Daily digest · saving',
        { daily: true, saving: true },
        { height: 1915, pocket: { icon: 'loader', text: 'Saving…' } },
      ),
      M('Daily digest · saving', { daily: true, saving: true }, 3925),
    ),
    state(
      'Saved',
      D('Saved', {}, { pocket: { icon: 'check', text: 'Saved', tone: 'success' } }),
      null,
      'the phone shows the same Saved pill under the header; the island is a desktop element',
    ),
  ],
}
