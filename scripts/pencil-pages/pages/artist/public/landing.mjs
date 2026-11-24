// Artist / Landing (routes/index.tsx → views/ArtistView): header with the section dock, hero with the
// studio window, release journey, credits, listening response, finale and the legal footer, over the
// living-workspace backdrop (the landing's spotlight beams, studio grid and horizon have no flex
// equivalent; the aurora stands in). States: theme and language popovers, the phone page menu, the
// studio window on its other tabs and the next capability phrase.
import { landingChrome } from './landing-chrome.mjs'
import { landingClose } from './landing-close.mjs'
import { landingHero } from './landing-hero.mjs'
import { landingStory } from './landing-story.mjs'
import { publicSpec } from './spec.mjs'

/** The landing page spec. */
export function landingPage(ui, frames) {
  const { Col, Row } = ui
  const chrome = landingChrome(ui)
  const hero = landingHero(ui)
  const { journey, credits } = landingStory(ui)
  const { listening, finale } = landingClose(ui)
  const band = (m, name, nodes, o = {}) =>
    Col(
      {
        name,
        gap: m ? 56 : 112,
        width: 'fill_container',
        alignItems: 'center',
        padding: m ? [0, 16] : [0, 80],
        ...o,
      },
      nodes,
    )
  const header = (m, theme, overlay) => [
    band(m, 'Header Bar', [chrome.header(m, theme)], m ? { padding: 0 } : {}),
    ...(overlay
      ? [
          Row(
            {
              name: 'Overlay',
              width: 'fill_container',
              justifyContent: 'end',
              padding: m ? [0, 16] : [0, 80],
            },
            [overlay],
          ),
        ]
      : []),
  ]
  const page = (m, theme = 'Dark', { tab = 0, overlay, short = false } = {}) => [
    ...header(m, theme, overlay),
    band(
      m,
      'Main',
      short ? hero(m, tab) : [...hero(m, tab), journey(m), credits(m), listening(m), finale(m)],
      {
        padding: m ? [0, 16, 48, 16] : [0, 80, 80, 80],
      },
    ),
    ...(short ? [] : [band(m, 'Footer Bar', [chrome.footer(m)])]),
  ]
  const layout = { center: false }
  return publicSpec(
    frames,
    {
      title: 'Artist / Landing',
      route: '/',
      context:
        'Public page for artists who are not signed in: what the workspace does today, with sign-up and log-in. Static content, so no loading, empty or error states. Motion (split headline, morph pill, magnetic actions, scroll-linked journey) is not drawn.',
      layout,
    },
    (m, theme) => page(m, theme),
    [
      [
        'Theme picker',
        (m) => page(m, 'Dark', { overlay: chrome.themePanel('Dark'), short: true }),
        layout,
      ],
      [
        'Language picker',
        (m) => page(m, 'Dark', { overlay: chrome.languagePanel(), short: true }),
        layout,
      ],
      ['Dashboard preview', (m) => page(m, 'Dark', { tab: 1, short: true }), layout],
      ['Analytics preview', (m) => page(m, 'Dark', { tab: 2, short: true }), layout],
      [
        'Page menu',
        () => [band(true, 'Menu', [chrome.menu(0)], { padding: [8, 16, 48, 16] })],
        layout,
        { side: 'mobile', reason: 'the page menu replaces the section dock below 1280px only' },
      ],
    ],
  )
}
