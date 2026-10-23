// Library page blocks: landing footer, service health and scene landing.
import { C, T, P, I, F, Row, Col, Ref, img, ART } from '../../kit.mjs'
import { reg, part, comp, txt, gradient, slot } from '../engine.mjs'

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
/** Registers this section's library components, in build order. */
export function register(add) {
  add(footLink('Link/Footer', false), footLink('Link/Footer Hover', true))
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
                F({
                  name: 'Day',
                  width: 4,
                  height: 22,
                  cornerRadius: 1,
                  fill: barFill[BARS[k](i)],
                }),
              ),
            ),
            Row({ name: 'State', gap: 6 }, [
              F({ name: 'Dot', width: 6, height: 6, cornerRadius: 3, fill: dot }),
              part(
                'state',
                T(k === 'Checking' ? 'Checking' : k, {
                  fontSize: 12,
                  fontWeight: '600',
                  fill: text,
                }),
              ),
            ]),
          ],
        ),
        { cell: 'medium' },
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
          effect: {
            type: 'shadow',
            shadowType: 'outer',
            color: C.shadow,
            offset: { x: 0, y: 16 },
            blur: 40,
          },
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
}
