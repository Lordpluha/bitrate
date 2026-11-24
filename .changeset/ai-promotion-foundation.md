---
'@bitrate/api': minor
'@bitrate/contracts': minor
---

Added the foundation for AI artist promotion (ADR-0076). It is off until `PROMOTION_AI_ENABLED`
is set.

- **Models:** each task (`plan`, `copy`, `translate`, `check`) calls a `provider:model` from
  configuration through the Vercel AI SDK, with an optional fallback. Only Anthropic and
  Mistral are allowed, and startup fails when a routed model has no key or no price.
- **Grounding:** generated text that states numbers, years, ranks, links, handles or
  achievements absent from the context is regenerated once, then rejected. Artist input with
  contact details can be detected before any model call.
- **Usage and quotas:** every model call, including failed ones, is recorded in the new
  `AiUsage` table with its cost. Each artist has a monthly allowance
  (`PROMOTION_AI_MONTHLY_LIMIT_USD`, default $2); past it, generation answers 402
  `errors.promotion.ai_quota_exceeded`.
- **Promotion profile and plans:** `GET`/`PUT /artists/me/promotion-profile`,
  `GET /artists/me/promotion/allowance`, and per release
  `POST …/releases/:releaseId/promotion/plans` (202, generated in the background),
  `GET …/plans/latest` and `PATCH …/promotion/steps/:stepId` (approve, edit, reject, done).
  Steps are dated from the release date, so moving the release moves the plan, and a new
  version keeps every step the artist approved, edited or finished.
- **Post drafts and translations:** under `…/promotion/steps/:stepId`, `POST posts` writes one
  English master per channel in the background, `PATCH posts/:postId` edits it,
  `POST posts/:postId/translations` translates it into Ukrainian or Polish (names, links and
  hashtags kept), and `PATCH translations/:translationId` edits or rates a translation. A
  changed master makes its translations STALE; an edited translation is never overwritten.
- **Import boundary:** `ai` and `@ai-sdk/*` may be imported only in
  `src/modules/promotion/ai/`, enforced by Biome.
