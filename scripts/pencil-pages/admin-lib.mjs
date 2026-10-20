// Builds the admin console's own design system, pencil/web-admin-design/design-system/admin.lib.pen,
// and a registry of its ids and overridable parts (registry-admin.json). It is separate from the player's
// library: its own primitives (type, buttons, chips, skeleton, logo…) and composites (shell, navigation,
// bento tiles, loaders). Colours are the code's tokens (apps/admin uses @bitrate/tailwind): this script
// keeps the file's colour variables and `pnpm design:tokens` writes them from code; fonts are set here.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { C, T, H, P, I, F, Row, Col, Ref, id, setMode } from './kit.mjs'

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
  const desc = {}
  for (const [p, v] of Object.entries(parts)) if (v !== undefined) desc[c.parts[p]] = v
  return Ref(c.id, { name, ...o }, Object.keys(desc).length ? desc : undefined)
}
const LRef = (ref, o = {}, descendants) => Ref(ref, o, descendants)
const slot = (p, o = {}) =>
  part(p, F({ name: 'Slot', layout: 'vertical', gap: 12, width: 'fill_container', slot: [], ...o }))
const muted = (s, o = {}) => T(s, { fontSize: 13, fill: C.mutedForeground, ...o })

const blocks = []
const add = (...n) => blocks.push(...n)

/* ---------- primitives: type, controls, media and feedback of the admin console ---------- */
const txt = (name, o) => comp(name, part('text', T(name.split('/')[1], o)))
add(
  txt('Text/H1', {
    fontFamily: 'font-heading',
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.6,
  }),
  txt('Text/H2', { fontFamily: 'font-heading', fontSize: 24, fontWeight: '600' }),
  txt('Text/H3', { fontFamily: 'font-heading', fontSize: 18, fontWeight: '600' }),
  txt('Text/Body', { fontSize: 14 }),
  txt('Text/Body Strong', { fontSize: 14, fontWeight: '600' }),
  txt('Text/Muted', { fontSize: 13, fill: C.mutedForeground }),
  txt('Text/Caption', { fontSize: 12, fill: C.mutedForeground }),
  txt('Text/Eyebrow', {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.2,
    fill: C.mutedForeground,
  }),
  txt('Text/Link', { fontSize: 13, fontWeight: '600', fill: C.primary }),
)
const BUTTON = {
  Default: [{ fill: C.primary }, C.primaryForeground],
  Outline: [{ stroke: C.border, strokeWidth: 1 }, C.foreground],
  Ghost: [{}, C.foreground],
}
for (const [v, [surface, ink]] of Object.entries(BUTTON))
  add(
    comp(
      `Button/${v}`,
      Row({ name: 'Button', height: 36, padding: [0, 14], gap: 8, cornerRadius: 8, ...surface }, [
        part('icon', I('plus', { width: 16, height: 16, fill: ink })),
        part('label', T('Button', { fontSize: 14, fontWeight: '600', fill: ink })),
      ]),
    ),
  )
for (const [v, surface] of [
  ['Outline', { stroke: C.border, strokeWidth: 1 }],
  ['Ghost', {}],
])
  add(
    comp(
      `Button/Icon ${v}`,
      Row(
        {
          name: 'Icon Button',
          width: 36,
          height: 36,
          cornerRadius: 8,
          justifyContent: 'center',
          ...surface,
        },
        [part('icon', I('plus', { width: 18, height: 18, fill: C.foreground }))],
      ),
    ),
  )
add(
  ...[
    ['Chip/Default', { stroke: C.border, strokeWidth: 1 }, C.foreground],
    ['Chip/Active', { fill: C.primary }, C.primaryForeground],
  ].map(([name, surface, ink]) =>
    comp(
      name,
      Row({ name: 'Chip', height: 32, padding: [0, 14], cornerRadius: 16, ...surface }, [
        part('label', T('Chip', { fontSize: 13, fontWeight: '600', fill: ink })),
      ]),
    ),
  ),
  comp('Divider', F({ name: 'Divider', width: 'fill_container', height: 1, fill: C.border })),
  comp('Skeleton', F({ name: 'Skeleton', width: 120, height: 12, cornerRadius: 6, fill: C.muted })),
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
        width: 32,
        height: 32,
        cornerRadius: 16,
        justifyContent: 'center',
        fill: C.muted,
      },
      [part('initials', T('MQ', { fontSize: 12, fontWeight: '600' }))],
    ),
  ),
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
)
/* the mark is apps/admin/public/logo.svg; it keeps the brand gradient in every theme */
const LOGO = readFileSync(join(ROOT, 'apps/admin/public/logo.svg'), 'utf8')
const LOGO_BOX = LOGO.match(/viewBox="([^"]+)"/)[1]
  .split(/\s+/)
  .map(Number)
const LOGO_D = [...LOGO.matchAll(/<path[^>]* d="([^"]+)"/g)].map((m) => m[1]).join(' ')
const brandGradient = {
  type: 'gradient',
  gradientType: 'linear',
  rotation: 270,
  colors: [
    { color: C.gradientBrandFrom, position: 0 },
    { color: C.gradientBrandTo, position: 1 },
  ],
}
add(
  comp(
    'Logo/Mark',
    F({ name: 'Mark', width: 28, height: 28, layout: 'vertical' }, [
      {
        type: 'path',
        id: id(),
        name: 'Mark Path',
        width: 28,
        height: 28,
        geometry: LOGO_D,
        viewBox: LOGO_BOX,
        fill: brandGradient,
      },
    ]),
  ),
)
add(
  comp(
    'Logo/Lockup',
    Row({ name: 'Lockup', gap: 10 }, [
      Ref(reg['Logo/Mark'].id, { name: 'Mark' }),
      Col({ name: 'Wordmark', gap: 2 }, [
        T('Bitrate', { fontFamily: 'font-heading', fontSize: 15, fontWeight: '700' }),
        T('Admin', { fontSize: 11, fill: C.mutedForeground }),
      ]),
    ]),
  ),
  comp(
    'Status Bar',
    Row(
      {
        name: 'Status Bar',
        width: 390,
        height: 44,
        padding: [0, 24],
        justifyContent: 'space_between',
      },
      [
        T('9:41', { fontSize: 15, fontWeight: '600' }),
        Row({ gap: 6 }, [
          I('signal', { width: 16, height: 16, fill: C.foreground }),
          I('wifi', { width: 16, height: 16, fill: C.foreground }),
          I('battery-full', { width: 20, height: 16, fill: C.foreground }),
        ]),
      ],
    ),
  ),
  comp(
    'Page Header',
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
    'Activity Row',
    Row({ name: 'Activity Row', width: 'fill_container', gap: 10, alignItems: 'start' }, [
      Col({ name: 'Dot', padding: [6, 0, 0, 0] }, [
        F({ name: 'Dot', width: 8, height: 8, cornerRadius: 4, fill: C.primary }),
      ]),
      Col({ gap: 2, width: 'fill_container' }, [
        part(
          'text',
          T('Activity', { fontSize: 13, width: 'fill_container', textGrowth: 'fixed-width' }),
        ),
        part('meta', muted('Meta', { fontSize: 12 })),
      ]),
    ]),
  ),
  comp(
    'Key Value Row',
    Row(
      {
        name: 'Key Value Row',
        width: 'fill_container',
        height: 36,
        justifyContent: 'space_between',
        stroke: C.border,
        strokeWidth: { bottom: 1 },
      },
      [part('key', muted('Key')), part('value', T('Value', { fontSize: 14, fontWeight: '600' }))],
    ),
  ),
  ...[
    ['Bar Chart/Bar', C.muted, 100],
    ['Bar Chart/Bar Highlight', C.primary, 140],
  ].map(([name, fill, h]) =>
    comp(
      name,
      Col({ name: 'Bar', gap: 8, alignItems: 'center', width: 'fill_container' }, [
        part('bar', F({ width: 'fill_container', height: h, cornerRadius: 6, fill })),
        part('label', muted('Mon', { fontSize: 12 })),
      ]),
    ),
  ),
  comp(
    'Alert/Warning',
    Row(
      {
        name: 'Alert',
        width: 'fill_container',
        gap: 12,
        padding: [12, 16],
        cornerRadius: 10,
        fill: C.warningSurface,
        stroke: C.warningBorder,
        strokeWidth: 1,
      },
      [
        I('wifi-off', { width: 18, height: 18, fill: C.warningText }),
        part(
          'text',
          T('Alert', {
            fontSize: 13,
            fill: C.warningText,
            width: 'fill_container',
            textGrowth: 'fixed-width',
          }),
        ),
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
add(
  comp(
    'State Message/Error',
    Col(
      {
        name: 'State Message',
        width: 480,
        gap: 12,
        padding: [48, 0],
        alignItems: 'center',
      },
      [
        F(
          {
            name: 'Icon Circle',
            width: 56,
            height: 56,
            cornerRadius: 28,
            justifyContent: 'center',
            alignItems: 'center',
            fill: C.errorSurface,
          },
          [part('icon', I('triangle-alert', { width: 24, height: 24, fill: C.errorText }))],
        ),
        part('title', H('Something went wrong', 20, { textAlign: 'center' })),
        part(
          'desc',
          muted('Try again in a moment.', {
            fontSize: 14,
            textAlign: 'center',
            width: 'fill_container',
            textGrowth: 'fixed-width',
          }),
        ),
        Row({ name: 'Actions', gap: 10 }, [
          part('primary', button('Default', 'Try again', 'rotate-cw')),
          part('secondary', button('Outline', 'Back')),
        ]),
      ],
    ),
  ),
)
const iconBtn = (icon) => use('Button/Icon Outline', { name: `Icon / ${icon}` }, { icon: { icon } })
const sk = (w, h = 12, o = {}) => use('Skeleton', { width: w, height: h, ...o })

/* ---------- admin console (apps/admin): shell, navigation and bento tiles for the Overview ---------- */
/* mirrors apps/admin/presentation/navigation: brand, captioned sections, then a footer of three rows —
   language (English ↔ Українська), theme (Dark → Light → Dim) and collapse; collapsed is a 64px rail */
const adminNavItem = (name, active) =>
  comp(
    name,
    Row(
      {
        name: 'Nav Item',
        width: 'fill_container',
        height: 36,
        padding: [0, 10],
        gap: 10,
        cornerRadius: 8,
        ...(active ? { fill: C.sidebarAccent } : {}),
      },
      [
        part(
          'icon',
          I('house', { width: 18, height: 18, fill: active ? C.primary : C.mutedForeground }),
        ),
        part(
          'label',
          T('Item', {
            fontSize: 14,
            fontWeight: active ? '600' : '400',
            fill: active ? C.sidebarAccentForeground : C.mutedForeground,
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
              fill: active ? C.primary : C.muted,
            },
            [
              part(
                'countLabel',
                T('0', {
                  fontSize: 11,
                  fontWeight: '600',
                  fill: active ? C.primaryForeground : C.mutedForeground,
                }),
              ),
            ],
          ),
        ),
      ],
    ),
  )
const adminRailItem = (name, active) =>
  comp(
    name,
    Row(
      {
        name: 'Rail Item',
        width: 40,
        height: 36,
        cornerRadius: 8,
        justifyContent: 'center',
        ...(active ? { fill: C.sidebarAccent } : {}),
      },
      [
        part(
          'icon',
          I('house', { width: 18, height: 18, fill: active ? C.primary : C.mutedForeground }),
        ),
      ],
    ),
  )
add(
  adminNavItem('Admin/Nav Item'),
  adminNavItem('Admin/Nav Item Active', true),
  adminRailItem('Admin/Rail Item'),
  adminRailItem('Admin/Rail Item Active', true),
)
const ADMIN_NAV = [
  [null, [['overview', 'layout-dashboard', 'Overview']]],
  [
    'Operations',
    [
      ['moderation', 'flag', 'Moderation', '16'],
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
]
const ADMIN_FOOTER = [
  ['language', 'languages', 'English'],
  ['theme', 'moon', 'Dark'],
  ['collapse', 'panel-left', 'Collapse'],
]
const navRef = (kind, [key, icon, label, count], prefix = 'nav') => {
  const n = reg[kind]
  return part(
    `${prefix}_${key}`,
    LRef(
      n.id,
      { name: `Nav / ${label}` },
      {
        [n.parts.icon]: { icon },
        ...(n.parts.label ? { [n.parts.label]: { content: label } } : {}),
        ...(n.parts.count
          ? count
            ? { [n.parts.countLabel]: { content: count } }
            : { [n.parts.count]: { enabled: false } }
          : {}),
      },
    ),
  )
}
const groupCaption = (group, first) =>
  part(
    `group_${group.toLowerCase()}`,
    Row({ name: 'Group Label', padding: [first ? 0 : 14, 10, 6, 10] }, [
      part(
        `groupText_${group.toLowerCase()}`,
        T(group.toUpperCase(), {
          name: `Group / ${group}`,
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 1.2,
          fill: C.mutedForeground,
        }),
      ),
    ]),
  )
const adminBrand = () =>
  Row({ name: 'Brand', gap: 10 }, [Ref(reg['Logo/Lockup'].id, { name: 'Lockup' })])
/** The full panel (desktop sidebar and the phone menu): captioned sections, then the preference rows. */
const adminPanel = ({ collapse = true } = {}) => [
  Col({ name: 'Sections', width: 'fill_container', gap: 2, padding: [12, 8] }, [
    ...ADMIN_NAV.flatMap(([group, items], gi) => [
      group ? groupCaption(group, !gi) : null,
      ...items.map((it) => navRef('Admin/Nav Item', it)),
    ]).filter(Boolean),
  ]),
  F({ name: 'Spacer', width: 'fill_container', height: 'fill_container' }),
  Col(
    {
      name: 'Preferences',
      width: 'fill_container',
      gap: 2,
      padding: 8,
      stroke: C.border,
      strokeWidth: { top: 1 },
    },
    (collapse ? ADMIN_FOOTER : ADMIN_FOOTER.slice(0, 2)).map((it) =>
      navRef('Admin/Nav Item', it, 'pref'),
    ),
  ),
]
const adminRail = () => [
  Col(
    { name: 'Sections', width: 'fill_container', gap: 2, padding: [12, 0], alignItems: 'center' },
    ADMIN_NAV.flatMap(([, items], gi) => [
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
      padding: [8, 0],
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
const adminHeader = () =>
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
        T('Admin / Overview', {
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
          part(
            'search',
            T('Search tracks, artists, reports', {
              fontSize: 13,
              fill: C.mutedForeground,
              width: 'fill_container',
              textGrowth: 'fixed-width',
            }),
          ),
          Ref(reg.Kbd.id, { name: 'Kbd' }),
        ],
      ),
      Row({ name: 'Operator', gap: 10 }, [
        Ref(reg.Avatar.id, { name: 'Avatar' }, { [reg.Avatar.parts.initials]: { content: 'MQ' } }),
        Col({ gap: 2 }, [
          part('operator', T('mara.ops', { fontWeight: '600', fontSize: 13 })),
          part('role', T('Super admin', { fontSize: 12, fill: C.mutedForeground })),
        ]),
      ]),
      iconBtn('log-out'),
    ],
  )
const adminShell = (name, collapsed) =>
  comp(
    name,
    Row(
      {
        name: collapsed ? 'Admin Shell Collapsed' : 'Admin Shell',
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
            width: collapsed ? 64 : 248,
            height: 'fill_container',
            gap: 0,
            fill: C.sidebar,
            stroke: C.sidebarBorder,
            strokeWidth: { right: 1 },
          },
          [
            Row(
              {
                name: 'Brand Row',
                width: 'fill_container',
                height: 64,
                padding: collapsed ? 0 : [0, 16],
                justifyContent: collapsed ? 'center' : 'start',
                stroke: C.border,
                strokeWidth: { bottom: 1 },
              },
              [collapsed ? Ref(reg['Logo/Mark'].id, { name: 'Mark' }) : adminBrand()],
            ),
            ...(collapsed ? adminRail() : adminPanel()),
          ],
        ),
        Col({ name: 'Main', width: 'fill_container', height: 'fill_container', gap: 0 }, [
          adminHeader(),
          slot('content', { height: 'fill_container', padding: [28, 32], gap: 24, clip: true }),
        ]),
      ],
    ),
  )
add(adminShell('Admin/Shell/Desktop'), adminShell('Admin/Shell/Desktop Collapsed', true))
add(
  comp(
    'Admin/Shell/Mobile',
    Col(
      {
        name: 'Admin Shell Mobile',
        width: 390,
        height: 844,
        gap: 0,
        fill: C.background,
        clip: true,
      },
      [
        Ref(reg['Status Bar'].id, { name: 'Status Bar', width: 'fill_container' }),
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
            adminBrand(),
            Row({ gap: 4 }, [
              Ref(
                reg['Button/Icon Ghost'].id,
                { name: 'Search' },
                { [reg['Button/Icon Ghost'].parts.icon]: { icon: 'search' } },
              ),
              part(
                'menu',
                Ref(
                  reg['Button/Icon Ghost'].id,
                  { name: 'Menu' },
                  { [reg['Button/Icon Ghost'].parts.icon]: { icon: 'menu' } },
                ),
              ),
            ]),
          ],
        ),
        slot('content', { height: 'fill_container', padding: [20, 16], gap: 16, clip: true }),
      ],
    ),
  ),
  /* the phone has no persistent panel: the menu button opens this sheet with the same sections
     and the language and theme rows (collapse has no meaning on a phone) */
  comp(
    'Admin/Mobile Menu',
    Col(
      {
        name: 'Mobile Menu',
        width: 300,
        height: 760,
        gap: 0,
        cornerRadius: 16,
        clip: true,
        fill: C.sidebar,
        stroke: C.sidebarBorder,
        strokeWidth: 1,
      },
      adminPanel({ collapse: false }),
    ),
  ),
)
/* the active item lives inside the shell instance, so screens also need each item's icon and label path */
for (const shell of ['Admin/Shell/Desktop', 'Admin/Shell/Desktop Collapsed', 'Admin/Mobile Menu']) {
  const s = reg[shell].parts
  const n =
    reg[shell === 'Admin/Shell/Desktop Collapsed' ? 'Admin/Rail Item' : 'Admin/Nav Item'].parts
  for (const k of Object.keys(s).filter((p) => /^(nav|pref)_/.test(p)))
    for (const [p, pid] of Object.entries(n)) s[`${k}.${p}`] = `${s[k]}/${pid}`
}

/* bento: one tile anatomy (icon, title, meta, actions, content) in three surfaces; KPI and state tiles */
const TONES = {
  Neutral: [C.muted, C.foreground],
  Primary: [C.primary, C.primaryForeground],
  Success: [C.successSurface, C.successText],
  Info: [C.infoSurface, C.infoText],
  Warning: [C.warningSurface, C.warningText],
  Error: [C.errorSurface, C.errorText],
}
const toneBox = (tone, icon = 'layout-grid', size = 32) =>
  part(
    'iconBox',
    F(
      {
        name: 'Icon Box',
        width: size,
        height: size,
        cornerRadius: size / 4,
        justifyContent: 'center',
        alignItems: 'center',
        fill: TONES[tone][0],
      },
      [part('icon', I(icon, { width: size / 2, height: size / 2, fill: TONES[tone][1] }))],
    ),
  )
const bentoTile = (name, { accent } = {}) =>
  comp(
    name,
    Col(
      {
        name: 'Bento Tile',
        width: 'fill_container',
        gap: 16,
        padding: 20,
        cornerRadius: 16,
        clip: true,
        fill: accent ? C.backgroundTinted : C.card,
        stroke: C.border,
        strokeWidth: 1,
      },
      [
        Row({ name: 'Tile Header', width: 'fill_container', gap: 10 }, [
          toneBox(accent ? 'Primary' : 'Neutral'),
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
          part('actions', Row({ name: 'Actions', gap: 6 }, [iconBtn('arrow-up-right')])),
        ]),
        slot('content', { gap: 14 }),
      ],
    ),
  )
add(bentoTile('Admin/Bento/Tile'), bentoTile('Admin/Bento/Tile Accent', { accent: true }))
/* KPI: label, big tabular value, delta pill, 12-bar sparkline; the tone names what the change means */
const SPARK = [14, 18, 16, 22, 20, 24, 21, 26, 25, 29, 27, 34]
const kpiTile = (tone, icon) =>
  comp(
    `Admin/Bento/KPI/${tone}`,
    Col(
      {
        name: 'KPI Tile',
        width: 'fill_container',
        gap: 12,
        padding: 20,
        cornerRadius: 16,
        fill: C.card,
        stroke: C.border,
        strokeWidth: 1,
      },
      [
        Row({ name: 'Label Row', width: 'fill_container', gap: 8 }, [
          part('icon', I('users-round', { width: 16, height: 16 })),
          part('label', muted('Label', { width: 'fill_container', textGrowth: 'fixed-width' })),
          Row(
            {
              name: 'Delta',
              gap: 4,
              padding: [3, 8],
              cornerRadius: 999,
              fill: TONES[
                tone === 'Positive' ? 'Success' : tone === 'Negative' ? 'Error' : 'Neutral'
              ][0],
            },
            [
              part(
                'deltaIcon',
                I(icon, {
                  width: 14,
                  height: 14,
                  fill:
                    tone === 'Positive'
                      ? C.successText
                      : tone === 'Negative'
                        ? C.errorText
                        : C.mutedForeground,
                }),
              ),
              part(
                'delta',
                T('0%', {
                  fontSize: 12,
                  fontWeight: '600',
                  fill:
                    tone === 'Positive'
                      ? C.successText
                      : tone === 'Negative'
                        ? C.errorText
                        : C.mutedForeground,
                }),
              ),
            ],
          ),
        ]),
        part('value', H('0', 34, { fontWeight: '700', letterSpacing: -0.8 })),
        Row(
          { name: 'Sparkline', width: 'fill_container', height: 36, gap: 3, alignItems: 'end' },
          SPARK.map((h, i) =>
            part(
              `b${i}`,
              F({
                name: 'Spark Bar',
                width: 'fill_container',
                height: h,
                cornerRadius: 2,
                fill: i === SPARK.length - 1 ? C.primary : C.chart2,
                opacity: i === SPARK.length - 1 ? 1 : 0.45,
              }),
            ),
          ),
        ),
        part(
          'sub',
          muted('Sub', { fontSize: 12, width: 'fill_container', textGrowth: 'fixed-width' }),
        ),
      ],
    ),
  )
add(
  kpiTile('Positive', 'trending-up'),
  kpiTile('Negative', 'trending-up'),
  kpiTile('Neutral', 'minus'),
)
/* "Needs action" rows: a toned icon, what waits, how old it is, the count and a way in */
const actionRow = (tone, icon) =>
  comp(
    `Admin/Bento/Action Row/${tone}`,
    Row(
      {
        name: 'Action Row',
        width: 'fill_container',
        gap: 14,
        padding: [14, 16],
        cornerRadius: 12,
        fill: C.card,
        stroke: C.border,
        strokeWidth: 1,
      },
      [
        toneBox(tone, icon, 36),
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
        part('count', H('0', 26, { fontWeight: '700' })),
        I('chevron-right', { width: 18, height: 18 }),
      ],
    ),
  )
add(
  actionRow('Warning', 'flag'),
  actionRow('Info', 'disc-3'),
  actionRow('Error', 'triangle-alert'),
  actionRow('Success', 'circle-check'),
)
/* horizontal meter (reports by type) in the five chart colours */
const meterRow = (i) =>
  comp(
    `Admin/Bento/Meter Row/${i}`,
    Col({ name: 'Meter Row', width: 'fill_container', gap: 6 }, [
      Row({ name: 'Labels', width: 'fill_container', gap: 8 }, [
        part(
          'label',
          T('Label', { fontSize: 13, width: 'fill_container', textGrowth: 'fixed-width' }),
        ),
        part('value', T('0', { fontSize: 13, fontWeight: '600' })),
      ]),
      Row({ name: 'Track', width: 'fill_container', height: 6, cornerRadius: 3, fill: C.muted }, [
        part(
          'bar',
          F({ name: 'Bar', width: 120, height: 6, cornerRadius: 3, fill: C[`chart${i}`] }),
        ),
      ]),
    ]),
  )
add(...[1, 2, 3, 4, 5].map(meterRow))
/* processing pipeline: one stacked bar (ready · processing · stuck · failed) and its legend */
const SEGMENTS = [
  ['ready', C.success, 150],
  ['processing', C.info, 40],
  ['stuck', C.warning, 12],
  ['failed', C.error, 16],
]
add(
  comp(
    'Admin/Bento/Segment Bar',
    Row(
      { name: 'Segment Bar', width: 'fill_container', height: 10, gap: 3 },
      SEGMENTS.map(([k, fill, w]) =>
        part(k, F({ name: `Segment / ${k}`, width: w, height: 10, cornerRadius: 3, fill })),
      ),
    ),
  ),
  ...[
    ['Success', C.success],
    ['Info', C.info],
    ['Warning', C.warning],
    ['Error', C.error],
  ].map(([tone, fill]) =>
    comp(
      `Admin/Bento/Legend Row/${tone}`,
      Row({ name: 'Legend Row', width: 'fill_container', gap: 10 }, [
        F({ name: 'Dot', width: 8, height: 8, cornerRadius: 4, fill }),
        part('label', muted('Label', { width: 'fill_container', textGrowth: 'fixed-width' })),
        part('value', T('0', { fontSize: 13, fontWeight: '600' })),
      ]),
    ),
  ),
)
/* tile states: what a single tile shows when its data is missing, failed or not permitted */
const tileMessage = (kind, tone, icon, title, desc, action) =>
  comp(
    `Admin/Bento/Tile Message/${kind}`,
    Col(
      {
        name: 'Tile Message',
        width: 'fill_container',
        gap: 8,
        padding: [20, 12],
        alignItems: 'center',
        justifyContent: 'center',
      },
      [
        F(
          {
            name: 'Icon Circle',
            width: 40,
            height: 40,
            cornerRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
            fill: TONES[tone][0],
          },
          [part('icon', I(icon, { width: 20, height: 20, fill: TONES[tone][1] }))],
        ),
        part('title', T(title, { fontSize: 14, fontWeight: '600', textAlign: 'center' })),
        part(
          'desc',
          muted(desc, {
            fontSize: 12,
            textAlign: 'center',
            width: 'fill_container',
            textGrowth: 'fixed-width',
          }),
        ),
        action ? part('action', button('Outline', action, 'rotate-cw')) : null,
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
  tileMessage('Locked', 'Neutral', 'lock', 'Not in your role', 'Ask a super admin for access.'),
  tileMessage(
    'Empty',
    'Success',
    'circle-check',
    'Nothing here yet',
    'Data appears as it arrives.',
  ),
)

/* loaders: each tile and KPI has a skeleton of its own shape, so a loading overview already shows
   where every figure will land; a tile refreshing in the background keeps its data and shows "Updating" */
const loaderCard = (name, body, o = {}) =>
  comp(
    name,
    Col(
      {
        name: 'Loader',
        width: 'fill_container',
        gap: 16,
        padding: 20,
        cornerRadius: 16,
        fill: C.card,
        stroke: C.border,
        strokeWidth: 1,
        clip: true,
        ...o,
      },
      body,
    ),
  )
const loaderHead = () =>
  Row({ name: 'Header', width: 'fill_container', gap: 10 }, [
    sk(32, 32, { cornerRadius: 8 }),
    Col({ gap: 6, width: 'fill_container' }, [sk(120, 12), sk(80, 10)]),
  ])
const BAR_H = [62, 54, 70, 76, 92, 110, 98]
add(
  loaderCard('Admin/Loader/KPI', [
    Row({ name: 'Label Row', width: 'fill_container', gap: 8 }, [
      sk(16, 16, { cornerRadius: 4 }),
      sk(80, 12),
      F({ name: 'Spacer', width: 'fill_container', height: 1 }),
      sk(56, 20, { cornerRadius: 10 }),
    ]),
    sk(140, 34, { cornerRadius: 6 }),
    Row(
      { name: 'Sparkline', width: 'fill_container', height: 36, gap: 3, alignItems: 'end' },
      [14, 18, 16, 22, 20, 24, 21, 26, 25, 29, 27, 34].map((h) =>
        sk('fill_container', h, { cornerRadius: 2 }),
      ),
    ),
    sk(120, 10),
  ]),
  loaderCard('Admin/Loader/Tile', [
    loaderHead(),
    sk('fill_container', 28, { cornerRadius: 6 }),
    sk('fill_container', 12),
    sk(180, 12),
  ]),
  loaderCard('Admin/Loader/Tile Actions', [
    loaderHead(),
    ...[0, 1, 2].map(() =>
      Row(
        {
          name: 'Action Row',
          width: 'fill_container',
          gap: 14,
          padding: [14, 16],
          cornerRadius: 12,
          stroke: C.border,
          strokeWidth: 1,
        },
        [
          sk(36, 36, { cornerRadius: 9 }),
          Col({ gap: 6, width: 'fill_container' }, [sk(160, 12), sk(110, 10)]),
          sk(28, 24, { cornerRadius: 6 }),
        ],
      ),
    ),
    Col({ name: 'Rows', gap: 12, width: 'fill_container' }, [
      sk(90, 10),
      sk('fill_container', 12),
      sk(220, 12),
    ]),
  ]),
  loaderCard(
    'Admin/Loader/Tile Chart',
    [
      loaderHead(),
      Row(
        {
          name: 'Bars',
          width: 'fill_container',
          height: 'fill_container',
          gap: 8,
          alignItems: 'end',
        },
        BAR_H.map((h) =>
          Col({ name: 'Bar', gap: 8, alignItems: 'center', width: 'fill_container' }, [
            sk('fill_container', h, { cornerRadius: 6 }),
            sk(24, 10),
          ]),
        ),
      ),
    ],
    { height: 300 },
  ),
  loaderCard('Admin/Loader/Tile List', [
    loaderHead(),
    ...[0, 1, 2].map(() =>
      Row({ name: 'Item', width: 'fill_container', gap: 10, alignItems: 'start' }, [
        sk(8, 8, { cornerRadius: 4 }),
        Col({ gap: 6, width: 'fill_container' }, [sk('fill_container', 12), sk(70, 10)]),
      ]),
    ),
  ]),
  loaderCard('Admin/Loader/Tile Meters', [
    loaderHead(),
    ...[200, 120, 90, 50, 30].map((w) =>
      Col({ name: 'Meter', gap: 6, width: 'fill_container' }, [
        Row({ width: 'fill_container', justifyContent: 'space_between' }, [sk(70, 10), sk(16, 10)]),
        sk(w, 6, { cornerRadius: 3 }),
      ]),
    ),
  ]),
  loaderCard('Admin/Loader/Tile Pipeline', [
    loaderHead(),
    sk('fill_container', 10, { cornerRadius: 3 }),
    ...[0, 1, 2, 3].map(() =>
      Row({ name: 'Legend', width: 'fill_container', gap: 10 }, [
        sk(8, 8, { cornerRadius: 4 }),
        sk(90, 10),
        F({ name: 'Spacer', width: 'fill_container', height: 1 }),
        sk(30, 10),
      ]),
    ),
  ]),
  comp(
    'Admin/Loader/Updating',
    Row(
      {
        name: 'Updating',
        height: 28,
        padding: [0, 10],
        gap: 8,
        cornerRadius: 14,
        fill: C.muted,
      },
      [
        Ref(reg.Spinner.id, { name: 'Spinner' }),
        part('label', T('Updating…', { fontSize: 12, fontWeight: '600', fill: C.mutedForeground })),
      ],
    ),
  ),
)

/* lay the library out: one flex root, a section per family, each component labelled at its real size */
const cellWidth = (b) =>
  typeof b.width === 'number'
    ? Math.max(160, b.width)
    : /Row|Bar|Legend|Meter/.test(b.name) && !/Loader/.test(b.name)
      ? 420
      : 320
const section = (title, desc, names) => {
  const items = blocks.filter((b) => names.test(b.name))
  const rows = []
  let line = []
  let used = 0
  for (const b of items) {
    const w = cellWidth(b)
    if (used && used + w > 1600) {
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
    H(title, 28, { fontWeight: '700' }),
    P(desc, { width: 760 }),
    ...rows.map((r, i) => Row({ name: `${title} Row ${i + 1}`, gap: 40, alignItems: 'start' }, r)),
  ])
}
/* the error message's button labels sit inside button instances */
reg['State Message/Error'].parts.primaryLabel =
  `${reg['State Message/Error'].parts.primary}/${reg['Button/Default'].parts.label}`
reg['State Message/Error'].parts.secondaryLabel =
  `${reg['State Message/Error'].parts.secondary}/${reg['Button/Outline'].parts.label}`

const root = F(
  {
    name: 'Bitrate Admin Design System',
    x: 0,
    y: 0,
    width: 1760,
    layout: 'vertical',
    gap: 72,
    padding: 64,
    fill: C.background,
  },
  [
    H('Bitrate Admin', 44, { fontWeight: '700' }),
    P(
      'The admin console’s own design system (apps/admin), separate from the player’s library. Colours are the code’s tokens in three themes (Light, Dark, Dim); admin screens import this file as `admin` and use only its components. Source: scripts/pencil-pages/admin-lib.mjs.',
      { width: 760 },
    ),
    section(
      'Foundations',
      'Type, buttons, chips, divider, skeleton, spinner, avatar, key hint, the logo and the phone status bar.',
      /^(Text|Button|Chip|Divider|Skeleton|Spinner|Avatar|Kbd|Logo|Status Bar)/,
    ),
    section(
      'Patterns',
      'Page header, activity and key–value rows, bars, the warning alert and the error message.',
      /^(Page Header|Activity Row|Key Value Row|Bar Chart|Alert|State Message)/,
    ),
    section(
      'Navigation',
      'Sidebar rows and rail items. Footer rows switch the language (English ↔ Українська), the theme (Dark → Light → Dim) and collapse the panel to a 64px rail.',
      /^Admin\/(Nav|Rail)/,
    ),
    section(
      'Bento tiles',
      'Independent tiles on a four-column grid (1×1, 2×1, 2×2): a tile, its KPI, queue rows, meters, the pipeline bar and legend, and what a tile shows when its data is empty, failed or not in the operator’s role.',
      /^Admin\/Bento\//,
    ),
    section(
      'Loaders',
      'A skeleton per element, shaped like the content it stands in for, and the Updating badge for a tile refreshing in the background.',
      /^Admin\/Loader\//,
    ),
    section(
      'Shell',
      'Desktop shell with the expanded panel and with the collapsed rail; the phone shell and its menu sheet.',
      /^Admin\/(Mobile Menu|Shell)/,
    ),
  ],
)
/* colour variables are written from code by `pnpm design:tokens`; keep them, set the fonts */
const previous = existsSync(libF) ? JSON.parse(readFileSync(libF, 'utf8')) : {}
const variables = Object.fromEntries(
  Object.entries(previous.variables ?? {}).filter(([, v]) => v.type === 'color'),
)
/* code uses the system UI stack; Roboto is the stack's member Pencil can render */
variables['--font-sans'] = { type: 'string', value: 'Roboto' }
variables['--font-heading'] = { type: 'string', value: 'Roboto' }
mkdirSync(dirname(libF), { recursive: true })
writeFileSync(
  libF,
  JSON.stringify(
    {
      version: '2.20',
      themes: { Mode: ['Dark', 'Light', 'Dim'] },
      variables,
      children: [root],
    },
    null,
    2,
  ),
)
writeFileSync(regF, JSON.stringify(reg, null, 2))
console.log('admin components', Object.keys(reg).length)
