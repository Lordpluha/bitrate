// Artist / Not found (shared/ui/NotFound, the router's defaultNotFoundComponent): any unknown path and
// an unknown legal slug land here. Static copy and one way back.
import { publicSpec } from './spec.mjs'

/** The not-found page spec. */
export function notFoundPage(ui, frames) {
  const { Tx, Col, Btn } = ui
  const center = { textAlign: 'center' }
  return publicSpec(
    frames,
    {
      title: 'Artist / Not found',
      route: '* (any unknown path)',
      context:
        'Static page: it loads nothing, so it has no loading, empty or error states of its own.',
      layout: { height: 900 },
    },
    () => [
      Col({ name: 'Message', gap: 8, alignItems: 'center' }, [
        Tx('Eyebrow', '404', center),
        Tx('H1', "This page doesn't exist", center),
        Tx('Muted', 'The link may be out of date, or the address mistyped.', center),
      ]),
      Btn('Back to Bitrate for Artists', 'Primary'),
    ],
  )
}
