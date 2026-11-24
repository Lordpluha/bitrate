// The 12-column workspace grid for tiles with a height (features/workspace-layout: 64px rows, 20px
// gaps, 73px columns in the 1096px content area). Phones stack the tiles in one column at their own
// height, in reading order.

const ROW = 64
const GAP = 20
/** Width of `n` columns and height of `h` rows. */
const cell = (n, h) => ({ width: 93 * n - GAP, height: ROW * h + GAP * (h - 1) })

/** `rows = [[h, [[span, build], …]], …]`; `build(o, m)` gets the cell size (empty on a phone). */
export function bento(ui) {
  const { Row, Col } = ui
  return (m, rows) =>
    m
      ? rows.flatMap(([, cols]) => cols.map(([, build]) => build({}, true)))
      : Col(
          { name: 'Bento', gap: GAP, width: 'fill_container' },
          rows.map(([h, cols], i) =>
            Row(
              {
                name: `Bento Row ${i + 1}`,
                gap: GAP,
                width: 'fill_container',
                alignItems: 'start',
              },
              cols.map(([n, build]) => build(cell(n, h), false)),
            ),
          ),
        )
}
