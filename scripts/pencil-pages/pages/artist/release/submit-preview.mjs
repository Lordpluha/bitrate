// The submit preview (features/submit-release SubmitPreviewDialog): exactly what Bitrate will review —
// tracks with audio and ISRC, credits and the master split, the master owner and identifiers — with
// "Back to editing" and "Submit for review".

/** The submit-preview modal builder bound to the screen helpers `ui` and the release kit `k`. */
export function submitPreview(ui, k) {
  const { W, P, Col, Btn } = ui
  const kv = (label, value) =>
    W(
      'Row/Key Value',
      { name: `KV / ${label.slice(0, 20)}`, width: 'fill_container' },
      { label: { content: label }, value: { content: value }, trail: { enabled: false } },
    )
  const section = (title, rows) =>
    Col({ name: title, gap: 4, width: 'fill_container' }, [P('Body Strong', title), ...rows])
  return (m) =>
    k.modal(
      m,
      'Check your release before review',
      [
        P(
          'Muted',
          'This is exactly what Bitrate will review. Go back to the draft to fix anything that is off.',
        ),
        section('Tracks', [
          kv('1. Night Signal · 3:42', 'Audio uploaded · GB-BTR-26-00012'),
          kv('2. Low Tide · 3:18', 'Audio uploaded · No ISRC'),
        ]),
        section('Credits and master split', [
          kv('Mira Sol · Performer, Producer', '75%'),
          kv('Kite Harbor · Composer', '25%'),
        ]),
        section('Master owner', [kv('Master owner', 'Mira Sol (this artist)')]),
        section('Identifiers', [kv('UPC/EAN:', '196589402184')]),
      ],
      [Btn('Back to editing', 'Ghost', 'arrow-left'), Btn('Submit for review', 'Primary', 'send')],
      600,
    )
}
