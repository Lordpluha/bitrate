// Artist / Distribution (views/DistributionView + DeliveryMatrix): every release's delivery plan across
// the six stores, with the no-partner banner (Your plan → Partner → Stores) and pagination; table
// skeleton, error and the empty catalogue with "Open Music".
import { pageSpec } from '../../../artist-ws/spec.mjs'
import { distributionMatrix } from './distribution-matrix.mjs'

/* [title, cover, territories · state, store cells] */
const ROWS = [
  [
    'Night Signal',
    'night-signal',
    'Worldwide · Not sent',
    ['Not sent', 'Not sent', 'Not sent', 'Not in plan', 'Not sent', 'Not in plan'],
  ],
  [
    'Echoes in Motion',
    'echoes-in-motion',
    '2 countries · Not sent',
    ['Not sent', 'Not sent', 'Not in plan', 'Not in plan', 'Not in plan', 'Not in plan'],
  ],
  [
    'Afterglow',
    'afterglow',
    'Worldwide · No stores planned',
    ['Not in plan', 'Not in plan', 'Not in plan', 'Not in plan', 'Not in plan', 'Not in plan'],
  ],
  [
    'Static Lines',
    'static-lines',
    'Worldwide · Not sent',
    ['Not sent', 'Not sent', 'Not sent', 'Not sent', 'Not sent', 'Not sent'],
  ],
]

/** The distribution page spec. */
export function distributionPage(ui, frames) {
  const { W, Tx, P, Row, Col, fill, Btn } = ui
  const { pageHead } = frames
  const shell = { nav: 'distribution', crumb: 'Distribution', action: 'Create release' }
  const head = () =>
    pageHead('Distribution', 'Where your releases are planned to go, and what stores report back.')
  const flow = (m) =>
    (m ? Col : Row)({ name: 'Flow', gap: 8, alignItems: m ? 'start' : 'center' }, [
      W('Flow/Step Done', { name: 'Your plan' }, { label: { content: 'Your plan' } }),
      W('Flow/Step', { name: 'Partner' }, { label: { content: 'Partner' } }),
      W('Flow/Step', { name: 'Stores' }, { label: { content: 'Stores' } }),
    ])
  const banner = (m) =>
    W(
      'Tile',
      { name: 'Tile / No partner', width: 'fill_container' },
      {
        icon: { icon: 'unplug' },
        title: { content: 'No distribution partner yet' },
        right: { enabled: false },
        body: fill('Body', [
          P(
            'Muted',
            'No distribution partner is connected yet, so nothing has been sent to a streaming service. You can already plan stores and territories; delivery starts once a partner is connected.',
          ),
          flow(m),
        ]),
      },
    )
  const { row, matrix } = distributionMatrix(ui, ROWS)
  const inside = (nodes) => [
    Col(
      { name: 'State', gap: 14, width: 'fill_container', padding: [40, 24], alignItems: 'start' },
      nodes,
    ),
  ]
  return pageSpec(
    frames,
    {
      title: 'Artist / Distribution',
      route: '/dashboard/distribution',
      context:
        'Plans only: no distribution partner is connected, so every store reads Not sent or Not in the plan. Each row opens the release on Deliver.',
    },
    shell,
    (m) => [head(), banner(m), matrix(m)],
    [
      [
        'Second page',
        shell,
        (m) => [
          head(),
          banner(m),
          matrix(m, [
            ...(m ? [] : [W('Matrix/Header', { name: 'Header', width: 'fill_container' })]),
            ...ROWS.slice(0, 2).map((r) => row(m, r)),
            Row(
              {
                name: 'Footer',
                width: 'fill_container',
                padding: [12, 16],
                justifyContent: 'space_between',
              },
              [
                Tx('Muted', '11–12 of 12'),
                Row({ name: 'Pages', gap: 4 }, [
                  W('Page/Item', { name: 'Page 1' }),
                  W('Page/Item Active', { name: 'Page 2' }, { label: { content: '2' } }),
                ]),
              ],
            ),
          ]),
        ],
      ],
      [
        'Loading',
        shell,
        (m) => [
          head(),
          banner(m),
          matrix(m, [
            Col({ name: 'Loading', gap: 0, width: 'fill_container', padding: 16 }, [
              Tx('Muted', 'Loading distribution…'),
              ...[1, 2, 3, 4].map((i) =>
                W('Skeleton/Row', { name: `Skeleton ${i}`, width: 'fill_container' }),
              ),
            ]),
          ]),
        ],
      ],
      [
        'Error',
        shell,
        (m) => [
          head(),
          banner(m),
          matrix(
            m,
            inside([
              P('Body', 'Could not load distribution. Please try again.'),
              Btn('Try again', 'Outline', 'refresh-cw'),
            ]),
          ),
        ],
      ],
      [
        'Empty',
        shell,
        (m) => [
          head(),
          banner(m),
          matrix(
            m,
            inside([
              P('Body', 'No releases yet. Create a release to plan its delivery.'),
              Btn('Open Music', 'Primary', 'arrow-right'),
            ]),
          ),
        ],
      ],
    ],
  )
}
