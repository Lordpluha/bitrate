// Artist workspace: AI promotion (spec apps/docs/docs/specs/ai-artist-promotion.md), drawn on the artist
// library (`artist`, pencil/web-artist-design/design-system/artist.lib.pen) in the shipped living-workspace
// look: a per-release plan (T−28 … T+28) on the release workspace's Promotion stage, post drafts per
// channel with UK/PL translations, the promotion profile and the cross-release calendar.
import { artistFrames } from './artist-ws/frames.mjs'
import { promotionOverviewPage } from './artist-ws/page-promotion-overview.mjs'
import { promotionPostPage } from './artist-ws/page-promotion-post.mjs'
import { promotionProfilePage } from './artist-ws/page-promotion-profile.mjs'
import { releasePromotionPage } from './artist-ws/page-release-promotion.mjs'
import { artistUi } from './artist-ws/ui.mjs'

/** The four promotion pages by directory; call after the kit's library is set to `artist`. */
export function artistPromotionPages() {
  const ui = artistUi()
  const frames = artistFrames(ui)
  return {
    'release-promotion': releasePromotionPage(ui, frames),
    'promotion-post': promotionPostPage(ui, frames),
    'promotion-profile': promotionProfilePage(ui, frames),
    'promotion-overview': promotionOverviewPage(ui, frames),
  }
}
