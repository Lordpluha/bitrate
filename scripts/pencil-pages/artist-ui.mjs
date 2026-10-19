// Artist-workspace composition helpers — library instances only.
import { id, C } from './kit.mjs'
import { R, L, Row, Col, Tx } from './ui.mjs'

const NAV = {
  dashboard: ['layout-dashboard', 'Dashboard'],
  music: ['disc-3', 'Music'],
  promotion: ['megaphone', 'Promotion'],
  analytics: ['chart-column', 'Analytics'],
  profile: ['user-round', 'Profile'],
  settings: ['settings', 'Settings'],
}
const activeNav = (nav) =>
  nav
    ? {
        [`nav_${nav}`]: R(
          'Artist/Nav Item Active',
          { name: `Nav / ${NAV[nav][1]}` },
          { icon: { icon: NAV[nav][0] }, label: { content: NAV[nav][1] } },
        ),
      }
    : {}
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

/** Desktop workspace page: sidebar with `nav` active, breadcrumb, header action, content. */
export function Shell(name, { nav, crumb, action, actionIcon = 'plus', height = 1040 }, content) {
  return frame(
    name,
    1440,
    height,
    R(
      'Artist Shell/Desktop',
      { width: 1440, height },
      {
        ...activeNav(nav),
        breadcrumb: { content: `Workspace / ${crumb}` },
        action: action ? undefined : { enabled: false },
        actionLabel: action ? { content: action } : undefined,
        actionIcon:
          action && actionIcon ? { icon: actionIcon } : action ? { enabled: false } : undefined,
        content: L(
          {
            name: 'Content',
            layout: 'vertical',
            gap: 28,
            padding: [28, 32],
            clip: true,
            width: 'fill_container',
            height: 'fill_container',
          },
          content,
        ),
      },
    ),
  )
}
export const MShell = (name, content, height = 844) =>
  frame(
    name,
    390,
    height,
    R(
      'Artist Shell/Mobile',
      { width: 390, height },
      {
        content: L(
          {
            name: 'Content',
            layout: 'vertical',
            gap: 20,
            padding: [20, 16],
            clip: true,
            width: 'fill_container',
            height: 'fill_container',
          },
          content,
        ),
      },
    ),
  )

export const PageHeader = (title, subtitle, actions = [], eyebrow) =>
  R(
    'Artist/Page Header',
    {},
    {
      eyebrow: eyebrow ? { content: eyebrow } : { enabled: false },
      title: { content: title },
      subtitle: subtitle ? { content: subtitle } : { enabled: false },
      actions: L({ name: 'Actions', gap: 10, alignItems: 'center' }, actions),
    },
  )
const TONE = {
  draft: 'Neutral',
  processing: 'Info',
  'in review': 'Info',
  'review in progress': 'Info',
  submitted: 'Info',
  pending: 'Neutral',
  'not connected': 'Neutral',
  unavailable: 'Neutral',
  off: 'Neutral',
  'not applied': 'Neutral',
  scheduled: 'Info',
  paused: 'Warning',
  'needs changes': 'Warning',
  'changes requested': 'Warning',
  'needs attention': 'Warning',
  'needs role': 'Warning',
  'needs details': 'Warning',
  blocker: 'Warning',
  'review blocker': 'Warning',
  ready: 'Success',
  published: 'Success',
  live: 'Success',
  complete: 'Success',
  completed: 'Success',
  connected: 'Success',
  verified: 'Success',
  active: 'Success',
  enabled: 'Success',
  current: 'Info',
  selected: 'Info',
  approved: 'Success',
  delivered: 'Success',
  'upload failed': 'Error',
  'processing failed': 'Error',
  error: 'Error',
  'save failed': 'Error',
  failed: 'Error',
  never: 'Error',
  allowed: 'Success',
}
export const Status = (label, tone) =>
  R(`Status/${tone ?? TONE[label.toLowerCase()] ?? 'Neutral'}`, {}, { label: { content: label } })
export const Kv = (key, value) =>
  R(
    'Key Value Row',
    {},
    {
      key: { content: key },
      value: L({ name: 'Value', gap: 8, alignItems: 'center' }, [
        typeof value === 'string' ? Tx('Body Strong', value) : value,
      ]),
    },
  )
export const Check = (kind, title, meta, action) =>
  R(
    `Checklist Row/${kind}`,
    {},
    {
      title: { content: title },
      meta: meta ? { content: meta } : { enabled: false },
      action: action ? { content: action } : { enabled: false },
    },
  )
export const Th = (cols) =>
  R(
    'Table/Header Row',
    {},
    {
      cells: L(
        { name: 'Cells', gap: 16, alignItems: 'center', width: 'fill_container' },
        cols.map(([t, w]) => Tx('Caption', t, { width: w ?? 'fill_container' })),
      ),
    },
  )
export const Tr = (cells, selected) =>
  R(
    selected ? 'Table/Row Selected' : 'Table/Row',
    {},
    { cells: L({ name: 'Cells', gap: 16, alignItems: 'center', width: 'fill_container' }, cells) },
  )
export const cell = (text, w = 'fill_container', style = 'Muted') =>
  typeof text === 'string'
    ? Tx(style, text, { width: w })
    : L({ name: 'Cell', width: w, gap: 8, alignItems: 'center' }, [text])
export const Option = (title, desc, selected) =>
  R(
    selected ? 'Option Card/Selected' : 'Option Card',
    {},
    { title: { content: title }, desc: desc ? { content: desc } : { enabled: false } },
  )
export const Person = (initials, name, meta, tags = []) =>
  R(
    'Person Row',
    {},
    {
      initials: { content: initials },
      name: { content: name },
      meta: { content: meta },
      tags: L({ name: 'Tags', gap: 6, alignItems: 'center' }, tags),
    },
  )
export const DateRow = (month, day, title, meta) =>
  R(
    'Date Row',
    {},
    {
      month: { content: month },
      day: { content: day },
      title: { content: title },
      meta: { content: meta },
    },
  )
export const Activity = (text, meta) =>
  R('Activity Item', {}, { text: { content: text }, meta: { content: meta } })
export const Result = (type, title, meta, selected) =>
  R(
    selected ? 'Result Row/Selected' : 'Result Row',
    {},
    { type: { content: type }, title: { content: title }, meta: { content: meta } },
  )
export const Upload = (name, meta, action = 'Cancel') =>
  R(
    'Upload Progress',
    {},
    {
      name: { content: name },
      meta: { content: meta },
      action: action ? { content: action } : { enabled: false },
    },
  )
export const Stepper = (steps, current, compact) =>
  Row(
    { name: 'Stepper', width: 'fill_container', gap: 10 },
    steps
      .flatMap((s, i) => [
        R(
          i < current
            ? 'Stepper/Step Done'
            : i === current
              ? 'Stepper/Step Current'
              : 'Stepper/Step Upcoming',
          {},
          {
            label: compact && i !== current ? { enabled: false } : { content: s },
            ...(i >= current ? { number: { content: String(i + 1) } } : {}),
          },
        ),
        i < steps.length - 1
          ? R(i < current ? 'Stepper/Connector Done' : 'Stepper/Connector')
          : null,
      ])
      .filter(Boolean),
  )
export const Demo = (t = 'Demo workspace · Illustrative data') => Tx('Caption', t)
export const two = (m, left, right, rightW = 380) =>
  m
    ? [left, right].flat()
    : [
        Row({ name: 'Columns', width: 'fill_container', gap: 24, alignItems: 'start' }, [
          Col({ name: 'Main Column', width: 'fill_container', gap: 20 }, [left].flat()),
          Col({ name: 'Side Column', width: rightW, gap: 20 }, [right].flat()),
        ]),
      ]
