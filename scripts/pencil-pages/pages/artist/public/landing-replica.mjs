// The studio window's content per stage tab (LandingWorkspaceReplica): the release workspace
// (StudioWorkspacePreview), the dashboard (StudioDashboardPreview) and analytics
// (StudioAnalyticsPreview), with the demo numbers those previews show.

/** The replica builder bound to the screen helpers `ui`: `(m, tab) → nodes`. */
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
    W(
      m ? 'Release/Stepper Compact' : 'Release/Stepper',
      { name: 'Stepper', width: 'fill_container' },
      {
        line_promotion: { enabled: false },
        step_promotion: { enabled: false },
      },
    ),
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
  return (m, tab = 0) => tabs[tab](m)
}
