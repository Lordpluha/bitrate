// App-wide loading & progress: boot splash, route change, buffering, saving, inline statuses, slow network,
// infinite lists and failure. Composed only from library instances.
import { TRACKS } from './kit.mjs'
import {
  R,
  Row,
  Col,
  Tx,
  Panel,
  BigCover,
  TrackTable,
  MobileTrack,
  SettingRow,
  Skeleton,
  MoreRows,
  ListEnd,
  ErrorState,
  Desktop,
  Mobile,
  MHeader,
  Blank,
  state,
  Button,
  Alert,
  Badge,
} from './ui.mjs'

const T5 = TRACKS.slice(0, 5)
const mrows = (rows) => rows.map((t) => MobileTrack(t[0], t[1], t[4]))
const splash = (w, h) => Blank('Boot splash', w, h, [R('Loader/Splash')])
const pill = (name, label) => R(name, {}, { label: { content: label } })
const statuses = (mobile) =>
  Panel([
    Tx('H4', 'Statuses'),
    SettingRow(
      'Library',
      'Fetching your playlists and liked songs.',
      pill('Status/Loading', 'Loading'),
    ),
    SettingRow(
      'Devices',
      'Queue and position follow you between devices.',
      pill('Status/Syncing', 'Syncing'),
    ),
    SettingRow(
      'Offline changes',
      'Likes made offline are sent when you reconnect.',
      pill('Status/Queued', 'Queued offline'),
    ),
    SettingRow('Playlist', 'Night Drive · saved a moment ago.', pill('Status/Success', 'Saved')),
    SettingRow('Upload', 'Cover could not be sent. Try again.', pill('Status/Error', 'Failed')),
    Tx('H4', 'Actions in progress'),
    Row({ gap: 10 }, [
      Button('Saving…', 'default', { icon: 'loader-circle' }),
      !mobile && Button('Loading…', 'outline', { icon: 'loader-circle' }),
      R('Loader/Spinner'),
      R('Loader/Spinner Small'),
    ]),
    R('Upload Progress', { width: 'fill_container' }),
    R('Skeleton/Shimmer', { width: 'fill_container' }),
    Tx(
      'Caption',
      'Skeletons pulse with a soft shimmer sweep, 1.4 s; reduced motion keeps them static.',
    ),
  ])
const player = (mobile) =>
  Col({ name: 'Player', gap: 18, width: mobile ? 'fill_container' : 420, alignItems: 'center' }, [
    BigCover('night', mobile ? 300 : 360),
    Col({ gap: 2, width: 'fill_container' }, [
      Tx('H3', 'Night Signal'),
      Tx('Muted', 'Demo artist'),
    ]),
    R('Seek Bar/Buffering'),
    R('Transport'),
  ])

export const loading = {
  title: 'Loading & progress',
  route: 'system — app-wide loading, progress and status patterns',
  context:
    'How every screen waits: boot splash, route bar, list skeletons that mirror the final layout, buffering, saving, inline statuses, slow network and infinite lists.',
  desktop: () => splash(1440, 900),
  mobile: () => splash(390, 844),
  states: [
    state(
      'Route change',
      () => Desktop('Route change', [R('Progress/Route Bar'), Skeleton('grid')]),
      () =>
        Mobile('Route change', [R('Progress/Route Bar'), Skeleton('grid', true)], {
          header: MHeader('Library'),
        }),
    ),
    state(
      'Buffering',
      () =>
        Desktop(
          'Buffering',
          [Row({ width: 'fill_container', justifyContent: 'center' }, [player(false)])],
          { nowPlaying: true },
        ),
      () =>
        Mobile('Buffering', [player(true)], {
          mini: false,
          header: MHeader('Now playing', { backIcon: 'chevron-down' }),
        }),
    ),
    state(
      'Saving',
      () =>
        Desktop('Saving', [
          Tx('H1', 'Night Drive'),
          TrackTable(T5),
          Row({ width: 'fill_container', justifyContent: 'end' }, [R('Toast/Progress')]),
        ]),
      () =>
        Mobile('Saving', [...mrows(T5), R('Toast/Progress', { width: 'fill_container' })], {
          header: MHeader('Night Drive'),
        }),
    ),
    state(
      'Statuses',
      () =>
        Desktop(
          'Statuses',
          [Tx('H1', 'Loading & status patterns'), Row({ width: 760 }, [statuses(false)])],
          { library: false },
        ),
      () => Mobile('Statuses', [statuses(true)], { header: MHeader('Statuses') }),
    ),
    state(
      'Slow network',
      () =>
        Desktop('Slow network', [
          Alert(
            'Still loading…',
            'Your connection is slow. We keep trying — playback continues from the cache.',
          ),
          Skeleton('table'),
        ]),
      () =>
        Mobile(
          'Slow network',
          [
            Alert('Still loading…', 'Your connection is slow. We keep trying.'),
            Skeleton('table', true),
          ],
          {
            header: MHeader('Liked Songs'),
          },
        ),
    ),
    state(
      'Long list',
      () =>
        Desktop('Long list', [
          Row({ gap: 10 }, [Tx('H1', 'Liked Songs'), Badge('1,240 songs', 'secondary')]),
          TrackTable(TRACKS.slice(0, 6)),
          MoreRows(false, 'track', '50 of 1,240'),
        ]),
      () =>
        Mobile('Long list', [...mrows(T5), MoreRows(true, 'track', '50 of 1,240')], {
          header: MHeader('Liked Songs'),
        }),
    ),
    state(
      'End of list',
      () =>
        Desktop('End of list', [
          Tx('H1', 'Liked Songs'),
          TrackTable(TRACKS.slice(0, 6)),
          ListEnd("That's everything · 1,240 songs"),
        ]),
      () =>
        Mobile('End of list', [...mrows(T5), ListEnd("That's everything · 1,240 songs")], {
          header: MHeader('Liked Songs'),
        }),
    ),
    state(
      'Failed',
      () =>
        Desktop('Failed', [
          ErrorState(
            'This took too long',
            'We could not load the page. Check your connection and try again.',
          ),
        ]),
      () =>
        Mobile(
          'Failed',
          [
            ErrorState(
              'This took too long',
              'We could not load the page. Check your connection and try again.',
            ),
          ],
          { header: MHeader('') },
        ),
    ),
  ],
}
