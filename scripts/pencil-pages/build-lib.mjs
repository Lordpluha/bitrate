// Builds the "00E • Page Blocks" components into the library and records a registry of their
// ids and overridable parts, so screens can be composed from library instances only.
// usage: node build-lib.mjs <bitrate.lib.pen> <registry.json>
import { writeFileSync } from 'node:fs'
import { loadLibrary, reg, stampSwapped } from './lib/engine.mjs'
import { blocksPage, stampLayout } from './lib/layout.mjs'
import { applyFixes } from './lib/fixes.mjs'
import { buildToastsPage } from './lib/pattern-pages/toasts.mjs'
import { buildContextMenuPage } from './lib/pattern-pages/context-menu.mjs'
import * as typographyIcons from './lib/blocks/typography-icons.mjs'
import * as media from './lib/blocks/media.mjs'
import * as collection from './lib/blocks/collection.mjs'
import * as mobile from './lib/blocks/mobile.mjs'
import * as formsAuth from './lib/blocks/forms-auth.mjs'
import * as landingHeader from './lib/blocks/landing-header.mjs'
import * as music from './lib/blocks/music.mjs'
import * as homePlayer from './lib/blocks/home-player.mjs'
import * as landing from './lib/blocks/landing.mjs'
import * as friends from './lib/blocks/friends.mjs'
import * as brandLoading from './lib/blocks/brand-loading.mjs'
import * as artist from './lib/blocks/artist.mjs'
import * as states from './lib/blocks/states.mjs'
import * as appPlayer from './lib/blocks/app-player.mjs'
import * as landingScenes from './lib/blocks/landing-scenes.mjs'
import * as cursor from './lib/blocks/cursor.mjs'
import * as toasts from './lib/blocks/toasts.mjs'
import * as notFound from './lib/blocks/not-found.mjs'
import * as assistant from './lib/blocks/assistant.mjs'
import * as podcast from './lib/blocks/podcast.mjs'
import * as island from './lib/blocks/island.mjs'
import * as notifications from './lib/blocks/notifications.mjs'
import * as contextMenu from './lib/blocks/context-menu.mjs'
import * as comments from './lib/blocks/comments.mjs'

/* registration order decides stable ids and the page layout: append new sections, never reorder */
const SECTIONS = [
  typographyIcons,
  media,
  collection,
  mobile,
  formsAuth,
  landingHeader,
  music,
  homePlayer,
  landing,
  friends,
  brandLoading,
  artist,
  states,
  appPlayer,
  landingScenes,
  cursor,
  toasts,
  notFound,
  assistant,
  podcast,
  island,
  notifications,
  contextMenu,
  comments,
]

const [libF, regF] = process.argv.slice(2)
const lib = loadLibrary(libF)
/* the library is one flex root; page blocks live in its Components row */
const root = lib.children.find((c) => c.id === 'dsRoot')
const row = root.children.find((c) => c.id === 'dsRowC')
const at = row.children.findIndex((c) => c.name === '00E • Page Blocks')

const blocks = []
const add = (...n) => blocks.push(...n)
for (const section of SECTIONS) section.register(add)

const page = blocksPage(blocks)
applyFixes(lib.children)
const prow = root.children.find((c) => c.id === 'dsRowP')
const toastPage = buildToastsPage(prow)
const ctxPage = buildContextMenuPage(prow)
/* stamped last so the ids above never shift */
stampLayout(page)
for (const p of [page, toastPage, ctxPage]) stampSwapped(p)
if (at >= 0) row.children[at] = page
else row.children.push(page)
writeFileSync(libF, JSON.stringify(lib, null, 2))
writeFileSync(regF, JSON.stringify(reg, null, 2))
console.log('components', Object.keys(reg).length)
