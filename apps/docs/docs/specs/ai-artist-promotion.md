# AI artist promotion: behavior and implementation

Status: **Approved, not started.** Decisions agreed with the product owner in a planning
interview between 2026-11-10 and 2026-11-19 (see [Decisions and approval](#decisions-and-approval));
the owner confirmed the implementation plan on 2026-11-19. Architecture:
[ADR-0071](../architecture/0071-ai-provider-boundary.md) (Proposed).

## Goal and boundaries

The second verb of the product sentence in the [vision](../strategy/vision.md):
*"help me release it, **promote it**, and understand what happened."* Today the release
workspace shows "Prepare a promotion plan: Coming soon" (`LaunchStage`), and the dashboard
links to a Promotion section that does not exist.

After this work an artist with a scheduled release can:

1. fill in a short **promotion profile** once (goal, channels, time, audience, voice);
2. generate an AI **promotion plan** for that release: dated steps from T−28 to T+28 days
   around the release date;
3. approve, edit or reject each step; nothing happens without their approval;
4. get **post drafts** for the steps that are posts, written in English for Instagram,
   TikTok, Telegram and YouTube Shorts, and translated to Ukrainian or Polish on request;
5. copy or export every post and publish it themselves;
6. add an AI-written, artist-approved message to the existing "new release" notification
   that followers receive, and show a "coming soon" countdown on their artist page in the
   player.

This is a deliberate, partial start on [Stage 4](../strategy/tech-roadmap.md#stage-4--the-ai-layer)
ahead of its gate. It is limited to what needs **no outcome data**: a plan and copy built from
the release's own metadata. AI Insights, measuring what worked, and anything learning from
results wait for [Stage 3](../strategy/tech-roadmap.md#stage-3--data-before-intelligence).

Affected workspaces: `apps/api` (new `ai` and `promotion` modules, worker queue, notifications),
`apps/web-artists`, `apps/web-player` (countdown tile only), `packages/contracts`, Pencil
designs in `pencil/web-artist-design*`. Docs: this spec, one new ADR (provider boundary).

**Out of scope for v1:** posting to social networks (no OAuth integrations), paid ads and any
spending, pre-save, AI A&R (playlists, venues), AI Insights, Autopilot, image/video generation,
anything that writes or alters the music itself ([brand commitment](../strategy/vision.md#what-bitrate-deliberately-does-not-do)),
the Stage 3 event taxonomy beyond the promotion events listed below.

## Observable behavior and contracts

### Where the artist acts

- **Release workspace → Promotion tab** replaces the "Coming soon" row in `LaunchStage`.
  It holds the release's plan, post drafts and translations.
- **Promotion page** (existing dashboard navigation item `shell.nav.promotion`): a calendar
  of upcoming plan steps and posts across all of the artist's active plans.
- Both are bento tiles, built from library components only, with every screen state:
  empty (no profile yet), no release date, generating, generated, error, quota exhausted,
  translations stale, post selected, export, plus loading skeletons. Desktop and mobile.

### Promotion profile

Stored per artist; each field can be overridden for one generation.

| Field | Values |
|---|---|
| Goal | Streams · New followers · Pre-release buzz |
| Channels | Any of Instagram, TikTok, Telegram, YouTube Shorts |
| Weekly time | Hours the artist will spend on promotion |
| Audience | Primary country or countries (defaults to the release territories) and a free-text description |
| Voice | Three adjectives and up to three example posts written by the artist |

### Promotion plan

- Generation requires `Release.scheduledAt`. Without it the tab asks the artist to pick a
  release date first.
- A plan contains steps with an **offset in days from the release date** (−28 … +28) and a
  phase (`PRE`, `LAUNCH`, `POST`). Absolute dates are computed from `scheduledAt`. When the
  release date changes, every step moves with it.
- Each step has a kind: `POST`, `FOLLOWER_MESSAGE`, `COUNTDOWN`, or `ACTION` (a manual step
  the artist does off-platform, e.g. "send the track to three local radio hosts").
- Step states: `SUGGESTED → APPROVED | EDITED | REJECTED`, then `DONE` for approved or edited
  steps. Approved and edited steps are never replaced by regeneration.
- Plans are versioned. **Regenerate plan** produces a new version that keeps approved and
  edited steps and replaces only `SUGGESTED` ones. **Regenerate step** accepts an optional
  hint ("shorter", "no emoji").
- Steps reference only facts present in the generation context (see [Grounding](#grounding-and-safety)).

### Posts and translations

- A `POST` step has one **English master** draft per selected channel, written within each
  channel's limits: caption and hashtags, or a 15-second hook script for TikTok and Shorts.
- The artist can request **Ukrainian** and **Polish** versions (the list is configurable;
  `web-artists` already ships en, uk and pl). A translation keeps track and artist names,
  hashtags, links and placeholders unchanged, using a glossary.
- Translation states: `MACHINE`, `EDITED` (changed by the artist), `STALE` (the English master
  changed after the translation was made). An edited translation is never overwritten: when
  the master changes it becomes `STALE` with "English changed, review it", and regenerating
  it is the artist's explicit action.
- Every translation is labelled "Machine translation: please review". **The artist is the
  reviewer of translation quality.** A per-translation good/bad rating and the edit rate are
  the quality signals.
- Actions on a post: copy, download as text, mark as published (sets the step `DONE`).

### Bitrate-internal channels

- **Follower message.** The existing `NEW_RELEASE` notification (`releasePublished` job, one
  per album) gains an optional artist message. AI drafts it, and it is sent only if the artist
  approved it before the release went live. Without approval the notification is unchanged.
- **Countdown.** An approved `COUNTDOWN` step shows a `coming on <date>` tile on the artist's
  page in `web-player` until the release goes live. It shows no unpublished track data
  beyond title and cover.

### Grounding and safety

- The model receives only a structured context: release (title, type, date, genres,
  territories, track titles), the artist's public profile and bio, and the promotion profile.
  It receives no listening data, emails or other artists' data.
- Output is schema-validated (structured outputs). A validator rejects drafts that state
  numbers, chart positions, awards, collaborators, venues or dates absent from the context.
  A rejected draft is regenerated once, then surfaced as an error.
- Artist free-text input (voice examples, hints) passes a cheap moderation check first.
- Everything generated carries a visible "Created with AI" marker (AI Act transparency,
  [law roadmap](../strategy/law-roadmap.md)). Nothing is published or sent without the
  artist's per-item approval.

### AI platform (provider boundary, ADR-0071)

- One `AiProvider` interface in `apps/api/src/infra/ai/`; no provider SDK call outside its adapters, and none
  in a controller. Calls are routed **by task**, from configuration:

  | Task | Purpose | Default (subject to the eval) | Fallback |
  |---|---|---|---|
  | A | Plan generation | Claude Sonnet 5.5 (`claude-sonnet-5-5`); Opus 5.5 if the eval shows a clear gain | Mistral Large 4 |
  | B | Post copy (EN master) | Claude Sonnet 5.5 | Mistral Large 4 |
  | C | Translation EN→UK/PL | Claude Haiku 5.5 via the `Translator` interface, batch where possible | DeepL adapter behind the same interface |
  | D | Moderation, validation, classification | Claude Haiku 5.5 | Mistral Small 4 |

- **Providers need a DPA and no training on data**
  ([ADR-0071](../architecture/0071-ai-provider-boundary.md)). EU-region processing is preferred,
  not required: Claude is called through Anthropic's own API (processing in the US, under a DPA
  with SCCs). Requests carry only public profile and release fields. Mistral is the fallback with
  training opted out. DeepL API Pro is an allowed translation alternative, and translation uses
  the LLM route by default.
- Generation runs as BullMQ jobs on an `ai` queue in the worker service. The UI tracks
  progress over the existing socket.io connection with polling as a fallback. Tokens are
  not streamed in v1.
- Every call writes an `AiUsage` record: artist, task, provider, model, input, cached and
  output tokens, cost, and outcome. Quotas and the cost ceiling read from it.

### Quotas

| Plan | Monthly AI cost ceiling | Limits (defaults, configurable) |
|---|---|---|
| Free | $2 (hard) | 1 plan per release and a small monthly generation allowance |
| Artist | $5 (soft: warning, then blocked) | Larger allowance |

Payments do not exist yet: tiers are read from the artist's plan field, and every artist is
Free until billing ships. An exhausted quota shows the quota state rather than an error.

### Events (promotion only)

Named and versioned so they fit the future Stage 3 taxonomy: `promotion.plan.generated`,
`promotion.step.approved`, `promotion.step.edited`, `promotion.step.rejected`,
`promotion.post.copied`, `promotion.post.exported`, `promotion.translation.edited`,
`promotion.translation.rated`. The **share of steps approved or edited versus rejected** is
the metric for the [Stage 5 gate](../strategy/tech-roadmap.md#stage-5--autopilot).

### Data model (sketch, final names in the implementation PR)

- `ArtistPromotionProfile` (1:1 with `Artist`).
- `PromotionPlan` (release, version, model, status) → `PromotionPlanStep` (offset, phase,
  kind, title, body, state, `aiGenerated`).
- `PromotionPost` (step, channel, master text) → `PromotionPostTranslation` (language, text,
  state, rating, source master revision).
- `AiUsage` (artist, task, provider, model, tokens, cost, outcome, createdAt).
- `ReleasePromotionMessage` (or a field on the release) for the approved follower message.

### API (sketch)

Under `/artists/me` ([ADR-0070](../architecture/0070-artist-workspace-routes.md)), owner-only like the rest of the release API:

- `GET/PUT /artists/me/promotion-profile`
- `POST /artists/me/releases/:id/promotion/plans` (starts a job, returns 202 and a job id) ·
  `GET …/plans/latest`
- `PATCH …/steps/:stepId` (approve, edit, reject, done) · `POST …/steps/:stepId/regenerate`
- `POST …/posts/:postId/translations` (languages) · `PATCH …/translations/:id` (edit, rate)
- `GET /artists/me/promotion/calendar`
- `GET /artists/me/ai/usage` (remaining quota)

Errors: 409 when the release has no date, 402-style quota error (`AI_QUOTA_EXCEEDED`), 422 when
validation fails twice, 503 when no enabled provider is available.

## Acceptance and evidence

| ID | Observable criterion | Verification | Result / limitation |
|---|---|---|---|
| AC-1 | An artist with a scheduled release and a profile generates a plan whose steps fall between T−28 and T+28 and render in the Promotion tab | API e2e with a fake provider; UI check | Pending |
| AC-2 | Without `scheduledAt`, generation returns 409 and the tab shows the "pick a date" state | API e2e; UI state | Pending |
| AC-3 | Changing the release date moves every step's absolute date by the same amount | Unit + e2e | Pending |
| AC-4 | Regenerating a plan keeps approved and edited steps and replaces only suggested ones | Unit | Pending |
| AC-5 | Output that fails the schema, or states a fact absent from the context, is rejected and regenerated once, then surfaced as a 422 | Unit with fixtures | Pending |
| AC-6 | A post has one English master per selected channel within that channel's length limit | Unit | Pending |
| AC-7 | A UK/PL translation keeps glossary terms, hashtags, links and placeholders unchanged | Unit with fixtures; eval | Pending |
| AC-8 | Editing the English master marks translations `STALE` and never overwrites an `EDITED` one | Unit | Pending |
| AC-9 | Every AI-generated item shows the "Created with AI" marker, and translations show "Machine translation: please review" | UI tests | Pending |
| AC-10 | The follower notification includes the artist message only when it was approved before release; otherwise it is unchanged | Notifications unit/e2e | Pending |
| AC-11 | An approved countdown step shows the tile on the player's artist page until the release goes live | web-player test | Pending |
| AC-12 | Every provider call writes an `AiUsage` record. A Free artist past the ceiling gets `AI_QUOTA_EXCEEDED` and the quota state | Unit + e2e | Pending |
| AC-13 | No provider SDK is imported outside the `infra/ai` adapters; switching the task route in config needs no code change | Lint rule (oxlint) + unit | Pending |
| AC-14 | Only approved providers (DPA, no training) can be enabled in production configuration, and requests contain no email, listener or payment data | Config validation test; unit test of the context builder | Pending |
| AC-15 | The listed promotion events are recorded with a schema version | Unit | Pending |
| AC-16 | Eval: the chosen model meets the agreed bar on 15–20 release fixtures (schema validity, no ungrounded claims, glossary preservation, judge score) | Eval report linked here | Pending |
| AC-17 | Pencil designs cover every listed state on desktop and mobile, using library components only, before UI implementation starts | Design review | Pending |

## Decisions and approval

Agreed with the product owner in the planning interview (2026-11-10 to 2026-11-19):

| # | Decision |
|---|---|
| D-1 | Design now, and build only what needs no outcome data (plan and copy from release metadata) in parallel with the Stage 3 event work. No ADR reversing the backlog order |
| D-2 | v1 = AI Release Plan + AI Social Posts. A&R, Marketing strategy and Campaigns come later |
| D-3 | Advisory only, with approve / edit / reject per item. No external actions, no spending |
| D-4 | Bitrate-internal channels plus export of copy for external ones. No social OAuth |
| D-5 | Provider-agnostic `AiProvider` with routing by task. Claude is the default provider and Mistral the fallback |
| D-5.2 | Run an eval bake-off (Sonnet 5.5, Mistral Large 4, `gpt-6.1-sol`) before locking models. Its budget, a few dollars, is approved separately before the run |
| D-5.3 | Translation behind a `Translator` interface: LLM by default, DeepL as an alternative |
| D-5.4 | A DPA (with SCCs for transfers outside the EU), no training on data and data minimisation are hard requirements; EU-region processing is preferred, not required. Revised on 2026-11-23 from "EU processing only", after due diligence showed that this would need Vertex AI for Claude |
| D-5.5 | Monthly AI cost ceiling per artist: $2 Free (hard), $5 Artist (soft) |
| D-6 | Quotas from day one, before payments exist |
| D-7 | English master, then translation to target languages (uk, pl; extensible) |
| D-7.1 | Artist edits to a translation are protected; master changes mark them `STALE` |
| D-8 | Canonical spec is this file; an issue is drafted from it only with the owner's approval |
| D-9 | Promotion tab in the release workspace plus a Promotion calendar page, as bento tiles |
| D-10 | Short promotion profile per artist, overridable per generation |
| D-11 | Steps stored as offsets from the release date; generation requires a date |
| D-13 | Versioned plans; regeneration keeps approved and edited steps; per-step regeneration with a hint |
| D-14 | Post formats in v1: Instagram, TikTok, Telegram, YouTube Shorts |
| D-15 | Internal channels in v1: follower message on the existing release notification, and the countdown tile. Pre-save later |
| D-16 | Grounding: structured context only, a validator for ungrounded claims, input moderation, "Created with AI" marker, no auto-publishing |
| D-17 | Stage 3 is a separate spec. Only the promotion events listed here are added now |
| D-18 | BullMQ `ai` queue in the worker service, socket.io progress, no token streaming in v1, `AiUsage` accounting |
| D-19 | Pencil designs with all states come before UI code |
| D-20 | The artist reviews translation quality. The eval checks translations automatically (glossary, placeholders, length, LLM judge), and the product tracks the edit rate and ratings |
| D-21 | An approved step is tracked on `PromotionPlanStep` itself (state and due date), with no dependency on `ReleaseTask`. This replaces the first idea of creating a `ReleaseTask` on approval (interview question 12), because release tasks left the workspace UI on 2026-10-27 and their API may be removed ([release publishing](./release-publishing.md)). The approval-rate metric is unchanged |

The owner confirmed the implementation plan below on 2026-11-19.

## Implementation plan

Each step is one PR into `develop` unless noted. Checks are scoped to the touched workspace
and run through `.claude/scripts/run-heavy.py`.

1. **ADR-0071: AI provider boundary.** Task routing, approved providers, `AiUsage` accounting,
   the composition boundary, and the lint rule against direct SDK imports. Docs only.
2. **Provider due diligence** (no code). **Done 2026-11-20**, recorded in ADR-0071. The
   requirement was revised on 2026-11-23 (D-5.4): Claude is called through Anthropic's own API,
   Mistral is the fallback, and DeepL API Pro is allowed. Still open before rollout (step 10):
   switch on Mistral's training opt-out, and add the enabled providers, with the countries
   where they process data, to the sub-processor list in the privacy policy (`legal/privacy-policy.md`, published at bitrate.me/legal/privacy).
3. **Eval bake-off.** 15–20 release fixtures (synthetic plus the owner's real releases),
   a runner script outside the production app, and an automatic grader (schema, grounding,
   glossary, length, LLM judge). Run only after the owner approves the budget. The resulting
   choice of models goes into the config defaults and AC-16.
4. **Pencil designs** in `pencil/web-artist-design*`: profile form, Promotion tab, step and
   post editors, translations, calendar, and every state in AC-17. Prototype kept in sync.
5. **API, AI foundation**: `ai` module (`AiProvider`, Anthropic and Mistral adapters, task
   router, moderation, grounding validator), `ai` queue in the worker, `AiUsage`, quotas,
   oxlint rule. Tests with a fake provider (TDD per the project workflow).
6. **API, promotion domain**: profile, plans and steps, posts, re-anchoring on date change,
   events, endpoints, Swagger decorators, regenerated `packages/contracts`.
7. **API, translator**: `Translator` with LLM and DeepL adapters, glossary, `STALE` and
   `EDITED` handling, batch for translation jobs.
8. **web-artists UI**: Promotion tab replacing the "Coming soon" row, Promotion page,
   profile, i18n en/uk/pl.
9. **Internal channels**: follower message on `releasePublished` (api), countdown tile
   (web-player).
10. **Rollout** behind a per-artist feature flag. Enable it for the owner's own artist
    account first, then for beta artists.

Dependencies: 1 → 2 → 3 decide the defaults, but steps 4–7 can start against the fake
provider in parallel with 3. Step 8 needs 4 and 6. Step 9 needs 6.
