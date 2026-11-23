// Landing showcase blocks (views/ArtistView): the studio window with its stage tabs, the release
// journey step card and the finale's empty release sleeve (person row and area chart: lib-data.mjs).
import { C, Col, F, I, Row, T } from '../kit.mjs'
import { artistPaint } from './paint.mjs'

/** Adds the studio window, stage tabs, journey step and release sleeve. */
export function addShowcase(lib) {
  const { comp, part, add, slot, use } = lib
  const paint = artistPaint()
  const wrap = { width: 'fill_container', textGrowth: 'fixed-width', lineHeight: 1.5 }
  const dot = () =>
    F({
      name: 'Light',
      width: 10,
      height: 10,
      cornerRadius: 5,
      fill: paint.tint(C.artistForeground, 0.2),
    })
  add(
    comp(
      'Landing/Window',
      Col(
        {
          name: 'Studio Window',
          width: 1120,
          gap: 0,
          cornerRadius: 18,
          clip: true,
          ...paint.releaseGlass(),
        },
        [
          Row(
            {
              name: 'Title Bar',
              width: 'fill_container',
              height: 40,
              padding: [0, 16],
              gap: 8,
              ...paint.hairline(),
            },
            [
              dot(),
              dot(),
              dot(),
              part(
                'title',
                T('Release workspace', {
                  fontSize: 11,
                  fill: C.artistTextSecondary,
                  textAlign: 'center',
                  ...wrap,
                }),
              ),
            ],
          ),
          slot('content', { gap: 20, padding: 24 }),
        ],
      ),
    ),
  )
  for (const active of [false, true])
    add(
      comp(
        `Landing/Stage Tab${active ? ' Active' : ''}`,
        Row(
          {
            name: 'Stage Tab',
            height: 40,
            padding: [0, 16],
            gap: 8,
            cornerRadius: 20,
            ...(active
              ? { fill: C.artistSelection, stroke: C.artistSelectionBorder, strokeWidth: 1 }
              : {}),
          },
          [
            part(
              'step',
              T('01', { fontSize: 10, letterSpacing: 0.8, fill: C.artistTextSecondary }),
            ),
            part(
              'icon',
              I('disc-3', {
                width: 15,
                height: 15,
                fill: active ? C.artistIcon : C.artistTextSecondary,
              }),
            ),
            part(
              'label',
              T('Release workspace', {
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
      'Landing/Step',
      Col(
        {
          name: 'Journey Step',
          width: 360,
          gap: 12,
          padding: 24,
          cornerRadius: 16,
          ...paint.releaseGlass(),
        },
        [
          Row({ name: 'Top', width: 'fill_container', gap: 8 }, [
            part(
              'label',
              T('DRAFT', {
                fontSize: 10,
                fontWeight: '600',
                letterSpacing: 1.4,
                fill: C.artistIcon,
                ...wrap,
              }),
            ),
            slot('status', { layout: 'horizontal', width: 'fit_content', gap: 8 }),
          ]),
          part(
            'title',
            T('Make it yours.', {
              fontSize: 20,
              fontWeight: '500',
              fill: C.artistForeground,
              ...wrap,
            }),
          ),
          part('desc', T('Description', { fontSize: 12, fill: C.artistTextSecondary, ...wrap })),
          slot('checks', { gap: 8 }),
          F({ name: 'Rule', width: 'fill_container', height: 1, fill: C.artistReleaseBorder }),
          part('caption', T('Caption', { fontSize: 11, fill: C.artistTextSecondary, ...wrap })),
        ],
      ),
    ),
  )
  add(
    comp(
      'Landing/Sleeve',
      Col(
        {
          name: 'Release Sleeve',
          width: 240,
          height: 240,
          padding: 18,
          cornerRadius: 16,
          justifyContent: 'space_between',
          ...paint.releaseGlass(),
        },
        [
          Row({ name: 'Top', gap: 8 }, [
            use('Logo/Mark', { name: 'Mark' }),
            T('FOR ARTISTS', {
              fontSize: 9,
              fontWeight: '600',
              letterSpacing: 1.2,
              fill: C.artistTextSecondary,
            }),
          ]),
          Row({ name: 'Middle', width: 'fill_container', justifyContent: 'center' }, [
            Row(
              {
                name: 'Plus',
                width: 56,
                height: 56,
                cornerRadius: 28,
                justifyContent: 'center',
                ...paint.action(),
              },
              [I('plus', { width: 24, height: 24, fill: C.primaryForeground })],
            ),
          ]),
          Row({ name: 'Bottom', width: 'fill_container', gap: 8 }, [
            part(
              'label',
              T('Untitled, for now.', { fontSize: 13, fill: C.artistForeground, ...wrap }),
            ),
            I('arrow-right', { width: 16, height: 16, fill: C.artistIcon }),
          ]),
        ],
      ),
    ),
  )
}
