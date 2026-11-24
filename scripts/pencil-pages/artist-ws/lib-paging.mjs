// Catalogue controls: the view toggles with their counts (Tracks / Releases) and the pagination page
// items (widgets/MusicCatalogue).
import { C, Row, T } from '../kit.mjs'

/** Adds the view toggles and page items to the library. */
export function addPaging(lib) {
  const { comp, part, add } = lib
  const small = (s, o = {}) => T(s, { fontSize: 11, fill: C.artistTextSecondary, ...o })
  for (const active of [false, true])
    add(
      comp(
        `Button/Toggle${active ? ' Active' : ''}`,
        Row(
          {
            name: 'Toggle',
            height: 40,
            padding: [0, 16],
            gap: 8,
            cornerRadius: 20,
            ...(active
              ? { fill: C.artistSelection, stroke: C.artistSelectionBorder, strokeWidth: 1 }
              : { stroke: C.artistReleaseBorder, strokeWidth: 1 }),
          },
          [
            part(
              'label',
              T('Tracks', { fontSize: 12, fontWeight: '500', fill: C.artistForeground }),
            ),
            part('count', small('12', { fill: active ? C.artistIcon : C.artistTextSecondary })),
          ],
        ),
      ),
    )
  for (const active of [false, true])
    add(
      comp(
        `Page/Item${active ? ' Active' : ''}`,
        Row(
          {
            name: 'Page',
            width: 32,
            height: 32,
            cornerRadius: 8,
            justifyContent: 'center',
            ...(active
              ? { fill: C.artistSelection, stroke: C.artistSelectionBorder, strokeWidth: 1 }
              : {}),
          },
          [
            part(
              'label',
              T('1', { fontSize: 12, fill: active ? C.artistForeground : C.artistTextSecondary }),
            ),
          ],
        ),
      ),
    )
}
