// Form controls of the workspace: labelled input, textarea and select on the control surface, the
// error field, switch rows, option cards (radio), checks, and the tab strip.
import { C, Col, F, I, Row, T } from '../kit.mjs'
import { artistPaint } from './paint.mjs'

/** Adds the form controls to the library. */
export function addForms(lib) {
  const { comp, part, add, slot } = lib
  const paint = artistPaint()
  const label = () => part('label', T('Label', { fontSize: 11, fill: C.artistTextSecondary }))
  const box = (height, children, error) =>
    Row(
      {
        name: 'Box',
        width: 'fill_container',
        height,
        padding: [0, 12],
        gap: 8,
        cornerRadius: 10,
        alignItems: height > 40 ? 'start' : 'center',
        ...paint.control(),
        ...(height > 40 ? { padding: [10, 12] } : {}),
        ...(error ? { stroke: C.artistStatusError } : {}),
      },
      children,
    )
  const value = () =>
    part(
      'value',
      T('Value', {
        fontSize: 12,
        fill: C.artistForeground,
        width: 'fill_container',
        textGrowth: 'fixed-width',
        lineHeight: 1.5,
      }),
    )
  const field = (name, height, extra = [], error = false) =>
    comp(
      name,
      Col({ name: 'Field', gap: 6, width: 320 }, [
        label(),
        box(height, [value(), ...extra], error),
        ...(error
          ? [
              Row({ name: 'Error', gap: 6 }, [
                I('circle-alert', { width: 13, height: 13, fill: C.artistStatusError }),
                part('error', T('Error', { fontSize: 11, fill: C.artistStatusError })),
              ]),
            ]
          : []),
      ]),
    )
  add(
    field('Field/Input', 40),
    field('Field/Input Error', 40, [], true),
    field('Field/Textarea', 76),
    field('Field/Select', 40, [
      I('chevron-down', { width: 16, height: 16, fill: C.artistTextSecondary }),
    ]),
    comp(
      'Field/Error',
      Row({ name: 'Field Error', gap: 6 }, [
        I('circle-alert', { width: 13, height: 13, fill: C.artistStatusError }),
        part('text', T('Error', { fontSize: 11, fill: C.artistStatusError })),
      ]),
    ),
  )
  for (const on of [true, false])
    add(
      comp(
        `Switch/${on ? 'On' : 'Off'}`,
        Row({ name: 'Switch Row', width: 320, gap: 12, padding: [8, 0] }, [
          Col({ name: 'Text', gap: 2, width: 'fill_container' }, [
            part('label', T('Label', { fontSize: 12, fill: C.artistForeground })),
          ]),
          Row(
            {
              name: 'Track',
              width: 36,
              height: 20,
              padding: 2,
              cornerRadius: 10,
              justifyContent: on ? 'end' : 'start',
              ...(on ? { fill: paint.action().fill } : paint.control()),
            },
            [
              F({
                name: 'Thumb',
                width: 16,
                height: 16,
                cornerRadius: 8,
                fill: on ? C.primaryForeground : C.artistTextSecondary,
              }),
            ],
          ),
        ]),
      ),
    )
  for (const selected of [false, true])
    add(
      comp(
        selected ? 'Option/Card Selected' : 'Option/Card',
        Row(
          {
            name: 'Option',
            width: 320,
            gap: 12,
            padding: 12,
            cornerRadius: 10,
            alignItems: 'start',
            ...(selected
              ? { fill: C.artistSelection, stroke: C.artistSelectionBorder, strokeWidth: 1 }
              : paint.control()),
          },
          [
            I(selected ? 'circle-dot' : 'circle', {
              width: 16,
              height: 16,
              fill: selected ? C.artistIcon : C.artistTextSecondary,
            }),
            Col({ name: 'Text', gap: 2, width: 'fill_container' }, [
              part(
                'title',
                T('Option', { fontSize: 12, fontWeight: '500', fill: C.artistForeground }),
              ),
              part(
                'desc',
                T('Description', {
                  fontSize: 11,
                  fill: C.artistTextSecondary,
                  width: 'fill_container',
                  textGrowth: 'fixed-width',
                }),
              ),
            ]),
          ],
        ),
      ),
    )
  for (const [state, icon, role] of [
    ['Done', 'circle-check', 'artistStatusReady'],
    ['Pending', 'circle-dashed', 'artistStatusWarning'],
  ])
    add(
      comp(
        `Check/${state}`,
        Row({ name: 'Check', gap: 8, width: 320 }, [
          I(icon, { width: 15, height: 15, fill: C[role] }),
          part(
            'label',
            T('Check', {
              fontSize: 11,
              fill: C.artistForeground,
              width: 'fill_container',
              textGrowth: 'fixed-width',
            }),
          ),
        ]),
      ),
    )
  for (const active of [true, false])
    add(
      comp(
        `Tab/${active ? 'Active' : 'Inactive'}`,
        Row(
          {
            name: 'Tab',
            height: 32,
            padding: [0, 14],
            cornerRadius: 8,
            justifyContent: 'center',
            ...(active
              ? { fill: C.artistSelection, stroke: C.artistSelectionBorder, strokeWidth: 1 }
              : {}),
          },
          [
            part(
              'label',
              T('Tab', {
                fontSize: 12,
                fill: active ? C.artistForeground : C.artistTextSecondary,
              }),
            ),
          ],
        ),
      ),
    )
  add(
    comp(
      'Tabs',
      Row({ name: 'Tabs', padding: 4, gap: 4, cornerRadius: 12, ...paint.control() }, [
        slot('items', { layout: 'horizontal', width: 'fit_content', gap: 4 }),
      ]),
    ),
  )
}
