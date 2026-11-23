// The analytics tiles (views/AnalyticsView): plays with its change and the daily chart (or the daily
// table), the highlights (listeners, plays per listener, best day), top tracks with pagination and the
// other services, which are not connected. Demo figures of the 28-day period.
import { dashboardTile } from '../workspace/dashboard-tile.mjs'

const DAYS = [
  ['Nov 22', '1,100'],
  ['Nov 21', '1,210'],
  ['Nov 20', '970'],
  ['Nov 19', '1,040'],
  ['Nov 18', '860'],
  ['Nov 17', '940'],
]
const TOP = [
  ['1. Night Signal', '6,420', '2,180'],
  ['2. Echoes in Motion', '4,890', '1,640'],
  ['3. Afterglow', '3,510', '1,120'],
]

/** Analytics tile builders bound to the screen helpers `ui`. */
export function analyticsTiles(ui) {
  const { W, Tx, P, Row, inline, Btn, Stats } = ui
  const tile = dashboardTile(ui)
  const row = (c1, c2, c3) =>
    W(
      'Table/Row',
      { name: `Row / ${c1}`, width: 'fill_container' },
      { c1: { content: c1 }, c2: { content: c2 }, c3: { content: c3 }, trail: { enabled: false } },
    )
  const header = (c1) =>
    W(
      'Table/Header',
      { name: 'Header', width: 'fill_container' },
      {
        c1: { content: c1 },
        c2: { content: 'PLAYS' },
        c3: { content: 'LISTENERS' },
        c4: { enabled: false },
      },
    )
  const plays = (o, table = false) =>
    tile(
      'Plays',
      'headphones',
      [
        Stats([['Plays', '14,820', '32% vs previous period · previous 11,240']]),
        Row({ name: 'Chart head', width: 'fill_container', justifyContent: 'space_between' }, [
          Tx('Muted', table ? 'Plays per UTC day' : 'Plays per day'),
          Btn('Show as table', table ? 'Compact Outline' : 'Compact Ghost', 'table'),
        ]),
        ...(table
          ? [
              W(
                'Table/Header',
                { name: 'Header', width: 'fill_container' },
                {
                  c1: { content: 'DAY (UTC)' },
                  c2: { content: 'PLAYS' },
                  c3: { enabled: false },
                  c4: { enabled: false },
                },
              ),
              ...DAYS.map(([d, p]) =>
                W(
                  'Table/Row',
                  { name: `Day / ${d}`, width: 'fill_container' },
                  {
                    c1: { content: d },
                    c2: { content: p },
                    c3: { enabled: false },
                    trail: { enabled: false },
                  },
                ),
              ),
            ]
          : [
              W('Chart/Area', { name: 'Plays per day', width: 'fill_container' }),
              P('Caption', 'Peak 1,210 on Nov 21'),
            ]),
      ],
      o,
    )
  const hued = (icon, label, value, caption) =>
    W(
      'Stat/Hue',
      { name: `Stat / ${label}`, width: 'fill_container' },
      {
        icon: { icon },
        label: { content: label },
        value: { content: value },
        caption: { content: caption },
      },
    )
  const highlights = (o) =>
    tile(
      'Highlights',
      'sparkles',
      [
        hued('users', 'Listeners', '4,390', '22% vs previous period'),
        hued(
          'repeat',
          'Average plays per listener',
          '3.4',
          'Total plays divided by unique listeners for the selected period.',
        ),
        hued('flame', 'Best day', 'Nov 21', '1,210 plays'),
      ],
      o,
    )
  const top = (o, empty = false) =>
    tile(
      'Top tracks',
      'list-music',
      empty
        ? [P('Muted', 'No plays in this period.')]
        : [
            header('TRACK'),
            ...TOP.map(([t, p, l]) => row(t, p, l)),
            Row({ name: 'Footer', width: 'fill_container', justifyContent: 'space_between' }, [
              Tx('Muted', '1–3 of 3'),
              W('Page/Item Active', { name: 'Page 1' }),
            ]),
          ],
      o,
    )
  const sources = (o) =>
    tile(
      'Other services',
      'radio-tower',
      [
        ...['Spotify', 'Apple Music', 'YouTube Music'].map((s) =>
          W(
            'Row/Store Off',
            { name: `Source / ${s}`, width: 'fill_container' },
            {
              name: { content: s },
              plan: { content: 'Not connected' },
              trail: inline('Trail', [
                W(
                  'Status/Neutral',
                  { name: 'Not connected' },
                  { label: { content: 'Not connected' } },
                ),
              ]),
            },
          ),
        ),
        P('Caption', 'No figures are shown for services that are not connected.'),
      ],
      o,
    )
  return { plays, highlights, top, sources }
}
