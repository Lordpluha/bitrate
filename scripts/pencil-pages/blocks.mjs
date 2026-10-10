// Builds the "00E • Page Blocks" components into the library and records a registry of their
// ids and overridable parts, so screens can be composed from library instances only.
import { readFileSync, writeFileSync } from 'node:fs'
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
} from './kit.mjs'

setMode('lib')
const [libF, regF] = process.argv.slice(2)
const lib = JSON.parse(readFileSync(libF, 'utf8'))
const ids = []
const collect = (n) => {
  if (Array.isArray(n)) return n.forEach(collect)
  if (!n || typeof n !== 'object') return
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
const comp = (name, node) => {
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
    fontSize: 64,
    fontWeight: '700',
    letterSpacing: -1.2,
    lineHeight: 1.05,
  }),
  txt('Text/Display Primary', '404', {
    fontFamily: 'font-heading',
    fontSize: 120,
    fontWeight: '700',
    fill: C.primary,
  }),
  txt('Text/H1', 'Heading 1', {
    fontFamily: 'font-heading',
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -0.6,
    lineHeight: 1.05,
  }),
  txt('Text/H2', 'Heading 2', {
    fontFamily: 'font-heading',
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: -0.4,
  }),
  txt('Text/H3', 'Heading 3', { fontFamily: 'font-heading', fontSize: 22, fontWeight: '600' }),
  txt('Text/H4', 'Heading 4', { fontFamily: 'font-heading', fontSize: 18, fontWeight: '600' }),
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
    fontSize: 28,
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
    fontSize: 40,
    fontWeight: '700',
    textGrowth: 'fixed-width',
    width: 720,
  }),
  txt('Text/Lyric', 'Upcoming lyric line', {
    fontFamily: 'font-heading',
    fontSize: 40,
    fontWeight: '700',
    fill: C.mutedForeground,
    textGrowth: 'fixed-width',
    width: 720,
  }),
  txt('Text/Lyric Past', 'Past lyric line', {
    fontFamily: 'font-heading',
    fontSize: 40,
    fontWeight: '700',
    fill: C.textSubdued,
    textGrowth: 'fixed-width',
    width: 720,
  }),
  txt('Text/On Media', 'On artwork', { fill: C.white }),
  txt('Text/On Media Display', 'On artwork', {
    fontFamily: 'font-heading',
    fontSize: 72,
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
        padding: [0, 12],
        gap: 16,
        stroke: C.border,
        strokeWidth: { bottom: 1 },
      },
      [
        T('#', { fontSize: 12, fill: C.mutedForeground, width: 30, textGrowth: 'fixed-width' }),
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
          part('title', T('Setting', { fontWeight: '600' })),
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
        gap: 28,
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
add(
  txt('Text/Display Accent', 'Accent', {
    fontFamily: 'font-heading',
    fontSize: 64,
    fontWeight: '700',
    letterSpacing: -1.2,
    fill: C.accent,
    lineHeight: 1.05,
  }),
  txt('Text/H1 Accent', 'Accent', {
    fontFamily: 'font-heading',
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -0.6,
    fill: C.accent,
    lineHeight: 1.05,
  }),
  txt('Text/H1 Magenta', 'Magenta', {
    fontFamily: 'font-heading',
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -0.6,
    fill: C.magenta500,
    lineHeight: 1.05,
  }),
  txt('Text/Display Magenta', 'Magenta', {
    fontFamily: 'font-heading',
    fontSize: 64,
    fontWeight: '700',
    letterSpacing: -1.2,
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
          Row(
            { gap: 28 },
            ['Log in', 'Create account', 'Player preview', 'Legal'].map((l) =>
              T(l, { fontSize: 14, fill: C.mutedForeground }),
            ),
          ),
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
if (at >= 0) row.children[at] = page
else row.children.push(page)
writeFileSync(libF, JSON.stringify(lib, null, 2))
writeFileSync(regF, JSON.stringify(reg, null, 2))
console.log('components', Object.keys(reg).length)
