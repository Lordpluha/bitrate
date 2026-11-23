// Writes the artist pages drawn on the artist library (`artist`): the four AI promotion pages.
//   node scripts/pencil-pages/run-artist-promotion.mjs pencil/web-artist-design [page …]
// The other artist pages still import the player's library and are written by run-artist.mjs.
import { setLibDir, setLibrary, writePage } from './kit.mjs'
import { artistPromotionPages } from './pages-artist-promotion.mjs'

setLibrary('artist', 'artist.lib.pen')
setLibDir('../design-system/')
const root = process.argv[2]
if (!root) throw new Error('usage: run-artist-promotion.mjs <pencil/web-artist-design> [page …]')
const only = process.argv.slice(3)
let written = 0
let frames = 0
for (const [dir, spec] of Object.entries(artistPromotionPages())) {
  if (only.length && !only.includes(dir)) continue
  frames += writePage(root, dir, spec).frames
  written++
}
console.log(written, 'artist promotion pages,', frames, 'frames')
