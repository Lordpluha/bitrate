// The submit preview (features/submit-release SubmitPreviewDialog): exactly what Bitrate will review —
// the release identity (cover, meta, timing), tracks with version, ISRC and audio, credits and the master
// split, the master owner and identifiers — then the accuracy checkbox, the honest note and the actions.

/** The submit-preview modal builder bound to the screen helpers `ui` and the release kit `k`. */
export function submitPreview(ui, k) {
  const { W, P, Row, Col, Btn, KV } = ui
  const section = (title, rows) =>
    Col({ name: title, gap: 4, width: 'fill_container' }, [P('Body Strong', title), ...rows])
  return (m, o = {}) =>
    k.modal(
      m,
      'Check your release before review',
      [
        P(
          'Muted',
          'This is exactly what Bitrate will review. Go back to the draft to fix anything that is off.',
        ),
        Row({ name: 'Identity', gap: 14, width: 'fill_container' }, [
          W('Cover', { name: 'Cover', width: 64, height: 64 }),
          Col({ name: 'Text', gap: 2, width: 'fill_container' }, [
            P('Body Strong', 'Night Signal'),
            P('Muted', 'Mira Sol · Single · 2 tracks'),
            W(
              'Check/Info',
              { name: 'Timing', width: 'fill_container' },
              { label: { content: 'Premiere · Dec 12, 2026, 18:00 UTC' } },
            ),
          ]),
        ]),
        section('Tracks', [
          W(
            'Check/Done',
            { name: 'Track 1', width: 'fill_container' },
            { label: { content: '1. Night Signal · Original · 3:42 · GB-BTR-26-00012' } },
          ),
          W(
            'Check/Done',
            { name: 'Track 2', width: 'fill_container' },
            { label: { content: '2. Low Tide · Original · 3:18 · No ISRC' } },
          ),
        ]),
        section('Credits and master split', [
          KV('Mira Sol · Performer, Producer', '75%'),
          KV('Kite Harbor · Composer', '25%'),
        ]),
        section('Master owner', [P('Body', 'Mira Sol (this artist)')]),
        section('Identifiers', [P('Body', 'UPC/EAN: 196589402184')]),
        W(
          o.confirmed ? 'Check/Box Checked' : 'Check/Box',
          { name: 'Confirm', width: 'fill_container' },
          { label: { content: 'I checked this draft and confirm the information is accurate.' } },
        ),
        P(
          'Caption',
          'Submission starts Bitrate review. It does not deliver this release to streaming services.',
        ),
      ],
      [
        Btn('Back to editing', 'Ghost'),
        Btn(
          o.busy ? 'Submitting…' : 'Submit for review',
          'Primary',
          null,
          o.confirmed ? {} : { opacity: 0.5 },
        ),
      ],
      600,
    )
}
