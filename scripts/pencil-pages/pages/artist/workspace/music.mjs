// Artist / Music (views/MusicView + widgets/MusicCatalogue): tracks and releases with filters, notices,
// table and pagination; loading, error, empty (first-time, filtered), counts unavailable, a preview in
// the now-playing island, the item dialog and the "Upload track" explainer.
import { pageSpec } from '../../../artist-ws/spec.mjs'
import { musicDialogs } from './music-dialogs.mjs'
import { musicStates } from './music-states.mjs'
import { musicTable } from './music-table.mjs'

/** The music page spec. */
export function musicPage(ui, frames) {
  const { W, inline, Btn } = ui
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
  const { message, loading, failed, island } = musicStates(ui)
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
        (m) => page(m, 'tracks', { surface: { playing: 0 }, after: [island(m)] }),
      ],
      ['Release actions', shell, over((m) => dlg.release(m, true))],
      ['Release details', shell, over((m) => dlg.release(m, false))],
      ['Track actions', shell, over(dlg.track)],
      ['Upload track', shell, over(dlg.uploadTrack)],
    ],
  )
}
