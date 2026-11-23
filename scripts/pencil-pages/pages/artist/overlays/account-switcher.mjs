// Artist / Account switcher (widgets/ArtistDashboard DashboardAccount in the workspace modal, opened
// from the sidebar account): the accounts saved on this browser (current one first), switch, remove,
// add another (up to 5) and sign out; loading, load failed, limit reached, update failed and sign-out
// failed.
import { pageSpec } from '../../../artist-ws/spec.mjs'
import { workspaceModal } from '../workspace/workspace-modal.mjs'

const OTHERS = [
  ['Kite Harbor', 'K'],
  ['Mira Sol Live', 'M'],
  ['Night Signal Duo', 'N'],
  ['Afterglow Sessions', 'A'],
]

/** The account-switcher page spec. */
export function accountSwitcherPage(ui, frames) {
  const { W, Tx, P, Row, Col, inline, Btn } = ui
  const modal = workspaceModal(ui)
  const shell = { nav: 'dashboard', crumb: 'Dashboard', action: 'Create release' }
  const current = W(
    'Row/Account Current',
    { name: 'Account / Mira Sol', width: 'fill_container' },
    {
      'avatar.initials': { content: 'M' },
      title: { content: 'Mira Sol' },
      meta: { content: 'Active account' },
      trail: { enabled: false },
    },
  )
  const other = ([name, initial]) =>
    W(
      'Row/Account',
      { name: `Account / ${name}`, width: 'fill_container' },
      {
        'avatar.initials': { content: initial },
        title: { content: name },
        meta: { content: 'Switch to this account' },
        trail: inline('Trail', [
          W(
            'Button/Icon',
            { name: `Remove ${name}`, width: 32, height: 32 },
            { icon: { icon: 'x' } },
          ),
        ]),
      },
    )
  const switcher = (m, o = {}) =>
    modal(m, 'Accounts', [
      P('Muted', 'Accounts you have signed in to on this browser.'),
      Col(
        { name: 'Accounts', gap: 8, width: 'fill_container' },
        o.loading ? [] : [current, ...OTHERS.slice(0, o.count ?? 1).map(other)],
      ),
      ...(o.loading
        ? [
            Row({ name: 'Loading', gap: 8 }, [
              W('Spinner', { name: 'Spinner' }),
              Tx('Caption', 'Loading saved accounts…'),
            ]),
          ]
        : []),
      ...(o.error
        ? [
            Col({ name: 'Error', gap: 8, width: 'fill_container' }, [
              P('Error', o.error),
              ...(o.retry ? [Btn('Try again', 'Compact Outline', 'refresh-cw')] : []),
            ]),
          ]
        : []),
      Btn('Add another account', 'Outline', 'user-plus', {
        width: 'fill_container',
        ...(o.full || o.loading ? { opacity: 0.45 } : {}),
      }),
      P(
        'Caption',
        'Save up to 5 accounts. Removing one here signs it out on this browser; it does not delete the account.',
      ),
      W('Divider', { name: 'Divider', width: 'fill_container' }),
      ...(o.signOutError ? [P('Error', 'Could not sign out. Please try again.')] : []),
      Btn('Sign out', 'Danger', 'log-out', { width: 'fill_container' }),
    ])
  return pageSpec(
    frames,
    {
      title: 'Artist / Account switcher',
      route: 'modal from the sidebar account on every /dashboard page',
      context:
        'Saved sessions live in this browser. Switching reloads the workspace as the chosen artist; Add another account opens /login?addAccount.',
    },
    shell,
    (m) => [switcher(m)],
    [
      ['Loading', shell, (m) => [switcher(m, { loading: true })]],
      [
        'Load failed',
        shell,
        (m) => [
          switcher(m, {
            loading: true,
            error: 'Could not load saved accounts. Try again.',
            retry: true,
          }),
        ],
      ],
      ['Limit reached', shell, (m) => [switcher(m, { count: 4, full: true })]],
      [
        'Update failed',
        shell,
        (m) => [switcher(m, { error: 'Could not update saved accounts. Please try again.' })],
      ],
      [
        'Session unavailable',
        shell,
        (m) => [
          switcher(m, {
            error:
              'This saved session is no longer available. Refresh the list or sign in to that account again.',
          }),
        ],
      ],
      ['Sign-out failed', shell, (m) => [switcher(m, { signOutError: true })]],
    ],
  )
}
