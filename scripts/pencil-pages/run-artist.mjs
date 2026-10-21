import { writePage, setLibDir } from './kit.mjs'
import { Shell, MShell } from './artist-ui.mjs'
import { artistPages, releaseWizard, releasePages } from './pages-artist.mjs'
import { artistPages2 } from './pages-artist2.mjs'

setLibDir('../../web-player-design/design-system/')
const root = process.argv[2]
const wizard = Object.fromEntries(
  Object.entries(releaseWizard).map(([dir, w]) => [
    dir,
    {
      ...w,
      desktop: () => Shell(w.title, w.shell, w.build(false)),
      mobile: () => MShell(w.title, w.build(true), w.mHeight ?? 1600),
      states: w.more ?? [],
    },
  ]),
)
const all = { ...artistPages, ...wizard, ...releasePages, ...artistPages2 }
let frames = 0
for (const [dir, spec] of Object.entries(all)) {
  frames += writePage(root, dir, spec).frames
}
console.log(Object.keys(all).length, 'artist pages,', frames, 'frames')
