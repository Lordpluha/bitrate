// Customize mode of a workspace page (features/workspace-layout CustomizeControls, LayoutGrid,
// TileDrawer, FreeGridCanvas): Reset / Cancel / Done in the heading (the save error beside them), the
// edit bar with its hint and "Pull up", the full-width "Add a block" strip, then every placed tile with
// its real content (inert) inside the move / remove / resize frame. Desktop only: phones show the
// layout read-only. `cfg = { title, sub, rows: [[h, [[span, label], …]], …], render(label, size) }`.

const ROW = 64
const GAP = 20

/** Customize-mode builders bound to the screen helpers `ui` and the page layout `cfg`. */
export function layoutCustomize(ui, cfg) {
  const { W, P, Row, Col, fill, Btn, Tx } = ui
  const heading = (pageHead, { saving = false, error = false } = {}) =>
    pageHead(cfg.title, cfg.sub, [
      ...(error ? [Tx('Error', 'Your layout could not be saved. Try again.')] : []),
      Btn('Reset to default', 'Compact Ghost', 'rotate-ccw'),
      Btn('Cancel', 'Compact Outline'),
      Btn(saving ? 'Saving…' : 'Done', 'Compact Primary', 'check'),
    ])
  const block =
    (h) =>
    ([n, label]) => {
      const width = 93 * n - GAP
      return W(
        'Tile/Edit',
        { name: `Edit / ${label}`, width },
        {
          body: fill(
            'Body',
            [cfg.render(label, { width: width - 12, height: ROW * h + GAP * (h - 1) - 58 })],
            { gap: 0 },
          ),
        },
      )
    }
  const canvas = ({ removed = [] } = {}) => [
    Row({ name: 'Edit bar', gap: 12, width: 'fill_container' }, [
      P(
        'Muted',
        'Drag a block anywhere. Drag any edge or corner to resize it. Done saves your layout.',
      ),
      Btn('Pull up', 'Compact Outline', 'arrow-up-to-line'),
    ]),
    W(
      'Drawer/Tiles',
      { name: 'Tile Drawer', width: 'fill_container' },
      {
        items: fill(
          'Items',
          removed.length
            ? removed.map((label) =>
                W('Drawer/Item', { name: `Add / ${label}` }, { label: { content: label } }),
              )
            : [P('Muted', 'Every block is on the page. Remove one with × and it appears here.')],
          { layout: 'horizontal', gap: 8 },
        ),
      },
    ),
    Col(
      { name: 'Canvas', gap: GAP, width: 'fill_container' },
      cfg.rows
        .map(([h, cols]) => [h, cols.filter(([, label]) => !removed.includes(label))])
        .filter(([, cols]) => cols.length)
        .map(([h, cols], i) =>
          Row({ name: `Row ${i + 1}`, gap: GAP, alignItems: 'start' }, cols.map(block(h))),
        ),
    ),
  ]
  return { canvas, heading }
}
