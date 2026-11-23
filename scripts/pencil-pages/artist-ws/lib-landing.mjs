// Chrome of the public landing (views/ArtistView): the glass header with the brand, section dock and
// account actions, its phone variant, dock pills, and the eyebrow and capability pills (footer and
// phone menu: lib-landing-menu.mjs; large actions: lib-actions.mjs).
import { C, F, Row, T } from '../kit.mjs'
import { brandRow } from './lib-brand.mjs'
import { artistPaint } from './paint.mjs'

/** Adds the landing chrome to the library. */
export function addLanding(lib) {
  const { comp, part, add, slot, use, nest } = lib
  const paint = artistPaint()
  const brand = brandRow(use)
  const themeButton = () =>
    part('theme', use('Button/Icon', { name: 'Theme' }, { icon: { icon: 'moon' } }))
  for (const active of [false, true])
    add(
      comp(
        `Landing/Pill${active ? ' Active' : ''}`,
        Row(
          {
            name: 'Dock Pill',
            height: 32,
            padding: [0, 14],
            cornerRadius: 16,
            ...(active
              ? { fill: C.artistSelection, stroke: C.artistSelectionBorder, strokeWidth: 1 }
              : {}),
          },
          [
            part(
              'label',
              T('Product', {
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
      'Landing/Header',
      Row({ name: 'Landing Header', width: 1280, height: 72, gap: 16, ...paint.hairline() }, [
        brand(),
        F({ name: 'Space', width: 'fill_container', height: 1 }),
        Row({ name: 'Dock', padding: 4, gap: 4, cornerRadius: 20, ...paint.control() }, [
          slot('dock', { layout: 'horizontal', width: 'fit_content', gap: 4 }),
        ]),
        F({ name: 'Space', width: 'fill_container', height: 1 }),
        themeButton(),
        use(
          'Button/Compact Outline',
          { name: 'Language' },
          { icon: { icon: 'globe' }, label: { content: 'EN' } },
        ),
        part('login', T('Log in', { fontSize: 12, fontWeight: '500', fill: C.artistForeground })),
        use(
          'Button/Compact Primary',
          { name: 'Sign up' },
          { icon: { icon: 'arrow-right' }, label: { content: 'Sign up' } },
        ),
      ]),
    ),
    comp(
      'Landing/Header Mobile',
      Row(
        {
          name: 'Landing Header',
          width: 390,
          height: 64,
          padding: [0, 16],
          gap: 8,
          ...paint.hairline(),
        },
        [
          brand(false),
          F({ name: 'Space', width: 'fill_container', height: 1 }),
          themeButton(),
          use(
            'Button/Compact Outline',
            { name: 'Language' },
            { icon: { enabled: false }, label: { content: 'EN' } },
          ),
          part('menu', use('Button/Icon', { name: 'Menu' }, { icon: { icon: 'menu' } })),
        ],
      ),
    ),
    comp(
      'Landing/Eyebrow',
      Row(
        {
          name: 'Eyebrow',
          height: 32,
          padding: [0, 16],
          gap: 10,
          cornerRadius: 16,
          fill: C.artistSelection,
          stroke: C.artistSelectionBorder,
          strokeWidth: 1,
        },
        [
          part(
            'label',
            T('BITRATE FOR ARTISTS', {
              fontSize: 11,
              fontWeight: '600',
              letterSpacing: 1.6,
              fill: C.artistIcon,
            }),
          ),
          T('·', { fontSize: 11, fill: C.artistTextSecondary }),
          part(
            'meta',
            T('STUDIO RELEASE OS', {
              fontSize: 11,
              letterSpacing: 0.6,
              fill: C.artistTextSecondary,
            }),
          ),
        ],
      ),
    ),
    comp(
      'Landing/Morph',
      Row(
        {
          name: 'Capability',
          height: 30,
          padding: [0, 12],
          gap: 8,
          cornerRadius: 15,
          ...paint.control(),
        },
        [
          F({ name: 'Dot', width: 6, height: 6, cornerRadius: 3, fill: C.artistIcon }),
          part(
            'label',
            T('Guided 4-stage release lifecycle', { fontSize: 12, fill: C.artistForeground }),
          ),
        ],
      ),
    ),
  )
  nest('Landing/Header', 'theme', 'Button/Icon')
  nest('Landing/Header Mobile', 'theme', 'Button/Icon')
}
