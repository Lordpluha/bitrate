// Library page blocks: state messages.
import { C, P, H, I, F, Row, Col, Button } from '../../kit.mjs'
import { reg, part, comp } from '../engine.mjs'

/* state messages: centred icon, title, description and real kit actions (primary + outline) */
const stateMessage = (name, icon, circle, iconFill) => {
  const primary = part('primary', Button('Try again', 'large-default'))
  const secondary = part('secondary', Button('Back to home', 'large-outline'))
  const node = comp(
    name,
    Col({ name: 'State Message', width: 480, gap: 16, alignItems: 'center', padding: [24, 0] }, [
      F(
        {
          name: 'Icon Circle',
          width: 72,
          height: 72,
          cornerRadius: 36,
          fill: circle,
          justifyContent: 'center',
          alignItems: 'center',
        },
        [part('icon', I(icon, { width: 30, height: 30, fill: iconFill }))],
      ),
      part(
        'title',
        H('Title', 28, { textAlign: 'center', textGrowth: 'fixed-width', width: 'fill_container' }),
      ),
      part('desc', P('Description', { textAlign: 'center' })),
      Row({ name: 'Actions', gap: 10, padding: [8, 0, 0, 0] }, [primary, secondary]),
    ]),
  )
  reg[name].parts.primaryLabel = `${reg[name].parts.primary}/NVe7y`
  reg[name].parts.secondaryLabel = `${reg[name].parts.secondary}/i6a4e`
  return node
}
/** Registers this section's library components, in build order. */
export function register(add) {
  add(
    stateMessage('State/Message/Error', 'triangle-alert', C.errorSurface, C.destructive),
    stateMessage('State/Message/Empty', 'music', C.muted, C.foreground),
    stateMessage('State/Message/Offline', 'wifi-off', C.muted, C.foreground),
  )
}
