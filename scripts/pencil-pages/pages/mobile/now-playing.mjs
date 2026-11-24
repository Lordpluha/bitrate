// Native app: Now playing (full-screen modal) and the not-found screen.
import { BigCover, Col, EmptyState, IconBtn, R, Row, Tx } from '../../ui.mjs'
import { AppScreen, ModalScreen, ms } from './shell.mjs'

const top = () =>
  Row({ name: 'Top', width: 'fill_container', justifyContent: 'space_between' }, [
    IconBtn('chevron-down'),
    Col({ gap: 0, alignItems: 'center' }, [
      Tx('Caption', 'Now playing'),
      Tx('Body Strong', 'Recently played'),
    ]),
    IconBtn('ellipsis'),
  ])
const meta = () =>
  Col({ name: 'Meta', gap: 4, width: 'fill_container' }, [
    Tx('H2', 'Afterglow'),
    Tx('Muted', 'Nova & the Static'),
  ])
const transport = (playIcon) =>
  R('Transport', {}, { playIcon: playIcon ? { icon: playIcon } : undefined })
const player = ({ seek = R('Seek Bar'), playIcon, error } = {}) => [
  top(),
  BigCover('afterglow', 346),
  meta(),
  error && Tx('Error', error, { wrap: true }),
  seek,
  transport(playIcon),
]
const buffering = () => R('Seek Bar/Buffering', {}, { label: { content: 'Buffering…' } })
const modal = (name, opts) => ModalScreen(name, player(opts))

export const nowPlayingPages = {
  'now-playing': {
    title: 'Mobile / Now playing',
    route: 'app /now-playing (modal, opened from the island artwork)',
    context:
      'Full player: one track loads at a time from a play session (POST /tracks/:id/play-sessions → CMAF ?t= URL); lock-screen controls mirror it.',
    mobile: () => modal('Now playing'),
    states: [
      ms('Paused', () => modal('Paused', { playIcon: 'play' })),
      ms('Buffering', () => modal('Buffering', { seek: buffering(), playIcon: 'loader-circle' })),
      ms('Protected track', () =>
        modal('Protected', {
          playIcon: 'play',
          error: "This track can't be played on mobile yet.",
        }),
      ),
      ms('Still processing', () =>
        modal('Processing', { playIcon: 'play', error: 'This track is still being processed.' }),
      ),
      ms('Rate limited', () =>
        modal('Rate limited', {
          playIcon: 'play',
          error: 'Slow down a little — playback will resume shortly.',
        }),
      ),
      ms('Playback failed', () =>
        modal('Failed', { playIcon: 'rotate-ccw', error: "Couldn't play this track." }),
      ),
    ],
  },
  'not-found': {
    title: 'Mobile / Not found',
    route: 'app +not-found',
    context: 'Unknown deep link or removed content.',
    mobile: () =>
      AppScreen(
        'Not found',
        [
          EmptyState(
            "This screen doesn't exist",
            'The link may be broken or the content was removed.',
            'Go to Home',
            'compass',
          ),
        ],
        { island: 'idle' },
      ),
  },
}
