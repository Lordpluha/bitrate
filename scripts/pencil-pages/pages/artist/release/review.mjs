// Artist / Release — Review (step=review; widgets/ReleaseWorkspace ReviewStage, WorkspaceReview,
// features/submit-release): not submitted yet (empty main, readiness on the right with "Back to the
// draft"), waiting for a reviewer (status, three-step progress, honest note, withdraw), changes
// requested (the decision as main, "Review progress" with Start revising), approved (what next), and
// the submit preview with its accuracy checkbox.
import { pageSpec } from '../../../artist-ws/spec.mjs'
import { releaseKit } from './kit.mjs'
import { reviewParts } from './review-parts.mjs'
import { submitPreview } from './submit-preview.mjs'

const STEPS = [
  ['Submitted', 'The draft is locked so the reviewer sees exactly what you sent.'],
  ['Bitrate checks the release', 'Audio, artwork, credits and rights.'],
  [
    'Decision',
    'Approved: plan stores and territories. Changes requested: revise and submit again.',
  ],
]
/** The release-review page spec. */
export function releaseReviewPage(ui, frames) {
  const { W, P, Row, Col, Btn, St } = ui
  const k = releaseKit(ui)
  const preview = submitPreview(ui, k)
  const { readiness, decision } = reviewParts(ui, k)
  const notSubmitted = (m, all = false) =>
    k.stage(
      m,
      all ? 'draftReady' : 'draft',
      [
        k.columns(
          m,
          [
            W(
              'State/Empty',
              { name: 'Not submitted yet', width: 'fill_container' },
              {
                icon: { icon: 'send' },
                title: { content: 'Not submitted yet' },
                body: m
                  ? {
                      content:
                        'Bitrate review starts when you submit the draft. Feedback and the decision appear here.',
                      width: 'fill_container',
                    }
                  : {
                      content:
                        'Bitrate review starts when you submit the draft. Feedback and the decision appear here.',
                    },
                action: { enabled: false },
              },
            ),
          ],
          [readiness(all, true)],
        ),
      ],
      { premiere: true },
    )
  const waiting = (m, busy = false) =>
    k.stage(
      m,
      'submitted',
      [
        k.columns(
          m,
          [
            k.tile(
              'Waiting for a reviewer',
              'hourglass',
              [
                P('Muted', 'Submitted Nov 21, 2026, 09:12 UTC'),
                Col(
                  { name: 'Progress', gap: 0, width: 'fill_container' },
                  STEPS.map(([title, detail], i) =>
                    W(
                      `Row/Step ${['Done', 'Current', 'Upcoming'][i]}`,
                      { name: `Step / ${title}`, width: 'fill_container' },
                      { title: { content: title }, detail: { content: detail } },
                    ),
                  ),
                ),
                W(
                  'Check/Info',
                  { name: 'Honest', width: 'fill_container' },
                  {
                    label: {
                      content: 'Nothing is sent to stores while Bitrate reviews the release.',
                    },
                  },
                ),
                Row({ name: 'Withdraw', gap: 12, width: 'fill_container' }, [
                  Btn(busy ? 'Withdrawing…' : 'Withdraw from review', 'Outline'),
                  P(
                    'Muted',
                    'Need a change? Withdrawing returns it to the draft; nothing saved is lost.',
                  ),
                ]),
              ],
              {},
              [St('Processing', 'In review', 'clock')],
            ),
          ],
          [readiness(true, false)],
        ),
      ],
      { premiere: true },
    )
  const rejected = (m, busy = false) =>
    k.stage(
      m,
      'rejected',
      [
        k.columns(
          m,
          [decision(false)],
          [
            k.tile('Review progress', 'activity', [
              P('Muted', 'Make the changes from the review above, then submit again.'),
              P(
                'Body Strong',
                'Bitrate requested changes. Reopen the draft to address them, then submit again.',
              ),
              Btn(busy ? 'Reopening…' : 'Start revising', 'Primary'),
            ]),
          ],
        ),
      ],
      { premiere: true },
    )
  const approved = (m) =>
    k.stage(
      m,
      'approved',
      [
        k.columns(
          m,
          [decision(true)],
          [
            k.tile('What happens next', 'sparkles', [
              P(
                'Muted',
                'Approval does not deliver the release. Publish it on Bitrate from Launch, and plan stores and territories when you are ready.',
              ),
              Btn('Plan delivery', 'Primary', null, { width: 'fill_container' }),
            ]),
          ],
        ),
      ],
      { premiere: true },
    )
  const states = [
    ['Ready to submit', (m) => notSubmitted(m, true)],
    [
      'Submit preview',
      (m) => [k.header(m, 'draftReady', true), k.stepper(m, 'draftReady'), preview(m)],
    ],
    [
      'Submit preview — confirmed',
      (m) => [
        k.header(m, 'draftReady', true),
        k.stepper(m, 'draftReady'),
        preview(m, { confirmed: true }),
      ],
    ],
    [
      'Submitting',
      (m) => [
        k.header(m, 'draftReady', true),
        k.stepper(m, 'draftReady'),
        preview(m, { confirmed: true, busy: true }),
      ],
    ],
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
