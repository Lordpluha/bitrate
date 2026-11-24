// The calendar's active plans: a table on desktop, rows on a phone, each with its status and link.

/** The active plans tile for the promotion calendar. */
export function activePlans(ui, m) {
  const { W, Btn, St, Tile, Setting, TableRow } = ui
  const open = () => Btn('Open', 'Compact Ghost', 'arrow-up-right')
  return Tile(
    'Active plans',
    'calendar-range',
    m
      ? [
          Setting('Afterglow', 'Single · Sep 26 · 8 steps', St('Ready', 'Active'), open()),
          Setting('Night Signal', 'EP · Oct 17 · 11 steps', St('Ready', 'Active'), open()),
        ]
      : [
          W('Table/Header', { name: 'Table Header', width: 'fill_container' }),
          TableRow('Afterglow', 'Single · Sep 26', '8 steps', St('Ready', 'Active'), open()),
          TableRow('Night Signal', 'EP · Oct 17', '11 steps', St('Ready', 'Active'), open()),
        ],
  )
}
