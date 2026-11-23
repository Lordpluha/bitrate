// Chrome of the artist landing (LandingHeader, LandingPreferences, LandingMobileMenu, LandingFooter):
// the header with the section dock (theme button shows the current theme), the theme and language
// popovers, the phone page menu and the legal footer.

const LANDING_NAV = ['Product', 'Releases', 'Journey', 'Credits', 'Listening']
const LEGAL = [
  'Terms of Use',
  'Artist Agreement',
  'Privacy Policy',
  'Community Guidelines',
  'Copyright',
]
const THEME_ICON = { Dark: 'moon', Light: 'sun', Dim: 'eclipse' }

/** Landing chrome helpers bound to the screen helpers `ui`. */
export function landingChrome(ui) {
  const { W, Tx, inline, fill } = ui
  const header = (m, theme = 'Dark', active = 0) =>
    m
      ? W(
          'Landing/Header Mobile',
          { name: 'Header', width: 'fill_container' },
          { 'theme.icon': { icon: THEME_ICON[theme] } },
        )
      : W(
          'Landing/Header',
          { name: 'Header', width: 'fill_container' },
          {
            'theme.icon': { icon: THEME_ICON[theme] },
            dock: inline(
              'Dock',
              LANDING_NAV.map((label, i) =>
                W(
                  i === active ? 'Landing/Pill Active' : 'Landing/Pill',
                  { name: `Pill / ${label}` },
                  { label: { content: label } },
                ),
              ),
            ),
          },
        )
  const footer = (m) =>
    W(
      m ? 'Landing/Footer Compact' : 'Landing/Footer',
      { name: 'Footer', width: 'fill_container' },
      {
        links: fill(
          'Links',
          LEGAL.map((l) => Tx('Muted', l)),
          {
            layout: m ? 'vertical' : 'horizontal',
            width: 'fit_content',
            gap: m ? 10 : 24,
          },
        ),
      },
    )
  const option = (selected, icon, label) =>
    W(
      selected ? 'Menu/Option Selected' : 'Menu/Option',
      { name: `Option / ${label}`, width: 'fill_container' },
      {
        icon: icon ? { icon } : { enabled: false },
        label: { content: label },
      },
    )
  const themePanel = (theme = 'Dark') =>
    W(
      'Popover',
      { name: 'Theme Popover' },
      {
        title: { content: 'Theme' },
        items: fill(
          'Items',
          [
            option(theme === 'Light', 'sun', 'Light'),
            option(theme === 'Dark', 'moon', 'Dark'),
            option(theme === 'Dim', 'eclipse', 'Dim'),
          ],
          { gap: 4 },
        ),
      },
    )
  const languagePanel = () =>
    W(
      'Popover',
      { name: 'Language Popover' },
      {
        title: { content: 'Interface language' },
        items: fill(
          'Items',
          [
            option(true, null, 'EN  English'),
            option(false, null, 'UK  Українська'),
            option(false, null, 'PL  Polski'),
          ],
          { gap: 4 },
        ),
      },
    )
  const menu = (active = 0) =>
    W(
      'Landing/Menu',
      { name: 'Page Menu', width: 'fill_container' },
      {
        links: fill(
          'Links',
          LANDING_NAV.map((label, i) =>
            W(
              i === active ? 'Landing/Menu Link Active' : 'Landing/Menu Link',
              { name: `Link / ${label}`, width: 'fill_container' },
              { label: { content: label } },
            ),
          ),
          { gap: 0 },
        ),
      },
    )
  return { header, footer, themePanel, languagePanel, menu }
}
