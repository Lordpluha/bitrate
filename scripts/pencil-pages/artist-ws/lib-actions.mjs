// Actions and status: the gradient primary button and its secondary, outline and ghost siblings (two
// sizes), the icon button, status chips (.artist-release-chip tones) and the allowance progress bar.
import { C, F, I, Row, T } from '../kit.mjs'
import { artistPaint } from './paint.mjs'

/* chip tones → the colour role that inks the label, icon and hairline */
const TONES = {
  Ready: 'artistStatusReady',
  Warning: 'artistStatusWarning',
  Processing: 'artistStatusProcessing',
  Error: 'artistStatusError',
  Brand: 'artistIcon',
  Neutral: 'artistTextSecondary',
}
const TONE_ICON = {
  Ready: 'circle-check',
  Warning: 'triangle-alert',
  Processing: 'loader-circle',
  Error: 'circle-x',
  Brand: 'sparkles',
  Neutral: 'circle-dashed',
}

/** Adds buttons, status chips and the progress bar to the library. */
export function addActions(lib) {
  const { comp, part, add } = lib
  const paint = artistPaint()
  const surfaces = {
    Primary: [paint.action(), C.primaryForeground, C.primaryForeground],
    Secondary: [paint.control(), C.artistForeground, C.artistTextSecondary],
    Outline: [{ stroke: C.artistReleaseBorder, strokeWidth: 1 }, C.artistForeground, C.artistIcon],
    Ghost: [{}, C.artistTextSecondary, C.artistTextSecondary],
    Danger: [
      { stroke: C.artistStatusError, strokeWidth: 1 },
      C.artistStatusError,
      C.artistStatusError,
    ],
  }
  for (const [size, height, pad, font] of [
    ['', 40, 18, 12],
    ['Compact ', 30, 12, 11],
  ])
    for (const [variant, [surface, ink, iconInk]] of Object.entries(surfaces))
      add(
        comp(
          `Button/${size}${variant}`,
          Row(
            {
              name: 'Button',
              height,
              padding: [0, pad],
              gap: 8,
              justifyContent: 'center',
              cornerRadius: height / 2,
              ...surface,
            },
            [
              part('icon', I('arrow-right', { width: 15, height: 15, fill: iconInk })),
              part('label', T('Button', { fontSize: font, fontWeight: '500', fill: ink })),
            ],
          ),
        ),
      )
  for (const [name, primary] of [
    ['Button/Large Primary', true],
    ['Button/Large Glass', false],
  ])
    add(
      comp(
        name,
        Row(
          {
            name: 'Large Button',
            height: 48,
            padding: [0, 22],
            gap: 10,
            cornerRadius: 12,
            justifyContent: 'center',
            ...(primary ? paint.action() : paint.control()),
          },
          [
            part(
              'label',
              T('Create an account', {
                fontSize: 13,
                fontWeight: '600',
                fill: primary ? C.primaryForeground : C.artistForeground,
              }),
            ),
            part(
              'icon',
              I('arrow-right', {
                width: 16,
                height: 16,
                fill: primary ? C.primaryForeground : C.artistIcon,
              }),
            ),
          ],
        ),
      ),
    )
  add(
    comp(
      'Button/Icon',
      Row(
        {
          name: 'Icon Button',
          width: 40,
          height: 40,
          cornerRadius: 10,
          justifyContent: 'center',
          stroke: C.artistReleaseBorder,
          strokeWidth: 1,
        },
        [part('icon', I('bell', { width: 17, height: 17, fill: C.artistForeground }))],
      ),
    ),
  )
  for (const [tone, role] of Object.entries(TONES))
    add(
      comp(
        `Status/${tone}`,
        Row(
          {
            name: 'Status',
            height: 24,
            padding: [0, 10],
            gap: 6,
            cornerRadius: 12,
            fill: paint.tint(C[role], 0.08),
            stroke: C[role],
            strokeWidth: 1,
          },
          [
            part('icon', I(TONE_ICON[tone], { width: 13, height: 13, fill: C[role] })),
            part('label', T(tone, { fontSize: 10, fontWeight: '500', fill: C[role] })),
          ],
        ),
      ),
    )
  add(
    comp(
      'Progress',
      Row(
        {
          name: 'Progress',
          width: 'fill_container',
          height: 6,
          cornerRadius: 3,
          clip: true,
          fill: paint.tint(C.artistForeground, 0.08),
        },
        [
          part(
            'bar',
            F({
              name: 'Bar',
              width: 80,
              height: 6,
              cornerRadius: 3,
              fill: paint.action().fill,
            }),
          ),
        ],
      ),
    ),
  )
}
