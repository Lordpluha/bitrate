// Library page blocks: artist workspace.
import { C, T, P, H, I, F, Row, Col, Ref, Button } from '../../kit.mjs'
import { reg, part, comp, slot } from '../engine.mjs'

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
/** Registers this section's library components, in build order. */
export function register(add) {
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
  reg['Artist Shell/Desktop'].parts.actionLabel =
    `${reg['Artist Shell/Desktop'].parts.action}/E23bq6`
  reg['Artist Shell/Desktop'].parts.actionIcon =
    `${reg['Artist Shell/Desktop'].parts.action}/k0WCtI`
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
            H('Title', 32, {
              fontWeight: '700',
              textGrowth: 'fixed-width',
              width: 'fill_container',
            }),
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
          slot('value', {
            layout: 'horizontal',
            width: 'fit_content',
            gap: 8,
            alignItems: 'center',
          }),
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
          slot('tags', {
            layout: 'horizontal',
            width: 'fit_content',
            gap: 6,
            alignItems: 'center',
          }),
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
        {
          name: 'Result Row',
          width: 'fill_container',
          padding: [12, 14],
          gap: 14,
          cornerRadius: 10,
        },
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
}
