// Customize mode of a workspace page (features/workspace-layout: CustomizeControls, FreeGridCanvas,
// TileDrawer): the heading controls, the editing hint, every placed block with its handle, remove and
// resize corner, and the "Add a block" drawer with the removed blocks. Desktop only: phones show the
// layout read-only. `cfg = { title, sub, rows: [[[span, label], …], …] }` is the page's default layout.

/** Customize-mode builders bound to the screen helpers `ui` and the page layout `cfg`. */
export function layoutCustomize(ui, cfg) {
  const { W, P, Row, Col, fill, Btn } = ui
  /* the canvas beside the 280px drawer: 776px wide, columns scaled to it */
  const width = (n) => Math.round(((776 + 20) * n) / 12 - 20)
  const controls = ({ saving = false } = {}) => [
    Btn('Reset to default', 'Compact Ghost', 'rotate-ccw'),
    Btn('Cancel', 'Compact Outline'),
    Btn(saving ? 'Saving…' : 'Done', 'Compact Primary', saving ? 'loader-circle' : 'check'),
  ]
  const note = (tone, text) =>
    W(
      `Alert/${tone}`,
      { name: `Alert / ${tone}`, width: 'fill_container' },
      {
        title: { content: text },
        body: { enabled: false },
        action: { enabled: false },
      },
    )
  const block = ([n, title]) =>
    W(
      'Tile/Edit',
      { name: `Edit / ${title}`, width: width(n) },
      {
        title: { content: title },
        body: fill(
          'Body',
          [P('Muted', 'Arrow keys move the block. Shift + arrow keys resize it.')],
          { gap: 8 },
        ),
      },
    )
  const drawer = (removed) =>
    W(
      'Drawer/Tiles',
      { name: 'Tile Drawer' },
      {
        items: fill(
          'Items',
          removed.length
            ? removed.map((label) =>
                W(
                  'Drawer/Item',
                  { name: `Add / ${label}`, width: 'fill_container' },
                  { label: { content: label } },
                ),
              )
            : [P('Muted', 'Every block is on the page. Remove one with × and it appears here.')],
          { gap: 8 },
        ),
      },
    )
  const canvas = ({ error = false, removed = [] } = {}) => [
    ...(error ? [note('Error', 'Your layout could not be saved. Try again.')] : []),
    note(
      'Info',
      'Drag a block anywhere. Drag any edge or corner to resize it. Done saves your layout.',
    ),
    Row({ name: 'Editor', gap: 20, width: 'fill_container', alignItems: 'start' }, [
      Col(
        { name: 'Canvas', gap: 20, width: 776 },
        cfg.rows
          .map((cols) => cols.filter(([, label]) => !removed.includes(label)))
          .filter((cols) => cols.length)
          .map((cols, i) => Row({ name: `Row ${i + 1}`, gap: 20 }, cols.map(block))),
      ),
      drawer(removed),
    ]),
  ]
  const heading = (pageHead, o) => pageHead(cfg.title, cfg.sub, controls(o))
  return { canvas, heading }
}
