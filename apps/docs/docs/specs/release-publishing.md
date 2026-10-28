# Release publishing on Bitrate: behavior and implementation

Status: PR 1 and PR 2 implemented on 2026-10-27 (branch `feat/241-release-workspace-stages`,
uncommitted); PR 3 (editing a live release) not started. Decisions agreed with the product owner
on 2026-10-26; implementation approved by the second developer on 2026-10-27. Architecture:
[ADR-0062](../architecture/0062-release-publishing-and-track-visibility.md).

## Goal and boundaries

Today an approved release (`READY`) can never go live: nothing sets `RELEASED`, approval does
not publish to the Bitrate player, and the stages after Review therefore never finish.
After this work an artist publishes an approved release on Bitrate themselves — immediately or
as a scheduled premiere — its tracks play in the Bitrate player, followers are notified once,
and the release workspace reaches Launch. The artist can later unpublish and republish it, and
edit a live release through a new Bitrate review.

Affected workspaces: `apps/api` (releases, tracks, albums, notifications, admin, queues),
`apps/web-artists`, `apps/admin`, `packages/contracts`. Docs: one ADR for the release state
machine and track visibility.

Out of scope: external stores (Spotify, Apple Music, …) — they stay "Not connected" until a
distribution partner exists; per-country midnight premieres; pre-save / countdown pages;
team members acting on releases (see [artist-team-roles](./artist-team-roles.md)).

## Observable behavior and contracts

### Where the artist acts

- After approval the workspace opens on **Launch**. Deliver (store plan) is marked
  **Optional**: it never blocks publishing, stays reachable before and after release, and shows
  "Complete" once the release is live. The Prepare stage (release tasks) was removed from the
  workspace on 2026-10-27; the task API remains until its removal is decided.
- Launch shows one primary button that follows the release timing chosen in Draft
  (`scheduledAt`, see "Release timing" below):
  - no premiere → **Publish now**;
  - premiere → **Publish on 28 Oct 2026, 18:00 UTC** (date and time of `scheduledAt`, plus the
    artist's local time as secondary text).
- The button opens a confirmation summarizing title, tracks, cover and timing. Publishing is
  the artist's decision, so they can re-check stages 1–4 first.

### Release timing (prerequisite, being built separately)

- Chosen in Draft → Release details: **Right away** (`scheduledAt = null`) or **Premiere**
  (a UTC instant, minute precision). Editable in `DRAFT` and `READY`, and in `SCHEDULED`
  (rescheduling, below). Not editable once publishing has started.

### State machine

Existing: `DRAFT → SUBMITTED → READY`, `SUBMITTED → REJECTED → DRAFT`, `SUBMITTED → DRAFT`
(withdraw). New states and transitions:

| From | Action / event | To |
|---|---|---|
| `READY` | Publish now | `PUBLISHING` |
| `READY` | Publish with a premiere | `SCHEDULED` |
| `SCHEDULED` | Cancel premiere | `READY` |
| `SCHEDULED` | Change premiere time | `SCHEDULED` (job moved) |
| `SCHEDULED` | Premiere time reached | `PUBLISHING` |
| `PUBLISHING` | Every track converted | `RELEASED` |
| `PUBLISHING` | Conversion fails after the queue's retries | `PUBLISH_FAILED` |
| `PUBLISH_FAILED` | Admin retries | `PUBLISHING` |
| `RELEASED` | Artist (or admin) unpublishes | `UNPUBLISHED` |
| `UNPUBLISHED` | Artist republishes | `RELEASED` (no new review, no new notification) |
| `RELEASED` | Artist submits an edit | see "Editing a live release" |

Every write uses the existing `expectedUpdatedAt` optimistic version (`lockOwnedDraft`-style
predicate widened to the allowed statuses); a lost race is `409`.

### Publishing is all-or-nothing

- Publishing creates the player entities from the draft: one `Album` (type = release type,
  cover, title, release date), one `Track` per `ArtistTrackDraft` in running order (title,
  duration, ISRC, credits → `TrackArtist` where an artist account is linked), `AlbumTrack`
  and `ReleaseTrack` rows. Each private master is copied to the track pipeline's master
  location and a `convert-audio` job is queued (existing `AUDIO_PROCESSING_QUEUE`, existing
  retries/dead-letter).
- **Nothing is public until every track is `READY`.** Converted tracks of a release still
  publishing stay invisible; the moment the last one is ready, the release becomes
  `RELEASED` and all its tracks become visible together.
- Today a track is public as soon as `processingStatus = READY` and `deletedAt = null`
  (discovery, playlists, me, moderation, search…). A release-level gate is therefore
  required: add `Track.publishedAt` (null = not public) and require `publishedAt <= now()`
  in every public read. Existing tracks are backfilled with `publishedAt = createdAt`.
- On final failure: `PUBLISH_FAILED`, the error is kept per track, the artist sees "Publishing
  failed — Bitrate has been notified", the admin sees the release with a **Retry** action.

### Premiere scheduling

- `SCHEDULED` creates a BullMQ delayed job `release-publish-<releaseId>` at `scheduledAt`.
  Cancel removes it; reschedule removes and re-adds it. A boot-time sweep publishes any
  `SCHEDULED` release whose time has passed (missed job after downtime).
- Conversion starts **at** the premiere time, so the release goes live a few minutes after it.
  Optional improvement: start conversion earlier and only flip `publishedAt` at the premiere.
  Recommended, but not required for the first version.

### Unpublish / republish

- One action, "Unpublish" (hide and remove are the same thing): tracks stop playing everywhere
  (`publishedAt = null`), including playlists, likes and history entries, which show the track as
  unavailable. Album page and links return "not available".
- "Republish" restores `publishedAt` without a new review and without notifying followers again.
- Admin can unpublish any release (moderation, rights claims); an admin unpublish cannot be
  undone by the artist (`UNPUBLISHED` with `unpublishedBy = ADMIN`).

### Editing a live release (re-review)

- From `RELEASED` the artist chooses **Edit release**, which opens an editable copy of the
  draft data (a revision). The live version is untouched while the revision is edited.
- On submit, Bitrate reviews the revision like a first submission (same blockers, same admin
  queue, flagged "Revision").
- What plays while a revision is in review (product owner's provisional rule, revisit after
  first use):
  - **audio changes** (track added, removed or audio replaced): the release is unpublished
    while in review;
  - **metadata-only changes** (title, cover, credits, splits, rights, identifiers, order):
    the current version stays live.
- Approved → the revision is applied: metadata updated in place (play counts, likes and
  playlists keep pointing at the same `Track` ids); new/replaced audio goes through the
  all-or-nothing pipeline and the release becomes `RELEASED` again. Rejected → the revision
  returns to the artist with the reviewer's feedback; the live version (if still live) stays.

### Notifications

- Followers in the player: **one** "New release" notification when a release first becomes
  `RELEASED` (not per track, not on republish, not on an approved revision).
- Artist: published, publish failed, premiere scheduled / cancelled, unpublished by Bitrate,
  revision approved / changes requested.

### Stores (later, no change now)

- When a distribution partner exists, the artist can change the store plan in Deliver at any
  time, including after release, without a new Bitrate review — the content is already
  approved and the partner validates store requirements.

### Errors and authorization

- Only the owning artist can publish, cancel, reschedule, unpublish, republish or edit;
  another artist gets `404` (existing ownership rule). Wrong state or stale version → `409`.
- Admin actions (retry, unpublish) require the existing admin permissions and are audited.

## Acceptance and evidence

| ID | Observable criterion | Verification | Result / limitation |
|---|---|---|---|
| AC-1 | After approval the workspace opens on Launch; Deliver shows "Optional" and never blocks publishing (Prepare removed 2026-10-27) | web-artists unit (stages) + e2e | Done: `stages.unit-spec.ts`; e2e for the Launch panel not added |
| AC-2 | "Publish now" on a `READY` release moves it to `PUBLISHING`, creates album/tracks and queues one conversion per track | API int spec | Done: `release-publishing.service.unit-spec.ts` (claim, ordered creation before conversions) |
| AC-3 | No track of a publishing release is visible in any public read until all are `READY`; then all become visible and the release is `RELEASED` | API int specs on discovery/search/playlists + publish aggregator | Done: shared `PUBLIC_TRACK_WHERE`/`PUBLIC_TRACK_SQL`; existing read specs updated; all-or-nothing in unit spec |
| AC-4 | A premiere publishes at `scheduledAt`; cancel returns to `READY`; reschedule moves the job; a missed job is published by the boot sweep | API int spec with a fake clock/queue | Done in unit spec (delayed job, cancel, premiere start); boot sweep untested; reschedule = cancel + publish |
| AC-5 | A conversion that fails after retries leaves the release `PUBLISH_FAILED`, notifies artist and admin; admin Retry republishes | API int spec + admin unit | Done: unit spec + admin detail unit spec (Retry) |
| AC-6 | Followers get exactly one "New release" notification per release, none on republish or revision | API int spec | Done: one `release-published` job per album; per-track notification skipped for release tracks |
| AC-7 | Unpublish hides every track everywhere; republish restores them without review or notification; admin unpublish cannot be undone by the artist | API int spec | Done: unit spec (unpublish, republish, admin takedown) |
| AC-8 | An approved metadata revision updates the live release in place, keeping track ids, plays and likes | API int spec | Pending (PR 3) |
| AC-9 | An audio revision unpublishes the release while in review and republishes it through the pipeline after approval | API int spec | Pending (PR 3) |
| AC-10 | Launch shows the player link and share state once `RELEASED`; external stores stay "Not connected" | web-artists e2e | Partly: Launch shows live state; player link not shown yet (web-player URL not configured in web-artists) |
| AC-11 | Existing tracks stay public after the migration (`publishedAt` backfilled) | migration test / manual check on a copy of dev data | Done: migration backfills `publishedAt` from `createdAt`; applied to local dev data |

## Decisions and approval

Agreed by the product owner on 2026-10-26:

1. The artist publishes manually on Launch; there is no automatic publish on approval.
2. The button reflects timing: "Publish now", or "Publish on `<date, time>` UTC" for a premiere.
3. Premiere precision: one UTC date and time for everyone.
4. All-or-nothing: the release goes live only when every track converted.
5. After release the artist can unpublish ("hide" = "remove") and republish.
6. Editing a live release is in this task and requires a new Bitrate review.
7. While a revision is in review: audio changes take the release offline, metadata changes keep
   it live — provisional, revisit after first use.
8. One follower notification per release.
9. Deliver is optional and always reachable (Prepare was removed with release tasks).
10. Store plan changes after release need no admin approval.

Open for the implementer (internal choices, no new product approval needed unless behavior
changes): revision data model (separate `ReleaseRevision` table recommended over copying the
release), whether to pre-convert before a premiere, exact new `ReleaseStatus` names.

## Implementation plan

Suggested as three PRs, each standing on its own.

**PR 1 — publish pipeline (AC-2…AC-7, AC-11)**
1. Prisma: new `ReleaseStatus` values (`SCHEDULED`, `PUBLISHING`, `PUBLISH_FAILED`,
   `UNPUBLISHED`), `Release.publishedAt`, `Release.unpublishedBy`, `Track.publishedAt` with
   backfill. **Apply with `prisma migrate deploy`**: `migrate dev` on this database drops the
   trigram search indexes; review the generated SQL for unrelated `DROP`s.
2. `ReleasePublishingService` in `releases`: publish, cancel, reschedule, unpublish,
   republish; thin controller endpoints with Swagger decorators in `decorators/`
   (`POST /releases/:id/publish`, `/publish/cancel`, `/unpublish`, `/republish`;
   `PATCH /releases/:id/schedule` reused for reschedule).
3. Draft → player entities: album, tracks, credits, `ReleaseTrack`; copy masters; enqueue
   `convert-audio` per track. The tracks module stays the only writer of `Track` (data-write
   ownership lint) — expose a tracks-module service for "create tracks for a release".
4. Completion aggregator: on each track `READY`/`FAILED` (consumer hook), check the release;
   all ready → set `publishedAt` on tracks and release, `RELEASED`, follower notification.
5. `release-publish` delayed queue + boot sweep for premieres.
6. Public reads filter `publishedAt <= now()`: discovery, search, playlists, me/player
   state, history, albums, artist profile, moderation lists. Grep every
   `processingStatus: 'READY'` read.
7. Regenerate `packages/contracts`.

**PR 2 — workspace and admin UI (AC-1, AC-10, admin part of AC-5/AC-7)**
1. web-artists: stage mapping (`READY` → Launch current, Deliver optional); Launch
   publish button, confirmation dialog, scheduled/publishing/failed/unpublished states,
   player link once live.
2. Admin: publishing status in the release list/detail, Retry, Unpublish.

**PR 3 — editing a live release (AC-8, AC-9)**
1. Revision model and endpoints (create/edit/submit/withdraw), admin review of revisions.
2. Apply on approval: in-place metadata update; audio changes through the PR 1 pipeline;
   unpublish-on-submit for audio revisions.

Checks per PR: `pnpm --filter @bitrate/api check-types`, the releases/tracks/notifications
Jest suites (`--maxWorkers=2`, through `.claude/scripts/run-heavy.py`),
`pnpm --filter @bitrate/web-artists check-types` and `test:unit`, the dashboard e2e project,
admin unit tests.
