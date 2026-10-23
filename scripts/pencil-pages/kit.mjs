// Page-design generator kit: emits .pen node JSON bound to the Bitrate library (`ds`).
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { stableIds } from './stable-id.mjs'

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
let MODE = 'page'
/* the imported library: the Bitrate library as `ds` by default; the admin console has its own (`admin`) */
let ALIAS = 'ds'
let LIB_FILE = 'bitrate.lib.pen'
export const setLibrary = (alias, file) => {
  ALIAS = alias
  LIB_FILE = file
}
const pre = () => (MODE === 'lib' ? '' : `${ALIAS}:`)
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
const font = (f) => `$${pre()}--${f}`
const fontOf = (f = 'font-sans') => {
  const k = String(f).replace(/^\$([a-z]+:)?--/, '')
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
export const img = (url, mode = 'cover') => ({ type: 'image', url, mode })
/** In an importing file the children of a library component are addressed through the alias: `ds:<id>`. */
const aliasPath = (key) =>
  MODE === 'lib'
    ? key
    : key
        .split('/')
        .map((seg) => (seg.startsWith(`${ALIAS}:`) ? seg : `${ALIAS}:${seg}`))
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
  default: ['exjwf', 'k0WCtI', 'E23bq6', 'o7NXW'],
  secondary: ['Wveyx', 'HWhkZ', 'f8YTr', 'q1x1J'],
  outline: ['G5tJp', 'wFUna', 'd2zCI', 'zDiHG'],
  ghost: ['DTwJb', 'DsOu2', 'GyGLK', 'uRXDu'],
  destructive: ['uT1Ux', 'w2aMIw', 'QLznA', 'CxlXV'],
  'large-default': ['Y4ylzP', 'D3xnv', 'NVe7y', 'ksrFi'],
  'large-secondary': ['q9t60e', 'hQB6X', 'KOjgg', 'X8D8m'],
  'large-outline': ['qz3aI', 'vIxSI', 'i6a4e', 'MlIUw'],
}
/** A kit button; without an icon the whole icon slot is switched off so no empty gap stays before the label. */
export const Button = (label, variant = 'default', { icon, width, name } = {}) => {
  const [ref, iconId, labelId, slotId] = BTN[variant]
  return Ref(
    ref,
    { name: name ?? `Button / ${label}`, ...(width ? { width } : {}) },
    {
      [labelId]: { content: label },
      ...(icon ? { [iconId]: { icon } } : { [slotId]: { enabled: false } }),
    },
  )
}
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
export const Progress = (width = 'fill_container') => Ref('AQPfV', { name: 'Progress', width })
export const Alert = (title, body) =>
  Ref(
    'ogW5t',
    { name: `Alert / ${title}`, width: 'fill_container' },
    { L7SHNm: { content: title }, F9kE6W: { content: body } },
  )
/* ---------- file writer ---------- */
/* every placed node gets a stable id hashed from the page, the frame label and its tree path, so
   regenerating an unchanged page rewrites its file byte for byte */
const clone = (n, stamp, path) => {
  if (Array.isArray(n)) return n.map((c, i) => clone(c, stamp, `${path}.${i}`))
  if (!n || typeof n !== 'object') return n
  const o = {}
  for (const [k, v] of Object.entries(n))
    if (k !== '_state')
      o[k] =
        k === 'id'
          ? stamp(path)
          : k === 'descendants'
            ? cloneDesc(v, stamp, `${path}/${k}`)
            : clone(v, stamp, `${path}/${k}`)
  return o
}
const cloneDesc = (d, stamp, path) =>
  Object.fromEntries(
    Object.entries(d).map(([k, v]) => [k, v?.type ? clone(v, stamp, `${path}/${k}`) : v]),
  )

/* pen.dev opens a document empty when any children array holds a non-node (e.g. a `cond && node`
   left `false` inside a raw slot replacement), so strip them everywhere before writing */
const prune = (nodes) => {
  const visit = (n) => {
    if (!n || typeof n !== 'object') return
    if (Array.isArray(n.children)) {
      n.children = n.children.filter((c) => c && typeof c === 'object')
      n.children.forEach(visit)
    }
    if (n.descendants) Object.values(n.descendants).forEach(visit)
  }
  nodes.forEach(visit)
}
/**
 * Writes pencil/web-player-design/<dir>/<dir>.pen: the desktop page in Dark, Light and Dim, the
 * mobile page, then every screen state as a desktop + mobile pair, laid out left to right.
 * Returns the written file and the number of frames placed in it.
 */
export function writePage(root, dir, spec) {
  const { title, route, context, desktop, mobile, extra = [], states = [] } = spec
  used = new Set()
  const stamp = stableIds()
  const frames = []
  let x = 0
  const place = (node, theme, label, note) => {
    const n = clone(node, stamp, `${dir}/${label}`)
    Object.assign(n, {
      x,
      y: 0,
      name: `${title} / ${label}`,
      theme: { [`${ALIAS}:Mode`]: theme },
      context: `${route} — ${context}${note ? ` · ${note}` : ''}`,
    })
    frames.push(n)
    x += n.width + 100
  }
  /* a desktop that takes the theme draws each edition itself (e.g. a theme switch showing its value) */
  const d = desktop('Dark')
  place(d, 'Dark', 'Desktop / Dark')
  place(desktop.length ? desktop('Light') : d, 'Light', 'Desktop / Light')
  place(desktop.length ? desktop('Dim') : d, 'Dim', 'Desktop / Dim')
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
  prune(frames)
  writeFileSync(
    file,
    JSON.stringify(
      { version: '2.20', imports: { [ALIAS]: `${LIB_DIR}${LIB_FILE}` }, children: frames },
      null,
      2,
    ),
  )
  return { file, frames: frames.length }
}
