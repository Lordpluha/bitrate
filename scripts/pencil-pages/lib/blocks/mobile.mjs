// Library page blocks: mobile rows and bars.
import { C, T, I, F, Row } from '../../kit.mjs'
import { part, comp } from '../engine.mjs'

/** Registers this section's library components, in build order. */
export function register(add) {
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
          F(
            { name: 'Back', width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
            [part('backIcon', I('chevron-left', { width: 22, height: 22, fill: C.foreground }))],
          ),
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
}
