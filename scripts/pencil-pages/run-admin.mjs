import { writePage, setLibDir, setLibrary } from './kit.mjs'
import { adminPages } from './pages-admin.mjs'

/* the admin console has its own design system, imported as `admin` */
setLibrary('admin', 'admin.lib.pen')
setLibDir('../design-system/')
const root = process.argv[2]
let frames = 0
for (const [dir, spec] of Object.entries(adminPages)) {
  writePage(root, dir, spec)
  frames +=
    4 + (spec.states ?? []).reduce((n, s) => n + (s.desktop ? 1 : 0) + (s.mobile ? 1 : 0), 0)
}
console.log(Object.keys(adminPages).length, 'admin pages,', frames, 'frames')
