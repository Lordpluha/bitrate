// Library page blocks: forms, auth and surfaces.
import { C, T, P, H, I, F, Row, Col, Ref, Badge, Button, img, ART } from '../../kit.mjs'
import { reg, part, comp, slot } from '../engine.mjs'
import { OTP_STATES, otpField } from './typography-icons.mjs'

/** Registers this section's library components, in build order. */
export function register(add) {
  /* forms, auth, surfaces */
  add(
    comp(
      'Setting Row',
      Row(
        {
          name: 'Setting Row',
          width: 'fill_container',
          padding: [14, 0],
          gap: 24,
          stroke: C.border,
          strokeWidth: { bottom: 1 },
        },
        [
          Col({ gap: 4, width: 'fill_container' }, [
            part(
              'title',
              T('Setting', {
                fontWeight: '600',
                textGrowth: 'fixed-width',
                width: 'fill_container',
              }),
            ),
            part('desc', P('Description of what this setting changes.', { fontSize: 13 })),
          ]),
          slot('control', { width: 'fit_content', layout: 'horizontal', alignItems: 'center' }),
        ],
      ),
    ),
    comp(
      'Form/Field Error',
      Row({ name: 'Field Error', gap: 8 }, [
        I('circle-alert', { width: 14, height: 14, fill: C.destructive }),
        part('text', T('Error message', { fontSize: 12, fill: C.destructive })),
      ]),
    ),
    comp(
      'Form/Checkbox Row',
      Row({ name: 'Checkbox Row', width: 360, gap: 10, alignItems: 'start' }, [
        F({ name: 'Box', width: 16, height: 16, cornerRadius: 4, stroke: C.input, strokeWidth: 1 }),
        part('label', P('I accept the terms.', { fontSize: 13, fill: C.foreground })),
      ]),
    ),
    comp(
      'Form/Drop Zone',
      F(
        {
          name: 'Drop Zone',
          width: 'fill_container',
          height: 120,
          cornerRadius: 12,
          stroke: C.border,
          strokeWidth: 1,
          layout: 'vertical',
          gap: 8,
          justifyContent: 'center',
          alignItems: 'center',
        },
        [
          I('image-up', { width: 24, height: 24, fill: C.foreground }),
          part('text', T('Drag an image here, or click to choose', { fontSize: 13 })),
          part('button', Button('Choose file', 'outline')),
        ],
      ),
    ),
    comp(
      'Form/Drop Zone/Active',
      F(
        {
          name: 'Drop Zone Active',
          width: 'fill_container',
          height: 120,
          cornerRadius: 12,
          fill: C.infoSurface,
          stroke: C.info,
          strokeWidth: 2,
          layout: 'vertical',
          gap: 6,
          justifyContent: 'center',
          alignItems: 'center',
        },
        [
          I('upload', { width: 24, height: 24, fill: C.infoText }),
          part(
            'text',
            T('Release to upload', { fontSize: 14, fontWeight: '600', fill: C.foreground }),
          ),
          part('file', T('night-signal-master.wav · 48 MB', { fontSize: 12, fill: C.infoText })),
        ],
      ),
    ),
    ...OTP_STATES.map(([state, o]) => comp(`Form/OTP/${state}`, otpField(o))),
    ...[
      [
        'Focused',
        {
          stroke: C.ring,
          ring: true,
          value: 'Night drive',
          hint: 'Shown on your profile and in shared links.',
        },
      ],
      [
        'Error',
        {
          stroke: C.destructive,
          value: 'night drive!!',
          hint: 'Use letters, numbers and spaces only.',
          tone: 'error',
        },
      ],
      [
        'Success',
        {
          stroke: C.successBorder,
          value: 'night-drive',
          hint: 'This handle is available.',
          tone: 'success',
        },
      ],
    ].map(([state, o]) =>
      comp(
        `Input/${state}`,
        Col({ name: `Input ${state}`, width: 274, gap: 6 }, [
          part('label', T('Label', { fontSize: 14, fontWeight: '500', fill: C.foreground })),
          Row(
            {
              name: 'Input',
              width: 'fill_container',
              height: 40,
              padding: [0, 12],
              gap: 8,
              cornerRadius: 6,
              fill: C.background,
              stroke: o.stroke,
              strokeWidth: o.ring ? 2 : 1,
              ...(o.ring
                ? {
                    effect: {
                      type: 'shadow',
                      shadowType: 'outer',
                      color: C.ring,
                      offset: { x: 0, y: 0 },
                      blur: 8,
                    },
                  }
                : {}),
            },
            [
              part('value', T(o.value, { fontSize: 14, fill: C.foreground })),
              F({ name: 'Spacer', width: 'fill_container', height: 1 }),
              ...(o.tone === 'error'
                ? [I('circle-alert', { width: 16, height: 16, fill: C.destructive })]
                : []),
              ...(o.tone === 'success'
                ? [I('circle-check', { width: 16, height: 16, fill: C.successText })]
                : []),
            ],
          ),
          part(
            'hint',
            T(o.hint, {
              fontSize: 12,
              fill:
                o.tone === 'error'
                  ? C.destructive
                  : o.tone === 'success'
                    ? C.successText
                    : C.mutedForeground,
            }),
          ),
        ]),
      ),
    ),

    comp(
      'Auth/Or Divider',
      Row({ name: 'Or Divider', width: 'fill_container', gap: 12 }, [
        F({ width: 'fill_container', height: 1, fill: C.border }),
        T('or', { fontSize: 13, fill: C.mutedForeground }),
        F({ width: 'fill_container', height: 1, fill: C.border }),
      ]),
    ),
    comp(
      'Auth/Provider',
      F(
        {
          name: 'Provider',
          width: 'fill_container',
          height: 40,
          cornerRadius: 8,
          stroke: C.border,
          strokeWidth: 1,
          justifyContent: 'center',
          alignItems: 'center',
          gap: 6,
        },
        [
          part('label', T('Provider', { fontSize: 12, fontWeight: '600' })),
          part('soon', Badge('Soon', 'secondary')),
        ],
      ),
    ),
    comp(
      'Auth/Brand Panel',
      F(
        {
          name: 'Brand Panel',
          width: 640,
          height: 900,
          layout: 'vertical',
          justifyContent: 'space_between',
          padding: 48,
          fill: img(ART.hero),
        },
        [
          Row({ gap: 10 }, [
            Ref('OVOcb', { name: 'Mark', width: 32, height: 32 }),
            T('Bitrate', {
              fontFamily: 'font-heading',
              fontSize: 22,
              fontWeight: '600',
              fill: C.white,
            }),
          ]),
          Col({ gap: 12, width: 'fill_container' }, [
            part(
              'headline',
              H('Your music, ready when you are.', 44, {
                fill: C.white,
                textGrowth: 'fixed-width',
                width: 460,
                lineHeight: 1.05,
              }),
            ),
            part(
              'sub',
              T('Listen, save and return to your library from the browser.', {
                fill: C.neutral200,
                fontSize: 16,
              }),
            ),
          ]),
        ],
      ),
    ),
    comp(
      'Logo/Lockup',
      Row({ name: 'Lockup', gap: 10 }, [
        Ref('OVOcb', { name: 'Mark', width: 30, height: 30 }),
        T('Bitrate', { fontFamily: 'font-heading', fontSize: 20, fontWeight: '600' }),
      ]),
    ),
    comp(
      'Surface/Panel',
      F(
        {
          name: 'Panel',
          width: 'fill_container',
          layout: 'vertical',
          padding: 24,
          gap: 16,
          cornerRadius: 14,
          fill: C.card,
          stroke: C.border,
          strokeWidth: 1,
        },
        [slot('content')],
      ),
    ),
    comp(
      'Surface/Menu',
      F(
        {
          name: 'Menu',
          width: 260,
          layout: 'vertical',
          padding: 6,
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
        [slot('items', { gap: 0 })],
      ),
    ),
    comp(
      'Menu/Item',
      Row({ name: 'Menu Item', width: 'fill_container', height: 36, padding: [0, 10] }, [
        part('label', T('Item', { fontSize: 13 })),
      ]),
    ),
    comp(
      'Menu/Item Destructive',
      Row({ name: 'Menu Item', width: 'fill_container', height: 36, padding: [0, 10] }, [
        part('label', T('Delete', { fontSize: 13, fill: C.destructive })),
      ]),
    ),
    comp(
      'Menu/Item Disabled',
      Row({ name: 'Menu Item', width: 'fill_container', height: 36, padding: [0, 10] }, [
        part('label', T('Unavailable', { fontSize: 13, fill: C.textSubdued })),
      ]),
    ),
    comp(
      'Menu/Item Warning',
      Row({ name: 'Menu Item', width: 'fill_container', height: 36, padding: [0, 10], gap: 10 }, [
        I('archive', { width: 16, height: 16, fill: C.warningText }),
        part('label', T('Archive', { fontSize: 13, fill: C.warningText })),
      ]),
    ),
    comp(
      'Menu/Item Locked',
      Row({ name: 'Menu Item', width: 'fill_container', height: 36, padding: [0, 10], gap: 10 }, [
        I('lock', { width: 16, height: 16, fill: C.textSubdued }),
        part('label', T('Delete permanently', { fontSize: 13, fill: C.textSubdued })),
        F({ name: 'Spacer', width: 'fill_container', height: 1 }),
        part('hint', T('Published', { fontSize: 11, fill: C.textSubdued })),
      ]),
    ),
    comp(
      'Alert/Warning',
      Row(
        {
          name: 'Warning',
          width: 'fill_container',
          padding: [12, 16],
          gap: 10,
          cornerRadius: 10,
          fill: C.warningSurface,
          stroke: C.warningBorder,
          strokeWidth: 1,
        },
        [
          I('triangle-alert', { width: 16, height: 16, fill: C.warningText }),
          part('text', P('Warning text', { fontSize: 13, fill: C.warningText })),
        ],
      ),
    ),
    comp(
      'Note',
      Col({ name: 'Note', width: 'fill_container', padding: 16, cornerRadius: 10, fill: C.muted }, [
        part('text', P('Note text', { fontSize: 13 })),
      ]),
    ),
    comp(
      'Public Header',
      Row(
        {
          name: 'Public Header',
          width: 1440,
          height: 72,
          padding: [0, 48],
          justifyContent: 'space_between',
          stroke: C.border,
          strokeWidth: { bottom: 1 },
        },
        [
          Ref(reg['Logo/Lockup'].id, { name: 'Lockup' }),
          Row({ gap: 10 }, [Button('Login', 'ghost'), Button('Register', 'default')]),
        ],
      ),
    ),
  )
}
