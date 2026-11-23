// Artist / Session error (widgets/ArtistDashboard DashboardSessionError): the session check failed for a
// reason other than being signed out, so the workspace shell is not drawn and the visitor is not sent
// to /login. "Try again" re-runs the check, which shows the checking state meanwhile.
import { publicSpec } from './spec.mjs'

/** The session-error page spec. */
export function sessionErrorPage(ui, frames) {
  const { W, Tx, P, Row, Btn, fill } = ui
  const panel = (m) =>
    W(
      'Panel',
      { name: 'Session Error', width: m ? 'fill_container' : 448 },
      {
        content: fill(
          'Content',
          [
            Tx('H1', "We couldn't check your session"),
            P('Muted', 'Your workspace is temporarily unavailable. Try again in a moment.'),
            Row({ name: 'Actions', gap: 12 }, [
              Btn('Try again', 'Primary', 'refresh-cw'),
              Btn('Back to Bitrate', 'Outline'),
            ]),
          ],
          { gap: 16 },
        ),
      },
    )
  return publicSpec(
    frames,
    {
      title: 'Artist / Session error',
      route: '/dashboard/* (session check failed)',
      context:
        'Shown instead of the workspace when the session service is unreachable; a signed-out visitor goes to /login instead.',
      layout: { height: 900 },
    },
    (m) => [panel(m)],
    [
      [
        'Checking session',
        () => [
          Row({ name: 'Checking', gap: 10 }, [
            W('Spinner', { name: 'Spinner' }),
            Tx('Muted', 'Checking your session…'),
          ]),
        ],
      ],
    ],
  )
}
