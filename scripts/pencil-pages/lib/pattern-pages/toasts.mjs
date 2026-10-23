// "09 • Toasts" library pattern page.
import { C, T, P, H, F, Row, Col, Ref } from '../../kit.mjs'
import { reg, restamp } from '../engine.mjs'

/* "09 • Toasts" pattern page in Product patterns: variants, stack, placement and rules */
const toastRef = (kind, title, desc, w = 360) =>
  Ref(
    reg[`Toast/${kind}`].id,
    { name: `Toast / ${kind}`, width: w },
    {
      [reg[`Toast/${kind}`].parts.title]: { content: title },
      [reg[`Toast/${kind}`].parts.desc]: { content: desc },
    },
  )
const VARIANTS = [
  ['Success', 'Saved to Liked Songs', 'Night Signal · Mira Sol'],
  ['Error', 'Could not save the playlist', 'Check your connection and try again.'],
  ['Info', 'Playing on Desktop', 'Playback moved from this phone.'],
  ['Warning', 'Storage almost full', 'Downloads will pause at 95%.'],
  ['Undo', 'Removed from Night drive', '1 track removed.'],
  ['Loading', 'Uploading cover…', 'Night drive · 64%'],
  ['Offline', 'You are offline', 'Playing from downloads. Changes sync later.'],
  ['Media', 'Added to queue', 'Night Signal · Mira Sol'],
]
/** A titled section of a pattern page. */
export const section = (title, children) =>
  Col({ name: title, gap: 16 }, [H(title, 22, { fontWeight: '700' }), ...children])
/** Builds the page, stamps its ids and puts it in the Product patterns row `prow`. */
export const buildToastsPage = (prow) => {
  const toastPage = F(
    {
      name: '09 • Toasts',
      layout: 'vertical',
      gap: 48,
      padding: 64,
      fill: C.background,
      width: 1440,
    },
    [
      H('Toasts', 40, { fontWeight: '700' }),
      P(
        'Non-blocking feedback. One region per app: bottom-right above the player bar on desktop, top on phones. Newest in front, two peek behind; hover expands the stack. Auto-dismiss after 4 s (errors and loading stay until resolved or closed), swipe or ✕ to dismiss, Esc closes the newest. Success/info use aria-live polite, errors assertive.',
        { width: 900 },
      ),
      section('Variants', [
        Row({ name: 'Variant Columns', gap: 32, alignItems: 'start' }, [
          Col(
            { gap: 14 },
            VARIANTS.slice(0, 4).map(([k, t, d]) =>
              Col({ gap: 6 }, [T(k, { fontSize: 12, fill: C.mutedForeground }), toastRef(k, t, d)]),
            ),
          ),
          Col(
            { gap: 14 },
            VARIANTS.slice(4).map(([k, t, d]) =>
              Col({ gap: 6 }, [T(k, { fontSize: 12, fill: C.mutedForeground }), toastRef(k, t, d)]),
            ),
          ),
        ]),
      ]),
      section('Stack', [
        Row({ name: 'Stacks', gap: 56, alignItems: 'start' }, [
          Col({ name: 'Collapsed', gap: 10 }, [
            T('Collapsed · newest in front', { fontSize: 12, fill: C.mutedForeground }),
            Col({ gap: 4, alignItems: 'center', width: 360 }, [
              toastRef('Undo', 'Removed from Night drive', '1 track removed.', 328),
              toastRef('Success', 'Saved to Liked Songs', 'Night Signal · Mira Sol', 344),
              toastRef('Media', 'Added to queue', 'Night Signal · Mira Sol'),
            ]),
          ]),
          Col({ name: 'Expanded', gap: 10 }, [
            T('Expanded on hover', { fontSize: 12, fill: C.mutedForeground }),
            Col({ gap: 10 }, [
              toastRef('Media', 'Added to queue', 'Night Signal · Mira Sol'),
              toastRef('Success', 'Saved to Liked Songs', 'Night Signal · Mira Sol'),
              toastRef('Undo', 'Removed from Night drive', '1 track removed.'),
            ]),
          ]),
        ]),
      ]),
      section('Placement', [
        Row({ name: 'Placements', gap: 48, alignItems: 'start' }, [
          Col({ gap: 8 }, [
            T('Desktop · bottom-right, above the player bar', {
              fontSize: 12,
              fill: C.mutedForeground,
            }),
            Col(
              {
                name: 'Desktop Screen',
                width: 640,
                height: 380,
                cornerRadius: 14,
                fill: C.card,
                stroke: C.border,
                strokeWidth: 1,
                padding: 16,
                gap: 12,
                justifyContent: 'end',
                alignItems: 'end',
              },
              [
                toastRef('Success', 'Saved to Liked Songs', 'Night Signal · Mira Sol', 300),
                F({
                  name: 'Player Bar',
                  width: 'fill_container',
                  height: 44,
                  cornerRadius: 10,
                  fill: C.muted,
                }),
              ],
            ),
          ]),
          Col({ gap: 8 }, [
            T('Phone · top, under the status bar', { fontSize: 12, fill: C.mutedForeground }),
            Col(
              {
                name: 'Phone Screen',
                width: 220,
                height: 420,
                cornerRadius: 28,
                fill: C.card,
                stroke: C.border,
                strokeWidth: 1,
                padding: [36, 10, 10, 10],
                gap: 10,
              },
              [toastRef('Info', 'Playing on Desktop', 'Moved from this phone.', 'fill_container')],
            ),
          ]),
        ]),
      ]),
    ],
  )
  restamp('page:09 Toasts', toastPage)
  const tAt = prow.children.findIndex((c) => c.name === '09 • Toasts')
  if (tAt >= 0) prow.children[tAt] = toastPage
  else prow.children.push(toastPage)
  return toastPage
}
