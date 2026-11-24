// Draft-stage panels (widgets/ReleaseWorkspace DraftStage, WorkspaceReadiness, WorkspaceTiming,
// WorkspaceTracks, DraftTrackRow): the readiness checklist with the submission block, release timing
// and the tracks. `o.status` is the release status key; `o.done` draws every preparation step done.
import { STEPS, submission } from './draft-submit.mjs'

const TRACKS = [
  [
    'Night Signal',
    'Original · 3:42 · ISRC GB-BTR-26-00012',
    true,
    'Synthwave, Electronic',
    'Ready',
    'Ready',
  ],
  [
    'Low Tide',
    'Original · Duration unavailable · No ISRC yet',
    false,
    'No genre yet',
    'Neutral',
    'Draft',
  ],
]
const TRACKS_DONE = [
  TRACKS[0],
  ['Low Tide', 'Original · 3:18 · No ISRC yet', true, 'Ambient', 'Ready', 'Ready'],
]
const LOCKS = {
  submitted: 'Locked while Bitrate reviews this release. Withdraw it from review to edit.',
  rejected: 'Choose Start revising on the Review step to edit the draft.',
  approved: 'Approved releases can no longer be edited.',
  released: 'Released releases can no longer be edited.',
}

/** Draft panel builders bound to the screen helpers `ui` and the release kit `k`. */
export function draftTiles(ui, k) {
  const { W, Tx, P, Row, Col, inline, Btn } = ui
  const draft = (o) => o.status === 'draft' || o.status === 'draftReady'
  const readiness = (o = {}, m = false) => {
    const lock = LOCKS[o.status]
    const done = o.done ? 6 : 3
    const folded = m && !o.open
    const head = [
      Tx('Body Strong', `${done} of 6 ready`),
      ...(m
        ? [
            W(
              'Button/Icon',
              { name: 'Toggle', width: 30, height: 30 },
              { icon: { icon: folded ? 'chevron-down' : 'chevron-up' } },
            ),
          ]
        : []),
    ]
    return k.tile(
      draft(o) ? 'Readiness checklist' : 'Draft submitted',
      'list-checks',
      folded
        ? []
        : [
            lock
              ? W(
                  'Alert/Lock',
                  { name: 'Lock', width: 'fill_container' },
                  { text: { content: lock } },
                )
              : P('Muted', 'Choose an action to return to the exact step.'),
            Col(
              { name: 'Checklist', gap: 0, width: 'fill_container' },
              STEPS.map(([title, todo, doneText, action], i) => {
                const ok = o.done || i < 3
                return W(
                  ok ? 'Row/Check Done' : 'Row/Check Needed',
                  { name: `Check / ${title}`, width: 'fill_container' },
                  {
                    title: { content: title },
                    detail: { content: ok ? doneText : todo },
                    trail: lock
                      ? { enabled: false }
                      : inline('Trail', [Btn(action, 'Compact Ghost')]),
                  },
                )
              }),
            ),
            ...submission(ui, o),
          ],
      {},
      head,
    )
  }
  const timing = (o = {}) => {
    const editable = draft(o) || o.status === 'approved'
    return k.tile('Release timing', 'calendar-days', [
      Tx('H2', 'Dec 12, 2026, 18:00 UTC'),
      P('Muted', 'A premiere: it goes live at this date and time.'),
      Row({ name: 'Action', gap: 8 }, [
        editable ? Btn('Edit timing', 'Compact Outline') : k.locked('Edit timing'),
      ]),
    ])
  }
  const track =
    (o, m) =>
    ([title, meta, audio, genres, tone, status], i) => {
      const editable = draft(o)
      const actions = [
        audio ? 'Replace audio' : 'Upload audio',
        'Rename',
        'Genres',
        'ISRC',
        'Remove',
      ]
      return W(
        'Row/Track',
        { name: `Track / ${title}`, width: 'fill_container' },
        {
          ...(editable
            ? { orderIndex: { content: String(i + 1) }, number: { enabled: false } }
            : { order: { enabled: false }, number: { content: String(i + 1) } }),
          title: { content: title },
          meta: { content: meta },
          audioIcon: audio ? { enabled: false } : {},
          audio: { content: audio ? 'Audio uploaded' : 'No audio uploaded' },
          genresIcon: genres === 'No genre yet' ? {} : { enabled: false },
          genres: { content: `Genres: ${genres}` },
          status: inline('Status', [
            W(`Status/${tone}`, { name: `Status / ${status}` }, { label: { content: status } }),
          ]),
          player: audio
            ? Col({ name: 'Player', gap: 0, width: 'fill_container' }, [
                W(
                  'Player/Track',
                  { name: 'Track player', width: 'fill_container' },
                  { title: { content: title } },
                ),
              ])
            : { enabled: false },
          actions: editable
            ? Col(
                { name: 'Actions', gap: 6, width: 'fill_container' },
                (m ? [actions.slice(0, 3), actions.slice(3)] : [actions]).map((row, r) =>
                  Row(
                    { name: `Actions ${r + 1}`, gap: 6 },
                    row.map((a) => Btn(a, a === 'Remove' ? 'Compact Danger' : 'Compact Outline')),
                  ),
                ),
              )
            : { enabled: false },
        },
      )
    }
  const tracks = (o = {}, m = false) => {
    const rows = o.done ? TRACKS_DONE : TRACKS
    const right = draft(o)
      ? [
          o.compilation
            ? Btn('Add from catalogue', 'Compact Outline', 'library')
            : Btn('Upload track', 'Compact Outline', 'upload'),
        ]
      : []
    return k.tile(
      `Tracks (${o.empty ? 0 : 2})`,
      'list-music',
      [
        P(
          'Muted',
          o.compilation
            ? 'Existing recordings in running order. Audio and identifiers belong to the original recording.'
            : 'Recordings in this release, in running order. Uploaded audio stays private.',
        ),
        ...(o.empty
          ? [
              P(
                'Body',
                o.compilation
                  ? 'Choose published recordings from your catalogue to start this compilation.'
                  : 'No tracks yet. Upload a WAV or FLAC master to add the first one.',
              ),
            ]
          : rows.map(track(o, m))),
      ],
      {},
      right,
    )
  }
  return { readiness, timing, tracks }
}
