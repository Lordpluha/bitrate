// Artist / Mobile menu (widgets/ArtistDashboard DashboardMobileMenu): below the desktop breakpoint the
// sidebar becomes a drawer behind the header's menu button — brand and close, the workspace sections
// (Promotion opens its coming-soon notice), theme and language, help and the account. Its desktop
// counterpart is the sidebar, drawn here collapsed (the shell's collapse control).
import { workspaceCanvas } from '../../../artist-ws/canvas.mjs'
import { F } from '../../../kit.mjs'

const NAV = [
  ['dashboard', 'layout-dashboard', 'Dashboard'],
  ['music', 'disc-3', 'Music'],
  ['distribution', 'send', 'Distribution'],
  ['promotion', 'megaphone', 'Promotion'],
  ['analytics', 'chart-no-axes-combined', 'Analytics'],
  ['profile', 'user-round', 'Profile'],
  ['settings', 'settings-2', 'Settings'],
]
const THEME_ICON = { Dark: 'moon', Light: 'sun', Dim: 'contrast' }

/** The mobile-menu page spec. */
export function mobileMenuPage(ui, frames) {
  const { W, fill } = ui
  const { pageHead } = frames
  const head = () => pageHead('Dashboard', 'Everything you need for your next release.')
  const phone = (children) =>
    F(
      {
        name: 'Mobile',
        width: 390,
        height: 844,
        layout: 'vertical',
        clip: true,
        fill: workspaceCanvas(),
      },
      [W('Status Bar', { name: 'Status Bar' }), ...children],
    )
  const item =
    (active) =>
    ([key, icon, label]) =>
      W(
        key === active ? 'Nav/Item Active' : 'Nav/Item',
        { name: `Nav / ${label}`, width: 'fill_container' },
        { icon: { icon }, label: { content: label } },
      )
  const pref = (icon, label) =>
    W(
      'Nav/Preference',
      { name: `Pref / ${label}`, width: 'fill_container' },
      { icon: { icon }, label: { content: label } },
    )
  const drawer = (active = 'dashboard', theme = 'Dark') =>
    phone([
      W(
        'Mobile/Drawer',
        { name: 'Menu Drawer', height: 797 },
        {
          nav: fill('Nav', NAV.map(item(active)), { gap: 4 }),
          prefs: fill('Prefs', [pref(THEME_ICON[theme], theme), pref('languages', 'English')], {
            gap: 4,
          }),
          account: fill(
            'Account',
            [
              pref('life-buoy', 'Help & support'),
              W(
                'Nav/Account',
                { name: 'Account', width: 'fill_container' },
                { name: { content: 'Mira Sol' }, email: { content: 'mira@nightsignal.fm' } },
              ),
            ],
            { gap: 12 },
          ),
        },
      ),
    ])
  const desktop = (theme) =>
    F(
      {
        name: 'Desktop',
        width: 1440,
        height: 'fit_content',
        layout: 'vertical',
        clip: true,
        fill: workspaceCanvas(),
      },
      [
        W(
          'Shell/Desktop',
          { name: 'Shell', width: 1440 },
          {
            sidebar: W(
              'Sidebar/Collapsed',
              { name: 'Sidebar', height: 'fill_container' },
              {
                nav_dashboard: W(
                  'Nav/Rail Item Active',
                  { name: 'Nav / Dashboard' },
                  { icon: { icon: 'layout-dashboard' } },
                ),
                'pref_theme.icon': { icon: THEME_ICON[theme] },
              },
            ),
            'header.crumb': { content: 'Dashboard' },
            'header.action.label': { content: 'Create release' },
            'header.action.icon': { icon: 'plus' },
            content: fill('Content', [head()], { gap: 20, padding: [36, 48, 48, 48] }),
          },
        ),
      ],
    )
  return {
    title: 'Artist / Mobile menu',
    route: 'drawer from the header menu button on every /dashboard page (below 1280px)',
    context:
      'The phone and tablet navigation. Choosing a section closes the drawer; Escape or a tap outside closes it too.',
    desktop,
    mobile: () => frames.mobile([head()]),
    states: [
      {
        label: 'Open',
        mobile: () => drawer(),
        reason: 'the drawer exists below the desktop breakpoint only',
      },
      {
        label: 'Open on Music',
        mobile: () => drawer('music'),
        reason: 'the drawer exists below the desktop breakpoint only',
      },
    ],
  }
}
