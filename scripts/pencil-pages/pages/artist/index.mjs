// Every artist (apps/web-artists) page drawn on the artist library (`artist`,
// pencil/web-artist-design/design-system/artist.lib.pen), by directory under pencil/web-artist-design/.
// Call after the kit's library is set to `artist` (run-artist.mjs does).
import { artistFrames } from '../../artist-ws/frames.mjs'
import { artistUi } from '../../artist-ws/ui.mjs'
import { accountPages } from './account.mjs'
import { insightsPages } from './insights.mjs'
import { overlaysPages } from './overlays.mjs'
import { promotionPages } from './promotion.mjs'
import { publicPages } from './public.mjs'
import { releasePages } from './release.mjs'
import { workspacePages } from './workspace.mjs'

/** The artist pages by directory. */
export function artistPages() {
  const ui = artistUi()
  const frames = artistFrames(ui)
  return {
    ...publicPages(ui),
    ...workspacePages(ui, frames),
    ...releasePages(ui, frames),
    ...insightsPages(ui, frames),
    ...accountPages(ui, frames),
    ...overlaysPages(ui, frames),
    ...promotionPages(ui, frames),
  }
}
