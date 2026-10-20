// Admin console (apps/admin) — Overview as a bento of independent tiles. Library instances only: the admin
// design system ("00F • Admin", registry-admin.json) and the rest of the Bitrate library.
import { readFileSync } from 'node:fs'
import { C, id, Ref } from './kit.mjs'
import {
  Button,
  Chips,
  Col,
  Divider,
  ErrorState,
  fitStates,
  IconBtn,
  L,
  R,
  Row,
  state,
  Tx,
} from './ui.mjs'

const areg = JSON.parse(readFileSync(new URL('./registry-admin.json', import.meta.url), 'utf8'))
/** Instance of an admin block (the library's "00F • Admin" page) by name; `parts` overrides its named parts. */
const A = (name, o = {}, parts = {}) => {
  const c = areg[name]
  if (!c) throw new Error(`no admin block "${name}"`)
  const desc = {}
  for (const [p, v] of Object.entries(parts)) {
    if (v === undefined) continue
    const pid = c.parts[p]
    if (!pid) throw new Error(`admin block "${name}" has no part "${p}"`)
    if (pid === c.id) Object.assign(o, v)
    else desc[pid] = v
  }
  return Ref(c.id, { name: o.name ?? name, ...o }, Object.keys(desc).length ? desc : undefined)
}

/* ---------- language: English by default, Українська after the switch ---------- */
const UK = {
  Overview: 'Огляд',
  Moderation: 'Модерація',
  Releases: 'Релізи',
  Catalog: 'Каталог',
  Albums: 'Альбоми',
  Playlists: 'Плейлисти',
  Podcasts: 'Подкасти',
  Genres: 'Жанри',
  Artists: 'Артисти',
  Listeners: 'Слухачі',
  'Audit log': 'Журнал аудиту',
  Roles: 'Ролі',
  Staff: 'Персонал',
  OPERATIONS: 'ОПЕРАЦІЇ',
  ACCOUNTS: 'АКАУНТИ',
  SYSTEM: 'СИСТЕМА',
  Dark: 'Темна',
  Light: 'Світла',
  Dim: 'Приглушена',
  Collapse: 'Згорнути',
  'Search tracks, artists, reports': 'Пошук треків, артистів, скарг',
  'Admin / Overview': 'Адмінка / Огляд',
  'Super admin': 'Суперадмін',
  'OVERVIEW · TUE, OCT 20': 'ОГЛЯД · ВТ, 20 ЖОВТ.',
  'Good morning, Mara': 'Доброго ранку, Mara',
  'What needs attention across Bitrate today.': 'Що сьогодні потребує уваги в Bitrate.',
  '7d': '7 дн',
  '30d': '30 дн',
  '90d': '90 дн',
  'Needs action': 'Потребує дій',
  '27 items across three queues · oldest 2 days':
    '27 елементів у трьох чергах · найдавнішому 2 дні',
  'Open moderation': 'Відкрити модерацію',
  'Reports to review': 'Скарги на розгляд',
  '12 open · 4 in review · oldest 6 h': '12 відкритих · 4 на розгляді · найдавнішій 6 год',
  'Releases awaiting review': 'Релізи чекають перевірки',
  'Oldest submitted 2 days ago': 'Найдавніший надіслано 2 дні тому',
  'Tracks failed processing': 'Треки з помилкою обробки',
  '3 failed · 1 stuck for 42 min': '3 з помилкою · 1 завис на 42 хв',
  'LATEST REPORTS': 'ОСТАННІ СКАРГИ',
  'Track · Copyright claim · Glass Horizon': 'Трек · Авторські права · Glass Horizon',
  'Nova & the Static · 12 min ago': 'Nova & the Static · 12 хв тому',
  'User · Spam in playlist titles · @driftwave': 'Слухач · Спам у назвах плейлистів · @driftwave',
  'Listener · 38 min ago': 'Слухач · 38 хв тому',
  'Episode · Hate speech · Late Signal Radio #41':
    'Епізод · Мова ворожнечі · Late Signal Radio #41',
  'Lumen Choir · 1 h ago': 'Lumen Choir · 1 год тому',
  '412 new this week': '412 нових цього тижня',
  '38 waiting for verification': '38 чекають верифікації',
  'Listens per day': 'Прослуховування за день',
  '1.84M listens · +12% vs previous 7 days': '1,84 млн прослуховувань · +12% до попередніх 7 днів',
  Mon: 'Пн',
  Tue: 'Вт',
  Wed: 'Ср',
  Thu: 'Чт',
  Fri: 'Пт',
  Sat: 'Сб',
  Sun: 'Нд',
  M: 'П',
  T: 'В',
  W: 'С',
  F: 'П',
  S: 'С',
  'Track pipeline': 'Обробка треків',
  'Last 24 h · 1,335 tracks': 'За 24 год · 1 335 треків',
  Ready: 'Готові',
  Processing: 'Обробляються',
  'Stuck > 30 min': 'Зависли > 30 хв',
  Failed: 'Помилка',
  'Open catalog': 'Відкрити каталог',
  'Reports by type': 'Скарги за типом',
  'Filed in the last 2 days · 38': 'Подано за 2 дні · 38',
  Tracks: 'Треки',
  Episodes: 'Епізоди',
  Accounts: 'Акаунти',
  'New accounts & uploads · last 7 days': 'Нові акаунти й завантаження · 7 днів',
  'New accounts': 'Нові акаунти',
  Uploads: 'Завантаження',
  Deactivated: 'Деактивовано',
  'Latest staff actions': 'Останні дії персоналу',
  'mara.ops approved release Afterglow': 'mara.ops: схвалено реліз Afterglow',
  'leo.mod dismissed a report on Low Orbit': 'leo.mod: відхилено скаргу на Low Orbit',
  'mara.ops verified artist Kite Harbor': 'mara.ops: верифіковано артиста Kite Harbor',
  '4 min ago': '4 хв тому',
  '18 min ago': '18 хв тому',
  '1 h ago': '1 год тому',
  'Open audit log': 'Відкрити журнал аудиту',
}
/** Every `content` the dictionary knows is swapped for its Ukrainian text, inside overrides too. */
const ukrainian = (nodes) => {
  const walk = (n) => {
    if (!n || typeof n !== 'object') return
    if (typeof n.content === 'string' && UK[n.content]) n.content = UK[n.content]
    for (const v of Object.values(n)) if (v && typeof v === 'object') walk(v)
  }
  walk(nodes)
  return nodes
}

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
const THEME = { Dark: 'moon', Light: 'sun', Dim: 'contrast' }
const ROLE = { 'Super admin': 'mara.ops', Moderator: 'leo.mod' }
const NAV_LABEL = {
  moderation: 'Moderation',
  releases: 'Releases',
  catalog: 'Catalog',
  albums: 'Albums',
  playlists: 'Playlists',
  podcasts: 'Podcasts',
  genres: 'Genres',
  artists: 'Artists',
  users: 'Listeners',
  audit: 'Audit log',
  roles: 'Roles',
  staff: 'Staff',
}
/** Panel overrides shared by the desktop sidebar and the phone menu: active Overview, theme, language.
 *  The library holds English defaults, so Ukrainian restates each label for the dictionary to swap. */
const panel = ({ theme = 'Dark', uk = false, rail = false, hide = [] } = {}) => ({
  nav_overview: rail
    ? A(
        'Admin/Rail Item Active',
        { name: 'Nav / Overview' },
        { icon: { icon: 'layout-dashboard' } },
      )
    : A(
        'Admin/Nav Item Active',
        { name: 'Nav / Overview' },
        {
          icon: { icon: 'layout-dashboard' },
          label: { content: 'Overview' },
          count: { enabled: false },
        },
      ),
  'pref_theme.icon': { icon: THEME[theme] },
  ...(rail ? {} : { 'pref_theme.label': { content: theme } }),
  ...(uk && !rail
    ? {
        'pref_language.label': { content: 'Українська' },
        'pref_collapse.label': { content: 'Collapse' },
        groupText_operations: { content: 'OPERATIONS' },
        groupText_accounts: { content: 'ACCOUNTS' },
        groupText_system: { content: 'SYSTEM' },
        ...Object.fromEntries(
          Object.entries(NAV_LABEL).map(([k, v]) => [`nav_${k}.label`, { content: v }]),
        ),
      }
    : {}),
  ...Object.fromEntries(hide.map((k) => [k, { enabled: false }])),
})
const content = (nodes, mobile) =>
  L(
    {
      name: 'Content',
      layout: 'vertical',
      gap: mobile ? 16 : 20,
      padding: mobile ? [20, 16] : [28, 32],
      clip: true,
      width: 'fill_container',
      height: 'fill_container',
    },
    fitStates(nodes, mobile),
  )
/** Desktop admin page: sidebar (expanded, or the collapsed rail), header with the operator, content. */
const Shell = (
  name,
  nodes,
  {
    height = 1200,
    role = 'Super admin',
    hide = [],
    theme = 'Dark',
    collapsed = false,
    uk = false,
  } = {},
) => {
  const shell = A(
    collapsed ? 'Admin/Shell/Desktop Collapsed' : 'Admin/Shell/Desktop',
    { width: 1440, height },
    {
      ...panel({ theme, uk, rail: collapsed, hide }),
      operator: { content: ROLE[role] },
      role: { content: role },
      ...(uk
        ? {
            breadcrumb: { content: 'Admin / Overview' },
            search: { content: 'Search tracks, artists, reports' },
          }
        : {}),
      content: content(nodes, false),
    },
  )
  return frame(name, 1440, height, uk ? ukrainian(shell) : shell)
}
const MShell = (name, nodes, height = 2600) =>
  frame(
    name,
    390,
    height,
    A('Admin/Shell/Mobile', { width: 390, height }, { content: content(nodes, true) }),
  )

/* ---------- tiles ---------- */
const FILL = { width: 'fill_container', height: 'fill_container' }
/** A bento tile; `actions` replaces its default "open section" button. */
const Tile = (title, meta, icon, nodes, { accent, actions } = {}) =>
  A(
    accent ? 'Admin/Bento/Tile Accent' : 'Admin/Bento/Tile',
    { name: `Tile / ${title}`, ...FILL },
    {
      icon: { icon },
      title: { content: title },
      meta: { content: meta },
      actions: actions ? L({ name: 'Actions', gap: 6, alignItems: 'center' }, actions) : undefined,
      content: L({ name: 'Tile Content', layout: 'vertical', gap: 14, ...FILL }, nodes.flat()),
    },
  )
const SPARK = {
  listeners: [14, 15, 17, 16, 19, 20, 22, 21, 24, 26, 27, 30],
  artists: [18, 18, 19, 20, 19, 21, 22, 22, 23, 23, 24, 25],
  zero: Array(12).fill(2),
}
const Kpi = ({ tone = 'Positive', icon, label, value, delta, sub, spark = 'listeners' }) =>
  A(
    `Admin/Bento/KPI/${tone}`,
    { name: `KPI / ${label}`, ...FILL },
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
  A(
    `Admin/Bento/Action Row/${tone}`,
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
        { bar: { height: Math.max(4, Math.round(v * max)) }, label: { content: labels[i] } },
      ),
    ),
  )
const Meter = (i, label, value, width) =>
  A(
    `Admin/Bento/Meter Row/${i}`,
    { name: `Meter / ${label}` },
    { label: { content: label }, value: { content: value }, bar: { width } },
  )
const Legend = (tone, label, value) =>
  A(
    `Admin/Bento/Legend Row/${tone}`,
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
  A(
    `Admin/Bento/Tile Message/${kind}`,
    { name: `Message / ${kind}`, ...FILL },
    {
      title: title ? { content: title } : undefined,
      desc: desc ? { content: desc } : undefined,
      icon: icon ? { icon } : undefined,
    },
  )
const Link = (t) => Tx('Link', t)
const Updating = () => A('Admin/Loader/Updating', { name: 'Updating' })

/* ---------- data per range ---------- */
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const RANGE = {
  '7d': {
    idx: 0,
    listens: {
      total: '1.84M listens · +12% vs previous 7 days',
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
    meta: 'New accounts & uploads · last 7 days',
  },
  '30d': {
    idx: 1,
    listens: {
      total: '7.42M listens · +9% vs previous 30 days',
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
    meta: 'New accounts & uploads · last 30 days',
  },
}

/* ---------- the Overview's tiles ---------- */
const needsAction = ({ clear = false, locked = false, updating = false } = {}) =>
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
            ? A(
                'Admin/Bento/Tile Message/Locked',
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
      accent: true,
      actions: [
        updating ? Updating() : null,
        Button('Open moderation', 'default', { icon: 'arrow-right' }),
      ].filter(Boolean),
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
const listens = (r, { error, empty, updating } = {}) =>
  Tile(
    'Listens per day',
    error ? 'Series unavailable' : empty ? 'No listens yet' : r.listens.total,
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
    updating ? { actions: [Updating()] } : {},
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
            A(
              'Admin/Bento/Segment Bar',
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
    error ? 'Series unavailable' : r.meta,
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
const audit = ({ empty, updating } = {}) =>
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
    updating ? { actions: [Updating()] } : {},
  )

/* ---------- page header and range controls ---------- */
const header = (m, { range = '7d', title = 'Good morning, Mara', sub, updating } = {}) =>
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
          : [
              Chips(['7d', '30d', '90d'], RANGE[range].idx),
              updating ? Updating() : IconBtn('rotate-cw', false),
            ],
      ),
    },
  )
const mControls = (range = '7d', updating) =>
  Row({ name: 'Controls', width: 'fill_container', gap: 8 }, [
    Chips(['7d', '30d', '90d'], RANGE[range].idx),
    L({ name: 'Spacer', width: 'fill_container', height: 1 }),
    updating ? Updating() : IconBtn('rotate-cw', false),
  ])

/* ---------- the bento grid: four columns on desktop, one column on phones ---------- */
const H1 = 590
const H2 = 380
const grid = (m, t, { collapsed } = {}) =>
  m
    ? [
        Col({ name: 'KPI Stack', width: 'fill_container', gap: 16 }, [t.kpi1, t.kpi2]),
        t.action,
        L({ name: 'Cell / Listens', width: 'fill_container', height: 300 }, [t.listens]),
        t.pipeline,
        t.reports,
        t.accounts,
        t.audit,
      ]
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
            L(
              {
                name: 'Cell 2×2 / Needs action',
                width: collapsed ? 648 : 556,
                height: 'fill_container',
              },
              [t.action],
            ),
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
                  },
                  [t.listens],
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
          [t.pipeline, t.reports, t.accounts, t.audit].map((n, i) =>
            L({ name: `Cell 1×1 / ${i + 1}`, width: 'fill_container', height: 'fill_container' }, [
              n,
            ]),
          ),
        ),
      ]
const tiles = (r, o = {}) => ({
  action: needsAction(o),
  kpi1: kpis(o.empty)[0],
  kpi2: kpis(o.empty)[1],
  listens: listens(r, { error: o.seriesError, empty: o.empty, updating: o.updating }),
  pipeline: pipeline(o),
  reports: reports(o),
  accounts: accounts(r, { error: o.seriesError, empty: o.empty }),
  audit: audit(o),
})
/* loaders: every element has a skeleton of its own shape; on phones each keeps a fixed height */
const LOADER = {
  action: ['Admin/Loader/Tile Actions', 470],
  kpi1: ['Admin/Loader/KPI', 196],
  kpi2: ['Admin/Loader/KPI', 196],
  listens: ['Admin/Loader/Tile Chart', 300],
  pipeline: ['Admin/Loader/Tile Pipeline', 250],
  reports: ['Admin/Loader/Tile Meters', 300],
  accounts: ['Admin/Loader/Tile Chart', 260],
  audit: ['Admin/Loader/Tile List', 240],
}
const loader = (key, m) =>
  A(LOADER[key][0], {
    name: `Loader / ${key}`,
    width: 'fill_container',
    height: m && key !== 'listens' ? LOADER[key][1] : 'fill_container',
  })
const withLoaders = (t, keys, m) => {
  for (const k of keys) t[k] = loader(k, m)
  return t
}
const overview = (m, { range = '7d', banner, loading = [], collapsed, ...o } = {}) =>
  [
    m
      ? header(true, o.headerOpts)
      : header(false, { range, updating: o.updating, ...o.headerOpts }),
    m ? mControls(range, o.updating) : null,
    banner,
    /* phones show one Updating badge in the controls row instead of one per tile */
    ...grid(m, withLoaders(tiles(RANGE[range], m ? { ...o, updating: false } : o), loading, m), {
      collapsed,
    }),
  ].filter(Boolean)

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

/* ---------- states ---------- */
const offlineBanner = () =>
  R(
    'Alert/Warning',
    { name: 'Offline', width: 'fill_container' },
    {
      text: {
        content:
          'You’re offline. Showing figures from 09:42 — the overview refreshes when you reconnect; actions are paused.',
      },
    },
  )
const ALL = ['action', 'kpi1', 'kpi2', 'listens', 'pipeline', 'reports', 'accounts', 'audit']
const D = (label, build, opts) => () => Shell(label, build(false), opts)
const M = (label, build, h, uk) => () =>
  MShell(label, uk ? ukrainian(fitMobile(build(true))) : fitMobile(build(true)), h)
const pair = (label, build, { opts, mh, uk } = {}) =>
  state(label, D(label, build, opts), M(label, build, mh, uk))
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
      'Operations centre for staff: what needs action first (reports, release review, failed tracks), then KPIs, listens, the track pipeline, reports by type, accounts and the audit trail, each in its own bento tile. The sidebar footer switches the language (English ↔ Українська), cycles the theme (Dark → Light → Dim) and collapses the panel to a rail. Not-found is not drawn: unknown admin routes redirect to /. Login and /no-access are separate routes without the shell.',
    desktop: (theme) => Shell('Overview', overview(false), { theme }),
    mobile: () => MShell('Overview', fitMobile(overview(true)), 2930),
    states: [
      state(
        'Sidebar collapsed',
        () => Shell('Sidebar collapsed', overview(false, { collapsed: true }), { collapsed: true }),
        null,
        'phones have no side panel; the menu button opens it as a sheet (see Menu open)',
      ),
      state(
        'Menu open',
        null,
        () =>
          MShell(
            'Menu open',
            [
              A(
                'Admin/Mobile Menu',
                { name: 'Menu', width: 'fill_container', height: 'fill_container' },
                panel(),
              ),
            ],
            940,
          ),
        'the desktop panel is always on screen; it collapses to a rail instead (see Sidebar collapsed)',
      ),
      pair('Українська', (m) => ukrainian(overview(m)), { opts: { uk: true }, uk: true, mh: 3070 }),
      pair(
        'Loading',
        (m) =>
          overview(m, {
            loading: ALL,
            headerOpts: { title: 'Loading overview…', sub: 'Fetching queues and figures.' },
          }),
        { mh: 2670 },
      ),
      pair(
        'Loading · per tile',
        (m) =>
          overview(m, {
            loading: ['listens', 'reports', 'accounts'],
            headerOpts: { sub: 'Queues are ready; figures are still arriving.' },
          }),
        { mh: 2910 },
      ),
      pair(
        'Refreshing',
        (m) =>
          overview(m, {
            updating: true,
            headerOpts: { sub: 'Updating figures. Everything stays usable while it refreshes.' },
          }),
        { mh: 2930 },
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
        { opts: { role: 'Moderator', hide: MODERATOR_HIDE }, mh: 2890 },
      ),
      pair('Offline', (m) => overview(m, { banner: offlineBanner() }), {
        opts: { height: 1270 },
        mh: 3030,
      }),
      pair('Range 30d', (m) => overview(m, { range: '30d' }), { mh: 2930 }),
    ],
  },
}
