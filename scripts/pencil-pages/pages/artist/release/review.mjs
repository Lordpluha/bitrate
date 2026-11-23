// Artist / Release — Review (step=review; widgets/ReleaseWorkspace ReviewStage, features/submit-release):
// not submitted yet (readiness summary and the submission with its accuracy confirmation), waiting for
// a reviewer (three-step progress, withdraw), changes requested (reviewer feedback, start revising),
// approved (what next: plan delivery); the submit-preview dialog and the in-progress actions.

import { pageSpec } from '../../../artist-ws/spec.mjs'
import { releaseKit } from './kit.mjs'
import { submitPreview } from './submit-preview.mjs'

const STEPS = [
  ['Submitted', 'The draft is locked so the reviewer sees exactly what you sent.'],
  ['Bitrate checks the release', 'Audio, artwork, credits and rights.'],
  [
    'Decision',
    'Approved: plan stores and territories. Changes requested: revise and submit again.',
  ],
]
const FEEDBACK =
  'The artwork shows a third-party logo in the bottom corner. Replace it with artwork you own the rights to, then submit again.'

/** The release-review page spec. */
export function releaseReviewPage(ui, frames) {
  const { W, P, Col, Btn, Check } = ui
  const k = releaseKit(ui)
  const preview = submitPreview(ui, k)
  const progress = (at) =>
    Col(
      { name: 'Progress', gap: 0, width: 'fill_container' },
      STEPS.map(([title, detail], i) =>
        W(
          `Row/Step ${i < at ? 'Done' : i === at ? 'Current' : 'Upcoming'}`,
          { name: `Step / ${title}`, width: 'fill_container' },
          { title: { content: title }, detail: { content: detail } },
        ),
      ),
    )
  const readiness = (all = true) =>
    k.tile('Release readiness', 'list-checks', [
      Check(true, 'Release details'),
      Check(true, 'Artwork'),
      Check(true, 'Tracks and audio'),
      Check(all, 'Credits & splits'),
      Check(all, 'Rights'),
      ...(all ? [] : [Btn('Back to the draft', 'Compact Ghost', 'arrow-left')]),
    ])
  const submission = (o = {}) => [
    ...(o.blockers
      ? [P('Error', 'Resolve 2 blockers before submission.')]
      : [
          W(
            o.confirmed ? 'Check/Box Checked' : 'Check/Box',
            { name: 'Confirm', width: 'fill_container' },
            { label: { content: 'I checked this draft and confirm the information is accurate.' } },
          ),
        ]),
    Btn(o.busy ? 'Submitting…' : 'Review and submit', 'Primary', o.busy ? 'loader-circle' : 'send'),
    P(
      'Caption',
      'Creates a Bitrate review request only. It does not deliver this release to streaming services.',
    ),
  ]
  const notSubmitted = (m, o = {}) =>
    k.stage(m, o.blockers ? 'draft' : 'ready', 'draft', [
      k.columns(
        m,
        [readiness(!o.blockers)],
        [
          k.tile('Not submitted yet', 'file-clock', [
            P(
              'Muted',
              'Bitrate review starts when you submit the draft. Feedback and the decision appear here.',
            ),
            ...submission(o),
          ]),
        ],
      ),
    ])
  const waiting = (m, busy = false) =>
    k.stage(m, 'submitted', 'review', [
      k.columns(
        m,
        [readiness()],
        [
          k.tile(
            'Waiting for a reviewer',
            'hourglass',
            [
              P('Muted', 'Submitted Nov 21, 2026, 09:12 UTC'),
              progress(1),
              k.note('Info', 'Nothing is sent to stores while Bitrate reviews the release.'),
              Btn(
                busy ? 'Withdrawing…' : 'Withdraw from review',
                'Outline',
                busy ? 'loader-circle' : 'undo-2',
              ),
              P(
                'Caption',
                'Need a change? Withdrawing returns it to the draft; nothing saved is lost.',
              ),
            ],
            {},
            [W('Status/Processing', { name: 'In review' }, { label: { content: 'In review' } })],
          ),
        ],
      ),
    ])
  const feedback = (approved) =>
    W(
      approved ? 'Alert/Success' : 'Alert/Warning',
      { name: 'Review result', width: 'fill_container' },
      {
        title: {
          content: `${approved ? 'Approved by Bitrate' : 'Changes requested'} · Reviewed Nov 22, 2026, 16:40 UTC`,
        },
        body: approved ? { enabled: false } : { content: FEEDBACK },
        action: { enabled: false },
      },
    )
  const rejected = (m, busy = false) =>
    k.stage(m, 'rejected', 'review', [
      feedback(false),
      k.columns(
        m,
        [readiness()],
        [
          k.tile('Review progress', 'activity', [
            progress(3),
            P('Muted', 'Make the changes from the review above, then submit again.'),
            P(
              'Body',
              'Bitrate requested changes. Reopen the draft to address them, then submit again.',
            ),
            Btn(
              busy ? 'Reopening…' : 'Start revising',
              'Primary',
              busy ? 'loader-circle' : 'pencil',
            ),
          ]),
        ],
      ),
    ])
  const approved = (m) =>
    k.stage(m, 'approved', 'deliver', [
      feedback(true),
      k.columns(
        m,
        [readiness()],
        [
          k.tile('What happens next', 'sparkles', [
            P(
              'Muted',
              'Approval does not deliver the release. Publish it on Bitrate from Launch, and plan stores and territories when you are ready.',
            ),
            Btn('Plan delivery', 'Primary', 'arrow-right'),
          ]),
        ],
      ),
    ])
  const states = [
    ['Blockers left', (m) => notSubmitted(m, { blockers: true })],
    ['Confirmed', (m) => notSubmitted(m, { confirmed: true })],
    ['Submitting', (m) => notSubmitted(m, { confirmed: true, busy: true })],
    ['Submit preview', (m) => [k.header(m, 'ready'), k.stepper(m, 'draft'), preview(m)]],
    ['Waiting for a reviewer', (m) => waiting(m)],
    ['Withdrawing', (m) => waiting(m, true)],
    ['Changes requested', (m) => rejected(m)],
    ['Reopening', (m) => rejected(m, true)],
    ['Approved', approved],
  ]
  return pageSpec(
    frames,
    {
      title: 'Artist / Release — Review',
      route: '/dashboard/music/$releaseId?step=review',
      context:
        'Bitrate review of the release. Submitting only requests review; nothing reaches stores from here.',
    },
    k.shell,
    (m) => notSubmitted(m),
    states.map(([label, build]) => [label, k.shell, build]),
  )
}
