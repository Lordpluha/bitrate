// Catalogue states of the music page: the empty message (first-time or filtered), the table skeleton,
// the load error and the now-playing island under the table.
import { coverFill } from './demo.mjs'

/** State builders bound to the screen helpers `ui`. */
export function musicStates(ui) {
  const { W, P, Row, Col, inline, Btn } = ui
  const message = (m, title, body, actions, icon = 'disc-3') => [
    W(
      'State/Empty',
      { name: `Empty / ${title.slice(0, 20)}`, width: 'fill_container' },
      {
        icon: { icon },
        title: { content: title },
        body: m ? { content: body, width: 'fill_container' } : { content: body },
        action: inline('Action', actions),
      },
    ),
  ]
  /* PageSkeleton table: five skeleton rows, its label for screen readers only */
  const loading = () => [
    Col({ name: 'Loading', gap: 0, width: 'fill_container', padding: 16 }, [
      ...[1, 2, 3, 4, 5].map((i) =>
        W('Skeleton/Row', { name: `Skeleton ${i}`, width: 'fill_container' }),
      ),
    ]),
  ]
  const failed = (tab) => [
    Col({ name: 'Error', gap: 16, width: 'fill_container', padding: [48, 24] }, [
      P(
        'Body',
        tab === 'tracks'
          ? 'Could not load your tracks. Please try again.'
          : 'Could not load your releases. Please try again.',
      ),
      Btn('Try again', 'Outline'),
    ]),
  ]
  const cover = { cover: coverFill('night-signal') }
  const island = (m) =>
    Row({ name: 'Island', width: 'fill_container', justifyContent: 'center' }, [
      W(
        'Island/Now Playing Expanded',
        { name: 'Now playing', ...(m ? { width: 'fill_container' } : {}) },
        cover,
      ),
    ])
  return { message, loading, failed, island }
}
