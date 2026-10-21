// Library page blocks: home and player.
import { C, T, I, F, Row, Col } from '../../kit.mjs'
import { part, comp, cover, gradient, slot, muted } from '../engine.mjs'

/** Registers this section's library components, in build order. */
export function register(add) {
  /* home & player */
  add(
    comp(
      'Quick Tile',
      Row(
        {
          name: 'Quick Tile',
          width: 'fill_container',
          height: 56,
          gap: 12,
          cornerRadius: 8,
          fill: C.card,
          clip: true,
        },
        [
          part('cover', cover({ width: 56, height: 56, cornerRadius: 0 })),
          part(
            'title',
            T('Title', {
              fontSize: 13,
              fontWeight: '600',
              textGrowth: 'fixed-width',
              width: 'fill_container',
            }),
          ),
        ],
      ),
    ),
    comp(
      'Quick Tile/Liked',
      Row(
        {
          name: 'Quick Tile',
          width: 'fill_container',
          height: 56,
          gap: 12,
          cornerRadius: 8,
          fill: C.card,
          clip: true,
        },
        [
          F(
            {
              name: 'Liked',
              width: 56,
              height: 56,
              fill: gradient(C.gradientPrimaryFrom, C.gradientPrimaryTo),
              justifyContent: 'center',
              alignItems: 'center',
            },
            [I('heart', { width: 20, height: 20, fill: C.white })],
          ),
          part(
            'title',
            T('Liked Songs', {
              fontSize: 13,
              fontWeight: '600',
              textGrowth: 'fixed-width',
              width: 'fill_container',
            }),
          ),
        ],
      ),
    ),
    comp(
      'Device Row/Active',
      Row(
        {
          name: 'Device Row',
          width: 'fill_container',
          height: 64,
          padding: [0, 12],
          gap: 12,
          cornerRadius: 12,
          fill: C.muted,
          stroke: C.ring,
          strokeWidth: 1,
        },
        [
          F(
            {
              width: 40,
              height: 40,
              cornerRadius: 8,
              fill: C.surface,
              justifyContent: 'center',
              alignItems: 'center',
            },
            [part('icon', I('laptop', { width: 20, height: 20, fill: C.accent }))],
          ),
          Col({ gap: 2, width: 'fill_container' }, [
            part('name', T('This computer', { fontWeight: '600' })),
            part('status', T('Playing here', { fontSize: 13, fill: C.accent })),
          ]),
          I('audio-lines', { width: 20, height: 20, fill: C.accent }),
        ],
      ),
      { cell: 'medium' },
    ),
    comp(
      'Device Row',
      Row(
        {
          name: 'Device Row',
          width: 'fill_container',
          height: 64,
          padding: [0, 12],
          gap: 12,
          cornerRadius: 12,
        },
        [
          F(
            {
              width: 40,
              height: 40,
              cornerRadius: 8,
              fill: C.surface,
              justifyContent: 'center',
              alignItems: 'center',
            },
            [part('icon', I('speaker', { width: 20, height: 20, fill: C.foreground }))],
          ),
          Col({ gap: 2, width: 'fill_container' }, [
            part('name', T('Device', { fontWeight: '600' })),
            part('status', muted('Available')),
          ]),
        ],
      ),
      { cell: 'medium' },
    ),
    comp(
      'Surface/Sheet',
      F(
        {
          name: 'Sheet',
          width: 390,
          layout: 'vertical',
          gap: 8,
          padding: [8, 16, 34, 16],
          cornerRadius: [20, 20, 0, 0],
          fill: C.popover,
          stroke: C.border,
          strokeWidth: { top: 1 },
        },
        [
          Row(
            {
              name: 'Grabber Row',
              width: 'fill_container',
              justifyContent: 'center',
              padding: [0, 0, 8, 0],
            },
            [F({ name: 'Grabber', width: 36, height: 4, cornerRadius: 2, fill: C.border })],
          ),
          slot('content', { gap: 8 }),
        ],
      ),
    ),
    comp(
      'Seek Bar',
      Col({ name: 'Seek Bar', width: 'fill_container', gap: 8 }, [
        Row({ name: 'Rail', width: 'fill_container', height: 12, gap: 0, alignItems: 'center' }, [
          part(
            'elapsedBar',
            F({ name: 'Elapsed', width: 160, height: 4, cornerRadius: 2, fill: C.primary }),
          ),
          F({ name: 'Thumb', width: 12, height: 12, cornerRadius: 6, fill: C.foreground }),
          F({
            name: 'Remaining',
            width: 'fill_container',
            height: 4,
            cornerRadius: 2,
            fill: C.surface,
          }),
        ]),
        Row({ name: 'Times', width: 'fill_container', justifyContent: 'space_between' }, [
          part('elapsed', T('1:48', { fontSize: 12, fill: C.mutedForeground })),
          part('duration', T('3:42', { fontSize: 12, fill: C.mutedForeground })),
        ]),
      ]),
      { cell: 'medium' },
    ),
    comp(
      'Transport',
      Row({ name: 'Transport', width: 'fill_container', justifyContent: 'space_between' }, [
        I('shuffle', { width: 22, height: 22 }),
        I('skip-back', { width: 30, height: 30, fill: C.foreground }),
        F(
          {
            name: 'Play',
            width: 68,
            height: 68,
            cornerRadius: 34,
            fill: C.primary,
            justifyContent: 'center',
            alignItems: 'center',
          },
          [part('playIcon', I('pause', { width: 30, height: 30, fill: C.primaryForeground }))],
        ),
        I('skip-forward', { width: 30, height: 30, fill: C.foreground }),
        part('repeat', I('repeat', { width: 22, height: 22, fill: C.accent })),
      ]),
      { cell: 'medium' },
    ),
  )
}
