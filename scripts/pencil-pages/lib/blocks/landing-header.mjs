// Library page blocks: landing header (scene nav, theme switch, sound toggle).
import { C, T, I, F, Row, Ref } from '../../kit.mjs'
import { reg, comp } from '../engine.mjs'

/** Registers this section's library components, in build order. */
export function register(add) {
  /* landing header (prototype): scene nav, theme switch and the sound toggle */
  add(
    comp(
      'Landing/Header',
      Row(
        {
          name: 'Landing Header',
          width: 1440,
          height: 72,
          padding: [0, 48],
          justifyContent: 'space_between',
        },
        [
          Ref(reg['Logo/Lockup'].id, { name: 'Lockup' }),
          Row(
            { name: 'Nav', gap: 28 },
            ['Web player', 'Your library', 'Discover', 'Features'].map((l) =>
              T(l, { fontSize: 14, fill: C.mutedForeground }),
            ),
          ),
          Row({ name: 'Actions', gap: 10 }, [
            Row(
              {
                name: 'Theme',
                gap: 2,
                padding: 3,
                cornerRadius: 18,
                stroke: C.border,
                strokeWidth: 1,
              },
              [['Dark', true], ['Light'], ['Dim']].map(([l, on]) =>
                Row(
                  {
                    name: l,
                    height: 28,
                    padding: [0, 10],
                    cornerRadius: 14,
                    fill: on ? C.primary : undefined,
                  },
                  [T(l, { fontSize: 12, fill: on ? C.primaryForeground : C.mutedForeground })],
                ),
              ),
            ),
            Row(
              {
                name: 'Sound',
                height: 36,
                padding: [0, 12],
                gap: 8,
                cornerRadius: 18,
                stroke: C.border,
                strokeWidth: 1,
              },
              [
                I('audio-lines', { width: 14, height: 14, fill: C.foreground }),
                T('PLAY SIGNAL', {
                  fontSize: 11,
                  letterSpacing: 1.2,
                  fontFamily: 'JetBrains Mono',
                  fill: C.mutedForeground,
                }),
              ],
            ),
          ]),
        ],
      ),
    ),
    comp(
      'Landing/Accent Swatches',
      Row(
        { name: 'Accent', gap: 10 },
        [C.primary, C.magenta500, C.info, C.success].map((c, i) =>
          F({
            name: i ? 'Swatch' : 'Swatch Selected',
            width: 24,
            height: 24,
            cornerRadius: 12,
            fill: c,
            stroke: i ? undefined : C.foreground,
            strokeWidth: i ? undefined : 2,
          }),
        ),
      ),
    ),
  )
}
