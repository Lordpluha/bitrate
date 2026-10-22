// Library page blocks: signal cursor.
import { C, T, I, F, Row, Col } from '../../kit.mjs'
import { part, comp } from '../engine.mjs'

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
/** Registers this section's library components, in build order. */
export function register(add) {
  add(
    comp('Cursor/Default', ring(40, {}, [cdot()])),
    comp('Cursor/Hover', ring(56, { fill: C.sidebarAccent }, [])),
    comp(
      'Cursor/Play',
      Row(
        {
          name: 'Play Pill',
          height: 40,
          padding: [0, 14],
          gap: 8,
          cornerRadius: 20,
          fill: C.white,
        },
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
      ring(40, { stroke: C.border }, [
        I('loader-circle', { width: 22, height: 22, fill: C.accent }),
      ]),
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
}
