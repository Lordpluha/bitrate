// Library page blocks: one-time code fields, typography and icons.
import { C, T, I, F, Row, Col } from '../../kit.mjs'
import { part, txt, icn } from '../engine.mjs'

/* one-time code: six roomy cells in two groups of three, the active cell carries the ring and a caret */
const otpCell = (i, { digit, active, tone }) =>
  F(
    {
      name: active ? 'Cell Active' : 'Cell',
      width: 44,
      height: 54,
      cornerRadius: 12,
      fill: tone === 'error' ? C.background : C.card,
      stroke: active
        ? C.ring
        : tone === 'error'
          ? C.destructive
          : tone === 'success'
            ? C.successBorder
            : digit
              ? C.border
              : C.input,
      strokeWidth: active ? 2 : 1,
      ...(active
        ? {
            effect: {
              type: 'shadow',
              shadowType: 'outer',
              color: C.ring,
              offset: { x: 0, y: 0 },
              blur: 12,
            },
          }
        : {}),
      justifyContent: 'center',
      alignItems: 'center',
    },
    [
      active && !digit
        ? F({ name: 'Caret', width: 2, height: 24, cornerRadius: 1, fill: C.primary })
        : part(
            `d${i + 1}`,
            T(digit || '', {
              fontSize: 22,
              fontWeight: '600',
              fontFamily: '$--font-heading',
              fill: tone === 'error' ? C.destructive : C.foreground,
            }),
          ),
    ],
  )
export const otpField = ({ value = '', active = -1, tone, hint }) => {
  const cells = Array.from({ length: 6 }, (_, i) =>
    otpCell(i, { digit: value[i], active: i === active, tone }),
  )
  return Col({ name: 'OTP Field', gap: 8 }, [
    part(
      'label',
      T('Authentication code', { fontSize: 13, fontWeight: '500', fill: C.foreground }),
    ),
    Row({ name: 'Cells', gap: 6, alignItems: 'center' }, [
      ...cells.slice(0, 3),
      F({ name: 'Separator', width: 10, height: 2, cornerRadius: 1, fill: C.border }),
      ...cells.slice(3),
    ]),
    Row({ name: 'Hint', gap: 6 }, [
      ...(tone === 'error'
        ? [I('circle-alert', { width: 14, height: 14, fill: C.destructive })]
        : []),
      ...(tone === 'success'
        ? [I('circle-check', { width: 14, height: 14, fill: C.successText })]
        : []),
      part(
        'hint',
        T(hint, {
          fontSize: 12,
          fill:
            tone === 'error'
              ? C.destructive
              : tone === 'success'
                ? C.successText
                : C.mutedForeground,
        }),
      ),
    ]),
  ])
}
export const OTP_STATES = [
  ['Empty', { active: -1, hint: 'Enter the 6-digit code from your authenticator app.' }],
  ['Active', { value: '48', active: 2, hint: 'Paste works too — all six digits at once.' }],
  ['Filled', { value: '482913', hint: 'Code expires in 0:24' }],
  ['Error', { value: '482913', tone: 'error', hint: 'Invalid or expired code. Try again.' }],
  ['Success', { value: '482913', tone: 'success', hint: 'Code verified' }],
]

/** Registers this section's library components, in build order. */
export function register(add) {
  /* typography */
  add(
    txt('Text/Display', 'Display', {
      fontFamily: 'font-heading',
      fontSize: 54,
      fontWeight: '700',
      letterSpacing: -1.6,
      lineHeight: 1.05,
    }),
    txt('Text/Display Primary', '404', {
      fontFamily: 'font-heading',
      fontSize: 104,
      fontWeight: '700',
      fill: C.primary,
    }),
    txt('Text/H1', 'Heading 1', {
      fontFamily: 'font-heading',
      fontSize: 32,
      fontWeight: '700',
      letterSpacing: -0.8,
      lineHeight: 1.05,
    }),
    txt('Text/H2', 'Heading 2', {
      fontFamily: 'font-heading',
      fontSize: 24,
      fontWeight: '600',
      letterSpacing: -0.4,
    }),
    txt('Text/H3', 'Heading 3', { fontFamily: 'font-heading', fontSize: 19, fontWeight: '600' }),
    txt('Text/H4', 'Heading 4', { fontFamily: 'font-heading', fontSize: 16, fontWeight: '600' }),
    txt('Text/Body', 'Body', {}),
    txt('Text/Body Strong', 'Body strong', { fontWeight: '600' }),
    txt('Text/Body Large', 'Body large', { fontSize: 16 }),
    txt('Text/Paragraph', 'Paragraph text that wraps to its container.', {
      fill: C.mutedForeground,
      lineHeight: 1.5,
      textGrowth: 'fixed-width',
      width: 360,
    }),
    txt('Text/Muted', 'Muted', { fontSize: 13, fill: C.mutedForeground }),
    txt('Text/Caption', 'Caption', { fontSize: 12, fill: C.mutedForeground }),
    txt('Text/Eyebrow', 'EYEBROW', {
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: 1.2,
      fill: C.mutedForeground,
    }),
    txt('Text/Link', 'Link', { fontSize: 13, fontWeight: '600', fill: C.primary }),
    txt('Text/Accent Heading', 'Accent', {
      fontFamily: 'font-heading',
      fontSize: 24,
      fontWeight: '700',
      fill: C.accent,
    }),
    txt('Text/Error', 'Error message', { fontSize: 12, fill: C.destructive }),
    txt('Text/Code', 'JBSW Y3DP EHPK 3PXP', {
      fontFamily: 'JetBrains Mono',
      fontSize: 18,
      fontWeight: '600',
    }),
    txt('Text/Lyric Active', 'Current lyric line', {
      fontFamily: 'font-heading',
      fontSize: 34,
      fontWeight: '700',
      textGrowth: 'fixed-width',
      width: 720,
    }),
    txt('Text/Lyric', 'Upcoming lyric line', {
      fontFamily: 'font-heading',
      fontSize: 34,
      fontWeight: '700',
      fill: C.mutedForeground,
      textGrowth: 'fixed-width',
      width: 720,
    }),
    txt('Text/Lyric Past', 'Past lyric line', {
      fontFamily: 'font-heading',
      fontSize: 34,
      fontWeight: '700',
      fill: C.textSubdued,
      textGrowth: 'fixed-width',
      width: 720,
    }),
    txt('Text/On Media', 'On artwork', { fill: C.white }),
    txt('Text/On Media Display', 'On artwork', {
      fontFamily: 'font-heading',
      fontSize: 60,
      fontWeight: '700',
      fill: C.white,
    }),
  )
  /* icons */
  add(
    icn('Icon/Muted', C.mutedForeground),
    icn('Icon/Foreground', C.foreground),
    icn('Icon/Primary', C.primary),
    icn('Icon/Destructive', C.destructive),
    icn('Icon/Success', C.success),
    icn('Icon/Info', C.info),
    icn('Icon/On Media', C.white),
  )
}
