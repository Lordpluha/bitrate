// Artist / Workspace search (features/workspace-actions WorkspaceSearch in the workspace modal, opened
// from the header's "Search workspace" or ⌘K): sections filter as you type; from two characters it
// also searches releases and tracks. States: results, searching, nothing found, unavailable.
import { pageSpec } from '../../../artist-ws/spec.mjs'
import { workspaceModal } from '../workspace/workspace-modal.mjs'

const SECTIONS = [
  ['layout-dashboard', 'Dashboard'],
  ['disc-3', 'Music'],
  ['send', 'Distribution'],
  ['chart-no-axes-combined', 'Analytics'],
  ['user-round', 'Profile'],
  ['settings-2', 'Settings'],
]

/** The workspace-search page spec. */
export function workspaceSearchPage(ui, frames) {
  const { W, Tx, P, Col } = ui
  const modal = workspaceModal(ui)
  const shell = { nav: 'dashboard', crumb: 'Dashboard', action: 'Create release' }
  const result = (icon, label, active = false) =>
    W(
      active ? 'Row/Result Active' : 'Row/Result',
      { name: `Result / ${label}`, width: 'fill_container' },
      { icon: { icon }, label: { content: label } },
    )
  const group = (title, rows) =>
    Col({ name: `Group / ${title}`, gap: 4, width: 'fill_container' }, [
      Tx('Eyebrow', title.toUpperCase()),
      ...rows,
    ])
  const search = (m, query, groups, status) =>
    modal(
      m,
      'Search workspace',
      [
        W(
          'Field/Search',
          { name: 'Query', width: 'fill_container' },
          { value: { content: query || 'Search releases, tracks and sections…' } },
        ),
        ...groups,
        ...(status ? [P('Muted', status)] : []),
      ],
      [],
      560,
    )
  const all = group(
    'Sections',
    SECTIONS.map(([, label]) => result('search', label)),
  )
  const night = [
    group('Releases', [result('disc-3', 'Night Signal')]),
    group('Tracks', [result('music-2', 'Night Signal')]),
  ]
  return pageSpec(
    frames,
    {
      title: 'Artist / Workspace search',
      route: 'overlay on every /dashboard page',
      context:
        'Modal over the workspace. Results link to the section, the release workspace or the track in Music; sections show the search icon, releases a disc and tracks a note, as in WorkspaceSearch.',
    },
    shell,
    (m) => [search(m, '', [all])],
    [
      ['Results', shell, (m) => [search(m, 'night', night)]],
      [
        'Section match',
        shell,
        (m) => [search(m, 'mu', [group('Sections', [result('search', 'Music')])])],
      ],
      ['Searching', shell, (m) => [search(m, 'nigh', [], 'Searching…')]],
      ['Nothing found', shell, (m) => [search(m, 'lullaby', [], 'Nothing matches your search.')]],
      ['Unavailable', shell, (m) => [search(m, 'night', [], 'Search is unavailable right now.')]],
    ],
  )
}
