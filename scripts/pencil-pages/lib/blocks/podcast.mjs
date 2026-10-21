// Library page blocks: podcasts.
import { C, T, P, I, F, Row, Col, img, ART } from '../../kit.mjs'
import { part, comp, cover } from '../engine.mjs'

/* podcasts: episode rows (default, playing, in progress, played), podcast transport, chapters */
const epRow = (name, kind) =>
  comp(
    name,
    Row(
      {
        name: 'Episode',
        width: 'fill_container',
        padding: [14, 12],
        gap: 16,
        cornerRadius: 12,
        alignItems: 'start',
        ...(kind === 'playing' ? { fill: C.sidebarAccent } : {}),
      },
      [
        part('cover', cover({ width: 64, height: 64, cornerRadius: 8, fill: img(ART.stage) })),
        Col({ gap: 6, width: 'fill_container' }, [
          Row({ name: 'Meta', gap: 8 }, [
            part('date', T('8 Oct 2026', { fontSize: 12, fill: C.mutedForeground })),
            T('·', { fontSize: 12, fill: C.mutedForeground }),
            part('duration', T('48 min', { fontSize: 12, fill: C.mutedForeground })),
            ...(kind === 'played'
              ? [
                  Row({ gap: 4 }, [
                    I('circle-check', { width: 12, height: 12, fill: C.success }),
                    T('Played', { fontSize: 12, fill: C.successText }),
                  ]),
                ]
              : []),
            ...(kind === 'progress'
              ? [
                  part(
                    'left',
                    T('23 min left', { fontSize: 12, fontWeight: '600', fill: C.accent }),
                  ),
                ]
              : []),
            ...(kind === 'playing'
              ? [
                  Row({ gap: 4 }, [
                    I('audio-lines', { width: 12, height: 12, fill: C.accent }),
                    T('Playing', { fontSize: 12, fontWeight: '600', fill: C.accent }),
                  ]),
                ]
              : []),
          ]),
          part(
            'title',
            T('Episode title', {
              fontSize: 15,
              fontWeight: '600',
              fill:
                kind === 'playing'
                  ? C.accent
                  : kind === 'played'
                    ? C.mutedForeground
                    : C.foreground,
            }),
          ),
          part(
            'desc',
            P('Episode description that wraps to two lines in the list.', {
              fontSize: 13,
              textGrowth: 'fixed-width',
              width: 'fill_container',
            }),
          ),
          ...(kind === 'progress' || kind === 'playing'
            ? [
                Row({ name: 'Progress', width: 'fill_container', gap: 0, height: 3 }, [
                  part(
                    'elapsedBar',
                    F({ name: 'Elapsed', width: 180, height: 3, cornerRadius: 2, fill: C.primary }),
                  ),
                  F({
                    name: 'Rest',
                    width: 'fill_container',
                    height: 3,
                    cornerRadius: 2,
                    fill: C.surface,
                  }),
                ]),
              ]
            : []),
        ]),
        Row({ name: 'Actions', gap: 10, alignItems: 'center' }, [
          part(
            'save',
            I(kind === 'played' ? 'bookmark-plus' : 'bookmark-check', {
              width: 18,
              height: 18,
              fill: kind === 'played' ? C.mutedForeground : C.accent,
            }),
          ),
          I('ellipsis', { width: 18, height: 18, fill: C.mutedForeground }),
          F(
            {
              name: 'Play',
              width: 36,
              height: 36,
              cornerRadius: 18,
              fill: kind === 'playing' ? C.primary : C.muted,
              justifyContent: 'center',
              alignItems: 'center',
            },
            [
              I(kind === 'playing' ? 'pause' : 'play', {
                width: 14,
                height: 14,
                fill: kind === 'playing' ? C.primaryForeground : C.foreground,
              }),
            ],
          ),
        ]),
      ],
    ),
  )
const skip = (icon, n) =>
  Col({ name: `Skip ${n}`, gap: 0, alignItems: 'center' }, [
    I(icon, { width: 26, height: 26, fill: C.foreground }),
    T(String(n), { fontSize: 10, fontWeight: '700', fill: C.mutedForeground }),
  ])
/** Registers this section's library components, in build order. */
export function register(add) {
  add(
    epRow('Podcast/Episode', 'default'),
    epRow('Podcast/Episode Playing', 'playing'),
    epRow('Podcast/Episode Progress', 'progress'),
    epRow('Podcast/Episode Played', 'played'),
  )
  add(
    comp(
      'Podcast/Transport',
      Row({ name: 'Podcast Transport', width: 'fill_container', justifyContent: 'space_between' }, [
        Row(
          {
            name: 'Speed',
            height: 30,
            padding: [0, 10],
            cornerRadius: 15,
            stroke: C.border,
            strokeWidth: 1,
          },
          [part('speed', T('1×', { fontSize: 13, fontWeight: '600' }))],
        ),
        skip('rotate-ccw', 15),
        F(
          {
            name: 'Play',
            width: 64,
            height: 64,
            cornerRadius: 32,
            fill: C.primary,
            justifyContent: 'center',
            alignItems: 'center',
          },
          [part('playIcon', I('pause', { width: 26, height: 26, fill: C.primaryForeground }))],
        ),
        skip('rotate-cw', 30),
        Row({ name: 'Sleep', gap: 4 }, [
          I('moon', { width: 18, height: 18, fill: C.mutedForeground }),
          part('timer', T('Off', { fontSize: 12, fill: C.mutedForeground })),
        ]),
      ]),
    ),
    comp(
      'Podcast/Chapter',
      Row(
        { name: 'Chapter', width: 'fill_container', padding: [10, 12], gap: 14, cornerRadius: 10 },
        [
          part(
            'time',
            T('12:40', {
              fontSize: 12,
              fontWeight: '600',
              fill: C.accent,
              fontFamily: 'font-sans',
            }),
          ),
          part('title', T('Chapter', { fontSize: 14, fill: C.foreground })),
          F({ name: 'Spacer', width: 'fill_container', height: 1 }),
          part('duration', T('8 min', { fontSize: 12, fill: C.mutedForeground })),
        ],
      ),
    ),
    comp(
      'Podcast/Chapter Active',
      Row(
        {
          name: 'Chapter',
          width: 'fill_container',
          padding: [10, 12],
          gap: 14,
          cornerRadius: 10,
          fill: C.sidebarAccent,
        },
        [
          I('audio-lines', { width: 14, height: 14, fill: C.accent }),
          part('time', T('12:40', { fontSize: 12, fontWeight: '600', fill: C.accent })),
          part('title', T('Chapter', { fontSize: 14, fontWeight: '600' })),
          F({ name: 'Spacer', width: 'fill_container', height: 1 }),
          part('duration', T('8 min', { fontSize: 12, fill: C.mutedForeground })),
        ],
      ),
    ),
    comp(
      'Podcast/Seek Chapters',
      Col({ name: 'Seek', width: 'fill_container', gap: 8 }, [
        Row({ name: 'Rail', width: 'fill_container', height: 12, gap: 2 }, [
          F({ name: 'Ch 1', width: 90, height: 4, cornerRadius: 2, fill: C.primary }),
          F({ name: 'Ch 2', width: 120, height: 4, cornerRadius: 2, fill: C.primary }),
          part(
            'current',
            F({ name: 'Ch 3', width: 60, height: 4, cornerRadius: 2, fill: C.primary }),
          ),
          F({ name: 'Thumb', width: 12, height: 12, cornerRadius: 6, fill: C.foreground }),
          F({ name: 'Ch 3 rest', width: 50, height: 4, cornerRadius: 2, fill: C.surface }),
          F({ name: 'Ch 4', width: 'fill_container', height: 4, cornerRadius: 2, fill: C.surface }),
        ]),
        Row({ name: 'Times', width: 'fill_container', justifyContent: 'space_between' }, [
          part('elapsed', T('24:12', { fontSize: 12, fill: C.mutedForeground })),
          part(
            'chapter',
            T('Chapter 3 · Headphone mixes', { fontSize: 12, fontWeight: '600', fill: C.accent }),
          ),
          part('duration', T('-23:48', { fontSize: 12, fill: C.mutedForeground })),
        ]),
      ]),
    ),
  )
}
