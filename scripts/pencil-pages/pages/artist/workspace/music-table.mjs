// The music catalogue surface (widgets/MusicCatalogue): view toggles and the create action, the filter
// bar (Reset always there), the table of tracks or releases on the tab's artwork (rows on a phone,
// with the sort heading on the tracks tab) and the pagination footer.
import { coverFill, RELEASES, TRACKS } from './demo.mjs'
import { musicFilters } from './music-filters.mjs'

const HEAD = {
  tracks: ['TRACK', 'VERSION · DURATION', 'STATUS', 'UPDATED', 'RELEASE'],
  releases: ['RELEASE', 'TYPE', 'STATUS', 'TRACKS', 'RELEASE DATE', 'UPDATED'],
}
const ART = '../../../apps/web-artists/public/artwork/music/'

/** Catalogue builders bound to the screen helpers `ui`. */
export function musicTable(ui) {
  const { W, Tx, Row, Col, fill, inline, St, Btn } = ui
  const full = (m) => (m ? { width: 'fill_container' } : {})
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
              { label: { content: label }, count: { content: counts[i] } },
            ),
          ),
        ),
        tab === 'tracks'
          ? Btn('Upload track', 'Primary', 'upload', full(m))
          : Btn('Create release', 'Primary', 'plus', full(m)),
      ],
    )
  const filters = musicFilters(ui)
  const rows = (tab) =>
    tab === 'tracks'
      ? TRACKS.map(([title, cover, version, tone, status, updated, release]) => ({
          title,
          cover,
          tone,
          status,
          sub: 'Mira Sol',
          cells: [version, updated, release],
        }))
      : RELEASES.map(([title, cover, type, tone, status, tracks, date, updated]) => ({
          title,
          cover,
          tone,
          status,
          sub: 'Mira Sol',
          cells: [type, tracks, date, updated],
          pending: status === 'Released',
        }))
  const statusChips = (r) =>
    inline('Status', [
      St(r.tone, r.status),
      ...(r.pending ? [St('Processing', 'Change in review', 'file-pen')] : []),
    ])
  const row = (m, tab, r, playing = false) =>
    m
      ? W(
          'Catalogue/Row Compact',
          { name: `Row / ${r.title}`, width: 'fill_container' },
          {
            cover: coverFill(r.cover),
            title: { content: r.title },
            meta: { content: `${r.cells[0]} · ${r.cells[1]}` },
            status: statusChips(r),
          },
        )
      : W(
          'Catalogue/Row',
          { name: `Row / ${r.title}`, width: 'fill_container' },
          {
            ...(tab === 'tracks'
              ? { 'play.icon': { icon: playing ? 'pause' : 'play' } }
              : { play: { enabled: false } }),
            cover: coverFill(r.cover),
            title: { content: r.title },
            artist: { content: r.sub },
            c2: { content: r.cells[0] },
            status: statusChips(r),
            c4: { content: r.cells[1] },
            c5: { content: r.cells[2] },
            c6: r.cells[3] ? { content: r.cells[3] } : { enabled: false },
          },
        )
  const footer = (m, range = '1–6 of 6 · Demo data', pages = 1, page = 1) =>
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
            W('Artwork', {
              name: 'Surface art',
              width: 'fill_container',
              height: 72,
              fill: {
                type: 'image',
                url: `${ART}${tab === 'tracks' ? 'tracks-reel-transport-v1.png' : 'releases-lacquer-stack-v1.png'}`,
                mode: 'cover',
              },
            }),
            ...(m && tab === 'tracks' && !body
              ? [
                  Row(
                    {
                      name: 'Mobile heading',
                      width: 'fill_container',
                      padding: [12, 12, 0, 12],
                      justifyContent: 'space_between',
                    },
                    [Tx('Caption', 'Recently updated'), Tx('Caption', '6 tracks')],
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
                      Object.fromEntries(
                        ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'].map((c, i) => [
                          c,
                          HEAD[tab][i] ? { content: HEAD[tab][i] } : { enabled: false },
                        ]),
                      ),
                    ),
                  ]),
              ...list.map((r, i) => row(m, tab, r, i === playing)),
              ...(m && (pages ?? 1) === 1 ? [] : [footer(m, range, pages, page)]),
            ]),
          ],
          { gap: 0 },
        ),
      },
    )
  return { toolbar, filters, surface, rows }
}
