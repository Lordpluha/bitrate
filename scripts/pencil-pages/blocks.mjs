// Builds the "00E • Page Blocks" components into the library and records a registry of their
// ids and overridable parts, so screens can be composed from library instances only.
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import {
  setMode,
  reserve,
  C,
  T,
  P,
  H,
  I,
  F,
  Row,
  Col,
  Ref,
  Badge,
  Button,
  img,
  ART,
  id,
} from './kit.mjs'

setMode('lib')
const [libF, regF] = process.argv.slice(2)
const lib = JSON.parse(readFileSync(libF, 'utf8'))
const ids = []
/* ids of the page-blocks page are regenerated deterministically below, so they are not reserved */
const collect = (n) => {
  if (Array.isArray(n)) return n.forEach(collect)
  if (!n || typeof n !== 'object') return
  if (n.name === '00E • Page Blocks' || n.name === '09 • Toasts') return
  if (n.id) ids.push(n.id)
  Object.values(n).forEach(collect)
}
collect(lib.children)
reserve(ids)
/* the library is one flex root; page blocks live in its Components row */
const root = lib.children.find((c) => c.id === 'dsRoot')
const row = root.children.find((c) => c.id === 'dsRowC')
const at = row.children.findIndex((c) => c.name === '00E • Page Blocks')

const reg = {}
const part = (p, node) => Object.assign(node, { _part: p })
/* stable ids: a component's nodes get ids hashed from its name and their position in the tree, so a
   rebuild without structural changes keeps every id and open designs never point at vanished nodes */
const ALPHA = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const taken = new Set(ids)
const stable = (key) => {
  for (let salt = 0; ; salt++) {
    let h = 2166136261
    for (const ch of `${key}#${salt}`) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0
    let out = ''
    for (let i = 0; i < 6; i++) {
      out += ALPHA[h % 62]
      h = Math.imul(h ^ (h >>> 13), 2246822507) >>> 0
    }
    if (!taken.has(out)) {
      taken.add(out)
      return out
    }
  }
}
const restamp = (name, node) => {
  const visit = (n, path) => {
    if (!n || typeof n !== 'object' || !n.id) return
    n.id = stable(`${name}/${path}`)
    ;(n.children ?? []).forEach((c, i) => {
      visit(c, `${path}.${i}`)
    })
  }
  visit(node, '0')
}
const comp = (name, node) => {
  restamp(name, node)
  node.reusable = true
  node.name = name
  const parts = {}
  const walk = (n) => {
    if (!n || typeof n !== 'object') return
    if (n._part) {
      parts[n._part] = n.id
      delete n._part
    }
    ;(n.children ?? []).forEach(walk)
  }
  walk(node)
  reg[name] = { id: node.id, parts }
  return node
}
const txt = (name, content, o) => comp(name, part('text', T(content, o)))
const icn = (name, fill) => comp(name, I('circle', { fill, width: 20, height: 20 }))
const cover = (o = {}) =>
  F({ name: 'Cover', width: 48, height: 48, cornerRadius: 8, fill: img(ART.afterglow), ...o })
const gradient = (a, b, rot = 225) => ({
  type: 'gradient',
  gradientType: 'linear',
  rotation: rot,
  colors: [
    { color: a, position: 0 },
    { color: b, position: 1 },
  ],
})
const slot = (p, o = {}) =>
  part(p, F({ name: 'Slot', layout: 'vertical', gap: 12, width: 'fill_container', slot: [], ...o }))
const muted = (s, o = {}) => T(s, { fontSize: 13, fill: C.mutedForeground, ...o })
const iconBtn = (icon) =>
  F(
    {
      name: 'Icon Button',
      width: 36,
      height: 36,
      cornerRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      stroke: C.border,
      strokeWidth: 1,
    },
    [I(icon, { width: 18, height: 18, fill: C.foreground })],
  )

const blocks = []
const add = (...n) => blocks.push(...n)

/* typography */
add(
  txt('Text/Display', 'Display', {
    fontFamily: 'font-heading',
    fontSize: 54,
    fontWeight: '700',
    letterSpacing: -1.6,
    lineHeight: 1.05,
  }),
  txt('Text/Display Primary', '404', {
    fontFamily: 'font-heading',
    fontSize: 104,
    fontWeight: '700',
    fill: C.primary,
  }),
  txt('Text/H1', 'Heading 1', {
    fontFamily: 'font-heading',
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.8,
    lineHeight: 1.05,
  }),
  txt('Text/H2', 'Heading 2', {
    fontFamily: 'font-heading',
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: -0.4,
  }),
  txt('Text/H3', 'Heading 3', { fontFamily: 'font-heading', fontSize: 19, fontWeight: '600' }),
  txt('Text/H4', 'Heading 4', { fontFamily: 'font-heading', fontSize: 16, fontWeight: '600' }),
  txt('Text/Body', 'Body', {}),
  txt('Text/Body Strong', 'Body strong', { fontWeight: '600' }),
  txt('Text/Body Large', 'Body large', { fontSize: 16 }),
  txt('Text/Paragraph', 'Paragraph text that wraps to its container.', {
    fill: C.mutedForeground,
    lineHeight: 1.5,
    textGrowth: 'fixed-width',
    width: 360,
  }),
  txt('Text/Muted', 'Muted', { fontSize: 13, fill: C.mutedForeground }),
  txt('Text/Caption', 'Caption', { fontSize: 12, fill: C.mutedForeground }),
  txt('Text/Eyebrow', 'EYEBROW', {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.2,
    fill: C.mutedForeground,
  }),
  txt('Text/Link', 'Link', { fontSize: 13, fontWeight: '600', fill: C.primary }),
  txt('Text/Accent Heading', 'Accent', {
    fontFamily: 'font-heading',
    fontSize: 24,
    fontWeight: '700',
    fill: C.accent,
  }),
  txt('Text/Error', 'Error message', { fontSize: 12, fill: C.destructive }),
  txt('Text/Code', 'JBSW Y3DP EHPK 3PXP', {
    fontFamily: 'JetBrains Mono',
    fontSize: 18,
    fontWeight: '600',
  }),
  txt('Text/Lyric Active', 'Current lyric line', {
    fontFamily: 'font-heading',
    fontSize: 34,
    fontWeight: '700',
    textGrowth: 'fixed-width',
    width: 720,
  }),
  txt('Text/Lyric', 'Upcoming lyric line', {
    fontFamily: 'font-heading',
    fontSize: 34,
    fontWeight: '700',
    fill: C.mutedForeground,
    textGrowth: 'fixed-width',
    width: 720,
  }),
  txt('Text/Lyric Past', 'Past lyric line', {
    fontFamily: 'font-heading',
    fontSize: 34,
    fontWeight: '700',
    fill: C.textSubdued,
    textGrowth: 'fixed-width',
    width: 720,
  }),
  txt('Text/On Media', 'On artwork', { fill: C.white }),
  txt('Text/On Media Display', 'On artwork', {
    fontFamily: 'font-heading',
    fontSize: 60,
    fontWeight: '700',
    fill: C.white,
  }),
)
/* icons */
add(
  icn('Icon/Muted', C.mutedForeground),
  icn('Icon/Foreground', C.foreground),
  icn('Icon/Primary', C.primary),
  icn('Icon/Destructive', C.destructive),
  icn('Icon/Success', C.success),
  icn('Icon/Info', C.info),
  icn('Icon/On Media', C.white),
)
/* media */
add(
  comp('Media/Cover', part('image', cover())),
  comp('Media/Cover Large', part('image', cover({ width: 200, height: 200, cornerRadius: 12 }))),
  comp(
    'Media/Avatar',
    part('image', cover({ width: 40, height: 40, cornerRadius: 9999, fill: img(ART.avatar2) })),
  ),
  comp(
    'Media/Liked Cover',
    F(
      {
        name: 'Liked',
        width: 200,
        height: 200,
        cornerRadius: 12,
        fill: gradient(C.gradientPrimaryFrom, C.gradientPrimaryTo),
        justifyContent: 'center',
        alignItems: 'center',
      },
      [part('icon', I('heart', { width: 64, height: 64, fill: C.white }))],
    ),
  ),
  comp(
    'Media/Liked Cover Small',
    F(
      {
        name: 'Liked',
        width: 48,
        height: 48,
        cornerRadius: 6,
        fill: gradient(C.gradientPrimaryFrom, C.gradientPrimaryTo),
        justifyContent: 'center',
        alignItems: 'center',
      },
      [I('heart', { width: 20, height: 20, fill: C.white })],
    ),
  ),
  comp(
    'Media/Hero Image',
    part(
      'image',
      F({ name: 'Hero', width: 640, height: 320, cornerRadius: 16, fill: img(ART.hero) }),
    ),
  ),
)
/* chips, play */
add(
  comp(
    'Chip/Default',
    F(
      {
        name: 'Chip',
        height: 32,
        padding: [0, 14],
        cornerRadius: 16,
        alignItems: 'center',
        stroke: C.border,
        strokeWidth: 1,
      },
      [part('label', T('Chip', { fontSize: 13 }))],
    ),
  ),
  comp(
    'Chip/Active',
    F(
      {
        name: 'Chip',
        height: 32,
        padding: [0, 14],
        cornerRadius: 16,
        alignItems: 'center',
        fill: C.primary,
      },
      [part('label', T('Chip', { fontSize: 13, fontWeight: '600', fill: C.primaryForeground }))],
    ),
  ),
  comp(
    'Button/Play',
    F(
      {
        name: 'Play',
        width: 56,
        height: 56,
        cornerRadius: 28,
        fill: C.primary,
        justifyContent: 'center',
        alignItems: 'center',
      },
      [part('icon', I('play', { width: 24, height: 24, fill: C.primaryForeground }))],
    ),
  ),
  comp(
    'Button/Play Small',
    F(
      {
        name: 'Play',
        width: 40,
        height: 40,
        cornerRadius: 20,
        fill: C.primary,
        justifyContent: 'center',
        alignItems: 'center',
      },
      [part('icon', I('play', { width: 18, height: 18, fill: C.primaryForeground }))],
    ),
  ),
  comp(
    'Button/Icon Outline',
    F(
      {
        name: 'Icon Button',
        width: 36,
        height: 36,
        cornerRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        stroke: C.border,
        strokeWidth: 1,
      },
      [part('icon', I('plus', { width: 18, height: 18, fill: C.foreground }))],
    ),
  ),
  comp(
    'Button/Icon Ghost',
    F(
      {
        name: 'Icon Button',
        width: 36,
        height: 36,
        cornerRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
      },
      [part('icon', I('plus', { width: 20, height: 20, fill: C.foreground }))],
    ),
  ),
)
/* collection header + action bars + section header + table header */
const collectionHeader = (name, coverNode) =>
  comp(
    name,
    F(
      {
        name: 'Collection Header',
        width: 'fill_container',
        height: 260,
        padding: 28,
        gap: 24,
        alignItems: 'end',
        cornerRadius: 16,
        fill: gradient(C.heroWash, C.card, 180),
      },
      [
        coverNode,
        Col({ name: 'Copy', gap: 10, width: 'fill_container' }, [
          part('type', T('Playlist', { fontSize: 13, fontWeight: '600' })),
          part('title', H('Title', 64, { fontWeight: '700' })),
          Row({ gap: 8 }, [
            part('owner', T('Owner', { fontWeight: '600' })),
            part('meta', muted('· 24 songs')),
          ]),
        ]),
      ],
    ),
  )
add(
  collectionHeader(
    'Collection Header',
    part('cover', cover({ width: 200, height: 200, cornerRadius: 12 })),
  ),
  collectionHeader(
    'Collection Header/Liked',
    F(
      {
        name: 'Liked',
        width: 200,
        height: 200,
        cornerRadius: 12,
        fill: gradient(C.gradientPrimaryFrom, C.gradientPrimaryTo),
        justifyContent: 'center',
        alignItems: 'center',
      },
      [I('heart', { width: 64, height: 64, fill: C.white })],
    ),
  ),
  comp(
    'Action Bar',
    Row({ name: 'Action Bar', gap: 18 }, [
      F(
        {
          name: 'Play',
          width: 56,
          height: 56,
          cornerRadius: 28,
          fill: C.primary,
          justifyContent: 'center',
          alignItems: 'center',
        },
        [I('play', { width: 24, height: 24, fill: C.primaryForeground })],
      ),
      part('shuffle', I('shuffle', { width: 26, height: 26 })),
      part('download', I('circle-arrow-down', { width: 26, height: 26 })),
      part('like', I('heart', { width: 26, height: 26 })),
      part('invite', I('user-plus', { width: 26, height: 26 })),
      part('more', I('ellipsis', { width: 26, height: 26 })),
    ]),
  ),
  comp(
    'Section Header',
    Row({ name: 'Section Header', width: 'fill_container', justifyContent: 'space_between' }, [
      part('title', H('Section', 22)),
      part('action', T('Show all', { fontSize: 13, fontWeight: '600', fill: C.mutedForeground })),
    ]),
  ),
  comp(
    'Track Table/Header',
    Row(
      {
        name: 'Track Table Header',
        width: 'fill_container',
        height: 36,
        padding: [0, 0],
        gap: 0,
        stroke: C.border,
        strokeWidth: { bottom: 1 },
      },
      [
        /* same columns as Track Row/Default: 42 number cell, fluid title, 260 album, 130 added, 90 actions */
        T('#', {
          fontSize: 12,
          fill: C.mutedForeground,
          width: 42,
          textGrowth: 'fixed-width',
          textAlign: 'center',
        }),
        T('Title', {
          fontSize: 12,
          fill: C.mutedForeground,
          width: 'fill_container',
          textGrowth: 'fixed-width',
        }),
        part(
          'album',
          T('Album', {
            fontSize: 12,
            fill: C.mutedForeground,
            width: 260,
            textGrowth: 'fixed-width',
          }),
        ),
        part(
          'added',
          T('Date added', {
            fontSize: 12,
            fill: C.mutedForeground,
            width: 130,
            textGrowth: 'fixed-width',
          }),
        ),
        F({ name: 'Duration Column', width: 90, justifyContent: 'end' }, [
          I('clock-3', { width: 16, height: 16 }),
        ]),
      ],
    ),
  ),
  comp(
    'Track Row/Playing',
    Row(
      {
        name: 'Track Row',
        width: 'fill_container',
        height: 68,
        padding: [0, 12],
        gap: 16,
        cornerRadius: 8,
        fill: C.muted,
      },
      [
        F({ name: 'Number Cell', width: 30 }, [
          I('audio-lines', { width: 16, height: 16, fill: C.primary }),
        ]),
        Row({ name: 'Title Cell', gap: 12, width: 'fill_container' }, [
          part('cover', cover({ width: 46, height: 46, cornerRadius: 6 })),
          Col({ gap: 2 }, [
            part('title', T('Afterglow', { fontWeight: '600', fill: C.primary })),
            part('artist', muted('Nova & the Static')),
          ]),
        ]),
        part('album', muted('Afterglow', { width: 260, textGrowth: 'fixed-width' })),
        part(
          'added',
          T('Today', { fontSize: 13, fill: C.textSubdued, width: 130, textGrowth: 'fixed-width' }),
        ),
        Row({ name: 'Actions', width: 90, gap: 12, justifyContent: 'end' }, [
          I('heart', { width: 16, height: 16, fill: C.primary }),
          part('duration', muted('3:42')),
        ]),
      ],
    ),
  ),
)
/* mobile */
add(
  comp(
    'Mobile/Status Bar',
    Row(
      {
        name: 'Status Bar',
        width: 390,
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
    ),
  ),
  comp(
    'Mobile/Header',
    Row({ name: 'Mobile Header', width: 390, height: 52, padding: [0, 8], gap: 4 }, [
      part(
        'back',
        F({ name: 'Back', width: 36, height: 36, justifyContent: 'center', alignItems: 'center' }, [
          part('backIcon', I('chevron-left', { width: 22, height: 22, fill: C.foreground })),
        ]),
      ),
      part(
        'title',
        T('Title', {
          fontFamily: 'font-heading',
          fontSize: 18,
          fontWeight: '600',
          width: 'fill_container',
          textGrowth: 'fixed-width',
        }),
      ),
      part(
        'action1',
        F(
          {
            name: 'Action 1',
            width: 36,
            height: 36,
            justifyContent: 'center',
            alignItems: 'center',
          },
          [part('action1Icon', I('search', { width: 20, height: 20, fill: C.foreground }))],
        ),
      ),
      part(
        'action2',
        F(
          {
            name: 'Action 2',
            width: 36,
            height: 36,
            justifyContent: 'center',
            alignItems: 'center',
          },
          [part('action2Icon', I('plus', { width: 20, height: 20, fill: C.foreground }))],
        ),
      ),
    ]),
  ),
)
/* forms, auth, surfaces */
add(
  comp(
    'Setting Row',
    Row(
      {
        name: 'Setting Row',
        width: 'fill_container',
        padding: [14, 0],
        gap: 24,
        stroke: C.border,
        strokeWidth: { bottom: 1 },
      },
      [
        Col({ gap: 4, width: 'fill_container' }, [
          part(
            'title',
            T('Setting', { fontWeight: '600', textGrowth: 'fixed-width', width: 'fill_container' }),
          ),
          part('desc', P('Description of what this setting changes.', { fontSize: 13 })),
        ]),
        slot('control', { width: 'fit_content', layout: 'horizontal', alignItems: 'center' }),
      ],
    ),
  ),
  comp(
    'Form/Field Error',
    Row({ name: 'Field Error', gap: 8 }, [
      I('circle-alert', { width: 14, height: 14, fill: C.destructive }),
      part('text', T('Error message', { fontSize: 12, fill: C.destructive })),
    ]),
  ),
  comp(
    'Form/Checkbox Row',
    Row({ name: 'Checkbox Row', width: 360, gap: 10, alignItems: 'start' }, [
      F({ name: 'Box', width: 16, height: 16, cornerRadius: 4, stroke: C.input, strokeWidth: 1 }),
      part('label', P('I accept the terms.', { fontSize: 13, fill: C.foreground })),
    ]),
  ),
  comp(
    'Form/Drop Zone',
    F(
      {
        name: 'Drop Zone',
        width: 'fill_container',
        height: 120,
        cornerRadius: 12,
        stroke: C.border,
        strokeWidth: 1,
        layout: 'vertical',
        gap: 8,
        justifyContent: 'center',
        alignItems: 'center',
      },
      [
        I('image-up', { width: 24, height: 24, fill: C.foreground }),
        part('text', T('Drag an image here, or click to choose', { fontSize: 13 })),
        part('button', Button('Choose file', 'outline')),
      ],
    ),
  ),
  comp(
    'Auth/Or Divider',
    Row({ name: 'Or Divider', width: 'fill_container', gap: 12 }, [
      F({ width: 'fill_container', height: 1, fill: C.border }),
      T('or', { fontSize: 13, fill: C.mutedForeground }),
      F({ width: 'fill_container', height: 1, fill: C.border }),
    ]),
  ),
  comp(
    'Auth/Provider',
    F(
      {
        name: 'Provider',
        width: 'fill_container',
        height: 40,
        cornerRadius: 8,
        stroke: C.border,
        strokeWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
      },
      [
        part('label', T('Provider', { fontSize: 12, fontWeight: '600' })),
        part('soon', Badge('Soon', 'secondary')),
      ],
    ),
  ),
  comp(
    'Auth/Brand Panel',
    F(
      {
        name: 'Brand Panel',
        width: 640,
        height: 900,
        layout: 'vertical',
        justifyContent: 'space_between',
        padding: 48,
        fill: img(ART.hero),
      },
      [
        Row({ gap: 10 }, [
          Ref('OVOcb', { name: 'Mark', width: 32, height: 32 }),
          T('Bitrate', {
            fontFamily: 'font-heading',
            fontSize: 22,
            fontWeight: '600',
            fill: C.white,
          }),
        ]),
        Col({ gap: 12, width: 'fill_container' }, [
          part(
            'headline',
            H('Your music, ready when you are.', 44, {
              fill: C.white,
              textGrowth: 'fixed-width',
              width: 460,
              lineHeight: 1.05,
            }),
          ),
          part(
            'sub',
            T('Listen, save and return to your library from the browser.', {
              fill: C.neutral200,
              fontSize: 16,
            }),
          ),
        ]),
      ],
    ),
  ),
  comp(
    'Logo/Lockup',
    Row({ name: 'Lockup', gap: 10 }, [
      Ref('OVOcb', { name: 'Mark', width: 30, height: 30 }),
      T('Bitrate', { fontFamily: 'font-heading', fontSize: 20, fontWeight: '600' }),
    ]),
  ),
  comp(
    'Surface/Panel',
    F(
      {
        name: 'Panel',
        width: 'fill_container',
        layout: 'vertical',
        padding: 24,
        gap: 16,
        cornerRadius: 14,
        fill: C.card,
        stroke: C.border,
        strokeWidth: 1,
      },
      [slot('content')],
    ),
  ),
  comp(
    'Surface/Menu',
    F(
      {
        name: 'Menu',
        width: 260,
        layout: 'vertical',
        padding: 6,
        cornerRadius: 10,
        fill: C.popover,
        stroke: C.border,
        strokeWidth: 1,
        effect: { type: 'shadow', color: C.shadow, offset: { x: 0, y: 12 }, blur: 32 },
      },
      [slot('items', { gap: 0 })],
    ),
  ),
  comp(
    'Menu/Item',
    Row({ name: 'Menu Item', width: 'fill_container', height: 36, padding: [0, 10] }, [
      part('label', T('Item', { fontSize: 13 })),
    ]),
  ),
  comp(
    'Menu/Item Destructive',
    Row({ name: 'Menu Item', width: 'fill_container', height: 36, padding: [0, 10] }, [
      part('label', T('Delete', { fontSize: 13, fill: C.destructive })),
    ]),
  ),
  comp(
    'Menu/Item Disabled',
    Row({ name: 'Menu Item', width: 'fill_container', height: 36, padding: [0, 10] }, [
      part('label', T('Unavailable', { fontSize: 13, fill: C.textSubdued })),
    ]),
  ),
  comp(
    'Alert/Warning',
    Row(
      {
        name: 'Warning',
        width: 'fill_container',
        padding: [12, 16],
        gap: 10,
        cornerRadius: 10,
        fill: C.warningSurface,
        stroke: C.warningBorder,
        strokeWidth: 1,
      },
      [
        I('triangle-alert', { width: 16, height: 16, fill: C.warningText }),
        part('text', P('Warning text', { fontSize: 13, fill: C.warningText })),
      ],
    ),
  ),
  comp(
    'Note',
    Col({ name: 'Note', width: 'fill_container', padding: 16, cornerRadius: 10, fill: C.muted }, [
      part('text', P('Note text', { fontSize: 13 })),
    ]),
  ),
  comp(
    'Public Header',
    Row(
      {
        name: 'Public Header',
        width: 1440,
        height: 72,
        padding: [0, 48],
        justifyContent: 'space_between',
        stroke: C.border,
        strokeWidth: { bottom: 1 },
      },
      [
        Ref(reg['Logo/Lockup'].id, { name: 'Lockup' }),
        Row(
          { gap: 28 },
          ['Premium', 'Support', 'Download'].map((l) =>
            T(l, { fontSize: 14, fill: C.mutedForeground }),
          ),
        ),
        Row({ gap: 10 }, [Button('Login', 'ghost'), Button('Register', 'default')]),
      ],
    ),
  ),
)
/* music content */
add(
  comp(
    'Genre Tile',
    F(
      {
        name: 'Genre Tile',
        width: 192,
        height: 120,
        cornerRadius: 12,
        padding: 16,
        fill: C.purple600,
        clip: true,
      },
      [part('label', H('Genre', 20, { fontWeight: '700', fill: C.white }))],
    ),
  ),
  comp(
    'Episode Row',
    Row(
      {
        name: 'Episode Row',
        width: 'fill_container',
        padding: [16, 0],
        gap: 16,
        stroke: C.border,
        strokeWidth: { bottom: 1 },
      },
      [
        part('cover', cover({ width: 72, height: 72, fill: img(ART.stage) })),
        Col({ gap: 4, width: 'fill_container' }, [
          part('title', T('Episode title', { fontWeight: '600', fontSize: 15 })),
          part('meta', muted('Date · 48 min')),
        ]),
        I('bookmark', { width: 20, height: 20 }),
        F(
          {
            name: 'Play',
            width: 40,
            height: 40,
            cornerRadius: 20,
            fill: C.primary,
            justifyContent: 'center',
            alignItems: 'center',
          },
          [I('play', { width: 18, height: 18, fill: C.primaryForeground })],
        ),
      ],
    ),
  ),
  comp(
    'Profile Header',
    Row(
      {
        name: 'Profile Header',
        width: 'fill_container',
        gap: 28,
        padding: [28, 0],
        alignItems: 'end',
      },
      [
        part(
          'avatar',
          cover({ width: 180, height: 180, cornerRadius: 9999, fill: img(ART.avatar2) }),
        ),
        Col({ gap: 8, width: 'fill_container' }, [
          part('label', T('Profile', { fontSize: 13, fontWeight: '600' })),
          part('name', H('Name', 72, { fontWeight: '700' })),
          part('sub', muted('Description')),
          slot('action', { layout: 'horizontal', width: 'fit_content' }),
        ]),
      ],
    ),
  ),
  comp(
    'Artist Hero',
    F(
      {
        name: 'Artist Hero',
        width: 'fill_container',
        height: 320,
        padding: 32,
        layout: 'vertical',
        justifyContent: 'end',
        gap: 8,
        cornerRadius: 16,
        fill: img(ART.luma),
      },
      [
        Row({ gap: 6 }, [
          I('badge-check', { width: 20, height: 20, fill: C.info }),
          T('Verified artist', { fontSize: 13, fontWeight: '600', fill: C.white }),
        ]),
        part('name', H('Artist', 80, { fontWeight: '700', fill: C.white })),
        part('listeners', T('1,284,503 monthly listeners', { fill: C.white })),
      ],
    ),
  ),
  comp(
    'Stat Tile',
    F(
      {
        name: 'Stat Tile',
        width: 'fill_container',
        layout: 'vertical',
        gap: 6,
        padding: 20,
        cornerRadius: 14,
        fill: C.card,
        stroke: C.border,
        strokeWidth: 1,
      },
      [
        part('label', muted('Label', { textGrowth: 'fixed-width', width: 'fill_container' })),
        part('value', H('0', 36, { fontWeight: '700' })),
        part('sub', muted('Sub', { textGrowth: 'fixed-width', width: 'fill_container' })),
      ],
    ),
  ),
  comp(
    'Notification Row/Unread',
    Row(
      {
        name: 'Notification',
        width: 'fill_container',
        padding: [14, 16],
        gap: 14,
        cornerRadius: 10,
        fill: C.muted,
      },
      [
        F(
          {
            width: 40,
            height: 40,
            cornerRadius: 20,
            fill: C.secondary,
            justifyContent: 'center',
            alignItems: 'center',
          },
          [part('icon', I('bell', { width: 18, height: 18, fill: C.foreground }))],
        ),
        Col({ gap: 2, width: 'fill_container' }, [
          part(
            'text',
            T('Notification', {
              fontWeight: '600',
              textGrowth: 'fixed-width',
              width: 'fill_container',
            }),
          ),
          part('time', muted('now')),
        ]),
        F({ width: 8, height: 8, cornerRadius: 4, fill: C.primary }),
      ],
    ),
  ),
  comp(
    'Notification Row/Read',
    Row(
      {
        name: 'Notification',
        width: 'fill_container',
        padding: [14, 16],
        gap: 14,
        cornerRadius: 10,
      },
      [
        F(
          {
            width: 40,
            height: 40,
            cornerRadius: 20,
            fill: C.secondary,
            justifyContent: 'center',
            alignItems: 'center',
          },
          [part('icon', I('bell', { width: 18, height: 18, fill: C.foreground }))],
        ),
        Col({ gap: 2, width: 'fill_container' }, [
          part('text', T('Notification', { textGrowth: 'fixed-width', width: 'fill_container' })),
          part('time', muted('now')),
        ]),
      ],
    ),
  ),
  comp(
    'Activity Row',
    Row(
      {
        name: 'Activity Row',
        width: 'fill_container',
        padding: [14, 16],
        gap: 14,
        stroke: C.border,
        strokeWidth: { bottom: 1 },
      },
      [
        part(
          'avatar',
          cover({ width: 44, height: 44, cornerRadius: 9999, fill: img(ART.avatar3) }),
        ),
        Col({ gap: 2, width: 'fill_container' }, [
          Row({ gap: 4 }, [
            part('name', T('Name', { fontWeight: '600' })),
            part('action', T('liked', { fill: C.mutedForeground })),
          ]),
          part(
            'item',
            T('Track', { fontWeight: '600', textGrowth: 'fixed-width', width: 'fill_container' }),
          ),
          part('time', muted('now')),
        ]),
        part('cover', cover({ width: 52, height: 52, cornerRadius: 6 })),
        part('play', Button('Play', 'secondary', { icon: 'play' })),
      ],
    ),
  ),
  comp(
    'Chart Row',
    Row({ name: 'Chart Row', width: 'fill_container', height: 60, padding: [0, 12], gap: 16 }, [
      part('rank', H('1', 20, { fontWeight: '700', width: 32, textGrowth: 'fixed-width' })),
      part('trend', I('arrow-up', { width: 14, height: 14, fill: C.success })),
      part('cover', cover({ width: 44, height: 44, cornerRadius: 6 })),
      Col({ gap: 2, width: 'fill_container' }, [
        part('title', T('Title', { fontWeight: '600' })),
        part('artist', muted('Artist')),
      ]),
      part('plays', muted('0 plays')),
      part('duration', muted('0:00')),
    ]),
  ),
  comp(
    'Candidate Row',
    Row(
      {
        name: 'Candidate Row',
        width: 'fill_container',
        padding: [10, 14],
        gap: 14,
        cornerRadius: 10,
        stroke: C.border,
        strokeWidth: 1,
      },
      [
        I('grip-vertical', { width: 16, height: 16 }),
        part('rank', T('#1', { fontWeight: '700', width: 28, textGrowth: 'fixed-width' })),
        part('cover', cover({ width: 44, height: 44, cornerRadius: 6 })),
        Col({ gap: 2, width: 'fill_container' }, [
          part('title', T('Title', { fontWeight: '600' })),
          part('meta', muted('Artist · 0:00')),
        ]),
        iconBtn('play'),
        iconBtn('thumbs-up'),
        iconBtn('x'),
      ],
    ),
  ),
  comp(
    'Candidate Row/Compact',
    Row(
      {
        name: 'Candidate Row',
        width: 'fill_container',
        padding: [10, 12],
        gap: 10,
        cornerRadius: 10,
        stroke: C.border,
        strokeWidth: 1,
      },
      [
        part('rank', T('#1', { fontWeight: '700', width: 24, textGrowth: 'fixed-width' })),
        part('cover', cover({ width: 40, height: 40, cornerRadius: 6 })),
        Col({ gap: 2, width: 'fill_container' }, [
          part(
            'title',
            T('Title', { fontWeight: '600', textGrowth: 'fixed-width', width: 'fill_container' }),
          ),
          part('meta', muted('Artist', { textGrowth: 'fixed-width', width: 'fill_container' })),
        ]),
        iconBtn('thumbs-up'),
        iconBtn('x'),
      ],
    ),
  ),
  comp(
    'Artist Hero/Mobile',
    F(
      {
        name: 'Artist Hero',
        width: 358,
        height: 260,
        padding: 16,
        layout: 'vertical',
        justifyContent: 'end',
        gap: 4,
        cornerRadius: 14,
        fill: img(ART.luma),
      },
      [
        Row({ gap: 6 }, [
          I('badge-check', { width: 16, height: 16, fill: C.info }),
          T('Verified artist', { fontSize: 12, fontWeight: '600', fill: C.white }),
        ]),
        part(
          'name',
          H('Artist', 40, {
            fontWeight: '700',
            fill: C.white,
            lineHeight: 1.05,
            textGrowth: 'fixed-width',
            width: 'fill_container',
          }),
        ),
        part('listeners', T('1,284,503 monthly listeners', { fontSize: 13, fill: C.white })),
      ],
    ),
  ),
  comp(
    'Stepper/Step Done',
    Row({ name: 'Step', gap: 8 }, [
      F(
        {
          width: 26,
          height: 26,
          cornerRadius: 13,
          justifyContent: 'center',
          alignItems: 'center',
          fill: C.primary,
        },
        [I('check', { width: 14, height: 14, fill: C.primaryForeground })],
      ),
      part('label', T('Step', { fontSize: 13 })),
    ]),
  ),
  comp(
    'Stepper/Step Current',
    Row({ name: 'Step', gap: 8 }, [
      F(
        {
          width: 26,
          height: 26,
          cornerRadius: 13,
          justifyContent: 'center',
          alignItems: 'center',
          fill: C.primary,
        },
        [part('number', T('2', { fontSize: 12, fontWeight: '700', fill: C.primaryForeground }))],
      ),
      part('label', T('Step', { fontSize: 13, fontWeight: '600' })),
    ]),
  ),
  comp(
    'Stepper/Step Upcoming',
    Row({ name: 'Step', gap: 8 }, [
      F(
        {
          width: 26,
          height: 26,
          cornerRadius: 13,
          justifyContent: 'center',
          alignItems: 'center',
          fill: C.muted,
        },
        [part('number', T('3', { fontSize: 12, fontWeight: '700', fill: C.mutedForeground }))],
      ),
      part('label', T('Step', { fontSize: 13, fill: C.mutedForeground })),
    ]),
  ),
  comp(
    'Stepper/Connector',
    F({ name: 'Connector', width: 'fill_container', height: 1, fill: C.border }),
  ),
  comp(
    'Stepper/Connector Done',
    F({ name: 'Connector', width: 'fill_container', height: 1, fill: C.primary }),
  ),
  comp(
    'Equalizer',
    Row(
      {
        name: 'Equalizer',
        width: 'fill_container',
        height: 160,
        gap: 8,
        justifyContent: 'space_between',
        padding: [12, 16],
        cornerRadius: 12,
        fill: C.muted,
        alignItems: 'end',
      },
      [
        Col({ gap: 46, height: 'fill_container' }, [muted('+12dB'), muted('0dB'), muted('-12dB')]),
        ...[
          ['60Hz', 70],
          ['150Hz', 96],
          ['400Hz', 58],
          ['1KHz', 82],
          ['2.4KHz', 64],
          ['15KHz', 90],
        ].map(([b, h]) =>
          Col({ name: `Band ${b}`, gap: 8, alignItems: 'center' }, [
            F({ width: 10, height: h, cornerRadius: 5, fill: C.primary }),
            muted(b),
          ]),
        ),
      ],
    ),
  ),
  comp(
    'Graph Node',
    Col({ name: 'Graph Node', gap: 8, alignItems: 'center', width: 140 }, [
      part('avatar', cover({ width: 84, height: 84, cornerRadius: 9999, fill: img(ART.night) })),
      part('label', T('Artist', { fontWeight: '600', fontSize: 13 })),
      part('sub', muted('Similar')),
    ]),
  ),
  comp(
    'Graph Node/Focus',
    Col({ name: 'Graph Node', gap: 8, alignItems: 'center', width: 140 }, [
      part(
        'avatar',
        cover({
          width: 112,
          height: 112,
          cornerRadius: 9999,
          fill: img(ART.luma),
          stroke: C.primary,
          strokeWidth: 3,
        }),
      ),
      part('label', T('Artist', { fontWeight: '600', fontSize: 15 })),
      part('sub', muted('You are here')),
    ]),
  ),
  comp(
    'Bar Chart/Bar',
    Col({ name: 'Bar', gap: 8, alignItems: 'center', width: 'fill_container' }, [
      part('bar', F({ width: 'fill_container', height: 100, cornerRadius: 6, fill: C.muted })),
      part('label', muted('Mon')),
    ]),
  ),
  comp(
    'Bar Chart/Bar Highlight',
    Col({ name: 'Bar', gap: 8, alignItems: 'center', width: 'fill_container' }, [
      part('bar', F({ width: 'fill_container', height: 140, cornerRadius: 6, fill: C.primary })),
      part('label', muted('Fri')),
    ]),
  ),
)

/* home & player */
add(
  comp(
    'Quick Tile',
    Row(
      {
        name: 'Quick Tile',
        width: 'fill_container',
        height: 56,
        gap: 12,
        cornerRadius: 8,
        fill: C.card,
        clip: true,
      },
      [
        part('cover', cover({ width: 56, height: 56, cornerRadius: 0 })),
        part(
          'title',
          T('Title', {
            fontSize: 13,
            fontWeight: '600',
            textGrowth: 'fixed-width',
            width: 'fill_container',
          }),
        ),
      ],
    ),
  ),
  comp(
    'Quick Tile/Liked',
    Row(
      {
        name: 'Quick Tile',
        width: 'fill_container',
        height: 56,
        gap: 12,
        cornerRadius: 8,
        fill: C.card,
        clip: true,
      },
      [
        F(
          {
            name: 'Liked',
            width: 56,
            height: 56,
            fill: gradient(C.gradientPrimaryFrom, C.gradientPrimaryTo),
            justifyContent: 'center',
            alignItems: 'center',
          },
          [I('heart', { width: 20, height: 20, fill: C.white })],
        ),
        part(
          'title',
          T('Liked Songs', {
            fontSize: 13,
            fontWeight: '600',
            textGrowth: 'fixed-width',
            width: 'fill_container',
          }),
        ),
      ],
    ),
  ),
  comp(
    'Device Row/Active',
    Row(
      {
        name: 'Device Row',
        width: 'fill_container',
        height: 64,
        padding: [0, 12],
        gap: 12,
        cornerRadius: 12,
        fill: C.muted,
        stroke: C.ring,
        strokeWidth: 1,
      },
      [
        F(
          {
            width: 40,
            height: 40,
            cornerRadius: 8,
            fill: C.surface,
            justifyContent: 'center',
            alignItems: 'center',
          },
          [part('icon', I('laptop', { width: 20, height: 20, fill: C.accent }))],
        ),
        Col({ gap: 2, width: 'fill_container' }, [
          part('name', T('This computer', { fontWeight: '600' })),
          part('status', T('Playing here', { fontSize: 13, fill: C.accent })),
        ]),
        I('audio-lines', { width: 20, height: 20, fill: C.accent }),
      ],
    ),
  ),
  comp(
    'Device Row',
    Row(
      {
        name: 'Device Row',
        width: 'fill_container',
        height: 64,
        padding: [0, 12],
        gap: 12,
        cornerRadius: 12,
      },
      [
        F(
          {
            width: 40,
            height: 40,
            cornerRadius: 8,
            fill: C.surface,
            justifyContent: 'center',
            alignItems: 'center',
          },
          [part('icon', I('speaker', { width: 20, height: 20, fill: C.foreground }))],
        ),
        Col({ gap: 2, width: 'fill_container' }, [
          part('name', T('Device', { fontWeight: '600' })),
          part('status', muted('Available')),
        ]),
      ],
    ),
  ),
  comp(
    'Surface/Sheet',
    F(
      {
        name: 'Sheet',
        width: 390,
        layout: 'vertical',
        gap: 8,
        padding: [8, 16, 34, 16],
        cornerRadius: [20, 20, 0, 0],
        fill: C.popover,
        stroke: C.border,
        strokeWidth: { top: 1 },
      },
      [
        Row(
          {
            name: 'Grabber Row',
            width: 'fill_container',
            justifyContent: 'center',
            padding: [0, 0, 8, 0],
          },
          [F({ name: 'Grabber', width: 36, height: 4, cornerRadius: 2, fill: C.border })],
        ),
        slot('content', { gap: 8 }),
      ],
    ),
  ),
  comp(
    'Seek Bar',
    Col({ name: 'Seek Bar', width: 'fill_container', gap: 8 }, [
      Row({ name: 'Rail', width: 'fill_container', height: 12, gap: 0, alignItems: 'center' }, [
        part(
          'elapsedBar',
          F({ name: 'Elapsed', width: 160, height: 4, cornerRadius: 2, fill: C.primary }),
        ),
        F({ name: 'Thumb', width: 12, height: 12, cornerRadius: 6, fill: C.foreground }),
        F({
          name: 'Remaining',
          width: 'fill_container',
          height: 4,
          cornerRadius: 2,
          fill: C.surface,
        }),
      ]),
      Row({ name: 'Times', width: 'fill_container', justifyContent: 'space_between' }, [
        part('elapsed', T('1:48', { fontSize: 12, fill: C.mutedForeground })),
        part('duration', T('3:42', { fontSize: 12, fill: C.mutedForeground })),
      ]),
    ]),
  ),
  comp(
    'Transport',
    Row({ name: 'Transport', width: 'fill_container', justifyContent: 'space_between' }, [
      I('shuffle', { width: 22, height: 22 }),
      I('skip-back', { width: 30, height: 30, fill: C.foreground }),
      F(
        {
          name: 'Play',
          width: 68,
          height: 68,
          cornerRadius: 34,
          fill: C.primary,
          justifyContent: 'center',
          alignItems: 'center',
        },
        [part('playIcon', I('pause', { width: 30, height: 30, fill: C.primaryForeground }))],
      ),
      I('skip-forward', { width: 30, height: 30, fill: C.foreground }),
      part('repeat', I('repeat', { width: 22, height: 22, fill: C.accent })),
    ]),
  ),
)

/* landing */
/* footer: animated links (underline reveal on hover) and the service-health pill/panel */
const footLink = (name, hover) =>
  comp(
    name,
    Col({ name: 'Link', gap: 3 }, [
      part('label', T('Link', { fontSize: 14, fill: hover ? C.foreground : C.mutedForeground })),
      hover
        ? F({ name: 'Underline', width: 'fill_container', height: 1.5, fill: C.foreground })
        : F({ name: 'Underline', width: 'fill_container', height: 1.5 }),
    ]),
  )
add(footLink('Link/Footer', false), footLink('Link/Footer Hover', true))
const HEALTH = {
  Operational: [C.success, C.successText, 'All systems operational'],
  Degraded: [C.warning, C.warningText, 'Degraded performance'],
  Outage: [C.destructive, C.errorText, 'Partial outage'],
  Maintenance: [C.info, C.infoText, 'Scheduled maintenance'],
  Checking: [C.mutedForeground, C.mutedForeground, 'Checking status…'],
}
const BARS = {
  Operational: () => 'g',
  Degraded: (i) => (i > 26 ? 'w' : 'g'),
  Outage: (i) => (i === 29 ? 'e' : i === 28 || i === 12 ? 'w' : 'g'),
  Maintenance: (i) => (i === 29 ? 'i' : 'g'),
  Checking: () => 'm',
}
const barFill = { g: C.success, w: C.warning, e: C.destructive, i: C.info, m: C.muted }
for (const [k, [dot, text, label]] of Object.entries(HEALTH)) {
  add(
    comp(
      `Health/Pill ${k}`,
      Row(
        {
          name: 'Health Pill',
          height: 32,
          padding: [0, 12],
          gap: 8,
          cornerRadius: 16,
          fill: C.card,
          stroke: C.border,
          strokeWidth: 1,
        },
        [
          F({ name: 'Dot', width: 8, height: 8, cornerRadius: 4, fill: dot }),
          part('label', T(label, { fontSize: 13, fontWeight: '500' })),
          I('chevron-up', { width: 14, height: 14, fill: C.mutedForeground }),
        ],
      ),
    ),
    comp(
      `Health/Service ${k}`,
      Row(
        {
          name: 'Service',
          width: 'fill_container',
          padding: [10, 0],
          gap: 14,
          stroke: C.border,
          strokeWidth: { bottom: 1 },
        },
        [
          Col({ gap: 2, width: 150 }, [
            part('name', T('Service', { fontSize: 13, fontWeight: '600' })),
            part('meta', T('99.98% · 90 days', { fontSize: 11, fill: C.mutedForeground })),
          ]),
          Row(
            { name: 'Uptime', gap: 2, width: 'fill_container', alignItems: 'center' },
            Array.from({ length: 30 }, (_, i) =>
              F({ name: 'Day', width: 4, height: 22, cornerRadius: 1, fill: barFill[BARS[k](i)] }),
            ),
          ),
          Row({ name: 'State', gap: 6 }, [
            F({ name: 'Dot', width: 6, height: 6, cornerRadius: 3, fill: dot }),
            part(
              'state',
              T(k === 'Checking' ? 'Checking' : k, { fontSize: 12, fontWeight: '600', fill: text }),
            ),
          ]),
        ],
      ),
    ),
  )
}
add(
  comp(
    'Health/Panel',
    Col(
      {
        name: 'Health Panel',
        width: 460,
        padding: 16,
        gap: 6,
        cornerRadius: 16,
        fill: C.popover,
        stroke: C.border,
        strokeWidth: 1,
        effect: { type: 'shadow', color: C.shadow, offset: { x: 0, y: 16 }, blur: 40 },
      },
      [
        Row({ name: 'Head', width: 'fill_container', justifyContent: 'space_between' }, [
          Col({ gap: 2 }, [
            T('System status', { fontSize: 15, fontWeight: '600' }),
            part(
              'meta',
              T('Updated 30 s ago · last 30 days', { fontSize: 12, fill: C.mutedForeground }),
            ),
          ]),
          part(
            'overall',
            F({
              name: 'Overall Slot',
              slot: [],
              children: [Ref(reg['Health/Pill Operational'].id, { name: 'Overall' })],
            }),
          ),
        ]),
        slot('rows', { gap: 0 }),
        Row(
          {
            name: 'Foot',
            width: 'fill_container',
            justifyContent: 'space_between',
            padding: [8, 0, 0, 0],
          },
          [
            part(
              'incident',
              T('No incidents in the last 30 days', { fontSize: 12, fill: C.mutedForeground }),
            ),
            T('Status page ↗', { fontSize: 12, fontWeight: '600', fill: C.accent }),
          ],
        ),
      ],
    ),
  ),
)

add(
  txt('Text/Display Accent', 'Accent', {
    fontFamily: 'font-heading',
    fontSize: 54,
    fontWeight: '700',
    letterSpacing: -1.6,
    fill: C.accent,
    lineHeight: 1.05,
  }),
  txt('Text/H1 Accent', 'Accent', {
    fontFamily: 'font-heading',
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.8,
    fill: C.accent,
    lineHeight: 1.05,
  }),
  txt('Text/H1 Magenta', 'Magenta', {
    fontFamily: 'font-heading',
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.8,
    fill: C.magenta500,
    lineHeight: 1.05,
  }),
  txt('Text/Display Magenta', 'Magenta', {
    fontFamily: 'font-heading',
    fontSize: 54,
    fontWeight: '700',
    letterSpacing: -1.6,
    fill: C.magenta500,
    lineHeight: 1.05,
  }),
  comp(
    'Landing/Feature',
    Row({ name: 'Feature', width: 'fill_container', gap: 14, alignItems: 'start' }, [
      F(
        {
          name: 'Icon',
          width: 44,
          height: 44,
          cornerRadius: 22,
          stroke: C.ring,
          strokeWidth: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        [part('icon', I('play', { width: 20, height: 20, fill: C.accent }))],
      ),
      Col({ gap: 4, width: 'fill_container' }, [
        part('title', T('Feature', { fontWeight: '600', fontSize: 16 })),
        part('desc', P('Description', { fontSize: 14 })),
      ]),
    ]),
  ),
  comp(
    'Landing/Footer',
    Col(
      {
        name: 'Footer',
        width: 1440,
        padding: [40, 120],
        gap: 24,
        stroke: C.border,
        strokeWidth: { top: 1 },
      },
      [
        Row({ width: 'fill_container', justifyContent: 'space_between', alignItems: 'start' }, [
          Col({ gap: 6 }, [
            Ref(reg['Logo/Lockup'].id, { name: 'Lockup' }),
            T('Playback is the product.', { fontSize: 13, fill: C.mutedForeground }),
          ]),
          Col({ gap: 14, alignItems: 'end' }, [
            Row(
              { name: 'Links', gap: 28 },
              ['Log in', 'Create account', 'Player preview', 'Legal'].map((l) =>
                Ref(
                  reg['Link/Footer'].id,
                  { name: `Link / ${l}` },
                  { [reg['Link/Footer'].parts.label]: { content: l } },
                ),
              ),
            ),
            part(
              'status',
              F({
                name: 'Status Slot',
                slot: [],
                children: [Ref(reg['Health/Pill Operational'].id, { name: 'Health' })],
              }),
            ),
          ]),
        ]),
        T('MUSIC LIVES ON', {
          fontSize: 12,
          fontWeight: '600',
          letterSpacing: 1.2,
          fill: C.textSubdued,
        }),
      ],
    ),
  ),
)

/* fullscreen scene landing: one scene per scroll gesture, a 3D signal behind the copy */
const sceneDot = (name, active) =>
  comp(
    name,
    F({
      name: 'Dot',
      width: active ? 14 : 10,
      height: active ? 14 : 10,
      cornerRadius: 7,
      ...(active ? { fill: C.accent } : { stroke: C.mutedForeground, strokeWidth: 1 }),
    }),
  )
add(
  sceneDot('Landing/Scene Dot', false),
  sceneDot('Landing/Scene Dot Active', true),
  comp(
    'Landing/Scene Counter',
    Row({ name: 'Scene Counter', gap: 12 }, [
      part('index', T('01', { fontSize: 12, fontWeight: '500', letterSpacing: 1.2 })),
      F({ name: 'Rail', width: 120, height: 2, cornerRadius: 1, fill: C.border }, [
        part(
          'progress',
          F({
            name: 'Progress',
            width: 17,
            height: 2,
            cornerRadius: 1,
            fill: gradient(C.primary, C.magenta500, 90),
          }),
        ),
      ]),
      part('total', T('07', { fontSize: 12, letterSpacing: 1.2, fill: C.mutedForeground })),
    ]),
  ),
  comp(
    'Landing/Signal',
    Col({ name: 'Signal', gap: 16, alignItems: 'center' }, [
      part(
        'image',
        F({ name: 'Orb', width: 520, height: 520, cornerRadius: 260, fill: img(ART.hero) }),
      ),
      part(
        'phase',
        T('SIGNAL · SPHERE', {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 1.6,
          fill: C.accent,
        }),
      ),
    ]),
  ),
  comp(
    'Landing/Motion Note',
    Row(
      {
        name: 'Motion Note',
        gap: 10,
        padding: [8, 12],
        cornerRadius: 10,
        stroke: C.border,
        strokeWidth: 1,
        alignItems: 'start',
      },
      [
        part('icon', I('sparkles', { width: 16, height: 16, fill: C.accent })),
        part(
          'note',
          T('Motion', {
            fontSize: 12,
            fill: C.mutedForeground,
            lineHeight: 1.45,
            textGrowth: 'fixed-width',
            width: 320,
          }),
        ),
      ],
    ),
  ),
)

/* friends: presence is shown to friends only — dot + label, and the avatar ring carries the same tone */
const PRESENCE = {
  Online: [C.success, 'Online'],
  Listening: [C.primary, 'Listening to Afterglow'],
  Away: [C.warning, 'Away · 12 min'],
  Offline: [null, 'Last seen 2 h ago'],
}
const presenceDot = (tone) =>
  F({
    name: 'Dot',
    width: 8,
    height: 8,
    cornerRadius: 4,
    ...(tone ? { fill: tone } : { stroke: C.mutedForeground, strokeWidth: 1 }),
  })
const ringAvatar = (tone, size) =>
  part(
    'avatar',
    F({
      name: 'Avatar',
      width: size,
      height: size,
      cornerRadius: size / 2,
      fill: img(ART.avatar2),
      ...(tone ? { stroke: tone, strokeWidth: 2 } : {}),
    }),
  )
for (const [k, [tone, label]] of Object.entries(PRESENCE))
  add(
    comp(
      `Presence/${k}`,
      Row({ name: 'Presence', gap: 6 }, [
        presenceDot(tone),
        part(
          'label',
          T(label, {
            fontSize: 12,
            fill: k === 'Listening' ? C.accent : C.mutedForeground,
            fontWeight: k === 'Offline' ? 'normal' : '500',
          }),
        ),
      ]),
    ),
  )
for (const [k, [tone, label]] of Object.entries(PRESENCE)) {
  const node = comp(
    `Friend Row/${k}`,
    Row(
      {
        name: 'Friend',
        width: 'fill_container',
        padding: [10, 0],
        gap: 12,
        stroke: C.border,
        strokeWidth: { bottom: 1 },
      },
      [
        ringAvatar(tone, 44),
        Col({ gap: 3, width: 'fill_container' }, [
          part('name', T('Name', { fontWeight: '600' })),
          Row({ name: 'Presence', gap: 6 }, [
            presenceDot(tone),
            part(
              'status',
              T(label, {
                fontSize: 12,
                fill: k === 'Listening' ? C.accent : C.mutedForeground,
              }),
            ),
          ]),
        ]),
        slot('actions', {
          layout: 'horizontal',
          width: 'fit_content',
          gap: 6,
          alignItems: 'center',
        }),
      ],
    ),
  )
  add(node)
}
for (const [k, [tone]] of Object.entries(PRESENCE))
  add(
    comp(
      `Friend Tile/${k}`,
      Col({ name: 'Friend Tile', width: 72, gap: 6, alignItems: 'center' }, [
        ringAvatar(tone, 56),
        part(
          'name',
          T('Name', {
            fontSize: 12,
            fontWeight: '500',
            textAlign: 'center',
            textGrowth: 'fixed-width',
            width: 'fill_container',
          }),
        ),
      ]),
    ),
  )
add(
  comp(
    'People Row',
    Row(
      {
        name: 'Person',
        width: 'fill_container',
        padding: [10, 0],
        gap: 12,
        stroke: C.border,
        strokeWidth: { bottom: 1 },
      },
      [
        part(
          'avatar',
          F({ name: 'Avatar', width: 44, height: 44, cornerRadius: 22, fill: img(ART.avatar3) }),
        ),
        Col({ gap: 2, width: 'fill_container' }, [
          part('name', T('Name', { fontWeight: '600' })),
          part('meta', T('@handle · 4 mutual friends', { fontSize: 12, fill: C.mutedForeground })),
        ]),
        slot('actions', {
          layout: 'horizontal',
          width: 'fit_content',
          gap: 6,
          alignItems: 'center',
        }),
      ],
    ),
  ),
)

/* the real Bitrate mark as a vector (packages/ui-react/assets/icons/logo-icon.svg) and its write-on loader keyframes.
   The motion (brush mask along the ribbon spines, contour pulse, erase) lives in the prototypes; Pencil shows keyframes. */
const LOGO_SVG = readFileSync(
  join(
    dirname(new URL(import.meta.url).pathname),
    '../../packages/ui-react/assets/icons/logo-icon.svg',
  ),
  'utf8',
)
const LOGO_D = LOGO_SVG.match(/ d="([^"]+)"/)[1]
const LOGO_BOX = [371, 117, 795, 775]
const SPINE_A_HEAD =
  'M 405 152 C 430 200 470 211 560 211 L 900 211 C 1010 211 1050 280 1050 350 C 1050 430 990 493 900 493'
const TAILS = 'M 720 493 C 560 493 470 600 425 780 M 900 805 L 640 805 C 580 805 540 830 512 868'
const brand = {
  type: 'gradient',
  gradientType: 'linear',
  rotation: 90,
  colors: [
    { color: C.gradientPrimaryFrom, position: 0 },
    { color: C.gradientPrimaryTo, position: 1 },
  ],
}
const vec = (name, geometry, w, o = {}) => ({
  type: 'path',
  id: id(),
  name,
  geometry,
  viewBox: LOGO_BOX,
  width: w,
  height: Math.round((w * 775) / 795),
  ...o,
})
add(
  comp('Logo/Mark Path', vec('Mark', LOGO_D, 72, { fill: brand })),
  comp('Loader/Logo Write', vec('Write', SPINE_A_HEAD, 120, { stroke: brand, strokeWidth: 16 })),
  comp(
    'Loader/Logo Pulse',
    vec('Pulse', LOGO_D, 120, { fill: brand, stroke: C.accent, strokeWidth: 2 }),
  ),
  comp('Loader/Logo Erase', vec('Erase', TAILS, 120, { stroke: brand, strokeWidth: 16 })),
  comp(
    'Loader/Logo Mini',
    vec('Mini', LOGO_D, 24, { fill: C.muted, stroke: C.primary, strokeWidth: 1.5 }),
  ),
)

/* loading: brand loader, spinners, progress, statuses and skeleton rows that mirror each long list */
const sk = (w, h = 12, o = {}) => Ref('Jjegi', { name: 'Skeleton', width: w, height: h, ...o })
const skCircle = (d) => sk(d, d, { cornerRadius: d / 2 })
const track = (name, w, fillW, fill = gradient(C.primary, C.magenta500, 90)) =>
  F({ name, width: w, height: 4, cornerRadius: 2, fill: C.muted }, [
    part('progress', F({ name: 'Fill', width: fillW, height: 4, cornerRadius: 2, fill })),
  ])
const loadPill = (name, fill, stroke, text, icon, label) =>
  comp(
    name,
    Row(
      {
        name: 'Status',
        height: 24,
        padding: [0, 10],
        gap: 6,
        cornerRadius: 12,
        fill,
        stroke,
        strokeWidth: 1,
      },
      [
        I(icon, { width: 12, height: 12, fill: text }),
        part('label', T(label, { fontSize: 12, fontWeight: '600', fill: text })),
      ],
    ),
  )
add(
  comp(
    'Loader/Signal',
    Col({ name: 'Loader', gap: 14, alignItems: 'center' }, [
      Row(
        { name: 'Bars', gap: 5, alignItems: 'end', height: 44 },
        [16, 30, 44, 30, 16].map((h, i) =>
          F({
            name: `Bar ${i + 1}`,
            width: 6,
            height: h,
            cornerRadius: 3,
            fill: gradient(C.primary, C.magenta500, 180),
          }),
        ),
      ),
      part('label', T('Loading…', { fontSize: 13, fill: C.mutedForeground })),
    ]),
  ),
  comp(
    'Loader/Spinner',
    part('icon', I('loader-circle', { width: 24, height: 24, fill: C.primary })),
  ),
  comp(
    'Loader/Spinner Small',
    part('icon', I('loader-circle', { width: 16, height: 16, fill: C.mutedForeground })),
  ),
)
add(
  comp(
    'Loader/Splash',
    Col({ name: 'Splash', width: 360, gap: 28, alignItems: 'center' }, [
      Ref(reg['Loader/Logo Pulse'].id, { name: 'Logo Loader' }),
      T('Bitrate', { fontFamily: 'font-heading', fontSize: 26, fontWeight: '700' }),
      Col({ name: 'Progress', gap: 10, width: 240, alignItems: 'center' }, [
        track('Track', 240, 140),
        part('label', T('Connecting to your library…', { fontSize: 13, fill: C.mutedForeground })),
      ]),
    ]),
  ),
  comp(
    'Progress/Route Bar',
    F({ name: 'Route Bar', width: 'fill_container', height: 3 }, [
      part(
        'progress',
        F({
          name: 'Fill',
          width: 620,
          height: 3,
          cornerRadius: 2,
          fill: gradient(C.primary, C.magenta500, 90),
        }),
      ),
    ]),
  ),
  comp(
    'Seek Bar/Buffering',
    Col({ name: 'Seek Bar', width: 'fill_container', gap: 8 }, [
      Row({ name: 'Rail', width: 'fill_container', height: 12, gap: 0, alignItems: 'center' }, [
        part(
          'elapsedBar',
          F({ name: 'Elapsed', width: 160, height: 4, cornerRadius: 2, fill: C.primary }),
        ),
        F({ name: 'Thumb', width: 12, height: 12, cornerRadius: 6, fill: C.foreground }),
        part(
          'bufferedBar',
          F({ name: 'Buffered', width: 90, height: 4, cornerRadius: 2, fill: C.mutedForeground }),
        ),
        F({
          name: 'Remaining',
          width: 'fill_container',
          height: 4,
          cornerRadius: 2,
          fill: C.surface,
        }),
      ]),
      Row({ name: 'Times', width: 'fill_container', justifyContent: 'space_between' }, [
        part('elapsed', T('1:48', { fontSize: 12, fill: C.mutedForeground })),
        Row({ name: 'Buffering', gap: 6 }, [
          I('loader-circle', { width: 12, height: 12, fill: C.accent }),
          part('label', T('Buffering…', { fontSize: 12, fontWeight: '600', fill: C.accent })),
        ]),
        part('duration', T('3:42', { fontSize: 12, fill: C.mutedForeground })),
      ]),
    ]),
  ),
  loadPill('Status/Loading', C.muted, C.border, C.mutedForeground, 'loader-circle', 'Loading'),
  loadPill('Status/Syncing', C.infoSurface, C.infoBorder, C.infoText, 'refresh-cw', 'Syncing'),
  loadPill(
    'Status/Queued',
    C.warningSurface,
    C.warningBorder,
    C.warningText,
    'cloud-off',
    'Queued offline',
  ),
  comp(
    'List/Load More',
    Row(
      {
        name: 'Load More',
        width: 'fill_container',
        padding: [16, 0],
        gap: 10,
        justifyContent: 'center',
      },
      [
        I('loader-circle', { width: 16, height: 16, fill: C.primary }),
        part('label', T('Loading more…', { fontSize: 13, fill: C.mutedForeground })),
        part('count', T('50 of 1,240', { fontSize: 12, fill: C.textSubdued })),
      ],
    ),
  ),
  comp(
    'List/End',
    Row(
      {
        name: 'List End',
        width: 'fill_container',
        padding: [16, 0],
        gap: 12,
        justifyContent: 'center',
      },
      [
        F({ name: 'Rule', width: 40, height: 1, fill: C.border }),
        part('label', T("That's everything · 1,240 tracks", { fontSize: 12, fill: C.textSubdued })),
        F({ name: 'Rule', width: 40, height: 1, fill: C.border }),
      ],
    ),
  ),
  comp(
    'Toast/Progress',
    Col(
      {
        name: 'Toast',
        width: 360,
        padding: 16,
        gap: 12,
        cornerRadius: 12,
        fill: C.popover,
        stroke: C.border,
        strokeWidth: 1,
      },
      [
        Row({ name: 'Head', width: 'fill_container', gap: 10, alignItems: 'start' }, [
          I('loader-circle', { width: 18, height: 18, fill: C.primary }),
          Col({ gap: 2, width: 'fill_container' }, [
            part('title', T('Saving playlist…', { fontWeight: '600', fontSize: 14 })),
            part('desc', T('3 of 12 tracks', { fontSize: 12, fill: C.mutedForeground })),
          ]),
          part('action', T('Cancel', { fontSize: 13, fontWeight: '600', fill: C.mutedForeground })),
        ]),
        track('Track', 'fill_container', 90, C.primary),
      ],
    ),
  ),
  comp('Skeleton/Shimmer', sk(280, 12, { fill: gradient(C.muted, C.secondary, 90) })),
  comp(
    'Skeleton/Track Row',
    Row({ name: 'Track Row', width: 'fill_container', height: 56, padding: [0, 16], gap: 16 }, [
      sk(16, 10),
      sk(40, 40, { cornerRadius: 6 }),
      Col({ gap: 8, width: 'fill_container' }, [sk(220), sk(140, 10)]),
      sk(160, 10),
      sk(80, 10),
      sk(36, 10),
    ]),
  ),
  comp(
    'Skeleton/Track Row Mobile',
    Row({ name: 'Track Row', width: 'fill_container', gap: 12 }, [
      sk(48, 48, { cornerRadius: 6 }),
      Col({ gap: 8, width: 'fill_container' }, [sk(170), sk(110, 10)]),
      skCircle(20),
    ]),
  ),
  comp(
    'Skeleton/Chart Row',
    Row({ name: 'Chart Row', width: 'fill_container', height: 56, padding: [0, 16], gap: 16 }, [
      sk(20, 14),
      sk(14, 14),
      sk(40, 40, { cornerRadius: 6 }),
      Col({ gap: 8, width: 'fill_container' }, [sk(200), sk(120, 10)]),
      sk(70, 10),
      sk(36, 10),
    ]),
  ),
  comp(
    'Skeleton/Card',
    Col({ name: 'Card', gap: 10, width: 168 }, [
      sk(168, 168, { cornerRadius: 8 }),
      sk(130),
      sk(90, 10),
    ]),
  ),
  comp(
    'Skeleton/Artist Card',
    Col({ name: 'Artist Card', gap: 10, width: 168, alignItems: 'center' }, [
      skCircle(168),
      sk(110),
      sk(70, 10),
    ]),
  ),
  comp(
    'Skeleton/Person Row',
    Row({ name: 'Person Row', width: 'fill_container', padding: [10, 0], gap: 12 }, [
      skCircle(44),
      Col({ gap: 8, width: 'fill_container' }, [sk(160), sk(110, 10)]),
      sk(88, 32, { cornerRadius: 8 }),
    ]),
  ),
  comp(
    'Skeleton/Notification Row',
    Row({ name: 'Notification Row', width: 'fill_container', padding: [12, 12], gap: 12 }, [
      skCircle(36),
      Col({ gap: 8, width: 'fill_container' }, [sk(320), sk(80, 10)]),
    ]),
  ),
  comp(
    'Skeleton/Table Row',
    Row({ name: 'Table Row', width: 'fill_container', height: 52, padding: [0, 16], gap: 24 }, [
      sk(36, 36, { cornerRadius: 6 }),
      Col({ gap: 6, width: 'fill_container' }, [sk(200), sk(120, 10)]),
      sk(90, 10),
      sk(70, 22, { cornerRadius: 11 }),
      sk(60, 10),
    ]),
  ),
)

/* artist workspace */
const pill = (name, fill, stroke, text) =>
  comp(
    name,
    Row(
      {
        name: 'Status',
        height: 24,
        padding: [0, 10],
        cornerRadius: 12,
        fill,
        stroke,
        strokeWidth: 1,
      },
      [part('label', T('Status', { fontSize: 12, fontWeight: '600', fill: text }))],
    ),
  )
add(
  pill('Status/Neutral', C.muted, C.border, C.mutedForeground),
  pill('Status/Info', C.infoSurface, C.infoBorder, C.infoText),
  pill('Status/Success', C.successSurface, C.successBorder, C.successText),
  pill('Status/Warning', C.warningSurface, C.warningBorder, C.warningText),
  pill('Status/Error', C.errorSurface, C.errorBorder, C.errorText),
  comp(
    'Kbd',
    Row(
      {
        name: 'Kbd',
        height: 22,
        padding: [0, 6],
        cornerRadius: 4,
        fill: C.muted,
        stroke: C.border,
        strokeWidth: 1,
      },
      [part('label', T('Ctrl K', { fontSize: 11, fontWeight: '600', fill: C.mutedForeground }))],
    ),
  ),
  comp(
    'Artist/Nav Item',
    Row(
      {
        name: 'Nav Item',
        width: 'fill_container',
        height: 38,
        padding: [0, 12],
        gap: 10,
        cornerRadius: 8,
      },
      [
        part('icon', I('house', { width: 18, height: 18 })),
        part('label', T('Item', { fontSize: 14, fill: C.mutedForeground })),
      ],
    ),
  ),
  comp(
    'Artist/Nav Item Active',
    Row(
      {
        name: 'Nav Item',
        width: 'fill_container',
        height: 38,
        padding: [0, 12],
        gap: 10,
        cornerRadius: 8,
        fill: C.sidebarAccent,
      },
      [
        part('icon', I('house', { width: 18, height: 18, fill: C.primary })),
        part(
          'label',
          T('Item', { fontSize: 14, fontWeight: '600', fill: C.sidebarAccentForeground }),
        ),
      ],
    ),
  ),
)
const NAV = [
  ['dashboard', 'layout-dashboard', 'Dashboard'],
  ['music', 'disc-3', 'Music'],
  ['promotion', 'megaphone', 'Promotion'],
  ['analytics', 'chart-column', 'Analytics'],
  ['profile', 'user-round', 'Profile'],
  ['settings', 'settings', 'Settings'],
]
const navItems = () =>
  NAV.map(([k, icon, label]) =>
    part(
      `nav_${k}`,
      Ref(
        reg['Artist/Nav Item'].id,
        { name: `Nav / ${label}` },
        {
          [reg['Artist/Nav Item'].parts.icon]: { icon },
          [reg['Artist/Nav Item'].parts.label]: { content: label },
        },
      ),
    ),
  )
add(
  comp(
    'Artist Shell/Desktop',
    Row(
      {
        name: 'Artist Shell',
        width: 1440,
        height: 1040,
        gap: 0,
        alignItems: 'start',
        fill: C.background,
      },
      [
        Col(
          {
            name: 'Sidebar',
            width: 248,
            height: 'fill_container',
            padding: [20, 16],
            gap: 6,
            fill: C.sidebar,
            stroke: C.sidebarBorder,
            strokeWidth: { right: 1 },
          },
          [
            Row({ name: 'Brand', gap: 10, padding: [0, 4, 12, 4] }, [
              Ref(reg['Logo/Lockup'].id, { name: 'Lockup' }),
              T('FOR ARTISTS', {
                fontSize: 11,
                fontWeight: '600',
                letterSpacing: 1,
                fill: C.accent,
              }),
            ]),
            T('ARTIST WORKSPACE', {
              fontSize: 11,
              fontWeight: '600',
              letterSpacing: 1.2,
              fill: C.mutedForeground,
              name: 'Section',
            }),
            ...navItems(),
            F({ name: 'Spacer', width: 'fill_container', height: 'fill_container' }),
            Ref(
              reg['Artist/Nav Item'].id,
              { name: 'Nav / Help' },
              {
                [reg['Artist/Nav Item'].parts.icon]: { icon: 'life-buoy' },
                [reg['Artist/Nav Item'].parts.label]: { content: 'Help & support' },
              },
            ),
            Row(
              {
                name: 'Account',
                width: 'fill_container',
                gap: 10,
                padding: [12, 4, 0, 4],
                stroke: C.border,
                strokeWidth: { top: 1 },
              },
              [
                Ref('jKpf4', { name: 'Avatar' }, { Z9DnE: { content: 'DA' } }),
                Col({ gap: 2, width: 'fill_container' }, [
                  T('Demo artist', { fontWeight: '600', fontSize: 13 }),
                  T('Artist account', { fontSize: 12, fill: C.mutedForeground }),
                ]),
                I('chevrons-up-down', { width: 16, height: 16 }),
              ],
            ),
          ],
        ),
        Col({ name: 'Main', width: 'fill_container', height: 'fill_container', gap: 0 }, [
          Row(
            {
              name: 'Header',
              width: 'fill_container',
              height: 64,
              padding: [0, 32],
              gap: 16,
              stroke: C.border,
              strokeWidth: { bottom: 1 },
            },
            [
              part(
                'breadcrumb',
                T('Workspace / Dashboard', {
                  fontSize: 13,
                  fill: C.mutedForeground,
                  width: 'fill_container',
                  textGrowth: 'fixed-width',
                }),
              ),
              Row(
                {
                  name: 'Search',
                  width: 280,
                  height: 36,
                  padding: [0, 10],
                  gap: 8,
                  cornerRadius: 8,
                  stroke: C.input,
                  strokeWidth: 1,
                },
                [
                  I('search', { width: 16, height: 16 }),
                  T('Search workspace', {
                    fontSize: 13,
                    fill: C.mutedForeground,
                    width: 'fill_container',
                    textGrowth: 'fixed-width',
                  }),
                  Ref(reg.Kbd.id, { name: 'Kbd' }),
                ],
              ),
              part('action', Button('Create release', 'default', { icon: 'plus' })),
            ],
          ),
          slot('content', { height: 'fill_container', padding: [28, 32], gap: 28, clip: true }),
        ]),
      ],
    ),
  ),
)
reg['Artist Shell/Desktop'].parts.actionLabel = `${reg['Artist Shell/Desktop'].parts.action}/E23bq6`
reg['Artist Shell/Desktop'].parts.actionIcon = `${reg['Artist Shell/Desktop'].parts.action}/k0WCtI`
add(
  comp(
    'Artist Shell/Mobile',
    Col(
      {
        name: 'Artist Shell Mobile',
        width: 390,
        height: 844,
        gap: 0,
        fill: C.background,
        clip: true,
      },
      [
        Ref(reg['Mobile/Status Bar'].id, { name: 'Status Bar', width: 'fill_container' }),
        Row(
          {
            name: 'Top Bar',
            width: 'fill_container',
            height: 56,
            padding: [0, 8, 0, 16],
            justifyContent: 'space_between',
            stroke: C.border,
            strokeWidth: { bottom: 1 },
          },
          [
            Ref(reg['Logo/Lockup'].id, { name: 'Lockup' }),
            Ref(
              reg['Button/Icon Ghost'].id,
              { name: 'Menu' },
              { [reg['Button/Icon Ghost'].parts.icon]: { icon: 'menu' } },
            ),
          ],
        ),
        slot('content', { height: 'fill_container', padding: [20, 16], gap: 20, clip: true }),
      ],
    ),
  ),
  comp(
    'Artist/Mobile Menu',
    Col(
      {
        name: 'Mobile Menu',
        width: 300,
        height: 788,
        padding: [20, 16],
        gap: 6,
        fill: C.sidebar,
        stroke: C.sidebarBorder,
        strokeWidth: { right: 1 },
      },
      [
        Row({ gap: 10, padding: [0, 4, 12, 4] }, [
          Ref(reg['Logo/Lockup'].id, { name: 'Lockup' }),
          T('FOR ARTISTS', { fontSize: 11, fontWeight: '600', letterSpacing: 1, fill: C.accent }),
        ]),
        T('ARTIST WORKSPACE', {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 1.2,
          fill: C.mutedForeground,
        }),
        ...navItems(),
        F({ name: 'Spacer', width: 'fill_container', height: 'fill_container' }),
        Row(
          {
            name: 'Account',
            width: 'fill_container',
            gap: 10,
            padding: [12, 4, 0, 4],
            stroke: C.border,
            strokeWidth: { top: 1 },
          },
          [
            Ref('jKpf4', { name: 'Avatar' }, { Z9DnE: { content: 'DA' } }),
            Col({ gap: 2 }, [
              T('Demo artist', { fontWeight: '600', fontSize: 13 }),
              T('Artist account', { fontSize: 12, fill: C.mutedForeground }),
            ]),
          ],
        ),
      ],
    ),
  ),
  comp(
    'Artist/Page Header',
    Row({ name: 'Page Header', width: 'fill_container', gap: 16, alignItems: 'end' }, [
      Col({ gap: 6, width: 'fill_container' }, [
        part(
          'eyebrow',
          T('EYEBROW', {
            fontSize: 12,
            fontWeight: '600',
            letterSpacing: 1.2,
            fill: C.mutedForeground,
          }),
        ),
        part(
          'title',
          H('Title', 32, { fontWeight: '700', textGrowth: 'fixed-width', width: 'fill_container' }),
        ),
        part('subtitle', P('Subtitle', { fontSize: 14 })),
      ]),
      slot('actions', { layout: 'horizontal', width: 'fit_content', gap: 10 }),
    ]),
  ),
  comp(
    'Table/Header Row',
    Row(
      {
        name: 'Table Header',
        width: 'fill_container',
        height: 40,
        padding: [0, 16],
        gap: 16,
        stroke: C.border,
        strokeWidth: { bottom: 1 },
      },
      [slot('cells', { layout: 'horizontal', gap: 16, alignItems: 'center' })],
    ),
  ),
  comp(
    'Table/Row',
    Row(
      {
        name: 'Table Row',
        width: 'fill_container',
        height: 60,
        padding: [0, 16],
        gap: 16,
        stroke: C.border,
        strokeWidth: { bottom: 1 },
      },
      [slot('cells', { layout: 'horizontal', gap: 16, alignItems: 'center' })],
    ),
  ),
  comp(
    'Table/Row Selected',
    Row(
      {
        name: 'Table Row',
        width: 'fill_container',
        height: 60,
        padding: [0, 16],
        gap: 16,
        fill: C.muted,
        cornerRadius: 8,
      },
      [slot('cells', { layout: 'horizontal', gap: 16, alignItems: 'center' })],
    ),
  ),
  comp(
    'Key Value Row',
    Row(
      {
        name: 'Key Value',
        width: 'fill_container',
        padding: [8, 0],
        gap: 12,
        justifyContent: 'space_between',
      },
      [
        part('key', T('Key', { fontSize: 13, fill: C.mutedForeground })),
        slot('value', { layout: 'horizontal', width: 'fit_content', gap: 8, alignItems: 'center' }),
      ],
    ),
  ),
  ...[
    ['Done', 'circle-check', C.success],
    ['Blocked', 'circle-alert', C.warning],
    ['Pending', 'circle-dashed', C.mutedForeground],
    ['Error', 'circle-x', C.destructive],
  ].map(([v, icon, tone]) =>
    comp(
      `Checklist Row/${v}`,
      Row(
        {
          name: 'Checklist Row',
          width: 'fill_container',
          padding: [12, 0],
          gap: 12,
          stroke: C.border,
          strokeWidth: { bottom: 1 },
        },
        [
          I(icon, { width: 18, height: 18, fill: tone }),
          Col({ gap: 2, width: 'fill_container' }, [
            part(
              'title',
              T('Item', {
                fontWeight: '600',
                fontSize: 14,
                textGrowth: 'fixed-width',
                width: 'fill_container',
              }),
            ),
            part(
              'meta',
              T('Meta', {
                fontSize: 13,
                fill: C.mutedForeground,
                textGrowth: 'fixed-width',
                width: 'fill_container',
              }),
            ),
          ]),
          part('action', T('Edit', { fontSize: 13, fontWeight: '600', fill: C.primary })),
        ],
      ),
    ),
  ),
  comp(
    'Upload Progress',
    Row(
      {
        name: 'Upload',
        width: 'fill_container',
        padding: 14,
        gap: 12,
        cornerRadius: 10,
        stroke: C.border,
        strokeWidth: 1,
      },
      [
        I('file-audio', { width: 22, height: 22, fill: C.foreground }),
        Col({ gap: 6, width: 'fill_container' }, [
          part('name', T('Night Signal.wav', { fontWeight: '600', fontSize: 14 })),
          part('bar', Ref('AQPfV', { name: 'Progress', width: 'fill_container', height: 6 })),
          part('meta', T('Uploading 42%', { fontSize: 12, fill: C.mutedForeground })),
        ]),
        part('action', T('Cancel', { fontSize: 13, fontWeight: '600', fill: C.mutedForeground })),
      ],
    ),
  ),
  comp(
    'Option Card',
    Col(
      {
        name: 'Option',
        width: 'fill_container',
        padding: 16,
        gap: 6,
        cornerRadius: 12,
        stroke: C.border,
        strokeWidth: 1,
      },
      [
        Row({ gap: 10, width: 'fill_container' }, [
          F({ width: 18, height: 18, cornerRadius: 9, stroke: C.input, strokeWidth: 1 }),
          part('title', T('Option', { fontWeight: '600' })),
        ]),
        part(
          'desc',
          T('Description', {
            fontSize: 13,
            fill: C.mutedForeground,
            textGrowth: 'fixed-width',
            width: 'fill_container',
          }),
        ),
      ],
    ),
  ),
  comp(
    'Option Card/Selected',
    Col(
      {
        name: 'Option',
        width: 'fill_container',
        padding: 16,
        gap: 6,
        cornerRadius: 12,
        fill: C.muted,
        stroke: C.ring,
        strokeWidth: 2,
      },
      [
        Row({ gap: 10, width: 'fill_container' }, [
          F(
            {
              width: 18,
              height: 18,
              cornerRadius: 9,
              fill: C.primary,
              justifyContent: 'center',
              alignItems: 'center',
            },
            [F({ width: 8, height: 8, cornerRadius: 4, fill: C.primaryForeground })],
          ),
          part('title', T('Option', { fontWeight: '600' })),
        ]),
        part(
          'desc',
          T('Description', {
            fontSize: 13,
            fill: C.mutedForeground,
            textGrowth: 'fixed-width',
            width: 'fill_container',
          }),
        ),
      ],
    ),
  ),
  comp(
    'Person Row',
    Row(
      {
        name: 'Person',
        width: 'fill_container',
        padding: [12, 0],
        gap: 12,
        stroke: C.border,
        strokeWidth: { bottom: 1 },
      },
      [
        part('avatar', Ref('jKpf4', { name: 'Initials' }, { Z9DnE: { content: 'TR' } })),
        Col({ gap: 2, width: 'fill_container' }, [
          part('name', T('Name', { fontWeight: '600' })),
          part('meta', T('Meta', { fontSize: 13, fill: C.mutedForeground })),
        ]),
        slot('tags', { layout: 'horizontal', width: 'fit_content', gap: 6, alignItems: 'center' }),
      ],
    ),
  ),
  comp(
    'Date Row',
    Row({ name: 'Date Row', width: 'fill_container', padding: [10, 0], gap: 14 }, [
      Col(
        {
          name: 'Date',
          width: 52,
          height: 52,
          cornerRadius: 10,
          fill: C.muted,
          justifyContent: 'center',
          alignItems: 'center',
          gap: 0,
        },
        [
          part('month', T('SEP', { fontSize: 11, fontWeight: '600', fill: C.mutedForeground })),
          part('day', H('08', 18, { fontWeight: '700' })),
        ],
      ),
      Col({ gap: 2, width: 'fill_container' }, [
        part('title', T('Event', { fontWeight: '600' })),
        part('meta', T('Meta', { fontSize: 13, fill: C.mutedForeground })),
      ]),
    ]),
  ),
  comp(
    'Activity Item',
    Row(
      {
        name: 'Activity Item',
        width: 'fill_container',
        padding: [10, 0],
        gap: 12,
        alignItems: 'start',
      },
      [
        F({ name: 'Dot', width: 8, height: 8, cornerRadius: 4, fill: C.primary }),
        Col({ gap: 2, width: 'fill_container' }, [
          part(
            'text',
            T('Event', { fontSize: 14, textGrowth: 'fixed-width', width: 'fill_container' }),
          ),
          part('meta', T('2h ago', { fontSize: 12, fill: C.mutedForeground })),
        ]),
      ],
    ),
  ),
  comp(
    'Result Row',
    Row(
      { name: 'Result Row', width: 'fill_container', padding: [12, 14], gap: 14, cornerRadius: 10 },
      [
        part(
          'type',
          T('RELEASE', {
            fontSize: 11,
            fontWeight: '600',
            letterSpacing: 1,
            fill: C.mutedForeground,
            width: 80,
            textGrowth: 'fixed-width',
          }),
        ),
        Col({ gap: 2, width: 'fill_container' }, [
          part('title', T('Title', { fontWeight: '600' })),
          part('meta', T('Meta', { fontSize: 13, fill: C.mutedForeground })),
        ]),
        I('chevron-right', { width: 16, height: 16 }),
      ],
    ),
  ),
  comp(
    'Result Row/Selected',
    Row(
      {
        name: 'Result Row',
        width: 'fill_container',
        padding: [12, 14],
        gap: 14,
        cornerRadius: 10,
        fill: C.muted,
        stroke: C.ring,
        strokeWidth: 1,
      },
      [
        part(
          'type',
          T('RELEASE', {
            fontSize: 11,
            fontWeight: '600',
            letterSpacing: 1,
            fill: C.accent,
            width: 80,
            textGrowth: 'fixed-width',
          }),
        ),
        Col({ gap: 2, width: 'fill_container' }, [
          part('title', T('Title', { fontWeight: '600' })),
          part('meta', T('Meta', { fontSize: 13, fill: C.mutedForeground })),
        ]),
        I('corner-down-left', { width: 16, height: 16 }),
      ],
    ),
  ),
)

reg['Person Row'].parts.initials = `${reg['Person Row'].parts.avatar}/Z9DnE`

/* state messages: centred icon, title, description and real kit actions (primary + outline) */
const stateMessage = (name, icon, circle, iconFill) => {
  const primary = part('primary', Button('Try again', 'large-default'))
  const secondary = part('secondary', Button('Back to home', 'large-outline'))
  const node = comp(
    name,
    Col({ name: 'State Message', width: 480, gap: 16, alignItems: 'center', padding: [24, 0] }, [
      F(
        {
          name: 'Icon Circle',
          width: 72,
          height: 72,
          cornerRadius: 36,
          fill: circle,
          justifyContent: 'center',
          alignItems: 'center',
        },
        [part('icon', I(icon, { width: 30, height: 30, fill: iconFill }))],
      ),
      part(
        'title',
        H('Title', 28, { textAlign: 'center', textGrowth: 'fixed-width', width: 'fill_container' }),
      ),
      part('desc', P('Description', { textAlign: 'center' })),
      Row({ name: 'Actions', gap: 10, padding: [8, 0, 0, 0] }, [primary, secondary]),
    ]),
  )
  reg[name].parts.primaryLabel = `${reg[name].parts.primary}/NVe7y`
  reg[name].parts.secondaryLabel = `${reg[name].parts.secondary}/i6a4e`
  return node
}
add(
  stateMessage('State/Message/Error', 'triangle-alert', C.errorSurface, C.destructive),
  stateMessage('State/Message/Empty', 'music', C.muted, C.foreground),
  stateMessage('State/Message/Offline', 'wifi-off', C.muted, C.foreground),
)

/* app: Vercel-like command search, atmosphere mode, video player, mobile player panels */
const kbd = (label) =>
  Ref(reg.Kbd.id, { name: `Kbd ${label}` }, { [reg.Kbd.parts.label]: { content: label } })
const cmdItem = (name, active) =>
  comp(
    name,
    Row(
      {
        name: 'Item',
        width: 'fill_container',
        height: 42,
        padding: [0, 10],
        gap: 12,
        cornerRadius: 8,
        ...(active ? { fill: C.sidebarAccent } : {}),
      },
      [
        part(
          'icon',
          I('search', { width: 16, height: 16, fill: active ? C.primary : C.mutedForeground }),
        ),
        part(
          'label',
          T('Command', {
            fontSize: 14,
            fill: active ? C.foreground : C.foreground,
            fontWeight: active ? '600' : 'normal',
          }),
        ),
        F({ name: 'Spacer', width: 'fill_container', height: 1 }),
        part('hint', T(active ? '↵' : '', { fontSize: 12, fill: C.mutedForeground })),
      ],
    ),
  )
add(
  comp(
    'Command/Trigger',
    Row(
      {
        name: 'Search Trigger',
        width: 360,
        height: 40,
        padding: [0, 8, 0, 12],
        gap: 10,
        cornerRadius: 10,
        fill: C.muted,
        stroke: C.border,
        strokeWidth: 1,
      },
      [
        I('search', { width: 16, height: 16, fill: C.mutedForeground }),
        part(
          'placeholder',
          T('Search music, artists, commands…', { fontSize: 13, fill: C.mutedForeground }),
        ),
        F({ name: 'Spacer', width: 'fill_container', height: 1 }),
        kbd('⌘ K'),
      ],
    ),
  ),
  comp(
    'Command/Group',
    part(
      'label',
      T('GROUP', { fontSize: 11, fontWeight: '600', letterSpacing: 0.8, fill: C.textSubdued }),
    ),
  ),
  cmdItem('Command/Item', false),
  cmdItem('Command/Item Active', true),
  comp(
    'Command/Item Media',
    Row(
      {
        name: 'Item',
        width: 'fill_container',
        height: 52,
        padding: [0, 10],
        gap: 12,
        cornerRadius: 8,
      },
      [
        part('cover', cover({ width: 36, height: 36, cornerRadius: 6 })),
        Col({ gap: 2, width: 'fill_container' }, [
          part('title', T('Title', { fontSize: 14, fontWeight: '500' })),
          part('meta', T('Track · Artist', { fontSize: 12, fill: C.mutedForeground })),
        ]),
        part('hint', T('', { fontSize: 12, fill: C.mutedForeground })),
      ],
    ),
  ),
)
add(
  comp(
    'Command/Palette',
    Col(
      {
        name: 'Command Palette',
        width: 640,
        cornerRadius: 16,
        fill: C.popover,
        stroke: C.border,
        strokeWidth: 1,
        effect: { type: 'shadow', color: C.shadow, offset: { x: 0, y: 24 }, blur: 60 },
      },
      [
        Row(
          {
            name: 'Input',
            width: 'fill_container',
            height: 56,
            padding: [0, 16],
            gap: 12,
            stroke: C.border,
            strokeWidth: { bottom: 1 },
          },
          [
            I('search', { width: 18, height: 18, fill: C.mutedForeground }),
            part(
              'query',
              T('Search for a track, artist or command…', {
                fontSize: 15,
                fill: C.mutedForeground,
              }),
            ),
            F({ name: 'Spacer', width: 'fill_container', height: 1 }),
            kbd('Esc'),
          ],
        ),
        slot('results', { padding: 8, gap: 2 }),
        Row(
          {
            name: 'Footer',
            width: 'fill_container',
            height: 40,
            padding: [0, 16],
            gap: 16,
            stroke: C.border,
            strokeWidth: { top: 1 },
          },
          [
            Row({ gap: 6 }, [kbd('↑↓'), T('Navigate', { fontSize: 12, fill: C.mutedForeground })]),
            Row({ gap: 6 }, [kbd('↵'), T('Open', { fontSize: 12, fill: C.mutedForeground })]),
            Row({ gap: 6 }, [kbd('Esc'), T('Close', { fontSize: 12, fill: C.mutedForeground })]),
            F({ name: 'Spacer', width: 'fill_container', height: 1 }),
            part('scope', T('Bitrate search', { fontSize: 12, fill: C.textSubdued })),
          ],
        ),
      ],
    ),
  ),
)
const ATMO = {
  type: 'gradient',
  gradientType: 'linear',
  rotation: 135,
  colors: [
    { color: C.primary, position: 0 },
    { color: C.magenta500, position: 0.35 },
    { color: C.info, position: 0.7 },
    { color: C.accent, position: 1 },
  ],
}
add(
  comp(
    'Atmosphere/Frame',
    F(
      {
        name: 'Atmosphere',
        width: 1440,
        height: 900,
        padding: 4,
        cornerRadius: 28,
        fill: ATMO,
        effect: { type: 'shadow', color: C.primary, offset: { x: 0, y: 0 }, blur: 80 },
      },
      [
        F(
          {
            name: 'Inner',
            width: 'fill_container',
            height: 'fill_container',
            cornerRadius: 24,
            fill: C.background,
            layout: 'vertical',
          },
          [
            slot('content', {
              width: 'fill_container',
              height: 'fill_container',
              padding: 32,
              gap: 24,
              alignItems: 'center',
              justifyContent: 'center',
            }),
          ],
        ),
      ],
    ),
  ),
  comp(
    'Button/Atmosphere',
    Row(
      {
        name: 'Atmosphere',
        height: 36,
        padding: [0, 12],
        gap: 8,
        cornerRadius: 18,
        stroke: C.border,
        strokeWidth: 1,
      },
      [
        I('sparkles', { width: 16, height: 16, fill: C.mutedForeground }),
        part('label', T('Atmosphere', { fontSize: 13, fill: C.mutedForeground })),
      ],
    ),
  ),
  comp(
    'Button/Atmosphere Active',
    Row(
      { name: 'Atmosphere', height: 36, padding: [0, 12], gap: 8, cornerRadius: 18, fill: ATMO },
      [
        I('sparkles', { width: 16, height: 16, fill: C.white }),
        part('label', T('Atmosphere on', { fontSize: 13, fontWeight: '600', fill: C.white })),
      ],
    ),
  ),
)
const videoControls = () =>
  Row(
    {
      name: 'Control Bar',
      width: 'fill_container',
      height: 44,
      padding: [0, 14],
      gap: 14,
      cornerRadius: 12,
      fill: C.popover,
      stroke: C.border,
      strokeWidth: 1,
    },
    [
      part('play', I('pause', { width: 18, height: 18, fill: C.foreground })),
      part('time', T('1:12', { fontSize: 12, fill: C.mutedForeground })),
      Row({ name: 'Time Range', width: 'fill_container', height: 12, gap: 0 }, [
        part(
          'elapsedBar',
          F({ name: 'Elapsed', width: 220, height: 4, cornerRadius: 2, fill: C.primary }),
        ),
        F({ name: 'Thumb', width: 12, height: 12, cornerRadius: 6, fill: C.foreground }),
        F({
          name: 'Remaining',
          width: 'fill_container',
          height: 4,
          cornerRadius: 2,
          fill: C.surface,
        }),
      ]),
      part('duration', T('3:56', { fontSize: 12, fill: C.mutedForeground })),
      part('mute', I('volume-2', { width: 18, height: 18, fill: C.foreground })),
      I('captions', { width: 18, height: 18, fill: C.mutedForeground }),
      I('maximize', { width: 18, height: 18, fill: C.mutedForeground }),
    ],
  )
add(
  comp(
    'Video/Thumbnail',
    Col({ name: 'Video', width: 320, gap: 10 }, [
      part(
        'image',
        F(
          {
            name: 'Frame',
            width: 'fill_container',
            height: 180,
            cornerRadius: 12,
            fill: img(ART.stage),
            layout: 'vertical',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 10,
          },
          [
            Row(
              {
                name: 'Play',
                height: 40,
                padding: [0, 14],
                gap: 8,
                cornerRadius: 20,
                fill: C.white,
              },
              [
                I('play', { width: 14, height: 14, fill: C.background }),
                T('Play', { fontSize: 13, fontWeight: '600', fill: C.background }),
              ],
            ),
          ],
        ),
      ),
      Row({ width: 'fill_container', justifyContent: 'space_between' }, [
        part('title', T('Night Signal (Official video)', { fontSize: 14, fontWeight: '600' })),
        part('duration', T('3:56', { fontSize: 12, fill: C.mutedForeground })),
      ]),
      part('meta', T('Luma Vale · 128K views', { fontSize: 12, fill: C.mutedForeground })),
    ]),
  ),
  comp(
    'Video/Player',
    F(
      {
        name: 'Video Player',
        width: 1120,
        height: 630,
        cornerRadius: 16,
        fill: img(ART.stage),
        layout: 'vertical',
        justifyContent: 'end',
        padding: [0, 24, 20, 24],
      },
      [videoControls()],
    ),
  ),
  comp('Video/Control Bar', videoControls()),
)
const tabPill = (name, active) =>
  comp(
    name,
    Row(
      {
        name: 'Tab',
        height: 40,
        padding: active ? [0, 14] : [0, 11],
        gap: 8,
        cornerRadius: 20,
        ...(active ? { fill: C.primary } : { fill: C.muted }),
      },
      [
        part(
          'icon',
          I('mic-vocal', {
            width: 18,
            height: 18,
            fill: active ? C.primaryForeground : C.mutedForeground,
          }),
        ),
        ...(active
          ? [
              part(
                'label',
                T('Lyrics', { fontSize: 13, fontWeight: '600', fill: C.primaryForeground }),
              ),
            ]
          : []),
      ],
    ),
  )
add(
  tabPill('Tabs/Expandable', false),
  tabPill('Tabs/Expandable Active', true),
  comp(
    'Action/Icon',
    F(
      {
        name: 'Action',
        width: 44,
        height: 44,
        cornerRadius: 22,
        fill: C.muted,
        justifyContent: 'center',
        alignItems: 'center',
      },
      [part('icon', I('heart', { width: 20, height: 20, fill: C.foreground }))],
    ),
  ),
  comp(
    'Action/Icon Badge',
    Row(
      {
        name: 'Action',
        width: 44,
        height: 44,
        cornerRadius: 22,
        fill: C.muted,
        justifyContent: 'center',
        alignItems: 'start',
        padding: [10, 0, 0, 0],
        gap: 0,
      },
      [
        part('icon', I('cast', { width: 20, height: 20, fill: C.foreground })),
        F({ name: 'Badge', width: 8, height: 8, cornerRadius: 4, fill: C.magenta500 }),
      ],
    ),
  ),
  comp(
    'Tooltip/Action',
    Row(
      {
        name: 'Tooltip',
        height: 30,
        padding: [0, 8, 0, 10],
        gap: 8,
        cornerRadius: 8,
        fill: C.foreground,
      },
      [
        part('label', T('Devices', { fontSize: 12, fontWeight: '600', fill: C.background })),
        part('hint', T('2 nearby', { fontSize: 11, fill: C.mutedForeground })),
      ],
    ),
  ),
)

/* landing scenes 10-12: partner spheres, team bubbles + hover card, Newton's cradle (static stand-ins for the motion) */
const sphereFill = (a, b) => ({
  type: 'gradient',
  gradientType: 'radial',
  colors: [
    { color: a, position: 0 },
    { color: b, position: 1 },
  ],
})
for (const [k, a, b] of [
  ['Primary', C.accent, C.primary],
  ['Magenta', C.magenta500, C.purple600],
  ['Blue', C.info, C.primary],
])
  add(
    comp(
      `Landing/Partner Sphere ${k}`,
      F(
        {
          name: 'Sphere',
          width: 120,
          height: 120,
          cornerRadius: 60,
          fill: sphereFill(a, b),
          justifyContent: 'center',
          alignItems: 'center',
          effect: { type: 'shadow', color: C.shadow, offset: { x: 0, y: 14 }, blur: 30 },
        },
        [
          part(
            'label',
            T('PARTNER', { fontSize: 13, fontWeight: '700', letterSpacing: 0.6, fill: C.white }),
          ),
        ],
      ),
    ),
  )
add(
  comp(
    'Landing/Bubble Person',
    F(
      {
        name: 'Bubble',
        width: 184,
        height: 184,
        cornerRadius: 92,
        fill: gradient(C.primary, C.magenta500),
        justifyContent: 'center',
        alignItems: 'center',
        effect: { type: 'shadow', color: C.shadow, offset: { x: 0, y: 12 }, blur: 30 },
      },
      [part('initials', H('VT', 44, { fontWeight: '700', fill: C.white }))],
    ),
  ),
  comp(
    'Landing/Bubble Tech',
    F(
      {
        name: 'Bubble',
        width: 90,
        height: 90,
        cornerRadius: 45,
        fill: C.card,
        stroke: C.border,
        strokeWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 6,
      },
      [part('label', T('Next.js', { fontSize: 12, fontWeight: '600', textAlign: 'center' }))],
    ),
  ),
  comp(
    'Landing/Hover Card',
    Col(
      {
        name: 'Hover Card',
        width: 290,
        padding: 16,
        gap: 10,
        cornerRadius: 12,
        fill: C.popover,
        stroke: C.border,
        strokeWidth: 1,
        effect: { type: 'shadow', color: C.shadow, offset: { x: 0, y: 16 }, blur: 40 },
      },
      [
        Row({ gap: 12, alignItems: 'start' }, [
          F(
            {
              name: 'Avatar',
              width: 48,
              height: 48,
              cornerRadius: 24,
              fill: gradient(C.primary, C.magenta500),
              justifyContent: 'center',
              alignItems: 'center',
            },
            [part('initials', T('VT', { fontSize: 15, fontWeight: '700', fill: C.white }))],
          ),
          Col({ gap: 2 }, [
            part('name', T('Vladyslav Tesliuk', { fontSize: 14, fontWeight: '600' })),
            part('meta', T('@Lordpluha · Author', { fontSize: 12, fill: C.mutedForeground })),
          ]),
        ]),
        part('bio', P('Author and maintainer of Bitrate.', { fontSize: 13, fill: C.foreground })),
        Row({ name: 'Links', gap: 8 }, [
          part('link1', Button('GitHub ↗', 'outline')),
          part('link2', Button('Repository ↗', 'ghost')),
        ]),
      ],
    ),
  ),
  comp(
    'Landing/Cradle',
    Col({ name: 'Cradle', width: 320, gap: 0, alignItems: 'center' }, [
      F({ name: 'Bar', width: 320, height: 4, cornerRadius: 2, fill: C.mutedForeground }),
      Row(
        { name: 'Balls', gap: 2, alignItems: 'start' },
        Array.from({ length: 5 }, (_, i) =>
          Col({ name: `Pendulum ${i + 1}`, gap: 0, alignItems: 'center' }, [
            F({ name: 'String', width: 1.5, height: i === 0 ? 96 : 120, fill: C.border }),
            F({
              name: 'Ball',
              width: 56,
              height: 56,
              cornerRadius: 28,
              fill: sphereFill(C.neutral200, C.mutedForeground),
            }),
          ]),
        ),
      ),
    ]),
  ),
)

/* signal cursor: one cursor everywhere (pointer devices); touch gets the press ripple instead */
const ring = (size, o = {}, children = []) =>
  F(
    {
      name: 'Ring',
      width: size,
      height: size,
      cornerRadius: size / 2,
      stroke: C.accent,
      strokeWidth: 1.5,
      justifyContent: 'center',
      alignItems: 'center',
      ...o,
    },
    children,
  )
const cdot = (d = 6, fill = C.foreground) =>
  F({ name: 'Dot', width: d, height: d, cornerRadius: d / 2, fill })
add(
  comp('Cursor/Default', ring(40, {}, [cdot()])),
  comp('Cursor/Hover', ring(56, { fill: C.sidebarAccent }, [])),
  comp(
    'Cursor/Play',
    Row(
      { name: 'Play Pill', height: 40, padding: [0, 14], gap: 8, cornerRadius: 20, fill: C.white },
      [
        I('play', { width: 14, height: 14, fill: C.background }),
        part('label', T('Play', { fontSize: 13, fontWeight: '600', fill: C.background })),
      ],
    ),
  ),
  comp(
    'Cursor/Drag',
    ring(56, { gap: 6 }, [
      I('chevron-left', { width: 14, height: 14, fill: C.accent }),
      I('chevron-right', { width: 14, height: 14, fill: C.accent }),
    ]),
  ),
  comp('Cursor/Text', F({ name: 'Beam', width: 2, height: 22, cornerRadius: 1, fill: C.accent })),
  comp(
    'Cursor/Scrub',
    Col({ name: 'Scrub', gap: 4, alignItems: 'center' }, [
      Row({ name: 'Label', height: 20, padding: [0, 6], cornerRadius: 6, fill: C.foreground }, [
        part('label', T('1:48', { fontSize: 11, fontWeight: '600', fill: C.background })),
      ]),
      F({ name: 'Line', width: 2, height: 28, cornerRadius: 1, fill: C.accent }),
    ]),
  ),
  comp(
    'Cursor/Loading',
    ring(40, { stroke: C.border }, [I('loader-circle', { width: 22, height: 22, fill: C.accent })]),
  ),
  comp('Cursor/Pressed', ring(30, {}, [cdot(6, C.accent)])),
  comp(
    'Cursor/Disabled',
    ring(40, { stroke: C.mutedForeground }, [
      I('ban', { width: 16, height: 16, fill: C.mutedForeground }),
    ]),
  ),
  comp(
    'Cursor/Listening',
    ring(
      44,
      { gap: 2 },
      [6, 12, 18, 12, 6].map((h, i) =>
        F({ name: `Bar ${i + 1}`, width: 2, height: h, cornerRadius: 1, fill: C.accent }),
      ),
    ),
  ),
  comp(
    'Cursor/Touch Ripple',
    ring(72, { stroke: C.accent, strokeWidth: 1 }, [
      F({ name: 'Press', width: 40, height: 40, cornerRadius: 20, fill: C.sidebarAccent }),
    ]),
  ),
)

/* toasts: one family, bottom-right on desktop (above the player bar), top on mobile; Sonner-like stack */
const toastBase = (name, lead, { action, close = true, w = 360 } = {}) =>
  comp(
    name,
    Row(
      {
        name: 'Toast',
        width: w,
        padding: [12, 12, 12, 14],
        gap: 12,
        cornerRadius: 12,
        fill: C.popover,
        stroke: C.border,
        strokeWidth: 1,
        alignItems: 'start',
        effect: { type: 'shadow', color: C.shadow, offset: { x: 0, y: 12 }, blur: 32 },
      },
      [
        lead,
        Col({ gap: 2, width: 'fill_container' }, [
          part('title', T('Title', { fontSize: 14, fontWeight: '600' })),
          part('desc', T('Description', { fontSize: 12, fill: C.mutedForeground })),
        ]),
        action && part('action', Button(action, 'outline')),
        close && I('x', { width: 14, height: 14, fill: C.mutedForeground }),
      ].filter(Boolean),
    ),
  )
const toastIcon = (icon, fill) =>
  F({ name: 'Icon', width: 20, height: 20, justifyContent: 'center', alignItems: 'center' }, [
    I(icon, { width: 18, height: 18, fill }),
  ])
add(
  toastBase('Toast/Success', toastIcon('circle-check', C.success)),
  toastBase('Toast/Error', toastIcon('circle-x', C.destructive), { action: 'Retry' }),
  toastBase('Toast/Info', toastIcon('info', C.info)),
  toastBase('Toast/Warning', toastIcon('triangle-alert', C.warning)),
  toastBase('Toast/Undo', toastIcon('trash-2', C.mutedForeground), { action: 'Undo' }),
  toastBase('Toast/Offline', toastIcon('wifi-off', C.mutedForeground), { close: false }),
  toastBase(
    'Toast/Loading',
    Ref(reg['Loader/Logo Mini'].id, { name: 'Logo Loader', width: 20, height: 20 }),
    { close: false },
  ),
  toastBase('Toast/Media', part('cover', cover({ width: 40, height: 40, cornerRadius: 6 })), {
    action: 'View queue',
  }),
)

/* 404 "signal lost": a flatline where the music should be */
add(
  comp(
    'NotFound/Flatline',
    Row(
      { name: 'Flatline', gap: 4, alignItems: 'center', height: 64 },
      [
        10, 18, 30, 46, 30, 22, 38, 54, 30, 14, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 12, 26, 44, 60, 36,
        20, 34, 48, 24, 12,
      ].map((h, i) =>
        F({
          name: 'Bar',
          width: 6,
          height: h,
          cornerRadius: 3,
          fill: h <= 4 ? C.destructive : i < 10 ? C.primary : C.accent,
        }),
      ),
    ),
  ),
)

/* AI assistant: a small button bottom-right on every page outside the in-app player; it expands into a chat */
const ATMO_G = {
  type: 'gradient',
  gradientType: 'linear',
  rotation: 135,
  colors: [
    { color: C.primary, position: 0 },
    { color: C.magenta500, position: 1 },
  ],
}
const bubble = (name, mine) =>
  comp(
    name,
    Row({ name: 'Bubble Row', width: 'fill_container', justifyContent: mine ? 'end' : 'start' }, [
      Col(
        {
          name: 'Bubble',
          width: 'fit_content',
          padding: [10, 12],
          cornerRadius: 14,
          gap: 4,
          ...(mine ? { fill: C.primary } : { fill: C.muted }),
        },
        [
          part(
            'text',
            T('Message', {
              fontSize: 13,
              lineHeight: 1.45,
              fill: mine ? C.primaryForeground : C.foreground,
              textGrowth: 'fixed-width',
              width: 240,
            }),
          ),
        ],
      ),
    ]),
  )
const orbFill = {
  type: 'gradient',
  gradientType: 'radial',
  colors: [
    { color: C.white, position: 0 },
    { color: C.accent, position: 0.35 },
    { color: C.primary, position: 0.7 },
    { color: C.magenta500, position: 1 },
  ],
}
const orb = (name, d) =>
  comp(
    name,
    F({
      name: 'Orb',
      width: d,
      height: d,
      cornerRadius: d / 2,
      fill: orbFill,
      effect: { type: 'shadow', color: C.primary, offset: { x: 0, y: 0 }, blur: d / 2 },
    }),
  )
add(orb('Assistant/Orb', 64), orb('Assistant/Orb Small', 20))
add(
  comp(
    'Assistant/FAB',
    F(
      {
        name: 'Assistant',
        width: 52,
        height: 52,
        cornerRadius: 26,
        fill: ATMO_G,
        justifyContent: 'center',
        alignItems: 'center',
        effect: { type: 'shadow', color: C.shadow, offset: { x: 0, y: 10 }, blur: 28 },
      },
      [part('icon', I('sparkles', { width: 22, height: 22, fill: C.white }))],
    ),
  ),
  comp(
    'Assistant/FAB Open',
    F(
      {
        name: 'Assistant',
        width: 52,
        height: 52,
        cornerRadius: 26,
        fill: C.card,
        stroke: C.border,
        strokeWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
      [I('x', { width: 20, height: 20, fill: C.foreground })],
    ),
  ),
  bubble('Assistant/Message', false),
  bubble('Assistant/Message Mine', true),
  comp(
    'Assistant/Typing',
    Row({ name: 'Typing', gap: 8, padding: [8, 12], cornerRadius: 14, fill: C.muted }, [
      Ref(reg['Assistant/Orb Small'].id, { name: 'Orb' }),
      part('label', T('Searching the docs…', { fontSize: 12, fill: C.mutedForeground })),
    ]),
  ),
  comp(
    'Assistant/Suggestion',
    Row(
      {
        name: 'Suggestion',
        height: 32,
        padding: [0, 12],
        gap: 6,
        cornerRadius: 16,
        stroke: C.border,
        strokeWidth: 1,
      },
      [
        I('sparkles', { width: 12, height: 12, fill: C.accent }),
        part('label', T('Suggestion', { fontSize: 12, fontWeight: '500' })),
      ],
    ),
  ),
)
add(
  comp(
    'Assistant/Panel',
    Col(
      {
        name: 'Assistant Panel',
        width: 380,
        height: 540,
        cornerRadius: 18,
        fill: C.popover,
        stroke: C.border,
        strokeWidth: 1,
        effect: { type: 'shadow', color: C.shadow, offset: { x: 0, y: 24 }, blur: 60 },
      },
      [
        Row(
          {
            name: 'Head',
            width: 'fill_container',
            height: 60,
            padding: [0, 14],
            gap: 10,
            stroke: C.border,
            strokeWidth: { bottom: 1 },
          },
          [
            F(
              {
                name: 'Mark',
                width: 32,
                height: 32,
                cornerRadius: 16,
                fill: C.muted,
                justifyContent: 'center',
                alignItems: 'center',
              },
              [Ref(reg['Logo/Mark Path'].id, { name: 'Mark', width: 18, height: 18 })],
            ),
            Col({ gap: 1, width: 'fill_container' }, [
              T('Bitrate assistant', { fontSize: 14, fontWeight: '600' }),
              part(
                'status',
                T('AI · can make mistakes', { fontSize: 11, fill: C.mutedForeground }),
              ),
            ]),
            I('maximize-2', { width: 16, height: 16, fill: C.mutedForeground }),
            I('x', { width: 16, height: 16, fill: C.mutedForeground }),
          ],
        ),
        slot('messages', { height: 'fill_container', padding: 14, gap: 10 }),
        Col(
          {
            name: 'Composer',
            width: 'fill_container',
            padding: [10, 12, 12, 12],
            gap: 8,
            stroke: C.border,
            strokeWidth: { top: 1 },
          },
          [
            Row(
              {
                name: 'Input',
                width: 'fill_container',
                height: 44,
                padding: [0, 6, 0, 12],
                gap: 8,
                cornerRadius: 12,
                fill: C.muted,
              },
              [
                part(
                  'placeholder',
                  T('Ask about Bitrate…', { fontSize: 13, fill: C.mutedForeground }),
                ),
                F({ name: 'Spacer', width: 'fill_container', height: 1 }),
                F(
                  {
                    name: 'Send',
                    width: 32,
                    height: 32,
                    cornerRadius: 10,
                    fill: C.primary,
                    justifyContent: 'center',
                    alignItems: 'center',
                  },
                  [I('arrow-up', { width: 16, height: 16, fill: C.primaryForeground })],
                ),
              ],
            ),
            part(
              'disclaimer',
              T('Answers come from Bitrate docs. Do not share passwords or payment details.', {
                fontSize: 10,
                fill: C.textSubdued,
              }),
            ),
          ],
        ),
      ],
    ),
  ),
)

/* podcasts: episode rows (default, playing, in progress, played), podcast transport, chapters */
const epRow = (name, kind) =>
  comp(
    name,
    Row(
      {
        name: 'Episode',
        width: 'fill_container',
        padding: [14, 12],
        gap: 16,
        cornerRadius: 12,
        alignItems: 'start',
        ...(kind === 'playing' ? { fill: C.sidebarAccent } : {}),
      },
      [
        part('cover', cover({ width: 64, height: 64, cornerRadius: 8, fill: img(ART.stage) })),
        Col({ gap: 6, width: 'fill_container' }, [
          Row({ name: 'Meta', gap: 8 }, [
            part('date', T('8 Oct 2026', { fontSize: 12, fill: C.mutedForeground })),
            T('·', { fontSize: 12, fill: C.mutedForeground }),
            part('duration', T('48 min', { fontSize: 12, fill: C.mutedForeground })),
            ...(kind === 'played'
              ? [
                  Row({ gap: 4 }, [
                    I('circle-check', { width: 12, height: 12, fill: C.success }),
                    T('Played', { fontSize: 12, fill: C.successText }),
                  ]),
                ]
              : []),
            ...(kind === 'progress'
              ? [
                  part(
                    'left',
                    T('23 min left', { fontSize: 12, fontWeight: '600', fill: C.accent }),
                  ),
                ]
              : []),
            ...(kind === 'playing'
              ? [
                  Row({ gap: 4 }, [
                    I('audio-lines', { width: 12, height: 12, fill: C.accent }),
                    T('Playing', { fontSize: 12, fontWeight: '600', fill: C.accent }),
                  ]),
                ]
              : []),
          ]),
          part(
            'title',
            T('Episode title', {
              fontSize: 15,
              fontWeight: '600',
              fill:
                kind === 'playing'
                  ? C.accent
                  : kind === 'played'
                    ? C.mutedForeground
                    : C.foreground,
            }),
          ),
          part(
            'desc',
            P('Episode description that wraps to two lines in the list.', {
              fontSize: 13,
              textGrowth: 'fixed-width',
              width: 'fill_container',
            }),
          ),
          ...(kind === 'progress' || kind === 'playing'
            ? [
                Row({ name: 'Progress', width: 'fill_container', gap: 0, height: 3 }, [
                  part(
                    'elapsedBar',
                    F({ name: 'Elapsed', width: 180, height: 3, cornerRadius: 2, fill: C.primary }),
                  ),
                  F({
                    name: 'Rest',
                    width: 'fill_container',
                    height: 3,
                    cornerRadius: 2,
                    fill: C.surface,
                  }),
                ]),
              ]
            : []),
        ]),
        Row({ name: 'Actions', gap: 10, alignItems: 'center' }, [
          part(
            'save',
            I(kind === 'played' ? 'bookmark-plus' : 'bookmark-check', {
              width: 18,
              height: 18,
              fill: kind === 'played' ? C.mutedForeground : C.accent,
            }),
          ),
          I('ellipsis', { width: 18, height: 18, fill: C.mutedForeground }),
          F(
            {
              name: 'Play',
              width: 36,
              height: 36,
              cornerRadius: 18,
              fill: kind === 'playing' ? C.primary : C.muted,
              justifyContent: 'center',
              alignItems: 'center',
            },
            [
              I(kind === 'playing' ? 'pause' : 'play', {
                width: 14,
                height: 14,
                fill: kind === 'playing' ? C.primaryForeground : C.foreground,
              }),
            ],
          ),
        ]),
      ],
    ),
  )
add(
  epRow('Podcast/Episode', 'default'),
  epRow('Podcast/Episode Playing', 'playing'),
  epRow('Podcast/Episode Progress', 'progress'),
  epRow('Podcast/Episode Played', 'played'),
)
const skip = (icon, n) =>
  Col({ name: `Skip ${n}`, gap: 0, alignItems: 'center' }, [
    I(icon, { width: 26, height: 26, fill: C.foreground }),
    T(String(n), { fontSize: 10, fontWeight: '700', fill: C.mutedForeground }),
  ])
add(
  comp(
    'Podcast/Transport',
    Row({ name: 'Podcast Transport', width: 'fill_container', justifyContent: 'space_between' }, [
      Row(
        {
          name: 'Speed',
          height: 30,
          padding: [0, 10],
          cornerRadius: 15,
          stroke: C.border,
          strokeWidth: 1,
        },
        [part('speed', T('1×', { fontSize: 13, fontWeight: '600' }))],
      ),
      skip('rotate-ccw', 15),
      F(
        {
          name: 'Play',
          width: 64,
          height: 64,
          cornerRadius: 32,
          fill: C.primary,
          justifyContent: 'center',
          alignItems: 'center',
        },
        [part('playIcon', I('pause', { width: 26, height: 26, fill: C.primaryForeground }))],
      ),
      skip('rotate-cw', 30),
      Row({ name: 'Sleep', gap: 4 }, [
        I('moon', { width: 18, height: 18, fill: C.mutedForeground }),
        part('timer', T('Off', { fontSize: 12, fill: C.mutedForeground })),
      ]),
    ]),
  ),
  comp(
    'Podcast/Chapter',
    Row(
      { name: 'Chapter', width: 'fill_container', padding: [10, 12], gap: 14, cornerRadius: 10 },
      [
        part(
          'time',
          T('12:40', { fontSize: 12, fontWeight: '600', fill: C.accent, fontFamily: 'font-sans' }),
        ),
        part('title', T('Chapter', { fontSize: 14, fill: C.foreground })),
        F({ name: 'Spacer', width: 'fill_container', height: 1 }),
        part('duration', T('8 min', { fontSize: 12, fill: C.mutedForeground })),
      ],
    ),
  ),
  comp(
    'Podcast/Chapter Active',
    Row(
      {
        name: 'Chapter',
        width: 'fill_container',
        padding: [10, 12],
        gap: 14,
        cornerRadius: 10,
        fill: C.sidebarAccent,
      },
      [
        I('audio-lines', { width: 14, height: 14, fill: C.accent }),
        part('time', T('12:40', { fontSize: 12, fontWeight: '600', fill: C.accent })),
        part('title', T('Chapter', { fontSize: 14, fontWeight: '600' })),
        F({ name: 'Spacer', width: 'fill_container', height: 1 }),
        part('duration', T('8 min', { fontSize: 12, fill: C.mutedForeground })),
      ],
    ),
  ),
  comp(
    'Podcast/Seek Chapters',
    Col({ name: 'Seek', width: 'fill_container', gap: 8 }, [
      Row({ name: 'Rail', width: 'fill_container', height: 12, gap: 2 }, [
        F({ name: 'Ch 1', width: 90, height: 4, cornerRadius: 2, fill: C.primary }),
        F({ name: 'Ch 2', width: 120, height: 4, cornerRadius: 2, fill: C.primary }),
        part(
          'current',
          F({ name: 'Ch 3', width: 60, height: 4, cornerRadius: 2, fill: C.primary }),
        ),
        F({ name: 'Thumb', width: 12, height: 12, cornerRadius: 6, fill: C.foreground }),
        F({ name: 'Ch 3 rest', width: 50, height: 4, cornerRadius: 2, fill: C.surface }),
        F({ name: 'Ch 4', width: 'fill_container', height: 4, cornerRadius: 2, fill: C.surface }),
      ]),
      Row({ name: 'Times', width: 'fill_container', justifyContent: 'space_between' }, [
        part('elapsed', T('24:12', { fontSize: 12, fill: C.mutedForeground })),
        part(
          'chapter',
          T('Chapter 3 · Headphone mixes', { fontSize: 12, fontWeight: '600', fill: C.accent }),
        ),
        part('duration', T('-23:48', { fontSize: 12, fill: C.mutedForeground })),
      ]),
    ]),
  ),
)

/* lay the page out */
const rows = []
for (let i = 0; i < blocks.length; i += 6)
  rows.push(
    Row(
      { name: `Blocks Row ${i / 6 + 1}`, gap: 48, alignItems: 'start' },
      blocks
        .slice(i, i + 6)
        .map((b) =>
          Col({ name: `Cell / ${b.name}`, gap: 12 }, [
            T(b.name, { fontSize: 12, fill: C.mutedForeground }),
            b,
          ]),
        ),
    ),
  )
const page = F(
  { name: '00E • Page Blocks', layout: 'vertical', gap: 56, padding: 64, fill: C.background },
  [
    H('Page blocks', 40, { fontWeight: '700' }),
    P(
      'Composites every screen is built from. Screens use only these and the shadcn kit — nothing is drawn locally.',
      { width: 720 },
    ),
    ...rows,
  ],
)
/* fixes on persistent kit/library nodes (outside the page-blocks page), applied on every build */
const FIXES = {
  e2ahIG: { fill: C.foreground }, // Switch/Unchecked thumb: visible on the dark track (shadcn v4 dark)
  jjufD: { stroke: C.border, strokeWidth: 1 }, // Card/Artist: keeps its edge on the light theme
  dKgOu: { stroke: C.border, strokeWidth: 1 }, // Card/Playlist
  m015cR: { stroke: C.border, strokeWidth: 1 }, // Card/Album
  YSAj4: { fontSize: 13 },
  eGEfP: { fontSize: 14 },
  cNYVw: { fontSize: 12 },
  REBNx: { fontSize: 13 },
  QCCe4: { fontSize: 12 },
  PiTbk: { fontSize: 12 },
}
const patch = (n) => {
  if (Array.isArray(n)) return n.forEach(patch)
  if (!n || typeof n !== 'object') return
  if (n.id && FIXES[n.id]) Object.assign(n, FIXES[n.id])
  Object.values(n).forEach(patch)
}
patch(lib.children)
/* "09 • Toasts" pattern page in Product patterns: variants, stack, placement and rules */
const toastRef = (kind, title, desc, w = 360) =>
  Ref(
    reg[`Toast/${kind}`].id,
    { name: `Toast / ${kind}`, width: w },
    {
      [reg[`Toast/${kind}`].parts.title]: { content: title },
      [reg[`Toast/${kind}`].parts.desc]: { content: desc },
    },
  )
const VARIANTS = [
  ['Success', 'Saved to Liked Songs', 'Night Signal · Mira Sol'],
  ['Error', 'Could not save the playlist', 'Check your connection and try again.'],
  ['Info', 'Playing on Desktop', 'Playback moved from this phone.'],
  ['Warning', 'Storage almost full', 'Downloads will pause at 95%.'],
  ['Undo', 'Removed from Night drive', '1 track removed.'],
  ['Loading', 'Uploading cover…', 'Night drive · 64%'],
  ['Offline', 'You are offline', 'Playing from downloads. Changes sync later.'],
  ['Media', 'Added to queue', 'Night Signal · Mira Sol'],
]
const section = (title, children) =>
  Col({ name: title, gap: 16 }, [H(title, 22, { fontWeight: '700' }), ...children])
const toastPage = F(
  {
    name: '09 • Toasts',
    layout: 'vertical',
    gap: 48,
    padding: 64,
    fill: C.background,
    width: 1440,
  },
  [
    H('Toasts', 40, { fontWeight: '700' }),
    P(
      'Non-blocking feedback. One region per app: bottom-right above the player bar on desktop, top on phones. Newest in front, two peek behind; hover expands the stack. Auto-dismiss after 4 s (errors and loading stay until resolved or closed), swipe or ✕ to dismiss, Esc closes the newest. Success/info use aria-live polite, errors assertive.',
      { width: 900 },
    ),
    section('Variants', [
      Row({ name: 'Variant Columns', gap: 32, alignItems: 'start' }, [
        Col(
          { gap: 14 },
          VARIANTS.slice(0, 4).map(([k, t, d]) =>
            Col({ gap: 6 }, [T(k, { fontSize: 12, fill: C.mutedForeground }), toastRef(k, t, d)]),
          ),
        ),
        Col(
          { gap: 14 },
          VARIANTS.slice(4).map(([k, t, d]) =>
            Col({ gap: 6 }, [T(k, { fontSize: 12, fill: C.mutedForeground }), toastRef(k, t, d)]),
          ),
        ),
      ]),
    ]),
    section('Stack', [
      Row({ name: 'Stacks', gap: 56, alignItems: 'start' }, [
        Col({ name: 'Collapsed', gap: 10 }, [
          T('Collapsed · newest in front', { fontSize: 12, fill: C.mutedForeground }),
          Col({ gap: 4, alignItems: 'center', width: 360 }, [
            toastRef('Undo', 'Removed from Night drive', '1 track removed.', 328),
            toastRef('Success', 'Saved to Liked Songs', 'Night Signal · Mira Sol', 344),
            toastRef('Media', 'Added to queue', 'Night Signal · Mira Sol'),
          ]),
        ]),
        Col({ name: 'Expanded', gap: 10 }, [
          T('Expanded on hover', { fontSize: 12, fill: C.mutedForeground }),
          Col({ gap: 10 }, [
            toastRef('Media', 'Added to queue', 'Night Signal · Mira Sol'),
            toastRef('Success', 'Saved to Liked Songs', 'Night Signal · Mira Sol'),
            toastRef('Undo', 'Removed from Night drive', '1 track removed.'),
          ]),
        ]),
      ]),
    ]),
    section('Placement', [
      Row({ name: 'Placements', gap: 48, alignItems: 'start' }, [
        Col({ gap: 8 }, [
          T('Desktop · bottom-right, above the player bar', {
            fontSize: 12,
            fill: C.mutedForeground,
          }),
          Col(
            {
              name: 'Desktop Screen',
              width: 640,
              height: 380,
              cornerRadius: 14,
              fill: C.card,
              stroke: C.border,
              strokeWidth: 1,
              padding: 16,
              gap: 12,
              justifyContent: 'end',
              alignItems: 'end',
            },
            [
              toastRef('Success', 'Saved to Liked Songs', 'Night Signal · Mira Sol', 300),
              F({
                name: 'Player Bar',
                width: 'fill_container',
                height: 44,
                cornerRadius: 10,
                fill: C.muted,
              }),
            ],
          ),
        ]),
        Col({ gap: 8 }, [
          T('Phone · top, under the status bar', { fontSize: 12, fill: C.mutedForeground }),
          Col(
            {
              name: 'Phone Screen',
              width: 220,
              height: 420,
              cornerRadius: 28,
              fill: C.card,
              stroke: C.border,
              strokeWidth: 1,
              padding: [36, 10, 10, 10],
              gap: 10,
            },
            [toastRef('Info', 'Playing on Desktop', 'Moved from this phone.', 'fill_container')],
          ),
        ]),
      ]),
    ]),
  ],
)
restamp('page:09 Toasts', toastPage)
const prow = root.children.find((c) => c.id === 'dsRowP')
const tAt = prow.children.findIndex((c) => c.name === '09 • Toasts')
if (tAt >= 0) prow.children[tAt] = toastPage
else prow.children.push(toastPage)
if (at >= 0) row.children[at] = page
else row.children.push(page)
writeFileSync(libF, JSON.stringify(lib, null, 2))
writeFileSync(regF, JSON.stringify(reg, null, 2))
console.log('components', Object.keys(reg).length)
