// The delivery matrix of the distribution page (views/DistributionView DeliveryMatrix): the "Delivery
// plan" panel with the store heads, a row per release (cover, title, status · territories · sent state)
// with an icon per store (store name beside it on a phone), and the legend of the states shown.
import { coverFill } from './demo.mjs'

const STORES = ['Spotify', 'Apple Music', 'YouTube Music', 'Amazon Music', 'Deezer', 'TIDAL']

/** Matrix builder bound to the screen helpers `ui`: `(m, rows) → panel`. */
export function distributionMatrix(ui) {
  const { W, Tx, Row, Col, fill, inline, St } = ui
  const meta = ([tone, status], territories, sent) =>
    inline('Meta', [St(tone, status), Tx('Caption', `${territories} · ${sent}`)])
  const cell = (state, i, m) =>
    W(
      `Cell/${state}`,
      { name: `${STORES[i]} / ${state}` },
      m ? { label: { content: STORES[i] } } : { label: { enabled: false } },
    )
  const row =
    (m) =>
    ([title, cover, status, territories, sent, cells]) =>
      m
        ? Col({ name: `Release / ${title}`, gap: 8, width: 'fill_container', padding: [10, 12] }, [
            W(
              'Row/Release',
              { name: 'Release', width: 'fill_container' },
              {
                cover: coverFill(cover),
                title: { content: title },
                meta: { content: `${status[1]} · ${territories} · ${sent}` },
                trail: { enabled: false },
              },
            ),
            ...[cells.slice(0, 3), cells.slice(3)].map((part, r) =>
              Row(
                { name: `Stores ${r + 1}`, gap: 6 },
                part.map((s, i) => cell(s, i + r * 3, true)),
              ),
            ),
          ])
        : W(
            'Matrix/Row',
            { name: `Release / ${title}`, width: 'fill_container' },
            {
              cover: coverFill(cover),
              title: { content: title },
              meta: meta(status, territories, sent),
              cells: inline(
                'Cells',
                cells.map((s, i) => cell(s, i, false)),
              ),
            },
          )
  /* the legend wraps: two cells per line on a phone, one line on desktop */
  const legend = (m, states) => {
    const cellsOf = (list) => list.map((s) => W(`Cell/${s}`, { name: `Legend / ${s}` }))
    if (!m) return Row({ name: 'Legend', gap: 6 }, cellsOf(states))
    const lines = []
    for (let i = 0; i < states.length; i += 2) lines.push(states.slice(i, i + 2))
    return Col(
      { name: 'Legend', gap: 6 },
      lines.map((line, i) => Row({ name: `Legend line ${i + 1}`, gap: 6 }, cellsOf(line))),
    )
  }
  return (m, rows) => {
    const shown = [...new Set(rows.flatMap((r) => r[5]))].filter((s) => s !== 'Not in plan')
    return W(
      'Tile',
      { name: 'Delivery plan', width: 'fill_container' },
      {
        icon: { icon: 'send' },
        title: { content: 'Delivery plan' },
        right: { enabled: false },
        body: fill(
          'Body',
          [
            ...(m ? [] : [W('Matrix/Header', { name: 'Header', width: 'fill_container' })]),
            ...rows.map(row(m)),
            legend(m, [...shown, 'Not in plan']),
          ],
          { gap: 0 },
        ),
      },
    )
  }
}
