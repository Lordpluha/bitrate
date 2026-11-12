# ADR-0071: Published releases change only through reviewed change requests

Status: Accepted

Date: 2026-11-12

Spec: [release-change-requests](../specs/release-change-requests.md).

## Context

Once a release leaves `DRAFT`, its title, cover and recording titles are frozen: the only way back
to editing is `revise`, which reopens a `REJECTED` release. Artists still need to fix a typo or
replace artwork after publication, and Bitrate must review what listeners see. Sending the whole
release back through review would take it offline or freeze unrelated work for one small change.

## Decision

- **A published release changes only through a reviewed change request.** The artist proposes new
  values (`ReleaseChangeRequest` with one `ReleaseChange` per value); the live release, its album
  and its catalogue tracks keep their current data until staff approve each change. Nothing
  returns to `DRAFT`.
- **Staff decide each change on its own.** Approval writes the value through the owning modules
  (`releases` for the release and recording drafts, `albums` and `tracks` for the catalogue,
  ADR-0060); rejection requires a Markdown reason. A request closes when nothing is pending.
- **One pending change per target.** `ReleaseChange.pendingTarget` names the release title, the
  release cover or one recording while the change is pending and is cleared by any outcome; a
  unique key on `(releaseId, pendingTarget)` enforces it without a raw partial index.
- **A proposed cover stays private** in `releases/pending-covers/` until approval, shown to the
  owner and staff through short-lived signed links, and is copied to the public folder only when
  approved.
- **Scope:** `RELEASED` releases and ones the artist took offline. A Bitrate takedown or deletion
  cancels pending changes. Approval keeps `Release.updatedAt`, so status notifications derived
  from it do not fire again.

## Consequences

- Artists can correct published metadata without a new release or a full review.
- The review service lives in `releases` and is exported to the operator API through
  `ReleaseChangeReviewModule`; admin only adds routes and audit.
- New editable fields after publication (credits, genres, lyrics) need their own change field
  and review rules; they are out of scope today. External destinations do not receive approved
  changes until a distribution partner exists.

## Alternatives considered

- **Reopen the release as a draft** — takes the release through the full review again and blocks
  every other change while one title is fixed.
- **Apply changes immediately and moderate afterwards** — listeners would see unreviewed titles
  and artwork.
- **One decision per request** — staff could not accept a good title and reject a bad cover from
  the same request.
