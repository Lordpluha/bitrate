// The dashboard's work tiles (widgets/DashboardOverview/ui): current release, needs attention, your
// catalogue and next premiere; each builder takes the tile's frame size (`o`: width/height on the
// grid, or nothing on a phone). The list tiles are in dashboard-lists.mjs.
import { dashboardTile } from './dashboard-tile.mjs'
import { coverFill } from './demo.mjs'

/** Work tile builders bound to the screen helpers `ui`. */
export function dashboardTiles(ui) {
  const { W, Tx, P, Row, Col, fill, inline, St, Btn, Stats } = ui
  const tile = dashboardTile(ui)
  const current = (o, m) =>
    W(
      'Tile',
      { name: 'Tile / Current release', width: 'fill_container', ...o },
      {
        head: { enabled: false },
        body: fill(
          'Body',
          [
            Row({ name: 'Release', width: 'fill_container', gap: 18, alignItems: 'start' }, [
              W(m ? 'Cover' : 'Cover/Large', { name: 'Cover', ...coverFill('night-signal') }),
              Col({ name: 'Identity', gap: 6, width: 'fill_container' }, [
                Row({ name: 'Title Row', width: 'fill_container', gap: 8 }, [
                  Tx('H1', 'Night Signal', { width: 'fill_container', textGrowth: 'fixed-width' }),
                  St('Neutral', 'Draft'),
                ]),
                Tx('Muted', 'Single · Planned Nov 14, 2026'),
                ...(m
                  ? []
                  : [W('Player/Track', { name: 'Track Player', width: 'fill_container' })]),
              ]),
            ]),
            ...(m ? [W('Player/Track', { name: 'Track Player', width: 'fill_container' })] : []),
            W('Divider', { name: 'Divider', width: 'fill_container' }),
            Row({ name: 'Next', width: 'fill_container', gap: 18, alignItems: 'start' }, [
              W('Ring/Stage', { name: 'Stage Ring' }),
              Col({ name: 'Step', gap: 8, width: 'fill_container' }, [
                Tx('H2', 'Finish preparing the release'),
                P('Muted', '2 steps left before Bitrate review.'),
                W('Countdown', { name: 'Countdown' }),
                (m ? Col : Row)({ name: 'Action', gap: 12, alignItems: m ? 'start' : 'center' }, [
                  Btn('Continue release', 'Primary', 'arrow-right'),
                  Tx('Caption', 'Draft saved · Nothing is published yet'),
                ]),
              ]),
            ]),
          ],
          { gap: 16 },
        ),
      },
    )
  const attention = (o, items = true) =>
    tile(
      'Needs attention',
      'circle-alert',
      items
        ? [
            W('Row/Attention', { name: 'Attention / blockers', width: 'fill_container' }),
            W(
              'Row/Attention',
              { name: 'Attention / changes', width: 'fill_container' },
              {
                title: { content: 'Echoes in Motion needs changes after review' },
                meta: { content: 'See review feedback' },
              },
            ),
          ]
        : [P('Muted', 'All clear. Nothing needs your attention.')],
      o,
      [Tx('H3', items ? '2' : '0')],
    )
  const numbers = (o) =>
    tile(
      'Your catalogue',
      'hash',
      [
        Stats([
          ['Releases', '4', 'Live 1 · In review 1 · Drafts 1 · Other 1'],
          ['Tracks', '6', 'Across 4 releases'],
        ]),
        W(
          'Share/Bar',
          { name: 'Share', width: 'fill_container' },
          { review: { width: 120 }, drafts: { width: 120 } },
        ),
      ],
      o,
    )
  const premiere = (o, planned = true) =>
    tile(
      'Next premiere',
      'timer',
      planned
        ? [
            W(
              'Row/Release',
              { name: 'Premiere / Static Lines', width: 'fill_container' },
              {
                cover: coverFill('static-lines'),
                title: { content: 'Static Lines' },
                meta: { content: 'Sat, Nov 28, 00:00 UTC' },
                trail: inline('Trail', [St('Ready', 'Scheduled')]),
              },
            ),
            W('Countdown', { name: 'Countdown' }),
          ]
        : [P('Muted', 'No release date is planned. Pick one in a release to start the countdown.')],
      o,
    )
  return { current, attention, numbers, premiere }
}
