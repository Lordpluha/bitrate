// Screen states: alerts in the four status tones, the empty and error tiles, and loading skeletons
// shaped like the tiles and rows they stand in for.
import { C, Col, F, I, Row, T } from '../kit.mjs'
import { artistPaint } from './paint.mjs'

const ALERTS = {
  Info: ['artistStatusProcessing', 'info'],
  Warning: ['artistStatusWarning', 'triangle-alert'],
  Error: ['artistStatusError', 'circle-x'],
  Success: ['artistStatusReady', 'circle-check'],
}

/** Adds alerts, empty/error states and skeletons to the library. */
export function addStates(lib) {
  const { comp, part, add, slot } = lib
  const paint = artistPaint()
  const wrap = { width: 'fill_container', textGrowth: 'fixed-width', lineHeight: 1.5 }
  for (const [tone, [role, icon]] of Object.entries(ALERTS))
    add(
      comp(
        `Alert/${tone}`,
        Row(
          {
            name: 'Alert',
            width: 520,
            gap: 12,
            padding: [14, 16],
            cornerRadius: 10,
            alignItems: 'start',
            fill: paint.tint(C[role], 0.08),
            stroke: paint.tint(C[role], 0.45),
            strokeWidth: 1,
          },
          [
            I(icon, { width: 18, height: 18, fill: C[role] }),
            Col({ name: 'Text', gap: 2, width: 'fill_container' }, [
              part(
                'title',
                T('Title', { fontSize: 12, fontWeight: '500', fill: C.artistForeground, ...wrap }),
              ),
              part('body', T('Body', { fontSize: 11, fill: C.artistTextSecondary, ...wrap })),
            ]),
            slot('action', { layout: 'horizontal', width: 'fit_content', gap: 8 }),
          ],
        ),
      ),
    )
  const message = (name, role, fill) =>
    comp(
      name,
      Col(
        {
          name: 'State',
          width: 640,
          gap: 14,
          padding: [56, 32],
          cornerRadius: 10,
          alignItems: 'center',
          ...paint.releaseGlass(),
        },
        [
          Row(
            {
              name: 'Icon',
              width: 52,
              height: 52,
              cornerRadius: 26,
              justifyContent: 'center',
              fill,
            },
            [part('icon', I('megaphone', { width: 22, height: 22, fill: C[role] }))],
          ),
          part('title', T('Title', { fontSize: 15, fontWeight: '500', fill: C.artistForeground })),
          part(
            'body',
            T('Body', {
              fontSize: 11,
              fill: C.artistTextSecondary,
              width: 380,
              textGrowth: 'fixed-width',
              textAlign: 'center',
              lineHeight: 1.5,
            }),
          ),
          slot('action', {
            layout: 'horizontal',
            width: 'fit_content',
            gap: 8,
            padding: [6, 0, 0, 0],
          }),
        ],
      ),
    )
  add(
    message('State/Empty', 'artistIcon', C.artistSelection),
    message('State/Error', 'artistStatusError', paint.tint(C.artistStatusError, 0.12)),
  )
  const bar = (width, height = 10) =>
    F({
      name: 'Bone',
      width,
      height,
      cornerRadius: height / 2,
      fill: paint.tint(C.artistForeground, 0.08),
    })
  const row = () =>
    Row({ name: 'Row', width: 'fill_container', gap: 12, padding: [10, 0], ...paint.hairline() }, [
      bar(44, 48),
      Col({ name: 'Lines', gap: 8, width: 'fill_container' }, [bar('fill_container'), bar(140, 8)]),
    ])
  add(
    comp(
      'Skeleton/Row',
      Row({ name: 'Skeleton Row', width: 360, gap: 12, padding: [10, 0], ...paint.hairline() }, [
        bar(44, 48),
        Col({ name: 'Lines', gap: 8, width: 'fill_container' }, [
          bar('fill_container'),
          bar(140, 8),
        ]),
      ]),
    ),
    comp(
      'Skeleton/Tile',
      Col(
        {
          name: 'Skeleton Tile',
          width: 360,
          gap: 14,
          padding: 18,
          cornerRadius: 10,
          ...paint.releaseGlass(),
        },
        [
          Row({ name: 'Heading', gap: 8 }, [bar(18, 18), bar(140, 12)]),
          Col({ name: 'Rows', gap: 0, width: 'fill_container' }, [row(), row(), row()]),
        ],
      ),
    ),
  )
}
