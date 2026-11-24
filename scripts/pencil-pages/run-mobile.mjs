// Generates the native mobile app (apps/mobile) designs: node run-mobile.mjs <outDir> [page...]
import { setLibDir, writePage } from './kit.mjs'
import { mobilePages } from './pages/mobile/index.mjs'

/* pages live at pencil/mobile-app-design/<page>/, two levels away from the player library */
setLibDir('../../web-player-design/design-system/')
const root = process.argv[2]
const only = process.argv.slice(3)
let written = 0
let frames = 0
for (const [dir, spec] of Object.entries(mobilePages)) {
  if (only.length && !only.includes(dir)) continue
  frames += writePage(root, dir, spec).frames
  written++
}
console.log(written, 'mobile app pages,', frames, 'frames')
