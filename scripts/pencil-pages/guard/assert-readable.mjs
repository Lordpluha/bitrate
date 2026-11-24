// Generation guard: fails a written page when a frame squeezes a text column (see narrow-texts.mjs),
// like the library's guard against wrapping text without a width.
import { readFileSync } from 'node:fs'
import { expandRefs } from './expand-refs.mjs'
import { narrowTexts } from './narrow-texts.mjs'

/** Throws when any top-level frame of the .pen `file` squeezes a text below the readable width. */
export function assertReadable(file, components) {
  const doc = JSON.parse(readFileSync(file, 'utf8'))
  const hits = doc.children.flatMap((top) =>
    narrowTexts(expandRefs(top, components), top.width).map(
      (h) => `${top.name}: "${h.content.slice(0, 40)}" ${h.width}px at ${h.name}`,
    ),
  )
  if (hits.length) throw new Error(`${file}: squeezed text\n  ${hits.join('\n  ')}`)
}
