// Writes the artist (apps/web-artists) pages under pencil/web-artist-design/:
//   node scripts/pencil-pages/run-artist.mjs pencil/web-artist-design [page …]
// Pages on the artist library come from pages/artist/index.mjs (build artist.lib.pen first: the screen
// helpers read registry-artist.json). Pages not redrawn yet (LEGACY) still import the player's library
// (`ds`) and come from the old pages-artist*.mjs modules until they are rebuilt.
import { setLibDir, setLibrary, writePage } from './kit.mjs'
import { artistPages } from './pages/artist/index.mjs'
import { artistPages as legacyPages } from './pages-artist.mjs'

/* old ds-based pages still in the target page set; the rest of the old modules is archived */
const LEGACY = ['dashboard', 'music']

const root = process.argv[2]
if (!root) throw new Error('usage: run-artist.mjs <pencil/web-artist-design> [page …]')
const only = process.argv.slice(3)
const wanted = (dir) => !only.length || only.includes(dir)
let written = 0
let frames = 0
const write = (dir, spec) => {
  frames += writePage(root, dir, spec).frames
  written++
}

setLibDir('../../web-player-design/design-system/')
for (const dir of LEGACY) if (wanted(dir)) write(dir, legacyPages[dir])

setLibrary('artist', 'artist.lib.pen')
setLibDir('../design-system/')
for (const [dir, spec] of Object.entries(artistPages())) if (wanted(dir)) write(dir, spec)
console.log(written, 'artist pages,', frames, 'frames')
