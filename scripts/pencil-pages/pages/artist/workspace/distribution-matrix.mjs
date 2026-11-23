// The delivery matrix of the distribution page (views/DistributionView DeliveryMatrix): a release row
// with a status cell per store (a plain release row on a phone) inside the table panel with its footer.
import { coverFill } from './demo.mjs'

const STORES = ['Spotify', 'Apple Music', 'YouTube Music', 'Amazon Music', 'Deezer', 'TIDAL']

/** Matrix builders bound to the screen helpers `ui`; `rows` are the demo rows of distribution.mjs. */
export function distributionMatrix(ui, rows) {
  const { W, Tx, Row, fill, inline } = ui
  const row = (m, [title, cover, meta, cells]) =>
    m
      ? W(
          'Row/Release',
          { name: `Release / ${title}`, width: 'fill_container' },
          {
            cover: coverFill(cover),
            title: { content: title },
            meta: {
              content: `${meta} · ${cells.filter((c) => c !== 'Not in plan').length} of 6 planned`,
            },
            trail: { enabled: false },
          },
        )
      : W(
          'Matrix/Row',
          { name: `Release / ${title}`, width: 'fill_container' },
          {
            cover: coverFill(cover),
            title: { content: title },
            meta: { content: meta },
            cells: inline(
              'Cells',
              cells.map((c, i) => W(`Cell/${c}`, { name: `${STORES[i]} / ${c}` })),
            ),
          },
        )
  const matrix = (m, body) =>
    W(
      'Panel',
      { name: 'Delivery plan', width: 'fill_container', padding: 0 },
      {
        content: fill(
          'Content',
          body ?? [
            ...(m ? [] : [W('Matrix/Header', { name: 'Header', width: 'fill_container' })]),
            ...rows.map((r) => row(m, r)),
            Row(
              {
                name: 'Footer',
                width: 'fill_container',
                padding: [12, 16],
                justifyContent: 'space_between',
              },
              [Tx('Muted', '1–4 of 4'), W('Page/Item Active', { name: 'Page 1' })],
            ),
          ],
          { gap: 0 },
        ),
      },
    )
  return { row, matrix }
}
