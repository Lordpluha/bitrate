// The dashboard's work tiles (widgets/DashboardOverview/ui): current release (or none, or no master
// yet, or published), needs attention with its artwork, your catalogue (numbers, share bar legend and
// the cover fan) and next premiere. Each builder takes the tile's frame size (`c`) and `m` for phones.
import { dashboardTile } from './dashboard-tile.mjs'
import { coverFill } from './demo.mjs'

const ART = '../../../apps/web-artists/public/artwork/dashboard/'
const SHARES = [
  ['Live', '1'],
  ['In review', '1'],
  ['Drafts', '1'],
  ['Other', '1'],
]

/** Work tile builders bound to the screen helpers `ui`. */
export function dashboardTiles(ui) {
  const { W, Tx, P, Row, Col, inline, St, Btn } = ui
  const tile = dashboardTile(ui)
  const art = (file) =>
    W('Artwork', {
      name: 'Artwork',
      width: 'fill_container',
      height: 96,
      fill: { type: 'image', url: `${ART}${file}`, mode: 'cover' },
    })
  /* `o.none` no release in progress, `o.noMaster` no lead track yet, `o.published` a released one */
  const current = (c, m, o = {}) =>
    o.none
      ? tile('Current release', 'disc-3', [P('Body', 'No release in progress.')], c)
      : W(
          'Tile',
          { name: 'Tile / Current release', width: 'fill_container', ...c },
          {
            head: { enabled: false },
            body: ui.fill(
              'Body',
              [
                Row({ name: 'Release', width: 'fill_container', gap: 18, alignItems: 'start' }, [
                  W(m ? 'Cover' : 'Cover/Large', { name: 'Cover', ...coverFill('night-signal') }),
                  Col({ name: 'Identity', gap: 6, width: 'fill_container' }, [
                    Row({ name: 'Title Row', width: 'fill_container', gap: 8 }, [
                      Tx('H1', 'Night Signal', {
                        width: 'fill_container',
                        textGrowth: 'fixed-width',
                      }),
                      o.published ? St('Ready', 'Released') : St('Neutral', 'Draft'),
                    ]),
                    Tx('Muted', 'Single · Planned Dec 12, 2026'),
                    o.noMaster
                      ? P('Muted', 'Upload a master to hear it here.')
                      : W('Player/Track', { name: 'Track Player', width: 'fill_container' }),
                  ]),
                ]),
                Row({ name: 'Next', width: 'fill_container', gap: 18, alignItems: 'start' }, [
                  W(
                    'Ring/Stage',
                    { name: 'Stage Ring' },
                    o.published ? { label: { content: 'Launch' } } : {},
                  ),
                  Col({ name: 'Step', gap: 8, width: 'fill_container' }, [
                    Tx(
                      'H2',
                      o.published
                        ? 'Your release is live on Bitrate'
                        : 'Finish preparing the release',
                    ),
                    P(
                      'Muted',
                      o.published
                        ? 'Share it and follow the first signals.'
                        : '2 steps left before Bitrate review.',
                    ),
                    ...(o.published ? [] : [W('Countdown', { name: 'Countdown' })]),
                    (m ? Col : Row)(
                      { name: 'Action', gap: 12, alignItems: m ? 'start' : 'center' },
                      [
                        Btn(
                          o.published ? 'Open release' : 'Continue release',
                          'Primary',
                          'arrow-right',
                        ),
                        Tx(
                          'Caption',
                          o.published
                            ? 'Published on Bitrate'
                            : 'Draft saved · Nothing is published yet',
                        ),
                      ],
                    ),
                  ]),
                ]),
              ],
              { gap: 16 },
            ),
          },
        )
  const attention = (c, items = true) =>
    tile(
      'Needs attention',
      'circle-alert',
      [
        art('mastering-console.webp'),
        ...(items
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
          : [P('Body', 'All clear. Nothing needs your attention.')]),
      ],
      c,
      [Tx('H3', items ? '2' : '0')],
    )
  const numbers = (c) =>
    tile(
      'Your catalogue',
      'hash',
      [
        Row({ name: 'Numbers', gap: 20, width: 'fill_container', alignItems: 'start' }, [
          Col({ name: 'Figures', gap: 12, width: 'fill_container' }, [
            Row(
              { name: 'Counts', gap: 32 },
              [
                ['Releases', '4'],
                ['Tracks', '6'],
              ].map(([label, value]) =>
                W(
                  'Stat/First',
                  { name: `Stat / ${label}` },
                  {
                    label: { content: label },
                    value: { content: value },
                    caption: { enabled: false },
                  },
                ),
              ),
            ),
            W(
              'Share/Bar',
              { name: 'Share', width: 'fill_container' },
              { review: { width: 90 }, drafts: { width: 90 }, other: { width: 90 } },
            ),
            Row(
              { name: 'Legend', gap: 14 },
              SHARES.map(([label, count]) => Tx('Caption', `${label} ${count}`)),
            ),
          ]),
          Row(
            { name: 'Cover fan', gap: -18 },
            ['night-signal', 'echoes-in-motion', 'afterglow', 'static-lines'].map((f) =>
              W('Cover', { name: `Fan / ${f}`, ...coverFill(f) }),
            ),
          ),
        ]),
      ],
      c,
    )
  const premiere = (c, planned = true) =>
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
                meta: { content: 'Sat, Dec 12, 18:00 UTC' },
                trail: inline('Trail', [St('Ready', 'Scheduled')]),
              },
            ),
            W('Countdown', { name: 'Countdown' }),
          ]
        : [P('Body', 'No release date is planned. Pick one in a release to start the countdown.')],
      c,
    )
  return { current, attention, numbers, premiere }
}
