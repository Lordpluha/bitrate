// Library page blocks: timed comments.
import { C, T, I, F, Row, Col, img, ART } from '../../kit.mjs'
import { part, comp } from '../engine.mjs'

/* ---------- timed comments (SoundCloud-style): markers on the waveform, live bubbles, list and composer ---------- */
const CM_BARS = 48
const CM_PLAYED = 22
const cmHeights = Array.from({ length: CM_BARS }, (_, i) =>
  Math.round(8 + 26 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.37))),
)
/* markers sit at fixed fractions of the track; positions are spacer widths so the layout stays pure flex */
const CM_MARKS = [
  [0.12, 'avatar2'],
  [0.29, 'avatar3', 2],
  [0.46, 'avatar4', 0, true],
  [0.64, 'avatar1'],
  [0.83, 'avatar2'],
]
const cmWave = (name, w, { marks = true } = {}) => {
  const bar = 4
  const gap = (w - CM_BARS * bar) / (CM_BARS - 1)
  const M = 20
  const markRow = []
  let x = 0
  for (const [f, av, extra, current] of marks ? CM_MARKS : []) {
    const left = Math.round(f * w - M / 2)
    markRow.push(F({ name: 'Gap', width: Math.max(0, left - x), height: 1 }))
    markRow.push(
      F(
        {
          name: current ? 'Marker Current' : 'Marker',
          width: M,
          height: M,
          cornerRadius: M / 2,
          fill: img(ART[av]),
          stroke: current ? C.primary : C.background,
          strokeWidth: 2,
        },
        [],
      ),
    )
    x = left + M
    if (extra) {
      markRow.push(
        Row(
          {
            name: 'More',
            height: 16,
            padding: [0, 5],
            cornerRadius: 8,
            fill: C.secondary,
            justifyContent: 'center',
          },
          [T(`+${extra}`, { fontSize: 10, fontWeight: '600' })],
        ),
      )
      x += 24
    }
  }
  return comp(
    name,
    Col({ name: 'Waveform', width: w, gap: 6 }, [
      Row({ name: 'Markers', width: w, height: 20, gap: 0, alignItems: 'center' }, markRow),
      Row(
        { name: 'Bars', width: w, height: 36, gap, alignItems: 'center' },
        cmHeights.map((h, i) =>
          F({
            name: i === CM_PLAYED ? 'Playhead' : 'Bar',
            width: i === CM_PLAYED ? 2 : bar,
            height: i === CM_PLAYED ? 36 : h,
            cornerRadius: 2,
            fill: i === CM_PLAYED ? C.primary : i < CM_PLAYED ? C.foreground : C.border,
          }),
        ),
      ),
    ]),
  )
}
const cmChip = (t = '1:48') =>
  Row({ name: 'Time', height: 20, padding: [0, 7], gap: 4, cornerRadius: 10, fill: C.secondary }, [
    I('clock-3', { width: 11, height: 11, fill: C.accent }),
    part('time', T(t, { fontSize: 11, fontFamily: 'JetBrains Mono', fill: C.accent })),
  ])
const commentRow = (name, current) =>
  comp(
    name,
    Row(
      {
        name: 'Comment',
        width: 358,
        padding: [10, 12],
        gap: 12,
        cornerRadius: 14,
        fill: current ? C.secondary : undefined,
        stroke: current ? C.primary : undefined,
        strokeWidth: current ? 1 : undefined,
        alignItems: 'start',
      },
      [
        part(
          'avatar',
          F({ name: 'Avatar', width: 32, height: 32, cornerRadius: 16, fill: img(ART.avatar2) }),
        ),
        Col({ name: 'Body', gap: 4, width: 'fill_container' }, [
          Row({ name: 'Head', gap: 8, width: 'fill_container' }, [
            part('name', T('Jonah', { fontSize: 13, fontWeight: '600' })),
            part('chip', cmChip('0:27')),
            F({ name: 'Spacer', width: 'fill_container', height: 1 }),
            part('ago', T('2 h', { fontSize: 11, fill: C.mutedForeground })),
          ]),
          part(
            'text',
            T('This synth entrance gets me every time.', {
              fontSize: 14,
              textGrowth: 'fixed-width',
              width: 'fill_container',
              lineHeight: 1.4,
            }),
          ),
          Row({ name: 'Actions', gap: 14 }, [
            Row({ gap: 4 }, [
              I('heart', { width: 13, height: 13, fill: C.mutedForeground }),
              part('likes', T('12', { fontSize: 12, fill: C.mutedForeground })),
            ]),
            part('reply', T('Reply', { fontSize: 12, fontWeight: '600', fill: C.mutedForeground })),
          ]),
        ]),
      ],
    ),
  )
/** Registers this section's library components, in build order. */
export function register(add) {
  add(
    cmWave('Comments/Waveform', 358),
    cmWave('Comments/Waveform Wide', 640),
    cmWave('Comments/Waveform Empty', 358, { marks: false }),
    cmWave('Comments/Waveform Wide Empty', 640, { marks: false }),
    comp(
      'Comments/Bubble',
      Row(
        {
          name: 'Bubble',
          width: 300,
          padding: [10, 12],
          gap: 10,
          cornerRadius: 16,
          fill: C.popover,
          stroke: C.border,
          strokeWidth: 1,
          alignItems: 'start',
          effect: {
            type: 'shadow',
            shadowType: 'outer',
            color: C.shadow,
            offset: { x: 0, y: 10 },
            blur: 28,
          },
        },
        [
          part(
            'avatar',
            F({ name: 'Avatar', width: 28, height: 28, cornerRadius: 14, fill: img(ART.avatar4) }),
          ),
          Col({ name: 'Body', gap: 2, width: 'fill_container' }, [
            Row({ gap: 6 }, [
              part('name', T('Leo', { fontSize: 12, fontWeight: '600' })),
              part('chip', cmChip('1:48')),
            ]),
            part(
              'text',
              T('the drop at 1:48 is unreal 🔥', {
                fontSize: 13,
                textGrowth: 'fixed-width',
                width: 'fill_container',
                lineHeight: 1.4,
              }),
            ),
          ]),
        ],
      ),
    ),
    comp(
      'Comments/Row Skeleton',
      Row(
        { name: 'Comment Skeleton', width: 358, padding: [10, 12], gap: 12, alignItems: 'start' },
        [
          F({ name: 'Avatar', width: 32, height: 32, cornerRadius: 16, fill: C.muted }),
          Col({ name: 'Lines', gap: 8, width: 'fill_container' }, [
            F({ name: 'Line', width: 120, height: 10, cornerRadius: 5, fill: C.muted }),
            F({
              name: 'Line',
              width: 'fill_container',
              height: 10,
              cornerRadius: 5,
              fill: C.muted,
            }),
            F({ name: 'Line', width: 160, height: 10, cornerRadius: 5, fill: C.muted }),
          ]),
        ],
      ),
    ),
    commentRow('Comments/Row'),
    commentRow('Comments/Row Current', true),
    comp(
      'Comments/Composer',
      Row(
        {
          name: 'Composer',
          width: 358,
          height: 48,
          padding: [0, 6, 0, 6],
          gap: 10,
          cornerRadius: 24,
          fill: C.card,
          stroke: C.border,
          strokeWidth: 1,
        },
        [
          F({ name: 'Me', width: 32, height: 32, cornerRadius: 16, fill: img(ART.avatar1) }),
          part('placeholder', T('Comment at', { fontSize: 14, fill: C.mutedForeground })),
          part('chip', cmChip('1:48')),
          F({ name: 'Spacer', width: 'fill_container', height: 1 }),
          F(
            {
              name: 'Send',
              width: 36,
              height: 36,
              cornerRadius: 18,
              fill: C.muted,
              justifyContent: 'center',
              alignItems: 'center',
            },
            [I('arrow-up', { width: 16, height: 16, fill: C.mutedForeground })],
          ),
        ],
      ),
    ),
    comp(
      'Comments/Composer Active',
      Col(
        {
          name: 'Composer Active',
          width: 358,
          padding: [10, 6, 6, 14],
          gap: 8,
          cornerRadius: 22,
          fill: C.card,
          stroke: C.ring,
          strokeWidth: 2,
        },
        [
          Row({ name: 'Pinned', gap: 6 }, [
            T('Pinned to', { fontSize: 12, fill: C.mutedForeground }),
            part('chip', cmChip('1:48')),
            part('hint', T('· everyone sees it here', { fontSize: 12, fill: C.mutedForeground })),
          ]),
          Row({ name: 'Input', width: 'fill_container', gap: 10 }, [
            part(
              'text',
              T('that bassline under the vocal|', {
                fontSize: 15,
                textGrowth: 'fixed-width',
                width: 'fill_container',
              }),
            ),
            F(
              {
                name: 'Send',
                width: 36,
                height: 36,
                cornerRadius: 18,
                fill: C.primary,
                justifyContent: 'center',
                alignItems: 'center',
              },
              [I('arrow-up', { width: 16, height: 16, fill: C.primaryForeground })],
            ),
          ]),
        ],
      ),
    ),
    comp(
      'Comments/Header',
      Row({ name: 'Comments Header', width: 358, padding: [4, 0], gap: 8 }, [
        part(
          'title',
          T('Comments', { fontSize: 18, fontWeight: '600', fontFamily: 'font-heading' }),
        ),
        part('count', T('128', { fontSize: 13, fill: C.mutedForeground })),
        F({ name: 'Spacer', width: 'fill_container', height: 1 }),
        part(
          'sort',
          Row(
            {
              name: 'Sort',
              height: 30,
              padding: [0, 10],
              gap: 6,
              cornerRadius: 15,
              stroke: C.border,
              strokeWidth: 1,
            },
            [
              part('sortLabel', T('By time', { fontSize: 12, fontWeight: '500' })),
              I('chevron-down', { width: 13, height: 13, fill: C.mutedForeground }),
            ],
          ),
        ),
      ]),
    ),
  )
}
