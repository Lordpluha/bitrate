// The landing's footer (legal links and copyright, desktop and phone) and the phone page menu sheet
// with its section links and account actions (LandingFooter, LandingMobileMenu).
import { C, Col, F, I, Row, T } from '../kit.mjs'
import { brandRow } from './lib-brand.mjs'
import { artistPaint } from './paint.mjs'

/** Adds the landing footer and the page menu to the library. */
export function addLandingMenu(lib) {
  const { comp, part, add, slot, use } = lib
  const paint = artistPaint()
  const brand = brandRow(use)
  for (const compact of [false, true])
    add(
      comp(
        `Landing/Footer${compact ? ' Compact' : ''}`,
        (compact ? Col : Row)(
          {
            name: 'Footer',
            width: compact ? 358 : 1280,
            padding: [28, 0],
            gap: 16,
            stroke: C.artistReleaseBorder,
            strokeWidth: { top: 1 },
            ...(compact ? {} : { justifyContent: 'space_between', alignItems: 'center' }),
          },
          [
            slot('links', {
              layout: compact ? 'vertical' : 'horizontal',
              width: 'fit_content',
              gap: compact ? 10 : 24,
            }),
            part(
              'copyright',
              T('© 2026 Bitrate · FOR ARTISTS', { fontSize: 11, fill: C.artistTextSecondary }),
            ),
          ],
        ),
      ),
    )
  for (const active of [false, true])
    add(
      comp(
        `Landing/Menu Link${active ? ' Active' : ''}`,
        Row(
          {
            name: 'Menu Link',
            width: 326,
            height: 52,
            padding: [0, 4],
            gap: 8,
            ...paint.hairline(),
          },
          [
            part(
              'label',
              T('Product', {
                fontSize: 18,
                fontWeight: '500',
                fill: active ? C.artistIcon : C.artistForeground,
                width: 'fill_container',
                textGrowth: 'fixed-width',
              }),
            ),
            I('arrow-right', { width: 16, height: 16, fill: C.artistTextSecondary }),
          ],
        ),
      ),
    )
  add(
    comp(
      'Landing/Menu',
      Col(
        {
          name: 'Menu Sheet',
          width: 358,
          gap: 20,
          padding: 16,
          cornerRadius: 20,
          ...paint.sheet(),
        },
        [
          Row({ name: 'Top', width: 'fill_container', gap: 8 }, [
            brand(false),
            F({ name: 'Space', width: 'fill_container', height: 1 }),
            use('Button/Icon', { name: 'Close' }, { icon: { icon: 'x' } }),
          ]),
          slot('links', { gap: 0 }),
          Col({ name: 'Account', gap: 12, width: 'fill_container', alignItems: 'center' }, [
            use('Button/Large Primary', { name: 'Create an account', width: 'fill_container' }),
            T('Log in', { fontSize: 13, fontWeight: '500', fill: C.artistForeground }),
          ]),
        ],
      ),
    ),
  )
}
