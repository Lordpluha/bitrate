# ADR-0054: Owned release draft editing

Status: Accepted

Date: 2026-10-03

## Context

Artists can create release workspaces and browse Music. Editing title/type must
preserve the single-owner boundary and avoid silently overwriting another tab's
changes or modifying a workspace that has left the draft lifecycle.

## Decision

Read the latest active owned summary through `GET /api/v1/releases/:id`. Accept only
title and/or type with a required `expectedUpdatedAt` in PATCH. Use the existing
`updatedAt` column as the optimistic concurrency version; no migration is needed.
Check ID, owner, non-deleted state, `DRAFT` and version atomically in the write.

Return 409 when the owned active workspace changed or is no longer a draft. Return
404 for missing, deleted or foreign workspaces. Do not expose ownership/status as
editable fields, infer access from credits, or add lifecycle transitions.

The artist portal offers Edit draft in release details/actions. Load a fresh summary
for each edit session, preserve the form's version and entered text after failures,
disable dismissal/repeated submission while saving, and never automatically retry
PATCH. Validate the returned ID/status/values before showing success. Invalidate
artist-scoped catalogue/list caches after confirmed updates. Reuse title/type fields
between create/edit forms and the existing modal/theme system.

## Consequences

Two stale forms cannot silently overwrite a newer draft. Users close and reopen a
conflicted form to review the latest values. Network failures remain unconfirmed
saves; users check Music before retrying. Artwork, recordings, deletion and submission
still require later stages. Future writers must preserve `updatedAt` version semantics.

## Alternatives considered

- **Unconditional last-write-wins update** — silently loses changes from another tab.
- **Read then update without a version predicate** — leaves an ownership/lifecycle
  race between the check and the write.
- **New revision column** — provides an explicit counter, but adds a migration for
  this bounded slice; reconsider when multi-field or shared editing needs it.
