# Release change requests: behavior and implementation

> Status: **implemented, not yet merged** — decisions and plan confirmed in chat on 2026-11-12.
> Decision record: [ADR-0071](../architecture/0071-reviewed-changes-to-published-releases.md).

## Goal and boundaries

After a release is published, the artist can propose a new release title, a new release
cover and new titles for its recordings in `apps/web-artists`. Bitrate staff approve or
reject each proposed change in `apps/admin`. Only the proposed change waits for review: the
release stays live with its current data, and nothing returns to `DRAFT`.

Affected workspaces: `apps/api` (Prisma, releases and admin releases modules, artist
notifications), `packages/contracts` (regenerated), `apps/admin` (review queue),
`apps/web-artists` (catalogue and release workspace UI, i18n uk/pl/en). One PR across these
workspaces is approved by the owner for this feature.

Out of scope: a separate per-recording cover (the release cover is the cover of all its
recordings, as on streaming services and in DDEX delivery); other metadata (version, ISRC,
credits, splits, genres, lyrics, dates); changes for `READY`, `SCHEDULED`, `PUBLISHING`,
`PUBLISH_FAILED`, `SUBMITTED` or admin-unpublished releases; re-delivering changed metadata
to external destinations; email notifications; a request history page for artists.

## Observable behavior and contracts

- **Change request.** One request belongs to one release and contains 1+ changes. A change
  targets the release title, the release cover, or the title of one recording first
  published in that release (`ReleaseTrack.reused = false`). Recordings from different
  releases need separate requests. A change must differ from the current value; titles use
  the existing title validation; covers use the existing cover format and size rules.
- **One open change per target.** At most one pending change exists per target (release
  title, release cover, or one recording). A release may have several open requests whose
  targets do not overlap. A duplicate pending target returns 409.
- **Eligibility.** The release is owned, not deleted, not a demo, and `RELEASED` or
  `UNPUBLISHED` by the artist. Otherwise 409. A recording that is moderation-blocked or
  is not native to the release cannot be renamed through it (409). Renaming a recording
  changes its single catalogue title, so it changes in every release and compilation that
  contains it; the UI warns about this before submitting.
- **Submitting.** Saving submits immediately; there is no unsent draft. A pending change is
  not editable: the artist withdraws it and submits a new one.
- **Withdrawing.** The owner withdraws a request; every still-pending change in it becomes
  `WITHDRAWN`. Changes already decided keep their decision.
- **Proposed cover.** Stored privately until approval and visible only to the owner and
  staff through authenticated endpoints. Approval makes it public; the replaced public
  cover is deleted best-effort, as with today's cover replacement. Rejection, withdrawal
  and cancellation delete the proposed file.
- **Review.** Staff decide each change separately (approve or reject), in any number of
  steps, with "approve all" and "reject all" shortcuts. A rejected change requires a
  Markdown reason; the request accepts an optional Markdown comment. The request closes
  when no change is pending.
- **Applying an approval** (one transaction under the release lock):
  release title → `Release.title`, `Album.title`; release cover → `Release.cover`,
  `Album.cover`, and `Track.cover` of the recordings first published in this release
  (compilations keep their own covers); recording title → `Track.title` and the title of
  its source recording draft. Listeners see the old values until approval.
- **Cancellation.** Pending changes become `CANCELLED` when the release is deleted or
  unpublished by an admin. Artist unpublishing keeps them pending.
- **Artist view.** Catalogue rows and the release page show pending changes as
  "old → new" with a status. Under each target the latest decided change is shown:
  approved (shown until the next visit) or rejected with its rendered reason (shown until
  a new change for that target).
- **Notifications.** One derived in-app artist notification per closed request, in the
  `REVIEW` category, e.g. "2 changes approved, 1 rejected"; it requires action when any
  change was rejected. Staff get a queue tab with a pending count instead.
- **Entry points (web-artists).** Recording row ⋯ → "Change title" (one-field dialog).
  Release row ⋯ and the release page → "Propose changes" (title, cover, titles of its
  native recordings; only changed fields are sent).
- **Admin.** A "Release changes" queue (sidebar link) whose open-request count is a KPI tile on
  the queue page; a request page shows each change as before → after (two cover previews side
  by side) with per-change actions, the shortcuts and the history of decided changes.
- **Flags for clients.** Catalogue rows and the release workspace carry `acceptsChanges` (the
  eligibility rule above, computed by the API) and `hasPendingChanges`.

## Acceptance and evidence

| ID | Observable criterion | Verification | Result / limitation |
|---|---|---|---|
| AC-1 | Owner submits a request with release title, cover and recording titles for a `RELEASED` or artist-`UNPUBLISHED` release; public data is unchanged | `release-changes.int-spec.ts` › submitting (title, cover, recording; artist-unpublished) | Pass |
| AC-2 | Ineligible release status, admin unpublish, demo, foreign release, reused or blocked recording, unchanged value → 409/403/404 | `release-changes.int-spec.ts` › refuses changes to …, hides …, refuses a title equal…, refuses to rename … | Pass |
| AC-3 | Second pending change for the same target → 409; non-overlapping requests coexist | `release-changes.int-spec.ts` › allows only one pending change… (unique `pendingTarget`, P2002 → 409) | Pass; overlap acceptance relies on the DB key |
| AC-4 | Withdraw marks pending changes `WITHDRAWN`, keeps decided ones, deletes the proposed cover | `release-changes.int-spec.ts` › withdrawing | Pass |
| AC-5 | Admin approves some and rejects others; rejection without reason → 400; request closes when none pending | `release-change-review.service.unit-spec.ts` (partial decisions, open/closed); `DecideReleaseChangesSchema` requires `reason` | Pass; schema checked through types and admin use-case spec, no HTTP spec for admin routes |
| AC-6 | Approval updates `Release`/`Album`/native `Track` titles and covers, the recording draft title, and every album containing the recording | `release-change-review.service.unit-spec.ts` › renames…, publishes an approved cover…, renames a recording… | Pass |
| AC-7 | Proposed cover is not publicly reachable before approval; owner and staff can view it | `release-changes.int-spec.ts` (private `releases/pending-covers/` key, signed link in response) | Pass |
| AC-8 | Release deletion and admin unpublish cancel pending changes | `release-deletion.service.unit-spec.ts`, `admin-releases.service.unit-spec.ts` › takeDown | Pass |
| AC-9 | Closed request yields one artist notification with approved/rejected counts | `artist-notifications.service.unit-spec.ts` › change requests | Pass |
| AC-10 | Admin queue lists pending requests with a count; per-change decisions and shortcuts work | `release-changes.use-case.unit-spec.ts`, admin `check-types`, sidebar spec | Pass; pages have no component spec |
| AC-11 | Artist proposes changes from row ⋯ and the release page, sees old → new, withdraws, sees the rejection reason; strings in uk/pl/en | `ReleaseChanges.unit-spec.tsx`, `proposal.unit-spec.ts`, web-artists `check-types` | Pass; no browser run |

## Decisions and approval

Interview answers given by the owner in chat on 2026-11-12: batches with per-change
decisions; submit immediately and withdraw instead of editing; recordings renamed from the
recordings list ⋯; release cover only (no per-recording cover); `RELEASED` and artist
`UNPUBLISHED` only; Markdown rejection reason like release review; in-app notifications;
cancellation on deletion and admin unpublish; one multi-workspace PR. The owner confirmed the
plan in chat on 2026-11-12.

Deviations found during implementation: the admin open count is a KPI tile on the queue page,
because the sidebar has no counters; the diff is about 5,500 lines (without generated contracts),
so it needs the split planned in step 7.

## Implementation plan

1. Worktree from `origin/develop` on `feat/release-change-requests` (#517 is merged).
2. API (TDD at the HTTP and service seams): Prisma models `ReleaseChangeRequest` and
   `ReleaseChange` with a partial unique index on the pending target; migration created
   with `--create-only`, reviewed, applied with `migrate deploy`. Artist endpoints (list,
   multipart submit, withdraw, proposed-cover view); admin endpoints (queue, stats, detail,
   decide); applying approvals; cancellation in deletion and admin unpublish; derived
   notification. Swagger decorators, release README.
3. Regenerate `packages/contracts`.
4. Admin: use cases, HTTP repository, queue and detail pages reusing the release-review
   Markdown editor.
5. web-artists: `release-change-requests` feature (dialogs, mutations, pending/decision
   view), catalogue ⋯ and release page integration, i18n uk/pl/en.
6. Docs: this spec's status and a short ADR (published release data changes only through
   reviewed change requests).
7. Checks: scoped API Jest with `--maxWorkers=2`, admin and web-artists unit tests and
   type checks, formatting of edited files only. If the diff exceeds the PR limit, split
   into API + contracts and UI PRs after asking.
