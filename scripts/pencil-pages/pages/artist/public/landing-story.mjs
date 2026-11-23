// Landing story sections (LandingFeatures): the release journey (ReleaseJourney: Draft → Review → Live,
// one card per stage with its checks) and the credits scene (LandingCredits: contributors, roles and
// shares, the 100 % total).
import { landingHeading } from './landing-heading.mjs'

const JOURNEY = [
  [
    'DRAFT',
    'Make it yours.',
    'Bring your master, artwork and release details together in one private draft.',
    ['Neutral', 'Private draft'],
    [
      ['Master uploaded · WAV', true],
      ['Artwork added', true],
    ],
    'It starts with your sound.',
  ],
  [
    'REVIEW',
    'Ready for a closer listen.',
    'Confirm the credits and rights, then send the complete release to Bitrate for review.',
    ['Processing', 'In review'],
    [
      ['Recording rights confirmed', true],
      ['Submitted for Bitrate review', false],
    ],
    'Every detail, accounted for.',
  ],
  [
    'LIVE',
    'Let the world press play.',
    'Once approved, publish on Bitrate when you are ready — or set a date for the premiere.',
    ['Ready', 'Published'],
    [['Live on Bitrate', true]],
    'From your studio to their headphones.',
  ],
]

/** The journey and credits section builders bound to the screen helpers `ui`. */
export function landingStory(ui) {
  const { W, Tx, Row, Col, fill, inline, St, Check } = ui
  const heading = landingHeading(ui)
  const journey = (m) =>
    Col({ name: 'Journey', gap: 32, width: 'fill_container', alignItems: 'center' }, [
      heading(
        m,
        'One release. Every step.',
        'From master to premiere.',
        null,
        'The same release, from your first upload to its first listener. Keep everything together as your music moves forward.',
      ),
      (m ? Col : Row)(
        { name: 'Steps', gap: 20, width: 'fill_container', alignItems: 'start' },
        JOURNEY.map(([label, title, desc, [tone, status], checks, caption]) =>
          W(
            'Landing/Step',
            { name: `Step / ${label}`, width: 'fill_container' },
            {
              label: { content: label },
              status: inline('Status', [St(tone, status)]),
              title: { content: title },
              desc: { content: desc },
              checks: fill(
                'Checks',
                checks.map(([c, done]) => Check(done, c)),
                { gap: 8 },
              ),
              caption: { content: caption },
            },
          ),
        ),
      ),
      Tx('Muted', 'Publishing on Bitrate. External store delivery is not connected yet.', {
        textAlign: 'center',
      }),
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
    (m ? Col : Row)(
      {
        name: 'Credits',
        gap: m ? 24 : 64,
        width: 'fill_container',
        alignItems: m ? 'start' : 'center',
      },
      [
        Col({ name: 'Copy', gap: 20, width: 'fill_container' }, [
          heading(
            m,
            'Behind every release',
            'Made together.',
            'Credited together.',
            'Keep every contributor, role and share connected to the music. Agree the details before you send your release for review.',
            false,
          ),
          Tx('Muted', 'Credits and shares stay attached to your release.'),
        ]),
        W(
          'Tile',
          { name: 'Tile / People', width: m ? 'fill_container' : 480 },
          {
            icon: { icon: 'users-round' },
            title: { content: 'The people behind the sound' },
            right: { enabled: false },
            body: fill(
              'Body',
              [
                Tx('Muted', 'Choose a name to see their shares.'),
                person(true, 'MS', 'Mira Sol', 'Performer · Producer', '75%'),
                person(false, 'KH', 'Kite Harbor', 'Composer', '25%'),
                W('Progress', { name: 'Total' }, { bar: { width: m ? 322 : 444 } }),
                W(
                  'Check/Done',
                  { name: 'Accounted', width: 'fill_container' },
                  { label: { content: '100% of both rights accounted for' } },
                ),
              ],
              { gap: 12 },
            ),
          },
        ),
      ],
    )
  return { journey, credits }
}
