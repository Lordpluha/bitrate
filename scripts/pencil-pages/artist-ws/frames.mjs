// Screen frames for the artist workspace: the backdrop (canvas + aurora) as the screen frame's own fill
// around the desktop or phone shell, the page heading, the release header with its stepper, and the
// 12-column bento grid (columns 73px wide with 20px gaps in the 1096px content area; one column on phones).
import { F } from '../kit.mjs'
import { workspaceCanvas } from './canvas.mjs'

const NAV = {
  dashboard: ['layout-dashboard', 'Dashboard'],
  music: ['music-2', 'Music'],
  distribution: ['send', 'Distribution'],
  promotion: ['megaphone', 'Promotion'],
  analytics: ['chart-no-axes-combined', 'Analytics'],
  profile: ['user-round', 'Profile'],
  settings: ['settings-2', 'Settings'],
}
const THEME_ICON = { Dark: 'moon', Light: 'sun', Dim: 'eclipse' }
/** Width of a tile spanning `n` of the 12 columns. */
const span = (n) => 93 * n - 20

/** Frame and layout helpers bound to the screen helpers `ui`. */
export function artistFrames(ui) {
  const { W, Tx, P, Row, Col, fill } = ui
  const screen = (name, width, shell) =>
    F(
      {
        name,
        width,
        height: 'fit_content',
        layout: 'vertical',
        clip: true,
        fill: workspaceCanvas(),
      },
      [shell],
    )
  const desktop = (
    { nav, crumb, action = null, actionIcon = 'plus', theme = 'Dark', back = false },
    nodes,
  ) => {
    const [icon, label] = NAV[nav]
    return screen(
      'Desktop',
      1440,
      W(
        'Shell/Desktop',
        { name: 'Shell', width: 1440 },
        {
          [`sidebar.nav_${nav}`]: W(
            'Nav/Item Active',
            { name: `Nav / ${label}` },
            { icon: { icon }, label: { content: label } },
          ),
          'sidebar.pref_theme.icon': { icon: THEME_ICON[theme] },
          'sidebar.pref_theme.label': { content: theme },
          'header.crumb': { content: crumb },
          /* the release workspace swaps Create release for the outline "Back to music" */
          ...(back
            ? {
                'header.action': W(
                  'Button/Outline',
                  { name: 'Back to music' },
                  { label: { content: 'Back to music' }, icon: { enabled: false } },
                ),
              }
            : action
              ? {
                  'header.action.label': { content: action },
                  'header.action.icon': actionIcon ? { icon: actionIcon } : { enabled: false },
                }
              : { 'header.action': { enabled: false } }),
          content: fill('Content', nodes.flat(), { gap: 20, padding: [36, 48, 48, 48] }),
        },
      ),
    )
  }
  const mobile = (nodes) =>
    screen(
      'Mobile',
      390,
      W(
        'Shell/Mobile',
        { name: 'Shell', width: 390 },
        {
          content: fill('Content', nodes.flat(), { gap: 16, padding: [12, 16, 40, 16] }),
        },
      ),
    )
  const pageHead = (title, sub, actions = []) =>
    Row({ name: 'Page Heading', width: 'fill_container', gap: 16, alignItems: 'end' }, [
      Col({ name: 'Text', gap: 4 }, [Tx('H1', title), P('Muted', sub)]),
      ...(actions.length ? [Row({ name: 'Actions' }, actions)] : []),
    ])
  /** The release header and stepper; `o` overrides header parts (status, meta, next action). */
  const releaseHead = (m, o = {}, stepper = {}) => [
    W(
      m ? 'Release/Header Compact' : 'Release/Header',
      { name: 'Release Header', width: 'fill_container' },
      o,
    ),
    W(
      m ? 'Release/Stepper Compact' : 'Release/Stepper',
      { name: 'Stepper', width: 'fill_container' },
      stepper,
    ),
  ]
  /** Bento columns: `[[span, nodes], …]` side by side on desktop, stacked on a phone. */
  const grid = (m, cols) =>
    m
      ? cols.flatMap(([, nodes]) => nodes)
      : Row(
          { name: 'Bento Row', width: 'fill_container', gap: 20, alignItems: 'start' },
          cols.map(([n, nodes]) => Col({ name: `Span ${n}`, width: span(n), gap: 20 }, nodes)),
        )
  return { desktop, mobile, pageHead, releaseHead, grid }
}
