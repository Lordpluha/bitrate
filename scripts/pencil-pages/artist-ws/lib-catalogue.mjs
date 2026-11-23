// The music catalogue (widgets/MusicCatalogue): the filter bar's search field and select pills, the
// table header and row (preview, cover, title, four columns, status, actions) and the phone row.
// View toggles and pagination items are in lib-paging.mjs.
import { C, Col, I, Row, T } from '../kit.mjs'
import { artistPaint } from './paint.mjs'

const COLS = [
  ['c2', 150],
  ['c3', 110],
  ['c4', 130],
  ['c5', 110],
]

/** Adds the catalogue controls, table and pagination pieces to the library. */
export function addCatalogue(lib) {
  const { comp, part, add, slot, use, nest } = lib
  const paint = artistPaint()
  const wrap = { width: 'fill_container', textGrowth: 'fixed-width', lineHeight: 1.5 }
  const small = (s, o = {}) => T(s, { fontSize: 11, fill: C.artistTextSecondary, ...o })
  add(
    comp(
      'Field/Search',
      Row(
        {
          name: 'Search',
          width: 280,
          height: 40,
          gap: 8,
          padding: [0, 12],
          cornerRadius: 10,
          ...paint.control(),
        },
        [
          I('search', { width: 15, height: 15, fill: C.artistTextSecondary }),
          part('value', T('Search tracks', { fontSize: 12, fill: C.artistTextSecondary, ...wrap })),
        ],
      ),
    ),
    comp(
      'Select/Pill',
      Row(
        {
          name: 'Select',
          height: 40,
          gap: 8,
          padding: [0, 12],
          cornerRadius: 10,
          ...paint.control(),
        },
        [
          part('icon', I('list-filter', { width: 15, height: 15, fill: C.artistTextSecondary })),
          part('label', T('Status: All', { fontSize: 12, fill: C.artistForeground })),
          I('chevron-down', { width: 15, height: 15, fill: C.artistTextSecondary }),
        ],
      ),
    ),
  )
  const cells = (head) =>
    COLS.map(([key, width]) =>
      part(
        key,
        head
          ? small(key.toUpperCase(), {
              fontSize: 9,
              letterSpacing: 0.8,
              width,
              textGrowth: 'fixed-width',
            })
          : small(key, { width, textGrowth: 'fixed-width' }),
      ),
    )
  add(
    comp(
      'Catalogue/Header',
      Row(
        { name: 'Catalogue Header', width: 1000, gap: 14, padding: [10, 16], ...paint.hairline() },
        [
          Row({ name: 'Play Space', width: 32, height: 1 }, []),
          part('c1', small('TRACK', { fontSize: 9, letterSpacing: 0.8, ...wrap })),
          ...cells(true),
          Row({ name: 'Actions Space', width: 32, height: 1 }, []),
        ],
      ),
    ),
    comp(
      'Catalogue/Row',
      Row({ name: 'Catalogue Row', width: 1000, gap: 14, padding: [10, 16], ...paint.hairline() }, [
        part(
          'play',
          use(
            'Button/Icon',
            { name: 'Preview', width: 32, height: 32 },
            { icon: { icon: 'play' } },
          ),
        ),
        Row({ name: 'Record', gap: 12, width: 'fill_container' }, [
          part('cover', use('Cover', { name: 'Cover' })),
          Col({ name: 'Text', gap: 2, width: 'fill_container' }, [
            part(
              'title',
              T('Night Signal', {
                fontSize: 12,
                fontWeight: '600',
                fill: C.artistForeground,
                ...wrap,
              }),
            ),
            part('artist', small('Mira Sol')),
          ]),
        ]),
        ...cells(false).slice(0, 1),
        Row({ name: 'Status Cell', width: 110 }, [
          slot('status', { layout: 'horizontal', width: 'fit_content', gap: 6 }),
        ]),
        ...cells(false).slice(2),
        part(
          'more',
          use(
            'Button/Icon',
            { name: 'Actions', width: 32, height: 32 },
            { icon: { icon: 'ellipsis' } },
          ),
        ),
      ]),
    ),
    comp(
      'Catalogue/Row Compact',
      Row({ name: 'Catalogue Row', width: 358, gap: 12, padding: [10, 12], ...paint.hairline() }, [
        part('cover', use('Cover', { name: 'Cover' })),
        Col({ name: 'Text', gap: 4, width: 'fill_container' }, [
          part(
            'title',
            T('Night Signal', {
              fontSize: 12,
              fontWeight: '600',
              fill: C.artistForeground,
              ...wrap,
            }),
          ),
          part('meta', small('Original · 3:42', wrap)),
          slot('status', { layout: 'horizontal', width: 'fit_content', gap: 6 }),
        ]),
        part(
          'more',
          use(
            'Button/Icon',
            { name: 'Actions', width: 32, height: 32 },
            { icon: { icon: 'ellipsis' } },
          ),
        ),
      ]),
    ),
  )
  for (const k of ['Catalogue/Row', 'Catalogue/Row Compact']) nest(k, 'more', 'Button/Icon')
  nest('Catalogue/Row', 'play', 'Button/Icon')
}
