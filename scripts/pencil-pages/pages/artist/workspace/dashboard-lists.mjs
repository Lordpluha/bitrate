// The dashboard's list tiles (widgets/DashboardOverview/ui): your releases (three, with loading and
// unavailable), coming up (UTC dates, the dashed "Plan the next release" slot, empty), recent activity
// (three bell rows, loading, empty) and listening data with its artwork.
import { dashboardTile } from './dashboard-tile.mjs'
import { coverFill, RELEASES } from './demo.mjs'

const ART = '../../../apps/web-artists/public/artwork/dashboard/'
const ACTIVITY = [
  ['The reviewer requested changes · Echoes in Motion', '2 h ago'],
  ['Approved by Bitrate review · Static Lines', 'Yesterday'],
  ['Live on Bitrate · Afterglow', 'Oct 3'],
]

/** List tile builders bound to the screen helpers `ui`. */
export function dashboardLists(ui) {
  const { W, Tx, P, inline, St } = ui
  const tile = dashboardTile(ui)
  const releaseRow = ([title, cover, type, tone, status, tracks, , updated]) =>
    W(
      'Row/Release',
      { name: `Release / ${title}`, width: 'fill_container' },
      {
        cover: coverFill(cover),
        title: { content: title },
        meta: { content: `${type} · ${tracks}` },
        trail: inline('Trail', [St(tone, status), Tx('Caption', updated)]),
      },
    )
  const releases = (c, state) =>
    tile(
      'Your releases',
      'library',
      state === 'loading'
        ? [P('Muted', 'Loading releases…')]
        : state === 'error'
          ? [P('Body', 'Releases are unavailable right now.')]
          : RELEASES.slice(0, 3).map(releaseRow),
      c,
      [Tx('Link', 'View music')],
    )
  const timeline = (date, time, cover, title, tone, status) =>
    W(
      'Row/Timeline',
      { name: `Coming up / ${title}`, width: 'fill_container' },
      {
        date: { content: date },
        time: { content: time },
        cover: coverFill(cover),
        title: { content: title },
        status: inline('Status', [St(tone, status)]),
      },
    )
  const comingUp = (c, empty = false) =>
    tile(
      'Coming up',
      'calendar-clock',
      [
        ...(empty
          ? [P('Body', 'No dates yet. Plan a release date in a release.')]
          : [
              timeline('DEC 12', '18:00', 'static-lines', 'Static Lines', 'Ready', 'Scheduled'),
              timeline(
                'DEC 19',
                '00:00',
                'echoes-in-motion',
                'Echoes in Motion',
                'Processing',
                'Submitted',
              ),
            ]),
        W('Link/Dashed', { name: 'Plan the next release', width: 'fill_container' }),
      ],
      c,
      [Tx('Caption', 'UTC')],
    )
  const activity = (c, state) =>
    tile(
      'Recent activity',
      'activity',
      state === 'loading'
        ? [P('Muted', 'Loading activity…')]
        : state === 'empty'
          ? [P('Body', 'No activity yet. Reviews, deadlines and delivery updates appear here.')]
          : ACTIVITY.map(([text, time]) =>
              W(
                'Row/Activity',
                { name: `Activity / ${time}`, width: 'fill_container' },
                { text: { content: text }, time: { content: time } },
              ),
            ),
      c,
    )
  const listening = (c) =>
    tile(
      'Listening data',
      'audio-lines',
      [
        W('Artwork', {
          name: 'Artwork',
          width: 'fill_container',
          height: 96,
          fill: { type: 'image', url: `${ART}listening-spectrum.webp`, mode: 'cover' },
        }),
        Tx('Muted', 'Last 28 days'),
        P(
          'Caption',
          'Plays and listeners on Bitrate; external services are shown as not connected rather than zero.',
        ),
        Tx('Link', 'Open analytics'),
      ],
      c,
    )
  return { releases, comingUp, activity, listening }
}
