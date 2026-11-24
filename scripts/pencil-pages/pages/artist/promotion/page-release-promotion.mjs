// Artist / Release promotion plan: the Promotion stage of the release workspace — cover-tinted release
// header, the stepper on Promotion, the AI plan from T−28 to T+28 as bento tiles, and every state.
import { releasePromotionStatesAfter } from './release-promotion-after.mjs'
import { releasePromotionStatesBefore } from './release-promotion-before.mjs'
import { releasePromotionKit } from './release-promotion-kit.mjs'
import { pageSpec } from '../../../artist-ws/spec.mjs'

/** The release-promotion page spec. */
export function releasePromotionPage(ui, frames) {
  const kit = releasePromotionKit(ui, frames)
  const { shell, head, plan, summary, profileCard, usage, promise } = kit
  return pageSpec(
    frames,
    {
      title: 'Artist / Release promotion plan',
      route: 'planned — /dashboard/music/$releaseId?step=promotion',
      context:
        'AI plan from T−28 to T+28 around the release date; every step is approved, edited or rejected by the artist. Release workspace look: cover-tinted header, stepper on the Promotion stage, bento tiles on the 12-column grid. Spec: ai-artist-promotion.',
    },
    shell,
    (m) => [...head(m), plan(m, [summary(), profileCard(), usage(), promise()])],
    [
      ...releasePromotionStatesBefore(ui, frames, kit),
      ...releasePromotionStatesAfter(ui, frames, kit),
    ],
  )
}
