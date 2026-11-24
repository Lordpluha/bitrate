// Landing story sections (LandingFeatures): the release journey (ReleaseJourney: a three-step tablist
// driving one scene — the record, the active step's panel, "BITRATE / NIGHT SIGNAL 0X / 03") and the
// credits scene (LandingCredits: the people with their count, the cover, the splits panel; note below).
import { coverFill } from '../workspace/demo.mjs'
import { landingHeading } from './landing-heading.mjs'

const STEPS = [
  [
    'Draft — Make it yours.',
    'Bring your master, artwork and release details together in one private draft.',
  ],
  [
    'Review — Ready for a closer listen.',
    'Confirm the credits and rights, then send the complete release to Bitrate for review.',
  ],
  [
    'Live — Let the world press play.',
    'Once approved, publish on Bitrate when you are ready — or set a date for the premiere.',
  ],
]
const STATUS = [
  ['Neutral', 'Private draft'],
  ['Processing', 'In review'],
  ['Ready', 'Published'],
]

/** The journey and credits section builders bound to the screen helpers `ui`. */
export function landingStory(ui) {
  const { W, Tx, P, Row, Col, St, Check, KV, Btn } = ui
  const heading = landingHeading(ui)
  const panel = (step) =>
    [
      () => [
        Tx('Caption', 'It starts with your sound.'),
        Check(true, 'Master uploaded · WAV'),
        Check(true, 'Artwork · Artwork added'),
        P('Muted', 'Draft saved. Only you can see it.'),
      ],
      () => [
        Tx('Caption', 'Every detail, accounted for.'),
        Check(true, 'Audio & artwork'),
        KV('Credits & splits', '100%'),
        Check(true, 'Recording rights confirmed'),
        W(
          'Check/Info',
          { name: 'Pending', width: 'fill_container' },
          { label: { content: 'Submitted for Bitrate review' } },
        ),
      ],
      () => [
        Tx('Caption', 'From your studio to their headphones.'),
        Tx('H2', 'Live on Bitrate'),
        W('Player/Track', { name: 'Waveform', width: 'fill_container' }),
        P('Muted', 'Approved, published and ready to be heard.'),
        Btn('Start your release', 'Primary', 'arrow-right'),
      ],
    ][step]()
  const journey = (m, step = 0) =>
    Col({ name: 'Journey', gap: 28, width: 'fill_container', alignItems: 'center' }, [
      heading(
        m,
        'One release. Every step.',
        'From master to premiere.',
        null,
        'The same release, from your first upload to its first listener. Keep everything together as your music moves forward.',
      ),
      (m ? Col : Row)({ name: 'Body', gap: 24, width: 'fill_container', alignItems: 'start' }, [
        Col(
          { name: 'Steps', gap: 4, width: m ? 'fill_container' : 380 },
          STEPS.map(([title, detail], i) =>
            W(
              `Row/Step ${i < step ? 'Done' : i === step ? 'Current' : 'Upcoming'}`,
              { name: `Step ${i + 1}`, width: 'fill_container' },
              { title: { content: title }, detail: { content: detail } },
            ),
          ),
        ),
        W(
          'Panel',
          { name: 'Scene', width: 'fill_container' },
          {
            content: ui.fill(
              'Scene',
              [
                Row(
                  {
                    name: 'Scene header',
                    width: 'fill_container',
                    justifyContent: 'space_between',
                  },
                  [Tx('Body Strong', 'Your release, taking shape'), St(...STATUS[step])],
                ),
                (m ? Col : Row)(
                  { name: 'Scene body', gap: 20, width: 'fill_container', alignItems: 'start' },
                  [
                    Col({ name: 'Record', gap: 8, alignItems: 'center' }, [
                      W('Cover/Large', {
                        name: 'Night Signal release artwork',
                        ...coverFill('night-signal'),
                      }),
                      Tx('Caption', 'Mira Sol · Single'),
                    ]),
                    Col({ name: 'Step panel', gap: 10, width: 'fill_container' }, panel(step)),
                  ],
                ),
                Row(
                  {
                    name: 'Scene footer',
                    width: 'fill_container',
                    justifyContent: 'space_between',
                  },
                  [Tx('Eyebrow', 'BITRATE / NIGHT SIGNAL'), Tx('Eyebrow', `0${step + 1} / 03`)],
                ),
              ],
              { gap: 16 },
            ),
          },
        ),
      ]),
      Row({ name: 'Footer', width: 'fill_container', gap: 12, justifyContent: 'space_between' }, [
        Tx('Muted', 'Scroll to follow the release'),
        Tx('Caption', 'Publishing on Bitrate. External store delivery is not connected yet.'),
      ]),
    ])
  const person = (selected, initials, name, meta, share) =>
    W(
      selected ? 'Row/Person Selected' : 'Row/Person',
      { name: `Person / ${name}`, width: 'fill_container' },
      {
        'avatar.initials': { content: initials },
        name: { content: name },
        meta: { content: meta },
        share: { content: share },
      },
    )
  const credits = (m) =>
    Col({ name: 'Credits', gap: 24, width: 'fill_container' }, [
      heading(
        m,
        'Behind every release',
        'Made together.',
        'Credited together.',
        'Keep every contributor, role and share connected to the music. Agree the details before you send your release for review.',
      ),
      (m ? Col : Row)({ name: 'Scene', gap: 20, width: 'fill_container', alignItems: 'center' }, [
        W(
          'Tile',
          { name: 'Tile / People', width: m ? 'fill_container' : 340 },
          {
            icon: { icon: 'users-round' },
            title: { content: 'The people behind the sound' },
            right: ui.inline('Count', [Tx('Eyebrow', '02')]),
            body: ui.fill('Body', [
              person(true, 'MS', 'Mira Sol', 'Performer · Producer', '75%'),
              person(false, 'KH', 'Kite Harbor', 'Composer', '25%'),
              P('Caption', 'Choose a name to see their shares.'),
            ]),
          },
        ),
        Col({ name: 'Release', gap: 8, width: 'fill_container', alignItems: 'center' }, [
          W('Ring/Stage', { name: 'Orbit' }, { label: { content: '75%' } }),
          W('Cover/Large', { name: 'Night Signal release artwork', ...coverFill('night-signal') }),
          Tx('H2', 'Night Signal'),
          Tx('Caption', 'Mira Sol · Demo data'),
        ]),
        W(
          'Tile',
          { name: 'Tile / Splits', width: m ? 'fill_container' : 340 },
          {
            icon: { icon: 'percent' },
            title: { content: 'Credits & splits' },
            right: { enabled: false },
            body: ui.fill('Body', [
              Tx('H2', 'Mira Sol'),
              KV('Master', '75%'),
              KV('Publishing', '75%'),
              W('Progress', { name: 'Shares', width: 'fill_container' }, { bar: { width: 220 } }),
              Check(true, '100% of both rights accounted for'),
            ]),
          },
        ),
      ]),
      P('Muted', 'Credits and shares stay attached to your release.'),
    ])
  return { journey, credits }
}
