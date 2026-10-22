// Library page blocks: landing scenes 10-12.
import { C, T, P, H, F, Row, Col, Button } from '../../kit.mjs'
import { part, comp, gradient } from '../engine.mjs'

/* landing scenes 10-12: partner spheres, team bubbles + hover card, Newton's cradle (static stand-ins for the motion) */
const sphereFill = (a, b) => ({
  type: 'gradient',
  gradientType: 'radial',
  colors: [
    { color: a, position: 0 },
    { color: b, position: 1 },
  ],
})
/** Registers this section's library components, in build order. */
export function register(add) {
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
            effect: {
              type: 'shadow',
              shadowType: 'outer',
              color: C.shadow,
              offset: { x: 0, y: 14 },
              blur: 30,
            },
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
          effect: {
            type: 'shadow',
            shadowType: 'outer',
            color: C.shadow,
            offset: { x: 0, y: 12 },
            blur: 30,
          },
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
          effect: {
            type: 'shadow',
            shadowType: 'outer',
            color: C.shadow,
            offset: { x: 0, y: 16 },
            blur: 40,
          },
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
}
