// Workspace navigation (DashboardDesignNavigation + ArtistDashboard sidebar): seven sections, the
// active pill, the collapse control, preferences, support and the account; expanded (248px) and
// collapsed (80px) glass sidebars.
import { C, Col, F, Row, T } from '../kit.mjs'
import { artistPaint } from './paint.mjs'

/** key → [lucide icon, label]; the order of the shipped sidebar */
const NAV = [
  ['dashboard', 'layout-dashboard', 'Dashboard'],
  ['music', 'music-2', 'Music'],
  ['distribution', 'send', 'Distribution'],
  ['promotion', 'megaphone', 'Promotion'],
  ['analytics', 'chart-no-axes-combined', 'Analytics'],
  ['profile', 'user-round', 'Profile'],
  ['settings', 'settings-2', 'Settings'],
]
/* SidebarPreferences: language, then theme; Help & support is a text button (not in the rail) */
const PREFS = [
  ['language', 'globe', 'English'],
  ['theme', 'moon', 'Dark'],
]

/** Adds the expanded and collapsed sidebars to the library; returns the sections for the phone menu. */
export function addNav(lib) {
  const { comp, part, add, use, nest, reg } = lib
  const paint = artistPaint()
  const sidebar = (name, rail) =>
    comp(
      name,
      Col(
        {
          name: 'Sidebar',
          width: rail ? 80 : 248,
          height: 1000,
          gap: 0,
          padding: [16, 12, 20, 12],
          ...(rail ? { alignItems: 'center' } : {}),
          ...paint.chrome({ right: 1 }),
        },
        [
          (rail ? Col : Row)(
            {
              name: 'Brand',
              width: 'fill_container',
              gap: rail ? 12 : 16,
              padding: rail ? [0, 0, 20, 0] : [0, 12],
              height: rail ? 'fit_content' : 98,
              alignItems: rail ? 'center' : 'start',
              justifyContent: rail ? 'start' : 'space_between',
            },
            [
              rail ? use('Logo/Mark', { name: 'Mark' }) : use('Logo/Lockup', { name: 'Lockup' }),
              part(
                'collapse',
                use(
                  'Nav/Collapse',
                  { name: 'Collapse' },
                  rail ? { icon: { icon: 'panel-left-open' } } : {},
                ),
              ),
            ],
          ),
          Col(
            {
              name: 'Navigation',
              gap: 8,
              width: 'fill_container',
              alignItems: rail ? 'center' : 'start',
            },
            [
              ...NAV.map(([key, icon, label]) =>
                part(
                  `nav_${key}`,
                  rail
                    ? use('Nav/Rail Item', { name: `Nav / ${label}` }, { icon: { icon } })
                    : use(
                        'Nav/Item',
                        { name: `Nav / ${label}` },
                        { icon: { icon }, label: { content: label } },
                      ),
                ),
              ),
            ],
          ),
          F({
            name: 'Spacer',
            width: 'fill_container',
            height: 'fill_container',
            layout: 'vertical',
          }),
          Col(
            {
              name: 'Footer',
              gap: 2,
              width: 'fill_container',
              padding: [12, 0, 0, 0],
              alignItems: rail ? 'center' : 'start',
            },
            [
              ...PREFS.map(([key, icon, label]) =>
                part(
                  `pref_${key}`,
                  use(
                    'Nav/Preference',
                    {
                      name: `Preference / ${key}`,
                      ...(rail ? { width: 44, padding: 0, justifyContent: 'center' } : {}),
                    },
                    { icon: { icon }, label: rail ? { enabled: false } : { content: label } },
                  ),
                ),
              ),
              ...(rail
                ? []
                : [
                    Row(
                      { name: 'Support', width: 'fill_container', height: 32, padding: [0, 12] },
                      [
                        part(
                          'support',
                          T('Help & support', { fontSize: 13, fill: C.artistTextSecondary }),
                        ),
                      ],
                    ),
                  ]),
              F({ name: 'Gap', width: 'fill_container', height: 10 }),
              rail
                ? use('Avatar/Fallback', { name: 'Avatar' })
                : part('account', use('Nav/Account', { name: 'Account' })),
            ],
          ),
        ],
      ),
    )
  add(sidebar('Sidebar', false), sidebar('Sidebar/Collapsed', true))
  for (const s of ['Sidebar', 'Sidebar/Collapsed']) {
    const kind = s === 'Sidebar' ? 'Nav/Item' : 'Nav/Rail Item'
    for (const k of Object.keys(reg[s].parts).filter((p) => /^nav_/.test(p))) nest(s, k, kind)
    for (const k of Object.keys(reg[s].parts).filter((p) => /^pref_/.test(p)))
      nest(s, k, 'Nav/Preference')
  }
  return NAV
}
