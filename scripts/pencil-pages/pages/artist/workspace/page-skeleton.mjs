// shared/ui PageSkeleton: the loading placeholder of workspace pages — cards, a table of five rows, or
// the release header with panels. Its label is for screen readers only, so nothing is written.

/** `(m, variant = 'cards') → nodes` bound to the screen helpers `ui`. */
export function pageSkeleton(ui) {
  const { W, Col } = ui
  const tile = (i) => W('Skeleton/Tile', { name: `Skeleton ${i}`, width: 'fill_container' })
  return (m, variant = 'cards') => {
    if (variant === 'table')
      return [
        W(
          'Panel',
          { name: 'Skeleton table', width: 'fill_container' },
          {
            content: Col(
              { name: 'Rows', gap: 0, width: 'fill_container' },
              [1, 2, 3, 4, 5].map((i) =>
                W('Skeleton/Row', { name: `Row ${i}`, width: 'fill_container' }),
              ),
            ),
          },
        ),
      ]
    if (variant === 'release')
      return [W('Skeleton/Row', { name: 'Header', width: 'fill_container' }), tile(1), tile(2)]
    return (m ? [1, 2, 3] : [1, 2]).map(tile)
  }
}
