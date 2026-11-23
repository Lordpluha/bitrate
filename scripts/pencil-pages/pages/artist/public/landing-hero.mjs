// Landing hero (LandingHero + LandingWorkspaceReplica): eyebrow pill, the headline, the capability
// morph pill (cycles every 3 s), lead, the two account actions, the studio stage tabs and the studio
// window replaying the workspace on the chosen tab (landing-replica.mjs).
import { landingReplica } from './landing-replica.mjs'

const TABS = [
  ['01', 'disc-3', 'Release workspace'],
  ['02', 'layout-dashboard', 'Dashboard'],
  ['03', 'chart-no-axes-combined', 'Analytics'],
]

/** The hero section builder bound to the screen helpers `ui`. */
export function landingHero(ui) {
  const { W, Tx, Row, Col, inline, fill } = ui
  const center = { textAlign: 'center', width: 'fill_container', textGrowth: 'fixed-width' }
  const replica = landingReplica(ui)
  const stageTabs = (tab) =>
    TABS.map(([step, icon, label], i) =>
      W(
        i === tab ? 'Landing/Stage Tab Active' : 'Landing/Stage Tab',
        { name: `Tab / ${label}` },
        {
          step: { content: step },
          icon: { icon },
          label: { content: label },
        },
      ),
    )
  return (m, tab = 0) => [
    Col(
      {
        name: 'Hero Copy',
        gap: 20,
        width: 'fill_container',
        alignItems: 'center',
        padding: m ? [24, 0, 0, 0] : [56, 160, 0, 160],
      },
      [
        W('Landing/Eyebrow', { name: 'Eyebrow' }, m ? { meta: { enabled: false } } : {}),
        Tx(m ? 'Section' : 'Hero', 'Plan, prepare and track your releases.', center),
        (m ? Col : Row)({ name: 'Capabilities', gap: 8, alignItems: 'center' }, [
          Tx('Muted', 'Built for independent artists:'),
          W(
            'Landing/Morph',
            { name: 'Capability' },
            { label: { content: '24-bit / 48 kHz WAV master verification' } },
          ),
        ]),
        Tx(
          'Lead',
          'One workspace for the releases you put out on Bitrate: drafts, credits and rights, publishing and listening analytics.',
          center,
        ),
        (m ? Col : Row)(
          {
            name: 'Actions',
            gap: 14,
            alignItems: 'center',
            ...(m ? { width: 'fill_container' } : {}),
          },
          [
            W(
              'Button/Large Primary',
              { name: 'Create an account', ...(m ? { width: 'fill_container' } : {}) },
              { label: { content: 'Create an account' } },
            ),
            W(
              'Button/Large Glass',
              { name: 'Log in', ...(m ? { width: 'fill_container' } : {}) },
              { label: { content: 'Log in' }, icon: { enabled: false } },
            ),
          ],
        ),
      ],
    ),
    Col({ name: 'Studio Stage', gap: 20, width: 'fill_container', alignItems: 'center' }, [
      m
        ? Col({ name: 'Stage Tabs', gap: 4, width: 'fill_container' }, stageTabs(tab))
        : inline('Stage Tabs', stageTabs(tab)),
      W(
        'Landing/Window',
        { name: 'Studio Window', width: m ? 'fill_container' : 1120 },
        {
          title: { content: TABS[tab][2] },
          content: fill('Replica', replica(m, tab), { gap: 20, padding: m ? 14 : 24 }),
        },
      ),
    ]),
  ]
}
