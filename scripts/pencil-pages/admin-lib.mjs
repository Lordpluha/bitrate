// Builds the admin console's own design system, pencil/web-admin-design/design-system/admin.lib.pen,
// and a registry of its ids and overridable parts (registry-admin.json). It is separate from the player's
// library and follows the admin prototype (pencil/web-admin-design/prototype/admin-bento-prototype.html):
// glass surfaces over a soft aurora, a floating sidebar, a centred search, the status island, bento tiles,
// analysis panels and the notification settings. Colours are the code's tokens (apps/admin uses
// @bitrate/tailwind): this script keeps the file's colour variables and `pnpm design:tokens` writes them
// from code; fonts are set here. Glass is a translucent token fill plus a background blur; chart series
// share one plot by stacking flex children with a negative gap (no absolute positioning).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { C, T, H, I, F, Row, Col, Ref, id, setMode } from './kit.mjs'

setMode('lib')
const [libF, regF] = process.argv.slice(2)
const ROOT = join(dirname(new URL(import.meta.url).pathname), '../..')

const reg = {}
const part = (p, node) => Object.assign(node, { _part: p })
/* stable ids hashed from the component name and the node's position, so rebuilding without structural
   changes keeps every id and open designs never point at vanished nodes */
const ALPHA = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const taken = new Set()
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
/** An instance of one of this library's components, by name; `parts` overrides its named parts. */
const use = (name, o = {}, parts = {}) => {
  const c = reg[name]
  if (!c) throw new Error(`no component "${name}"`)
  const desc = {}
  for (const [p, v] of Object.entries(parts)) if (v !== undefined) desc[c.parts[p]] = v
  return Ref(c.id, { name, ...o }, Object.keys(desc).length ? desc : undefined)
}
/** Part paths inside a nested instance, so screens can reach them through the parent. */
const nest = (owner, partName, inner) => {
  const o = reg[owner].parts
  for (const [p, pid] of Object.entries(reg[inner].parts))
    o[`${partName}.${p}`] = `${o[partName]}/${pid}`
}
const slot = (p, o = {}) =>
  part(p, F({ name: 'Slot', layout: 'vertical', gap: 12, width: 'fill_container', slot: [], ...o }))
const muted = (s, o = {}) => T(s, { fontSize: 13, fill: C.mutedForeground, ...o })

const blocks = []
const add = (...n) => blocks.push(...n)

/* ---------- glass and colour helpers: every colour is a token ---------- */
/** A token at partial opacity: a flat linear gradient carries the alpha the token itself does not. */
const tint = (color, opacity) => ({
  type: 'gradient',
  gradientType: 'linear',
  opacity,
  colors: [
    { color, position: 0 },
    { color, position: 1 },
  ],
})
/* fully transparent stops of the brand colours (allowed: they carry no colour, only the fade) */
const CLEAR = {
  primary: '#7C3AED00',
  blue: '#3B82F600',
  magenta: '#EC489900',
  success: '#10B98100',
}
const fade = (color, clear, rotation = 180, opacity = 1) => ({
  type: 'gradient',
  gradientType: 'linear',
  rotation,
  opacity,
  colors: [
    { color, position: 0 },
    { color: clear, position: 1 },
  ],
})
const BLUR = { type: 'background_blur', radius: 22 }
const SHADOW = {
  type: 'shadow',
  shadowType: 'outer',
  offset: { x: 0, y: 24 },
  blur: 60,
  color: C.shadow,
}
const GLOW = {
  type: 'shadow',
  shadowType: 'outer',
  offset: { x: 0, y: 10 },
  blur: 26,
  color: C.primary,
}
const glass = (alpha = 0.58) => ({
  fill: tint(C.card, alpha),
  stroke: C.border,
  strokeWidth: 1,
  effect: [BLUR, SHADOW],
})
const soft = (alpha = 0.06) => tint(C.foreground, alpha)
const TONES = {
  Neutral: [soft(0.08), C.foreground],
  Primary: [C.primary, C.primaryForeground],
  Success: [C.successSurface, C.successText],
  Info: [C.infoSurface, C.infoText],
  Warning: [C.warningSurface, C.warningText],
  Error: [C.errorSurface, C.errorText],
}

/* ---------- primitives ---------- */
const txt = (name, o) => comp(name, part('text', T(name.split('/')[1], o)))
add(
  txt('Text/Display', {
    fontFamily: 'font-heading',
    fontSize: 38,
    fontWeight: '600',
    letterSpacing: -0.8,
  }),
  txt('Text/H1', {
    fontFamily: 'font-heading',
    fontSize: 30,
    fontWeight: '600',
    letterSpacing: -0.6,
  }),
  txt('Text/H2', {
    fontFamily: 'font-heading',
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: -0.3,
  }),
  txt('Text/Figure', {
    fontFamily: 'font-heading',
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: -0.5,
  }),
  txt('Text/Body', { fontSize: 14 }),
  txt('Text/Body Strong', { fontSize: 14, fontWeight: '600' }),
  txt('Text/Muted', { fontSize: 13, fill: C.mutedForeground }),
  txt('Text/Caption', { fontSize: 12, fill: C.mutedForeground }),
  txt('Text/Eyebrow', {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.3,
    fill: C.mutedForeground,
  }),
  txt('Text/Link', { fontSize: 13, fontWeight: '600', fill: C.accent }),
)
const BUTTON = {
  Default: [{ fill: C.primary, effect: GLOW }, C.primaryForeground],
  Glass: [{ fill: soft(0.08) }, C.foreground],
  Outline: [{ stroke: C.border, strokeWidth: 1 }, C.foreground],
}
for (const [v, [surface, ink]] of Object.entries(BUTTON))
  add(
    comp(
      `Button/${v}`,
      Row({ name: 'Button', height: 38, padding: [0, 16], gap: 8, cornerRadius: 19, ...surface }, [
        part('icon', I('plus', { width: 16, height: 16, fill: ink })),
        part('label', T('Button', { fontSize: 13, fontWeight: '600', fill: ink })),
      ]),
    ),
  )
for (const [v, surface] of [
  ['Ghost', {}],
  ['Glass', { fill: soft(0.06) }],
  ['Raised', { ...glass(0.8), effect: [BLUR] }],
])
  add(
    comp(
      `Button/Icon ${v}`,
      Row(
        {
          name: 'Icon Button',
          width: 40,
          height: 40,
          cornerRadius: 20,
          justifyContent: 'center',
          ...surface,
        },
        [part('icon', I('plus', { width: 18, height: 18, fill: C.foreground }))],
      ),
    ),
  )
add(
  comp('Divider', F({ name: 'Divider', width: 'fill_container', height: 1, fill: C.border })),
  comp(
    'Skeleton',
    F({ name: 'Skeleton', width: 120, height: 12, cornerRadius: 8, fill: soft(0.08) }),
  ),
  comp(
    'Spinner',
    F({ name: 'Spinner', width: 14, height: 14, layout: 'vertical' }, [
      {
        type: 'ellipse',
        id: id(),
        name: 'Arc',
        width: 14,
        height: 14,
        fill: C.primary,
        innerRadius: 0.72,
        sweepAngle: 270,
      },
    ]),
  ),
  comp(
    'Avatar',
    Row(
      {
        name: 'Avatar',
        width: 40,
        height: 40,
        cornerRadius: 20,
        justifyContent: 'center',
        fill: {
          type: 'gradient',
          gradientType: 'linear',
          rotation: 135,
          colors: [
            { color: C.primary, position: 0 },
            { color: C.blue500, position: 1 },
          ],
        },
      },
      [part('initials', T('MQ', { fontSize: 13, fontWeight: '700', fill: C.white }))],
    ),
  ),
  comp(
    'Kbd',
    Row({ name: 'Kbd', height: 22, padding: [0, 7], cornerRadius: 7, fill: soft(0.09) }, [
      part('label', T('⌘K', { fontSize: 11, fontWeight: '600', fill: C.mutedForeground })),
    ]),
  ),
  /* a small status pill: the tone names what the value means */
  ...[
    ['Up', C.successSurface, C.successText],
    ['Down', C.errorSurface, C.errorText],
    ['Warn', C.warningSurface, C.warningText],
    ['Flat', soft(0.08), C.mutedForeground],
  ].map(([v, bg, ink]) =>
    comp(
      `Pill/${v}`,
      Row({ name: 'Pill', height: 24, padding: [0, 9], gap: 4, cornerRadius: 12, fill: bg }, [
        part('icon', I('trending-up', { width: 13, height: 13, fill: ink })),
        part('label', T('Pill', { fontSize: 12, fontWeight: '600', fill: ink })),
      ]),
    ),
  ),
  /* segmented control: a glass track holding segments */
  comp(
    'Segment/On',
    Row(
      {
        name: 'Segment',
        height: 32,
        padding: [0, 14],
        cornerRadius: 16,
        fill: C.primary,
        effect: GLOW,
        justifyContent: 'center',
      },
      [part('label', T('7d', { fontSize: 13, fontWeight: '600', fill: C.primaryForeground }))],
    ),
  ),
  comp(
    'Segment/Off',
    Row(
      { name: 'Segment', height: 32, padding: [0, 14], cornerRadius: 16, justifyContent: 'center' },
      [part('label', T('30d', { fontSize: 13, fontWeight: '600', fill: C.mutedForeground }))],
    ),
  ),
)
add(
  comp(
    'Segmented',
    Row({ name: 'Segmented', padding: 3, gap: 0, cornerRadius: 19, fill: soft(0.06) }, [
      part(
        'segments',
        Row({ name: 'Segments', gap: 0, slot: [] }, [
          use('Segment/On', { name: '7d' }),
          use('Segment/Off', { name: '30d' }, { label: { content: '30d' } }),
          use('Segment/Off', { name: '90d' }, { label: { content: '90d' } }),
        ]),
      ),
    ]),
  ),
  ...[
    ['On', C.primary, 21, C.primaryForeground],
    ['Off', soft(0.16), 3, C.foreground],
  ].map(([v, track, left, knob]) =>
    comp(
      `Switch/${v}`,
      Row(
        {
          name: 'Switch',
          width: 42,
          height: 24,
          padding: [0, 3],
          cornerRadius: 12,
          fill: track,
          justifyContent: v === 'On' ? 'end' : 'start',
        },
        [F({ name: 'Knob', width: 18, height: 18, cornerRadius: 9, fill: knob })],
      ),
    ),
  ),
  ...[
    ['On', { fill: C.primary }, C.primaryForeground, 1],
    ['Off', { stroke: soft(0.3), strokeWidth: 1.5 }, C.primaryForeground, 0],
  ].map(([v, surface, ink, opacity]) =>
    comp(
      `Checkbox/${v}`,
      Row(
        {
          name: 'Checkbox',
          width: 26,
          height: 26,
          cornerRadius: 8,
          justifyContent: 'center',
          ...surface,
        },
        [I('check', { width: 14, height: 14, fill: ink, opacity })],
      ),
    ),
  ),
)
/* the mark is apps/admin/public/logo.svg; it keeps the brand gradient in every theme */
const LOGO = readFileSync(join(ROOT, 'apps/admin/public/logo.svg'), 'utf8')
const LOGO_BOX = LOGO.match(/viewBox="([^"]+)"/)[1]
  .split(/\s+/)
  .map(Number)
const LOGO_D = [...LOGO.matchAll(/<path[^>]* d="([^"]+)"/g)].map((m) => m[1]).join(' ')
add(
  comp(
    'Logo/Mark',
    F({ name: 'Mark', width: 30, height: 30, layout: 'vertical' }, [
      {
        type: 'path',
        id: id(),
        name: 'Mark Path',
        width: 30,
        height: 30,
        geometry: LOGO_D,
        viewBox: LOGO_BOX,
        fill: {
          type: 'gradient',
          gradientType: 'linear',
          rotation: 270,
          colors: [
            { color: C.gradientBrandFrom, position: 0 },
            { color: C.gradientBrandTo, position: 1 },
          ],
        },
      },
    ]),
  ),
)
add(
  comp(
    'Logo/Lockup',
    Row({ name: 'Lockup', gap: 10 }, [
      use('Logo/Mark', { name: 'Mark' }),
      Col({ name: 'Wordmark', gap: 1 }, [
        T('Bitrate', {
          fontFamily: 'font-heading',
          fontSize: 15,
          fontWeight: '700',
          letterSpacing: -0.2,
        }),
        part('sub', T('Operators', { fontSize: 11, fill: C.mutedForeground })),
      ]),
    ]),
  ),
  comp(
    'Status Bar',
    Row(
      {
        name: 'Status Bar',
        width: 390,
        height: 47,
        padding: [4, 30, 0, 36],
        justifyContent: 'space_between',
      },
      [
        T('9:41', { fontSize: 15, fontWeight: '600' }),
        Row({ gap: 6 }, [
          I('signal', { width: 17, height: 17, fill: C.foreground }),
          I('wifi', { width: 17, height: 17, fill: C.foreground }),
          I('battery-full', { width: 22, height: 17, fill: C.foreground }),
        ]),
      ],
    ),
  ),
)
const button = (variant, label, icon) =>
  use(
    `Button/${variant}`,
    { name: `Button / ${label}` },
    { label: { content: label }, icon: icon ? { icon } : { enabled: false } },
  )
const iconBtn = (icon, v = 'Glass') =>
  use(`Button/Icon ${v}`, { name: `Icon / ${icon}` }, { icon: { icon } })
const sk = (w, h = 12, o = {}) => use('Skeleton', { width: w, height: h, ...o })
const pill = (v, label, icon) =>
  use(
    `Pill/${v}`,
    { name: `Pill / ${label}` },
    { label: { content: label }, icon: icon ? { icon } : { enabled: false } },
  )

/* ---------- navigation: the floating glass sidebar and its rail ---------- */
const navItem = (name, active) =>
  comp(
    name,
    Row(
      {
        name: 'Nav Item',
        width: 'fill_container',
        height: 38,
        padding: [0, 12],
        gap: 12,
        cornerRadius: 12,
        ...(active
          ? { fill: tint(C.primary, 0.2), stroke: tint(C.primary, 0.4), strokeWidth: 1 }
          : {}),
      },
      [
        part(
          'icon',
          I('house', { width: 18, height: 18, fill: active ? C.accent : C.mutedForeground }),
        ),
        part(
          'label',
          T('Item', {
            fontSize: 14,
            fontWeight: active ? '600' : '400',
            fill: active ? C.foreground : C.mutedForeground,
            width: 'fill_container',
            textGrowth: 'fixed-width',
          }),
        ),
        part(
          'count',
          Row(
            {
              name: 'Count',
              height: 20,
              padding: [0, 7],
              cornerRadius: 10,
              justifyContent: 'center',
              fill: soft(0.09),
            },
            [
              part(
                'countLabel',
                T('0', { fontSize: 11, fontWeight: '600', fill: C.mutedForeground }),
              ),
            ],
          ),
        ),
      ],
    ),
  )
const railItem = (name, active) =>
  comp(
    name,
    Row(
      {
        name: 'Rail Item',
        width: 44,
        height: 38,
        cornerRadius: 12,
        justifyContent: 'center',
        ...(active
          ? { fill: tint(C.primary, 0.2), stroke: tint(C.primary, 0.4), strokeWidth: 1 }
          : {}),
      },
      [
        part(
          'icon',
          I('house', { width: 18, height: 18, fill: active ? C.accent : C.mutedForeground }),
        ),
      ],
    ),
  )
add(
  navItem('Admin/Nav Item'),
  navItem('Admin/Nav Item Active', true),
  railItem('Admin/Rail Item'),
  railItem('Admin/Rail Item Active', true),
)
add(
  comp(
    'Admin/Nav Count Hot',
    Row(
      {
        name: 'Count',
        height: 20,
        padding: [0, 7],
        cornerRadius: 10,
        justifyContent: 'center',
        fill: C.primary,
      },
      [part('label', T('16', { fontSize: 11, fontWeight: '600', fill: C.primaryForeground }))],
    ),
  ),
)
const NAV = [
  [null, [['overview', 'layout-dashboard', 'Overview']]],
  [
    'Operations',
    [
      ['moderation', 'flag', 'Moderation', '16', true],
      ['releases', 'disc-3', 'Releases', '7'],
      ['catalog', 'audio-lines', 'Catalog', '4'],
      ['albums', 'disc-album', 'Albums'],
      ['playlists', 'list-music', 'Playlists'],
      ['podcasts', 'podcast', 'Podcasts'],
      ['genres', 'tags', 'Genres'],
    ],
  ],
  [
    'Accounts',
    [
      ['artists', 'mic-vocal', 'Artists'],
      ['users', 'users-round', 'Listeners'],
    ],
  ],
  [
    'System',
    [
      ['audit', 'scroll-text', 'Audit log'],
      ['roles', 'shield-check', 'Roles'],
      ['staff', 'id-card', 'Staff'],
    ],
  ],
  ['Settings', [['notifications', 'bell', 'Notifications']]],
]
const PREFS = [
  ['language', 'languages', 'English'],
  ['theme', 'moon', 'Dark'],
  ['collapse', 'panel-left', 'Collapse'],
]
const navRef = (kind, [key, icon, label, count, hot], prefix = 'nav') => {
  const parts = {
    icon: { icon },
    label: label && reg[kind].parts.label ? { content: label } : undefined,
  }
  if (reg[kind].parts.count)
    parts.count = count
      ? hot
        ? use('Admin/Nav Count Hot', { name: 'Count' }, { label: { content: count } })
        : undefined
      : { enabled: false }
  if (count && !hot) parts.countLabel = { content: count }
  return part(`${prefix}_${key}`, use(kind, { name: `Nav / ${label ?? key}` }, parts))
}
const caption = (group, first) =>
  part(
    `group_${group.toLowerCase()}`,
    Row({ name: 'Group', padding: [first ? 6 : 14, 12, 6, 12] }, [
      part(
        `groupText_${group.toLowerCase()}`,
        T(group.toUpperCase(), {
          fontSize: 10.5,
          fontWeight: '600',
          letterSpacing: 1.3,
          fill: C.mutedForeground,
        }),
      ),
    ]),
  )
const panelSections = () =>
  Col(
    { name: 'Sections', width: 'fill_container', gap: 2, padding: [6, 10] },
    NAV.flatMap(([g, items], gi) => [
      g ? caption(g, !gi) : null,
      ...items.map((it) => navRef('Admin/Nav Item', it)),
    ]).filter(Boolean),
  )
const panelPrefs = (collapse = true) =>
  Col(
    {
      name: 'Preferences',
      width: 'fill_container',
      gap: 2,
      padding: [8, 10, 12, 10],
      stroke: C.border,
      strokeWidth: { top: 1 },
    },
    (collapse ? PREFS : PREFS.slice(0, 2)).map((p) => navRef('Admin/Nav Item', p, 'pref')),
  )
const sidebar = (collapsed) =>
  Col(
    {
      name: 'Sidebar',
      width: collapsed ? 76 : 248,
      height: 'fill_container',
      gap: 0,
      cornerRadius: 28,
      clip: true,
      ...glass(0.58),
    },
    collapsed
      ? [
          Row({ name: 'Brand', width: 'fill_container', height: 64, justifyContent: 'center' }, [
            use('Logo/Mark', { name: 'Mark' }),
          ]),
          Col(
            {
              name: 'Sections',
              width: 'fill_container',
              gap: 2,
              padding: [6, 0],
              alignItems: 'center',
            },
            NAV.flatMap(([, items], gi) => [
              gi ? F({ name: 'Hairline', width: 32, height: 1, fill: C.border }) : null,
              ...items.map((it) => navRef('Admin/Rail Item', it)),
            ]).filter(Boolean),
          ),
          F({ name: 'Spacer', width: 'fill_container', height: 'fill_container' }),
          Col(
            {
              name: 'Preferences',
              width: 'fill_container',
              gap: 2,
              padding: [8, 0, 12, 0],
              alignItems: 'center',
              stroke: C.border,
              strokeWidth: { top: 1 },
            },
            [
              ['language', 'languages'],
              ['theme', 'moon'],
              ['collapse', 'panel-left-open'],
            ].map(([k, icon]) => navRef('Admin/Rail Item', [k, icon], 'pref')),
          ),
        ]
      : [
          Row({ name: 'Brand', width: 'fill_container', height: 64, padding: [0, 18] }, [
            use('Logo/Lockup', { name: 'Lockup' }),
          ]),
          panelSections(),
          F({ name: 'Spacer', width: 'fill_container', height: 'fill_container' }),
          panelPrefs(),
        ],
  )

/* ---------- top bar: the search, centred, and the status island on the right ---------- */
add(
  comp(
    'Admin/Search',
    Row(
      {
        name: 'Search',
        width: 480,
        height: 52,
        padding: [0, 10, 0, 18],
        gap: 10,
        cornerRadius: 26,
        ...glass(0.82),
      },
      [
        I('search', { width: 18, height: 18 }),
        part(
          'placeholder',
          T('Search or jump to…', {
            fontSize: 14,
            fill: C.mutedForeground,
            width: 'fill_container',
            textGrowth: 'fixed-width',
          }),
        ),
        use('Kbd', { name: 'Kbd' }),
      ],
    ),
  ),
  comp(
    'Admin/Bell',
    Row(
      {
        name: 'Bell',
        width: 40,
        height: 40,
        gap: 0,
        cornerRadius: 20,
        justifyContent: 'center',
        alignItems: 'start',
        padding: [11, 0, 0, 0],
      },
      [
        I('bell', { width: 18, height: 18, fill: C.foreground }),
        part(
          'badge',
          F({ name: 'Badge', width: 8, height: 8, cornerRadius: 4, fill: C.magenta500 }),
        ),
      ],
    ),
  ),
)
add(
  comp(
    'Admin/Island',
    Row(
      {
        name: 'Island',
        height: 56,
        padding: [0, 8, 0, 12],
        gap: 6,
        cornerRadius: 28,
        ...glass(0.82),
      },
      [
        Row({ name: 'Crumb', gap: 8, padding: [0, 10, 0, 4] }, [
          F({
            name: 'Dot',
            width: 8,
            height: 8,
            cornerRadius: 4,
            fill: C.success,
            stroke: tint(C.success, 0.25),
            strokeWidth: 4,
            strokeAlignment: 'outer',
          }),
          part('crumb', T('Overview', { fontSize: 14, fontWeight: '600' })),
        ]),
        part(
          'pocket',
          Row({ name: 'Pocket', gap: 10, padding: [0, 12, 0, 4], enabled: false }, [
            part(
              'pocketIconBox',
              Row(
                {
                  name: 'Pocket Icon',
                  width: 26,
                  height: 26,
                  cornerRadius: 13,
                  justifyContent: 'center',
                  fill: tint(C.primary, 0.22),
                },
                [part('pocketIcon', I('refresh-cw', { width: 14, height: 14, fill: C.accent }))],
              ),
            ),
            part('pocketText', T('Updating figures…', { fontSize: 13, fontWeight: '600' })),
            part(
              'pocketBar',
              Row(
                {
                  name: 'Progress',
                  width: 70,
                  height: 4,
                  cornerRadius: 2,
                  gap: 0,
                  fill: soft(0.12),
                },
                [
                  F({
                    name: 'Fill',
                    width: 44,
                    height: 4,
                    cornerRadius: 2,
                    fill: {
                      type: 'gradient',
                      gradientType: 'linear',
                      rotation: 90,
                      colors: [
                        { color: C.primary, position: 0 },
                        { color: C.blue500, position: 1 },
                      ],
                    },
                  }),
                ],
              ),
            ),
          ]),
        ),
        F({ name: 'Separator', width: 1, height: 22, fill: C.border }),
        part('bell', use('Admin/Bell', { name: 'Bell' })),
        part('avatar', use('Avatar', { name: 'Avatar' })),
      ],
    ),
  ),
)
nest('Admin/Island', 'bell', 'Admin/Bell')
const topBar = () =>
  Row({ name: 'Top Bar', width: 'fill_container', height: 56, gap: 16 }, [
    F({ name: 'Left', width: 'fill_container', height: 1 }),
    part('search', use('Admin/Search', { name: 'Search' })),
    Row({ name: 'Right', width: 'fill_container', justifyContent: 'end' }, [
      part('island', use('Admin/Island', { name: 'Island' })),
    ]),
  ])
const desktopShell = (name, collapsed) =>
  comp(
    name,
    Row(
      { name: 'Admin Shell', width: 1440, height: 1100, padding: 16, gap: 16, alignItems: 'start' },
      [
        sidebar(collapsed),
        Col({ name: 'Main', width: 'fill_container', height: 'fill_container', gap: 22 }, [
          topBar(),
          slot('content', { height: 'fill_container', gap: 22 }),
        ]),
      ],
    ),
  )
add(desktopShell('Admin/Shell/Desktop'), desktopShell('Admin/Shell/Desktop Collapsed', true))
for (const s of ['Admin/Shell/Desktop', 'Admin/Shell/Desktop Collapsed']) {
  nest(s, 'island', 'Admin/Island')
  nest(s, 'search', 'Admin/Search')
  const sp = reg[s].parts
  const kind = s.endsWith('Collapsed') ? 'Admin/Rail Item' : 'Admin/Nav Item'
  for (const k of Object.keys(sp).filter((p) => /^(nav|pref)_[a-z]+$/.test(p)))
    for (const [p, pid] of Object.entries(reg[kind].parts)) sp[`${k}.${p}`] = `${sp[k]}/${pid}`
}

/* ---------- page header ---------- */
add(
  comp(
    'Admin/Page Header',
    Row(
      {
        name: 'Page Header',
        width: 'fill_container',
        gap: 16,
        alignItems: 'end',
        padding: [4, 4, 0, 4],
      },
      [
        Col({ name: 'Text', gap: 6, width: 'fill_container' }, [
          part(
            'eyebrow',
            T('OVERVIEW · TUE, OCT 20', {
              fontSize: 12,
              fontWeight: '600',
              letterSpacing: 1.3,
              fill: C.mutedForeground,
            }),
          ),
          Row({ name: 'Title', gap: 12, alignItems: 'end' }, [
            part('title', H('Good morning,', 38, { letterSpacing: -0.8 })),
            part(
              'accent',
              H('Mara', 38, {
                letterSpacing: -0.8,
                fill: {
                  type: 'gradient',
                  gradientType: 'linear',
                  rotation: 90,
                  colors: [
                    { color: C.accent, position: 0 },
                    { color: C.blue500, position: 1 },
                  ],
                },
              }),
            ),
          ]),
          part(
            'subtitle',
            T('What needs attention across Bitrate today.', {
              fill: C.mutedForeground,
              width: 'fill_container',
              textGrowth: 'fixed-width',
            }),
          ),
        ]),
        slot('actions', {
          layout: 'horizontal',
          width: 'fit_content',
          gap: 10,
          alignItems: 'center',
        }),
      ],
    ),
  ),
)

add(
  comp(
    'Admin/Page Header Compact',
    Col({ name: 'Page Header', width: 'fill_container', gap: 6, padding: [4, 2, 0, 2] }, [
      part(
        'eyebrow',
        T('OVERVIEW · TUE, OCT 20', {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 1.3,
          fill: C.mutedForeground,
        }),
      ),
      Row({ name: 'Title', width: 'fill_container', gap: 8, alignItems: 'end' }, [
        part(
          'title',
          H('Good morning,', 26, {
            letterSpacing: -0.6,
          }),
        ),
        part(
          'accent',
          H('Mara', 26, {
            letterSpacing: -0.6,
            fill: {
              type: 'gradient',
              gradientType: 'linear',
              rotation: 90,
              colors: [
                { color: C.accent, position: 0 },
                { color: C.blue500, position: 1 },
              ],
            },
          }),
        ),
      ]),
      part(
        'subtitle',
        T('What needs attention across Bitrate today.', {
          fontSize: 13,
          fill: C.mutedForeground,
          width: 'fill_container',
          textGrowth: 'fixed-width',
        }),
      ),
    ]),
  ),
)
/* ---------- phone: compact glass top bar, content, the island tab bar ---------- */
const tab = (name, on) =>
  comp(
    name,
    Row(
      {
        name: 'Tab',
        width: 58,
        height: 48,
        cornerRadius: 24,
        justifyContent: 'center',
        alignItems: 'start',
        padding: [14, 0, 0, 0],
        ...(on ? { fill: C.primary, effect: GLOW } : {}),
      },
      [
        part(
          'icon',
          I('house', { width: 20, height: 20, fill: on ? C.primaryForeground : C.mutedForeground }),
        ),
        part(
          'badge',
          F({
            name: 'Badge',
            width: 8,
            height: 8,
            cornerRadius: 4,
            fill: C.magenta500,
            enabled: false,
          }),
        ),
      ],
    ),
  )
add(tab('Admin/Tab/On', true), tab('Admin/Tab/Off'))
const TABS = [
  ['overview', 'layout-dashboard'],
  ['search', 'search'],
  ['alerts', 'bell'],
  ['menu', 'menu'],
]
add(
  comp(
    'Admin/Tab Bar',
    Row(
      { name: 'Tab Bar', padding: 6, gap: 2, cornerRadius: 30, ...glass(0.85) },
      TABS.map(([k, icon], i) =>
        part(
          `tab_${k}`,
          use(
            i ? 'Admin/Tab/Off' : 'Admin/Tab/On',
            { name: `Tab / ${k}` },
            { icon: { icon }, ...(k === 'alerts' ? { badge: { enabled: true } } : {}) },
          ),
        ),
      ),
    ),
  ),
)
add(
  comp(
    'Admin/Shell/Mobile',
    Col({ name: 'Admin Shell Mobile', width: 390, height: 844, gap: 0, clip: true }, [
      use('Status Bar', { name: 'Status Bar' }),
      Row({ name: 'Top', width: 'fill_container', padding: [4, 12, 0, 12] }, [
        Row(
          {
            name: 'Top Bar',
            width: 'fill_container',
            height: 56,
            padding: [0, 6, 0, 14],
            gap: 2,
            cornerRadius: 28,
            ...glass(0.82),
          },
          [
            Row({ name: 'Brand', width: 'fill_container' }, [
              use('Logo/Lockup', { name: 'Lockup' }),
            ]),
            part('avatar', use('Avatar', { name: 'Avatar' })),
          ],
        ),
      ]),
      slot('content', { height: 'fill_container', padding: [18, 16, 0, 16], gap: 16, clip: true }),
      Row(
        {
          name: 'Tab Area',
          width: 'fill_container',
          justifyContent: 'center',
          padding: [8, 0, 26, 0],
        },
        [part('tabs', use('Admin/Tab Bar', { name: 'Tab Bar' }))],
      ),
    ]),
  ),
)
nest('Admin/Shell/Mobile', 'tabs', 'Admin/Tab Bar')
add(
  comp(
    'Admin/Mobile Menu',
    Col({ name: 'Mobile Menu', width: 358, gap: 0, cornerRadius: 28, clip: true, ...glass(0.9) }, [
      Row(
        { name: 'Grab', width: 'fill_container', justifyContent: 'center', padding: [10, 0, 4, 0] },
        [F({ name: 'Handle', width: 40, height: 5, cornerRadius: 3, fill: C.border })],
      ),
      panelSections(),
      panelPrefs(false),
    ]),
  ),
)
{
  const sp = reg['Admin/Mobile Menu'].parts
  for (const k of Object.keys(sp).filter((p) => /^(nav|pref)_[a-z]+$/.test(p)))
    for (const [p, pid] of Object.entries(reg['Admin/Nav Item'].parts))
      sp[`${k}.${p}`] = `${sp[k]}/${pid}`
}

/* ---------- bento tiles: glass, an icon, a title, a way in, content ---------- */
const iconBox = (tone, icon = 'layout-grid', size = 36) =>
  part(
    'iconBox',
    Row(
      {
        name: 'Icon Box',
        width: size,
        height: size,
        cornerRadius: size / 3,
        justifyContent: 'center',
        fill: TONES[tone][0],
        ...(tone === 'Primary' ? { effect: GLOW } : {}),
      },
      [part('icon', I(icon, { width: size / 2, height: size / 2, fill: TONES[tone][1] }))],
    ),
  )
const tile = (name, accent) =>
  comp(
    name,
    Col(
      {
        name: 'Tile',
        width: 'fill_container',
        gap: 14,
        padding: 20,
        cornerRadius: 24,
        clip: true,
        ...glass(0.58),
        ...(accent
          ? {
              fill: [tint(C.card, 0.58), fade(C.primary, CLEAR.primary, 200, 0.32)],
              stroke: tint(C.primary, 0.35),
            }
          : {}),
      },
      [
        Row({ name: 'Header', width: 'fill_container', gap: 12 }, [
          iconBox(accent ? 'Primary' : 'Neutral'),
          Col({ name: 'Heading', gap: 2, width: 'fill_container' }, [
            part(
              'title',
              T('Tile', {
                fontSize: 15,
                fontWeight: '600',
                width: 'fill_container',
                textGrowth: 'fixed-width',
              }),
            ),
            part(
              'meta',
              muted('Meta', { fontSize: 12, width: 'fill_container', textGrowth: 'fixed-width' }),
            ),
          ]),
          part(
            'actions',
            Row({ name: 'Actions', gap: 6 }, [
              Row(
                {
                  name: 'Open',
                  width: 34,
                  height: 34,
                  cornerRadius: 17,
                  justifyContent: 'center',
                  fill: soft(0.06),
                },
                [I('arrow-up-right', { width: 16, height: 16 })],
              ),
            ]),
          ),
        ]),
        slot('content', { gap: 10 }),
      ],
    ),
  )
add(tile('Admin/Tile'), tile('Admin/Tile Accent', true))
/* KPI: label and change, a big figure, a sparkline area, a note */
const SPARK =
  'M0 36 L24 34 L48 30 L72 32 L96 25 L120 24 L144 19 L168 21 L192 14 L216 11 L240 8 L264 4'
add(
  comp(
    'Admin/KPI',
    Col(
      {
        name: 'KPI',
        width: 'fill_container',
        gap: 8,
        padding: 18,
        cornerRadius: 24,
        clip: true,
        ...glass(0.58),
      },
      [
        Row({ name: 'Label', width: 'fill_container', gap: 8 }, [
          part('icon', I('users-round', { width: 16, height: 16 })),
          part('label', muted('Label', { width: 'fill_container', textGrowth: 'fixed-width' })),
          part('delta', use('Pill/Up', { name: 'Delta' })),
        ]),
        part('value', H('48,920', 34, { letterSpacing: -1.2 })),
        part('sub', muted('412 new this week', { fontSize: 12 })),
        part('spark', {
          type: 'path',
          id: id(),
          name: 'Sparkline',
          width: 'fill_container',
          height: 36,
          viewBox: [0, 0, 264, 44],
          geometry: `${SPARK} L264 44 L0 44 Z`,
          fill: fade(C.accent, CLEAR.primary, 180, 0.6),
        }),
      ],
    ),
  ),
)
nest('Admin/KPI', 'delta', 'Pill/Up')
/* "Needs action" rows */
const actionRow = (tone, icon) =>
  comp(
    `Admin/Action Row/${tone}`,
    Row(
      {
        name: 'Action Row',
        width: 'fill_container',
        gap: 14,
        padding: [10, 14],
        cornerRadius: 16,
        fill: tint(C.card, 0.55),
        stroke: C.border,
        strokeWidth: 1,
      },
      [
        iconBox(tone, icon, 34),
        Col({ name: 'Text', gap: 2, width: 'fill_container' }, [
          part(
            'title',
            T('Title', {
              fontSize: 14,
              fontWeight: '600',
              width: 'fill_container',
              textGrowth: 'fixed-width',
            }),
          ),
          part(
            'meta',
            muted('Meta', { fontSize: 12, width: 'fill_container', textGrowth: 'fixed-width' }),
          ),
        ]),
        part('count', H('0', 26)),
        I('chevron-right', { width: 18, height: 18 }),
      ],
    ),
  )
add(actionRow('Warning', 'flag'), actionRow('Info', 'disc-3'), actionRow('Error', 'triangle-alert'))
add(
  comp(
    'Admin/Feed Item',
    Row({ name: 'Feed Item', width: 'fill_container', gap: 10, alignItems: 'start' }, [
      Col({ name: 'Dot', padding: [5, 0, 0, 0] }, [
        F({
          name: 'Dot',
          width: 8,
          height: 8,
          cornerRadius: 4,
          fill: C.accent,
          effect: {
            type: 'shadow',
            shadowType: 'outer',
            offset: { x: 0, y: 0 },
            blur: 10,
            color: C.accent,
          },
        }),
      ]),
      Col({ name: 'Text', gap: 1, width: 'fill_container' }, [
        part(
          'text',
          T('Activity', { fontSize: 13, width: 'fill_container', textGrowth: 'fixed-width' }),
        ),
        part('meta', muted('Meta', { fontSize: 12 })),
      ]),
    ]),
  ),
  ...[1, 2, 3, 4, 5].map((k) =>
    comp(
      `Admin/Meter/${k}`,
      Col({ name: 'Meter', width: 'fill_container', gap: 6 }, [
        Row({ name: 'Labels', width: 'fill_container' }, [
          part(
            'label',
            T('Label', { fontSize: 13, width: 'fill_container', textGrowth: 'fixed-width' }),
          ),
          part('value', T('0', { fontSize: 13, fontWeight: '600' })),
        ]),
        Row(
          {
            name: 'Track',
            width: 'fill_container',
            height: 7,
            gap: 0,
            cornerRadius: 4,
            fill: soft(0.08),
          },
          [
            part(
              'bar',
              F({ name: 'Bar', width: 120, height: 7, cornerRadius: 4, fill: C[`chart${k}`] }),
            ),
          ],
        ),
      ]),
    ),
  ),
  comp(
    'Admin/Segment Bar',
    Row(
      { name: 'Segment Bar', width: 'fill_container', height: 12, gap: 4 },
      [
        ['ready', C.success, 160],
        ['processing', C.info, 34],
        ['stuck', C.warning, 8],
        ['failed', C.error, 14],
      ].map(([k, fill, w]) =>
        part(k, F({ name: `Segment / ${k}`, width: w, height: 12, cornerRadius: 6, fill })),
      ),
    ),
  ),
  ...[
    ['Success', C.success],
    ['Info', C.info],
    ['Warning', C.warning],
    ['Error', C.error],
    ['Primary', C.primary],
    ['Blue', C.blue500],
    ['Magenta', C.magenta500],
    ['Muted', C.mutedForeground],
  ].map(([tone, fill]) =>
    comp(
      `Admin/Legend/${tone}`,
      Row({ name: 'Legend', width: 'fill_container', gap: 10 }, [
        F({ name: 'Dot', width: 8, height: 8, cornerRadius: 4, fill }),
        part('label', muted('Label', { width: 'fill_container', textGrowth: 'fixed-width' })),
        part('value', T('0', { fontSize: 13, fontWeight: '600' })),
      ]),
    ),
  ),
  comp(
    'Admin/Key Value',
    Row(
      {
        name: 'Key Value',
        width: 'fill_container',
        height: 36,
        justifyContent: 'space_between',
        stroke: C.border,
        strokeWidth: { bottom: 1 },
      },
      [part('key', muted('Key')), part('value', T('0', { fontSize: 13, fontWeight: '600' }))],
    ),
  ),
  ...[
    ['Base', { fill: soft(0.1) }],
    [
      'Highlight',
      {
        fill: {
          type: 'gradient',
          gradientType: 'linear',
          rotation: 180,
          colors: [
            { color: C.accent, position: 0 },
            { color: C.primary, position: 1 },
          ],
        },
        effect: GLOW,
      },
    ],
  ].map(([v, surface]) =>
    comp(
      `Admin/Bar/${v}`,
      Col({ name: 'Bar', width: 'fill_container', gap: 8, alignItems: 'center' }, [
        part(
          'value',
          T('1.02M', { fontSize: 11, fontWeight: '600', ...(v === 'Base' ? { opacity: 0 } : {}) }),
        ),
        part(
          'bar',
          F({
            name: 'Column',
            width: 'fill_container',
            height: 120,
            cornerRadius: [10, 10, 6, 6],
            ...surface,
          }),
        ),
        part('label', muted('Mon', { fontSize: 11 })),
      ]),
    ),
  ),
)
/* tile states: what one tile shows when its data is missing, failed or not in the operator's role */
const tileMessage = (kind, tone, icon, title, desc, action) =>
  comp(
    `Admin/Tile Message/${kind}`,
    Col(
      {
        name: 'Message',
        width: 'fill_container',
        gap: 8,
        padding: [16, 8],
        alignItems: 'center',
        justifyContent: 'center',
      },
      [
        Row(
          {
            name: 'Icon',
            width: 48,
            height: 48,
            cornerRadius: 24,
            justifyContent: 'center',
            fill: TONES[tone][0],
          },
          [part('icon', I(icon, { width: 22, height: 22, fill: TONES[tone][1] }))],
        ),
        part('title', T(title, { fontWeight: '600', textAlign: 'center' })),
        part(
          'desc',
          muted(desc, {
            fontSize: 12,
            textAlign: 'center',
            width: 'fill_container',
            textGrowth: 'fixed-width',
          }),
        ),
        action ? part('action', button('Glass', action, 'refresh-cw')) : null,
      ].filter(Boolean),
    ),
  )
add(
  tileMessage(
    'Error',
    'Error',
    'triangle-alert',
    'Couldn’t load this tile',
    'The rest of the overview is up to date.',
    'Retry',
  ),
  tileMessage(
    'Empty',
    'Success',
    'circle-check',
    'No data yet',
    'Figures appear as listeners and uploads arrive.',
  ),
  tileMessage('Locked', 'Neutral', 'lock', 'Not in your role', 'Ask a super admin for access.'),
)
nest('Admin/Tile Message/Error', 'action', 'Button/Glass')
add(
  comp(
    'Admin/Tile Message/Inline Error',
    Row({ name: 'Message', width: 'fill_container', gap: 14, padding: [8, 4] }, [
      Row(
        {
          name: 'Icon',
          width: 48,
          height: 48,
          cornerRadius: 24,
          justifyContent: 'center',
          fill: TONES.Error[0],
        },
        [I('triangle-alert', { width: 22, height: 22, fill: TONES.Error[1] })],
      ),
      Col({ name: 'Text', gap: 2, width: 'fill_container' }, [
        part('title', T('Couldn’t load this tile', { fontWeight: '600' })),
        part(
          'desc',
          muted('The rest of the overview is up to date.', {
            fontSize: 12,
            width: 'fill_container',
            textGrowth: 'fixed-width',
          }),
        ),
      ]),
      part('action', button('Glass', 'Retry', 'refresh-cw')),
    ]),
  ),
  comp(
    'Admin/Updating',
    Row(
      {
        name: 'Updating',
        height: 30,
        padding: [0, 12],
        gap: 8,
        cornerRadius: 15,
        fill: soft(0.08),
      },
      [
        use('Spinner', { name: 'Spinner' }),
        part('label', T('Updating…', { fontSize: 12, fontWeight: '600', fill: C.mutedForeground })),
      ],
    ),
  ),
  comp(
    'Admin/Banner',
    Row(
      {
        name: 'Banner',
        width: 'fill_container',
        gap: 14,
        padding: [14, 18],
        cornerRadius: 20,
        ...glass(0.58),
        stroke: tint(C.warning, 0.5),
      },
      [
        Row(
          {
            name: 'Icon',
            width: 40,
            height: 40,
            cornerRadius: 12,
            justifyContent: 'center',
            fill: TONES.Warning[0],
          },
          [part('icon', I('wifi-off', { width: 20, height: 20, fill: TONES.Warning[1] }))],
        ),
        Col({ name: 'Text', gap: 2, width: 'fill_container' }, [
          part(
            'title',
            T('You’re offline', {
              fontWeight: '600',
              width: 'fill_container',
              textGrowth: 'fixed-width',
            }),
          ),
          part(
            'desc',
            muted('Showing figures from 09:42. Actions are paused until you reconnect.', {
              fontSize: 12,
              width: 'fill_container',
              textGrowth: 'fixed-width',
            }),
          ),
        ]),
        part('action', button('Glass', 'Try again', 'refresh-cw')),
      ],
    ),
  ),
)
nest('Admin/Tile Message/Inline Error', 'action', 'Button/Glass')
nest('Admin/Banner', 'action', 'Button/Glass')
/* loaders: a skeleton per element, shaped like what it stands in for */
const loaderCard = (name, body, o = {}) =>
  comp(
    name,
    Col(
      {
        name: 'Loader',
        width: 'fill_container',
        gap: 14,
        padding: 20,
        cornerRadius: 24,
        clip: true,
        ...glass(0.58),
        ...o,
      },
      body,
    ),
  )
const loaderHead = () =>
  Row({ name: 'Header', width: 'fill_container', gap: 12 }, [
    sk(36, 36, { cornerRadius: 12 }),
    Col({ gap: 6, width: 'fill_container' }, [sk(130, 12), sk(86, 10)]),
  ])
add(
  loaderCard('Admin/Loader/KPI', [
    Row({ width: 'fill_container', gap: 8 }, [
      sk(16, 16, { cornerRadius: 5 }),
      sk(80, 12),
      F({ width: 'fill_container', height: 1 }),
      sk(58, 22, { cornerRadius: 11 }),
    ]),
    sk(150, 36, { cornerRadius: 10 }),
    sk(110, 10),
    sk('fill_container', 40, { cornerRadius: 10 }),
  ]),
  loaderCard('Admin/Loader/Actions', [
    loaderHead(),
    ...[0, 1, 2].map(() =>
      Row(
        {
          name: 'Row',
          width: 'fill_container',
          gap: 14,
          padding: [10, 14],
          cornerRadius: 16,
          stroke: C.border,
          strokeWidth: 1,
        },
        [
          sk(34, 34, { cornerRadius: 11 }),
          Col({ gap: 6, width: 'fill_container' }, [sk(170, 12), sk(110, 10)]),
          sk(28, 24, { cornerRadius: 8 }),
        ],
      ),
    ),
    sk(90, 10),
    sk('fill_container', 12),
    sk(240, 12),
  ]),
  loaderCard(
    'Admin/Loader/Chart',
    [
      loaderHead(),
      Row(
        {
          name: 'Bars',
          width: 'fill_container',
          height: 'fill_container',
          gap: 10,
          alignItems: 'end',
        },
        [34, 30, 38, 42, 50, 60, 54].map((h) =>
          Col({ width: 'fill_container', gap: 8, alignItems: 'center' }, [
            sk('fill_container', h, { cornerRadius: 10 }),
            sk(24, 10),
          ]),
        ),
      ),
    ],
    { height: 300 },
  ),
  loaderCard('Admin/Loader/List', [
    loaderHead(),
    ...[0, 1, 2].map(() =>
      Row({ width: 'fill_container', gap: 10, alignItems: 'start' }, [
        sk(8, 8, { cornerRadius: 4 }),
        Col({ gap: 6, width: 'fill_container' }, [sk('fill_container', 12), sk(70, 10)]),
      ]),
    ),
  ]),
  loaderCard('Admin/Loader/Meters', [
    loaderHead(),
    ...[200, 120, 90, 50, 30].map((w) =>
      Col({ gap: 6, width: 'fill_container' }, [
        Row({ width: 'fill_container', justifyContent: 'space_between' }, [sk(70, 10), sk(16, 10)]),
        sk(w, 7, { cornerRadius: 4 }),
      ]),
    ),
  ]),
  loaderCard('Admin/Loader/Pipeline', [
    loaderHead(),
    sk('fill_container', 12, { cornerRadius: 6 }),
    ...[0, 1, 2, 3].map(() =>
      Row({ width: 'fill_container', gap: 10 }, [
        sk(8, 8, { cornerRadius: 4 }),
        sk(90, 10),
        F({ width: 'fill_container', height: 1 }),
        sk(30, 10),
      ]),
    ),
  ]),
  loaderCard('Admin/Loader/Form', [
    loaderHead(),
    ...[0, 1, 2, 3].map(() =>
      Row({ width: 'fill_container', gap: 12 }, [
        sk(36, 36, { cornerRadius: 11 }),
        Col({ gap: 6, width: 'fill_container' }, [sk(120, 12), sk(180, 10)]),
        sk(42, 24, { cornerRadius: 12 }),
      ]),
    ),
  ]),
)

/* ---------- analysis: a tile grows into this panel ---------- */
add(
  ...[
    ['On', true],
    ['Off', false],
  ].map(([v, on]) =>
    comp(
      `Admin/Compare/${v}`,
      Row(
        {
          name: 'Compare',
          height: 36,
          padding: [0, 12],
          gap: 8,
          cornerRadius: 18,
          fill: soft(0.06),
        },
        [
          Row(
            {
              name: 'Track',
              width: 28,
              height: 16,
              padding: [0, 2],
              cornerRadius: 8,
              fill: on ? C.primary : soft(0.18),
              justifyContent: on ? 'end' : 'start',
            },
            [
              F({
                name: 'Knob',
                width: 12,
                height: 12,
                cornerRadius: 6,
                fill: on ? C.primaryForeground : C.foreground,
              }),
            ],
          ),
          T('Compare', { fontSize: 13, fontWeight: '600' }),
        ],
      ),
    ),
  ),
)
const detailHead = (mobile) => {
  const titleRow = Row(
    { name: 'Title', width: mobile ? 'fill_container' : 'fill_container', gap: 12 },
    [
      iconBox('Primary', 'audio-waveform', 44),
      Col({ name: 'Text', gap: 2, width: 'fill_container' }, [
        part(
          'title',
          H('Listens per day', mobile ? 17 : 20, {
            letterSpacing: -0.3,
            width: 'fill_container',
            textGrowth: 'fixed-width',
          }),
        ),
        part(
          'sub',
          muted('1.8M listens', {
            fontSize: 12,
            width: 'fill_container',
            textGrowth: 'fixed-width',
          }),
        ),
      ]),
      ...(mobile
        ? [
            part('prev', iconBtn('chevron-left', 'Ghost')),
            part('next', iconBtn('chevron-right', 'Ghost')),
            part('close', iconBtn('x', 'Ghost')),
          ]
        : []),
    ],
  )
  const controls = [
    part('range', use('Segmented', { name: 'Range' })),
    part('compare', use('Admin/Compare/On', { name: 'Compare' })),
    ...(mobile ? [] : [part('export', button('Glass', 'Export', 'download'))]),
    ...(mobile
      ? []
      : [
          Row({ name: 'Step', gap: 2 }, [
            part('prev', iconBtn('chevron-left', 'Ghost')),
            part('next', iconBtn('chevron-right', 'Ghost')),
          ]),
          part('close', iconBtn('x', 'Ghost')),
        ]),
  ]
  return mobile
    ? Col(
        {
          name: 'Header',
          width: 'fill_container',
          gap: 12,
          padding: [6, 16, 14, 16],
          stroke: C.border,
          strokeWidth: { bottom: 1 },
        },
        [
          Row({ name: 'Grab', width: 'fill_container', justifyContent: 'center' }, [
            F({ name: 'Handle', width: 40, height: 5, cornerRadius: 3, fill: C.border }),
          ]),
          titleRow,
          Row({ name: 'Controls', width: 'fill_container', gap: 8 }, controls),
        ],
      )
    : Row(
        {
          name: 'Header',
          width: 'fill_container',
          gap: 10,
          padding: [16, 18],
          stroke: C.border,
          strokeWidth: { bottom: 1 },
        },
        [titleRow, ...controls],
      )
}
add(
  comp(
    'Admin/Analysis/Panel',
    Col(
      {
        name: 'Analysis',
        width: 1240,
        height: 880,
        gap: 0,
        cornerRadius: 28,
        clip: true,
        ...glass(0.88),
      },
      [
        detailHead(false),
        slot('body', { height: 'fill_container', padding: 18, gap: 14, clip: true }),
      ],
    ),
  ),
  comp(
    'Admin/Analysis/Sheet',
    Col(
      {
        name: 'Analysis Sheet',
        width: 390,
        height: 780,
        gap: 0,
        cornerRadius: [28, 28, 0, 0],
        clip: true,
        ...glass(0.92),
      },
      [
        detailHead(true),
        slot('body', { height: 'fill_container', padding: 14, gap: 10, clip: true }),
      ],
    ),
  ),
)
for (const p of ['Admin/Analysis/Panel', 'Admin/Analysis/Sheet']) {
  nest(p, 'range', 'Segmented')
  nest(p, 'compare', 'Admin/Compare/On')
}
const card = (alpha = 0.55) => ({ fill: tint(C.card, alpha), stroke: C.border, strokeWidth: 1 })
add(
  ...[
    ['Good', C.successText, '▲ 18.9%'],
    ['Bad', C.errorText, '▲ 4.2%'],
    ['Plain', C.mutedForeground, ''],
  ].map(([v, ink, d]) =>
    comp(
      `Admin/Stat/${v}`,
      Col(
        { name: 'Stat', width: 'fill_container', gap: 6, padding: 16, cornerRadius: 20, ...card() },
        [
          part('label', muted('Total listens', { fontSize: 12 })),
          part(
            'value',
            H('1.8M', 24, {
              letterSpacing: -0.5,
              width: 'fill_container',
              textGrowth: 'fixed-width',
            }),
          ),
          ...(v === 'Plain'
            ? []
            : [
                Row({ name: 'Delta', gap: 6 }, [
                  part('delta', T(d, { fontSize: 12, fontWeight: '600', fill: ink })),
                  part('vs', muted('vs previous', { fontSize: 12 })),
                ]),
              ]),
        ],
      ),
    ),
  ),
  comp(
    'Admin/Card',
    Col(
      { name: 'Card', width: 'fill_container', gap: 12, padding: 18, cornerRadius: 20, ...card() },
      [part('title', T('Card', { fontWeight: '600' })), slot('content', { gap: 10 })],
    ),
  ),
)
const SERIES = {
  Chart1: C.chart1,
  Chart2: C.chart2,
  Chart3: C.chart3,
  Chart4: C.chart4,
  Chart5: C.chart5,
  Muted: C.mutedForeground,
  Magenta: C.magenta500,
}
add(
  ...Object.entries(SERIES).map(([v, color]) =>
    comp(
      `Admin/Legend Chip/${v}`,
      Row(
        {
          name: 'Legend Chip',
          height: 30,
          padding: [0, 12],
          gap: 8,
          cornerRadius: 15,
          fill: soft(0.06),
        },
        [
          F({ name: 'Swatch', width: 10, height: 10, cornerRadius: 3, fill: color }),
          part('label', T('Series', { fontSize: 12, fontWeight: '600' })),
        ],
      ),
    ),
  ),
)
/* line chart: y labels, then one plot where grid and series stack (negative gap = their height) */
const LW = 660,
  LH = 240
const series = (k, fill, stroke, width) =>
  part(`s${k}`, {
    type: 'path',
    id: id(),
    name: `Series ${k}`,
    width: LW + 20,
    height: LH + 20,
    viewBox: [0, 0, LW + 20, LH + 20],
    geometry: `M0 ${180 - k * 40} L${LW} ${120 - k * 30} L${LW + 20} ${120 - k * 30} L${LW + 20} ${LH + 20} L0 ${LH + 20} Z`,
    ...(fill ? { fill } : {}),
    stroke,
    strokeWidth: width,
    strokeAlignment: 'outer',
    strokeLinejoin: 'round',
  })
add(
  comp(
    'Admin/Chart/Line',
    Row({ name: 'Line Chart', gap: 10, alignItems: 'start' }, [
      Col(
        {
          name: 'Y',
          width: 46,
          height: LH,
          justifyContent: 'space_between',
          alignItems: 'end',
          padding: [0, 0, 0, 0],
        },
        [4, 3, 2, 1, 0].map((k) =>
          part(`y${k}`, T(String(k * 80), { fontSize: 11, fill: C.mutedForeground })),
        ),
      ),
      Col({ name: 'Plot Column', gap: 8 }, [
        part(
          'plot',
          Col({ name: 'Plot', width: LW, height: LH, gap: -(LH + 20), clip: true }, [
            Col(
              {
                name: 'Grid',
                width: LW + 20,
                height: LH + 20,
                justifyContent: 'space_between',
                padding: [0, 0, 20, 0],
              },
              [0, 1, 2, 3, 4].map(() =>
                F({ name: 'Line', width: 'fill_container', height: 1, fill: C.border }),
              ),
            ),
            series(0, fade(C.primary, CLEAR.primary, 180, 0.45), C.accent, 2.5),
            series(1, null, C.chart2, 2),
            series(2, null, C.mutedForeground, 1.5),
          ]),
        ),
        part(
          'xaxis',
          Row(
            { name: 'X', width: 'fill_container', justifyContent: 'space_between' },
            [0, 1, 2, 3, 4, 5, 6].map((k) =>
              part(`x${k}`, T(`Oct ${14 + k}`, { fontSize: 11, fill: C.mutedForeground })),
            ),
          ),
        ),
      ]),
    ]),
  ),
  comp(
    'Admin/Chart/Column',
    Col(
      {
        name: 'Column',
        width: 'fill_container',
        height: 220,
        gap: 8,
        justifyContent: 'end',
        alignItems: 'center',
      },
      [
        part(
          'stack',
          Col(
            {
              name: 'Stack',
              width: 'fill_container',
              gap: 0,
              cornerRadius: [6, 6, 3, 3],
              clip: true,
            },
            [5, 4, 3, 2, 1].map((k) =>
              part(
                `s${k}`,
                F({
                  name: `Segment ${k}`,
                  width: 'fill_container',
                  height: k === 1 ? 80 : 0,
                  fill: C[`chart${k}`],
                }),
              ),
            ),
          ),
        ),
        part('label', T('Oct 14', { fontSize: 11, fill: C.mutedForeground })),
      ],
    ),
  ),
  comp(
    'Admin/Chart/Donut',
    Row(
      {
        name: 'Donut',
        width: 170,
        height: 170,
        cornerRadius: 85,
        justifyContent: 'center',
        ...{
          fill: {
            type: 'gradient',
            gradientType: 'angular',
            colors: [
              { color: C.chart1, position: 0 },
              { color: C.chart1, position: 0.46 },
              { color: C.chart2, position: 0.46 },
              { color: C.chart2, position: 0.87 },
              { color: C.magenta500, position: 0.87 },
              { color: C.magenta500, position: 1 },
            ],
          },
        },
      },
      [
        Row(
          {
            name: 'Hole',
            width: 124,
            height: 124,
            cornerRadius: 62,
            justifyContent: 'center',
            fill: C.card,
          },
          [part('total', H('1.8M', 24))],
        ),
      ],
    ),
  ),
  comp(
    'Admin/Chart/Heat Cell',
    F({ name: 'Heat Cell', width: 'fill_container', height: 16, cornerRadius: 4, fill: C.primary }),
  ),
  ...['Head', 'Row'].map((v) =>
    comp(
      `Admin/Table/${v}`,
      Row(
        {
          name: `Table ${v}`,
          width: 'fill_container',
          gap: 12,
          padding: [v === 'Head' ? 8 : 11, 10],
          stroke: C.border,
          strokeWidth: { bottom: 1 },
        },
        [
          part(
            'cells',
            Row({ name: 'Cells', width: 'fill_container', gap: 12, slot: [] }, [
              T(v, {
                fontSize: v === 'Head' ? 12 : 13,
                fill: v === 'Head' ? C.mutedForeground : C.foreground,
              }),
            ]),
          ),
        ],
      ),
    ),
  ),
  comp(
    'Admin/Motion Note',
    Row(
      {
        name: 'Motion Note',
        width: 'fill_container',
        gap: 14,
        padding: 16,
        cornerRadius: 18,
        alignItems: 'start',
        ...card(0.7),
      },
      [
        Row(
          {
            name: 'Icon',
            width: 34,
            height: 34,
            cornerRadius: 11,
            justifyContent: 'center',
            fill: tint(C.primary, 0.22),
          },
          [I('sparkles', { width: 16, height: 16, fill: C.accent })],
        ),
        Col({ name: 'Text', gap: 4, width: 'fill_container' }, [
          part('title', T('Interaction', { fontWeight: '600' })),
          part(
            'body',
            muted('What moves, when and why.', {
              width: 'fill_container',
              textGrowth: 'fixed-width',
            }),
          ),
        ]),
      ],
    ),
  ),
)

/* ---------- notification settings ---------- */
add(
  ...[
    ['On', 'Info'],
    ['Off', 'Neutral'],
  ].map(([v, tone]) =>
    comp(
      `Admin/Channel Row/${v}`,
      Row(
        {
          name: 'Channel',
          width: 'fill_container',
          gap: 12,
          padding: [12, 0],
          stroke: C.border,
          strokeWidth: { bottom: 1 },
        },
        [
          iconBox(tone, 'bell', 36),
          Col({ name: 'Text', gap: 2, width: 'fill_container' }, [
            part('name', T('In-app', { fontWeight: '600' })),
            part(
              'detail',
              muted('Bell and island in the admin console', {
                fontSize: 12,
                width: 'fill_container',
                textGrowth: 'fixed-width',
              }),
            ),
          ]),
          part(
            'status',
            use(
              v === 'On' ? 'Pill/Up' : 'Pill/Flat',
              { name: 'Status' },
              { icon: { enabled: false }, label: { content: v === 'On' ? 'Connected' : 'Off' } },
            ),
          ),
          part('toggle', use(`Switch/${v}`, { name: 'Toggle' })),
        ],
      ),
    ),
  ),
)
const CW = 104
add(
  comp(
    'Admin/Matrix/Head',
    Row({ name: 'Matrix Head', width: 'fill_container', gap: 0, padding: [8, 8] }, [
      T('Event', {
        fontSize: 12,
        fontWeight: '600',
        fill: C.mutedForeground,
        width: 'fill_container',
        textGrowth: 'fixed-width',
      }),
      Row({ name: 'Priority', width: CW, justifyContent: 'center' }, [
        T('Priority', { fontSize: 12, fontWeight: '600', fill: C.mutedForeground }),
      ]),
      ...[
        ['bell', 'In-app'],
        ['mail', 'Email'],
        ['smartphone', 'Push'],
        ['hash', 'Slack'],
      ].map(([icon, l], k) =>
        part(
          `h${k}`,
          Row({ name: `Head / ${l}`, width: CW, gap: 6, justifyContent: 'center' }, [
            I(icon, { width: 15, height: 15 }),
            part(`h${k}Label`, T(l, { fontSize: 12, fontWeight: '600', fill: C.mutedForeground })),
          ]),
        ),
      ),
    ]),
  ),
  comp(
    'Admin/Matrix/Group',
    Row({ name: 'Matrix Group', width: 'fill_container', padding: [14, 8, 6, 8] }, [
      part(
        'label',
        T('MODERATION', {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 1.2,
          fill: C.mutedForeground,
        }),
      ),
    ]),
  ),
  ...[
    ['', false],
    [' Selected', true],
  ].map(([v, sel]) =>
    comp(
      `Admin/Matrix/Row${v}`,
      Row(
        {
          name: 'Matrix Row',
          width: 'fill_container',
          gap: 0,
          padding: [10, 8],
          stroke: C.border,
          strokeWidth: { top: 1 },
          ...(sel ? { fill: tint(C.primary, 0.1) } : {}),
        },
        [
          ...(sel
            ? [F({ name: 'Marker', width: 3, height: 34, cornerRadius: 2, fill: C.primary })]
            : []),
          Col({ name: 'Event', gap: 2, width: 'fill_container', padding: [0, 0, 0, sel ? 9 : 0] }, [
            part('title', T('New report filed', { fontSize: 13, fontWeight: '600' })),
            part('desc', muted('Every report entering the queue', { fontSize: 12 })),
          ]),
          Row({ name: 'Priority', width: CW, justifyContent: 'center' }, [
            part(
              'prio',
              use(
                'Pill/Flat',
                { name: 'Priority' },
                { icon: { enabled: false }, label: { content: 'Normal' } },
              ),
            ),
          ]),
          ...[0, 1, 2, 3].map((k) =>
            Row({ name: `Cell ${k}`, width: CW, justifyContent: 'center' }, [
              part(`c${k}`, use(k ? 'Checkbox/Off' : 'Checkbox/On', { name: `Channel ${k}` })),
            ]),
          ),
        ],
      ),
    ),
  ),
  ...[
    ['On', true],
    ['Off', false],
  ].map(([v, on]) =>
    comp(
      `Admin/Channel Chip/${v}`,
      Row(
        {
          name: 'Channel Chip',
          height: 30,
          padding: [0, 10],
          gap: 6,
          cornerRadius: 15,
          ...(on
            ? { fill: tint(C.primary, 0.22), stroke: tint(C.primary, 0.5), strokeWidth: 1 }
            : { stroke: C.border, strokeWidth: 1 }),
        },
        [
          part(
            'icon',
            I('bell', { width: 14, height: 14, fill: on ? C.foreground : C.mutedForeground }),
          ),
          part(
            'label',
            T('In-app', {
              fontSize: 12,
              fontWeight: '600',
              fill: on ? C.foreground : C.mutedForeground,
            }),
          ),
        ],
      ),
    ),
  ),
)
add(
  ...[
    ['', false],
    [' Selected', true],
  ].map(([v, sel]) =>
    comp(
      `Admin/Event Card${v}`,
      Col(
        {
          name: 'Event Card',
          width: 'fill_container',
          gap: 10,
          padding: 12,
          cornerRadius: 16,
          fill: tint(C.card, 0.5),
          stroke: sel ? tint(C.primary, 0.6) : C.border,
          strokeWidth: 1,
        },
        [
          Row({ name: 'Head', width: 'fill_container', gap: 8 }, [
            part(
              'title',
              T('New report filed', {
                fontSize: 13,
                fontWeight: '600',
                width: 'fill_container',
                textGrowth: 'fixed-width',
              }),
            ),
            part(
              'prio',
              use(
                'Pill/Flat',
                { name: 'Priority' },
                { icon: { enabled: false }, label: { content: 'Normal' } },
              ),
            ),
          ]),
          Row({ name: 'Chips', width: 'fill_container', gap: 6 }, [
            part('ch0', use('Admin/Channel Chip/On', { name: 'In-app' })),
            part(
              'ch1',
              use(
                'Admin/Channel Chip/Off',
                { name: 'Email' },
                { icon: { icon: 'mail' }, label: { content: 'Email' } },
              ),
            ),
            part(
              'ch2',
              use(
                'Admin/Channel Chip/Off',
                { name: 'Push' },
                { icon: { icon: 'smartphone' }, label: { content: 'Push' } },
              ),
            ),
          ]),
          part(
            'ch3',
            use(
              'Admin/Channel Chip/Off',
              { name: 'Slack' },
              { icon: { icon: 'hash' }, label: { content: 'Slack' } },
            ),
          ),
        ],
      ),
    ),
  ),
  comp(
    'Admin/Preview/Push',
    Row(
      {
        name: 'Push',
        width: 'fill_container',
        gap: 12,
        padding: 14,
        cornerRadius: 18,
        ...card(0.72),
        effect: SHADOW,
      },
      [
        Row(
          {
            name: 'App',
            width: 40,
            height: 40,
            cornerRadius: 11,
            justifyContent: 'center',
            fill: soft(0.08),
          },
          [use('Logo/Mark', { name: 'Mark', width: 24, height: 24 })],
        ),
        Col({ name: 'Text', gap: 2, width: 'fill_container' }, [
          Row({ name: 'Top', width: 'fill_container' }, [
            T('Bitrate Admin', {
              fontSize: 12,
              fontWeight: '600',
              width: 'fill_container',
              textGrowth: 'fixed-width',
            }),
            muted('now', { fontSize: 12 }),
          ]),
          part('title', T('SLA breach', { fontSize: 13, fontWeight: '600' })),
          part(
            'body',
            muted('3 reports have waited over 6 h', {
              width: 'fill_container',
              textGrowth: 'fixed-width',
            }),
          ),
        ]),
      ],
    ),
  ),
  comp(
    'Admin/Preview/Mail',
    Col(
      {
        name: 'Mail',
        width: 'fill_container',
        gap: 6,
        padding: 14,
        cornerRadius: 18,
        stroke: C.border,
        strokeWidth: 1,
      },
      [
        Row({ name: 'From', gap: 10 }, [
          muted('From', { fontSize: 12, width: 60, textGrowth: 'fixed-width' }),
          T('Bitrate Admin <alerts@bitrate.fm>', { fontSize: 13 }),
        ]),
        Row({ name: 'Subject', gap: 10 }, [
          muted('Subject', { fontSize: 12, width: 60, textGrowth: 'fixed-width' }),
          part('subject', T('[Critical] SLA breach', { fontSize: 13, fontWeight: '600' })),
        ]),
        Row({ name: 'Body', gap: 6 }, [
          part('body', muted('3 reports have waited over 6 h.')),
          T('Open in admin →', { fontSize: 13, fontWeight: '600', fill: C.accent }),
        ]),
      ],
    ),
  ),
  comp(
    'Admin/Route',
    Row({ name: 'Route', width: 'fill_container', gap: 6 }, [
      part('label', muted('Delivered to', { fontSize: 12 })),
      part('chips', Row({ name: 'Chips', gap: 6, slot: [] }, [pill('Up', 'In-app')])),
    ]),
  ),
  comp(
    'Admin/Field',
    Row({ name: 'Field', width: 'fill_container', gap: 12, padding: [10, 0] }, [
      Col({ name: 'Text', gap: 2, width: 'fill_container' }, [
        part('label', T('Quiet hours', { fontSize: 13, fontWeight: '600' })),
        part(
          'desc',
          muted('Pause non-critical alerts overnight', {
            fontSize: 12,
            width: 'fill_container',
            textGrowth: 'fixed-width',
          }),
        ),
      ]),
      part(
        'control',
        Row({ name: 'Control', gap: 8, slot: [] }, [use('Switch/On', { name: 'Switch' })]),
      ),
    ]),
  ),
  comp(
    'Admin/Field Stack',
    Col({ name: 'Field Stack', width: 'fill_container', gap: 8, padding: [10, 0] }, [
      part('label', muted('Digest')),
      part(
        'control',
        Row({ name: 'Control', gap: 8, slot: [] }, [use('Segmented', { name: 'Choice' })]),
      ),
    ]),
  ),
  comp(
    'Admin/Time Input',
    Row(
      {
        name: 'Time',
        height: 36,
        padding: [0, 10],
        gap: 8,
        cornerRadius: 10,
        fill: soft(0.06),
        stroke: C.border,
        strokeWidth: 1,
      },
      [
        part('value', T('22:00', { fontSize: 14, fontWeight: '500' })),
        I('clock', { width: 15, height: 15 }),
      ],
    ),
  ),
  comp(
    'Admin/Slider',
    Col({ name: 'Slider', width: 'fill_container', gap: 8, padding: [8, 0] }, [
      Row({ name: 'Head', width: 'fill_container' }, [
        part(
          'label',
          muted('SLA breach after', { width: 'fill_container', textGrowth: 'fixed-width' }),
        ),
        part('value', H('6 h', 18)),
      ]),
      Row({ name: 'Track', width: 'fill_container', height: 18, gap: 0 }, [
        part('fill', F({ name: 'Fill', width: 60, height: 6, cornerRadius: 3, fill: C.primary })),
        F({
          name: 'Knob',
          width: 18,
          height: 18,
          cornerRadius: 9,
          fill: C.primaryForeground,
          stroke: C.primary,
          strokeWidth: 4,
          strokeAlignment: 'inner',
        }),
        F({ name: 'Rest', width: 'fill_container', height: 6, cornerRadius: 3, fill: soft(0.12) }),
      ]),
    ]),
  ),
  ...[
    ['On', true],
    ['Off', false],
  ].map(([v, on]) =>
    comp(
      `Admin/Role Chip/${v}`,
      Row(
        {
          name: 'Role Chip',
          height: 32,
          padding: [0, 13],
          cornerRadius: 16,
          ...(on ? { fill: C.primary } : { stroke: C.border, strokeWidth: 1 }),
        },
        [
          part(
            'label',
            T('Super admin', {
              fontSize: 13,
              fontWeight: '600',
              fill: on ? C.primaryForeground : C.foreground,
            }),
          ),
        ],
      ),
    ),
  ),
  ...[
    ['Saved', C.successSurface, C.successText, 'check', 'Saved · just now'],
    ['Saving', soft(0.07), C.mutedForeground, 'loader', 'Saving…'],
  ].map(([v, bg, ink, icon, l]) =>
    comp(
      `Admin/Save State/${v}`,
      Row(
        { name: 'Save State', height: 38, padding: [0, 14], gap: 6, cornerRadius: 19, fill: bg },
        [
          I(icon, { width: 15, height: 15, fill: ink }),
          part('label', T(l, { fontSize: 13, fontWeight: '600', fill: ink })),
        ],
      ),
    ),
  ),
)

/* ---------- overlays: the bell's list, the command palette ---------- */
add(
  ...['Warning', 'Error', 'Info', 'Success'].map((tone) =>
    comp(
      `Admin/Notice/${tone}`,
      Row(
        {
          name: 'Notice',
          width: 'fill_container',
          gap: 12,
          padding: [10, 8],
          cornerRadius: 14,
          alignItems: 'start',
        },
        [
          iconBox(tone, 'flag', 34),
          Col({ name: 'Text', gap: 1, width: 'fill_container' }, [
            part('title', T('New report filed', { fontSize: 13, fontWeight: '600' })),
            part(
              'body',
              muted('Track · Copyright claim · Glass Horizon', {
                fontSize: 12,
                width: 'fill_container',
                textGrowth: 'fixed-width',
              }),
            ),
            part('time', muted('2 min', { fontSize: 12 })),
          ]),
          part(
            'unread',
            F({ name: 'Unread', width: 8, height: 8, cornerRadius: 4, fill: C.magenta500 }),
          ),
        ],
      ),
    ),
  ),
  comp(
    'Admin/Popover',
    Col({ name: 'Popover', width: 380, gap: 0, cornerRadius: 22, clip: true, ...glass(0.92) }, [
      Row(
        {
          name: 'Head',
          width: 'fill_container',
          padding: [14, 16],
          stroke: C.border,
          strokeWidth: { bottom: 1 },
        },
        [
          part(
            'title',
            T('Notifications', {
              fontWeight: '600',
              width: 'fill_container',
              textGrowth: 'fixed-width',
            }),
          ),
          part('readAll', T('Mark all read', { fontSize: 13, fontWeight: '600', fill: C.accent })),
        ],
      ),
      slot('list', { padding: [6, 8], gap: 0 }),
      Row(
        {
          name: 'Foot',
          width: 'fill_container',
          justifyContent: 'center',
          padding: [12, 16],
          stroke: C.border,
          strokeWidth: { top: 1 },
        },
        [part('settings', button('Glass', 'Notification settings', 'sliders-horizontal'))],
      ),
    ]),
  ),
  comp(
    'Admin/Palette Item',
    Row(
      {
        name: 'Palette Item',
        width: 'fill_container',
        height: 42,
        padding: [0, 12],
        gap: 12,
        cornerRadius: 12,
      },
      [
        part('icon', I('layout-dashboard', { width: 18, height: 18 })),
        part('label', T('Overview', { width: 'fill_container', textGrowth: 'fixed-width' })),
        I('chevron-right', { width: 16, height: 16 }),
      ],
    ),
  ),
  comp(
    'Admin/Palette Item Selected',
    Row(
      {
        name: 'Palette Item',
        width: 'fill_container',
        height: 42,
        padding: [0, 12],
        gap: 12,
        cornerRadius: 12,
        fill: tint(C.primary, 0.2),
      },
      [
        part('icon', I('moon', { width: 18, height: 18, fill: C.foreground })),
        part('label', T('Switch theme', { width: 'fill_container', textGrowth: 'fixed-width' })),
        I('chevron-right', { width: 16, height: 16, fill: C.foreground }),
      ],
    ),
  ),
  comp(
    'Admin/Palette',
    Col({ name: 'Palette', width: 620, gap: 0, cornerRadius: 24, clip: true, ...glass(0.92) }, [
      Row(
        {
          name: 'Input',
          width: 'fill_container',
          height: 60,
          padding: [0, 18],
          gap: 12,
          stroke: C.border,
          strokeWidth: { bottom: 1 },
        },
        [
          I('search', { width: 18, height: 18 }),
          part(
            'query',
            T('the', {
              fontSize: 16,
              fontWeight: '500',
              width: 'fill_container',
              textGrowth: 'fixed-width',
            }),
          ),
          use('Kbd', { name: 'Esc' }, { label: { content: 'Esc' } }),
        ],
      ),
      slot('list', { padding: 8, gap: 2 }),
    ]),
  ),
)
for (const p of ['Admin/Matrix/Row', 'Admin/Matrix/Row Selected']) nest(p, 'prio', 'Pill/Flat')
for (const p of ['Admin/Event Card', 'Admin/Event Card Selected']) {
  nest(p, 'prio', 'Pill/Flat')
  for (const k of [0, 1, 2, 3])
    nest(p, `ch${k}`, k ? 'Admin/Channel Chip/Off' : 'Admin/Channel Chip/On')
}
nest('Admin/Popover', 'settings', 'Button/Glass')
/* the avatar's menu: who is signed in, personal preferences, sign out */
const profileRow = (p, icon, label, value, o = {}) =>
  part(
    p,
    use(
      'Admin/Nav Item',
      { name: label },
      {
        icon: { icon, ...(o.danger ? { fill: C.errorText } : {}) },
        label: { content: label, ...(o.danger ? { fill: C.errorText } : {}) },
        ...(value ? { countLabel: { content: value } } : { count: { enabled: false } }),
      },
    ),
  )
add(
  comp(
    'Admin/Profile Menu',
    Col(
      { name: 'Profile Menu', width: 300, gap: 0, cornerRadius: 22, clip: true, ...glass(0.92) },
      [
        Row(
          {
            name: 'Who',
            width: 'fill_container',
            padding: 16,
            gap: 12,
            stroke: C.border,
            strokeWidth: { bottom: 1 },
          },
          [
            use('Avatar', { name: 'Avatar' }),
            Col({ name: 'Identity', width: 'fill_container', gap: 2 }, [
              part(
                'name',
                T('mara.ops', {
                  fontWeight: '600',
                  width: 'fill_container',
                  textGrowth: 'fixed-width',
                }),
              ),
              part(
                'role',
                muted('Super admin · mara.ops@bitrate.fm', {
                  fontSize: 12,
                  width: 'fill_container',
                  textGrowth: 'fixed-width',
                }),
              ),
            ]),
          ],
        ),
        Col({ name: 'Preferences', width: 'fill_container', gap: 2, padding: 8 }, [
          profileRow('settings', 'sliders-horizontal', 'Notification settings'),
          profileRow('language', 'languages', 'Language', 'English'),
          profileRow('theme', 'moon', 'Theme', 'Dark'),
        ]),
        Col(
          {
            name: 'Session',
            width: 'fill_container',
            padding: 8,
            stroke: C.border,
            strokeWidth: { top: 1 },
          },
          [profileRow('signOut', 'log-out', 'Sign out', null, { danger: true })],
        ),
      ],
    ),
  ),
)
for (const p of ['settings', 'language', 'theme', 'signOut'])
  nest('Admin/Profile Menu', p, 'Admin/Nav Item')

/* ---------- the library page: one flex root, a section per family ---------- */
const cellWidth = (b) =>
  typeof b.width === 'number'
    ? Math.max(160, b.width)
    : /Matrix/.test(b.name)
      ? 1000
      : /Chart\/Line/.test(b.name)
        ? 760
        : /Page Header/.test(b.name)
          ? 900
          : /Row|Bar|Meter|Legend|Key Value|Field|Slider|Channel|Matrix|Notice|Feed|Message|Route|Motion|Card|Stat|Event|Preview|Banner|Table|Loader\/(Actions|Form)/.test(
                b.name,
              )
            ? 460
            : 320
const section = (title, desc, names) => {
  const items = blocks.filter((b) => names.test(b.name))
  const rows = []
  let line = []
  let used = 0
  for (const b of items) {
    const w = cellWidth(b)
    if (used && used + w > 1640) {
      rows.push(line)
      line = []
      used = 0
    }
    line.push(
      Col({ name: `Cell / ${b.name}`, gap: 10, width: w }, [
        T(b.name, { fontSize: 12, fill: C.mutedForeground }),
        b,
      ]),
    )
    used += w + 40
  }
  if (line.length) rows.push(line)
  return Col({ name: title, gap: 24, width: 'fill_container' }, [
    H(title, 28),
    T(desc, { fill: C.mutedForeground, width: 760, textGrowth: 'fixed-width', lineHeight: 1.5 }),
    ...rows.map((r, i) => Row({ name: `${title} Row ${i + 1}`, gap: 40, alignItems: 'start' }, r)),
  ])
}
const used = new Set()
const pick = (re) => {
  const all = blocks.filter((b) => re.test(b.name) && !used.has(b.name))
  for (const b of all) used.add(b.name)
  return new RegExp(
    `^(${all.map((b) => b.name.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')).join('|')})$`,
  )
}
const SECTIONS = [
  [
    'Foundations',
    'Type, buttons, pills, segmented control, switches, checkboxes, skeleton, spinner, avatar, key hint, the logo and the phone status bar.',
    /^(Text|Button|Pill|Segment|Switch|Checkbox|Divider|Skeleton|Spinner|Avatar|Kbd|Logo|Status Bar)/,
  ],
  [
    'Navigation',
    'The floating glass sidebar (expanded and the 64px rail), the centred search, the status island with its live pocket, the phone tab bar and menu.',
    /^Admin\/(Nav|Rail|Search|Bell|Island|Page Header|Tab\/|Tab Bar|Mobile Menu)/,
  ],
  [
    'Bento tiles',
    'Glass tiles on a four-column grid (1×1, 2×1, 2×2), KPI with a sparkline, queue rows, feed, meters, the pipeline bar and legend, bars, and what a tile shows when its data is empty, failed or not in the operator’s role.',
    /^Admin\/(Tile|KPI|Action Row|Feed|Meter|Segment Bar|Legend\/|Key Value|Bar\/|Updating|Banner)/,
  ],
  [
    'Loaders',
    'A skeleton per element, shaped like the content it stands in for.',
    /^Admin\/Loader\//,
  ],
  [
    'Analysis',
    'The panel a tile grows into (a sheet on phones): stat cards, legend chips, the line chart whose series share one plot, stacked columns, the donut, heat cells, tables and interaction notes.',
    /^Admin\/(Analysis|Compare|Stat|Card|Legend Chip|Chart|Table|Motion)/,
  ],
  [
    'Notification settings',
    'Channels, the event × channel matrix (cards on phones), the live preview, delivery fields, thresholds, escalation roles and the save state.',
    /^Admin\/(Channel|Matrix|Event Card|Preview|Route|Field|Time|Slider|Role|Save)/,
  ],
  [
    'Overlays',
    'The bell’s notifications and the command palette.',
    /^Admin\/(Notice|Popover|Profile Menu|Palette)/,
  ],
  [
    'Shell',
    'Desktop shell with the expanded panel and the collapsed rail; the phone shell.',
    /^Admin\/Shell/,
  ],
]
const root = F(
  {
    name: 'Bitrate Admin Design System',
    x: 0,
    y: 0,
    width: 1760,
    layout: 'vertical',
    gap: 72,
    padding: 64,
    fill: [
      C.background,
      {
        type: 'gradient',
        gradientType: 'radial',
        center: { x: 0.15, y: 0.02 },
        size: { width: 1.2, height: 0.25 },
        opacity: 0.45,
        colors: [
          { color: C.primary, position: 0 },
          { color: CLEAR.primary, position: 1 },
        ],
      },
    ],
  },
  [
    H('Bitrate Admin', 44),
    T(
      'The admin console’s own design system (apps/admin), separate from the player’s library and drawn after the admin prototype (pencil/web-admin-design/prototype). Glass surfaces over a soft aurora; colours are the code’s tokens in three themes (Light, Dark, Dim); admin screens import this file as `admin` and use only its components. Source: scripts/pencil-pages/admin-lib.mjs.',
      { fill: C.mutedForeground, width: 860, textGrowth: 'fixed-width', lineHeight: 1.5 },
    ),
    ...SECTIONS.map(([title, desc, re]) => section(title, desc, pick(re))),
  ],
)
const missing = blocks.filter((b) => !used.has(b.name)).map((b) => b.name)
if (missing.length) throw new Error(`not on the library page: ${missing.join(', ')}`)
/* colour variables are written from code by `pnpm design:tokens`; keep them, set the fonts */
const previous = existsSync(libF) ? JSON.parse(readFileSync(libF, 'utf8')) : {}
const variables = Object.fromEntries(
  Object.entries(previous.variables ?? {}).filter(([, v]) => v.type === 'color'),
)
/* the prototype's type: Unbounded for headings and figures, Inter for text */
variables['--font-sans'] = { type: 'string', value: 'Inter' }
variables['--font-heading'] = { type: 'string', value: 'Unbounded' }
mkdirSync(dirname(libF), { recursive: true })
writeFileSync(
  libF,
  JSON.stringify(
    { version: '2.20', themes: { Mode: ['Dark', 'Light', 'Dim'] }, variables, children: [root] },
    null,
    2,
  ),
)
writeFileSync(regF, JSON.stringify(reg, null, 2))
console.log('admin components', Object.keys(reg).length)
