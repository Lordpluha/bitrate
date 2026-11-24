// The landing brand: the Bitrate mark, the wordmark and the FOR ARTISTS badge, shared by the landing
// header and the phone page menu.
import { C, Row, T } from '../kit.mjs'

/** The brand row builder for library components: `(withBadge = true) → Row`. */
export function brandRow(use) {
  const badge = () =>
    Row(
      {
        name: 'Badge',
        height: 20,
        padding: [0, 8],
        cornerRadius: 10,
        stroke: C.artistReleaseBorder,
        strokeWidth: 1,
      },
      [
        T('FOR ARTISTS', {
          fontSize: 9,
          fontWeight: '600',
          letterSpacing: 1.2,
          fill: C.artistTextSecondary,
        }),
      ],
    )
  /* "Bitrate / FOR ARTISTS": the divider and badge are hidden below 900px (LandingHeader.css) */
  const brand = (withBadge = true) =>
    Row({ name: 'Brand', gap: 10 }, [
      use('Logo/Mark', { name: 'Mark' }),
      T('Bitrate', { fontSize: 18, fontWeight: '500', fill: C.artistForeground }),
      ...(withBadge ? [T('/', { fontSize: 16, fill: C.artistTextSecondary }), badge()] : []),
    ])
  return brand
}
