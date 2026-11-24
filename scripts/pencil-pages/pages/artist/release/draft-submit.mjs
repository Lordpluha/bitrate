// The foot of the draft checklist (WorkspaceReadiness + features/submit-release ReleaseSubmission): the
// identifier notes, then what the status allows — review and submit (or the blockers left), withdraw
// from review, start revising, or the approval line. Also the checklist steps (releaseRoadmap).

/* [step, to do, done, action] */
export const STEPS = [
  ['Release details', 'Title and type saved', 'Title and type saved', 'Edit details'],
  [
    'Release timing',
    'Premiere · Dec 12, 2026, 18:00 UTC',
    'Premiere · Dec 12, 2026, 18:00 UTC',
    'Edit timing',
  ],
  ['Artwork', 'Upload the cover image', 'Artwork uploaded', 'Edit artwork'],
  ['Tracks and audio', '1 track needs audio', '2 tracks with audio', 'Edit tracks'],
  [
    'Credits & splits',
    'Credit everyone with a role and share out 100% of the master',
    'Everyone credited · master at 100%',
    'Review credits',
  ],
  ['Rights', 'Choose who owns the master', 'Master owner chosen', 'Confirm rights'],
]

/** The submission block for the status in `o`. */
export function submission(ui, o) {
  const { W, P, Col, Btn } = ui
  const info = (text) =>
    W('Check/Info', { name: 'Note', width: 'fill_container' }, { label: { content: text } })
  const notes = Col({ name: 'Notes', gap: 6, width: 'fill_container' }, [
    ...(o.done ? [] : [info('No UPC yet — a code is needed before delivery')]),
    info('Low Tide has no ISRC yet — a code is needed before delivery'),
  ])
  switch (o.status) {
    case 'draft':
    case 'draftReady':
      return [
        notes,
        Btn('Review and submit', 'Primary', null, o.done ? {} : { opacity: 0.5 }),
        P(
          'Muted',
          o.done
            ? 'Creates a Bitrate review request only. It does not deliver this release to streaming services.'
            : 'Resolve 3 blockers before submission.',
        ),
      ]
    case 'submitted':
      return [
        notes,
        Btn(o.busy ? 'Withdrawing…' : 'Withdraw from review', 'Outline'),
        P('Muted', 'Need a change? Withdrawing returns it to the draft; nothing saved is lost.'),
      ]
    case 'rejected':
      return [
        notes,
        P(
          'Body Strong',
          'Bitrate requested changes. Reopen the draft to address them, then submit again.',
        ),
        Btn(o.busy ? 'Reopening…' : 'Start revising', 'Primary'),
      ]
    case 'approved':
      return [
        notes,
        P('Body Strong', 'Approved by Bitrate review. Delivery follows the plan below.'),
      ]
    default:
      return [notes]
  }
}
