// Music dialogs: the catalogue item dialog (CatalogueItemDialog) — status, meta, the demo note, "Open
// workspace" and (for a draft) "Edit draft", then in actions mode "View details", "Propose changes" /
// "Change title" only when the item accepts changes, and "Delete release" for a draft — and the
// "Upload track" explainer (workspace notice: tracks are uploaded inside a release).
import { workspaceModal } from './workspace-modal.mjs'

/** Dialog builders bound to the screen helpers `ui`. */
export function musicDialogs(ui) {
  const { P, Col, Row, St, Btn } = ui
  const modal = workspaceModal(ui)
  const buttons = (m, nodes) =>
    (m ? Col : Row)({ name: 'Buttons', gap: 10, ...(m ? { width: 'fill_container' } : {}) }, nodes)
  /* `o.actions` actions mode, `o.released` a live release (accepts changes, not deletable) */
  const release = (m, o = {}) =>
    modal(
      m,
      o.actions
        ? `Actions for ${o.released ? 'Afterglow' : 'Night Signal'}`
        : o.released
          ? 'Afterglow'
          : 'Night Signal',
      [
        o.released ? St('Ready', 'Released') : St('Neutral', 'Draft'),
        P('Muted', o.released ? 'Mira Sol · Album · 9 tracks' : 'Mira Sol · Single · 1 track'),
        buttons(m, [
          Btn('Open workspace', 'Outline'),
          ...(o.released ? [] : [Btn('Edit draft', 'Primary')]),
        ]),
        ...(o.actions
          ? [
              buttons(m, [
                Btn('View details', 'Outline'),
                ...(o.released
                  ? [Btn('Propose changes', 'Outline')]
                  : [Btn('Delete release', 'Danger')]),
              ]),
            ]
          : []),
      ],
    )
  const track = (m) =>
    modal(m, 'Actions for Afterglow', [
      St('Ready', 'Published'),
      P('Muted', 'Mira Sol · Remaster · 3:57'),
      P(
        'Caption',
        'Illustrative demo record. This does not represent an actual publication or delivery.',
      ),
      buttons(m, [Btn('View details', 'Outline'), Btn('Change title', 'Outline')]),
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
