// Music dialogs: the catalogue item dialog (CatalogueItemDialog) in its details and actions modes for a
// release and a track, and the "Upload track" explainer (workspace notice: tracks are uploaded inside
// a release). The edit, delete and propose dialogs it opens belong to the release pages.
import { workspaceModal } from './workspace-modal.mjs'

/** Dialog builders bound to the screen helpers `ui`. */
export function musicDialogs(ui) {
  const { P, Col, Row, St, Btn } = ui
  const modal = workspaceModal(ui)
  const wrapRow = (m, nodes) =>
    (m ? Col : Row)({ name: 'Buttons', gap: 10, ...(m ? { width: 'fill_container' } : {}) }, nodes)
  const head = (tone, status, meta, demo) => [
    St(tone, status),
    P('Muted', meta),
    ...(demo
      ? [
          P(
            'Caption',
            'Illustrative demo record. This does not represent an actual publication or delivery.',
          ),
        ]
      : []),
  ]
  const release = (m, actions) =>
    modal(m, actions ? 'Actions for Night Signal' : 'Night Signal', [
      ...head('Neutral', 'Draft', 'Mira Sol · Single · 1 track'),
      wrapRow(m, [
        Btn('Open workspace', 'Outline', 'arrow-up-right'),
        Btn('Edit draft', 'Outline', 'pencil'),
      ]),
      ...(actions
        ? [
            wrapRow(m, [
              Btn('View details', 'Ghost', 'info'),
              Btn('Propose changes', 'Ghost', 'file-pen'),
              Btn('Delete release', 'Danger', 'trash-2'),
            ]),
          ]
        : []),
    ])
  const track = (m) =>
    modal(m, 'Actions for Afterglow', [
      ...head('Ready', 'Published', 'Mira Sol · Remaster · 3:57', true),
      wrapRow(m, [Btn('View details', 'Ghost', 'info'), Btn('Change title', 'Ghost', 'pencil')]),
    ])
  const uploadTrack = (m) =>
    modal(
      m,
      'Upload track',
      [
        P(
          'Muted',
          'Tracks are uploaded inside a release. Create a release, or open one from Music, then use Upload track in its workspace.',
        ),
      ],
      [Btn('Got it', 'Primary')],
      440,
    )
  return { release, track, uploadTrack }
}
