// Data pieces of the public pages: the person row (contributor with roles and share, LandingCredits) and
// the area chart of plays per day (the 28-day demo curve of views/ArtistView/lib/listeningPreview.ts).
import { C, Col, id, Row, T } from '../kit.mjs'
import { artistPaint } from './paint.mjs'

const CLEAR = '#7C3AED00'
/* the 28-day demo plays of views/ArtistView/lib/listeningPreview.ts */
const MONTH = [
  260, 305, 285, 420, 330, 500, 450, 340, 430, 610, 570, 490, 650, 590, 570, 760, 640, 780, 730,
  900, 840, 790, 940, 860, 1040, 970, 1210, 1100,
]
const CW = 640
const CH = 200

const curve = () => {
  const top = 1300
  return MONTH.map((v, i) => {
    const x = Math.round((i / (MONTH.length - 1)) * CW)
    const y = Math.round(CH - (v / top) * CH)
    return `${i ? 'L' : 'M'}${x} ${y}`
  }).join(' ')
}

/** Adds the person row and the area chart to the library. */
export function addData(lib) {
  const { comp, part, add, use, nest } = lib
  const paint = artistPaint()
  for (const selected of [false, true])
    add(
      comp(
        `Row/Person${selected ? ' Selected' : ''}`,
        Row(
          {
            name: 'Person',
            width: 360,
            gap: 12,
            padding: [10, 12],
            cornerRadius: 10,
            ...(selected
              ? { fill: C.artistSelection, stroke: C.artistSelectionBorder, strokeWidth: 1 }
              : {}),
          },
          [
            part('avatar', use('Avatar', { name: 'Avatar' })),
            Col({ name: 'Text', gap: 2, width: 'fill_container' }, [
              part(
                'name',
                T('Mira Sol', { fontSize: 13, fontWeight: '500', fill: C.artistForeground }),
              ),
              part(
                'meta',
                T('Performer · Producer', { fontSize: 11, fill: C.artistTextSecondary }),
              ),
            ]),
            part('share', T('75%', { fontSize: 15, fontWeight: '500', fill: C.artistForeground })),
          ],
        ),
      ),
    )
  for (const k of ['Row/Person', 'Row/Person Selected']) nest(k, 'avatar', 'Avatar')
  const line = curve()
  const path = (name, geometry, o) => ({
    type: 'path',
    id: id(),
    name,
    width: 'fill_container',
    height: CH,
    viewBox: [0, 0, CW, CH],
    geometry,
    ...o,
  })
  add(
    comp(
      'Chart/Area',
      Col({ name: 'Area Chart', width: CW, height: CH, gap: -CH, clip: true }, [
        path('Area', `${line} L${CW} ${CH} L0 ${CH} Z`, {
          fill: paint.linear(
            180,
            [
              [C.chart1, 0],
              [CLEAR, 1],
            ],
            0.35,
          ),
        }),
        path('Line', line, { stroke: C.chart1, strokeWidth: 2, strokeLinejoin: 'round' }),
      ]),
    ),
  )
}
