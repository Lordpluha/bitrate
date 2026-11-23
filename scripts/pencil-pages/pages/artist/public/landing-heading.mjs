// The landing's section heading: eyebrow, title with its accent line and lead, centred or start-aligned.

/** Section heading: eyebrow, title with its accent line, lead. */
export function landingHeading(ui) {
  const { Tx, Col } = ui
  const wrap = (center) => ({
    width: 'fill_container',
    textGrowth: 'fixed-width',
    ...(center ? { textAlign: 'center' } : {}),
  })
  return (m, eyebrow, title, accent, lead, center = true) =>
    Col(
      {
        name: 'Heading',
        gap: m ? 8 : 12,
        width: 'fill_container',
        alignItems: center ? 'center' : 'start',
      },
      [
        Tx('Eyebrow', eyebrow.toUpperCase(), center ? { textAlign: 'center' } : {}),
        Tx('Section', title, wrap(center)),
        ...(accent ? [Tx('Section Accent', accent, wrap(center))] : []),
        Tx('Lead', lead, wrap(center)),
      ],
    )
}
