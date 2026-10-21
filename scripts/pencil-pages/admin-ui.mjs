// Admin-console screen helpers: instances of the admin library (`admin`, registry-admin.json), the aurora
// page background, the desktop and phone shells, and the Ukrainian copy. Screens hold library instances,
// layout-only frames and content overrides only.
import { readFileSync } from 'node:fs'
import { C, id, Ref } from './kit.mjs'
import { L } from './ui.mjs'

const areg = JSON.parse(readFileSync(new URL('./registry-admin.json', import.meta.url), 'utf8'))
/** Instance of an admin-library component by name; `parts` overrides its named parts. */
export const A = (name, o = {}, parts = {}) => {
  const c = areg[name]
  if (!c) throw new Error(`no admin component "${name}"`)
  const desc = {}
  for (const [p, v] of Object.entries(parts)) {
    if (v === undefined) continue
    const pid = c.parts[p]
    if (!pid) throw new Error(`admin component "${name}" has no part "${p}"`)
    if (pid === c.id) Object.assign(o, v)
    else desc[pid] = v
  }
  return Ref(c.id, { name: o.name ?? name, ...o }, Object.keys(desc).length ? desc : undefined)
}
export const Tx = (style, content, o = {}) => A(`Text/${style}`, { ...o, content })
export const Btn = (variant, label, icon) =>
  A(
    `Button/${variant}`,
    { name: `Button / ${label}` },
    { label: { content: label }, icon: icon ? { icon } : { enabled: false } },
  )
export const IconBtn = (icon, v = 'Glass') =>
  A(`Button/Icon ${v}`, { name: `Icon / ${icon}` }, { icon: { icon } })
export const Pill = (v, label, icon) =>
  A(
    `Pill/${v}`,
    { name: `Pill / ${label}` },
    { label: { content: label }, icon: icon ? { icon } : { enabled: false } },
  )
/** A segmented control with `active` as the selected option. */
export const Seg = (opts, active, o = {}) =>
  A(
    'Segmented',
    { name: 'Segmented', ...o },
    {
      segments: L(
        { name: 'Segments', gap: 0 },
        opts.map((x) =>
          A(
            x === active ? 'Segment/On' : 'Segment/Off',
            { name: `Segment / ${x}` },
            { label: { content: x } },
          ),
        ),
      ),
    },
  )

/* ---------- the page background: the aurora is layers of the page frame's own fill ---------- */
const CLEAR = { primary: '#7C3AED00', blue: '#3B82F600', magenta: '#EC489900' }
const blob = (color, clear, x, y, w, h, opacity) => ({
  type: 'gradient',
  gradientType: 'radial',
  center: { x, y },
  size: { width: w, height: h },
  opacity,
  colors: [
    { color, position: 0 },
    { color: clear, position: 1 },
  ],
})
export const aurora = (scrim = 0) => [
  C.background,
  blob(C.primary, CLEAR.primary, 0.18, 0.02, 1.0, 0.55, 0.5),
  blob(C.blue500, CLEAR.blue, 0.95, 1.0, 1.1, 0.75, 0.42),
  blob(C.magenta500, CLEAR.magenta, 0.62, 0.5, 0.6, 0.45, 0.28),
  ...(scrim
    ? [
        {
          type: 'gradient',
          gradientType: 'linear',
          opacity: scrim,
          colors: [
            { color: C.background, position: 0 },
            { color: C.background, position: 1 },
          ],
        },
      ]
    : []),
]
export const frame = (name, w, h, child, scrim = 0) => ({
  type: 'frame',
  id: id(),
  name,
  width: w,
  height: h,
  clip: true,
  layout: 'vertical',
  fill: aurora(scrim),
  children: [child].flat(),
})

/* ---------- Ukrainian copy ---------- */
export const UK = {
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
  Notifications: 'Сповіщення',
  OPERATIONS: 'ОПЕРАЦІЇ',
  ACCOUNTS: 'АКАУНТИ',
  SYSTEM: 'СИСТЕМА',
  SETTINGS: 'НАЛАШТУВАННЯ',
  Dark: 'Темна',
  Light: 'Світла',
  Dim: 'Приглушена',
  Collapse: 'Згорнути',
  English: 'Українська',
  Operators: 'Оператори',
  'Search or jump to…': 'Пошук або перехід…',
  'OVERVIEW · TUE, OCT 20': 'ОГЛЯД · ВТ, 20 ЖОВТ.',
  'Good morning,': 'Доброго ранку,',
  'What needs attention across Bitrate today.': 'Що сьогодні потребує уваги в Bitrate.',
  '7d': '7 дн',
  '30d': '30 дн',
  '90d': '90 дн',
  'Needs action': 'Потребує дій',
  '27 items across three queues': '27 елементів у трьох чергах',
  'Open moderation': 'Відкрити модерацію',
  'Reports to review': 'Скарги на розгляд',
  '12 open · 4 in review · oldest 6 h': '12 відкритих · 4 на розгляді · найдавнішій 6 год',
  'Releases awaiting review': 'Релізи чекають перевірки',
  'Oldest submitted 2 days ago': 'Найдавніший надіслано 2 дні тому',
  'Tracks failed processing': 'Треки з помилкою обробки',
  '3 failed · 1 stuck for 42 min': '3 з помилкою · 1 завис на 42 хв',
  'LATEST REPORTS': 'ОСТАННІ СКАРГИ',
  'Track · Copyright claim · Glass Horizon': 'Трек · Авторські права · Glass Horizon',
  'Nova & the Static · 12 min': 'Nova & the Static · 12 хв',
  'User · Spam in playlist titles · @driftwave': 'Слухач · Спам у назвах плейлистів · @driftwave',
  'Listener · 38 min': 'Слухач · 38 хв',
  '412 new this week': '412 нових цього тижня',
  '38 waiting for verification': '38 чекають верифікації',
  'Listens per day': 'Прослуховування за день',
  '1.84M listens · +12% vs previous period':
    '1,84 млн прослуховувань · +12% до попереднього періоду',
  Mon: 'Пн',
  Tue: 'Вт',
  Wed: 'Ср',
  Thu: 'Чт',
  Fri: 'Пт',
  Sat: 'Сб',
  Sun: 'Нд',
  'Track pipeline': 'Обробка треків',
  'Last 24 h · 1,335 tracks': 'За 24 год · 1 335 треків',
  Ready: 'Готові',
  Processing: 'Обробляються',
  'Stuck > 30 min': 'Зависли > 30 хв',
  Failed: 'Помилка',
  'Open catalog': 'Відкрити каталог',
  'Reports by type': 'Скарги за типом',
  'Filed in 2 days · 38': 'Подано за 2 дні · 38',
  Tracks: 'Треки',
  Episodes: 'Епізоди',
  Accounts: 'Акаунти',
  'New accounts & uploads': 'Нові акаунти й завантаження',
  'New accounts': 'Нові акаунти',
  Uploads: 'Завантаження',
  Deactivated: 'Деактивовано',
  'Latest staff actions': 'Останні дії персоналу',
  'mara.ops approved release Afterglow': 'mara.ops: схвалено реліз Afterglow',
  'leo.mod dismissed a report on Low Orbit': 'leo.mod: відхилено скаргу на Low Orbit',
  'mara.ops verified artist Kite Harbor': 'mara.ops: верифіковано артиста Kite Harbor',
  '4 min': '4 хв',
  '18 min': '18 хв',
  '1 h': '1 год',
  'Open audit log': 'Відкрити журнал аудиту',
}
/** Every `content` the dictionary knows is swapped for its Ukrainian text, inside overrides too. */
export const ukrainian = (nodes) => {
  const walk = (n) => {
    if (!n || typeof n !== 'object') return
    if (typeof n.content === 'string' && UK[n.content]) n.content = UK[n.content]
    for (const v of Object.values(n)) if (v && typeof v === 'object') walk(v)
  }
  walk(nodes)
  return nodes
}

/* ---------- shells ---------- */
const THEME_ICON = { Dark: 'moon', Light: 'sun', Dim: 'contrast' }
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
  notifications: 'Notifications',
}
const NAV_ICON = { overview: 'layout-dashboard', notifications: 'bell' }
const PAGE_LABEL = { overview: 'Overview', notifications: 'Notifications' }
/** Overrides shared by the sidebar and the phone menu: the active page, theme, language, hidden items. */
const panel = ({ page = 'overview', theme = 'Dark', uk = false, rail = false, hide = [] } = {}) => {
  const active = rail
    ? A(
        'Admin/Rail Item Active',
        { name: `Nav / ${PAGE_LABEL[page]}` },
        { icon: { icon: NAV_ICON[page] } },
      )
    : A(
        'Admin/Nav Item Active',
        { name: `Nav / ${PAGE_LABEL[page]}` },
        {
          icon: { icon: NAV_ICON[page] },
          label: { content: PAGE_LABEL[page] },
          count: { enabled: false },
        },
      )
  const o = { [`nav_${page}`]: active, 'pref_theme.icon': { icon: THEME_ICON[theme] } }
  if (!rail) {
    o['pref_theme.label'] = { content: theme }
    if (uk) {
      o['pref_language.label'] = { content: 'English' }
      o['pref_collapse.label'] = { content: 'Collapse' }
      for (const g of ['operations', 'accounts', 'system', 'settings'])
        o[`groupText_${g}`] = { content: g.toUpperCase() }
      for (const [k, v] of Object.entries(NAV_LABEL))
        if (k !== page) o[`nav_${k}.label`] = { content: v }
    }
  }
  for (const k of hide) o[k] = { enabled: false }
  return o
}
/** The island: the page name, and a live pocket when it reports a status. */
const islandParts = (page, pocket, unread = true) => ({
  'island.crumb': { content: PAGE_LABEL[page] },
  ...(pocket
    ? {
        'island.pocket': { enabled: true },
        'island.pocketIcon': { icon: pocket.icon },
        'island.pocketText': { content: pocket.text },
        'island.pocketBar': pocket.bar ? undefined : { enabled: false },
        ...(pocket.tone
          ? {
              'island.pocketIconBox': { fill: TONE[pocket.tone][0] },
              'island.pocketIcon': { icon: pocket.icon, fill: TONE[pocket.tone][1] },
            }
          : {}),
      }
    : {}),
  ...(unread ? {} : { 'island.bell.badge': { enabled: false } }),
})
/* getters: tokens resolve when used, after the library alias is set */
export const TONE = {
  get success() {
    return [C.successSurface, C.successText]
  },
  get warning() {
    return [C.warningSurface, C.warningText]
  },
}
const content = (nodes, mobile) =>
  L(
    {
      name: 'Content',
      layout: 'vertical',
      gap: mobile ? 16 : 22,
      width: 'fill_container',
      height: 'fill_container',
      /* the override replaces the slot frame, so the phone slot's inset comes along */
      ...(mobile ? { padding: [18, 16, 0, 16], clip: true } : {}),
    },
    nodes.flat().filter(Boolean),
  )
/** Desktop page: floating glass sidebar, the top bar, content. */
export function Shell(
  name,
  nodes,
  {
    page = 'overview',
    height = 1100,
    theme = 'Dark',
    collapsed = false,
    uk = false,
    hide = [],
    pocket,
    unread = true,
    scrim = 0,
  } = {},
) {
  const shell = A(
    collapsed ? 'Admin/Shell/Desktop Collapsed' : 'Admin/Shell/Desktop',
    { width: 1440, height },
    {
      ...panel({ page, theme, uk, rail: collapsed, hide }),
      ...islandParts(page, pocket, unread),
      /* while the island reports a status, the search yields room instead of being covered */
      ...(pocket ? { search: { width: 260 } } : {}),
      ...(uk ? { 'search.placeholder': { content: 'Search or jump to…' } } : {}),
      content: content(nodes, false),
    },
  )
  return frame(name, 1440, height, uk ? ukrainian(shell) : shell, scrim)
}
/** Phone page: status bar, glass top bar (logo, avatar), content, the island tab bar. */
export function MShell(
  name,
  nodes,
  height = 2600,
  { page = 'overview', uk = false, unread = true } = {},
) {
  /* notification settings belong to the alerts tab: the bell's list leads there */
  const tab = page === 'overview' ? 'overview' : 'alerts'
  const tabs = {}
  for (const [k, icon] of [
    ['overview', 'layout-dashboard'],
    ['alerts', 'bell'],
  ])
    tabs[`tabs.tab_${k}`] = A(
      k === tab ? 'Admin/Tab/On' : 'Admin/Tab/Off',
      { name: `Tab / ${k}` },
      { icon: { icon }, badge: { enabled: k === 'alerts' && unread } },
    )
  const shell = A(
    'Admin/Shell/Mobile',
    { width: 390, height },
    {
      ...tabs,
      content: content(nodes, true),
    },
  )
  return frame(name, 390, height, uk ? ukrainian(shell) : shell)
}
/** The phone menu sheet with the active page. */
export const Menu = (page = 'overview') =>
  A('Admin/Mobile Menu', { name: 'Menu', width: 'fill_container' }, panel({ page }))
