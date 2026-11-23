// The dashboard's list tiles (widgets/DashboardOverview/ui): your releases, coming up, recent activity
// and listening data, with the demo catalogue; each builder takes the tile's frame size.
import { dashboardTile } from './dashboard-tile.mjs'
import { coverFill, RELEASES } from './demo.mjs'

/** List tile builders bound to the screen helpers `ui`. */
export function dashboardLists(ui) {
  const { W, Tx, P, inline, St, Btn } = ui
  const tile = dashboardTile(ui)
  const releaseRow = ([title, cover, type, tone, status, , , updated]) =>
    W(
      'Row/Release',
      { name: `Release / ${title}`, width: 'fill_container' },
      {
        cover: coverFill(cover),
        title: { content: title },
        meta: { content: `${type} · ${updated}` },
        trail: inline('Trail', [St(tone, status)]),
      },
    )
  const releases = (o) =>
    tile('Your releases', 'library', RELEASES.map(releaseRow), o, [Tx('Link', 'View music')])
  const comingUp = (o) =>
    tile(
      'Coming up',
      'calendar-clock',
      [
        W(
          'Row/Date',
          { name: 'Date / Static Lines', width: 'fill_container' },
          {
            month: { content: 'NOV' },
            day: { content: '28' },
            title: { content: 'Static Lines' },
            meta: { content: '00:00 UTC · Scheduled' },
            trail: { enabled: false },
          },
        ),
        W(
          'Row/Date',
          { name: 'Date / Echoes in Motion', width: 'fill_container' },
          {
            month: { content: 'DEC' },
            day: { content: '5' },
            title: { content: 'Echoes in Motion' },
            meta: { content: '00:00 UTC · Submitted' },
            trail: { enabled: false },
          },
        ),
        Btn('Plan the next release', 'Outline', 'calendar-plus'),
      ],
      o,
    )
  const activity = (o) =>
    tile(
      'Recent activity',
      'activity',
      [
        W(
          'Row/Notification Action',
          { name: 'Activity / changes', width: 'fill_container' },
          {
            icon: { icon: 'message-square-warning' },
            title: { content: 'The reviewer requested changes' },
            meta: { content: 'Echoes in Motion · 2 h ago' },
          },
        ),
        W(
          'Row/Notification',
          { name: 'Activity / approved', width: 'fill_container' },
          { meta: { content: 'Static Lines · Yesterday' } },
        ),
        W(
          'Row/Notification',
          { name: 'Activity / live', width: 'fill_container' },
          {
            icon: { icon: 'radio' },
            title: { content: 'Live on Bitrate' },
            meta: { content: 'Afterglow · Oct 3' },
          },
        ),
      ],
      o,
    )
  const listening = (o) =>
    tile(
      'Listening data',
      'audio-lines',
      [
        Tx('Muted', 'Last 28 days'),
        P(
          'Caption',
          'Plays and listeners on Bitrate; external services are shown as not connected rather than zero.',
        ),
        Tx('Link', 'Open analytics'),
      ],
      o,
    )
  return { releases, comingUp, activity, listening }
}
