import { writePage } from './kit.mjs'
import { pages } from './pages.mjs'
const root = process.argv[2]
const only = process.argv.slice(3)
let frames = 0
for (const [dir, spec] of Object.entries(pages)) {
  if (only.length && !only.includes(dir)) continue
  writePage(root, dir, spec)
  frames += 4 + (spec.states ?? []).reduce((n, s) => n + (s.mobile ? 2 : 1), 0)
}
console.log(Object.keys(pages).length, 'pages,', frames, 'frames')
