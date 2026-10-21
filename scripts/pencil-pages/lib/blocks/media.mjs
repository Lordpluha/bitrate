// Library page blocks: media covers, chips and play controls.
import { C, T, I, F, img, ART } from '../../kit.mjs'
import { part, comp, cover, gradient } from '../engine.mjs'

/** Registers this section's library components, in build order. */
export function register(add) {
  /* media */
  add(
    comp('Media/Cover', part('image', cover())),
    comp(
      'Media/Cover Empty',
      F(
        {
          name: 'Cover Empty',
          width: 48,
          height: 48,
          cornerRadius: 8,
          fill: C.muted,
          stroke: C.border,
          strokeWidth: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        [I('music', { width: 20, height: 20, fill: C.mutedForeground })],
      ),
    ),
    comp('Media/Cover Large', part('image', cover({ width: 200, height: 200, cornerRadius: 12 }))),
    comp(
      'Media/Avatar',
      part('image', cover({ width: 40, height: 40, cornerRadius: 9999, fill: img(ART.avatar2) })),
    ),
    comp(
      'Media/Liked Cover',
      F(
        {
          name: 'Liked',
          width: 200,
          height: 200,
          cornerRadius: 12,
          fill: gradient(C.gradientPrimaryFrom, C.gradientPrimaryTo),
          justifyContent: 'center',
          alignItems: 'center',
        },
        [part('icon', I('heart', { width: 64, height: 64, fill: C.white }))],
      ),
    ),
    comp(
      'Media/Liked Cover Small',
      F(
        {
          name: 'Liked',
          width: 48,
          height: 48,
          cornerRadius: 6,
          fill: gradient(C.gradientPrimaryFrom, C.gradientPrimaryTo),
          justifyContent: 'center',
          alignItems: 'center',
        },
        [I('heart', { width: 20, height: 20, fill: C.white })],
      ),
    ),
    comp(
      'Media/Hero Image',
      part(
        'image',
        F({ name: 'Hero', width: 640, height: 320, cornerRadius: 16, fill: img(ART.hero) }),
      ),
    ),
  )
  /* chips, play */
  add(
    comp(
      'Chip/Default',
      F(
        {
          name: 'Chip',
          height: 32,
          padding: [0, 14],
          cornerRadius: 16,
          alignItems: 'center',
          stroke: C.border,
          strokeWidth: 1,
        },
        [part('label', T('Chip', { fontSize: 13 }))],
      ),
    ),
    comp(
      'Chip/Active',
      F(
        {
          name: 'Chip',
          height: 32,
          padding: [0, 14],
          cornerRadius: 16,
          alignItems: 'center',
          fill: C.primary,
        },
        [part('label', T('Chip', { fontSize: 13, fontWeight: '600', fill: C.primaryForeground }))],
      ),
    ),
    comp(
      'Button/Play',
      F(
        {
          name: 'Play',
          width: 56,
          height: 56,
          cornerRadius: 28,
          fill: C.primary,
          justifyContent: 'center',
          alignItems: 'center',
        },
        [part('icon', I('play', { width: 24, height: 24, fill: C.primaryForeground }))],
      ),
    ),
    comp(
      'Button/Play Small',
      F(
        {
          name: 'Play',
          width: 40,
          height: 40,
          cornerRadius: 20,
          fill: C.primary,
          justifyContent: 'center',
          alignItems: 'center',
        },
        [part('icon', I('play', { width: 18, height: 18, fill: C.primaryForeground }))],
      ),
    ),
    comp(
      'Button/Icon Outline',
      F(
        {
          name: 'Icon Button',
          width: 36,
          height: 36,
          cornerRadius: 8,
          justifyContent: 'center',
          alignItems: 'center',
          stroke: C.border,
          strokeWidth: 1,
        },
        [part('icon', I('plus', { width: 18, height: 18, fill: C.foreground }))],
      ),
    ),
    comp(
      'Button/Icon Ghost',
      F(
        {
          name: 'Icon Button',
          width: 36,
          height: 36,
          cornerRadius: 8,
          justifyContent: 'center',
          alignItems: 'center',
        },
        [part('icon', I('plus', { width: 20, height: 20, fill: C.foreground }))],
      ),
    ),
  )
}
