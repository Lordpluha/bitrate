// Artist / Analytics (views/AnalyticsView): the hero panel with its artwork, title, Customize and the
// 7 / 28 / 90-day switch; four tiles on the 12-column grid (plays 8×6, highlights 4×6, top tracks 8×6,
// other services 4×6) and the source footnote; the daily table open, loading, error, no published
// tracks, no plays, and Customize mode on desktop.
import { pageSpec } from '../../../artist-ws/spec.mjs'
import { bento } from '../workspace/bento.mjs'
import { layoutCustomize } from '../workspace/customize.mjs'
import { pageSkeleton } from '../workspace/page-skeleton.mjs'
import { analyticsTiles } from './analytics-tiles.mjs'

const SUB = 'Plays and listeners on Bitrate, by UTC day.'
const ART = '../../../apps/web-artists/public/artwork/analytics/'

/** The analytics page spec. */
export function analyticsPage(ui, frames) {
  const { W, Tx, P, Row, Col, Btn, Tabs, fill } = ui
  const t = analyticsTiles(ui)
  const grid = bento(ui)
  const skeleton = pageSkeleton(ui)
  const TILES = [
    [
      6,
      [
        [8, 'Plays', (c, o) => t.plays(c, o.table)],
        [4, 'Highlights', (c) => t.highlights(c)],
      ],
    ],
    [
      6,
      [
        [8, 'Top tracks', (c) => t.top(c)],
        [4, 'Other services', (c) => t.sources(c)],
      ],
    ],
  ]
  const byLabel = Object.fromEntries(
    TILES.flatMap(([, cols]) => cols.map(([, label, build]) => [label, build])),
  )
  const shell = { nav: 'analytics', crumb: 'Analytics', action: 'Create release' }
  const art = (file, height) =>
    W('Artwork', {
      name: 'Artwork',
      width: 'fill_container',
      height,
      fill: { type: 'image', url: `${ART}${file}`, mode: 'cover' },
    })
  /* the hero panel holds the heading, so Customize mode swaps only its controls */
  const hero = (
    m,
    period = 1,
    controls = !m ? [Btn('Customize', 'Compact Outline', 'layout-grid')] : [],
  ) =>
    W(
      'Panel',
      { name: 'Hero', width: 'fill_container' },
      {
        content: fill(
          'Content',
          [
            art('analytics-spectrum.webp', 72),
            (m ? Col : Row)(
              {
                name: 'Heading',
                gap: 12,
                width: 'fill_container',
                ...(m ? {} : { alignItems: 'end' }),
              },
              [
                Col({ name: 'Text', gap: 4, width: 'fill_container' }, [
                  Tx('H1', 'Analytics'),
                  P('Muted', SUB),
                ]),
                Row({ name: 'Controls', gap: 12 }, [
                  ...controls,
                  Tabs(['7 days', '28 days', '90 days'], period),
                ]),
              ],
            ),
          ],
          { gap: 12 },
        ),
      },
    )
  const edit = layoutCustomize(ui, {
    title: 'Analytics',
    sub: SUB,
    rows: TILES.map(([h, cols]) => [h, cols.map(([n, label]) => [n, label])]),
    render: (label, size) => byLabel[label](size, {}),
  })
  const editHead = (o) =>
    hero(false, 1, [
      edit.heading((_t, _s, actions) => Row({ name: 'Edit controls', gap: 8 }, actions), o),
    ])
  const footnote = () =>
    P('Caption', 'Source: Bitrate playback by signed-in listeners. Read Nov 24, 2026, 06:00 UTC.')
  const page = (m, o = {}) => [
    hero(m, o.period ?? 1),
    grid(
      m,
      TILES.map(([h, cols]) => [h, cols.map(([n, , build]) => [n, (c) => build(c, o)])]),
    ),
    footnote(),
  ]
  const empty = (m, text) => [
    hero(m, 1, []),
    (m ? Col : Row)({ name: 'Empty', gap: 20, width: 'fill_container', alignItems: 'start' }, [
      W(
        'Panel',
        { name: 'No data', width: 'fill_container' },
        {
          content: fill('Content', [art('analytics-data-states.webp', 120), P('Body', text)], {
            gap: 12,
          }),
        },
      ),
      Col({ name: 'Sources', width: m ? 'fill_container' : 352 }, [t.sources({})]),
    ]),
  ]
  const desktopOnly = {
    side: 'desktop',
    reason: 'phones show the layout read-only, without Customize',
  }
  return pageSpec(
    frames,
    {
      title: 'Artist / Analytics',
      route: '/dashboard/analytics?days=7|28|90',
      context:
        'Plays and listeners on Bitrate only; other services are shown as not connected rather than zero.',
    },
    shell,
    (m) => page(m),
    [
      ['Last 7 days', shell, (m) => page(m, { period: 0 })],
      ['Daily table open', shell, (m) => page(m, { table: true })],
      ['Loading', shell, (m) => [hero(m, 1, []), ...skeleton(m)]],
      [
        'Error',
        shell,
        (m) => [
          hero(m, 1, []),
          P('Body', 'Could not load analytics. Please try again.'),
          Btn('Try again', 'Outline'),
        ],
      ],
      [
        'No published tracks',
        shell,
        (m) =>
          empty(m, 'No data yet. Analytics start once a track of yours is published on Bitrate.'),
      ],
      [
        'No plays',
        shell,
        (m) => empty(m, 'No data yet. Nobody has played your published tracks on Bitrate so far.'),
      ],
      ['Customize', shell, () => [editHead(), ...edit.canvas()], desktopOnly],
      [
        'Customize with removed blocks',
        shell,
        () => [editHead(), ...edit.canvas({ removed: ['Other services'] })],
        desktopOnly,
      ],
    ],
  )
}
