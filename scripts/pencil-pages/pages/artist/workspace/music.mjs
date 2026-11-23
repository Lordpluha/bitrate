// Artist / Music (views/MusicView + widgets/MusicCatalogue): tracks and releases in one catalogue with
// filters, the draft notices, the table (rows on a phone) and pagination of six; loading, error,
// first-time and filtered empty states, counts unavailable, a preview playing in the now-playing
// island, the item dialog and the "Upload track" explainer.
import { pageSpec } from '../../../artist-ws/spec.mjs'
import { coverFill } from './demo.mjs'
import { musicDialogs } from './music-dialogs.mjs'
import { musicTable } from './music-table.mjs'

/** The music page spec. */
export function musicPage(ui, frames) {
  const { W, Tx, P, Row, Col, inline, Btn } = ui
  const { pageHead } = frames
  const cat = musicTable(ui)
  const dlg = musicDialogs(ui)
  const shell = { nav: 'music', crumb: 'Music', action: 'Create release' }
  const head = (m) =>
    pageHead('Music', m ? '6 tracks · 4 releases' : 'Manage tracks, releases and drafts.')
  const notice = (tone, text, link) =>
    W(
      `Alert/${tone}`,
      { name: `Notice / ${text.slice(0, 20)}`, width: 'fill_container' },
      {
        title: { content: text },
        body: { enabled: false },
        action: link ? inline('Action', [link]) : { enabled: false },
      },
    )
  const page = (m, tab = 'tracks', o = {}) => [
    head(m),
    cat.toolbar(m, tab, o.counts),
    cat.filters(m, tab, o.filters),
    ...(o.notices ?? []),
    cat.surface(m, tab, o.surface),
    ...(o.after ?? []),
  ]
  const message = (m, title, body, actions, icon = 'disc-3') => [
    W(
      'State/Empty',
      { name: `Empty / ${title.slice(0, 20)}`, width: 'fill_container' },
      {
        icon: { icon },
        title: { content: title },
        body: m ? { content: body, width: 'fill_container' } : { content: body },
        action: inline('Action', actions),
      },
    ),
  ]
  const loading = (tab) => [
    Col({ name: 'Loading', gap: 0, width: 'fill_container', padding: 16 }, [
      Tx('Muted', tab === 'tracks' ? 'Loading your tracks…' : 'Loading your releases…'),
      ...[1, 2, 3, 4, 5, 6].map((i) =>
        W('Skeleton/Row', { name: `Skeleton ${i}`, width: 'fill_container' }),
      ),
    ]),
  ]
  const failed = (tab) => [
    Col({ name: 'Error', gap: 16, width: 'fill_container', padding: [48, 24] }, [
      P(
        'Body',
        tab === 'tracks'
          ? 'Could not load your tracks. Please try again.'
          : 'Could not load your releases. Please try again.',
      ),
      Btn('Try again', 'Outline', 'refresh-cw'),
    ]),
  ]
  const island = Row({ name: 'Island', width: 'fill_container', justifyContent: 'center' }, [
    W('Island/Now Playing Expanded', { name: 'Now playing' }, { cover: coverFill('night-signal') }),
  ])
  const over = (dialog) => (m) => [head(m), dialog(m)]
  return pageSpec(
    frames,
    {
      title: 'Artist / Music',
      route: '/dashboard/music?tab=&q=&status=&type=&sort=&page=',
      context:
        'The catalogue: tracks by default, releases after a draft is created. Six rows per page; on releases the Updated column folds into the row subtitle.',
    },
    shell,
    (m) => page(m),
    [
      ['Releases', shell, (m) => page(m, 'releases')],
      [
        'Draft created',
        shell,
        (m) =>
          page(m, 'releases', {
            notices: [notice('Success', 'Draft created. Your release is saved in Music.')],
          }),
      ],
      [
        'Draft updated',
        shell,
        (m) => page(m, 'releases', { notices: [notice('Info', 'Draft updated: Night Signal')] }),
      ],
      [
        'Counts unavailable',
        shell,
        (m) =>
          page(m, 'tracks', {
            counts: ['…', '…'],
            notices: [
              notice(
                'Warning',
                'Counts unavailable.',
                Btn('Try again', 'Compact Ghost', 'refresh-cw'),
              ),
            ],
          }),
      ],
      [
        'Filtered',
        shell,
        (m) =>
          page(m, 'tracks', {
            filters: { q: 'night', status: 'Status: Processing' },
            surface: { list: cat.rows('tracks').slice(0, 1), range: '1–1 of 1' },
          }),
      ],
      [
        'Second page',
        shell,
        (m) =>
          page(m, 'tracks', {
            counts: ['14', '4'],
            surface: { range: '7–12 of 14', pages: 3, page: 2 },
          }),
      ],
      ['Loading', shell, (m) => page(m, 'tracks', { surface: { body: loading('tracks') } })],
      ['Error', shell, (m) => page(m, 'tracks', { surface: { body: failed('tracks') } })],
      [
        'First track',
        shell,
        (m) =>
          page(m, 'tracks', {
            counts: ['0', '0'],
            surface: {
              body: message(
                m,
                'Your first track starts here',
                'Your recordings and their preparation stages will appear here.',
                [
                  Btn('Create release', 'Primary', 'plus'),
                  Btn('Upload track', 'Outline', 'upload'),
                ],
                'audio-lines',
              ),
            },
          }),
      ],
      [
        'First release',
        shell,
        (m) =>
          page(m, 'releases', {
            counts: ['0', '0'],
            surface: {
              body: message(
                m,
                'Your first release starts here',
                'Create a draft with a title and release type. Your music stays unpublished while you prepare it.',
                [Btn('Create your first release', 'Primary', 'plus')],
              ),
            },
          }),
      ],
      [
        'No matches',
        shell,
        (m) =>
          page(m, 'tracks', {
            filters: { q: 'lullaby' },
            surface: {
              body: message(
                m,
                'No matching tracks',
                'Try another search or reset your filters.',
                [Btn('Reset filters', 'Outline', 'rotate-ccw')],
                'search',
              ),
            },
          }),
      ],
      [
        'Playing preview',
        shell,
        (m) => page(m, 'tracks', { surface: { playing: 0 }, after: [island] }),
      ],
      ['Release actions', shell, over((m) => dlg.release(m, true))],
      ['Release details', shell, over((m) => dlg.release(m, false))],
      ['Track actions', shell, over(dlg.track)],
      ['Upload track', shell, over(dlg.uploadTrack)],
    ],
  )
}
