// The music catalogue's filter bar (widgets/MusicCatalogue CatalogueFilters): search, status, type and
// sort selects and Reset, which is always there; on a phone the selects wrap onto two rows.

/** `(m, tab, o) → filter bar` bound to the screen helpers `ui`. */
export function musicFilters(ui) {
  const { W, Row, Col, Btn } = ui
  return (m, tab, o = {}) => {
    const search = W(
      'Field/Search',
      { name: 'Search', width: m ? 'fill_container' : 280 },
      { value: { content: o.q ?? (tab === 'tracks' ? 'Search tracks' : 'Search releases') } },
    )
    const pills = [
      W(
        'Select/Pill',
        { name: 'Status filter' },
        { label: { content: o.status ?? 'Status: All' } },
      ),
      W(
        'Select/Pill',
        { name: 'Type filter' },
        { icon: { icon: 'disc-3' }, label: { content: 'Type: All' } },
      ),
      W(
        'Select/Pill',
        { name: 'Sort' },
        { icon: { icon: 'arrow-down-up' }, label: { content: 'Recently updated' } },
      ),
      Btn('Reset', 'Ghost', 'rotate-ccw'),
    ]
    return m
      ? Col({ name: 'Filters', gap: 10, width: 'fill_container' }, [
          search,
          Row({ name: 'Pills', gap: 8 }, pills.slice(0, 2)),
          Row({ name: 'Pills 2', gap: 8 }, pills.slice(2)),
        ])
      : Row({ name: 'Filters', gap: 10, width: 'fill_container' }, [search, ...pills])
  }
}
