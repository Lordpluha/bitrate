// Bento tiles (.artist-release-workspace-panel): glass panel with an icon heading, a right-hand slot and
// a body slot; the hue variant adds the panel's corner glow. Rows that live in tiles: setting row,
// key–value, date row, table header and row, and the bare numerals of the numbers tile.
import { C, Col, I, Row, T } from '../kit.mjs'
import { artistPaint } from './paint.mjs'

const CLEAR = '#7C3AED00'

/** Adds tiles and tile rows to the library. */
export function addTiles(lib) {
  const { comp, part, add, slot } = lib
  const paint = artistPaint()
  const glow = {
    type: 'gradient',
    gradientType: 'radial',
    center: { x: 1, y: 0 },
    size: { width: 1.3, height: 1.3 },
    opacity: 0.22,
    colors: [
      { color: C.chart1, position: 0 },
      { color: CLEAR, position: 1 },
    ],
  }
  const tile = (name, hue) => {
    const glass = paint.releaseGlass()
    return comp(
      name,
      Col(
        {
          name: 'Tile',
          width: 360,
          gap: 14,
          padding: 18,
          cornerRadius: 10,
          ...glass,
          ...(hue ? { fill: [glass.fill, glow] } : {}),
        },
        [
          part(
            'head',
            Row({ name: 'Heading', width: 'fill_container', gap: 8 }, [
              part(
                'icon',
                I('sparkles', { width: 18, height: 18, fill: hue ? C.chart1 : C.artistIcon }),
              ),
              part(
                'title',
                T('Tile', {
                  fontSize: 15,
                  fontWeight: '500',
                  fill: C.artistForeground,
                  width: 'fill_container',
                  textGrowth: 'fixed-width',
                }),
              ),
              slot('right', {
                layout: 'horizontal',
                width: 'fit_content',
                gap: 8,
                alignItems: 'center',
              }),
            ]),
          ),
          slot('body'),
        ],
      ),
    )
  }
  add(tile('Tile'), tile('Tile/Hue', true))

  const text = (p, s, o = {}) =>
    part(p, T(s, { fontSize: 11, fill: C.artistTextSecondary, lineHeight: 1.5, ...o }))
  const wrap = { width: 'fill_container', textGrowth: 'fixed-width' }
  const strong = { fontSize: 12, fontWeight: '500', fill: C.artistForeground }
  const trail = () =>
    slot('trail', { layout: 'horizontal', width: 'fit_content', gap: 8, alignItems: 'center' })
  add(
    comp(
      'Row/Setting',
      Row({ name: 'Setting Row', width: 360, gap: 12, padding: [12, 0], ...paint.hairline() }, [
        Col({ name: 'Text', gap: 2, width: 'fill_container' }, [
          text('title', 'Title', { ...strong, ...wrap }),
          text('desc', 'Description', wrap),
        ]),
        trail(),
      ]),
    ),
    comp(
      'Row/Key Value',
      Row({ name: 'Key Value', width: 360, gap: 12, padding: [6, 0] }, [
        text('label', 'Label', wrap),
        text('value', 'Value', { fontSize: 12, fill: C.artistForeground }),
        trail(),
      ]),
    ),
    comp(
      'Row/Date',
      Row({ name: 'Date Row', width: 360, gap: 12, padding: [10, 0], ...paint.hairline() }, [
        Col(
          {
            name: 'Date',
            width: 44,
            height: 48,
            gap: 0,
            cornerRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
            fill: C.artistSelection,
          },
          [
            text('month', 'SEP', {
              fontSize: 9,
              fontWeight: '500',
              fill: C.artistIcon,
              letterSpacing: 0.8,
            }),
            text('day', '19', {
              fontSize: 16,
              fontWeight: '500',
              fill: C.artistForeground,
              lineHeight: 1.2,
            }),
          ],
        ),
        Col({ name: 'Text', gap: 2, width: 'fill_container' }, [
          text('title', 'Title', { ...strong, ...wrap }),
          text('meta', 'Meta', wrap),
        ]),
        trail(),
      ]),
    ),
  )
  const cells = (head) => [
    text(
      'c1',
      head ? 'RELEASE' : 'Title',
      head ? { fontSize: 9, letterSpacing: 0.8, ...wrap } : { ...strong, ...wrap },
    ),
    text('c2', head ? 'DATE' : 'Date', {
      width: 140,
      textGrowth: 'fixed-width',
      ...(head ? { fontSize: 9, letterSpacing: 0.8 } : {}),
    }),
    text('c3', head ? 'STEPS' : 'Steps', {
      width: 110,
      textGrowth: 'fixed-width',
      ...(head ? { fontSize: 9, letterSpacing: 0.8 } : {}),
    }),
  ]
  add(
    comp(
      'Table/Header',
      Row({ name: 'Table Header', width: 640, gap: 12, padding: [8, 0], ...paint.hairline() }, [
        ...cells(true),
        text('c4', 'STATUS', {
          fontSize: 9,
          letterSpacing: 0.8,
          width: 180,
          textGrowth: 'fixed-width',
        }),
      ]),
    ),
    comp(
      'Table/Row',
      Row({ name: 'Table Row', width: 640, gap: 12, padding: [12, 0], ...paint.hairline() }, [
        ...cells(false),
        /* the trail slot itself takes the 180px column, so switching it off frees the width */
        slot('trail', { layout: 'horizontal', width: 180, gap: 8, alignItems: 'center' }),
      ]),
    ),
  )
  for (const first of [true, false])
    add(
      comp(
        first ? 'Stat/First' : 'Stat',
        Col(
          {
            name: 'Stat',
            gap: 6,
            width: 'fill_container',
            ...(first ? {} : { padding: [0, 0, 0, 20], ...paint.hairline('left') }),
          },
          [
            text('value', '3', {
              fontSize: 36,
              fontWeight: '500',
              fill: C.artistForeground,
              letterSpacing: -0.7,
              lineHeight: 1,
            }),
            text('label', 'LABEL', { fontSize: 9, letterSpacing: 0.8 }),
            text('caption', 'Caption', { fontSize: 10 }),
          ],
        ),
      ),
    )
}
