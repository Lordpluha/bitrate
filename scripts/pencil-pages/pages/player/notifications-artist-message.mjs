// Web-player notifications: a "New release" row carrying the artist's approved follower message
// (spec ai-artist-promotion, "Bitrate-internal channels", AC-10) and the "Created with AI" marker
// when AI wrote it (AC-9). Without an approved message the row is the usual one.
import { Col, Desktop, Ic, MHeader, Mobile, R, Row, Tx, state } from '../../ui.mjs'

/** The release row with the message quoted under it. */
function releaseWithMessage(width) {
  return Col({ name: 'Release With Message', gap: 6, width }, [
    R(
      'Notification Row/Unread',
      { width: 'fill_container' },
      {
        icon: { icon: 'disc-3' },
        text: { content: 'Luma Vale released a new single: Afterglow' },
        time: { content: '5 min ago' },
      },
    ),
    Col({ name: 'Artist Message', gap: 4, padding: [0, 16, 8, 70], width: 'fill_container' }, [
      Tx(
        'Body',
        '“Afterglow is out. Thank you for waiting with me. This one is for the late nights.”',
        {
          wrap: true,
        },
      ),
      Row({ name: 'AI Marker', gap: 4, alignItems: 'center' }, [
        Ic('sparkles', 'Muted', 12),
        Tx('Caption', 'Created with AI'),
      ]),
    ]),
  ])
}

export function artistMessageState() {
  return state(
    'Release with artist message',
    () => Desktop('Artist message', [Tx('H1', 'Notifications'), releaseWithMessage(760)]),
    () =>
      Mobile('Artist message', [releaseWithMessage('fill_container')], {
        header: MHeader('Notifications'),
      }),
  )
}
