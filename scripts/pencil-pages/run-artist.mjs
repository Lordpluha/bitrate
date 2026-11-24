// Writes the artist (apps/web-artists) pages under pencil/web-artist-design/ on the artist library:
//   node scripts/pencil-pages/run-artist.mjs pencil/web-artist-design [page …]
// Pages come from pages/artist/index.mjs; build artist.lib.pen first (the screen helpers read
// registry-artist.json).
import { join } from 'node:path'
import { assertReadable } from './guard/assert-readable.mjs'
import { libraryComponents } from './guard/library-components.mjs'
import { setLibDir, setLibrary, writePage } from './kit.mjs'
import { artistPages } from './pages/artist/index.mjs'

const root = process.argv[2]
if (!root) throw new Error('usage: run-artist.mjs <pencil/web-artist-design> [page …]')
const only = process.argv.slice(3)
let written = 0
let frames = 0
setLibrary('artist', 'artist.lib.pen')
setLibDir('../design-system/')
/* every written page is checked for text columns squeezed by their neighbours */
const components = libraryComponents(join(root, 'design-system', 'artist.lib.pen'))
for (const [dir, spec] of Object.entries(artistPages())) {
  if (only.length && !only.includes(dir)) continue
  const page = writePage(root, dir, spec)
  assertReadable(page.file, components)
  frames += page.frames
  written++
}
console.log(written, 'artist pages,', frames, 'frames')
