/**
 * Promotion product events (spec "Events", AC-15), each with the version of its schema so they
 * fit the Stage 3 taxonomy. Bump a version when an event's meaning or `data` shape changes.
 */
export const PROMOTION_EVENT_VERSIONS = {
  'promotion.plan.generated': 1,
  'promotion.step.approved': 1,
  'promotion.step.edited': 1,
  'promotion.step.rejected': 1,
  'promotion.post.copied': 1,
  'promotion.post.exported': 1,
  'promotion.translation.edited': 1,
  'promotion.translation.rated': 1,
} as const

export type PromotionEventName = keyof typeof PROMOTION_EVENT_VERSIONS
