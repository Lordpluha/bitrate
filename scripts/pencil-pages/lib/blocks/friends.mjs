// Library page blocks: friends and presence.
import { C, T, F, Row, Col, img, ART } from '../../kit.mjs'
import { part, comp, slot } from '../engine.mjs'

/* friends: presence is shown to friends only — dot + label, and the avatar ring carries the same tone */
const PRESENCE = {
  Online: [C.success, 'Online'],
  Listening: [C.primary, 'Listening to Afterglow'],
  Away: [C.warning, 'Away · 12 min'],
  Offline: [null, 'Last seen 2 h ago'],
}
const presenceDot = (tone) =>
  F({
    name: 'Dot',
    width: 8,
    height: 8,
    cornerRadius: 4,
    ...(tone ? { fill: tone } : { stroke: C.mutedForeground, strokeWidth: 1 }),
  })
const ringAvatar = (tone, size) =>
  part(
    'avatar',
    F({
      name: 'Avatar',
      width: size,
      height: size,
      cornerRadius: size / 2,
      fill: img(ART.avatar2),
      ...(tone ? { stroke: tone, strokeWidth: 2 } : {}),
    }),
  )
/** Registers this section's library components, in build order. */
export function register(add) {
  for (const [k, [tone, label]] of Object.entries(PRESENCE))
    add(
      comp(
        `Presence/${k}`,
        Row({ name: 'Presence', gap: 6 }, [
          presenceDot(tone),
          part(
            'label',
            T(label, {
              fontSize: 12,
              fill: k === 'Listening' ? C.accent : C.mutedForeground,
              fontWeight: k === 'Offline' ? 'normal' : '500',
            }),
          ),
        ]),
      ),
    )
  for (const [k, [tone, label]] of Object.entries(PRESENCE)) {
    const node = comp(
      `Friend Row/${k}`,
      Row(
        {
          name: 'Friend',
          width: 'fill_container',
          padding: [10, 0],
          gap: 12,
          stroke: C.border,
          strokeWidth: { bottom: 1 },
        },
        [
          ringAvatar(tone, 44),
          Col({ gap: 3, width: 'fill_container' }, [
            part('name', T('Name', { fontWeight: '600' })),
            Row({ name: 'Presence', gap: 6 }, [
              presenceDot(tone),
              part(
                'status',
                T(label, {
                  fontSize: 12,
                  fill: k === 'Listening' ? C.accent : C.mutedForeground,
                }),
              ),
            ]),
          ]),
          slot('actions', {
            layout: 'horizontal',
            width: 'fit_content',
            gap: 6,
            alignItems: 'center',
          }),
        ],
      ),
      { cell: 'medium' },
    )
    add(node)
  }
  for (const [k, [tone]] of Object.entries(PRESENCE))
    add(
      comp(
        `Friend Tile/${k}`,
        Col({ name: 'Friend Tile', width: 72, gap: 6, alignItems: 'center' }, [
          ringAvatar(tone, 56),
          part(
            'name',
            T('Name', {
              fontSize: 12,
              fontWeight: '500',
              textAlign: 'center',
              textGrowth: 'fixed-width',
              width: 'fill_container',
            }),
          ),
        ]),
      ),
    )
  add(
    comp(
      'People Row',
      Row(
        {
          name: 'Person',
          width: 'fill_container',
          padding: [10, 0],
          gap: 12,
          stroke: C.border,
          strokeWidth: { bottom: 1 },
        },
        [
          part(
            'avatar',
            F({ name: 'Avatar', width: 44, height: 44, cornerRadius: 22, fill: img(ART.avatar3) }),
          ),
          Col({ gap: 2, width: 'fill_container' }, [
            part('name', T('Name', { fontWeight: '600' })),
            part(
              'meta',
              T('@handle · 4 mutual friends', { fontSize: 12, fill: C.mutedForeground }),
            ),
          ]),
          slot('actions', {
            layout: 'horizontal',
            width: 'fit_content',
            gap: 6,
            alignItems: 'center',
          }),
        ],
      ),
      { cell: 'medium' },
    ),
  )
}
