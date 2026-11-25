// Web-player artist page: the countdown tile of an upcoming release (spec ai-artist-promotion,
// "Bitrate-internal channels", AC-11). The artist approved a COUNTDOWN step; the tile shows only
// the title, the cover and the release date, never unpublished tracks, until the release is live.
import {
  BigCover,
  Button,
  Col,
  Cover,
  Desktop,
  Ic,
  MHeader,
  Mobile,
  Panel,
  Play,
  R,
  Row,
  Tx,
  state,
} from '../../ui.mjs'

/** The tile itself: cover, "Coming Sep 26", the title, days left and Follow. */
function countdownTile(m) {
  const text = Col({ name: 'Countdown Text', gap: 4, width: 'fill_container' }, [
    Row({ name: 'Countdown Label', gap: 6, alignItems: 'center' }, [
      Ic('hourglass', 'Muted', 16),
      Tx('Caption', 'New release · Coming Sep 26'),
    ]),
    Tx(m ? 'H4' : 'H3', 'Afterglow'),
    Tx('Muted', 'Single · in 9 days'),
  ])
  return Panel(
    [
      Row({ name: 'Countdown', gap: 16, alignItems: 'center', width: 'fill_container' }, [
        m ? Cover('afterglow', 72) : BigCover('afterglow', 112),
        text,
      ]),
      Row({ name: 'Countdown Actions', gap: 10 }, [
        Button('Follow to hear it first', 'outline', { icon: 'bell' }),
      ]),
    ],
    { name: 'Upcoming Release', width: m ? 'fill_container' : 560, gap: 14 },
  )
}

/** The artist page while an approved countdown runs. */
export function countdownState() {
  return state(
    'Upcoming release',
    () =>
      Desktop(
        'Upcoming',
        [
          R('Artist Hero', {}, { name: { content: 'Luma Vale' } }),
          Row({ gap: 18 }, [Play(), Ic('shuffle', 'Muted', 26), Button('Follow', 'outline')]),
          countdownTile(false),
          Tx('H3', 'Popular'),
        ],
        { library: false },
      ),
    () =>
      Mobile(
        'Upcoming',
        [
          R('Artist Hero/Mobile', { width: 'fill_container' }, { name: { content: 'Luma Vale' } }),
          countdownTile(true),
          Tx('H4', 'Popular'),
        ],
        { header: MHeader('') },
      ),
  )
}
