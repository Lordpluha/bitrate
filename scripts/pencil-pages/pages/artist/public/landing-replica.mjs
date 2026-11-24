// The studio window per stage tab (LandingWorkspaceReplica): the mini shell around the release workspace
// (StudioWorkspacePreview), the dashboard (StudioDashboardPreview) and analytics
// (StudioAnalyticsPreview), with the demo numbers those previews show.

/** The replica builder bound to the screen helpers `ui`: `(m, tab) → window`. */
export function landingReplica(ui) {
  const { W, Tx, Row, Col, Tile, KV, St, Stats, TableRow } = ui
  const pair = (m, nodes) =>
    (m ? Col : Row)({ name: 'Tiles', width: 'fill_container', gap: 20, alignItems: 'start' }, nodes)
  const workspace = (m) => [
    W(
      m ? 'Release/Header Compact' : 'Release/Header',
      { name: 'Release Header', width: 'fill_container' },
      {
        title: { content: 'Night Signal' },
        meta: { content: 'Mira Sol · Single · 1 track' },
      },
    ),
    W(m ? 'Release/Stages Compact' : 'Release/Stages', {
      name: 'Stepper',
      width: 'fill_container',
    }),
    pair(m, [
      Tile('Credits & splits', 'users-round', [
        KV('Mira Sol · Performer, Producer', '75%'),
        KV('Kite Harbor · Composer', '25%'),
      ]),
      Tile(
        'Rights',
        'shield-check',
        [
          Tx('Muted', 'Who owns the recording.'),
          KV('Master owner', 'Mira Sol'),
          KV('UPC', '196589402184'),
        ],
        { right: [St('Ready', 'Ready')] },
      ),
    ]),
  ]
  const dashboard = (m) => [
    Col({ name: 'Heading', gap: 4, width: 'fill_container' }, [
      Tx('H1', 'Dashboard'),
      Tx('Muted', 'Everything you need for your next release.'),
    ]),
    pair(m, [
      Tile(
        'Current release',
        'disc-3',
        [
          KV('Night Signal', 'Planned Nov 14, 2026'),
          Tx('Muted', 'Draft saved · Nothing is published yet'),
        ],
        { right: [St('Neutral', 'Draft')] },
      ),
      Tile('Needs attention', 'bell', [Tx('Muted', 'All clear. Nothing needs your attention.')]),
    ]),
    Tile('Your catalogue', 'library', [
      Stats([
        ['Releases', '4', 'Live 2 · In review 1 · Drafts 1'],
        ['Tracks', '6', 'Across 4 releases'],
      ]),
    ]),
  ]
  const analytics = (m) => [
    Col({ name: 'Heading', gap: 4, width: 'fill_container' }, [
      Tx('H1', 'Analytics'),
      Tx('Muted', 'Plays and listeners on Bitrate, by UTC day.'),
    ]),
    ...(m
      ? [
          Stats([['Plays', '14,820', '32% vs previous period']]),
          Stats([['Listeners', '4,390', '22% vs previous period']]),
        ]
      : [
          Stats([
            ['Plays', '14,820', '32% vs previous period'],
            ['Listeners', '4,390', '22% vs previous period'],
            ['Average plays per listener', '3.4', 'Best day 11-05 · 1,040 plays'],
          ]),
        ]),
    W('Chart/Area', { name: 'Plays per day', width: 'fill_container' }),
    Tile('Top tracks', 'list-music', [
      TableRow('Night Signal', '6,420', '2,180'),
      TableRow('Echoes in Motion', '4,890', '1,640'),
      TableRow('Afterglow', '3,510', '1,120'),
    ]),
  ]
  const tabs = [workspace, dashboard, analytics]
  const NAV = [
    ['layout-dashboard', 'Dashboard'],
    ['music-2', 'Music'],
    ['chart-no-axes-combined', 'Analytics'],
  ]
  const SECTION = ['Music', 'Dashboard', 'Analytics']
  /* LandingWorkspaceReplica: the mini shell — brand and collapse, three sections, the account; the
     header with "Workspace / section", "Interactive demo" and "Sign up"; on a phone no sidebar */
  return (m, tab = 0) =>
    W(
      'Landing/Window',
      { name: 'Studio Window', width: m ? 'fill_container' : 1120 },
      {
        sidebar: m
          ? { enabled: false }
          : ui.fill(
              'Sidebar',
              [
                Row(
                  {
                    name: 'Brand',
                    width: 'fill_container',
                    gap: 8,
                    justifyContent: 'space_between',
                  },
                  [W('Logo/Lockup', { name: 'Lockup' }), W('Nav/Collapse', { name: 'Collapse' })],
                ),
                ...NAV.map(([icon, label]) =>
                  W(
                    label === SECTION[tab] ? 'Nav/Item Active' : 'Nav/Item',
                    { name: `Nav / ${label}` },
                    { icon: { icon }, label: { content: label } },
                  ),
                ),
                W(
                  'Nav/Account',
                  { name: 'Account' },
                  { name: { content: 'Mira Sol' }, email: { content: 'Artist account' } },
                ),
              ],
              { gap: 8 },
            ),
        header: ui.inline('Header', [
          Tx('Muted', `Workspace / ${SECTION[tab]}`),
          W(
            'Status/Brand',
            { name: 'Interactive demo' },
            { label: { content: 'Interactive demo' }, icon: { icon: 'sparkles' } },
          ),
          Tx('Link', 'Sign up'),
        ]),
        content: ui.fill('Replica', tabs[tab](m), { gap: 16, padding: m ? 14 : 20 }),
      },
    )
}
