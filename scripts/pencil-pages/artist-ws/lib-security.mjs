// Settings pieces (views/SettingsView, features/account-security, notification-preferences): the
// authenticator QR code, a signed-in device row (this device or another), bare toggles and the
// notification channel row (category with in-app, email and push switches).
import { C, Col, F, I, id, Row, T } from '../kit.mjs'
import { artistPaint } from './paint.mjs'

/* a deterministic 21 × 21 module pattern with the three finder squares */
const QR = (() => {
  const n = 21
  const cells = []
  const finder = (x, y) => (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13)
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      const ring =
        finder(x, y) &&
        (x % 14 === 0 ||
          y % 14 === 0 ||
          x % 14 === 6 ||
          y % 14 === 6 ||
          (x % 14 > 1 && x % 14 < 5 && y % 14 > 1 && y % 14 < 5))
      const data = !finder(x, y) && (x * 7 + y * 13 + x * y) % 3 === 0
      if (ring || data) cells.push(`M${x * 8} ${y * 8} h8 v8 h-8 Z`)
    }
  return cells.join(' ')
})()

/** Adds the QR code, device rows, toggles and channel rows to the library. */
export function addSecurity(lib) {
  const { comp, part, add, slot } = lib
  const paint = artistPaint()
  const wrap = { width: 'fill_container', textGrowth: 'fixed-width', lineHeight: 1.5 }
  add(
    comp(
      'QR/Code',
      Row(
        {
          name: 'QR Code',
          width: 192,
          height: 192,
          padding: 12,
          cornerRadius: 12,
          fill: C.primaryForeground,
        },
        [
          {
            type: 'path',
            id: id(),
            name: 'Modules',
            width: 168,
            height: 168,
            viewBox: [0, 0, 168, 168],
            geometry: QR,
            fill: C.artistCanvasStart,
          },
        ],
      ),
    ),
  )
  for (const current of [false, true])
    add(
      comp(
        `Row/Device${current ? ' Current' : ''}`,
        Row({ name: 'Device Row', width: 520, gap: 12, padding: [10, 0], ...paint.hairline() }, [
          part(
            'icon',
            I('monitor', {
              width: 18,
              height: 18,
              fill: current ? C.artistIcon : C.artistTextSecondary,
            }),
          ),
          Col({ name: 'Text', gap: 2, width: 'fill_container' }, [
            part(
              'title',
              T('Chrome on macOS', {
                fontSize: 12,
                fontWeight: '500',
                fill: C.artistForeground,
                ...wrap,
              }),
            ),
            part(
              'meta',
              T(current ? 'This device · active now' : 'Last active Nov 20, 2026', {
                fontSize: 11,
                fill: current ? C.artistStatusReady : C.artistTextSecondary,
                ...wrap,
              }),
            ),
          ]),
          slot('trail', {
            layout: 'horizontal',
            width: 'fit_content',
            gap: 6,
            alignItems: 'center',
          }),
        ]),
      ),
    )
  const track = (on) =>
    Row(
      {
        name: 'Track',
        width: 36,
        height: 20,
        padding: 2,
        cornerRadius: 10,
        justifyContent: on ? 'end' : 'start',
        ...(on ? { fill: paint.action().fill } : paint.control()),
      },
      [
        F({
          name: 'Thumb',
          width: 16,
          height: 16,
          cornerRadius: 8,
          fill: on ? C.primaryForeground : C.artistTextSecondary,
        }),
      ],
    )
  add(comp('Toggle/On', track(true)), comp('Toggle/Off', track(false)))
  add(
    comp(
      'Row/Channels',
      Row({ name: 'Channel Row', width: 640, gap: 12, padding: [12, 0], ...paint.hairline() }, [
        Col({ name: 'Category', gap: 2, width: 'fill_container' }, [
          part(
            'title',
            T('Bitrate review', {
              fontSize: 12,
              fontWeight: '500',
              fill: C.artistForeground,
              ...wrap,
            }),
          ),
          part(
            'hint',
            T('Submissions, approvals and requested changes', {
              fontSize: 11,
              fill: C.artistTextSecondary,
              ...wrap,
            }),
          ),
        ]),
        slot('inApp', { layout: 'horizontal', width: 80, justifyContent: 'center' }),
        slot('email', { layout: 'horizontal', width: 80, justifyContent: 'center' }),
        slot('push', { layout: 'horizontal', width: 80, justifyContent: 'center' }),
      ]),
    ),
  )
}
