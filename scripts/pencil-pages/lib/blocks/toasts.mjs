// Library page blocks: toasts.
import { C, T, I, F, Row, Col, Ref, Button } from '../../kit.mjs'
import { reg, part, comp, cover } from '../engine.mjs'

/* toasts: one family, bottom-right on desktop (above the player bar), top on mobile; Sonner-like stack */
const toastBase = (name, lead, { action, close = true, w = 360 } = {}) =>
  comp(
    name,
    Row(
      {
        name: 'Toast',
        width: w,
        padding: [12, 12, 12, 14],
        gap: 12,
        cornerRadius: 12,
        fill: C.popover,
        stroke: C.border,
        strokeWidth: 1,
        alignItems: 'start',
        effect: {
          type: 'shadow',
          shadowType: 'outer',
          color: C.shadow,
          offset: { x: 0, y: 12 },
          blur: 32,
        },
      },
      [
        lead,
        Col({ gap: 2, width: 'fill_container' }, [
          part('title', T('Title', { fontSize: 14, fontWeight: '600' })),
          part('desc', T('Description', { fontSize: 12, fill: C.mutedForeground })),
        ]),
        action && part('action', Button(action, 'outline')),
        close && I('x', { width: 14, height: 14, fill: C.mutedForeground }),
      ].filter(Boolean),
    ),
  )
const toastIcon = (icon, fill) =>
  F({ name: 'Icon', width: 20, height: 20, justifyContent: 'center', alignItems: 'center' }, [
    I(icon, { width: 18, height: 18, fill }),
  ])
/** Registers this section's library components, in build order. */
export function register(add) {
  add(
    toastBase('Toast/Success', toastIcon('circle-check', C.success)),
    toastBase('Toast/Error', toastIcon('circle-x', C.destructive), { action: 'Retry' }),
    toastBase('Toast/Info', toastIcon('info', C.info)),
    toastBase('Toast/Warning', toastIcon('triangle-alert', C.warning)),
    toastBase('Toast/Undo', toastIcon('trash-2', C.mutedForeground), { action: 'Undo' }),
    toastBase('Toast/Offline', toastIcon('wifi-off', C.mutedForeground), { close: false }),
    toastBase(
      'Toast/Loading',
      Ref(reg['Loader/Logo Mini'].id, { name: 'Logo Loader', width: 20, height: 20 }),
      { close: false },
    ),
    toastBase('Toast/Media', part('cover', cover({ width: 40, height: 40, cornerRadius: 6 })), {
      action: 'View queue',
    }),
  )
}
