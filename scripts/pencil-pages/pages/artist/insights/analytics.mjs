// Artist / Analytics (views/AnalyticsView): the period switch (7, 28, 90 days) and Customize in the
// heading, four tiles on the 12-column grid (plays 8×6, highlights 4×6, top tracks 8×6, other
// services 4×6) and the source footnote; the daily table, loading, error, no published tracks, no
// plays, and Customize mode on desktop.
import { pageSpec } from '../../../artist-ws/spec.mjs'
import { bento } from '../workspace/bento.mjs'
import { layoutCustomize } from '../workspace/customize.mjs'
import { analyticsTiles } from './analytics-tiles.mjs'

const SUB = 'Plays and listeners on Bitrate, by UTC day.'
const LAYOUT = [
  [
    [8, 'Plays'],
    [4, 'Highlights'],
  ],
  [
    [8, 'Top tracks'],
    [4, 'Other services'],
  ],
]

/** The analytics page spec. */
export function analyticsPage(ui, frames) {
  const { W, P, Row, Btn, Tabs } = ui
  const { pageHead } = frames
  const t = analyticsTiles(ui)
  const grid = bento(ui)
  const edit = layoutCustomize(ui, { title: 'Analytics', sub: SUB, rows: LAYOUT })
  const shell = { nav: 'analytics', crumb: 'Analytics', action: 'Create release' }
  const head = (m, customize = true) =>
    pageHead(
      'Analytics',
      SUB,
      customize && !m ? [Btn('Customize', 'Compact Outline', 'layout-grid')] : [],
    )
  const period = (active = 1) =>
    Row({ name: 'Period', width: 'fill_container' }, [
      Tabs(['7 days', '28 days', '90 days'], active),
    ])
  const footnote = () =>
    P('Caption', 'Source: Bitrate playback by signed-in listeners. Read Nov 23, 2026, 06:00 UTC.')
  const tiles = (m, o = {}) =>
    grid(m, [
      [
        6,
        [
          [8, (c) => t.plays(c, o.table)],
          [4, (c) => t.highlights(c)],
        ],
      ],
      [
        6,
        [
          [8, (c) => t.top(c)],
          [4, (c) => t.sources(c)],
        ],
      ],
    ])
  const page = (m, o = {}) => [head(m), period(o.period), tiles(m, o), footnote()]
  const empty = (m, text) => [
    head(m, false),
    period(),
    W(
      'State/Empty',
      { name: 'No data', width: 'fill_container' },
      {
        icon: { icon: 'bar-chart-3' },
        title: { content: 'No data yet.' },
        body: m ? { content: text, width: 'fill_container' } : { content: text },
        action: { enabled: false },
      },
    ),
    t.sources({}),
  ]
  const desktopOnly = {
    side: 'desktop',
    reason: 'phones show the layout read-only, without Customize',
  }
  return pageSpec(
    frames,
    {
      title: 'Artist / Analytics',
      route: '/dashboard/analytics?period=7|28|90',
      context:
        'Plays and listeners on Bitrate only; other services are shown as not connected rather than zero.',
    },
    shell,
    (m) => page(m),
    [
      ['Last 7 days', shell, (m) => page(m, { period: 0 })],
      ['Plays as table', shell, (m) => page(m, { table: true })],
      [
        'Loading',
        shell,
        (m) => [
          head(m, false),
          period(),
          P('Muted', 'Loading analytics…'),
          ...[1, 2].map((i) =>
            W('Skeleton/Tile', { name: `Skeleton ${i}`, width: 'fill_container' }),
          ),
        ],
      ],
      [
        'Error',
        shell,
        (m) => [
          head(m, false),
          period(),
          P('Body', 'Could not load analytics. Please try again.'),
          Btn('Try again', 'Outline', 'refresh-cw'),
        ],
      ],
      [
        'No published tracks',
        shell,
        (m) => empty(m, 'Analytics start once a track of yours is published on Bitrate.'),
      ],
      [
        'No plays',
        shell,
        (m) => empty(m, 'Nobody has played your published tracks on Bitrate so far.'),
      ],
      ['Customize', shell, () => [edit.heading(pageHead), ...edit.canvas()], desktopOnly],
      [
        'Customize with removed blocks',
        shell,
        () => [edit.heading(pageHead), ...edit.canvas({ removed: ['Other services'] })],
        desktopOnly,
      ],
    ],
  )
}
