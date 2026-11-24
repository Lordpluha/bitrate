// The compilation picker (features/release-media CompilationPickerDialog): search with its button, the
// published recordings to pick (or no matches), the selection count and the add action.

/** `(m, o) → modal` bound to the screen helpers `ui` and the release kit `k`. */
export function compilationDialog(ui, k) {
  const { W, P, Row, Col, Btn } = ui
  const pick = (selected, title, meta) =>
    W(
      selected ? 'Row/Pick Selected' : 'Row/Pick',
      { name: `Pick / ${title}`, width: 'fill_container' },
      { title: { content: title }, meta: { content: meta } },
    )
  return (m, o = {}) =>
    k.modal(
      m,
      'Build a compilation',
      [
        P(
          'Muted',
          'Choose your published recordings. Their audio, ISRC, likes and listening history stay the same. The compilation has its own artwork and still goes through review.',
        ),
        Row({ name: 'Search', gap: 8, width: 'fill_container' }, [
          W(
            'Field/Search',
            { name: 'Find a recording', width: 'fill_container' },
            { value: { content: 'Find a recording' } },
          ),
          Btn('Search', 'Outline'),
        ]),
        ...(o.empty
          ? [P('Muted', 'No published recordings match your search.')]
          : [
              Col({ name: 'Recordings', gap: 4, width: 'fill_container' }, [
                pick(true, 'Afterglow', 'Afterglow · Remaster · 3:57'),
                pick(true, 'Echoes in Motion', 'Echoes in Motion · Original · 4:05'),
                pick(false, 'Low Tide', 'Echoes in Motion · Original · 3:18'),
              ]),
            ]),
        P('Caption', 'Selected: 2. You can add up to 50 recordings.'),
      ],
      [Btn('Cancel', 'Ghost'), Btn('Add recordings (2)', 'Primary', 'plus')],
    )
}
