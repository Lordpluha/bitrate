// Builds the artist workspace's own design system, pencil/web-artist-design/design-system/artist.lib.pen,
// and the registry of its ids and overridable parts (registry-artist.json):
//   node scripts/pencil-pages/artist-lib.mjs <artist.lib.pen> <registry-artist.json>
// It follows the shipped apps/web-artists living workspace, not the older flat web-artist DESIGN.md, and
// is separate from the player's library (Pencil does not resolve a library's imports for the files that
// import it). Colours and number settings are the code's tokens: this script keeps the file's variables
// and `pnpm design:tokens` writes them from artist-workspace.css and the shared roles; it sets the font.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { setMode } from './kit.mjs'
import { addActions } from './artist-ws/lib-actions.mjs'
import { addAuth } from './artist-ws/lib-auth.mjs'
import { addCatalogue } from './artist-ws/lib-catalogue.mjs'
import { addData } from './artist-ws/lib-data.mjs'
import { addFields } from './artist-ws/lib-fields.mjs'
import { addForms } from './artist-ws/lib-forms.mjs'
import { addIsland } from './artist-ws/lib-island.mjs'
import { addLanding } from './artist-ws/lib-landing.mjs'
import { addLandingMenu } from './artist-ws/lib-landing-menu.mjs'
import { addLayout } from './artist-ws/lib-layout.mjs'
import { addMedia } from './artist-ws/lib-media.mjs'
import { addNav } from './artist-ws/lib-nav.mjs'
import { addPaging } from './artist-ws/lib-paging.mjs'
import { addNavItems } from './artist-ws/lib-nav-items.mjs'
import { libraryPage } from './artist-ws/lib-page.mjs'
import { addRelease } from './artist-ws/lib-release.mjs'
import { addRows } from './artist-ws/lib-rows.mjs'
import { addShell } from './artist-ws/lib-shell.mjs'
import { addShowcase } from './artist-ws/lib-showcase.mjs'
import { addStates } from './artist-ws/lib-states.mjs'
import { addStepper } from './artist-ws/lib-stepper.mjs'
import { addSurfaces } from './artist-ws/lib-surfaces.mjs'
import { addTiles } from './artist-ws/lib-tiles.mjs'
import { addType } from './artist-ws/lib-type.mjs'
import { createLibrary } from './artist-ws/library.mjs'

setMode('lib')
const [libF, regF] = process.argv.slice(2)
if (!libF || !regF) throw new Error('usage: artist-lib.mjs <artist.lib.pen> <registry-artist.json>')
const ROOT = join(dirname(new URL(import.meta.url).pathname), '../..')

const lib = createLibrary()
addType(lib, ROOT)
addActions(lib)
addForms(lib)
addTiles(lib)
addStates(lib)
addRelease(lib)
addStepper(lib)
addNavItems(lib)
addFields(lib)
addAuth(lib, ROOT)
addSurfaces(lib)
addLanding(lib)
addLandingMenu(lib)
addShowcase(lib)
addData(lib)
addMedia(lib)
addRows(lib)
addLayout(lib)
addCatalogue(lib)
addPaging(lib)
addIsland(lib)
const nav = addNav(lib)
addShell(lib, nav)
const root = lib.stampPage(libraryPage(lib.blocks))

/* one read, no exists-then-read: a missing library is a first build, anything else is a real error */
const readPrevious = () => {
  try {
    return JSON.parse(readFileSync(libF, 'utf8'))
  } catch (error) {
    if (error?.code === 'ENOENT') return {}
    throw error
  }
}
/* variables come from code (sync-pen-tokens.mjs); only the type is design-owned */
const variables = { ...(readPrevious().variables ?? {}) }
variables['--font-sans'] = { type: 'string', value: 'Poppins' }
variables['--font-heading'] = { type: 'string', value: 'Poppins' }
mkdirSync(dirname(libF), { recursive: true })
writeFileSync(
  libF,
  JSON.stringify(
    { version: '2.20', themes: { Mode: ['Dark', 'Light', 'Dim'] }, variables, children: [root] },
    null,
    2,
  ),
)
writeFileSync(regF, `${JSON.stringify(lib.reg, null, 2)}\n`)
console.log('artist components', Object.keys(lib.reg).length)
