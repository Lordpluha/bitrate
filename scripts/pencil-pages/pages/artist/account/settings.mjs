// Artist / Settings (views/SettingsView): one page of panels — Account, Security, Appearance, Language,
// Notifications and the Danger zone (two columns on desktop, stacked on a phone); loading and error of
// the page and of each panel, two-factor setup and turn-off, the reset link, device sign-out and the
// delete-account confirmation.
import { pageSpec } from '../../../artist-ws/spec.mjs'
import { pageSkeleton } from '../workspace/page-skeleton.mjs'
import { settingsPanels } from './settings-panels.mjs'
import { settingsSecurity } from './settings-security.mjs'

/** The settings page spec. */
export function settingsPage(ui, frames) {
  const { P, Col, Btn } = ui
  const skeleton = pageSkeleton(ui)
  const { pageHead } = frames
  const s = settingsPanels(ui)
  const security = settingsSecurity(ui)
  const shell = { nav: 'settings', crumb: 'Settings', action: 'Create release' }
  const head = () => pageHead('Settings', 'Your account, security and workspace preferences.')
  /* one column of panels (max-w-3xl) in the code's order */
  const page = (m, o = {}) => [
    head(),
    Col({ name: 'Panels', gap: m ? 16 : 20, width: m ? 'fill_container' : 768 }, [
      s.account(o),
      security(o),
      s.appearance(),
      s.language(o),
      s.notifications(o),
      s.danger(),
    ]),
  ]
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
    ['All devices', (m) => page(m, { allDevices: true })],
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
    ['Loading', (m) => [head(), ...skeleton(m)]],
    [
      'Error',
      () => [
        head(),
        P('Body', 'Could not load your profile. Please try again.'),
        Btn('Try again', 'Outline'),
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
