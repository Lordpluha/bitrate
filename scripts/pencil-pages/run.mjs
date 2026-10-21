import { writePage } from './kit.mjs'
import { pages } from './pages.mjs'
const root = process.argv[2]
const only = process.argv.slice(3)
let written = 0
let frames = 0
for (const [dir, spec] of Object.entries(pages)) {
  if (only.length && !only.includes(dir)) continue
  frames += writePage(root, dir, spec).frames
  written++
}
console.log(written, 'pages,', frames, 'frames')
