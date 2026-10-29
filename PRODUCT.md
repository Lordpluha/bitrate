# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

Web is the mature surface today (`apps/web-player`, `apps/web-artists`). The Expo app
(`apps/mobile`, roadmap v0.5.0) and the Tauri app (`apps/desktop`, roadmap v1.2.0) are
scaffolded but unstarted. `adaptive` is a decision about where this product is going: the
mobile surface is expected to read as native on each OS rather than inherit web
conventions, so native platform guidance applies to its design work when it begins.

## Users

**Artists — primary, and early.** Independent musicians publishing through the platform:
upload tracks and metadata, maintain a public artist page, run a release end to end and read
what happened. **This is the audience the product's success is measured against** — the metric
is artists completing a release, not listener retention. Served by `apps/web-artists`
(port 3002): a public page at `/`, the auth screens, and a signed-in workspace — dashboard,
music catalogue with a release workspace (drafts, credits, rights and splits, schedule,
submission for review), release tasks, a distribution plan, analytics of plays and listeners on
Bitrate, profile, and settings with signed-in devices. Artists have their own credentials,
OAuth, and account model, separate from listener accounts.

Artists are primary by decision
([ADR-0032](apps/docs/docs/architecture/0032-artist-first.md)), and the workspace is still
thin behind that decision: promotion, artwork and track editing, review feedback and delivery
to external stores are labelled "coming soon" in the UI, and no store integration is connected.
Treat the existing artist surface as a first version, not as settled convention.

**Listeners — the supporting surface, and the mature one.** People who want to play music:
browse, search, build and manage playlists, like tracks/albums/playlists, follow artists, and
return to what they were recently playing. Served by `apps/web-player` (Next.js, port 3001),
later by the mobile and desktop apps. This is where nearly all the product that exists lives,
and it stays the reference for how this product looks and behaves. Under the artist-first
decision it exists to make an artist's page worth linking to — it is not where new investment
goes, but it is not deprecated either.

**Operators — internal.** Staff uploading catalog, managing artists and users, and
moderating content. Served by `apps/admin`, an Angular panel
([ADR-0035](apps/docs/docs/architecture/0035-admin-panel-on-angular.md)) that replaced the
removed Kottster panel: overview and reports, moderation, catalog, release review, albums,
playlists, artists, listeners, genres, audit log, and staff with editable roles over
a fixed permission set. Its needs are throughput and correctness, not persuasion.

## Product Purpose

A music streaming platform: listeners find and play music, artists publish it and see how
it lands, operators keep the catalog healthy. This is built to reach real listeners and
real artists — the roadmap's monetization, app-store submission, GDPR, and security-audit
milestones are commitments, not aspirations. Design decisions should assume real accounts,
real uploaded audio, real listening sessions, and eventually real money.

Success means a listener can find something and play it without friction, come back to it
later, and keep a library that feels like theirs — on whichever surface they opened.

## Positioning

**Undecided, and deliberately recorded as undecided.** The product currently reimplements a
familiar streaming model faithfully; no differentiating mechanism or claim has been
established that a neighboring product could not truthfully copy. The v1.0.0-rebranding
milestone is where a real position is expected to be decided.

Until then: do not invent a differentiator, and do not write marketing copy that asserts
one. Surfaces that need a position (a landing page, a pricing page, store listings) require
this question to be answered first, not assumed.

## Operating Context

- **Listening is rarely the foreground task.** The player runs while people work, commute,
  cook, or study. Controls get partial attention, glanced at rather than read.
- **Sessions are long and re-entrant.** People return to the same library, the same recents,
  the same liked songs. Continuity across visits matters more than first-run impact.
- **The catalog is real audio.** Tracks are uploaded, processed through a BullMQ pipeline,
  and streamed as CMAF fragments over byte ranges at 128/192/320 kbps, with HLS retained as the
  fallback for tracks encoded before CMAF (ADR-0020). Cover art, avatars, and audio are served as
  real media, not placeholders — `mediaUrl` helpers resolve and fall back on them.
- **Two account worlds, one catalog.** Listener accounts and artist accounts are distinct
  (separate auth, separate apps). An artist page a listener browses is the public face of an
  account that lives in a different application.
- **Multi-surface by design.** Web, mobile, and desktop are intended to be the same product.
  A concept introduced on one surface will need an answer on the others.

## Capabilities and Constraints

**Shipped (roadmap-confirmed):**
- JWT auth (access + refresh), OAuth 2.0 via Google and Facebook, for both listeners and
  artists; TOTP two-factor with QR and backup codes; email password recovery.
- Audio upload and processing pipeline; CMAF/Range streaming at three bitrates; track and album
  CRUD; static file serving.
- Like/unlike for tracks, albums, and playlists; follow/unfollow artists; listening history;
  playlist management with owner permissions.
- Fuzzy search across tracks, artists, albums, and playlists (PostgreSQL `pg_trgm`
  trigram similarity plus `ILIKE`, with GIN trigram indexes — not full-text search).

- Listener web app on real data: home, search, library, artist, album, playlist and Liked
  Songs pages, queue, recents, public profiles, friends via requests, activity feed,
  notifications, charts, listening stats, settings with privacy and an audio
  quality cap.
- Artist workspace (see Users) and the operator panel (see Users).

**Built but incomplete.** Lyrics are plain text with no timing. Playback runs on web-player's
own engine; the redesign and the move onto `@bitrate/player` are planned (Player V2), and that
package is used only by the admin panel today. Treat "the API supports it" as a reason a
surface is worth designing, not as evidence it already works.

**Not started:** mobile app beyond scaffolding, desktop app beyond scaffolding, artist
verification, monetization/subscriptions, delivery to external stores, gapless playback,
equalizer, offline mode, recommendations.

**Out of scope:** podcasts and audiobooks. Bitrate is music-only; spoken word, if ever built,
is a separate product, possibly under another brand
([ADR-0066](apps/docs/docs/architecture/0066-music-only-product-boundary.md)).

**Technical constraints that bind design work:**
- Web UI is Next.js App Router with Feature-Sliced Design; imports flow
  `app → views → widgets → features → entities → shared`.
- All design values are hand-written Tailwind v4 `@theme` layers in
  `packages/ui-react/src/styles/` — there is no generator and no `tokens.json`, see
  ADR-0023. Hardcoded color, spacing, radius, shadow, breakpoint, and
  z-index values are not permitted — a missing role gets a named token, not an arbitrary
  utility.
- Theme switching swaps token values; components do not fork into separate light/dark trees.
- Server state lives in TanStack Query; cross-component client state in Zustand. The API
  contract is generated from Swagger into `@bitrate/contracts` — the UI cannot invent
  endpoints.
- **Localization is partial.** The product ships English, Ukrainian and Polish only.
  `apps/web-player` has its own provider with en/uk/pl catalogues, but most screens are still
  hard-coded English and the server always renders English (moving to `next-intl` is planned);
  `apps/admin` runs Transloco with only navigation and login translated; `apps/web-artists`
  has no i18n runtime. Do not describe the product as localized.

**Terminology:** *track*, *album*, *playlist*, *artist*, *liked songs*, *library*,
*recents*. Listener-facing routes live under `/main` and listener auth under `/auth`; the
artist workspace lives under `/dashboard` in `apps/web-artists`.

## Brand Commitments

**The product is Bitrate — all-in-one for musicians.** [`apps/docs/docs/brand/`](apps/docs/docs/brand/) is the source of truth for
positioning, promise, tone, and the product decision filter; the sibling `design.md` translates
it into design rules. Read those before making a naming, copy, or visual decision here — this section
only records what binds the codebase.

Settled: the name **Bitrate**, the `@bitrate/*` package namespace, and the brand primary
**Bitrate Purple `#7C3AED`** with three themes (dark, light, dim).

Resemblance to the incumbent is not a requirement, a safety net, or a review criterion. The
inherited incumbent-derivative surfaces — palette, logo, marketing copy carried over into
`apps/web-artists` — are being removed, not preserved. Deliberately still open per
`design.md` §24: the final logo and mark, typography, the spacing scale, illustration and
photography direction, motion tokens, and the icon family.

The name remains subject to trademark, domain, and legal clearance before irreversible
investment (`apps/docs/docs/brand/voice.md` § Naming), so identifiers that would claim a `bitrate.*` domain stay
owner-namespaced for now.

Author: Vladyslav Tesliuk (github.com/Lordpluha). MIT licensed.

## Evidence on Hand

**Real:**
- Deployed web player — https://bitrate.me, with the artists portal at https://artists.bitrate.me
- Storybook for the shared component library — https://ui.bitrate.me
- Documentation site — https://docs.bitrate.me
- Live API at https://api.bitrate.me with the Swagger contract at `/swagger`; generated types in
  `@bitrate/contracts`
- Icon set and design tokens in `packages/ui-react/` (icons, palette, themes, typography)
- Seeded development data with genuinely downloaded audio files and cover images
  (`apps/api/src/infra/seeds/`) — usable as realistic content in comps, though the artist
  and user names are Faker-generated, not real people
- Public GitHub repository and Projects board (Lordpluha/projects/6)
- Docusaurus documentation site with architecture ADRs and brand contracts

**Absent — must not be fabricated:**
- No users, no listener numbers, no play counts, no artist roster
- No testimonials, reviews, press, case studies, or named customers
- No pricing, no subscription tiers, no monetization (roadmap "Future 2027+")
- No product name, logo, or brand identity
- No app-store presence
- No company, team, or founding story

## Product Principles

1. **Within the player, playback is the product; everything else is navigation.** When a
   decision trades away the immediacy or reliability of getting sound out of the speakers, it
   loses. This governs the listening surface, not the company: the product Bitrate sells is the
   artist's workflow ([ADR-0032](apps/docs/docs/architecture/0032-artist-first.md)).
2. **Design for the return visit, not the first one.** Library, recents, and liked songs are
   where a real listener actually lives. A surface that only impresses on first load has
   optimized for the wrong session.
3. **Partial attention is the default.** The listener is doing something else. Controls must
   survive a glance, a reach, and a wrong tap.
4. **Ship the honest state.** The API supporting a feature does not mean the feature works.
   Empty, loading, processing, and failed states are part of the design, not cleanup — the
   catalog is real audio moving through a real pipeline that can be slow or fail.
5. **Claim nothing the product cannot back.** With no users, no pricing, and no position
   decided, copy that implies scale, endorsement, or a market claim is a defect.

## Confirmed Product Explorations

These concepts were supplied by the product owner on 2026-09-04. They are product hypotheses
and roadmap material, **not shipped capabilities**. Landing pages and demos may label them as
concepts, previews, or planned directions, but must not present them as currently available.

**Listener workspace:**
- Constrained UI customization: listeners adjust density, panel arrangement, player emphasis,
  and other safe design parameters instead of receiving one fixed interface.
- A goal-driven playlist builder: the listener describes a purpose or mood, chooses whether to
  start from liked songs, and completes a dynamically generated questionnaire capped at roughly
  three to five steps. The system proposes small batches of candidate tracks; the listener ranks,
  rejects, regenerates, and reorders them before a playlist is created. AI supports the decision
  rather than appearing as a generic badge or replacing listener taste.
- Playlist versioning, smart folders and tags, deeper search and listening statistics, a first-
  class local library, friend taste histories, and cross-platform queues.
- More experimental directions: an influence graph for exploring artist connections, timestamped
  comments, demo/remaster/draft track versions, discovery filters such as “unknown artists”, and
  Jam — listening together with real-time queue control.

**Artist workspace:**
- An AI release producer that reviews release readiness and suggests the next step without making
  the creative decision; an AI-A&R assistant that surfaces plausible contexts for a track.
- Assisted social posts and release marketing, simple delivery to streaming services, a services
  marketplace, a career-progress timeline, and a community plugin ecosystem.
- An opt-in autopilot that prepares and reminds about routine work while the artist confirms every
  consequential action.
- A release workspace combining track versions, tasks, deadlines, collaborators, publishing state,
  post-release actions, cross-platform analytics, and clearly qualified revenue forecasting.

## Accessibility & Inclusion

WCAG 2.2 Level AA is the repository target for user-facing web UI, and accessibility
regressions are treated like failing tests. The full contract lives in
`apps/docs/docs/brand/a11y.md`; the binding points for design work:

- Text contrast ≥ 4.5:1 (large text ≥ 3:1); component boundaries and focus indicators
  ≥ 3:1 against adjacent colors, verified in **both** dark and light themes.
- Information is never carried by color alone.
- Every pointer action is keyboard operable; focus order follows reading order; focus
  indicators stay visible; overlays trap focus only while open and return it to the trigger.
- Native elements before ARIA. Icon-only controls carry accessible names.
- `prefers-reduced-motion` is respected.
- Interactive targets ≥ 24 × 24 CSS px or equivalently spaced.
- Layout remains usable at 320 CSS px and 400% zoom without losing content or actions.

No audience-specific accessibility need beyond this standard has been established. Note that
a music product has an obvious one worth confirming later: the platform has no captions,
transcripts, or lyrics surface, so audio content is currently unavailable to deaf and
hard-of-hearing users. Lyrics are on the roadmap (v0.9.0, unstarted) and are not currently
framed as an accessibility commitment.
