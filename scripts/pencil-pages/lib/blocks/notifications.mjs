// Library page blocks: notification modes.
import { C, T, I, F, Row, Col, img, ART } from '../../kit.mjs'
import { part, comp, gradient } from '../engine.mjs'

/* ---------- notification modes: one switch, three exclusive modes (Off · In the app · Always, system) ---------- */
const modeCard = ({ selected, blocked } = {}) =>
  Row(
    {
      name: 'Mode',
      width: 420,
      padding: 14,
      gap: 12,
      cornerRadius: 16,
      fill: selected ? C.secondary : C.card,
      stroke: selected ? C.primary : C.border,
      strokeWidth: selected ? 2 : 1,
      alignItems: 'start',
      opacity: blocked ? 0.72 : 1,
    },
    [
      F(
        {
          name: 'Radio',
          width: 20,
          height: 20,
          cornerRadius: 10,
          stroke: selected ? C.primary : C.input,
          strokeWidth: selected ? 6 : 1.5,
          fill: C.background,
        },
        [],
      ),
      part(
        'iconTile',
        F(
          {
            name: 'Icon',
            width: 36,
            height: 36,
            cornerRadius: 10,
            fill: selected ? C.primary : C.muted,
            justifyContent: 'center',
            alignItems: 'center',
          },
          [
            part(
              'icon',
              I(blocked ? 'bell-off' : 'bell', {
                width: 18,
                height: 18,
                fill: selected ? C.primaryForeground : C.foreground,
              }),
            ),
          ],
        ),
      ),
      Col({ name: 'Text', gap: 2, width: 'fill_container' }, [
        Row({ name: 'Head', gap: 8, width: 'fill_container' }, [
          part('title', T('In the app', { fontSize: 14, fontWeight: '600' })),
          part(
            'tag',
            Row(
              {
                name: 'Tag',
                height: 20,
                padding: [0, 8],
                cornerRadius: 10,
                fill: blocked ? C.warningSurface : C.muted,
                stroke: blocked ? C.warningBorder : C.border,
                strokeWidth: 1,
              },
              [
                part(
                  'tagText',
                  T(blocked ? 'Blocked by the system' : 'Default', {
                    fontSize: 11,
                    fontWeight: '600',
                    fill: blocked ? C.warningText : C.mutedForeground,
                  }),
                ),
              ],
            ),
          ),
        ]),
        part(
          'desc',
          T('Pop-ups appear only while Bitrate is open. Nothing on your lock screen or desktop.', {
            fontSize: 13,
            fill: C.mutedForeground,
            textGrowth: 'fixed-width',
            width: 'fill_container',
            lineHeight: 1.45,
          }),
        ),
      ]),
    ],
  )
/** Registers this section's library components, in build order. */
export function register(add) {
  add(
    comp('Notifications/Mode', modeCard()),
    comp('Notifications/Mode Selected', modeCard({ selected: true })),
    comp('Notifications/Mode Blocked', modeCard({ blocked: true })),
    comp(
      'Notifications/System Banner',
      Col(
        {
          name: 'System Banner',
          width: 360,
          padding: 14,
          gap: 8,
          cornerRadius: 20,
          fill: C.card,
          stroke: C.border,
          strokeWidth: 1,
          effect: [
            { type: 'background_blur', radius: 24 },
            {
              type: 'shadow',
              shadowType: 'outer',
              color: C.shadow,
              offset: { x: 0, y: 12 },
              blur: 32,
            },
          ],
        },
        [
          Row({ name: 'App', gap: 8, width: 'fill_container' }, [
            F(
              {
                name: 'App Icon',
                width: 20,
                height: 20,
                cornerRadius: 5,
                fill: gradient(C.primary, C.magenta500, 135),
                justifyContent: 'center',
                alignItems: 'center',
              },
              [I('audio-waveform', { width: 12, height: 12, fill: C.white })],
            ),
            T('BITRATE', {
              fontSize: 11,
              fontWeight: '600',
              letterSpacing: 0.6,
              fill: C.mutedForeground,
            }),
            F({ name: 'Spacer', width: 'fill_container', height: 1 }),
            part('time', T('now', { fontSize: 11, fill: C.mutedForeground })),
          ]),
          Row({ name: 'Body', gap: 12, width: 'fill_container' }, [
            Col({ gap: 2, width: 'fill_container' }, [
              part(
                'title',
                T('Mira Sol released “Night Signal”', { fontSize: 14, fontWeight: '600' }),
              ),
              part(
                'desc',
                T('An artist you follow · tap to play', { fontSize: 13, fill: C.mutedForeground }),
              ),
            ]),
            part(
              'cover',
              F({ name: 'Cover', width: 40, height: 40, cornerRadius: 8, fill: img(ART.night) }),
            ),
          ]),
        ],
      ),
    ),
    comp(
      'Notifications/Permission Prompt',
      Col(
        {
          name: 'Permission Prompt',
          width: 340,
          padding: 16,
          gap: 12,
          cornerRadius: 12,
          fill: C.popover,
          stroke: C.border,
          strokeWidth: 1,
          effect: {
            type: 'shadow',
            shadowType: 'outer',
            color: C.shadow,
            offset: { x: 0, y: 16 },
            blur: 40,
          },
        },
        [
          part('origin', T('bitrate.app wants to', { fontSize: 13, fill: C.mutedForeground })),
          Row({ name: 'Ask', gap: 10 }, [
            I('bell', { width: 18, height: 18, fill: C.foreground }),
            part('ask', T('Show notifications', { fontSize: 14, fontWeight: '500' })),
          ]),
          Row({ name: 'Buttons', gap: 8, width: 'fill_container', justifyContent: 'end' }, [
            Row(
              {
                name: 'Block',
                height: 32,
                padding: [0, 14],
                cornerRadius: 16,
                stroke: C.border,
                strokeWidth: 1,
              },
              [T('Block', { fontSize: 13, fontWeight: '500' })],
            ),
            Row({ name: 'Allow', height: 32, padding: [0, 14], cornerRadius: 16, fill: C.info }, [
              T('Allow', { fontSize: 13, fontWeight: '600', fill: C.white }),
            ]),
          ]),
        ],
      ),
    ),
    comp(
      'Notifications/Explainer',
      Col(
        {
          name: 'Explainer',
          width: 420,
          padding: 24,
          gap: 16,
          cornerRadius: 20,
          fill: C.popover,
          stroke: C.border,
          strokeWidth: 1,
          effect: {
            type: 'shadow',
            shadowType: 'outer',
            color: C.shadow,
            offset: { x: 0, y: 24 },
            blur: 60,
          },
        },
        [
          F(
            {
              name: 'Bell',
              width: 48,
              height: 48,
              cornerRadius: 14,
              fill: gradient(C.primary, C.magenta500, 135),
              justifyContent: 'center',
              alignItems: 'center',
            },
            [I('bell-ring', { width: 22, height: 22, fill: C.white })],
          ),
          Col({ gap: 6, width: 'fill_container' }, [
            part(
              'title',
              T('Get notifications from your system', {
                fontSize: 20,
                fontWeight: '600',
                fontFamily: 'font-heading',
                textGrowth: 'fixed-width',
                width: 'fill_container',
              }),
            ),
            part(
              'desc',
              T(
                'Your phone or computer will show them, even when Bitrate is closed. Bitrate itself stops showing pop-ups, so you never get the same thing twice.',
                {
                  fontSize: 14,
                  fill: C.mutedForeground,
                  textGrowth: 'fixed-width',
                  width: 'fill_container',
                  lineHeight: 1.5,
                },
              ),
            ),
          ]),
          Col(
            { name: 'Examples', gap: 8, width: 'fill_container' },
            [
              ['disc-3', 'New releases from artists you follow'],
              ['users-round', 'Friends inviting you to a Jam'],
              ['monitor-speaker', 'Bitrate Connect handoffs to this device'],
            ].map(([icon, t]) =>
              Row({ name: 'Example', gap: 10 }, [
                I(icon, { width: 16, height: 16, fill: C.accent }),
                T(t, { fontSize: 13 }),
              ]),
            ),
          ),
          part(
            'next',
            T('Next, your system asks for permission.', { fontSize: 12, fill: C.mutedForeground }),
          ),
          Row({ name: 'Buttons', gap: 8, width: 'fill_container', justifyContent: 'end' }, [
            Row(
              {
                name: 'Not now',
                height: 40,
                padding: [0, 16],
                cornerRadius: 10,
                stroke: C.border,
                strokeWidth: 1,
              },
              [part('cancel', T('Not now', { fontSize: 14, fontWeight: '500' }))],
            ),
            Row(
              { name: 'Continue', height: 40, padding: [0, 16], cornerRadius: 10, fill: C.primary },
              [
                part(
                  'confirm',
                  T('Continue', { fontSize: 14, fontWeight: '600', fill: C.primaryForeground }),
                ),
              ],
            ),
          ]),
        ],
      ),
    ),
  )
}
