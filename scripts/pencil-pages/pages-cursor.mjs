// Signal cursor: one custom cursor across the landing and the app (fine pointers); touch uses the press ripple.
import { R, Row, Col, Tx, Panel, SettingRow, Blank, state, Badge } from './ui.mjs'

const C = (name, o = {}, parts) => R(`Cursor/${name}`, o, parts)
const ROWS = [
  ['Default', 'Dot follows the pointer exactly; the ring trails it on a spring.', C('Default')],
  [
    'Interactive',
    'Links and buttons: the ring opens over the target and leans toward its centre.',
    C('Hover'),
  ],
  ['Play', 'Covers, video thumbnails, play buttons: the ring becomes a Play pill.', C('Play')],
  ['Drag', 'Partner spheres, the team pit, reorderable rows.', C('Drag')],
  ['Text', 'Inputs and the search: a thin accent beam; the native caret still types.', C('Text')],
  ['Scrub', 'Seek bars and timelines: a line with the time under the pointer.', C('Scrub')],
  ['Loading', 'While a navigation or action is pending.', C('Loading')],
  ['Pressed', 'Pointer down: the ring tightens.', C('Pressed')],
  ['Disabled', 'Disabled controls: muted ring with a stop sign.', C('Disabled')],
  [
    'Listening',
    'While music plays: five bars inside the ring pulse with the real audio level.',
    C('Listening'),
  ],
]
const board = (rows, w) =>
  Panel(
    [
      Tx('H4', 'Signal cursor'),
      Tx('Muted', 'Pointer devices only. Reduced motion removes the trailing spring.'),
      ...rows.map(([t, d, c]) => SettingRow(t, d, c)),
    ],
    { width: w },
  )

export const cursor = {
  title: 'Cursor',
  route: 'system — custom cursor for the landing and the app',
  context:
    'One Signal cursor everywhere on fine pointers: default, interactive, play, drag, text, scrub, loading, pressed, disabled and listening states. Touch devices keep the system behaviour and get the press ripple.',
  desktop: () =>
    Blank('Cursor', 1440, 900, [
      Row({ name: 'Boards', gap: 32, alignItems: 'start' }, [
        board(ROWS.slice(0, 5), 560),
        board(ROWS.slice(5), 560),
      ]),
    ]),
  mobile: () =>
    Blank('Touch', 390, 844, [
      Col({ name: 'Touch', gap: 16, alignItems: 'center', width: 'fill_container' }, [
        C('Touch Ripple'),
        Tx('H4', 'Touch: press ripple'),
        Tx(
          'Paragraph',
          'No custom cursor on touch screens. A press shows a short ripple; long-press opens tooltips.',
          { wrap: true, textAlign: 'center' },
        ),
        Badge('pointer: coarse', 'outline'),
      ]),
    ]),
  states: [
    state(
      'Listening',
      () =>
        Blank('Listening', 1440, 900, [
          board(ROWS.slice(9), 560),
          Tx('Caption', 'Bars follow the analyser level of the playing track.'),
        ]),
      null,
      'touch devices show no cursor',
    ),
  ],
}
