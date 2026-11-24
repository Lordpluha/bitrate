// Artist release workspace (views/ReleaseWorkspaceView): one page per stage on the artist library —
// draft, review, deliver and launch — each with the release header and the four-stage stepper.
import { releaseDeliverPage } from './release/deliver.mjs'
import { releaseDraftPage } from './release/draft.mjs'
import { releaseLaunchPage } from './release/launch.mjs'
import { releaseReviewPage } from './release/review.mjs'

/** The release stage pages by directory. */
export function releasePages(ui, frames) {
  return {
    'release-draft': releaseDraftPage(ui, frames),
    'release-review': releaseReviewPage(ui, frames),
    'release-deliver': releaseDeliverPage(ui, frames),
    'release-launch': releaseLaunchPage(ui, frames),
  }
}
