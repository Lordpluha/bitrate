// Auth form fields: the password input with its show/hide eye (PasswordInput) and the one-time code
// input (six digits, centred, wide tracking; two-factor sign-in and email verification), each with an
// error variant. Same control surface as the workspace fields in lib-forms.mjs.
import { C, Col, I, Row, T } from '../kit.mjs'
import { artistPaint } from './paint.mjs'

/** Adds the password and one-time code fields to the library. */
export function addFields(lib) {
  const { comp, part, add } = lib
  const paint = artistPaint()
  const errorLine = () =>
    Row({ name: 'Error', gap: 6 }, [
      I('circle-alert', { width: 13, height: 13, fill: C.artistStatusError }),
      part('error', T('Error', { fontSize: 11, fill: C.artistStatusError })),
    ])
  const field = (name, box, below) =>
    comp(
      name,
      Col({ name: 'Field', gap: 6, width: 360 }, [
        part('label', T('Label', { fontSize: 11, fill: C.artistTextSecondary })),
        box,
        ...below,
      ]),
    )
  const surface = (height, error, children, o = {}) =>
    Row(
      {
        name: 'Box',
        width: 'fill_container',
        height,
        padding: [0, 12],
        gap: 8,
        cornerRadius: 10,
        ...paint.control(),
        ...(error ? { stroke: C.artistStatusError } : {}),
        ...o,
      },
      children,
    )
  for (const error of [false, true]) {
    add(
      field(
        `Field/Password${error ? ' Error' : ''}`,
        surface(40, error, [
          part(
            'value',
            T('••••••••••', {
              fontSize: 12,
              fill: C.artistForeground,
              width: 'fill_container',
              textGrowth: 'fixed-width',
            }),
          ),
          part('eye', I('eye', { width: 16, height: 16, fill: C.artistTextSecondary })),
        ]),
        error ? [errorLine()] : [],
      ),
    )
    add(
      field(
        `Field/Code${error ? ' Error' : ''}`,
        surface(
          64,
          error,
          [
            part(
              'value',
              T('000000', {
                fontSize: 28,
                fontWeight: '500',
                letterSpacing: 8,
                fill: C.artistForeground,
                textAlign: 'center',
                width: 'fill_container',
                textGrowth: 'fixed-width',
              }),
            ),
          ],
          { justifyContent: 'center' },
        ),
        error
          ? [errorLine()]
          : [
              part(
                'hint',
                T('Six digits. You can paste the entire code.', {
                  fontSize: 11,
                  fill: C.artistTextSecondary,
                }),
              ),
            ],
      ),
    )
  }
}
