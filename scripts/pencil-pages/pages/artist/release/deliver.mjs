// Artist / Release — Deliver (step=deliver; widgets/ReleaseDelivery ReleaseDeliveryPanel, features/
// delivery-plan DeliveryPlanDialog): territories and destinations (every store with its availability,
// the patchbay artwork), and on the right "Before you continue", the next action, "Edit delivery plan"
// (a locked button with its reason while review, publishing or live) and the honest note; loading,
// error and the plan dialog.
import { pageSpec } from '../../../artist-ws/spec.mjs'
import { deliveryPlanDialog } from './delivery-plan-dialog.mjs'
import { releaseKit } from './kit.mjs'

const STORES = ['Spotify', 'Apple Music', 'YouTube Music', 'Amazon Music', 'Deezer', 'TIDAL']
const PLANNED = ['Spotify', 'Apple Music', 'YouTube Music', 'Deezer']
/* availability → [chip tone, label, icon] (entities/delivery, ReleaseDeliveryPanel tone and icons) */
const AVAIL = {
  notConnected: ['Warning', 'Not connected', 'radio'],
  pending: ['Processing', 'Pending', 'clock'],
  live: ['Ready', 'Live', 'circle-check'],
}

/** The release-deliver page spec. */
export function releaseDeliverPage(ui, frames) {
  const { W, Tx, P, Btn, Check, inline } = ui
  const k = releaseKit(ui)
  const plan = deliveryPlanDialog(ui, k)
  const store = (avail) => (name) => {
    const [tone, label, icon] = AVAIL[avail]
    const on = PLANNED.includes(name)
    return W(
      on ? 'Row/Store' : 'Row/Store Off',
      { name: `Store / ${name}`, width: 'fill_container' },
      {
        name: { content: name },
        plan: { content: on ? 'In the plan' : 'Not in the plan' },
        trail: inline('Trail', [
          W(
            `Status/${tone}`,
            { name: 'Availability' },
            { label: { content: label }, icon: { icon } },
          ),
        ]),
      },
    )
  }
  const page = (m, status = 'approved', o = {}) => {
    /* design ahead of code: review is done from Ready on, incl. Scheduled and Publishing */
    const approved = ['approved', 'scheduled', 'publishing', 'released'].includes(status)
    const stores = o.noStores ? [] : PLANNED
    const avail = o.sent ? (status === 'released' ? 'live' : 'pending') : 'notConnected'
    return k.stage(
      m,
      status,
      [
        k.columns(
          m,
          [
            k.tile('Territories', 'globe', [
              P(
                'Muted',
                'When and where the release goes out. It stays a plan until a distribution partner delivers it.',
              ),
              Check(true, 'Territories'),
              Tx('H2', 'Worldwide'),
              P(
                'Caption',
                'Countries where listeners can find it. Change them in the delivery plan.',
              ),
            ]),
            k.tile(
              'Destinations',
              'store',
              [
                W('Artwork', {
                  name: 'Patchbay',
                  width: 'fill_container',
                  height: 120,
                  fill: {
                    type: 'image',
                    url: '../../../apps/web-artists/public/artwork/releases/state-patchbay-v1.webp',
                    mode: 'cover',
                  },
                }),
                ...STORES.map(store(avail)),
              ],
              {},
              [Tx('Caption', `${stores.length} of 6 planned`)],
            ),
          ],
          [
            k.tile('Before you continue', 'list-checks', [
              Check(approved, 'Bitrate review approved'),
              Check(true, 'Premiere Dec 12, 2026, 18:00 UTC'),
              Check(
                stores.length > 0,
                stores.length
                  ? 'Spotify, Apple Music, YouTube Music, Deezer · Worldwide'
                  : 'No stores planned yet',
              ),
              Tx('Eyebrow', 'NEXT ACTION'),
              P(
                'Body',
                o.sent
                  ? 'Store states below are reported by the distribution partner.'
                  : stores.length
                    ? 'Delivery starts once a distribution partner is connected.'
                    : 'Choose the stores and territories for this release.',
              ),
              o.lock
                ? k.locked('Edit delivery plan')
                : Btn('Edit delivery plan', 'Primary', null, { width: 'fill_container' }),
              W(
                'Check/Info',
                { name: 'Honest', width: 'fill_container' },
                {
                  label: {
                    content: o.sent
                      ? 'Delivery has started through the connected partner.'
                      : 'Nothing has been sent. Saving this plan does not send the release to any external platform.',
                  },
                },
              ),
            ]),
          ],
        ),
      ],
      { premiere: status !== 'released' },
    )
  }
  const panel = (m, body) => [
    k.header(m, 'approved', true),
    k.stepper(m, 'approved'),
    k.tile('Delivery plan', 'send', body),
    k.danger(),
  ]
  const over = (o) => (m) => [k.header(m, 'approved', true), k.stepper(m, 'approved'), plan(m, o)]
  const states = [
    ['No stores planned', (m) => page(m, 'approved', { noStores: true })],
    ['Draft planning', (m) => page(m, 'draft')],
    ['Locked in review', (m) => page(m, 'submitted', { lock: true })],
    ['Locked after changes requested', (m) => page(m, 'rejected', { lock: true })],
    ['Locked while publishing', (m) => page(m, 'publishing', { lock: true })],
    ['Live, sent to partner', (m) => page(m, 'released', { lock: true, sent: true })],
    ['Loading', (m) => panel(m, [P('Muted', 'Loading delivery plan…')])],
    [
      'Error',
      (m) =>
        panel(m, [
          P('Body', 'Could not load the delivery plan. Please try again.'),
          Btn('Try again', 'Compact Outline'),
        ]),
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
        'Stores and territories for the release. No distribution partner is connected yet, so saving the plan sends nothing; "Bitrate review approved" is ticked from Ready on: Scheduled, Publishing and Released too.',
    },
    k.shell,
    (m) => page(m),
    states.map(([label, build]) => [label, k.shell, build]),
  )
}
