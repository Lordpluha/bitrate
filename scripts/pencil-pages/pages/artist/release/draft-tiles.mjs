// Draft-stage tiles (widgets/ReleaseWorkspace DraftStage): the readiness checklist with its lock
// banner, release timing, tracks, credits and splits, rights and identifiers, and the danger zone.
// `o.locked` turns the edit actions off; `o.empty` draws a draft without tracks or credits.
import { draftRights } from './draft-rights.mjs'

const CHECKS = [
  ['Release details', 'Title and type saved', true, 'Edit details'],
  ['Release timing', 'Premiere · Nov 14, 2026, 18:00 UTC', true, 'Edit timing'],
  ['Artwork', 'Artwork uploaded', true, 'Edit artwork'],
  ['Tracks and audio', '1 track needs a genre', false, 'Edit tracks'],
  [
    'Credits & splits',
    'Credit everyone with a role and share out 100% of the master',
    false,
    'Review credits',
  ],
  ['Rights', 'Choose who owns the master', false, 'Confirm rights'],
]

/** Draft tile builders bound to the screen helpers `ui` and the release kit `k`. */
export function draftTiles(ui, k) {
  const { W, Tx, P, Col, inline, Btn } = ui
  const act = (o, label, icon, variant = 'Compact Ghost') =>
    o.locked ? [] : [Btn(label, variant, icon)]
  const readiness = (o = {}) =>
    k.tile(
      o.locked ? 'Draft submitted' : 'Readiness checklist',
      'list-checks',
      [
        ...(o.lockText
          ? [k.lock(o.lockText)]
          : [P('Muted', 'Choose an action to return to the exact step.')]),
        Col(
          { name: 'Checklist', gap: 0, width: 'fill_container' },
          CHECKS.map(([title, detail, done, action], i) =>
            W(
              done || o.complete ? 'Row/Check Done' : 'Row/Check Needed',
              { name: `Check / ${title}`, width: 'fill_container' },
              {
                title: { content: title },
                detail: {
                  content:
                    o.complete && !done
                      ? [
                          '',
                          '',
                          '',
                          '1 track with audio',
                          'Everyone credited · master at 100%',
                          'Master owner chosen',
                        ][i]
                      : detail,
                },
                trail: o.locked
                  ? { enabled: false }
                  : inline('Trail', [Btn(action, 'Compact Ghost')]),
              },
            ),
          ),
        ),
        P(
          'Caption',
          'Submission starts Bitrate review. It does not deliver this release to streaming services.',
        ),
      ],
      {},
      [Tx('Body Strong', o.complete ? '6 of 6 ready' : '3 of 6 ready')],
    )
  const timing = (o = {}) =>
    k.tile(
      'Release timing',
      'calendar-days',
      [
        Tx('H2', 'Nov 14, 2026, 18:00 UTC'),
        P('Muted', 'A premiere: it goes live at this date and time.'),
      ],
      {},
      act(o, 'Edit timing', 'pencil'),
    )
  const track = ([variant, title, meta, number, genres]) =>
    W(
      variant ? `Row/Track ${variant}` : 'Row/Track',
      { name: `Track / ${title}`, width: 'fill_container' },
      {
        number: { content: number },
        title: { content: title },
        meta: { content: meta },
        genres: genres.length
          ? inline(
              'Genres',
              genres.map((g) => W('Chip', { name: `Genre / ${g}` }, { label: { content: g } })),
            )
          : { enabled: false },
        trail: inline('Actions', [
          Btn(
            variant === 'Missing' ? 'Upload audio' : 'Replace audio',
            'Compact Outline',
            'upload',
          ),
          W('Button/Icon', { name: 'More', width: 30, height: 30 }, { icon: { icon: 'ellipsis' } }),
        ]),
      },
    )
  const tracks = (o = {}) =>
    k.tile(
      'Tracks',
      'list-music',
      [
        P('Muted', 'Recordings in this release, in running order. Uploaded audio stays private.'),
        ...(o.empty
          ? [P('Body', 'No tracks yet. Upload a WAV or FLAC master to add the first one.')]
          : (
              o.rows ?? [
                [
                  '',
                  'Night Signal',
                  'Original · 3:42 · ISRC GB-BTR-26-00012',
                  '1',
                  ['Synthwave', 'Electronic'],
                ],
                ['Missing', 'Low Tide', 'Original · Duration unavailable · No ISRC yet', '2', []],
              ]
            ).map(track)),
      ],
      {},
      act(o, 'Upload track', 'upload', 'Compact Primary'),
    )
  const danger = () =>
    k.tile('Danger zone', 'triangle-alert', [
      P(
        'Muted',
        'Delete this release from your workspace and the player. Recordings used by another release remain available. This cannot be undone.',
      ),
      Btn('Delete release', 'Danger', 'trash-2'),
    ])
  return { readiness, timing, tracks, danger, track, ...draftRights(ui, k) }
}
