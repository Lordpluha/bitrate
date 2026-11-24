---
'@bitrate/api': minor
'@bitrate/contracts': minor
---

Closed the remaining API gaps of AI artist promotion.

- **Per-artist access:** promotion routes answer 403 `errors.promotion.disabled` unless the
  deployment has `PROMOTION_AI_ENABLED` on and the artist's new `promotionEnabled` flag is set.
  `GET /artists/me/promotion/allowance` now says whether promotion is `enabled`.
- **Regenerate one step:** `POST …/promotion/steps/:stepId/regenerate` with an optional hint
  rewrites a suggested step in the background. The step shows `regenerating`, and keeps its
  old text with a `regenerationFailure` when the job fails.
- **Calendar:** `GET /artists/me/promotion/calendar` lists the dated steps of every release's
  latest plan, soonest first.
- **Input moderation:** voice examples, the audience note and hints pass the cheap `check` task
  before a generation; refused text fails the plan or step with
  `errors.promotion.input_rejected`.
- **Events:** plan generated, step approved, edited or rejected, post copied or exported, and
  translation edited or rated are recorded in the new `PromotionEvent` table with a schema
  version. `POST …/posts/:postId/actions` reports copy and download.
