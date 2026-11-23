// Surfaces of the public pages: the plain glass panel (session error, legal article), the popover with
// its option rows (landing theme and language pickers), toasts (sonner: forgot/reset password) and the
// legal document's note box and list item.
import { C, Col, F, I, Row, T } from '../kit.mjs'
import { artistPaint } from './paint.mjs'

const TOASTS = {
  Success: ['artistStatusReady', 'circle-check'],
  Error: ['artistStatusError', 'circle-x'],
}

/** Adds panel, popover, option rows, toasts and the legal blocks to the library. */
export function addSurfaces(lib) {
  const { comp, part, add, slot } = lib
  const paint = artistPaint()
  const wrap = { width: 'fill_container', textGrowth: 'fixed-width', lineHeight: 1.6 }
  add(
    comp(
      'Panel',
      Col(
        {
          name: 'Panel',
          width: 480,
          gap: 16,
          padding: 24,
          cornerRadius: 16,
          ...paint.releaseGlass(),
        },
        [slot('content', { gap: 16 })],
      ),
    ),
    comp(
      'Popover',
      Col(
        {
          name: 'Popover',
          width: 280,
          gap: 10,
          padding: 14,
          cornerRadius: 14,
          ...paint.sheet(),
        },
        [
          part('title', T('Theme', { fontSize: 12, fontWeight: '500', fill: C.artistForeground })),
          slot('items', { gap: 4 }),
        ],
      ),
    ),
  )
  for (const selected of [false, true])
    add(
      comp(
        selected ? 'Menu/Option Selected' : 'Menu/Option',
        Row(
          {
            name: 'Option',
            width: 252,
            height: 36,
            padding: [0, 10],
            gap: 10,
            cornerRadius: 8,
            ...(selected ? { fill: C.artistSelection } : {}),
          },
          [
            part('icon', I('sun', { width: 15, height: 15, fill: C.artistIcon })),
            part(
              'label',
              T('Option', {
                fontSize: 12,
                fill: C.artistForeground,
                width: 'fill_container',
                textGrowth: 'fixed-width',
              }),
            ),
            ...(selected ? [I('check', { width: 15, height: 15, fill: C.artistIcon })] : []),
          ],
        ),
      ),
    )
  for (const [tone, [role, icon]] of Object.entries(TOASTS))
    add(
      comp(
        `Toast/${tone}`,
        Row(
          {
            name: 'Toast',
            width: 360,
            gap: 10,
            padding: [14, 16],
            cornerRadius: 12,
            ...paint.sheet(),
          },
          [
            I(icon, { width: 17, height: 17, fill: C[role] }),
            part('text', T('Message', { fontSize: 12, fill: C.artistForeground, ...wrap })),
          ],
        ),
      ),
    )
  add(
    comp(
      'Legal/Note',
      Row(
        {
          name: 'Note',
          width: 640,
          padding: [12, 16],
          cornerRadius: 8,
          ...paint.control(),
        },
        [part('text', T('Note', { fontSize: 12, fill: C.artistForeground, ...wrap }))],
      ),
    ),
    comp(
      'Legal/Item',
      Row({ name: 'List Item', width: 640, gap: 10, alignItems: 'start' }, [
        Row({ name: 'Marker', width: 14, height: 22, justifyContent: 'center' }, [
          F({ name: 'Dot', width: 5, height: 5, cornerRadius: 3, fill: C.artistTextSecondary }),
        ]),
        part('text', T('Item', { fontSize: 14, fill: C.artistForeground, ...wrap })),
      ]),
    ),
  )
}
