// Admin console (apps/admin) — Overview as a bento of independent tiles. Library instances only.
import { id, C } from './kit.mjs'
import {
  R,
  L,
  Row,
  Col,
  Tx,
  Button,
  Chips,
  IconBtn,
  Divider,
  ErrorState,
  fitStates,
  state,
} from './ui.mjs'

/* ---------- shell ---------- */
const frame = (name, w, h, child) => ({
  type: 'frame',
  id: id(),
  name,
  width: w,
  height: h,
  clip: true,
  layout: 'vertical',
  fill: C.background,
  children: [child],
})
const ROLE = { 'Super admin': 'mara.ops', Moderator: 'leo.mod' }
/** Desktop admin page: sidebar (Overview active), header with the operator, content slot. */
const Shell = (name, content, { height = 1200, role = 'Super admin', hide = [] } = {}) =>
  frame(
    name,
    1440,
    height,
    R(
      'Admin Shell/Desktop',
      { width: 1440, height },
      {
        nav_overview: R(
          'Admin/Nav Item Active',
          { name: 'Nav / Overview' },
          {
            icon: { icon: 'layout-dashboard' },
            label: { content: 'Overview' },
            count: { enabled: false },
          },
        ),
        ...Object.fromEntries(hide.map((k) => [k, { enabled: false }])),
        breadcrumb: { content: 'Admin / Overview' },
        operator: { content: ROLE[role] },
        role: { content: role },
        content: L(
          {
            name: 'Content',
            layout: 'vertical',
            gap: 20,
            padding: [28, 32],
            clip: true,
            width: 'fill_container',
            height: 'fill_container',
          },
          fitStates(content, false),
        ),
      },
    ),
  )
const MShell = (name, content, height = 2600) =>
  frame(
    name,
    390,
    height,
    R(
      'Admin Shell/Mobile',
      { width: 390, height },
      {
        content: L(
          {
            name: 'Content',
            layout: 'vertical',
            gap: 16,
            padding: [20, 16],
            clip: true,
            width: 'fill_container',
            height: 'fill_container',
          },
          fitStates(content, true),
        ),
      },
    ),
  )

/* ---------- tiles ---------- */
const FILL = { width: 'fill_container', height: 'fill_container' }
/** A bento tile: `kind` is '', 'Accent' or 'Editing'; `actions` replaces the ⋯ button. */
const Tile = (title, meta, icon, content, { kind = '', actions, size, o = {} } = {}) =>
  R(
    `Bento/Tile${kind ? ` ${kind}` : ''}`,
    { name: `Tile / ${title}`, ...FILL, ...o },
    {
      icon: kind === 'Editing' ? undefined : { icon },
      title: { content: title },
      meta: { content: meta },
      actions: actions ? L({ name: 'Actions', gap: 6, alignItems: 'center' }, actions) : undefined,
      size: size ? { content: size } : undefined,
      content: L({ name: 'Tile Content', layout: 'vertical', gap: 14, ...FILL }, content.flat()),
    },
  )
const SPARK = {
  listeners: [14, 15, 17, 16, 19, 20, 22, 21, 24, 26, 27, 30],
  artists: [18, 18, 19, 20, 19, 21, 22, 22, 23, 23, 24, 25],
  zero: Array(12).fill(2),
}
const Kpi = ({ tone = 'Positive', icon, label, value, delta, sub, spark = 'listeners', o = {} }) =>
  R(
    `Bento/KPI/${tone}`,
    { name: `KPI / ${label}`, ...FILL, ...o },
    {
      icon: { icon },
      label: { content: label },
      value: { content: value },
      delta: { content: delta },
      sub: { content: sub },
      ...Object.fromEntries(SPARK[spark].map((h, i) => [`b${i}`, { height: h }])),
    },
  )
const Action = (tone, title, meta, count) =>
  R(
    `Bento/Action Row/${tone}`,
    { name: `Action / ${title}` },
    { title: { content: title }, meta: { content: meta }, count: { content: count } },
  )
const Report = (type, title, meta) =>
  R(
    'Activity Item',
    { name: `Report / ${title}` },
    { text: { content: `${type} · ${title}` }, meta: { content: meta } },
  )
const Bars = (values, labels, highlight = values.length - 1, max = 150) =>
  Row(
    {
      name: 'Bar Chart',
      width: 'fill_container',
      gap: 8,
      alignItems: 'end',
      height: 'fill_container',
    },
    values.map((v, i) =>
      R(
        i === highlight ? 'Bar Chart/Bar Highlight' : 'Bar Chart/Bar',
        { name: `Bar / ${labels[i]}` },
        {
          bar: { height: Math.max(4, Math.round(v * max)) },
          label: { content: labels[i] },
        },
      ),
    ),
  )
const Meter = (i, label, value, width) =>
  R(
    `Bento/Meter Row/${i}`,
    { name: `Meter / ${label}` },
    { label: { content: label }, value: { content: value }, bar: { width } },
  )
const Legend = (tone, label, value) =>
  R(
    `Bento/Legend Row/${tone}`,
    { name: `Legend / ${label}` },
    { label: { content: label }, value: { content: value } },
  )
const Kv = (key, value) =>
  R(
    'Key Value Row',
    { name: `KV / ${key}` },
    { key: { content: key }, value: L({ name: 'Value', gap: 8 }, [Tx('Body Strong', value)]) },
  )
const Audit = (text, meta) =>
  R(
    'Activity Item',
    { name: `Audit / ${text.slice(0, 24)}` },
    { text: { content: text }, meta: { content: meta } },
  )
const Message = (kind, title, desc, icon) =>
  R(
    `Bento/Tile Message/${kind}`,
    { name: `Message / ${kind}`, ...FILL },
    {
      title: title ? { content: title } : undefined,
      desc: desc ? { content: desc } : undefined,
      icon: icon ? { icon } : undefined,
    },
  )
const Skel = (o = {}) => R('Bento/Tile Skeleton', { ...FILL, ...o })
const Link = (t) => Tx('Link', t)

/* ---------- data per range ---------- */
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const RANGE = {
  '7d': {
    idx: 0,
    listens: {
      total: '1.84M listens',
      delta: '+12% vs previous 7 days',
      v: [0.62, 0.58, 0.66, 0.71, 0.84, 0.97, 0.9],
      l: DAYS,
      hi: 5,
    },
    accounts: { v: [0.5, 0.42, 0.61, 0.55, 0.7, 0.9, 0.78], l: DAYS.map((d) => d[0]) },
    kv: [
      ['New accounts', '1,128'],
      ['Uploads', '2,940'],
      ['Deactivated', '14'],
    ],
    meta: 'Last 7 days',
  },
  '30d': {
    idx: 1,
    listens: {
      total: '7.42M listens',
      delta: '+9% vs previous 30 days',
      v: [0.55, 0.6, 0.58, 0.67, 0.72, 0.7, 0.81, 0.86, 0.79, 0.92],
      l: ['21', '24', '27', '30', '3', '6', '9', '12', '15', '18'],
      hi: 9,
    },
    accounts: { v: [0.6, 0.52, 0.7, 0.66, 0.74, 0.88], l: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'] },
    kv: [
      ['New accounts', '4,812'],
      ['Uploads', '11,306'],
      ['Deactivated', '61'],
    ],
    meta: 'Last 30 days',
  },
}

/* ---------- tiles of the Overview ---------- */
const needsAction = ({ clear = false, locked = false } = {}) =>
  Tile(
    'Needs action',
    clear ? 'Queues are empty' : '27 items across three queues · oldest 2 days',
    'inbox',
    clear
      ? [
          Message(
            'Empty',
            'All clear',
            'No reports, releases or failed tracks are waiting. New items appear here first.',
          ),
        ]
      : [
          Action('Warning', 'Reports to review', '12 open · 4 in review · oldest 6 h', '16'),
          locked
            ? R(
                'Bento/Tile Message/Locked',
                { name: 'Locked / Releases', width: 'fill_container' },
                {
                  title: { content: 'Release review is not in your role' },
                  desc: { content: 'Needs releases:read. Ask a super admin for access.' },
                },
              )
            : Action('Info', 'Releases awaiting review', 'Oldest submitted 2 days ago', '7'),
          locked
            ? null
            : Action('Error', 'Tracks failed processing', '3 failed · 1 stuck for 42 min', '4'),
          Divider(),
          Tx('Eyebrow', 'LATEST REPORTS'),
          Report('Track', 'Copyright claim · Glass Horizon', 'Nova & the Static · 12 min ago'),
          Report('User', 'Spam in playlist titles · @driftwave', 'Listener · 38 min ago'),
          Report('Episode', 'Hate speech · Late Signal Radio #41', 'Lumen Choir · 1 h ago'),
        ].filter(Boolean),
    {
      kind: 'Accent',
      actions: [Button('Open moderation', 'default', { icon: 'arrow-right' })],
    },
  )
const kpis = (empty) => [
  Kpi({
    icon: 'users-round',
    label: 'Listeners',
    value: empty ? '0' : '48,920',
    delta: empty ? '—' : '+3.2%',
    sub: empty ? 'No sign-ups yet' : '412 new this week',
    tone: empty ? 'Neutral' : 'Positive',
    spark: empty ? 'zero' : 'listeners',
  }),
  Kpi({
    icon: 'mic-vocal',
    label: 'Artists',
    value: empty ? '0' : '2,316',
    delta: empty ? '—' : '+1.4%',
    sub: empty ? 'No artists yet' : '38 waiting for verification',
    tone: empty ? 'Neutral' : 'Positive',
    spark: empty ? 'zero' : 'artists',
  }),
]
const listens = (r, { error, empty, menu } = {}) =>
  Tile(
    'Listens per day',
    error
      ? 'Series unavailable'
      : empty
        ? 'No listens yet'
        : `${r.listens.total} · ${r.listens.delta}`,
    'audio-waveform',
    error
      ? [
          Message(
            'Error',
            'Couldn’t load listens',
            'The series service timed out. Other tiles are up to date.',
          ),
        ]
      : empty
        ? [
            Message(
              'Empty',
              'No listens yet',
              'Plays appear here within a minute of the first stream.',
              'audio-waveform',
            ),
          ]
        : [Bars(r.listens.v, r.listens.l, r.listens.hi)],
    menu ? { actions: [R('Button/Icon Outline', {}, { icon: { icon: 'ellipsis' } })] } : {},
  )
const pipeline = ({ empty, locked } = {}) =>
  Tile(
    'Track pipeline',
    locked ? 'Restricted' : empty ? 'No uploads yet' : 'Last 24 h · 1,335 tracks',
    'audio-lines',
    locked
      ? [Message('Locked', 'Not in your role', 'Needs tracks:read. Ask a super admin for access.')]
      : empty
        ? [
            Message(
              'Empty',
              'Nothing processing',
              'Uploads show their progress here.',
              'audio-lines',
            ),
          ]
        : [
            R(
              'Bento/Segment Bar',
              {},
              {
                ready: { width: 160 },
                processing: { width: 34 },
                stuck: { width: 8 },
                failed: { width: 12 },
              },
            ),
            Col({ name: 'Legend', gap: 10, width: 'fill_container' }, [
              Legend('Success', 'Ready', '1,284'),
              Legend('Info', 'Processing', '47'),
              Legend('Warning', 'Stuck > 30 min', '1'),
              Legend('Error', 'Failed', '3'),
            ]),
            Link('Open catalog'),
          ],
  )
const reports = ({ empty } = {}) =>
  Tile(
    'Reports by type',
    empty ? 'No reports filed' : 'Filed in the last 2 days · 38',
    'flag',
    empty
      ? [
          Message(
            'Empty',
            'No reports yet',
            'Reports from listeners and artists are grouped by type here.',
            'flag',
          ),
        ]
      : [
          Meter(1, 'Tracks', '18', 222),
          Meter(2, 'Listeners', '9', 111),
          Meter(3, 'Playlists', '6', 74),
          Meter(4, 'Episodes', '3', 37),
          Meter(5, 'Albums', '2', 25),
        ],
  )
const accounts = (r, { error, empty } = {}) =>
  Tile(
    'Accounts',
    error ? 'Series unavailable' : `New accounts & uploads · ${r.meta.toLowerCase()}`,
    'user-plus',
    error
      ? [Message('Error', 'Couldn’t load the series', 'Try again in a moment.')]
      : [
          Col(
            { name: 'Figures', gap: 4, width: 'fill_container' },
            (empty ? r.kv.map(([k]) => [k, '0']) : r.kv).map(([k, v]) => Kv(k, v)),
          ),
          empty ? null : Bars(r.accounts.v, r.accounts.l, r.accounts.v.length - 1, 64),
        ].filter(Boolean),
  )
const audit = ({ empty } = {}) =>
  Tile(
    'Audit log',
    empty ? 'No staff actions yet' : 'Latest staff actions',
    'scroll-text',
    empty
      ? [
          Message(
            'Empty',
            'Quiet so far',
            'Every approval, take-down and role change is recorded here.',
            'scroll-text',
          ),
        ]
      : [
          Audit('mara.ops approved release Afterglow', '4 min ago'),
          Audit('leo.mod dismissed a report on Low Orbit', '18 min ago'),
          Audit('mara.ops verified artist Kite Harbor', '1 h ago'),
          Link('Open audit log'),
        ],
  )

/* ---------- page header ---------- */
const header = (m, { range = '7d', title = 'Good morning, Mara', sub, editing } = {}) =>
  R(
    'Artist/Page Header',
    { width: 'fill_container' },
    {
      eyebrow: { content: 'OVERVIEW · TUE, OCT 20' },
      title: { content: title },
      subtitle: { content: sub ?? 'What needs attention across Bitrate today.' },
      actions: L(
        { name: 'Actions', gap: 10, alignItems: 'center' },
        m
          ? []
          : editing
            ? []
            : [
                Chips(['7d', '30d', '90d'], RANGE[range].idx),
                IconBtn('rotate-cw', false),
                Button('Customise', 'outline', { icon: 'layout-grid' }),
              ],
      ),
    },
  )
const mControls = (range = '7d') =>
  Row({ name: 'Controls', width: 'fill_container', gap: 8 }, [
    Chips(['7d', '30d', '90d'], RANGE[range].idx),
    L({ name: 'Spacer', width: 'fill_container', height: 1 }),
    IconBtn('rotate-cw', false),
    IconBtn('layout-grid', false),
  ])

/* ---------- the bento grid: 4 columns on desktop, one column on phones ---------- */
const H1 = 590
const H2 = 380
/** `t` lets a state swap any tile; keys: action, kpi1, kpi2, listens, pipeline, reports, accounts, audit. */
const grid = (m, t) =>
  m
    ? [
        Col({ name: 'KPI Stack', width: 'fill_container', gap: 16 }, [t.kpi1, t.kpi2]),
        t.action,
        L({ name: 'Cell / Listens', width: 'fill_container', height: 300 }, [t.listens]),
        t.pipeline,
        t.reports,
        t.accounts,
        t.audit,
        t.add,
      ].filter(Boolean)
    : [
        Row(
          {
            name: 'Bento Row 1',
            width: 'fill_container',
            height: H1,
            gap: 16,
            alignItems: 'start',
          },
          [
            L({ name: 'Cell 2×2 / Needs action', width: 556, height: 'fill_container' }, [
              t.action,
            ]),
            Col(
              {
                name: 'Cell 2×2 / Right',
                width: 'fill_container',
                height: 'fill_container',
                gap: 16,
              },
              [
                Row({ name: 'KPI Row', width: 'fill_container', height: 200, gap: 16 }, [
                  t.kpi1,
                  t.kpi2,
                ]),
                L(
                  {
                    name: 'Cell 2×1 / Listens',
                    width: 'fill_container',
                    height: 'fill_container',
                    gap: 12,
                  },
                  [t.listens, t.menu].filter(Boolean),
                ),
              ],
            ),
          ],
        ),
        Row(
          {
            name: 'Bento Row 2',
            width: 'fill_container',
            height: H2,
            gap: 16,
            alignItems: 'start',
          },
          [t.pipeline, t.reports, t.accounts, t.audit, t.add]
            .filter(Boolean)
            .map((n, i) =>
              L(
                { name: `Cell 1×1 / ${i + 1}`, width: 'fill_container', height: 'fill_container' },
                [n],
              ),
            ),
        ),
      ]
const tiles = (r = RANGE['7d'], o = {}) => ({
  action: needsAction(o),
  kpi1: kpis(o.empty)[0],
  kpi2: kpis(o.empty)[1],
  listens: listens(r, { error: o.seriesError, empty: o.empty, menu: o.menu }),
  pipeline: pipeline(o),
  reports: reports(o),
  accounts: accounts(r, { error: o.seriesError, empty: o.empty }),
  audit: audit(o),
})
const overview = (m, { range = '7d', banner, ...o } = {}) =>
  [
    m ? header(true, o.headerOpts) : header(false, { range, ...o.headerOpts }),
    m ? mControls(range) : null,
    banner,
    ...grid(m, tiles(RANGE[range], o)),
  ].filter(Boolean)

/* ---------- edit mode: bento customisation groundwork ---------- */
const editTiles = (m) => {
  const e = (title, meta, icon, content, size) =>
    Tile(title, meta, icon, content, {
      kind: 'Editing',
      ...(m ? { actions: [IconBtn('eye-off')] } : { size }),
    })
  return {
    action: e(
      'Needs action',
      '27 items across three queues',
      'inbox',
      [
        Action('Warning', 'Reports to review', '12 open · 4 in review', '16'),
        Action('Info', 'Releases awaiting review', 'Oldest 2 days', '7'),
        Action('Error', 'Tracks failed processing', '3 failed · 1 stuck', '4'),
      ],
      '2×2',
    ),
    kpi1: e('Listeners', '+3.2% this week', 'users-round', [Tx('H2', '48,920')], '1×1'),
    kpi2: e('Artists', '+1.4% this week', 'mic-vocal', [Tx('H2', '2,316')], '1×1'),
    listens: e(
      'Listens per day',
      '1.84M listens',
      'audio-waveform',
      [Bars(RANGE['7d'].listens.v, DAYS, 5, 110)],
      '2×1',
    ),
    pipeline: e(
      'Track pipeline',
      '1,335 tracks',
      'audio-lines',
      [
        R(
          'Bento/Segment Bar',
          {},
          {
            ready: { width: 150 },
            processing: { width: 30 },
            stuck: { width: 8 },
            failed: { width: 10 },
          },
        ),
      ],
      '1×1',
    ),
    reports: e(
      'Reports by type',
      '38 in 2 days',
      'flag',
      [Meter(1, 'Tracks', '18', 200), Meter(2, 'Listeners', '9', 100)],
      '1×1',
    ),
    accounts: null,
    audit: e(
      'Audit log',
      'Latest staff actions',
      'scroll-text',
      [Audit('mara.ops approved release Afterglow', '4 min ago')],
      '1×1',
    ),
    add: R(
      'Bento/Add Tile',
      { name: 'Add Tile', ...FILL, ...(m ? { height: 160 } : {}) },
      {
        desc: { content: 'Accounts is hidden · 6 more available' },
      },
    ),
  }
}
const editing = (m) => [
  m
    ? header(true, { title: 'Customise overview' })
    : header(false, {
        title: 'Customise overview',
        sub: 'Your layout is saved for your account only.',
        editing: true,
      }),
  R(
    'Bento/Edit Bar',
    { width: 'fill_container' },
    m ? { desc: { content: 'Drag to reorder, hide what you don’t need.' } } : {},
  ),
  ...grid(m, editTiles(m)),
]

/* ---------- states ---------- */
const offlineBanner = R(
  'Alert/Warning',
  { name: 'Offline', width: 'fill_container' },
  {
    text: {
      content:
        'You’re offline. Showing figures from 09:42 — the overview refreshes when you reconnect; actions are paused.',
    },
  },
)
const loadingGrid = (m) =>
  m
    ? [
        Skel({ height: 196 }),
        Skel({ height: 196 }),
        ...[360, 240, 260, 260, 220, 260].map((h) => Skel({ height: h })),
      ]
    : grid(false, {
        action: Skel(),
        kpi1: Skel(),
        kpi2: Skel(),
        listens: Skel(),
        pipeline: Skel(),
        reports: Skel(),
        accounts: Skel(),
        audit: Skel(),
      })
const tileMenu = () =>
  R(
    'Context Menu',
    { name: 'Tile Menu' },
    {
      items: L({ name: 'Items', layout: 'vertical', width: 240 }, [
        R('Context Menu/Label', {}, { label: { content: 'Listens per day' } }),
        R(
          'Context Menu/Item',
          {},
          {
            label: { content: 'Open listening data' },
            icon: { icon: 'arrow-up-right' },
            shortcut: { enabled: false },
          },
        ),
        R(
          'Context Menu/Item Sub',
          {},
          { label: { content: 'Size · 2×1' }, icon: { icon: 'scaling' } },
        ),
        R(
          'Context Menu/Item',
          {},
          {
            label: { content: 'Export CSV' },
            icon: { icon: 'download' },
            shortcut: { enabled: false },
          },
        ),
        R('Context Menu/Separator'),
        R(
          'Context Menu/Item',
          {},
          {
            label: { content: 'Hide tile' },
            icon: { icon: 'eye-off' },
            shortcut: { enabled: false },
          },
        ),
      ]),
    },
  )
const tileDrawer = () =>
  R(
    'Drawer',
    { width: 'fill_container' },
    {
      content: L({ name: 'Drawer Content', layout: 'vertical', width: 'fill_container' }, [
        R('Drawer/Title', { width: 'fill_container' }, { title: { content: 'Listens per day' } }),
        R('Drawer/Separator', { width: 'fill_container' }),
        R(
          'Drawer/Item',
          { width: 'fill_container' },
          { label: { content: 'Open listening data' }, icon: { icon: 'arrow-up-right' } },
        ),
        R(
          'Drawer/Item',
          { width: 'fill_container' },
          { label: { content: 'Export CSV' }, icon: { icon: 'download' } },
        ),
        R(
          'Drawer/Item',
          { width: 'fill_container' },
          { label: { content: 'Move down' }, icon: { icon: 'arrow-down' } },
        ),
        R('Drawer/Separator', { width: 'fill_container' }),
        R(
          'Drawer/Item',
          { width: 'fill_container' },
          { label: { content: 'Hide tile' }, icon: { icon: 'eye-off' } },
        ),
      ]),
    },
  )
const D = (label, content, opts) => () => Shell(label, content(false), opts)
const M = (label, content, h) => () => MShell(label, fitMobile(content(true)), h)
const pair = (label, content, { opts, mh } = {}) =>
  state(label, D(label, content, opts), M(label, content, mh))
const MODERATOR_HIDE = [
  'nav_releases',
  'nav_catalog',
  'nav_albums',
  'nav_playlists',
  'nav_podcasts',
  'nav_genres',
  'nav_roles',
  'nav_staff',
]

export const adminPages = {
  overview: {
    title: 'Admin / Overview',
    route: '/ (requireStaffSession + overview:read)',
    context:
      'Operations centre for staff: what needs action first (reports, release review, failed tracks), then growth KPIs, pipeline, reports by type and the audit trail. Every tile is independent (1×1, 2×1, 2×2) so operators can later reorder, resize and hide tiles. Not-found is not drawn: unknown admin routes redirect to /. Login and /no-access are separate routes without the shell.',
    desktop: () => Shell('Overview', overview(false)),
    mobile: () => MShell('Overview', fitMobile(overview(true)), 2930),
    states: [
      pair(
        'Loading',
        (m) =>
          [
            m
              ? header(true, { title: 'Loading overview…' })
              : header(false, { title: 'Loading overview…', sub: 'Fetching queues and figures.' }),
            m ? mControls() : null,
            ...loadingGrid(m),
          ].filter(Boolean),
        { mh: 2440 },
      ),
      pair(
        'All clear',
        (m) =>
          overview(m, {
            clear: true,
            headerOpts: { sub: 'Nothing is waiting. Figures are up to date.' },
          }),
        { mh: 2540 },
      ),
      pair(
        'No data yet',
        (m) =>
          overview(m, {
            clear: true,
            empty: true,
            headerOpts: {
              title: 'Welcome to Bitrate Admin',
              sub: 'A fresh environment: figures appear as listeners, artists and uploads arrive.',
            },
          }),
        { mh: 2310 },
      ),
      pair(
        'Load error',
        (m) => [
          m ? header(true, { title: 'Overview' }) : header(false, { title: 'Overview' }),
          ErrorState(
            'We couldn’t load the overview',
            'The admin API didn’t respond. Queues and actions are unchanged — try again in a moment.',
            'Try again',
            'triangle-alert',
            'Open moderation',
          ),
        ],
        { mh: 1100 },
      ),
      pair(
        'Partial error',
        (m) =>
          overview(m, {
            seriesError: true,
            headerOpts: { sub: 'Some figures are unavailable. Queues are up to date.' },
          }),
        { mh: 2920 },
      ),
      pair(
        'Restricted role',
        (m) =>
          overview(m, {
            locked: true,
            headerOpts: {
              title: 'Good morning, Leo',
              sub: 'Moderator view: tiles outside your role stay locked.',
            },
          }),
        {
          opts: { role: 'Moderator', hide: MODERATOR_HIDE },
          mh: 2890,
        },
      ),
      pair('Offline', (m) => overview(m, { banner: offlineBanner }), {
        opts: { height: 1270 },
        mh: 3030,
      }),
      pair('Range 30d', (m) => overview(m, { range: '30d' }), { mh: 2930 }),
      state(
        'Tile menu',
        () => Shell('Tile menu', withMenu(overview(false, { menu: true }))),
        () => MShell('Tile menu', [...fitMobile(overview(true)).slice(0, 4), tileDrawer()], 1840),
      ),
      pair('Customise layout', editing, { opts: { height: 1270 }, mh: 1950 }),
    ],
  },
}
/* phones stack tiles in one column: every tile sizes to its content, except the fixed-height Listens cell */
function fitMobile(nodes) {
  const walk = (n) => {
    if (!n || typeof n !== 'object' || n.name === 'Cell / Listens') return
    if (
      /^(Tile|KPI|Message) \/ /.test(n.name ?? '') ||
      n.name === 'Tile Content' ||
      n.name === 'Bar Chart'
    )
      delete n.height
    ;(n.children ?? []).forEach(walk)
    if (n.descendants) Object.values(n.descendants).forEach(walk)
  }
  nodes.forEach(walk)
  return nodes
}
/* the open ⋯ menu of the Listens tile sits under it in the same cell, aligned to its right edge */
function withMenu(nodes) {
  const walk = (n) => {
    if (!n || typeof n !== 'object') return
    if (n.name === 'Cell 2×1 / Listens') {
      n.layout = 'horizontal'
      n.alignItems = 'start'
      n.children = [n.children[0], tileMenu()]
    }
    ;(n.children ?? []).forEach(walk)
  }
  nodes.forEach(walk)
  return nodes
}
