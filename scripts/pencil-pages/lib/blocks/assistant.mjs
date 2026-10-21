// Library page blocks: AI assistant.
import { C, T, I, F, Row, Col, Ref } from '../../kit.mjs'
import { reg, part, comp, slot } from '../engine.mjs'

/* AI assistant: a small button bottom-right on every page outside the in-app player; it expands into a chat */
const ATMO_G = {
  type: 'gradient',
  gradientType: 'linear',
  rotation: 135,
  colors: [
    { color: C.primary, position: 0 },
    { color: C.magenta500, position: 1 },
  ],
}
const bubble = (name, mine) =>
  comp(
    name,
    Row({ name: 'Bubble Row', width: 'fill_container', justifyContent: mine ? 'end' : 'start' }, [
      Col(
        {
          name: 'Bubble',
          width: 'fit_content',
          padding: [10, 12],
          cornerRadius: 14,
          gap: 4,
          ...(mine ? { fill: C.primary } : { fill: C.muted }),
        },
        [
          part(
            'text',
            T('Message', {
              fontSize: 13,
              lineHeight: 1.45,
              fill: mine ? C.primaryForeground : C.foreground,
              textGrowth: 'fixed-width',
              width: 240,
            }),
          ),
        ],
      ),
    ]),
  )
const orbFill = {
  type: 'gradient',
  gradientType: 'radial',
  colors: [
    { color: C.white, position: 0 },
    { color: C.accent, position: 0.35 },
    { color: C.primary, position: 0.7 },
    { color: C.magenta500, position: 1 },
  ],
}
const orb = (name, d) =>
  comp(
    name,
    F({
      name: 'Orb',
      width: d,
      height: d,
      cornerRadius: d / 2,
      fill: orbFill,
      effect: {
        type: 'shadow',
        shadowType: 'outer',
        color: C.primary,
        offset: { x: 0, y: 0 },
        blur: d / 2,
      },
    }),
  )
/** Registers this section's library components, in build order. */
export function register(add) {
  add(orb('Assistant/Orb', 64), orb('Assistant/Orb Small', 20))
  add(
    comp(
      'Assistant/FAB',
      F(
        {
          name: 'Assistant',
          width: 52,
          height: 52,
          cornerRadius: 26,
          fill: ATMO_G,
          justifyContent: 'center',
          alignItems: 'center',
          effect: {
            type: 'shadow',
            shadowType: 'outer',
            color: C.shadow,
            offset: { x: 0, y: 10 },
            blur: 28,
          },
        },
        [part('icon', I('sparkles', { width: 22, height: 22, fill: C.white }))],
      ),
    ),
    comp(
      'Assistant/FAB Open',
      F(
        {
          name: 'Assistant',
          width: 52,
          height: 52,
          cornerRadius: 26,
          fill: C.card,
          stroke: C.border,
          strokeWidth: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        [I('x', { width: 20, height: 20, fill: C.foreground })],
      ),
    ),
    bubble('Assistant/Message', false),
    bubble('Assistant/Message Mine', true),
    comp(
      'Assistant/Typing',
      Row({ name: 'Typing', gap: 8, padding: [8, 12], cornerRadius: 14, fill: C.muted }, [
        Ref(reg['Assistant/Orb Small'].id, { name: 'Orb' }),
        part('label', T('Searching the docs…', { fontSize: 12, fill: C.mutedForeground })),
      ]),
    ),
    comp(
      'Assistant/Suggestion',
      Row(
        {
          name: 'Suggestion',
          height: 32,
          padding: [0, 12],
          gap: 6,
          cornerRadius: 16,
          stroke: C.border,
          strokeWidth: 1,
        },
        [
          I('sparkles', { width: 12, height: 12, fill: C.accent }),
          part('label', T('Suggestion', { fontSize: 12, fontWeight: '500' })),
        ],
      ),
    ),
  )
  add(
    comp(
      'Assistant/Panel',
      Col(
        {
          name: 'Assistant Panel',
          width: 380,
          height: 540,
          cornerRadius: 18,
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
          Row(
            {
              name: 'Head',
              width: 'fill_container',
              height: 60,
              padding: [0, 14],
              gap: 10,
              stroke: C.border,
              strokeWidth: { bottom: 1 },
            },
            [
              F(
                {
                  name: 'Mark',
                  width: 32,
                  height: 32,
                  cornerRadius: 16,
                  fill: C.muted,
                  justifyContent: 'center',
                  alignItems: 'center',
                },
                [Ref(reg['Logo/Mark Path'].id, { name: 'Mark', width: 18, height: 18 })],
              ),
              Col({ gap: 1, width: 'fill_container' }, [
                T('Bitrate assistant', { fontSize: 14, fontWeight: '600' }),
                part(
                  'status',
                  T('AI · can make mistakes', { fontSize: 11, fill: C.mutedForeground }),
                ),
              ]),
              I('maximize-2', { width: 16, height: 16, fill: C.mutedForeground }),
              I('x', { width: 16, height: 16, fill: C.mutedForeground }),
            ],
          ),
          slot('messages', { height: 'fill_container', padding: 14, gap: 10 }),
          Col(
            {
              name: 'Composer',
              width: 'fill_container',
              padding: [10, 12, 12, 12],
              gap: 8,
              stroke: C.border,
              strokeWidth: { top: 1 },
            },
            [
              Row(
                {
                  name: 'Input',
                  width: 'fill_container',
                  height: 44,
                  padding: [0, 6, 0, 12],
                  gap: 8,
                  cornerRadius: 12,
                  fill: C.muted,
                },
                [
                  part(
                    'placeholder',
                    T('Ask about Bitrate…', { fontSize: 13, fill: C.mutedForeground }),
                  ),
                  F({ name: 'Spacer', width: 'fill_container', height: 1 }),
                  F(
                    {
                      name: 'Send',
                      width: 32,
                      height: 32,
                      cornerRadius: 10,
                      fill: C.primary,
                      justifyContent: 'center',
                      alignItems: 'center',
                    },
                    [I('arrow-up', { width: 16, height: 16, fill: C.primaryForeground })],
                  ),
                ],
              ),
              part(
                'disclaimer',
                T('Answers come from Bitrate docs. Do not share passwords or payment details.', {
                  fontSize: 10,
                  fill: C.textSubdued,
                }),
              ),
            ],
          ),
        ],
      ),
    ),
  )
}
