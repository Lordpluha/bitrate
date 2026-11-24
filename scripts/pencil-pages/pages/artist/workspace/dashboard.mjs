// Artist / Dashboard (views/DashboardView + widgets/DashboardOverview): the eight tiles in the default
// arrangement of config/tiles.ts, the first-run poster until a release exists, loading and error, the
// tiles' own states, Customize mode, the lead track in the now-playing island, and the "coming soon"
// notices behind Promotion and Help & support.
import { pageSpec } from '../../../artist-ws/spec.mjs'
import { bento } from './bento.mjs'
import { layoutCustomize } from './customize.mjs'
import { dashboardLists } from './dashboard-lists.mjs'
import { dashboardTiles } from './dashboard-tiles.mjs'
import { coverFill } from './demo.mjs'
import { pageSkeleton } from './page-skeleton.mjs'
import { workspaceModal } from './workspace-modal.mjs'

const SUB = 'Everything you need for your next release.'

/** The dashboard page spec. */
export function dashboardPage(ui, frames) {
  const { W, P, Row, Btn } = ui
  const { pageHead } = frames
  const t = { ...dashboardTiles(ui), ...dashboardLists(ui) }
  const grid = bento(ui)
  const skeleton = pageSkeleton(ui)
  const modal = workspaceModal(ui)
  const shell = { nav: 'dashboard', crumb: 'Dashboard', action: 'Create release' }
  /* [rows of [span, label, build(c, m, o)]] in config/tiles.ts order */
  const TILES = [
    [
      6,
      [
        [8, 'Current release', (c, m, o) => t.current(c, m, o)],
        [4, 'Needs attention', (c, _m, o) => t.attention(c, !o.clear)],
      ],
    ],
    [
      3,
      [
        [8, 'Your catalogue', (c) => t.numbers(c)],
        [4, 'Next premiere', (c, _m, o) => t.premiere(c, !o.clear)],
      ],
    ],
    [
      6,
      [
        [8, 'Your releases', (c, _m, o) => t.releases(c, o.releases)],
        [4, 'Coming up', (c, _m, o) => t.comingUp(c, o.clear)],
      ],
    ],
    [
      4,
      [
        [8, 'Recent activity', (c, _m, o) => t.activity(c, o.activity)],
        [4, 'Listening data', (c) => t.listening(c)],
      ],
    ],
  ]
  const byLabel = Object.fromEntries(
    TILES.flatMap(([, cols]) => cols.map(([, label, build]) => [label, build])),
  )
  const edit = layoutCustomize(ui, {
    title: 'Dashboard',
    sub: SUB,
    rows: TILES.map(([h, cols]) => [h, cols.map(([n, label]) => [n, label])]),
    render: (label, size) => byLabel[label](size, false, {}),
  })
  const head = (m, customize = true) =>
    pageHead(
      'Dashboard',
      SUB,
      customize && !m ? [Btn('Customize', 'Compact Outline', 'layout-grid')] : [],
    )
  const overview = (m, o = {}) =>
    grid(
      m,
      TILES.map(([h, cols]) => [h, cols.map(([n, , build]) => [n, (c, p) => build(c, p, o)])]),
    )
  const page = (m, o = {}) => [head(m), overview(m, o), ...(o.after ? [o.after(m)] : [])]
  const island = (m) =>
    Row({ name: 'Island', width: 'fill_container', justifyContent: 'center' }, [
      W(
        'Island/Now Playing',
        { name: 'Now playing', ...(m ? { width: 'fill_container' } : {}) },
        { cover: coverFill('night-signal') },
      ),
    ])
  const notice = (title, text) => (m) => [
    head(m),
    modal(m, title, [P('Link', 'Coming soon'), P('Muted', text)], [Btn('Got it', 'Primary')], 440),
  ]
  const desktopOnly = {
    side: 'desktop',
    reason: 'phones show the layout read-only, without Customize',
  }
  const states = [
    ['Loading', (m) => [head(m, false), ...skeleton(m)]],
    [
      'Error',
      (m) => [
        head(m, false),
        P('Body', 'Could not load your dashboard. Please try again.'),
        Btn('Try again', 'Outline'),
      ],
    ],
    [
      'First release',
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
    ['All clear', (m) => page(m, { clear: true })],
    ['No release in progress', (m) => page(m, { none: true })],
    ['Master not uploaded', (m) => page(m, { noMaster: true })],
    ['Release published', (m) => page(m, { published: true })],
    ['Releases loading', (m) => page(m, { releases: 'loading' })],
    ['Releases unavailable', (m) => page(m, { releases: 'error' })],
    ['Activity loading', (m) => page(m, { activity: 'loading' })],
    ['No activity', (m) => page(m, { activity: 'empty' })],
    ['Customize', () => [edit.heading(pageHead), ...edit.canvas()], desktopOnly],
    [
      'Customize with removed blocks',
      () => [
        edit.heading(pageHead),
        ...edit.canvas({ removed: ['Recent activity', 'Listening data'] }),
      ],
      desktopOnly,
    ],
    [
      'Customize saving',
      () => [edit.heading(pageHead, { saving: true }), ...edit.canvas()],
      desktopOnly,
    ],
    [
      'Customize save failed',
      () => [edit.heading(pageHead, { error: true }), ...edit.canvas()],
      desktopOnly,
    ],
    ['Playing lead track', (m) => page(m, { after: island })],
    [
      'Promotion coming soon',
      notice(
        'Promotion',
        'Promotion tools are coming soon. Campaigns and paid promotion are not available yet.',
      ),
    ],
    [
      'Help & support coming soon',
      notice(
        'Help & support',
        'The support center is coming soon. No support request has been sent.',
      ),
    ],
  ]
  return pageSpec(
    frames,
    {
      title: 'Artist / Dashboard',
      route: '/dashboard',
      context:
        'Home of the workspace. Tiles sit on the 12-column grid (64px rows) in the default order of widgets/DashboardOverview/config/tiles.ts and stack on phones.',
    },
    shell,
    (m) => page(m),
    states.map(([label, build, only]) => [label, shell, build, only]),
  )
}
