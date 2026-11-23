// Artist / Release — Deliver (step=deliver; widgets/ReleaseDelivery ReleaseDeliveryPanel, features/
// delivery-plan DeliveryPlanDialog): timing, territories, destinations with what each store reports,
// "Before you continue" and the honest "nothing sent" note; the plan locked by review, publishing or
// going live; loading, error and the plan dialog with its validation and save errors.
import { pageSpec } from '../../../artist-ws/spec.mjs'
import { deliveryPlanDialog } from './delivery-plan-dialog.mjs'
import { releaseKit } from './kit.mjs'

const STORES = ['Spotify', 'Apple Music', 'YouTube Music', 'Amazon Music', 'Deezer', 'TIDAL']
const PLANNED = ['Spotify', 'Apple Music', 'YouTube Music', 'Deezer']

/** The release-deliver page spec. */
export function releaseDeliverPage(ui, frames) {
  const { W, Tx, P, Btn, Check, inline } = ui
  const k = releaseKit(ui)
  const store = (name, sent) => {
    const on = PLANNED.includes(name)
    return W(
      on ? 'Row/Store' : 'Row/Store Off',
      { name: `Store / ${name}`, width: 'fill_container' },
      {
        name: { content: name },
        plan: { content: on ? 'In the plan' : 'Not in the plan' },
        trail: on
          ? inline('Trail', [
              W(
                sent ? 'Status/Processing' : 'Status/Neutral',
                { name: 'Availability' },
                { label: { content: sent ? 'Pending' : 'Not sent' } },
              ),
            ])
          : { enabled: false },
      },
    )
  }
  const tiles = (m, o = {}) => {
    const edit = (label, icon) => (o.lock ? [] : [Btn(label, 'Compact Ghost', icon)])
    return k.columns(
      m,
      [
        k.tile('Before you continue', 'list-checks', [
          Check(true, 'Bitrate review approved'),
          Check(true, 'Premiere Nov 14, 2026, 18:00 UTC'),
          Check(!o.noStores, o.noStores ? 'No stores planned yet' : '4 of 6 planned'),
          P(
            'Muted',
            o.sent
              ? 'Store states below are reported by the distribution partner.'
              : 'Delivery starts once a distribution partner is connected.',
          ),
        ]),
      ],
      [
        ...(o.lock ? [k.lock(o.lock)] : []),
        k.tile(
          'Delivery plan',
          'calendar-days',
          [
            P(
              'Muted',
              'When and where the release goes out. It stays a plan until a distribution partner delivers it.',
            ),
            Tx('H2', 'Nov 14, 2026, 18:00 UTC'),
            P('Caption', 'A premiere: it goes live at this date and time.'),
          ],
          {},
          edit('Edit schedule', 'pencil'),
        ),
        k.tile('Territories', 'globe', [
          Tx('H2', 'Worldwide'),
          P('Muted', 'Countries where listeners can find it. Change them in the delivery plan.'),
        ]),
        k.tile(
          'Destinations',
          'store',
          [
            P('Muted', o.noStores ? 'No stores planned.' : '4 of 6 planned'),
            ...(o.noStores ? [] : STORES.map((s) => store(s, o.sent))),
          ],
          {},
          edit('Edit delivery plan', 'send'),
        ),
        k.note(
          'Info',
          o.sent
            ? 'Delivery has started through the connected partner.'
            : 'Nothing has been sent. Saving this plan does not send the release to any external platform.',
        ),
      ],
    )
  }
  const page = (m, o = {}, status = 'approved') => k.stage(m, status, 'deliver', [tiles(m, o)])
  const plan = deliveryPlanDialog(ui, k)
  const over = (o) => (m) => [k.header(m, 'approved'), k.stepper(m, 'deliver'), plan(m, o)]
  const states = [
    ['No stores planned', (m) => page(m, { noStores: true })],
    ['Sent to partner', (m) => page(m, { sent: true }, 'released')],
    [
      'Locked in review',
      (m) =>
        k.stage(m, 'submitted', 'review', [
          tiles(m, { lock: 'The delivery plan is locked while Bitrate reviews this release.' }),
        ]),
    ],
    [
      'Locked while publishing',
      (m) =>
        page(
          m,
          { lock: 'The delivery plan is locked while the release is being published.' },
          'publishing',
        ),
    ],
    [
      'Locked when live',
      (m) =>
        k.stage(m, 'released', 'launch', [
          tiles(m, { lock: 'The release is live; its delivery plan can no longer change.' }),
        ]),
    ],
    [
      'Locked after changes requested',
      (m) =>
        k.stage(m, 'rejected', 'review', [
          tiles(m, { lock: 'Start revising on the Review step to change the delivery plan.' }),
        ]),
    ],
    [
      'Loading',
      (m) => [
        k.header(m, 'approved'),
        k.stepper(m, 'deliver'),
        Tx('Muted', 'Loading delivery plan…'),
        W('Skeleton/Tile', { name: 'Skeleton', width: 'fill_container' }),
      ],
    ],
    [
      'Error',
      (m) => [
        k.header(m, 'approved'),
        k.stepper(m, 'deliver'),
        P('Body', 'Could not load the delivery plan. Please try again.'),
        Btn('Try again', 'Outline', 'refresh-cw'),
      ],
    ],
    ['Plan dialog', over({})],
    ['Plan — selected countries', over({ selected: true })],
    ['Plan — no country', over({ selected: true, noCountry: true })],
    ['Plan — saving', over({ busy: true })],
    [
      'Plan — release changed',
      over({
        error:
          'This release changed or is no longer a draft. Your choices are kept here; close and reopen the form to review the latest version.',
      }),
    ],
    [
      'Plan — not confirmed',
      over({
        error:
          'Could not confirm the delivery plan was saved. Close this form and check the release before trying again.',
      }),
    ],
  ]
  return pageSpec(
    frames,
    {
      title: 'Artist / Release — Deliver',
      route: '/dashboard/music/$releaseId?step=deliver',
      context:
        'Stores and territories for the release. No distribution partner is connected yet, so saving the plan sends nothing.',
    },
    k.shell,
    (m) => page(m),
    states.map(([label, build]) => [label, k.shell, build]),
  )
}
