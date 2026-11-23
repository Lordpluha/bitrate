// Artist / Legal (routes/legal.$slug.tsx → views/LegalView): one legal document as a readable article
// — title, headed sections of paragraphs, notes, lists and tables — and links to the other documents.
// A draft document carries the draft banner; outside English the banner adds "English only". An unknown
// slug renders the not-found page (pencil/web-artist-design/not-found).
import { COMMUNITY, COMPLAINTS, LEGAL_TITLES, PRIVACY, TERMS } from './legal-data.mjs'
import { publicSpec } from './spec.mjs'

const DRAFT = 'Draft — pending legal review. Text in [[double brackets]] is not filled in yet.'
const ENGLISH_ONLY = 'This document is available in English only.'

/** The legal page spec. */
export function legalPage(ui, frames) {
  const { W, Tx, P, Col, fill } = ui
  const full = (name) => ({ name, width: 'fill_container' })
  const block =
    (m) =>
    ([kind, a, b]) => {
      if (kind === 'p')
        return Tx('Reading', a, { width: 'fill_container', textGrowth: 'fixed-width' })
      if (kind === 'note') return W('Legal/Note', full('Note'), { text: { content: a } })
      if (kind === 'list')
        return Col(
          { name: 'List', gap: 4, width: 'fill_container' },
          a.map((item) => W('Legal/Item', full('Item'), { text: { content: item } })),
        )
      /* table: on a phone each row becomes a stack of key–value rows */
      if (m)
        return Col(
          { name: 'Table', gap: 12, width: 'fill_container' },
          b.map((row) =>
            Col(
              { name: 'Row', gap: 0, width: 'fill_container' },
              row.map((cell, i) =>
                W('Row/Key Value', full(`Cell / ${a[i]}`), {
                  label: { content: a[i] },
                  value: { content: cell },
                  trail: { enabled: false },
                }),
              ),
            ),
          ),
        )
      const cols = { c2: { width: 220 }, c3: { width: 170 } }
      return Col({ name: 'Table', gap: 0, width: 'fill_container' }, [
        W('Table/Header', full('Header'), {
          c1: { content: a[0] },
          c2: { content: a[1], ...cols.c2 },
          c3: { content: a[2], ...cols.c3 },
          c4: { enabled: false },
        }),
        ...b.map((row) =>
          W('Table/Row', full(`Row / ${row[0].slice(0, 20)}`), {
            c1: { content: row[0] },
            c2: { content: row[1], ...cols.c2 },
            c3: { content: row[2], ...cols.c3 },
            trail: { enabled: false },
          }),
        ),
      ])
    }
  const article = (m, doc, notices = []) =>
    W(
      'Panel',
      { name: 'Article', width: m ? 'fill_container' : 768, padding: m ? 20 : 40 },
      {
        content: fill(
          'Content',
          [
            ...(notices.length
              ? [
                  W('Alert/Info', full('Notice'), {
                    title: { content: notices.join(' ') },
                    body: { enabled: false },
                    action: { enabled: false },
                  }),
                ]
              : []),
            Tx('Title', doc.title),
            ...doc.sections.map(([heading, blocks]) =>
              Col({ name: heading ?? 'Lead-in', gap: 12, width: 'fill_container' }, [
                ...(heading ? [Tx('H2', heading)] : []),
                ...blocks.map(block(m)),
              ]),
            ),
            W('Divider', full('Divider')),
            P('Muted', 'Other legal documents'),
            Col(
              { name: 'Other documents', gap: 8 },
              LEGAL_TITLES.filter((t) => t !== doc.title).map((t) => Tx('Link', t)),
            ),
          ],
          { gap: 24 },
        ),
      },
    )
  return publicSpec(
    frames,
    {
      title: 'Artist / Legal',
      route: '/legal/$slug (terms, privacy, community, complaints, copyright, artist-agreement)',
      context:
        'Static documents bundled with the app: no loading or empty states. Drafts are noindex and carry the draft banner.',
    },
    (m) => [article(m, TERMS)],
    [
      ['Table', (m) => [article(m, PRIVACY)]],
      ['Draft document', (m) => [article(m, COMMUNITY, [DRAFT])]],
      ['Note block', (m) => [article(m, COMPLAINTS, [DRAFT])]],
      ['Not in English', (m) => [article(m, COMMUNITY, [DRAFT, ENGLISH_ONLY])]],
    ],
  )
}
