// Landing closing sections: the listening response (ListeningResponse: demo plays per day over a chosen
// period, plays, listeners, plays per listener and the most played tracks) and the finale
// (LandingFinale: the empty release sleeve that starts a sign-up, "Create your release").
import { coverFill } from '../workspace/demo.mjs'
import { landingHeading } from './landing-heading.mjs'

/* 28-day demo numbers of views/ArtistView/lib/listeningPreview.ts */
const TRACKS = [
  ['Night Signal', '7,280'],
  ['Echoes in Motion', '6,320'],
  ['Afterglow', '4,820'],
]

/** The listening and finale section builders bound to the screen helpers `ui`. */
export function landingClose(ui) {
  const { W, Tx, Row, Col, fill, Tabs, St, KV } = ui
  const heading = landingHeading(ui)
  /* ListeningResponse: the chart card (Plays beside the period switch), the "Most played" record
     spotlight with the audience panel, and the top tracks */
  const listening = (m) =>
    Col({ name: 'Listening', gap: 28, width: 'fill_container', alignItems: 'center' }, [
      heading(
        m,
        'After the premiere',
        'Your sound.',
        'Their response.',
        'See how your music finds its audience.',
      ),
      (m ? Col : Row)({ name: 'Visual', gap: 20, width: 'fill_container', alignItems: 'start' }, [
        W(
          'Tile',
          { name: 'Tile / Listening on Bitrate', width: 'fill_container' },
          {
            icon: { icon: 'audio-lines' },
            title: { content: 'Listening on Bitrate' },
            right: fill('Right', [St('Neutral', 'Demo data')], {
              layout: 'horizontal',
              width: 'fit_content',
              gap: 8,
            }),
            body: fill(
              'Body',
              [
                (m ? Col : Row)(
                  {
                    name: 'Summary',
                    gap: 12,
                    width: 'fill_container',
                    alignItems: m ? 'start' : 'end',
                    justifyContent: 'space_between',
                  },
                  [
                    W(
                      'Stat/First',
                      { name: 'Plays' },
                      {
                        label: { content: 'Plays' },
                        value: { content: '18,420' },
                        caption: { enabled: false },
                      },
                    ),
                    Tabs(['7 days', '28 days', '90 days'], 1),
                  ],
                ),
                W('Chart/Area', { name: 'Plays per day', width: 'fill_container' }),
              ],
              { gap: 16 },
            ),
          },
        ),
        Col({ name: 'Spotlight', gap: 16, width: m ? 'fill_container' : 340 }, [
          Col({ name: 'Record', gap: 8, width: 'fill_container', alignItems: 'center' }, [
            W('Cover/Large', { name: 'Night Signal', ...coverFill('night-signal') }),
            W(
              'Status/Brand',
              { name: 'Most played' },
              { label: { content: 'Most played · 1' }, icon: { icon: 'headphones' } },
            ),
          ]),
          W(
            'Panel',
            { name: 'Audience', width: 'fill_container' },
            {
              content: fill('Content', [KV('Listeners', '5,210'), KV('Plays / listener', '3.5')], {
                gap: 4,
              }),
            },
          ),
          W(
            'Tile',
            { name: 'Tile / Top tracks', width: 'fill_container' },
            {
              icon: { icon: 'music-2' },
              title: { content: 'Top tracks' },
              right: { enabled: false },
              body: fill(
                'Body',
                TRACKS.map(([title, plays], i) => KV(`0${i + 1}  ${title}`, plays)),
              ),
            },
          ),
        ]),
      ]),
      Col({ name: 'Invite', gap: 12, alignItems: 'center', width: 'fill_container' }, [
        Tx('Muted', 'Try a different period. Watch the story change.', { textAlign: 'center' }),
        Tx('Link', 'Start your next release'),
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
