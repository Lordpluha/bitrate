// Library page blocks: command search, atmosphere mode, video player and mobile player panels.
import { C, T, I, F, Row, Col, Ref, img, ART } from '../../kit.mjs'
import { reg, part, comp, cover, slot } from '../engine.mjs'

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
/** Registers this section's library components, in build order. */
export function register(add) {
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
          effect: {
            type: 'shadow',
            shadowType: 'outer',
            color: C.shadow,
            offset: { x: 0, y: 24 },
            blur: 60,
          },
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
              Row({ gap: 6 }, [
                kbd('↑↓'),
                T('Navigate', { fontSize: 12, fill: C.mutedForeground }),
              ]),
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
  add(
    comp(
      'Atmosphere/Frame',
      F(
        {
          name: 'Atmosphere',
          width: 1440,
          height: 900,
          padding: 3,
          cornerRadius: 28,
          clip: true,
          /* the rim: the track colours chase each other around the screen edge */
          fill: {
            type: 'gradient',
            gradientType: 'angular',
            rotation: 200,
            colors: [
              { color: C.primary, position: 0 },
              { color: C.magenta500, position: 0.28 },
              { color: C.info, position: 0.55 },
              { color: C.accent, position: 0.78 },
              { color: C.primary, position: 1 },
            ],
          },
          effect: [
            {
              type: 'shadow',
              shadowType: 'outer',
              color: C.primary,
              offset: { x: -24, y: -16 },
              blur: 90,
            },
            {
              type: 'shadow',
              shadowType: 'outer',
              color: C.magenta500,
              offset: { x: 24, y: 20 },
              blur: 90,
            },
          ],
        },
        [
          F(
            {
              name: 'Inner',
              width: 'fill_container',
              height: 'fill_container',
              cornerRadius: 25,
              clip: true,
              fill: C.background,
              layout: 'vertical',
              /* the glow: light from the rim bleeds inwards and fades towards the centre, at any frame size */
              effect: [
                {
                  type: 'shadow',
                  shadowType: 'inner',
                  color: C.primary,
                  offset: { x: 0, y: 0 },
                  blur: 120,
                },
                {
                  type: 'shadow',
                  shadowType: 'inner',
                  color: C.magenta500,
                  offset: { x: 0, y: 0 },
                  blur: 56,
                },
              ],
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
}
