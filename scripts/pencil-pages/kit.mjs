// Page-design generator kit: emits .pen node JSON bound to the Bitrate library (`ds`).
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

const ALPHA = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
let used = new Set()
export const reserve = (ids) => {
  for (const i of ids) used.add(i)
}
export const id = () => {
  for (;;) {
    let s = ''
    for (let i = 0; i < 6; i++) s += ALPHA[Math.floor(Math.random() * ALPHA.length)]
    if (!used.has(s)) {
      used.add(s)
      return s
    }
  }
}

/* ---------- mode: building library components ('lib') or screens that import it ('page') ---------- */
export let MODE = 'page'
const pre = () => (MODE === 'lib' ? '' : 'ds:')
export const setMode = (m) => {
  MODE = m
}
/* ---------- tokens & assets ---------- */
export const C = new Proxy(
  {},
  {
    get: (_, k) =>
      `$${pre()}--${String(k)
        .replace(/([a-z])([A-Z0-9])/g, '$1-$2')
        .toLowerCase()}`,
  },
)
export const SANS = new String('font-sans')
export const HEAD = new String('font-heading')
const font = (f) => `$${pre()}--${f}`
const fontOf = (f = 'font-sans') => {
  const k = String(f).replace(/^\$(ds:)?--/, '')
  return /^font-(sans|heading)$/.test(k) ? font(k) : String(f)
}
/** Where page files live relative to the library: web-player pages sit next to it, web-artist pages one level deeper. */
let LIB_DIR = '../design-system/'
export const setLibDir = (d) => {
  LIB_DIR = d
}
const assetBase = () => (MODE === 'lib' ? 'assets/' : `${LIB_DIR}assets/`)
export const ART = new Proxy(
  {},
  { get: (_, k) => (ART_FILES[k] ? assetBase() + ART_FILES[k] : undefined) },
)
const ART_FILES = {
  afterglow: 'albums/album-afterglow.webp',
  night: 'albums/album-night-signal.webp',
  static: 'albums/album-static-lines.webp',
  echoes: 'albums/album-echoes-in-motion.webp',
  drift: 'albums/album-drift-control.webp',
  hero: 'hero/night-signal.png',
  stage: 'hero/stage.png',
  luma: 'hero/luma-vale.png',
  avatar1: 'avatars/avatar1.jpg',
  avatar2: 'avatars/avatar2.jpg',
  avatar3: 'avatars/avatar3.jpg',
  avatar4: 'avatars/avatar4.jpg',
}
export const TRACKS = [
  ['Afterglow', 'Nova & the Static', 'Afterglow', '3:42', 'afterglow'],
  ['Night Signal', 'Mira Sol', 'Night Signal', '3:56', 'night'],
  ['Static Lines', 'Kite Harbor', 'Static Lines', '3:47', 'static'],
  ['Echoes in Motion', 'Lumen Choir', 'Echoes in Motion', '4:21', 'echoes'],
  ['Drift Control', 'Mira Sol', 'Drift Control', '3:19', 'drift'],
  ['Glass Horizon', 'Nova & the Static', 'Afterglow', '4:28', 'afterglow'],
  ['Low Orbit', 'Kite Harbor', 'Static Lines', '3:05', 'static'],
  ['Late Signal', 'Lumen Choir', 'Echoes in Motion', '5:02', 'echoes'],
]

/* ---------- primitives ---------- */
export const T = (content, o = {}) => ({
  type: 'text',
  id: id(),
  name: o.name ?? String(content).slice(0, 28),
  content,
  fontSize: 14,
  fill: C.foreground,
  ...o,
  fontFamily: fontOf(o.fontFamily),
})
export const P = (content, o = {}) =>
  T(content, {
    fill: C.mutedForeground,
    lineHeight: 1.5,
    textGrowth: 'fixed-width',
    width: 'fill_container',
    ...o,
  })
export const H = (content, size = 28, o = {}) =>
  T(content, {
    fontFamily: 'font-heading',
    fontSize: size,
    fontWeight: '600',
    letterSpacing: size >= 32 ? -0.6 : 0,
    ...o,
  })
export const Eyebrow = (content, o = {}) =>
  T(content.toUpperCase(), {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.2,
    fill: C.mutedForeground,
    ...o,
  })
export const I = (icon, o = {}) => ({
  type: 'icon',
  id: id(),
  name: o.name ?? `Icon / ${icon}`,
  library: 'lucide',
  icon,
  width: 20,
  height: 20,
  fill: C.mutedForeground,
  ...o,
})
export const F = (o = {}, children = []) => ({
  type: 'frame',
  id: id(),
  name: o.name ?? 'Frame',
  ...o,
  children: children.filter(Boolean),
})
export const Row = (o, ch) => F({ name: 'Row', gap: 12, alignItems: 'center', ...o }, ch)
export const Col = (o, ch) => F({ name: 'Column', layout: 'vertical', gap: 12, ...o }, ch)
export const Spacer = () => F({ name: 'Spacer', width: 'fill_container', height: 1 })
export const img = (url, mode = 'cover') => ({ type: 'image', url, mode })
export const Cover = (art, size = 48, radius = 8, o = {}) =>
  F({
    name: 'Cover',
    width: size,
    height: size,
    cornerRadius: radius,
    fill: img(ART[art] ?? art),
    ...o,
  })
export const Avatar = (art, size = 40, o = {}) =>
  Cover(art, size, size / 2, { name: 'Avatar', ...o })
export const Divider = (o = {}) =>
  F({ name: 'Divider', width: 'fill_container', height: 1, fill: C.border, ...o })
/** In an importing file the children of a library component are addressed through the alias: `ds:<id>`. */
const aliasPath = (key) =>
  MODE === 'lib'
    ? key
    : key
        .split('/')
        .map((seg) => (seg.startsWith('ds:') ? seg : `ds:${seg}`))
        .join('/')
export const Ref = (ref, o = {}, descendants) => ({
  type: 'ref',
  id: id(),
  ref: `${pre()}${ref}`,
  ...o,
  ...(descendants
    ? {
        descendants: Object.fromEntries(
          Object.entries(descendants).map(([k, v]) => [aliasPath(k), v]),
        ),
      }
    : {}),
})

/* ---------- shadcn kit (forked in the library) ---------- */
const BTN = {
  default: ['exjwf', 'k0WCtI', 'E23bq6'],
  secondary: ['Wveyx', 'HWhkZ', 'f8YTr'],
  outline: ['G5tJp', 'wFUna', 'd2zCI'],
  ghost: ['DTwJb', 'DsOu2', 'GyGLK'],
  destructive: ['uT1Ux', 'w2aMIw', 'QLznA'],
  'large-default': ['Y4ylzP', 'D3xnv', 'NVe7y'],
  'large-secondary': ['q9t60e', 'hQB6X', 'KOjgg'],
  'large-outline': ['qz3aI', 'vIxSI', 'i6a4e'],
}
export const Button = (label, variant = 'default', { icon, width, name } = {}) => {
  const [ref, iconId, labelId] = BTN[variant]
  return Ref(
    ref,
    { name: name ?? `Button / ${label}`, ...(width ? { width } : {}) },
    {
      [labelId]: { content: label },
      [iconId]: icon ? { icon } : { enabled: false },
    },
  )
}
export const IconButton = (icon, variant = 'ghost', name) =>
  F(
    {
      name: name ?? `Icon Button / ${icon}`,
      width: 36,
      height: 36,
      cornerRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      ...(variant === 'outline'
        ? { stroke: C.border, strokeWidth: 1 }
        : variant === 'secondary'
          ? { fill: C.secondary }
          : {}),
    },
    [I(icon, { width: 18, height: 18, fill: C.foreground })],
  )
export const Input = (label, placeholder, width = 'fill_container') =>
  label
    ? Ref(
        'j04F4',
        { name: `Input / ${label}`, width },
        { l4agQ: { content: label }, iI0CE: { content: placeholder } },
      )
    : Ref(
        'UDBbv',
        { name: `Input / ${placeholder}`, width },
        { MHjg8: { enabled: false }, kB4hd: { content: placeholder } },
      )
export const Select = (label, value, width = 'fill_container') =>
  Ref(
    'Kfq8t',
    { name: `Select / ${label}`, width },
    { PLkpD: label ? { content: label } : { enabled: false }, USlYG: { content: value } },
  )
export const Switch = (label, on = true) =>
  Ref(
    on ? 'HjQNJ' : 'S0zkA',
    { name: `Switch / ${label}` },
    { [on ? 'mNVZY' : 'T8vyQf']: { content: label } },
  )
export const CheckRow = (label, on = false) =>
  Row(
    {
      name: `Checkbox / ${label.slice(0, 24)}`,
      width: 'fill_container',
      gap: 10,
      alignItems: 'start',
    },
    [
      F(
        {
          name: 'Box',
          width: 16,
          height: 16,
          cornerRadius: 4,
          ...(on ? { fill: C.primary } : { stroke: C.input, strokeWidth: 1 }),
          justifyContent: 'center',
          alignItems: 'center',
        },
        [on && I('check', { width: 12, height: 12, fill: C.primaryForeground })],
      ),
      P(label, { fontSize: 13, fill: C.foreground }),
    ],
  )
export const Checkbox = (label, on = false) =>
  Ref(
    on ? 'u4ZPH' : 'FSq1c',
    { name: `Checkbox / ${label}` },
    { [on ? 'XYJ6M' : 'ZMfp8']: { content: label } },
  )
export const Badge = (label, variant = 'secondary') => {
  const [ref, t] = {
    default: ['Y4q2pj', 'IlFc9'],
    secondary: ['e9YOsV', 'c9raBZ'],
    outline: ['FJUa1', 'BI0Pd'],
  }[variant]
  return Ref(ref, { name: `Badge / ${label}` }, { [t]: { content: label } })
}
export const Tab = (label, active) =>
  Ref(
    active ? 'Q9hm3' : 'Y8XV8',
    { name: `Tab / ${label}` },
    { [active ? 'dQjtW' : 'iQiil']: { content: label } },
  )
export const Otp = (label) => Ref('CY8XS', { name: 'OTP' }, { vp5VK: { content: label } })
export const Progress = (width = 'fill_container') => Ref('AQPfV', { name: 'Progress', width })
export const Alert = (title, body) =>
  Ref(
    'ogW5t',
    { name: `Alert / ${title}`, width: 'fill_container' },
    { L7SHNm: { content: title }, F9kE6W: { content: body } },
  )
export const Chip = (label, active = false) =>
  F(
    {
      name: `Chip / ${label}`,
      height: 32,
      padding: [0, 14],
      cornerRadius: 16,
      alignItems: 'center',
      ...(active ? { fill: C.primary } : { stroke: C.border, strokeWidth: 1 }),
    },
    [
      T(label, {
        fontSize: 13,
        fontWeight: active ? '600' : 'normal',
        fill: active ? C.primaryForeground : C.foreground,
      }),
    ],
  )
export const Logo = (size = 28, fill = C.foreground) =>
  Row({ name: 'Brand', gap: 10 }, [
    Ref('OVOcb', { name: 'Bitrate Mark', width: size, height: size }),
    T('Bitrate', { fontFamily: 'font-heading', fontSize: size * 0.68, fontWeight: '600', fill }),
  ])

/* ---------- composite blocks ---------- */
export const SectionHeader = (title, action = 'Show all') =>
  Row({ name: `Section / ${title}`, width: 'fill_container', justifyContent: 'space_between' }, [
    H(title, 22),
    action && T(action, { fontSize: 13, fontWeight: '600', fill: C.mutedForeground }),
  ])
export const MediaCard = (title, meta, art, { w = 176, round = false } = {}) =>
  Col({ name: `Card / ${title}`, width: w, gap: 10 }, [
    Cover(art, w, round ? w / 2 : 10),
    Col({ gap: 2, width: 'fill_container' }, [
      T(title, { fontWeight: '600', textGrowth: 'fixed-width', width: 'fill_container' }),
      T(meta, {
        fontSize: 13,
        fill: C.mutedForeground,
        textGrowth: 'fixed-width',
        width: 'fill_container',
      }),
    ]),
  ])
export const CardRow = (items, o = {}) =>
  Row(
    { name: 'Card Row', gap: 20, alignItems: 'start', ...o },
    items.map(([t, m, a]) => MediaCard(t, m, a, o)),
  )
export const TrackTable = (rows, { album = true, added, active = 0 } = {}) =>
  Col({ name: 'Track Table', width: 'fill_container', gap: 0 }, [
    Row(
      {
        name: 'Track Table Header',
        width: 'fill_container',
        height: 36,
        padding: [0, 12],
        gap: 16,
        stroke: C.border,
        strokeWidth: { bottom: 1 },
      },
      [
        T('#', { fontSize: 12, fill: C.mutedForeground, width: 20, textGrowth: 'fixed-width' }),
        T('Title', {
          fontSize: 12,
          fill: C.mutedForeground,
          width: 'fill_container',
          textGrowth: 'fixed-width',
        }),
        album &&
          T('Album', {
            fontSize: 12,
            fill: C.mutedForeground,
            width: 220,
            textGrowth: 'fixed-width',
          }),
        added &&
          T(added, {
            fontSize: 12,
            fill: C.mutedForeground,
            width: 120,
            textGrowth: 'fixed-width',
          }),
        I('clock-3', { width: 16, height: 16 }),
        F({ width: 28, height: 1, name: 'Actions Spacer' }),
      ],
    ),
    ...rows.map(([title, artist, alb, dur, art, when], i) =>
      Row(
        {
          name: `Track / ${title}`,
          width: 'fill_container',
          height: 56,
          padding: [0, 12],
          gap: 16,
          cornerRadius: 8,
          ...(i === active ? { fill: C.muted } : {}),
        },
        [
          i === active
            ? I('audio-lines', { width: 16, height: 16, fill: C.primary })
            : T(String(i + 1), {
                fontSize: 13,
                fill: C.mutedForeground,
                width: 20,
                textGrowth: 'fixed-width',
              }),
          Row({ gap: 12, width: 'fill_container' }, [
            Cover(art, 40, 6),
            Col({ gap: 2 }, [
              T(title, { fontWeight: '600', fill: i === active ? C.primary : C.foreground }),
              T(artist, { fontSize: 13, fill: C.mutedForeground }),
            ]),
          ]),
          album &&
            T(alb, {
              fontSize: 13,
              fill: C.mutedForeground,
              width: 220,
              textGrowth: 'fixed-width',
            }),
          added &&
            T(when ?? '2 days ago', {
              fontSize: 13,
              fill: C.mutedForeground,
              width: 120,
              textGrowth: 'fixed-width',
            }),
          T(dur, { fontSize: 13, fill: C.mutedForeground }),
          I('ellipsis', { width: 18, height: 18 }),
        ],
      ),
    ),
  ])
export const MobileTrack = (title, meta, art, o = {}) =>
  Row({ name: `Track / ${title}`, width: 'fill_container', height: 60, gap: 12, ...o }, [
    Cover(art, 48, 6),
    Col({ gap: 2, width: 'fill_container' }, [
      T(title, { fontWeight: '600', textGrowth: 'fixed-width', width: 'fill_container' }),
      T(meta, {
        fontSize: 13,
        fill: C.mutedForeground,
        textGrowth: 'fixed-width',
        width: 'fill_container',
      }),
    ]),
    I('ellipsis', { width: 18, height: 18 }),
  ])
export const SettingRow = (title, desc, control) =>
  Row(
    {
      name: `Setting / ${title}`,
      width: 'fill_container',
      padding: [14, 0],
      gap: 24,
      stroke: C.border,
      strokeWidth: { bottom: 1 },
    },
    [
      Col({ gap: 4, width: 'fill_container' }, [
        T(title, { fontWeight: '600' }),
        desc && P(desc, { fontSize: 13 }),
      ]),
      control,
    ],
  )
export const Panel = (o, ch) =>
  Col(
    {
      name: 'Panel',
      width: 'fill_container',
      padding: 24,
      gap: 16,
      cornerRadius: 14,
      fill: C.card,
      stroke: C.border,
      strokeWidth: 1,
      ...o,
    },
    ch,
  )

/* ---------- layouts ---------- */
const TAB_IDS = {
  home: ['lPxJb', 'ojzHV'],
  search: ['kGpDm', 'mG3wy'],
  library: ['X78L7T', 'HnsIZ'],
  profile: ['pjDzF', 'j8Bscj'],
}
export function desktopApp(
  name,
  content,
  { nowPlaying = false, library = true, height = 900 } = {},
) {
  return F({ name, width: 1440, height, clip: true, layout: 'vertical', fill: C.background }, [
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
          children: content,
        },
        Nn2KW: { enabled: nowPlaying },
        VZD6U: { enabled: library },
        z5MVM: { enabled: !library },
      },
    ),
  ])
}
export function mobileApp(name, content, { tab = 'home', mini = true, header } = {}) {
  const desc = {}
  for (const [t, [ic, lb]] of Object.entries(TAB_IDS)) {
    desc[ic] = { fill: t === tab ? C.foreground : C.mutedForeground }
    desc[lb] = {
      fill: t === tab ? C.foreground : C.mutedForeground,
      fontWeight: t === tab ? '600' : 'normal',
    }
  }
  /* the app's fourth tab is "Create", not "Profile" */
  Object.assign(desc.pjDzF, { icon: 'square-plus' })
  Object.assign(desc.j8Bscj, { content: 'Create' })
  return F({ name, width: 390, height: 844, clip: true, layout: 'vertical', fill: C.background }, [
    statusBar(),
    header,
    F(
      {
        name: 'Content',
        width: 'fill_container',
        height: 'fill_container',
        layout: 'vertical',
        gap: 24,
        padding: [8, 16, 16, 16],
        clip: true,
      },
      content,
    ),
    mini &&
      F({ name: 'Mini Bar Slot', width: 'fill_container', padding: [8, 16] }, [
        Ref('CeyP3', { name: 'Mini Bar', width: 'fill_container' }),
      ]),
    Ref('PmEet', { name: 'Tab Bar', width: 'fill_container' }, desc),
  ])
}
export const statusBar = () =>
  Row(
    {
      name: 'Status Bar',
      width: 'fill_container',
      height: 44,
      padding: [0, 24],
      justifyContent: 'space_between',
    },
    [
      T('9:41', { fontWeight: '600', fontSize: 15 }),
      Row(
        { gap: 6 },
        ['signal', 'wifi', 'battery-full'].map((i) =>
          I(i, { width: 16, height: 16, fill: C.foreground }),
        ),
      ),
    ],
  )
export const mobileHeader = (title, { back = true, actions = [] } = {}) =>
  Row({ name: 'Mobile Header', width: 'fill_container', height: 52, padding: [0, 8], gap: 4 }, [
    back ? IconButton('chevron-left') : F({ width: 8, height: 1 }),
    T(title, {
      fontFamily: HEAD,
      fontSize: 18,
      fontWeight: '600',
      width: 'fill_container',
      textGrowth: 'fixed-width',
    }),
    ...actions.map((a) => IconButton(a)),
  ])

/** Signed-out shell: brand artwork on the left, the form on the right. */
export function desktopAuth(
  name,
  form,
  { art = 'hero', quote = 'Your music, ready when you are.' } = {},
) {
  return F({ name, width: 1440, height: 900, clip: true, fill: C.background }, [
    F(
      {
        name: 'Brand Panel',
        width: 640,
        height: 'fill_container',
        layout: 'vertical',
        justifyContent: 'space_between',
        padding: 48,
        fill: img(ART[art]),
      },
      [
        Logo(32, C.white),
        Col({ name: 'Brand Copy', gap: 12, width: 'fill_container' }, [
          H(quote, 44, { fill: C.white, textGrowth: 'fixed-width', width: 460, lineHeight: 1.05 }),
          T('Listen, save and return to your library from the browser.', {
            fill: C.neutral200,
            fontSize: 16,
          }),
        ]),
      ],
    ),
    F(
      {
        name: 'Form Side',
        width: 'fill_container',
        height: 'fill_container',
        justifyContent: 'center',
        alignItems: 'center',
      },
      [Col({ name: 'Form', width: 400, gap: 24 }, form)],
    ),
  ])
}
export function mobileAuth(name, form) {
  return F({ name, width: 390, height: 844, clip: true, layout: 'vertical', fill: C.background }, [
    statusBar(),
    Row({ name: 'Mobile Auth Header', width: 'fill_container', height: 56, padding: [0, 20] }, [
      Logo(26),
    ]),
    Col({ name: 'Form', width: 'fill_container', padding: [24, 20], gap: 24 }, form),
  ])
}
/** Centered system/state screen (404, error, offline). */
export const centered = (name, w, h, children, o = {}) =>
  F(
    {
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
      ...o,
    },
    children,
  )

/* ---------- state content (shared by every page) ---------- */
const bar = (w, h = 12, o = {}) =>
  F({ name: 'Skeleton', width: w, height: h, cornerRadius: h / 2, fill: C.muted, ...o })
/** Skeleton that keeps the final layout: `list` rows, `grid` cards, or a `collection` header + rows. */
export function skeleton(kind = 'list', mobile = false) {
  const rows = (n) =>
    Col(
      { name: 'Skeleton Rows', gap: 14, width: 'fill_container' },
      Array.from({ length: n }, () =>
        Row({ width: 'fill_container', gap: 12 }, [
          bar(mobile ? 48 : 40, mobile ? 48 : 40, { cornerRadius: 6 }),
          Col({ gap: 8, width: 'fill_container' }, [
            bar(mobile ? 160 : 260),
            bar(mobile ? 100 : 160, 10),
          ]),
        ]),
      ),
    )
  const cards = (n, w) =>
    Row(
      { name: 'Skeleton Cards', gap: 20 },
      Array.from({ length: n }, () =>
        Col({ gap: 10 }, [bar(w, w, { cornerRadius: 10 }), bar(w * 0.8), bar(w * 0.5, 10)]),
      ),
    )
  if (kind === 'grid')
    return [
      bar(mobile ? 140 : 220, 28, { cornerRadius: 8 }),
      mobile ? rows(6) : Col({ gap: 24 }, [cards(5, 168), cards(5, 168)]),
    ]
  if (kind === 'collection')
    return [
      Row({ gap: 24, alignItems: 'end', width: 'fill_container' }, [
        bar(mobile ? 120 : 200, mobile ? 120 : 200, { cornerRadius: 12 }),
        Col({ gap: 12, width: 'fill_container' }, [
          bar(80),
          bar(mobile ? 180 : 420, mobile ? 28 : 48, { cornerRadius: 10 }),
          bar(mobile ? 120 : 220),
        ]),
      ]),
      rows(mobile ? 5 : 6),
    ]
  return [bar(mobile ? 140 : 220, 28, { cornerRadius: 8 }), rows(mobile ? 7 : 8)]
}
/** Centered message state: icon, title, description, actions (`[label, variant]`). */
export function message(icon, title, desc, actions = [], mobile = false, tone) {
  return [
    F(
      {
        name: 'State Area',
        width: 'fill_container',
        height: 'fill_container',
        justifyContent: 'center',
        alignItems: 'center',
      },
      [
        Col(
          {
            name: `State / ${title}`,
            width: mobile ? 'fill_container' : 480,
            gap: 14,
            alignItems: 'center',
          },
          [
            F(
              {
                name: 'State Icon',
                width: 64,
                height: 64,
                cornerRadius: 32,
                fill: C.muted,
                justifyContent: 'center',
                alignItems: 'center',
              },
              [I(icon, { width: 28, height: 28, fill: tone ?? C.foreground })],
            ),
            H(title, mobile ? 22 : 26, {
              textAlign: 'center',
              textGrowth: 'fixed-width',
              width: 'fill_container',
            }),
            desc && P(desc, { textAlign: 'center' }),
            actions.length > 0 &&
              (mobile
                ? Col(
                    { gap: 10, width: 'fill_container' },
                    actions.map(([l, v]) =>
                      Button(l, v === 'outline' ? 'large-outline' : 'large-default', {
                        width: 'fill_container',
                      }),
                    ),
                  )
                : Row(
                    { gap: 10 },
                    actions.map(([l, v]) => Button(l, v ?? 'default')),
                  )),
          ],
        ),
      ],
    ),
  ]
}
export const errorMessage = (title, desc, mobile, actions = [['Try again']]) =>
  message('triangle-alert', title, desc, actions, mobile, C.destructive)

/* ---------- file writer ---------- */
const clone = (n) => {
  if (Array.isArray(n)) return n.map(clone)
  if (!n || typeof n !== 'object') return n
  const o = {}
  for (const [k, v] of Object.entries(n))
    if (k !== '_state') o[k] = k === 'id' ? id() : k === 'descendants' ? cloneDesc(v) : clone(v)
  return o
}
const cloneDesc = (d) =>
  Object.fromEntries(Object.entries(d).map(([k, v]) => [k, v?.type ? clone(v) : v]))

/**
 * Writes pencil/web-player-design/<dir>/<dir>.pen: the desktop page in Dark, Light and Dim, the
 * mobile page, then every screen state as a desktop + mobile pair, laid out left to right.
 */
export function writePage(root, dir, spec) {
  const { title, route, context, desktop, mobile, extra = [], states = [] } = spec
  used = new Set()
  const frames = []
  let x = 0
  const place = (node, theme, label, note) => {
    const n = clone(node)
    Object.assign(n, {
      x,
      y: 0,
      name: `${title} / ${label}`,
      theme: { 'ds:Mode': theme },
      context: `${route} — ${context}${note ? ` · ${note}` : ''}`,
    })
    frames.push(n)
    x += n.width + 100
  }
  const d = desktop()
  place(d, 'Dark', 'Desktop / Dark')
  place(d, 'Light', 'Desktop / Light')
  place(d, 'Dim', 'Desktop / Dim')
  if (mobile) place(mobile(), 'Dark', 'Mobile / Dark')
  for (const [label, fn, theme = 'Dark'] of extra) place(fn(), theme, label)
  for (const st of states) {
    if (st.desktop)
      place(
        st.desktop(),
        'Dark',
        `${st.label} / Desktop`,
        st.mobile ? undefined : `no mobile frame: ${st.reason}`,
      )
    if (st.mobile)
      place(
        st.mobile(),
        'Dark',
        `${st.label} / Mobile`,
        st.desktop ? undefined : `no desktop frame: ${st.reason}`,
      )
  }
  const file = join(root, dir, spec.file ?? `${dir}.pen`)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(
    file,
    JSON.stringify(
      { version: '2.20', imports: { ds: `${LIB_DIR}bitrate.lib.pen` }, children: frames },
      null,
      2,
    ),
  )
  return file
}
