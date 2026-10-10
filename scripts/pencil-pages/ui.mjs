// Screen-composition helpers: every visible element is an instance of a library component.
// Frames made here are layout-only (no fill / stroke / effect / radius); content is text and art.
import { readFileSync } from 'node:fs'
import {
  id,
  Ref,
  ART,
  img,
  C,
  Button,
  Input,
  Select,
  Switch,
  Badge,
  Tab,
  Otp,
  Progress,
  Alert,
} from './kit.mjs'

export { Button, Input, Select, Switch, Badge, Tab, Otp, Progress, Alert, ART, C }
const reg = JSON.parse(readFileSync(new URL('./registry.json', import.meta.url), 'utf8'))

/** Instance of a page block by name; `parts` overrides its named parts, `o` its root. */
export const R = (name, o = {}, parts = {}) => {
  const c = reg[name]
  if (!c) throw new Error(`no library block "${name}"`)
  const desc = {}
  for (const [p, v] of Object.entries(parts)) {
    if (v === undefined) continue
    const pid = c.parts[p]
    if (!pid) throw new Error(`block "${name}" has no part "${p}"`)
    if (pid === c.id) Object.assign(o, v)
    else desc[pid] = v
  }
  return Ref(c.id, { name: o.name ?? name, ...o }, Object.keys(desc).length ? desc : undefined)
}
/* layout-only containers */
const VISUAL = ['fill', 'stroke', 'strokeWidth', 'effect', 'cornerRadius']
export const L = (o = {}, children = []) => {
  for (const k of VISUAL) if (k in o) throw new Error(`layout frame "${o.name}" sets ${k}`)
  return {
    type: 'frame',
    id: id(),
    name: o.name ?? 'Layout',
    ...o,
    children: children.flat().filter(Boolean),
  }
}
export const Row = (o, ch) => L({ name: 'Row', gap: 12, alignItems: 'center', ...o }, ch)
export const Col = (o, ch) => L({ name: 'Column', layout: 'vertical', gap: 12, ...o }, ch)
export const Fill = (ch, o = {}) =>
  L(
    {
      name: 'Fill',
      width: 'fill_container',
      height: 'fill_container',
      justifyContent: 'center',
      alignItems: 'center',
      layout: 'vertical',
      ...o,
    },
    ch,
  )
export const Spacer = () => L({ name: 'Spacer', width: 'fill_container', height: 1 })

/* text, icons, media */
/** A text given a width (a table column, a wrapping paragraph) wraps inside it instead of ignoring it. */
const wrap = (o) =>
  o.wrap || o.width ? { textGrowth: 'fixed-width', width: o.width ?? 'fill_container' } : {}
export const Tx = (style, content, o = {}) => {
  const { wrap: _w, width: _x, ...rest } = o
  return R(`Text/${style}`, { ...wrap(o), ...rest, content })
}
export const Ic = (icon, tone = 'Muted', size = 20) =>
  R(`Icon/${tone}`, { icon, width: size, height: size })
export const Cover = (art, size = 48) =>
  R('Media/Cover', { width: size, height: size, fill: img(ART[art] ?? art) })
export const BigCover = (art, size = 200) =>
  R('Media/Cover Large', { width: size, height: size, fill: img(ART[art] ?? art) })
export const Avatar = (art, size = 40) =>
  R('Media/Avatar', { width: size, height: size, fill: img(ART[art] ?? art) })
export const Chip = (label, active) =>
  R(active ? 'Chip/Active' : 'Chip/Default', {}, { label: { content: label } })
export const Chips = (labels, active = 0) =>
  Row(
    { name: 'Chips', gap: 8 },
    labels.map((l, i) => Chip(l, i === active)),
  )
export const Divider = () => Ref('RlxQk', { name: 'Divider', width: 'fill_container' })
export const IconBtn = (icon, ghost = true) =>
  R(ghost ? 'Button/Icon Ghost' : 'Button/Icon Outline', {}, { icon: { icon } })
export const Play = (small) => R(small ? 'Button/Play Small' : 'Button/Play')
export const Logo = () => R('Logo/Lockup')
export const Concept = () => Badge('Concept', 'outline')

/* existing Bitrate library components */
export const AlbumCard = (title, sub, art, w = 168) =>
  Ref(
    'm015cR',
    { name: `Card / ${title}`, width: w, height: 'fit_content' },
    { A8dMX: { fill: img(ART[art]) }, rr2BC: { content: title }, xhu8r: { content: sub } },
  )
export const ArtistCard = (name, sub, art, w = 168) =>
  Ref(
    'jjufD',
    { name: `Artist / ${name}`, width: w, height: 'fit_content' },
    { S3S303: { fill: img(ART[art]) }, N0I3i: { content: name }, Q4aRkj: { content: sub } },
  )
export const PlaylistCard = (title, sub, art, w = 168) =>
  Ref(
    'dKgOu',
    { name: `Playlist / ${title}`, width: w, height: 'fit_content' },
    { D3rpRY: { fill: img(ART[art]) }, I1BLb: { content: title }, oEjKW: { content: sub } },
  )
export const CardRow = (cards) => Row({ name: 'Card Row', gap: 20, alignItems: 'start' }, cards)
export const TrackRow = ([title, artist, album, _dur, art, when], i, { added = true } = {}) =>
  Ref(
    'WQxBT',
    { name: `Track / ${title}` },
    {
      YSAj4: { content: String(i + 1) },
      PptA9: { fill: img(ART[art]) },
      eGEfP: { content: title },
      cNYVw: { content: artist },
      REBNx: { content: album ?? '' },
      QCCe4: added ? { content: when ?? '2 days ago' } : { enabled: false },
    },
  )
export const PlayingRow = ([title, artist, album, dur, art], { added = true } = {}) =>
  R(
    'Track Row/Playing',
    {},
    {
      cover: { fill: img(ART[art]) },
      title: { content: title },
      artist: { content: artist },
      album: { content: album ?? '' },
      added: added ? { content: 'Today' } : { enabled: false },
      duration: { content: dur },
    },
  )
export const TrackTable = (rows, { added = true, playing = 0 } = {}) =>
  Col({ name: 'Track Table', width: 'fill_container', gap: 0 }, [
    R('Track Table/Header', {}, { added: added ? undefined : { enabled: false } }),
    rows.map((r, i) => (i === playing ? PlayingRow(r, { added }) : TrackRow(r, i, { added }))),
  ])
export const MobileTrack = (title, meta, art) =>
  Ref(
    'Y2h8VV',
    { name: `Track / ${title}`, width: 'fill_container' },
    { fjPYf: { fill: img(ART[art]) }, RJ2go: { content: title }, rFh9q: { content: meta } },
  )
export const LibraryItem = (title, meta) =>
  Ref(
    'ZUzZL',
    { name: `Library / ${title}` },
    { lJ0RS: { content: title }, FTmtd: { content: meta } },
  )

/* states — the library's State/Message family, centred in the available space */
const clean = (a) => (a ? a.replace(/\s*→\s*$/, '') : a)
const message = (kind, title, desc, primary, secondary, icon) => ({
  ...Fill(
    [
      R(
        `State/Message/${kind}`,
        { name: `State / ${title}` },
        {
          icon: icon ? { icon } : undefined,
          title: { content: title },
          desc: desc ? { content: desc } : { enabled: false },
          primary: primary ? undefined : { enabled: false },
          primaryLabel: primary ? { content: clean(primary) } : undefined,
          secondary: secondary ? undefined : { enabled: false },
          secondaryLabel: secondary ? { content: clean(secondary) } : undefined,
        },
      ),
    ],
    { name: 'State Area' },
  ),
  _state: true,
})
export const ErrorState = (
  title,
  desc,
  action = 'Try again',
  icon = 'triangle-alert',
  secondary = 'Back to home',
) => message('Error', title, desc, action, secondary, icon)
export const EmptyState = (title, desc, action, icon = 'music', secondary) =>
  message('Empty', title, desc, action, secondary, icon)
export const OfflineState = (title, desc, action) => message('Offline', title, desc, action, null)
/** On a phone the message spans the screen instead of its 480px desktop measure. */
const fitStates = (nodes, mobile) =>
  nodes
    .flat()
    .filter(Boolean)
    .map((n) => {
      if (!n._state) return n
      const { _state, ...rest } = n
      return mobile
        ? { ...rest, children: rest.children.map((c) => ({ ...c, width: 'fill_container' })) }
        : rest
    })
const line = (w, h = 12) => Ref('Jjegi', { name: 'Skeleton', width: w, height: h })
/** Loading skeletons for long lists: library skeleton rows repeated to fill the screen, mirroring the final layout.
 *  kinds: list · table · collection · grid · artists · people · notifications · chart · artist-table */
export function Skeleton(kind = 'list', mobile = false, { more = false } = {}) {
  const many = (name, n, o = { width: 'fill_container' }) =>
    Array.from({ length: n }, () => R(name, o))
  const heading = () => line(mobile ? 140 : 220, 28)
  const col = (children, gap = 4) =>
    Col({ name: 'Skeleton Rows', gap, width: 'fill_container' }, children)
  const tail = more ? [R('List/Load More')] : []
  const cards = (name, perRow, rows) =>
    Col(
      { name: 'Skeleton Grid', gap: 24, width: 'fill_container' },
      Array.from({ length: rows }, () =>
        Row({ name: 'Skeleton Cards', gap: mobile ? 12 : 20 }, many(name, perRow, {})),
      ),
    )
  const trackRows = (n) =>
    mobile
      ? col(many('Skeleton/Track Row Mobile', n), 16)
      : col([R('Track Table/Header'), ...many('Skeleton/Track Row', n)])
  const wrap = (children) =>
    Col({ name: 'Loading', gap: 24, width: 'fill_container' }, [...children, ...tail])
  if (kind === 'grid')
    return wrap([heading(), mobile ? cards('Skeleton/Card', 2, 3) : cards('Skeleton/Card', 6, 3)])
  if (kind === 'artists')
    return wrap([
      heading(),
      mobile ? cards('Skeleton/Artist Card', 2, 3) : cards('Skeleton/Artist Card', 6, 3),
    ])
  if (kind === 'table') return wrap([heading(), trackRows(mobile ? 10 : 14)])
  if (kind === 'chart')
    return wrap([
      heading(),
      mobile ? col(many('Skeleton/Track Row Mobile', 10), 16) : col(many('Skeleton/Chart Row', 14)),
    ])
  if (kind === 'people') return wrap([col(many('Skeleton/Person Row', mobile ? 10 : 12), 0)])
  if (kind === 'notifications')
    return wrap([col(many('Skeleton/Notification Row', mobile ? 10 : 12), 0)])
  if (kind === 'artist-table')
    return wrap([
      mobile ? col(many('Skeleton/Track Row Mobile', 10), 16) : col(many('Skeleton/Table Row', 13)),
    ])
  if (kind === 'collection')
    return wrap([
      Row({ gap: 24, alignItems: 'end', width: 'fill_container' }, [
        line(mobile ? 120 : 200, mobile ? 120 : 200),
        Col({ gap: 12, width: 'fill_container' }, [
          line(80),
          line(mobile ? 180 : 420, mobile ? 28 : 48),
          line(mobile ? 120 : 220),
        ]),
      ]),
      trackRows(mobile ? 7 : 10),
    ])
  return wrap([heading(), col(many('Skeleton/Track Row Mobile', mobile ? 10 : 12), 16)])
}
/** Footer of a long list while the next page streams in, or once everything is shown. */
export const LoadMore = (count = '50 of 1,240') =>
  R('List/Load More', {}, { count: { content: count } })
export const ListEnd = (label) => R('List/End', {}, { label: { content: label } })

/* containers with slots */
export const Panel = (children, o = {}) =>
  R('Surface/Panel', o, {
    content: {
      type: 'frame',
      id: id(),
      name: 'Panel Content',
      layout: 'vertical',
      gap: o.gap ?? 14,
      width: 'fill_container',
      children: children.flat().filter(Boolean),
    },
  })
export const Menu = (items) =>
  R(
    'Surface/Menu',
    {},
    {
      items: {
        type: 'frame',
        id: id(),
        name: 'Menu Items',
        layout: 'vertical',
        width: 'fill_container',
        children: items.map(([label, kind]) =>
          R(
            kind === 'destructive'
              ? 'Menu/Item Destructive'
              : kind === 'disabled'
                ? 'Menu/Item Disabled'
                : 'Menu/Item',
            {},
            { label: { content: label } },
          ),
        ),
      },
    },
  )
export const SettingRow = (title, desc, control) =>
  R(
    'Setting Row',
    {},
    {
      title: { content: title },
      desc: desc ? { content: desc } : { enabled: false },
      control: {
        type: 'frame',
        id: id(),
        name: 'Control',
        alignItems: 'center',
        children: [control],
      },
    },
  )
export const SectionHeader = (title, action = 'Show all') =>
  R(
    'Section Header',
    {},
    { title: { content: title }, action: action ? { content: action } : { enabled: false } },
  )
export const CollectionHeader = ({ type, title, owner, meta, art }) =>
  art === 'liked'
    ? R(
        'Collection Header/Liked',
        {},
        {
          type: { content: type },
          title: { content: title },
          owner: owner ? { content: owner } : { enabled: false },
          meta: { content: meta },
        },
      )
    : R(
        'Collection Header',
        {},
        {
          cover: { fill: img(ART[art]) },
          type: { content: type },
          title: { content: title },
          owner: owner ? { content: owner } : { enabled: false },
          meta: { content: meta },
        },
      )
export const ActionBar = (show = []) =>
  R(
    'Action Bar',
    {},
    Object.fromEntries(
      ['like', 'invite', 'download'].map((p) => [
        p,
        show.includes(p) || (p === 'download' && !show.includes('-download'))
          ? undefined
          : { enabled: false },
      ]),
    ),
  )
export const FieldError = (text) => R('Form/Field Error', {}, { text: { content: text } })
export const CheckRow = (label, width = 'fill_container') =>
  R('Form/Checkbox Row', { width }, { label: { content: label } })

/* shells */
const TAB = {
  home: ['lPxJb', 'ojzHV'],
  search: ['kGpDm', 'mG3wy'],
  library: ['X78L7T', 'HnsIZ'],
  create: ['pjDzF', 'j8Bscj'],
}
export function Desktop(name, content, { nowPlaying = false, library = true, height = 900 } = {}) {
  return {
    type: 'frame',
    id: id(),
    name,
    width: 1440,
    height,
    clip: true,
    layout: 'vertical',
    fill: C.background,
    children: [
      Ref(
        'OPciE',
        { name: 'App Layout', width: 1440, height },
        {
          xvsK3: {
            type: 'frame',
            id: id(),
            name: 'Main Panel',
            clip: true,
            width: 'fill_container',
            height: 'fill_container',
            layout: 'vertical',
            gap: 28,
            padding: [24, 32],
            children: fitStates(content, false),
          },
          Nn2KW: { enabled: nowPlaying },
          VZD6U: { enabled: library },
          z5MVM: { enabled: !library },
        },
      ),
    ],
  }
}
export function Mobile(name, content, { tab = 'home', mini = true, header, height = 844 } = {}) {
  const desc = {}
  for (const [t, [ic, lb]] of Object.entries(TAB)) {
    desc[ic] = { fill: t === tab ? C.foreground : C.mutedForeground }
    desc[lb] = {
      fill: t === tab ? C.foreground : C.mutedForeground,
      fontWeight: t === tab ? '600' : 'normal',
    }
  }
  Object.assign(desc.pjDzF, { icon: 'square-plus' })
  Object.assign(desc.j8Bscj, { content: 'Create' })
  return {
    type: 'frame',
    id: id(),
    name,
    width: 390,
    height,
    clip: true,
    layout: 'vertical',
    fill: C.background,
    children: [
      R('Mobile/Status Bar', { width: 'fill_container' }),
      header,
      L(
        {
          name: 'Content',
          width: 'fill_container',
          height: 'fill_container',
          layout: 'vertical',
          gap: 20,
          padding: [8, 16, 16, 16],
          clip: true,
        },
        fitStates(content, true),
      ),
      mini &&
        L({ name: 'Mini Bar Slot', width: 'fill_container', padding: [8, 16] }, [
          Ref('CeyP3', { name: 'Mini Bar', width: 'fill_container' }),
        ]),
      Ref('PmEet', { name: 'Tab Bar', width: 'fill_container' }, desc),
    ].filter(Boolean),
  }
}
export const MHeader = (title, { back = true, backIcon, actions = [] } = {}) =>
  R(
    'Mobile/Header',
    { width: 'fill_container' },
    {
      title: { content: title },
      back: back ? undefined : { enabled: false },
      backIcon: backIcon ? { icon: backIcon } : undefined,
      action1: actions[0] ? undefined : { enabled: false },
      action1Icon: actions[0] ? { icon: actions[0] } : undefined,
      action2: actions[1] ? undefined : { enabled: false },
      action2Icon: actions[1] ? { icon: actions[1] } : undefined,
    },
  )
export function AuthDesktop(name, form, headline = 'Your music, ready when you are.') {
  return {
    type: 'frame',
    id: id(),
    name,
    width: 1440,
    height: 900,
    clip: true,
    fill: C.background,
    children: [
      R('Auth/Brand Panel', { height: 'fill_container' }, { headline: { content: headline } }),
      L(
        {
          name: 'Form Side',
          width: 'fill_container',
          height: 'fill_container',
          justifyContent: 'center',
          alignItems: 'center',
        },
        [Col({ name: 'Form', width: 400, gap: 22 }, form)],
      ),
    ],
  }
}
export function AuthMobile(name, form) {
  return {
    type: 'frame',
    id: id(),
    name,
    width: 390,
    height: 844,
    clip: true,
    layout: 'vertical',
    fill: C.background,
    children: [
      R('Mobile/Status Bar', { width: 'fill_container' }),
      Col({ name: 'Form', width: 'fill_container', padding: [20, 20], gap: 22 }, [Logo(), ...form]),
    ],
  }
}
export const CardDesktop = (name, form) => ({
  type: 'frame',
  id: id(),
  name,
  width: 1440,
  height: 900,
  clip: true,
  layout: 'vertical',
  justifyContent: 'center',
  alignItems: 'center',
  fill: C.background,
  children: [Panel([Logo(), ...form], { width: 440, gap: 20 })],
})
export const Blank = (name, w, h, children) => ({
  type: 'frame',
  id: id(),
  name,
  width: w,
  height: h,
  clip: true,
  layout: 'vertical',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 20,
  padding: 24,
  fill: C.background,
  children: fitStates(children, w < 600),
})
/** A screen state; when it cannot occur on a phone, `reason` says why and is noted on the frame. */
export const state = (label, desktop, mobile, reason) => ({ label, desktop, mobile, reason })
/** A few skeleton rows of the same list followed by the load-more footer (infinite lists). */
const MORE_ROW = {
  track: ['Skeleton/Track Row', 'Skeleton/Track Row Mobile'],
  chart: ['Skeleton/Chart Row', 'Skeleton/Track Row Mobile'],
  people: ['Skeleton/Person Row', 'Skeleton/Person Row'],
  notifications: ['Skeleton/Notification Row', 'Skeleton/Notification Row'],
}
export const MoreRows = (mobile, kind = 'track', count = '50 of 1,240') =>
  Col({ name: 'Loading More', gap: mobile ? 16 : 4, width: 'fill_container' }, [
    ...Array.from({ length: mobile ? 3 : 2 }, () =>
      R(MORE_ROW[kind][mobile ? 1 : 0], { width: 'fill_container' }),
    ),
    LoadMore(count),
  ])
/** Appends the load-more tail to a finished screen (desktop Main Panel or mobile Content). */
export const withMore = (frame, mobile, kind, count) => {
  const host = (n) => {
    if (!n || typeof n !== 'object') return null
    if (n.name === (mobile ? 'Content' : 'Main Panel') && Array.isArray(n.children)) return n
    for (const v of [...Object.values(n.descendants ?? {}), ...(n.children ?? [])]) {
      const r = host(v)
      if (r) return r
    }
    return null
  }
  host(frame)?.children.push(MoreRows(mobile, kind, count))
  frame.name = `${frame.name} loading more`
  return frame
}
