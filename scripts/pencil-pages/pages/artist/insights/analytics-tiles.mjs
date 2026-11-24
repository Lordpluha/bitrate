// The analytics tiles (views/AnalyticsView): plays with its change and the daily chart (peak marked in
// the chart, "Show as table" below it, open or closed), the highlights (listeners, plays per listener,
// best day), top tracks with pagination and the other services, which are not connected.
import { dashboardTile } from '../workspace/dashboard-tile.mjs'

const DAYS = [
  ['Nov 22', '1,100'],
  ['Nov 21', '1,210'],
  ['Nov 20', '970'],
  ['Nov 19', '1,040'],
]
const TOP = [
  ['1. Night Signal', '6,420', '2,180'],
  ['2. Echoes in Motion', '4,890', '1,640'],
  ['3. Afterglow', '3,510', '1,120'],
]

/** Analytics tile builders bound to the screen helpers `ui`. */
export function analyticsTiles(ui) {
  const { W, Tx, P, Row, Col, inline } = ui
  const tile = dashboardTile(ui)
  const tableRow = (name, cells) =>
    W(
      'Table/Row',
      { name, width: 'fill_container' },
      {
        c1: { content: cells[0] },
        c2: { content: cells[1] },
        c3: cells[2] ? { content: cells[2] } : { enabled: false },
        trail: { enabled: false },
      },
    )
  const plays = (c, table = false) =>
    tile(
      'Plays',
      'headphones',
      [
        W(
          'Stat/First',
          { name: 'Plays' },
          {
            label: { content: 'Plays' },
            value: { content: '14,820' },
            caption: { content: '32% vs previous period' },
          },
        ),
        Col({ name: 'Chart', gap: 4, width: 'fill_container' }, [
          /* the peak label sits over the curve at the 26th of 28 days (PlaysChart .artist-analytics-peak) */
          Row(
            {
              name: 'Peak',
              width: 'fill_container',
              padding: [0, 0, 0, c.width ? Math.round((c.width - 36) * 0.86) : 230],
            },
            [
              W(
                'Status/Brand',
                { name: 'Peak' },
                { label: { content: '1,210' }, icon: { icon: 'triangle' } },
              ),
            ],
          ),
          W('Chart/Area', { name: 'Plays per day', width: 'fill_container' }),
          Row({ name: 'Axis', width: 'fill_container', justifyContent: 'space_between' }, [
            Tx('Caption', 'Oct 26'),
            Tx('Caption', 'Nov 22'),
          ]),
        ]),
        Tx('Link', 'Show as table'),
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
              ...DAYS.map((d) => tableRow(`Day / ${d[0]}`, d)),
            ]
          : []),
      ],
      c,
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
  const highlights = (c) =>
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
      c,
    )
  const top = (c) =>
    tile(
      'Top tracks',
      'list-music',
      [
        W(
          'Table/Header',
          { name: 'Header', width: 'fill_container' },
          {
            c1: { content: 'TRACK' },
            c2: { content: 'PLAYS' },
            c3: { content: 'LISTENERS' },
            c4: { enabled: false },
          },
        ),
        ...TOP.map((r) => tableRow(`Top / ${r[0]}`, r)),
        Row({ name: 'Footer', width: 'fill_container', justifyContent: 'space_between' }, [
          Tx('Muted', '1–3 of 3'),
          W('Page/Item Active', { name: 'Page 1' }),
        ]),
      ],
      c,
    )
  const sources = (c) =>
    tile(
      'Other services',
      'radio-tower',
      [
        ...['Spotify', 'Apple Music', 'YouTube Music'].map((s) =>
          W(
            'Row/Key Value',
            { name: `Source / ${s}`, width: 'fill_container' },
            {
              label: { content: s },
              value: { enabled: false },
              trail: inline('Trail', [
                W(
                  'Status/Warning',
                  { name: 'Not connected' },
                  { label: { content: 'Not connected' }, icon: { icon: 'radio' } },
                ),
              ]),
            },
          ),
        ),
        P('Caption', 'No figures are shown for services that are not connected.'),
      ],
      c,
    )
  return { plays, highlights, top, sources }
}
