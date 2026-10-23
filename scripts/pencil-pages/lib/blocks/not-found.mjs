// Library page blocks: 404 "signal lost".
import { C, F, Row } from '../../kit.mjs'
import { comp } from '../engine.mjs'

/** Registers this section's library components, in build order. */
export function register(add) {
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
}
