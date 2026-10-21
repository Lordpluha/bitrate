// Admin console (apps/admin) — Overview as glass bento tiles, each opening a full analysis, after the
// admin prototype (pencil/web-admin-design/prototype/admin-bento-prototype.html). Instances of the admin
// design system only (pencil/web-admin-design/design-system/admin.lib.pen, imported as `admin`).
import { C } from './kit.mjs'
import {
  A,
  Btn,
  IconBtn,
  Menu,
  MShell,
  Pill,
  Seg,
  Shell,
  Tx,
  frame,
  ukrainian,
} from './admin-ui.mjs'
import { notificationsPage } from './pages-admin-notifications.mjs'
import { resourcePages } from './admin-resource.mjs'
import { Col, L, Row, state } from './ui.mjs'

const FILL = { width: 'fill_container', height: 'fill_container' }
const W = { width: 'fill_container' }
const WRAP = { width: 'fill_container', textGrowth: 'fixed-width' }

/* ---------- tiles ---------- */
const Tile = (title, meta, icon, nodes, { accent, actions, fixed, m } = {}) =>
  A(
    accent ? 'Admin/Tile Accent' : 'Admin/Tile',
    {
      name: `Tile / ${title}`,
      ...(m ? { width: 'fill_container', ...(fixed ? { height: fixed } : {}) } : FILL),
    },
    {
      icon: { icon },
      title: { content: title },
      meta: { content: meta },
      actions: actions ? L({ name: 'Actions', gap: 6, alignItems: 'center' }, actions) : undefined,
      content: L(
        {
          name: 'Tile Content',
          layout: 'vertical',
          gap: 10,
          width: 'fill_container',
          ...(m && !fixed ? {} : { height: 'fill_container' }),
        },
        nodes.flat().filter(Boolean),
      ),
    },
  )
const Action = (tone, title, meta, count) =>
  A(
    `Admin/Action Row/${tone}`,
    { name: `Action / ${title}` },
    { title: { content: title }, meta: { content: meta }, count: { content: count } },
  )
const Feed = (text, meta) =>
  A(
    'Admin/Feed Item',
    { name: `Feed / ${text.slice(0, 24)}` },
    { text: { content: text }, meta: { content: meta } },
  )
const Legend = (tone, label, value) =>
  A(
    `Admin/Legend/${tone}`,
    { name: `Legend / ${label}` },
    { label: { content: label }, value: { content: value } },
  )
const Meter = (k, label, value, width) =>
  A(
    `Admin/Meter/${k}`,
    { name: `Meter / ${label}` },
    { label: { content: label }, value: { content: value }, bar: { width } },
  )
const KV = (key, value) =>
  A(
    'Admin/Key Value',
    { name: `KV / ${key}` },
    { key: { content: key }, value: { content: value } },
  )
const Message = (kind, title, desc, icon, o = {}) =>
  A(
    `Admin/Tile Message/${kind}`,
    { name: `Message / ${kind}`, ...FILL, ...o },
    {
      title: title ? { content: title } : undefined,
      desc: desc ? { content: desc } : undefined,
      icon: icon ? { icon } : undefined,
    },
  )
const Updating = () => A('Admin/Updating', { name: 'Updating' })
const Link = (t) => Tx('Link', t)
const Bars = (values, labels, hi, max, o = {}, value = ' ') =>
  Row(
    {
      name: 'Bars',
      width: 'fill_container',
      height: 'fill_container',
      gap: 10,
      alignItems: 'end',
      ...o,
    },
    values.map((v, i) =>
      A(
        i === hi ? 'Admin/Bar/Highlight' : 'Admin/Bar/Base',
        { name: `Bar / ${labels[i]}` },
        {
          bar: { height: Math.max(4, Math.round(v * max)) },
          label: { content: labels[i] },
          value: { content: i === hi ? value : ' ' },
        },
      ),
    ),
  )
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const LISTENS = [0.62, 0.58, 0.66, 0.71, 0.84, 0.97, 0.9]
const KPI = (label, icon, value, delta, sub, empty, geometry) =>
  A(
    'Admin/KPI',
    { name: `KPI / ${label}`, width: 'fill_container' },
    {
      icon: { icon },
      label: { content: label },
      value: { content: empty ? '0' : value },
      sub: { content: empty ? '—' : sub },
      delta: empty
        ? A('Pill/Flat', { name: 'Delta' }, { label: { content: '—' }, icon: { enabled: false } })
        : undefined,
      'delta.label': empty ? undefined : { content: delta },
      spark: empty ? { enabled: false } : geometry ? { geometry } : undefined,
    },
  )
const ARTIST_SPARK =
  'M0 30 L24 30 L48 28 L72 26 L96 27 L120 24 L144 22 L168 22 L192 20 L216 19 L240 18 L264 16 L264 44 L0 44 Z'

function tiles(m, o = {}) {
  const empty = o.empty
  const fit = m ? { height: 'fit_content' } : {}
  const needs = Tile(
    'Needs action',
    empty ? 'Queues are empty' : '27 items across three queues',
    'inbox',
    empty
      ? [
          Message(
            'Empty',
            'All clear',
            'No reports, releases or failed tracks are waiting. New items appear here first.',
            'circle-check',
            fit,
          ),
        ]
      : [
          Action('Warning', 'Reports to review', '12 open · 4 in review · oldest 6 h', '16'),
          o.locked
            ? A(
                'Admin/Tile Message/Locked',
                { name: 'Locked / Releases', width: 'fill_container' },
                {
                  title: { content: 'Release review is not in your role' },
                  desc: { content: 'Needs releases:read. Ask a super admin for access.' },
                },
              )
            : Action('Info', 'Releases awaiting review', 'Oldest submitted 2 days ago', '7'),
          o.locked
            ? null
            : Action('Error', 'Tracks failed processing', '3 failed · 1 stuck for 42 min', '4'),
          Tx('Eyebrow', 'LATEST REPORTS'),
          Feed('Track · Copyright claim · Glass Horizon', 'Nova & the Static · 12 min'),
          o.locked
            ? null
            : Feed('User · Spam in playlist titles · @driftwave', 'Listener · 38 min'),
        ],
    {
      accent: true,
      m,
      actions: [
        o.updating ? Updating() : null,
        m ? null : Btn('Default', 'Open moderation', 'chevron-right'),
      ].filter(Boolean),
    },
  )
  const kpi1 = KPI('Listeners', 'users-round', '48,920', '+3.2%', '412 new this week', empty)
  const kpi2 = KPI(
    'Artists',
    'mic-vocal',
    '2,316',
    '+1.4%',
    '38 waiting for verification',
    empty,
    ARTIST_SPARK,
  )
  const listens = Tile(
    'Listens per day',
    o.seriesError ? '—' : empty ? 'No data yet' : '1.84M listens · +12% vs previous period',
    'audio-waveform',
    o.seriesError
      ? [A('Admin/Tile Message/Inline Error', { name: 'Inline Error', width: 'fill_container' })]
      : empty
        ? [
            Message(
              'Empty',
              'No data yet',
              'Plays appear here within a minute of the first stream.',
              'audio-waveform',
            ),
          ]
        : [Bars(LISTENS, DAYS, 5, m ? 100 : 46, {}, '1.02M')],
    { m, fixed: m ? 260 : undefined, actions: o.updating ? [Updating()] : undefined },
  )
  const pipeline = Tile(
    'Track pipeline',
    o.locked ? 'Restricted' : empty ? 'No data yet' : 'Last 24 h · 1,335 tracks',
    'audio-lines',
    o.locked
      ? [
          Message(
            'Locked',
            'Not in your role',
            'Needs tracks:read. Ask a super admin for access.',
            'lock',
            fit,
          ),
        ]
      : empty
        ? [
            Message(
              'Empty',
              'Nothing processing',
              'Uploads show their progress here.',
              'audio-lines',
              fit,
            ),
          ]
        : [
            A(
              'Admin/Segment Bar',
              W,
              m
                ? {
                    ready: { width: 214 },
                    processing: { width: 46 },
                    stuck: { width: 10 },
                    failed: { width: 16 },
                  }
                : {
                    ready: { width: 156 },
                    processing: { width: 34 },
                    stuck: { width: 8 },
                    failed: { width: 14 },
                  },
            ),
            Col({ name: 'Legend', gap: 9, width: 'fill_container' }, [
              Legend('Success', 'Ready', '1,284'),
              Legend('Info', 'Processing', '47'),
              Legend('Warning', 'Stuck > 30 min', '1'),
              Legend('Error', 'Failed', '3'),
            ]),
            L({ name: 'Spacer', width: 'fill_container', height: m ? 4 : 'fill_container' }),
            Link('Open catalog'),
          ],
    { m },
  )
  const meterW = m ? 290 : 234
  const reports = Tile(
    'Reports by type',
    empty ? 'No data yet' : 'Filed in 2 days · 38',
    'flag',
    empty
      ? [
          Message(
            'Empty',
            'No reports yet',
            'Reports from listeners and artists are grouped by type here.',
            'flag',
            fit,
          ),
        ]
      : [
          ['Tracks', 18],
          ['Listeners', 9],
          ['Playlists', 6],
          ['Episodes', 3],
          ['Albums', 2],
        ].map(([l, v], k) => Meter(k + 1, l, String(v), Math.round((v / 18) * meterW))),
    { m },
  )
  const accounts = Tile(
    'Accounts',
    o.seriesError ? '—' : 'New accounts & uploads',
    'user-plus',
    o.seriesError
      ? [Message('Error', null, null, null, fit)]
      : [
          Col(
            { name: 'Figures', gap: 0, width: 'fill_container' },
            [
              ['New accounts', '1,128'],
              ['Uploads', '2,940'],
              ['Deactivated', '14'],
            ].map(([k, v]) => KV(k, empty ? '0' : v)),
          ),
          empty
            ? null
            : Bars(
                [0.5, 0.42, 0.61, 0.55, 0.7, 0.9, 0.78],
                ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
                6,
                m ? 80 : 120,
                m ? { height: 120 } : {},
              ),
        ],
    { m },
  )
  const audit = Tile(
    'Audit log',
    'Latest staff actions',
    'scroll-text',
    empty
      ? [
          Message(
            'Empty',
            'Quiet so far',
            'Every approval, take-down and role change is recorded here.',
            'scroll-text',
            fit,
          ),
        ]
      : [
          Feed('mara.ops approved release Afterglow', '4 min'),
          Feed('leo.mod dismissed a report on Low Orbit', '18 min'),
          Feed('mara.ops verified artist Kite Harbor', '1 h'),
          L({ name: 'Spacer', width: 'fill_container', height: m ? 4 : 'fill_container' }),
          Link('Open audit log'),
        ],
    { m, actions: o.updating ? [Updating()] : undefined },
  )
  return { needs, kpi1, kpi2, listens, pipeline, reports, accounts, audit }
}
const LOADER = {
  needs: 'Actions',
  kpi1: 'KPI',
  kpi2: 'KPI',
  listens: 'Chart',
  pipeline: 'Pipeline',
  reports: 'Meters',
  accounts: 'Chart',
  audit: 'List',
}
const LOADER_H = {
  needs: 470,
  kpi1: 196,
  kpi2: 196,
  listens: 260,
  pipeline: 260,
  reports: 300,
  accounts: 300,
  audit: 240,
}
const withLoaders = (t, keys, m) => {
  for (const k of keys)
    t[k] = A(`Admin/Loader/${LOADER[k]}`, {
      name: `Loader / ${k}`,
      width: 'fill_container',
      height: m ? LOADER_H[k] : 'fill_container',
    })
  return t
}
/* four columns on desktop (1×1, 2×1, 2×2), one column on phones */
const grid = (m, t, collapsed) =>
  m
    ? [t.kpi1, t.kpi2, t.needs, t.listens, t.pipeline, t.reports, t.accounts, t.audit]
    : [
        Row(
          {
            name: 'Bento Row 1',
            width: 'fill_container',
            height: 392,
            gap: 16,
            alignItems: 'start',
          },
          [
            L(
              {
                name: 'Cell 2×2 / Needs action',
                width: collapsed ? 650 : 564,
                height: 'fill_container',
              },
              [t.needs],
            ),
            Col({ name: 'Cell 2×2 / Right', ...FILL, gap: 16 }, [
              Row({ name: 'KPI Row', width: 'fill_container', height: 188, gap: 16 }, [
                L({ name: 'Cell / KPI 1', ...FILL }, [t.kpi1]),
                L({ name: 'Cell / KPI 2', ...FILL }, [t.kpi2]),
              ]),
              L({ name: 'Cell 2×1 / Listens', ...FILL }, [t.listens]),
            ]),
          ],
        ),
        Row(
          {
            name: 'Bento Row 2',
            width: 'fill_container',
            height: 392,
            gap: 16,
            alignItems: 'start',
          },
          [t.pipeline, t.reports, t.accounts, t.audit].map((n, i) =>
            L({ name: `Cell 1×1 / ${i + 1}`, ...FILL }, [n]),
          ),
        ),
      ]
const header = (
  m,
  {
    title = 'Good morning,',
    accent = 'Mara',
    sub = 'What needs attention across Bitrate today.',
    updating,
  } = {},
) =>
  m
    ? [
        A('Admin/Page Header Compact', W, {
          /* the title hugs its accent; alone it takes the row and wraps */
          title: { content: title, ...(accent ? {} : WRAP) },
          accent: accent ? { content: accent } : { enabled: false },
          subtitle: { content: sub },
        }),
        Row({ name: 'Range Row', width: 'fill_container', gap: 8 }, [
          Seg(['7d', '30d', '90d'], '7d'),
          L({ name: 'Spacer', width: 'fill_container', height: 1 }),
          updating ? Updating() : IconBtn('refresh-cw', 'Raised'),
        ]),
      ]
    : A('Admin/Page Header', W, {
        title: { content: title },
        accent: accent ? { content: accent } : { enabled: false },
        subtitle: { content: sub },
        actions: L({ name: 'Actions', gap: 10, alignItems: 'center' }, [
          Seg(['7d', '30d', '90d'], '7d'),
          updating ? Updating() : IconBtn('refresh-cw', 'Raised'),
        ]),
      })
const overview = (m, o = {}) =>
  [
    header(m, o.head),
    o.banner,
    ...grid(m, withLoaders(tiles(m, o), o.loading ?? [], m), o.collapsed),
  ]
    .flat()
    .filter(Boolean)
const offlineBanner = () => A('Admin/Banner', W, {})
const errorPage = (m) => [
  header(m, {}),
  A(
    'Admin/Tile',
    { name: 'Tile / Overview', width: 'fill_container', height: m ? 460 : 640 },
    {
      icon: { icon: 'triangle-alert' },
      title: { content: 'Overview' },
      meta: { content: 'Couldn’t load' },
      actions: { enabled: false },
      content: L({ name: 'Tile Content', layout: 'vertical', ...FILL }, [
        A(
          'Admin/Tile Message/Error',
          { name: 'Error', ...FILL },
          {
            title: { content: 'We couldn’t load the overview' },
            desc: { content: 'The admin API didn’t respond. Queues and actions are unchanged.' },
            'action.label': { content: 'Try again' },
          },
        ),
      ]),
    },
  ),
]
const ALL = ['needs', 'kpi1', 'kpi2', 'listens', 'pipeline', 'reports', 'accounts', 'audit']
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

/* ---------- overlays drawn in the flow under the top bar ---------- */
const NOTICES = [
  ['Warning', 'flag', 'New report filed', 'Track · Copyright claim · Glass Horizon', '2 min', true],
  ['Error', 'triangle-alert', 'SLA breach', '3 reports have waited over 6 h', '18 min', true],
  [
    'Info',
    'disc-3',
    'Release submitted for review',
    'Kite Harbor submitted “Static Lines” (EP)',
    '1 h',
    true,
  ],
  [
    'Success',
    'shield-check',
    'New staff sign-in',
    'sam.ops signed in from Firefox on Linux',
    '3 h',
    false,
  ],
  [
    'Error',
    'audio-lines',
    'Track processing failed',
    '“Late Signal” failed: unsupported codec',
    '5 h',
    false,
  ],
]
export const popover = (m) =>
  A(
    'Admin/Popover',
    { name: 'Notifications', ...(m ? { width: 'fill_container' } : {}) },
    {
      list: L(
        { name: 'List', layout: 'vertical', gap: 0, width: 'fill_container' },
        NOTICES.map(([tone, icon, title, body, time, un]) =>
          A(
            `Admin/Notice/${tone}`,
            { name: `Notice / ${title}` },
            {
              icon: { icon },
              title: { content: title },
              body: { content: body },
              time: { content: time },
              unread: un ? undefined : { enabled: false },
            },
          ),
        ),
      ),
    },
  )
const profileMenu = (m) =>
  A('Admin/Profile Menu', { name: 'Profile menu', ...(m ? { width: 'fill_container' } : {}) })
const palette = () =>
  A(
    'Admin/Palette',
    { name: 'Command palette' },
    {
      query: { content: 'the' },
      list: L({ name: 'List', layout: 'vertical', gap: 2, width: 'fill_container' }, [
        Tx('Eyebrow', 'ACTIONS', { name: 'Group' }),
        A('Admin/Palette Item Selected', { name: 'Switch theme' }),
        Tx('Eyebrow', 'NAVIGATION', { name: 'Group' }),
        A(
          'Admin/Palette Item',
          { name: 'Notifications' },
          { icon: { icon: 'bell' }, label: { content: 'Notifications' } },
        ),
        A(
          'Admin/Palette Item',
          { name: 'Audit log' },
          { icon: { icon: 'scroll-text' }, label: { content: 'Audit log' } },
        ),
      ]),
    },
  )

/* ---------- analysis: data, then each tile's panel ---------- */
const rnd = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let x = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x
  return ((x ^ (x >>> 14)) >>> 0) / 4294967296
}
const gen = (seed, n, base, { trend = 0.1, noise = 0.08, weekly = 0.12 } = {}) => {
  const r = rnd(seed * 97 + n)
  return Array.from({ length: n }, (_, i) => {
    const w = (i + 3) % 7 >= 5 ? 1 + weekly : 1 - weekly / 3
    return Math.max(0, Math.round(base * (1 + (trend * i) / n) * w * (1 + (r() - 0.5) * noise * 2)))
  })
}
const sum = (a) => a.reduce((x, y) => x + y, 0)
const compact = (n) =>
  new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
const fmt = (n) => n.toLocaleString('en-US')
const dates = (n) => Array.from({ length: n }, (_, i) => new Date(2026, 9, 20 - (n - 1 - i)))
const dfmt = (d) => new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short' }).format(d)
/* columns of a month are narrow: they carry the day only */
const dayOnly = (l) => l.replace(/^[A-Za-z]+ /, '')
const LH = 240
/** Line chart: series k = 0 (primary area), 1 (blue line), 2 (muted line), sharing one plot. */
function lineChart(w, labels, series, f = compact, o = {}) {
  const all = series.flatMap((s) => s.values)
  const lo = o.y0 === false ? Math.min(...all) * 0.92 : 0
  const hi = Math.max(...all) * 1.08
  const n = labels.length
  const X = (i) => (n === 1 ? w / 2 : (i / (n - 1)) * w)
  const Y = (v) => LH - ((v - lo) / (hi - lo || 1)) * LH
  const geometry = (vals) =>
    `${vals.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ')} L${w + 20} ${Y(vals.at(-1)).toFixed(1)} L${w + 20} ${LH + 20} L0 ${LH + 20} Z`
  const parts = { plot: { width: w } }
  for (const k of [0, 1, 2]) {
    const s = series.find((x) => x.k === k)
    parts[`s${k}`] = s
      ? {
          width: w + 20,
          height: LH + 20,
          viewBox: [0, 0, w + 20, LH + 20],
          geometry: geometry(s.values),
        }
      : { enabled: false }
  }
  for (const k of [0, 1, 2, 3, 4])
    parts[`y${k}`] = { content: f(Math.round(lo + ((hi - lo) * k) / 4)) }
  for (let k = 0; k < 7; k++) parts[`x${k}`] = { content: labels[Math.round((k * (n - 1)) / 6)] }
  return A('Admin/Chart/Line', { name: 'Line chart' }, parts)
}
/** Stacked columns: stacks map a segment slot (1–5, the chart colours) to values. */
function columns(labels, stacks, height = 220) {
  const n = labels.length
  const totals = labels.map((_, i) => sum(Object.values(stacks).map((v) => v[i])))
  const max = Math.max(...totals) * 1.1
  const step = Math.ceil(n / 7)
  return Row(
    { name: 'Columns', width: 'fill_container', height, gap: n > 10 ? 3 : 10, alignItems: 'end' },
    labels.map((l, i) => {
      const parts = {
        label: {
          content:
            i === n - 1 || (i % step === 0 && n - 1 - i >= step / 2)
              ? n > 10
                ? dayOnly(l)
                : l
              : ' ',
        },
      }
      for (const k of [1, 2, 3, 4, 5])
        parts[`s${k}`] = {
          height: stacks[k] ? Math.round((stacks[k][i] / max) * (height - 26)) : 0,
        }
      return A('Admin/Chart/Column', { name: `Column / ${l}`, height: 'fill_container' }, parts)
    }),
  )
}
const donut = (parts, total) => {
  const sumv = sum(parts.map((p) => p[1]))
  let acc = 0
  const colors = []
  for (const [, v, c] of parts) {
    colors.push({ color: c, position: acc / sumv })
    acc += v
    colors.push({ color: c, position: acc / sumv })
  }
  return [
    Row({ name: 'Donut Row', width: 'fill_container', justifyContent: 'center' }, [
      A(
        'Admin/Chart/Donut',
        { name: 'Donut', fill: { type: 'gradient', gradientType: 'angular', colors } },
        { total: { content: total } },
      ),
    ]),
    Col(
      { name: 'Legend', width: 'fill_container', gap: 8 },
      parts.map(([l, v, , tone]) =>
        Legend(tone, l, `${((v / sumv) * 100).toFixed(v / sumv < 0.1 ? 1 : 0)}%`),
      ),
    ),
  ]
}
const meters = (rows, width, fmtV = (v) => `${v}%`) =>
  rows.map(([l, v, k, max = 100]) => Meter(k, l, fmtV(v), Math.round((v / max) * width)))
const chip = ([tone, l]) =>
  A(`Admin/Legend Chip/${tone}`, { name: `Legend / ${l}` }, { label: { content: l } })
const legendChips = (list, m) =>
  m && list.length > 3
    ? Col({ name: 'Legend', gap: 6 }, [
        Row({ gap: 6 }, list.slice(0, 3).map(chip)),
        Row({ gap: 6 }, list.slice(3).map(chip)),
      ])
    : Row({ name: 'Legend', gap: 6 }, list.map(chip))
const Card = (title, nodes, o = {}) =>
  A(
    'Admin/Card',
    { name: `Card / ${title}`, width: 'fill_container', ...o },
    {
      title: { content: title },
      content: L(
        { name: 'Content', layout: 'vertical', gap: 10, width: 'fill_container' },
        nodes.flat().filter(Boolean),
      ),
    },
  )
const Stat = (label, value, delta, bad) =>
  A(
    delta === null ? 'Admin/Stat/Plain' : bad ? 'Admin/Stat/Bad' : 'Admin/Stat/Good',
    { name: `Stat / ${label}` },
    {
      label: { content: label },
      value: { content: value },
      ...(delta === null
        ? {}
        : { delta: { content: `${delta >= 0 ? '▲' : '▼'} ${Math.abs(delta).toFixed(1)}%` } }),
    },
  )
const heatmap = (m) => {
  const r = rnd(42)
  return Col(
    { name: 'Heatmap', width: 'fill_container', gap: 3 },
    DAYS.map((d, di) =>
      Row({ name: `Row / ${d}`, width: 'fill_container', gap: 3 }, [
        Tx('Caption', d, { width: 30, textGrowth: 'fixed-width' }),
        ...Array.from({ length: m ? 12 : 24 }, (_, j) => {
          const h = m ? j * 2 : j
          const v = Math.min(
            1,
            (0.15 +
              0.85 * Math.exp(-((h - (di >= 5 ? 22 : 20)) ** 2) / 18) +
              0.25 * Math.exp(-((h - 8) ** 2) / 6)) *
              (0.8 + r() * 0.35),
          )
          return A('Admin/Chart/Heat Cell', {
            name: `${d} ${h}:00`,
            opacity: +(0.12 + v * 0.88).toFixed(2),
          })
        }),
      ]),
    ),
  )
}
const table = (allCols, allRows, m) => {
  /* phones keep the item and the last two columns */
  const keep = (r) => (m && r.length > 3 ? [r[0], ...r.slice(-2)] : r)
  const cols = keep(allCols),
    rows = allRows.map(keep)
  const cw = m ? 96 : 120
  return [
    A('Admin/Table/Head', W, {
      cells: L(
        { name: 'Cells', gap: 12, width: 'fill_container' },
        cols.map((c, i) =>
          Tx(
            'Caption',
            c,
            i
              ? { width: cw, textGrowth: 'fixed-width' }
              : { width: 'fill_container', textGrowth: 'fixed-width' },
          ),
        ),
      ),
    }),
    ...rows.map((r) =>
      A('Admin/Table/Row', W, {
        cells: L(
          { name: 'Cells', gap: 12, alignItems: 'center', width: 'fill_container' },
          r.map((c, i) =>
            typeof c === 'string'
              ? Tx(
                  'Body',
                  c,
                  i
                    ? { width: cw, textGrowth: 'fixed-width' }
                    : { width: 'fill_container', textGrowth: 'fixed-width' },
                )
              : L({ name: 'Cell', width: cw }, [c]),
          ),
        ),
      }),
    ),
  ]
}
/* getters: tokens resolve when used, after run-admin has switched the library alias to `admin` */
const G = {
  get P() {
    return C.chart1
  },
  get B() {
    return C.chart2
  },
  get Gr() {
    return C.chart3
  },
  get Wa() {
    return C.chart4
  },
  get E() {
    return C.chart5
  },
  get M() {
    return C.magenta500
  },
  get Mu() {
    return C.mutedForeground
  },
}
/** One analysis, at a chart width (desktop panel ≈ 700, phone sheet ≈ 270). */
function analysis(key, m) {
  const n = key === 'reports' ? 30 : 7
  const labels = dates(n).map(dfmt)
  const cw = m ? 270 : 700,
    mw = m ? 290 : 344
  switch (key) {
    case 'listens': {
      const cur = gen(1, n, 240000, { trend: 0.18 }),
        prev = gen(2, n, 215000)
      const peak = cur.indexOf(Math.max(...cur))
      return {
        icon: 'audio-waveform',
        title: 'Listens per day',
        sub: `${compact(sum(cur))} listens`,
        stats: [
          Stat('Total listens', compact(sum(cur)), 18.9),
          Stat('Daily average', compact(sum(cur) / n), 18.9),
          Stat('Peak day', `${compact(cur[peak])} · ${labels[peak]}`, null),
          Stat('Unique listeners', '31.2K', 6.4),
        ],
        main: Card('Listens', [
          legendChips([
            ['Chart1', 'Listens'],
            ['Muted', 'Previous period'],
          ]),
          lineChart(cw, labels, [
            { k: 0, values: cur },
            { k: 2, values: prev },
          ]),
        ]),
        side: Card(
          'By platform',
          donut(
            [
              ['Web', 46, G.P, 'Primary'],
              ['Mobile', 41, G.B, 'Blue'],
              ['Desktop', 13, G.M, 'Magenta'],
            ],
            compact(sum(cur)),
          ),
        ),
        extra: [
          Card('Listening by hour', [heatmap(m)]),
          Card(
            'Top genres',
            meters(
              [
                ['Electronic', 31, 1],
                ['Indie', 24, 2],
                ['Hip-hop', 19, 5],
                ['Ambient', 14, 3],
                ['Jazz', 7, 4],
              ],
              mw,
            ),
          ),
        ],
      }
    }
    case 'listeners': {
      const daily = gen(3, n, 60, { trend: 0.2, noise: 0.25 })
      let tot = 48920 - sum(daily)
      const total = daily.map((d) => (tot += d))
      const dau = total.map((v, i) => Math.round(v * (0.27 + 0.03 * Math.sin(i / 2))))
      return {
        icon: 'users-round',
        title: 'Listeners',
        sub: `48,920 · +${sum(daily)}`,
        stats: [
          Stat('Total listeners', '48,920', 3.2),
          Stat('New sign-ups', fmt(sum(daily)), 8.1),
          Stat('Churned', fmt(Math.round(sum(daily) * 0.18)), -2.4),
          Stat('DAU / MAU', '31.6%', 1.2),
        ],
        main: Card('Total listeners', [
          legendChips([
            ['Chart1', 'Total listeners'],
            ['Chart2', 'Active (DAU)'],
          ]),
          lineChart(cw, labels, [
            { k: 0, values: total },
            { k: 1, values: dau },
          ]),
        ]),
        side: Card(
          'Retention',
          meters(
            [
              ['Day 1', 62, 1],
              ['Day 7', 38, 2],
              ['Day 30', 21, 5],
            ],
            mw,
          ),
        ),
        extra: [
          Card(
            'Top countries',
            meters(
              [
                ['Ukraine', 34, 1],
                ['Poland', 18, 2],
                ['Germany', 14, 5],
                ['USA', 11, 3],
                ['Other', 23, 4],
              ],
              m ? mw : 640,
            ),
          ),
          Card('New sign-ups', [columns(labels, { 1: daily }, 180)]),
        ],
      }
    }
    case 'artists': {
      const daily = gen(4, n, 6, { trend: 0.3, noise: 0.5 })
      let tot = 2316 - sum(daily)
      const total = daily.map((d) => (tot += d))
      return {
        icon: 'mic-vocal',
        title: 'Artists',
        sub: '2,316 · 61% verified',
        stats: [
          Stat('Total artists', '2,316', 1.4),
          Stat('New artists', fmt(sum(daily)), 12.5),
          Stat('Verified', '61%', 2.1),
          Stat('Pending verification', '38', -9.5),
        ],
        main: Card('Total artists', [
          legendChips([
            ['Chart1', 'Total artists'],
            ['Chart2', 'Verified'],
          ]),
          lineChart(
            cw,
            labels,
            [
              { k: 0, values: total },
              { k: 1, values: total.map((v) => Math.round(v * 0.61)) },
            ],
            compact,
            { y0: false },
          ),
        ]),
        side: Card(
          'Verification funnel',
          meters(
            [
              ['Submitted', 112, 1, 112],
              ['In review', 74, 2, 112],
              ['Verified', 68, 3, 112],
            ],
            mw,
            String,
          ),
        ),
        extra: [
          Card(
            'Newest artists',
            table(
              ['Artist', 'Status', 'Age'],
              [
                ['Kite Harbor', Pill('Up', 'Verified'), '1 h'],
                ['Lumen Choir', Pill('Flat', 'In review'), '5 h'],
                ['Mira Sol', Pill('Up', 'Verified'), '1 d'],
                ['Nova & the Static', Pill('Flat', 'Submitted'), '2 d'],
              ],
              m,
            ),
          ),
        ],
      }
    }
    case 'needs': {
      const filed = gen(5, n, 19, { noise: 0.4 }),
        resolved = filed.map((v, i) => Math.max(0, v - 2 + ((i * 7) % 5)))
      return {
        icon: 'inbox',
        title: 'Needs action',
        sub: '27 open items',
        stats: [
          Stat('Open items', '27', 4.2, true),
          Stat('Median time to resolve', '3.4 h', -11.8),
          Stat('Oldest item', '2 d', null),
          Stat('SLA met', '94.2%', 1.6),
        ],
        main: Card('Filed and resolved', [
          legendChips([
            ['Chart4', 'Filed'],
            ['Chart3', 'Resolved'],
          ]),
          columns(labels, { 3: resolved, 4: filed }),
        ]),
        side: Card(
          'Queue by reason',
          donut(
            [
              ['Copyright', 38, G.P, 'Primary'],
              ['Spam', 24, G.B, 'Blue'],
              ['Hate speech', 14, G.E, 'Error'],
              ['Explicit content', 12, G.Wa, 'Warning'],
              ['Other', 12, G.Mu, 'Muted'],
            ],
            '27',
          ),
        ),
        extra: [
          Card(
            'Oldest items',
            table(
              ['Item', 'Type', 'Age', 'Status'],
              [
                ['Afterglow', 'Release', '2 d', Pill('Flat', 'Review')],
                ['Glass Horizon', 'Track', '6 h', Pill('Down', 'Open')],
                ['@driftwave', 'Listener', '5 h', Pill('Down', 'Open')],
                ['Late Signal Radio #41', 'Episode', '4 h', Pill('Flat', 'Review')],
              ],
              m,
            ),
          ),
        ],
      }
    }
    case 'pipeline': {
      const p50 = gen(6, n, 42, { trend: -0.1, noise: 0.15 }).map((v) => v / 10),
        p95 = p50.map((v, i) => +(v * (2.6 + 0.4 * Math.sin(i))).toFixed(1))
      const ready = gen(7, n, 180, { noise: 0.2 }),
        failed = ready.map((v, i) => Math.round(v * (0.006 + 0.004 * ((i * 3) % 4))))
      return {
        icon: 'audio-lines',
        title: 'Track pipeline',
        sub: `${fmt(sum(ready))} processed · 99.4%`,
        stats: [
          Stat('Processed', fmt(sum(ready)), 7.3),
          Stat('Success rate', '99.4%', 0.3),
          Stat('p50 time', `${p50.at(-1).toFixed(1)} min`, -8.2),
          Stat('p95 time', `${p95.at(-1).toFixed(1)} min`, -4.1),
        ],
        main: Card('Processing time', [
          legendChips([
            ['Chart1', 'p50 time'],
            ['Chart2', 'p95 time'],
          ]),
          lineChart(
            cw,
            labels,
            [
              { k: 0, values: p50 },
              { k: 1, values: p95 },
            ],
            (v) => `${v} min`,
          ),
        ]),
        side: Card(
          'Failures by reason',
          meters(
            [
              ['Corrupt audio', 41, 5],
              ['Unsupported codec', 27, 4],
              ['Timeout', 19, 2],
              ['Loudness check', 13, 1],
            ],
            mw,
          ),
        ),
        extra: [
          Card('Outcome per day', [
            legendChips([
              ['Chart3', 'Ready'],
              ['Chart5', 'Failed'],
            ]),
            columns(labels, { 3: ready, 5: failed }, 180),
          ]),
        ],
      }
    }
    case 'reports': {
      const types = [
        ['Tracks', 9],
        ['Listeners', 4.5],
        ['Playlists', 3],
        ['Episodes', 1.5],
        ['Albums', 1],
      ]
      const stacks = Object.fromEntries(
        types.map(([, b], k) => [k + 1, gen(10 + k, n, b, { noise: 0.5 })]),
      )
      const total = sum(Object.values(stacks).flat())
      return {
        icon: 'flag',
        title: 'Reports by type',
        sub: `${total} filed`,
        range: '30d',
        stats: [
          Stat('Filed', fmt(total), 6.8, true),
          Stat('Resolved', fmt(Math.round(total * 0.71)), 9.4),
          Stat('Dismissed', fmt(Math.round(total * 0.22)), -3.1, true),
          Stat('Avg resolution', '4.1 h', -12.6),
        ],
        main: Card('Reports by type', [
          legendChips(
            types.map(([l], k) => [`Chart${k + 1}`, l]),
            m,
          ),
          columns(labels, stacks),
        ]),
        side: Card(
          'Share by type',
          donut(
            types.map(([l], k) => [
              l,
              sum(stacks[k + 1]),
              [G.P, G.B, G.Gr, G.Wa, G.E][k],
              ['Primary', 'Blue', 'Success', 'Warning', 'Error'][k],
            ]),
            String(total),
          ),
        ),
        extra: [
          Card(
            'Resolution rate by type',
            meters(
              [
                ['Tracks', 78, 1],
                ['Listeners', 69, 2],
                ['Playlists', 74, 3],
                ['Episodes', 61, 4],
                ['Albums', 83, 5],
              ],
              m ? mw : 1090,
            ),
          ),
        ],
      }
    }
    case 'accounts': {
      const su = gen(20, n, 160, { trend: 0.15 }),
        up = gen(21, n, 420, { trend: 0.2 }),
        de = gen(22, n, 2, { noise: 0.8 })
      return {
        icon: 'user-plus',
        title: 'Accounts',
        sub: `${fmt(sum(su))} sign-ups · ${fmt(sum(up))} uploads`,
        stats: [
          Stat('Sign-ups', fmt(sum(su)), 11.2),
          Stat('Uploads', fmt(sum(up)), 14.6),
          Stat('Deactivations', fmt(sum(de)), -18.4),
          Stat('Listener → artist', '2.8%', 0.4),
        ],
        main: Card('Accounts', [
          legendChips([
            ['Chart1', 'Uploads'],
            ['Chart2', 'Sign-ups'],
            ['Muted', 'Deactivations'],
          ]),
          lineChart(cw, labels, [
            { k: 0, values: up },
            { k: 1, values: su },
            { k: 2, values: de },
          ]),
        ]),
        side: Card(
          'Sign-up sources',
          meters(
            [
              ['Email', 44, 1],
              ['Google', 38, 2],
              ['Apple', 18, 4],
            ],
            mw,
          ),
        ),
        extra: [
          Card(
            'Deactivation reasons',
            meters(
              [
                ['Self-deleted', 57, 4],
                ['Policy', 21, 5],
                ['Inactive', 14, 2],
                ['Duplicate', 8, 1],
              ],
              m ? mw : 1090,
            ),
          ),
        ],
      }
    }
    default: {
      const acts = gen(30, n, 46, { noise: 0.35 })
      return {
        icon: 'scroll-text',
        title: 'Audit log',
        sub: `${fmt(sum(acts))} actions`,
        stats: [
          Stat('Actions', fmt(sum(acts)), 5.5),
          Stat('Active staff', '9', 12.5),
          Stat('Take-downs', fmt(Math.round(sum(acts) * 0.08)), -6.2),
          Stat('Role changes', '3', null),
        ],
        main: Card('Actions', [columns(labels, { 1: acts })]),
        side: Card(
          'By action',
          donut(
            [
              ['Approvals', 34, G.Gr, 'Success'],
              ['Verifications', 22, G.P, 'Primary'],
              ['Take-downs', 8, G.E, 'Error'],
              ['Role changes', 2, G.Wa, 'Warning'],
              ['Other', 34, G.Mu, 'Muted'],
            ],
            fmt(sum(acts)),
          ),
        ),
        extra: [
          Card(
            'Staff activity',
            table(
              ['Staff', 'Actions', 'Role'],
              [
                ['mara.ops', fmt(Math.round(sum(acts) * 0.38)), Pill('Up', 'Super admin')],
                ['leo.mod', fmt(Math.round(sum(acts) * 0.27)), Pill('Flat', 'Moderator')],
                ['sam.ops', fmt(Math.round(sum(acts) * 0.19)), Pill('Flat', 'Operations')],
                ['root', fmt(Math.round(sum(acts) * 0.04)), Pill('Flat', 'System')],
              ],
              m,
            ),
          ),
        ],
      }
    }
  }
}
function analysisBody(d, m) {
  if (m)
    return [
      Row({ name: 'Stats 1', width: 'fill_container', gap: 8 }, d.stats.slice(0, 2)),
      Row({ name: 'Stats 2', width: 'fill_container', gap: 8 }, d.stats.slice(2)),
      d.main,
      d.side,
      ...d.extra,
    ]
  return [
    Row({ name: 'Stats', width: 'fill_container', gap: 12 }, d.stats),
    Row({ name: 'Main', width: 'fill_container', gap: 14, alignItems: 'start' }, [
      d.main,
      L({ name: 'Side', width: 380 }, [d.side]),
    ]),
    Row(
      { name: 'Extra', width: 'fill_container', gap: 14, alignItems: 'start' },
      d.extra.length > 1 ? [d.extra[0], L({ name: 'Side', width: 380 }, [d.extra[1]])] : d.extra,
    ),
  ]
}
/* the phone sheet scrolls; the frame shows its whole length */
const SHEET_H = {
  needs: 1440,
  listeners: 1470,
  artists: 1290,
  listens: 1570,
  pipeline: 1290,
  reports: 1400,
  accounts: 1180,
  audit: 1390,
}
const KEYS = [
  ['needs', 'Needs action'],
  ['listeners', 'Listeners'],
  ['artists', 'Artists'],
  ['listens', 'Listens per day'],
  ['pipeline', 'Track pipeline'],
  ['reports', 'Reports by type'],
  ['accounts', 'Accounts'],
  ['audit', 'Audit log'],
]
function analysisFrame(key, label, m) {
  const d = analysis(key, m)
  const parts = {
    icon: { icon: d.icon },
    title: { content: d.title },
    sub: { content: d.sub },
    'range.segments': L(
      { name: 'Segments', gap: 0 },
      ['7d', '30d', '90d'].map((x) =>
        A(
          x === (d.range ?? '7d') ? 'Segment/On' : 'Segment/Off',
          { name: x },
          { label: { content: x } },
        ),
      ),
    ),
    body: L(
      { name: 'Body', layout: 'vertical', gap: m ? 10 : 14, width: 'fill_container' },
      analysisBody(d, m),
    ),
  }
  if (m)
    return frame(
      `Analysis · ${label}`,
      390,
      SHEET_H[key] + 64,
      [
        A('Status Bar', { name: 'Status Bar' }),
        L({ name: 'Peek', width: 'fill_container', height: 17 }),
        A('Admin/Analysis/Sheet', { name: 'Analysis', height: SHEET_H[key] }, parts),
      ],
      0.55,
    )
  return frame(
    `Analysis · ${label}`,
    1440,
    1120,
    L(
      {
        name: 'Stage',
        layout: 'vertical',
        ...FILL,
        justifyContent: 'center',
        alignItems: 'center',
      },
      [A('Admin/Analysis/Panel', { name: 'Analysis', height: 1000 }, parts)],
    ),
    0.55,
  )
}

/* ---------- interaction notes (the prototype shows the motion) ---------- */
const NOTES = [
  [
    'Tile → analysis',
    'A tile grows into the analysis panel from its own position (520 ms, ease-out); on phones it rises as a sheet. ← / → step between analyses, Esc or the scrim closes and the panel shrinks back into its tile.',
  ],
  [
    'Chart hover',
    'A crosshair follows the nearest day with a point on each series and a tooltip listing their values; legend chips hide or show a series, Compare adds the previous period.',
  ],
  [
    'Status island',
    'The island’s pocket opens for a status — Updating figures with a progress bar, Up to date, a new report, Saved, Test sent — and folds back after a few seconds. While it is open the search narrows instead of being covered.',
  ],
  [
    'Live reports',
    'About every nine seconds a report arrives: the island announces it, it slides into Latest reports and the Moderation count rises.',
  ],
  [
    'Loading',
    'Tiles load one by one; each shows a skeleton shaped like its content. Figures count up and bars grow when the data lands.',
  ],
  [
    'Glass and aurora',
    'Tiles are glass over a slow aurora of the brand colours (26–32 s drift); reduced motion stops the drift and every transition.',
  ],
  [
    'Profile menu',
    'The avatar (island on desktop, top bar on phones) opens the profile menu under it: who is signed in and their role, notification settings, language and theme with their current values, and sign out. Language and theme change in place while the menu stays open; the bell, Escape or a click outside closes it.',
  ],
  [
    'Phone',
    'One column; the top bar shows only the logo and the avatar. Every action lives once, in the bottom island tab bar: Overview, Search, Alerts and Menu. The bell opens notifications above the tab bar; its footer leads to notification settings, where the bell tab stays active.',
  ],
]
const notesFrame = () =>
  frame(
    'Interaction notes',
    1440,
    1010,
    Col({ name: 'Notes', width: 'fill_container', gap: 16, padding: 64 }, [
      Tx('H1', 'Interaction notes'),
      Tx(
        'Muted',
        'Static frames cannot move; this is what the prototype animates. Prototype: pencil/web-admin-design/prototype/admin-bento-prototype.html.',
      ),
      ...NOTES.map(([title, body]) =>
        A(
          'Admin/Motion Note',
          { name: `Note / ${title}`, width: 'fill_container' },
          { title: { content: title }, body: { content: body } },
        ),
      ),
    ]),
  )

/* ---------- states ---------- */
const D = (label, build, opts) => () => Shell(label, build(false), opts)
const M = (label, build, h, opts) => () => MShell(label, build(true), h, opts)
const pair = (label, build, { opts, mh, mopts } = {}) =>
  state(label, D(label, build, opts), M(label, build, mh, { ...opts, ...mopts }))

export const adminPages = {
  overview: {
    title: 'Admin / Overview',
    route: '/ (requireStaffSession + overview:read)',
    context:
      'Operations centre for staff, drawn after the admin prototype: glass bento tiles over the aurora — what needs action first, then KPIs, listens, the track pipeline, reports by type, accounts and the audit trail. Every tile opens its analysis. The sidebar footer switches the language (English ↔ Українська), cycles the theme (Dark → Light → Dim) and collapses the panel to a rail. Not-found is not drawn: unknown admin routes redirect to /. Overlays (bell, profile menu, command palette, menu) are drawn in the flow under the top bar; the prototype shows them floating.',
    desktop: (theme) => Shell('Overview', overview(false), { theme }),
    mobile: () => MShell('Overview', overview(true), 2915),
    extra: [['Interaction notes', notesFrame]],
    states: [
      state(
        'Sidebar collapsed',
        () => Shell('Sidebar collapsed', overview(false, { collapsed: true }), { collapsed: true }),
        null,
        'phones have no side panel; the menu tab opens it as a sheet (see Menu open)',
      ),
      state(
        'Menu open',
        null,
        () => MShell('Menu open', [Menu('overview')], 1070),
        'the desktop panel is always on screen; it collapses to a rail instead (see Sidebar collapsed)',
      ),
      pair('Українська', (m) => ukrainian(overview(m)), { opts: { uk: true }, mh: 2965 }),
      pair(
        'Loading',
        (m) =>
          overview(m, {
            loading: ALL,
            head: { title: 'Loading overview…', accent: null, sub: 'Fetching queues and figures.' },
          }),
        { mh: 2860 },
      ),
      pair(
        'Loading · per tile',
        (m) =>
          overview(m, {
            loading: ['listens', 'reports', 'accounts'],
            head: { sub: 'Queues are ready; figures are still arriving.' },
          }),
        { mh: 2915 },
      ),
      pair(
        'Refreshing',
        (m) =>
          overview(m, {
            updating: true,
            head: {
              updating: true,
              sub: 'Updating figures. Everything stays usable while it refreshes.',
            },
          }),
        { opts: { pocket: { icon: 'refresh-cw', text: 'Updating…', bar: true } }, mh: 2915 },
      ),
      pair(
        'Empty',
        (m) =>
          overview(m, {
            empty: true,
            head: {
              title: 'Welcome to Bitrate Admin',
              accent: null,
              sub: 'A fresh environment: figures appear as listeners, artists and uploads arrive.',
            },
          }),
        { mh: 2360 },
      ),
      pair(
        'Partial error',
        (m) =>
          overview(m, {
            seriesError: true,
            head: { sub: 'Some figures are unavailable. Queues are up to date.' },
          }),
        { mh: 2855 },
      ),
      pair('Load error', errorPage, { mh: 1180 }),
      pair(
        'Restricted role',
        (m) =>
          overview(m, {
            locked: true,
            head: { accent: 'Leo', sub: 'Moderator view: tiles outside your role stay locked.' },
          }),
        { opts: { hide: MODERATOR_HIDE }, mh: 2905 },
      ),
      pair('Offline', (m) => overview(m, { banner: offlineBanner() }), {
        opts: {
          height: 1200,
          pocket: { icon: 'wifi-off', text: 'Offline · 09:42', tone: 'warning' },
        },
        mh: 3025,
      }),
      pair(
        'Notifications open',
        (m) =>
          m
            ? [...header(true), popover(true)]
            : [
                Row({ name: 'Top', width: 'fill_container', gap: 16, alignItems: 'start' }, [
                  header(false),
                  popover(false),
                ]),
                ...grid(false, tiles(false)),
              ],
        { opts: { height: 1500 }, mh: 1165 },
      ),
      pair(
        'Profile menu',
        (m) =>
          m
            ? [profileMenu(true), ...header(true)]
            : [
                Row({ name: 'Top', width: 'fill_container', gap: 16, alignItems: 'start' }, [
                  header(false),
                  profileMenu(false),
                ]),
                ...grid(false, tiles(false)),
              ],
        { opts: { height: 1500 }, mh: 844 },
      ),
      state(
        'Command palette',
        () =>
          Shell(
            'Command palette',
            [
              Row({ name: 'Palette Row', width: 'fill_container', justifyContent: 'center' }, [
                palette(),
              ]),
              ...overview(false),
            ],
            { height: 1450 },
          ),
        null,
        'phones open search full-screen from the tab bar; the palette is the desktop presentation',
      ),
      ...KEYS.map(([key, label]) =>
        state(
          `Analysis · ${label}`,
          () => analysisFrame(key, label, false),
          () => analysisFrame(key, label, true),
        ),
      ),
    ],
  },
  notifications: notificationsPage,
  ...resourcePages,
}
