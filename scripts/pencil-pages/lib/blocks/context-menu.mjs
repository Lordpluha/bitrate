// Library page blocks: context menu and drawer.
import { C, T, I, F, Row, Col, img, ART } from '../../kit.mjs'
import { part, comp, slot } from '../engine.mjs'

/* ---------- context menu (desktop, shadcn Context Menu anatomy) and drawer (mobile, shadcn Drawer) ---------- */
const cmRow = (
  name,
  {
    icon = 'list-plus',
    label = 'Add to queue',
    shortcut,
    trailing,
    active,
    tone,
    disabled,
    check,
  } = {},
) =>
  comp(
    name,
    Row(
      {
        name: 'Item',
        width: 240,
        height: 32,
        padding: [0, 8],
        gap: 8,
        cornerRadius: 6,
        fill: active ? C.secondary : undefined,
        opacity: disabled ? 0.5 : 1,
      },
      [
        check !== undefined
          ? part(
              'check',
              F(
                {
                  name: 'Check',
                  width: 16,
                  height: 16,
                  justifyContent: 'center',
                  alignItems: 'center',
                },
                [
                  part(
                    'checkIcon',
                    I('check', { width: 14, height: 14, fill: C.foreground, enabled: check }),
                  ),
                ],
              ),
            )
          : part(
              'icon',
              I(icon, {
                width: 16,
                height: 16,
                fill: tone === 'destructive' ? C.destructive : C.mutedForeground,
              }),
            ),
        part(
          'label',
          T(label, { fontSize: 13, fill: tone === 'destructive' ? C.destructive : C.foreground }),
        ),
        F({ name: 'Spacer', width: 'fill_container', height: 1 }),
        trailing === 'sub'
          ? I('chevron-right', { width: 14, height: 14, fill: C.mutedForeground })
          : part(
              'shortcut',
              T(shortcut ?? '', {
                fontSize: 12,
                letterSpacing: 1,
                fill: C.mutedForeground,
                enabled: Boolean(shortcut),
              }),
            ),
      ],
    ),
  )
const dwRow = (
  name,
  { icon = 'list-plus', label = 'Add to queue', trailing, tone, disabled } = {},
) =>
  comp(
    name,
    Row(
      {
        name: 'Item',
        width: 390,
        height: 52,
        padding: [0, 20],
        gap: 14,
        opacity: disabled ? 0.5 : 1,
      },
      [
        part(
          'icon',
          I(icon, {
            width: 20,
            height: 20,
            fill: tone === 'destructive' ? C.destructive : C.foreground,
          }),
        ),
        Col({ name: 'Text', gap: 0, width: 'fill_container' }, [
          part(
            'label',
            T(label, {
              fontSize: 15,
              fontWeight: '500',
              fill: tone === 'destructive' ? C.destructive : C.foreground,
            }),
          ),
          part('hint', T('', { fontSize: 12, fill: C.mutedForeground, enabled: false })),
        ]),
        trailing === 'sub'
          ? I('chevron-right', { width: 18, height: 18, fill: C.mutedForeground })
          : trailing === 'check'
            ? I('check', { width: 18, height: 18, fill: C.primary })
            : F({ name: 'Trailing', width: 1, height: 1 }),
      ],
    ),
  )
const mediaHead = (name, w, size) =>
  comp(
    name,
    Row({ name: 'Header', width: w, padding: w === 240 ? [6, 8] : [4, 20, 12, 20], gap: 10 }, [
      part(
        'cover',
        F({
          name: 'Cover',
          width: size,
          height: size,
          cornerRadius: size / 6,
          fill: img(ART.afterglow),
        }),
      ),
      Col({ gap: 0, width: 'fill_container' }, [
        part('title', T('Afterglow', { fontSize: w === 240 ? 13 : 16, fontWeight: '600' })),
        part(
          'meta',
          T('Nova & the Static · Track', {
            fontSize: w === 240 ? 12 : 13,
            fill: C.mutedForeground,
          }),
        ),
      ]),
    ]),
  )
/** Registers this section's library components, in build order. */
export function register(add) {
  add(
    comp(
      'Context Menu',
      Col(
        {
          name: 'Context Menu',
          width: 248,
          padding: 4,
          gap: 0,
          cornerRadius: 10,
          fill: C.popover,
          stroke: C.border,
          strokeWidth: 1,
          effect: {
            type: 'shadow',
            shadowType: 'outer',
            color: C.shadow,
            offset: { x: 0, y: 12 },
            blur: 32,
          },
        },
        [slot('items', { gap: 0, width: 240 })],
      ),
    ),
    cmRow('Context Menu/Item', { shortcut: 'Q' }),
    cmRow('Context Menu/Item Active', {
      icon: 'list-start',
      label: 'Play next',
      shortcut: '⇧N',
      active: true,
    }),
    cmRow('Context Menu/Item Sub', {
      icon: 'list-music',
      label: 'Add to playlist',
      trailing: 'sub',
    }),
    cmRow('Context Menu/Item Sub Open', {
      icon: 'list-music',
      label: 'Add to playlist',
      trailing: 'sub',
      active: true,
    }),
    cmRow('Context Menu/Item Checkbox', {
      label: 'Saved to Liked Songs',
      shortcut: 'L',
      check: true,
    }),
    cmRow('Context Menu/Item Destructive', {
      icon: 'trash-2',
      label: 'Remove from playlist',
      shortcut: '⌫',
      tone: 'destructive',
    }),
    cmRow('Context Menu/Item Disabled', { icon: 'download', label: 'Download', disabled: true }),
    comp(
      'Context Menu/Label',
      Row({ name: 'Label', width: 240, height: 28, padding: [0, 8] }, [
        part('label', T('Track', { fontSize: 12, fontWeight: '600', fill: C.mutedForeground })),
      ]),
    ),
    comp(
      'Context Menu/Separator',
      Row({ name: 'Separator', width: 240, padding: [4, 0] }, [
        F({ name: 'Line', width: 'fill_container', height: 1, fill: C.border }),
      ]),
    ),
    mediaHead('Context Menu/Header', 240, 36),
    comp(
      'Drawer',
      Col(
        {
          name: 'Drawer',
          width: 390,
          gap: 0,
          padding: [0, 0, 28, 0],
          cornerRadius: [24, 24, 0, 0],
          fill: C.popover,
          stroke: C.border,
          strokeWidth: { top: 1 },
          effect: {
            type: 'shadow',
            shadowType: 'outer',
            color: C.shadow,
            offset: { x: 0, y: -12 },
            blur: 40,
          },
        },
        [
          Row(
            {
              name: 'Handle Row',
              width: 'fill_container',
              padding: [12, 0, 12, 0],
              justifyContent: 'center',
            },
            [F({ name: 'Handle', width: 100, height: 6, cornerRadius: 3, fill: C.muted })],
          ),
          slot('content', { gap: 0 }),
          part(
            'footer',
            Row({ name: 'Footer', width: 'fill_container', padding: [12, 20, 0, 20] }, [
              Row(
                {
                  name: 'Cancel',
                  width: 'fill_container',
                  height: 48,
                  cornerRadius: 12,
                  stroke: C.border,
                  strokeWidth: 1,
                  justifyContent: 'center',
                },
                [part('cancel', T('Cancel', { fontSize: 15, fontWeight: '600' }))],
              ),
            ]),
          ),
        ],
      ),
    ),
    mediaHead('Drawer/Header', 390, 48),
    comp(
      'Drawer/Title',
      Col({ name: 'Title', width: 390, padding: [4, 20, 12, 20], gap: 2 }, [
        part(
          'title',
          T('Add to playlist', { fontSize: 18, fontWeight: '600', fontFamily: 'font-heading' }),
        ),
        part('desc', T('Afterglow · Nova & the Static', { fontSize: 13, fill: C.mutedForeground })),
      ]),
    ),
    dwRow('Drawer/Item'),
    dwRow('Drawer/Item Sub', { icon: 'list-music', label: 'Add to playlist', trailing: 'sub' }),
    dwRow('Drawer/Item Checked', {
      icon: 'heart',
      label: 'Saved to Liked Songs',
      trailing: 'check',
    }),
    dwRow('Drawer/Item Destructive', {
      icon: 'trash-2',
      label: 'Remove from playlist',
      tone: 'destructive',
    }),
    dwRow('Drawer/Item Disabled', { icon: 'download', label: 'Download', disabled: true }),
    comp(
      'Drawer/Separator',
      Row({ name: 'Separator', width: 390, padding: [6, 20] }, [
        F({ name: 'Line', width: 'fill_container', height: 1, fill: C.border }),
      ]),
    ),
  )
}
