// Artist / Dashboard (views/DashboardView + widgets/DashboardOverview): the returning artist's bento of
// eight tiles in the default arrangement of config/tiles.ts, the first-run poster until a release
// exists, loading and error, tile-level states, Customize mode with the "Add a block" drawer, and the
// lead track playing in the now-playing island.
import { pageSpec } from '../../../artist-ws/spec.mjs'
import { bento } from './bento.mjs'
import { dashboardCustomize, REMOVED } from './dashboard-customize.mjs'
import { dashboardLists } from './dashboard-lists.mjs'
import { dashboardTiles } from './dashboard-tiles.mjs'
import { coverFill } from './demo.mjs'

const SUB = 'Everything you need for your next release.'

/** The dashboard page spec. */
export function dashboardPage(ui, frames) {
  const { W, Tx, P, Col, Btn } = ui
  const { pageHead } = frames
  const t = { ...dashboardTiles(ui), ...dashboardLists(ui) }
  const grid = bento(ui)
  const edit = dashboardCustomize(ui)
  const shell = { nav: 'dashboard', crumb: 'Dashboard', action: 'Create release' }
  const head = (m, customize = true) =>
    pageHead(
      'Dashboard',
      SUB,
      customize && !m ? [Btn('Customize', 'Compact Outline', 'layout-grid')] : [],
    )
  const overview = (m, o = {}) =>
    grid(m, [
      [
        6,
        [
          [8, (c, p) => t.current(c, p)],
          [4, (c) => t.attention(c, !o.clear)],
        ],
      ],
      [
        3,
        [
          [8, (c) => t.numbers(c)],
          [4, (c) => t.premiere(c, !o.clear)],
        ],
      ],
      [
        6,
        [
          [8, (c) => t.releases(c)],
          [4, (c) => t.comingUp(c)],
        ],
      ],
      [
        4,
        [
          [8, (c) => t.activity(c)],
          [4, (c) => t.listening(c)],
        ],
      ],
    ])
  const skeleton = (m) =>
    Col({ name: 'Loading', gap: 20, width: 'fill_container' }, [
      Tx('Muted', 'Loading your workspace…'),
      ...(m ? [1, 2, 3] : [1, 2]).map((i) =>
        W('Skeleton/Tile', { name: `Skeleton ${i}`, width: 'fill_container' }),
      ),
    ])
  const island = () =>
    ui.Row({ name: 'Island', width: 'fill_container', justifyContent: 'center' }, [
      W('Island/Now Playing', { name: 'Now playing' }, { cover: coverFill('night-signal') }),
    ])
  const desktopOnly = {
    side: 'desktop',
    reason: 'phones show the layout read-only, without Customize',
  }
  return pageSpec(
    frames,
    {
      title: 'Artist / Dashboard',
      route: '/dashboard',
      context:
        'Home of the workspace. Tiles sit on the 12-column grid (64px rows) in the default order of widgets/DashboardOverview/config/tiles.ts and stack on phones.',
    },
    shell,
    (m) => [head(m), overview(m)],
    [
      ['Loading', shell, (m) => [head(m, false), skeleton(m)]],
      [
        'Error',
        shell,
        (m) => [
          head(m, false),
          P('Body', 'Could not load your dashboard. Please try again.'),
          Btn('Try again', 'Outline', 'refresh-cw'),
        ],
      ],
      [
        'First release',
        shell,
        (m) => [
          head(m, false),
          W(
            'Poster',
            { name: 'First release', width: 'fill_container' },
            {
              desc: {
                content:
                  'Upload your audio and artwork. We’ll help you prepare your release details and find the next step.',
              },
              action: ui.inline('Action', [Btn('Create your first release', 'Primary', 'plus')]),
            },
          ),
        ],
      ],
      ['All clear', shell, (m) => [head(m), overview(m, { clear: true })]],
      [
        'Layout not loaded',
        shell,
        (m) => [
          head(m),
          W(
            'Alert/Warning',
            { name: 'Layout error', width: 'fill_container' },
            {
              title: { content: 'Your layout could not be loaded, so the default one is shown.' },
              body: { enabled: false },
              action: { enabled: false },
            },
          ),
          overview(m),
        ],
      ],
      ['Customize', shell, () => [edit.heading(pageHead), ...edit.canvas()], desktopOnly],
      [
        'Customize with removed blocks',
        shell,
        () => [edit.heading(pageHead), ...edit.canvas({ removed: REMOVED })],
        desktopOnly,
      ],
      [
        'Customize saving',
        shell,
        () => [edit.heading(pageHead, { saving: true }), ...edit.canvas()],
        desktopOnly,
      ],
      [
        'Customize save failed',
        shell,
        () => [edit.heading(pageHead), ...edit.canvas({ error: true })],
        desktopOnly,
      ],
      ['Playing lead track', shell, (m) => [head(m), overview(m), island()]],
    ],
  )
}
