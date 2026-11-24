// Choosers and progress rows of the release pages: chips (genre, country; removable), role toggles
// (contributor form), the pick row of the compilation picker, the review progress steps (ReviewStage)
// and the release link row (LaunchStage).
import { C, Col, I, Row, T } from '../kit.mjs'
import { artistPaint } from './paint.mjs'

const STEPS = {
  Done: ['circle-check', 'artistStatusReady'],
  Current: ['loader-circle', 'artistStatusProcessing'],
  Upcoming: ['circle-dashed', 'artistTextSecondary'],
}

/** Adds chips, toggles, pick rows, review steps and link rows to the library. */
export function addPickers(lib) {
  const { comp, part, add, slot, use, nest } = lib
  const paint = artistPaint()
  const wrap = { width: 'fill_container', textGrowth: 'fixed-width', lineHeight: 1.5 }
  const strong = (s) => T(s, { fontSize: 12, fontWeight: '500', fill: C.artistForeground, ...wrap })
  const small = (s) => T(s, { fontSize: 11, fill: C.artistTextSecondary, ...wrap })
  const chip = (name, o, children) =>
    comp(
      name,
      Row({ name: 'Chip', height: 28, gap: 6, padding: [0, 10], cornerRadius: 14, ...o }, children),
    )
  add(
    chip('Chip', paint.control(), [
      part('label', T('Synthwave', { fontSize: 11, fill: C.artistForeground })),
    ]),
    chip(
      'Chip/Removable',
      { fill: C.artistSelection, stroke: C.artistSelectionBorder, strokeWidth: 1 },
      [
        part('label', T('Poland', { fontSize: 11, fill: C.artistForeground })),
        I('x', { width: 12, height: 12, fill: C.artistTextSecondary }),
      ],
    ),
    chip('Chip/Toggle', { stroke: C.artistReleaseBorder, strokeWidth: 1 }, [
      part('label', T('Composer', { fontSize: 11, fill: C.artistTextSecondary })),
    ]),
    chip(
      'Chip/Toggle On',
      { fill: C.artistSelection, stroke: C.artistSelectionBorder, strokeWidth: 1 },
      [
        I('check', { width: 12, height: 12, fill: C.artistIcon }),
        part('label', T('Performer', { fontSize: 11, fill: C.artistForeground })),
      ],
    ),
  )
  for (const selected of [false, true])
    add(
      comp(
        `Row/Pick${selected ? ' Selected' : ''}`,
        Row(
          {
            name: 'Pick Row',
            width: 480,
            gap: 12,
            padding: [8, 10],
            cornerRadius: 10,
            ...(selected ? { fill: C.artistSelection } : {}),
          },
          [
            Row(
              {
                name: 'Box',
                width: 16,
                height: 16,
                cornerRadius: 4,
                justifyContent: 'center',
                ...(selected ? { fill: paint.action().fill } : paint.control()),
              },
              selected ? [I('check', { width: 12, height: 12, fill: C.primaryForeground })] : [],
            ),
            part('cover', use('Cover', { name: 'Cover' })),
            Col({ name: 'Text', gap: 2, width: 'fill_container' }, [
              part('title', strong('Afterglow')),
              part('meta', small('Afterglow · Remaster · 3:57')),
            ]),
          ],
        ),
      ),
    )
  for (const k of ['Row/Pick', 'Row/Pick Selected']) nest(k, 'cover', 'Cover')
  for (const [state, [icon, role]] of Object.entries(STEPS))
    add(
      comp(
        `Row/Step ${state}`,
        Row({ name: 'Progress Step', width: 360, gap: 10, padding: [8, 0], alignItems: 'start' }, [
          I(icon, { width: 16, height: 16, fill: C[role] }),
          Col({ name: 'Text', gap: 2, width: 'fill_container' }, [
            part('title', strong('Submitted')),
            part(
              'detail',
              small('The draft is locked so the reviewer sees exactly what you sent.'),
            ),
          ]),
        ]),
      ),
    )
  add(
    comp(
      'Row/Link',
      Row({ name: 'Link Row', width: 520, gap: 12, padding: [12, 0], ...paint.hairline() }, [
        part('icon', I('globe', { width: 16, height: 16, fill: C.artistIcon })),
        Col({ name: 'Text', gap: 2, width: 'fill_container' }, [
          part('title', strong('Primary release page')),
          part('meta', small('Published when the release goes live')),
        ]),
        slot('trail', { layout: 'horizontal', width: 'fit_content', gap: 6, alignItems: 'center' }),
      ]),
    ),
  )
}
