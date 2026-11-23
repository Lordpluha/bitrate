// The music catalogue surface (widgets/MusicCatalogue): view toggles and the create action, the filter
// bar, the table of tracks or releases (rows on a phone) and the pagination footer.
import { coverFill, RELEASES, TRACKS } from './demo.mjs'

const HEAD = {
  tracks: ['TRACK', 'VERSION · DURATION', 'STATUS', 'UPDATED', 'RELEASE'],
  releases: ['RELEASE', 'TYPE', 'STATUS', 'TRACKS', 'RELEASE DATE'],
}

/** Catalogue builders bound to the screen helpers `ui`. */
export function musicTable(ui) {
  const { W, Tx, Row, Col, fill, inline, St, Btn } = ui
  const toolbar = (m, tab, counts = ['6', '4']) =>
    (m ? Col : Row)(
      {
        name: 'Views',
        width: 'fill_container',
        gap: 12,
        ...(m ? {} : { justifyContent: 'space_between' }),
      },
      [
        Row(
          { name: 'Toggles', gap: 12 },
          ['Tracks', 'Releases'].map((label, i) =>
            W(
              tab === (i ? 'releases' : 'tracks') ? 'Button/Toggle Active' : 'Button/Toggle',
              { name: `View / ${label}` },
              {
                label: { content: label },
                count: { content: counts[i] },
              },
            ),
          ),
        ),
        tab === 'tracks'
          ? Btn('Upload track', 'Primary', 'upload', m ? { width: 'fill_container' } : {})
          : Btn('Create release', 'Primary', 'plus', m ? { width: 'fill_container' } : {}),
      ],
    )
  const filters = (m, tab, o = {}) => {
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
      ...(o.q || o.status ? [Btn('Reset', 'Ghost', 'rotate-ccw')] : []),
    ]
    return m
      ? Col({ name: 'Filters', gap: 10, width: 'fill_container' }, [
          search,
          Row({ name: 'Pills', gap: 8 }, pills.slice(0, 2)),
          Row({ name: 'Pills 2', gap: 8 }, pills.slice(2)),
        ])
      : Row({ name: 'Filters', gap: 10, width: 'fill_container' }, [search, ...pills])
  }
  const rows = (tab) =>
    tab === 'tracks'
      ? TRACKS.map(([title, cover, version, tone, status, updated, release]) => ({
          title,
          cover,
          c2: version,
          tone,
          status,
          c4: updated,
          c5: release,
          sub: 'Mira Sol',
        }))
      : RELEASES.map(([title, cover, type, tone, status, tracks, date, updated]) => ({
          title,
          cover,
          c2: type,
          tone,
          status,
          c4: tracks,
          c5: date,
          sub: `Updated ${updated.toLowerCase()}`,
        }))
  const row = (m, r, playing = false) =>
    m
      ? W(
          'Catalogue/Row Compact',
          { name: `Row / ${r.title}`, width: 'fill_container' },
          {
            cover: coverFill(r.cover),
            title: { content: r.title },
            meta: { content: `${r.c2} · ${r.c4}` },
            status: inline('Status', [St(r.tone, r.status)]),
          },
        )
      : W(
          'Catalogue/Row',
          { name: `Row / ${r.title}`, width: 'fill_container' },
          {
            'play.icon': { icon: playing ? 'pause' : 'play' },
            cover: coverFill(r.cover),
            title: { content: r.title },
            artist: { content: r.sub },
            c2: { content: r.c2 },
            status: inline('Status', [St(r.tone, r.status)]),
            c4: { content: r.c4 },
            c5: { content: r.c5 },
          },
        )
  const footer = (m, range = '1–6 of 6', pages = 1, page = 1) =>
    Row(
      {
        name: 'Footer',
        width: 'fill_container',
        gap: 12,
        padding: m ? [12, 12] : [12, 16],
        justifyContent: 'space_between',
      },
      [
        Tx('Muted', range),
        ...(pages > 1
          ? [
              Row({ name: 'Pages', gap: 4 }, [
                Btn('Previous', 'Compact Ghost', 'chevron-left'),
                ...Array.from({ length: pages }, (_, i) =>
                  W(
                    i + 1 === page ? 'Page/Item Active' : 'Page/Item',
                    { name: `Page ${i + 1}` },
                    { label: { content: String(i + 1) } },
                  ),
                ),
                Btn('Next', 'Compact Ghost', 'chevron-right'),
              ]),
            ]
          : []),
        ...(m ? [] : [Tx('Caption', 'Sorted by recently updated')]),
      ],
    )
  /** The table surface; `body` replaces the rows (skeleton, error, empty). */
  const surface = (m, tab, { body, list = rows(tab), playing = -1, range, pages, page } = {}) =>
    W(
      'Panel',
      { name: 'Catalogue', width: 'fill_container', padding: 0 },
      {
        content: fill(
          'Content',
          [
            ...(m
              ? [
                  Row(
                    {
                      name: 'Mobile heading',
                      width: 'fill_container',
                      padding: [12, 12, 0, 12],
                      justifyContent: 'space_between',
                    },
                    [
                      Tx('Caption', 'Recently updated'),
                      Tx('Caption', tab === 'tracks' ? '6 tracks' : '4 releases'),
                    ],
                  ),
                ]
              : []),
            ...(body ?? [
              ...(m
                ? []
                : [
                    W(
                      'Catalogue/Header',
                      { name: 'Header', width: 'fill_container' },
                      Object.fromEntries(HEAD[tab].map((h, i) => [`c${i + 1}`, { content: h }])),
                    ),
                  ]),
              ...list.map((r, i) => row(m, r, i === playing)),
              footer(m, range, pages, page),
            ]),
          ],
          { gap: 0 },
        ),
      },
    )
  return { toolbar, filters, surface, rows }
}
