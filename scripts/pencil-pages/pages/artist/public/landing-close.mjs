// Landing closing sections: the listening response (ListeningResponse: demo plays per day over a chosen
// period, plays, listeners, plays per listener and the most played tracks) and the finale
// (LandingFinale: the empty release sleeve that starts a sign-up, "Create your release").
import { landingHeading } from './landing-heading.mjs'

/* 28-day demo numbers of views/ArtistView/lib/listeningPreview.ts */
const TRACKS = [
  ['Night Signal', '7,280'],
  ['Echoes in Motion', '6,320'],
  ['Afterglow', '4,820'],
]

const STATS = [
  ['Plays', '18,420', 'See how your music moves over time.'],
  ['Listeners', '5,210', 'Know how many listeners you reach.'],
  ['Plays / listener', '3.5', 'Most played: Night Signal'],
]

/** The listening and finale section builders bound to the screen helpers `ui`. */
export function landingClose(ui) {
  const { W, Tx, Row, Col, fill, Tabs, Stats, St, TableRow } = ui
  const heading = landingHeading(ui)
  const listening = (m) =>
    Col({ name: 'Listening', gap: 32, width: 'fill_container', alignItems: 'center' }, [
      heading(
        m,
        'After the premiere',
        'Your sound.',
        'Their response.',
        'See how your music finds its audience.',
      ),
      W(
        'Tile',
        { name: 'Tile / Listening on Bitrate', width: m ? 'fill_container' : 960 },
        {
          icon: { icon: 'audio-lines' },
          title: { content: 'Listening on Bitrate' },
          right: fill('Right', [St('Neutral', 'Demo data', 'flask-conical')], {
            layout: 'horizontal',
            width: 'fit_content',
            gap: 8,
          }),
          body: fill(
            'Body',
            [
              Tabs(['7 days', '28 days', '90 days'], 1),
              ...(m ? STATS.map((stat) => Stats([stat])) : [Stats(STATS)]),
              Tx('Muted', 'Plays per day'),
              W('Chart/Area', { name: 'Plays per day', width: 'fill_container' }),
              Tx('H3', 'Top tracks'),
              ...TRACKS.map(([title, plays], i) => TableRow(title, `#${i + 1}`, plays)),
            ],
            { gap: 16 },
          ),
        },
      ),
      Col({ name: 'Invite', gap: 12, alignItems: 'center', width: 'fill_container' }, [
        Tx('Muted', 'Try a different period. Watch the story change.', { textAlign: 'center' }),
        W(
          'Button/Large Primary',
          { name: 'Start your next release' },
          { label: { content: 'Start your next release' } },
        ),
        Tx('Caption', 'Plays and listeners on Bitrate.', { textAlign: 'center' }),
      ]),
    ])
  const finale = (m) =>
    Col(
      {
        name: 'Finale',
        gap: 28,
        width: 'fill_container',
        alignItems: 'center',
        padding: m ? [24, 0] : [48, 0],
      },
      [
        heading(
          m,
          'Now, it’s your turn.',
          'Your next release',
          'starts here.',
          'Bring the music. Start with a draft.',
        ),
        W('Landing/Sleeve', { name: 'Release Sleeve' }),
        W(
          'Button/Large Primary',
          { name: 'Create your release' },
          { label: { content: 'Create your release' } },
        ),
        Row({ name: 'Existing', gap: 6 }, [
          Tx('Muted', 'Already on Bitrate?'),
          Tx('Link', 'Log in'),
        ]),
      ],
    )
  return { listening, finale }
}
