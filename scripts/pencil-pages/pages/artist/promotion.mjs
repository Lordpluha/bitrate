// Artist workspace: AI promotion (spec apps/docs/docs/specs/ai-artist-promotion.md; planned, not in code
// yet): a per-release plan (T−28 … T+28) on the release workspace's Promotion stage, post drafts per
// channel with UK/PL translations, the promotion profile and the cross-release calendar.
import { promotionOverviewPage } from './promotion/page-promotion-overview.mjs'
import { promotionPostPage } from './promotion/page-promotion-post.mjs'
import { promotionProfilePage } from './promotion/page-promotion-profile.mjs'
import { releasePromotionPage } from './promotion/page-release-promotion.mjs'

/** The four promotion pages by directory. */
export function promotionPages(ui, frames) {
  return {
    'release-promotion': releasePromotionPage(ui, frames),
    'promotion-post': promotionPostPage(ui, frames),
    'promotion-profile': promotionProfilePage(ui, frames),
    'promotion-overview': promotionOverviewPage(ui, frames),
  }
}
