// Artist / Distribution (views/DistributionView + DeliveryMatrix): the no-partner banner (Your plan →
// Partner → Stores), the delivery-plan matrix, pagination below it only with more than one page; the
// table skeleton, the error and the empty catalogue with its "Open Music" link, outside the panel.
import { pageSpec } from '../../../artist-ws/spec.mjs'
import { distributionMatrix } from './distribution-matrix.mjs'
import { pageSkeleton } from './page-skeleton.mjs'

/* [title, cover, [chip tone, status], territories, sent state, cell per store] */
const ROWS = [
  [
    'Night Signal',
    'night-signal',
    ['Neutral', 'Draft'],
    'Worldwide',
    'Not sent',
    [
      'Not connected',
      'Not connected',
      'Not connected',
      'Not in plan',
      'Not connected',
      'Not in plan',
    ],
  ],
  [
    'Echoes in Motion',
    'echoes-in-motion',
    ['Processing', 'Submitted'],
    '2 countries',
    'Not sent',
    ['Not connected', 'Not connected', 'Not in plan', 'Not in plan', 'Not in plan', 'Not in plan'],
  ],
  [
    'Afterglow',
    'afterglow',
    ['Ready', 'Released'],
    'Worldwide',
    'Sent to partner',
    ['Live', 'Live', 'Pending', 'Failed', 'Taken down', 'Unavailable'],
  ],
  [
    'Static Lines',
    'static-lines',
    ['Ready', 'Scheduled'],
    'Worldwide',
    'No stores planned',
    ['Not in plan', 'Not in plan', 'Not in plan', 'Not in plan', 'Not in plan', 'Not in plan'],
  ],
]

/** The distribution page spec. */
export function distributionPage(ui, frames) {
  const { W, Tx, P, Row, Col, fill, Btn } = ui
  const { pageHead } = frames
  const matrix = distributionMatrix(ui)
  const skeleton = pageSkeleton(ui)
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
  const pagination = () =>
    Row({ name: 'Pagination', gap: 4, width: 'fill_container', justifyContent: 'center' }, [
      Btn('Previous', 'Compact Ghost', 'chevron-left'),
      W('Page/Item', { name: 'Page 1' }),
      W('Page/Item Active', { name: 'Page 2' }, { label: { content: '2' } }),
      Btn('Next', 'Compact Ghost', 'chevron-right'),
    ])
  const page = (m, nodes) => [head(), banner(m), ...nodes]
  return pageSpec(
    frames,
    {
      title: 'Artist / Distribution',
      route: '/dashboard/distribution?page=',
      context:
        'Plans only: no distribution partner is connected. Each row opens the release on Deliver; the legend lists the states shown.',
    },
    shell,
    (m) => page(m, [matrix(m, ROWS)]),
    [
      ['Second page', shell, (m) => page(m, [matrix(m, ROWS.slice(0, 2)), pagination()])],
      ['Loading', shell, (m) => page(m, skeleton(m, 'table'))],
      [
        'Error',
        shell,
        (m) =>
          page(m, [
            P('Body', 'Could not load distribution. Please try again.'),
            Btn('Try again', 'Outline'),
          ]),
      ],
      [
        'Empty',
        shell,
        (m) =>
          page(m, [
            Col(
              {
                name: 'Empty',
                gap: 10,
                width: 'fill_container',
                padding: [32, 0],
                alignItems: 'center',
              },
              [
                W('Button/Icon', { name: 'Send' }, { icon: { icon: 'send' } }),
                P('Body', 'No releases yet. Create a release to plan its delivery.'),
                Tx('Link Underline', 'Open Music'),
              ],
            ),
          ]),
      ],
    ],
  )
}
