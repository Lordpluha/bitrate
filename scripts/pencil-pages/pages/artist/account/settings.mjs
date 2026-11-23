// Artist / Settings (views/SettingsView): one page of panels — Account, Security, Appearance, Language,
// Notifications and the Danger zone (two columns on desktop, stacked on a phone); loading and error of
// the page and of each panel, two-factor setup and turn-off, the reset link, device sign-out and the
// delete-account confirmation.
import { pageSpec } from '../../../artist-ws/spec.mjs'
import { settingsPanels } from './settings-panels.mjs'
import { settingsSecurity } from './settings-security.mjs'

/** The settings page spec. */
export function settingsPage(ui, frames) {
  const { W, P, Row, Col, Btn } = ui
  const { pageHead } = frames
  const s = settingsPanels(ui)
  const security = settingsSecurity(ui)
  const shell = { nav: 'settings', crumb: 'Settings', action: 'Create release' }
  const head = () => pageHead('Settings', 'Your account, security and workspace preferences.')
  const page = (m, o = {}) => {
    const left = [s.account(o), security(o), s.danger()]
    const right = [s.appearance(), s.language(o), s.notifications(o)]
    return [
      head(),
      m
        ? Col({ name: 'Panels', gap: 16, width: 'fill_container' }, [
            left[0],
            left[1],
            ...right,
            left[2],
          ])
        : Row({ name: 'Panels', gap: 20, width: 'fill_container', alignItems: 'start' }, [
            Col({ name: 'Left', gap: 20, width: 'fill_container' }, left),
            Col({ name: 'Right', gap: 20, width: 'fill_container' }, right),
          ]),
    ]
  }
  const over = (o) => (m) => [head(), s.deleteDialog(m, o)]
  const states = [
    ['Email not verified', (m) => page(m, { unverified: true })],
    ['Two-factor preparing', (m) => page(m, { preparing: true })],
    ['Two-factor setup', (m) => page(m, { setup: true })],
    ['Two-factor wrong code', (m) => page(m, { setup: true, codeError: true })],
    ['Two-factor checking', (m) => page(m, { setup: true, checking: true })],
    ['Two-factor on', (m) => page(m, { on: true })],
    ['Turning two-factor off', (m) => page(m, { on: true, turningOff: true })],
    ['Reset link sent', (m) => page(m, { resetSent: true })],
    ['Signing out devices', (m) => page(m, { signingOut: true })],
    ['Devices signed out', (m) => page(m, { signedOut: true })],
    ['Devices loading', (m) => page(m, { sessionsLoading: true })],
    ['Devices error', (m) => page(m, { sessionsError: true })],
    ['Notifications loading', (m) => page(m, { loading: true })],
    ['Notifications error', (m) => page(m, { error: true })],
    ['Notifications saving', (m) => page(m, { saving: true })],
    ['Notifications not saved', (m) => page(m, { saveError: true })],
    ['Language not saved', (m) => page(m, { failed: true })],
    ['Delete account', over({})],
    ['Delete account confirmed', over({ typed: true })],
    ['Deleting account', over({ typed: true, busy: true })],
    [
      'Loading',
      () => [
        head(),
        P('Muted', 'Loading settings…'),
        ...[1, 2].map((i) =>
          W('Skeleton/Tile', { name: `Skeleton ${i}`, width: 'fill_container' }),
        ),
      ],
    ],
    [
      'Error',
      () => [
        head(),
        P('Body', 'Could not load your profile. Please try again.'),
        Btn('Try again', 'Outline', 'refresh-cw'),
      ],
    ],
  ]
  return pageSpec(
    frames,
    {
      title: 'Artist / Settings',
      route: '/dashboard/settings',
      context:
        'One page of panels, no tabs. Appearance is saved in this browser; language follows the account.',
    },
    shell,
    (m) => page(m),
    states.map(([label, build]) => [label, shell, build]),
  )
}
