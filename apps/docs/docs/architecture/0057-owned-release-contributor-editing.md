# ADR-0057: Editing credits in an owned release draft

Status: Accepted

Date: 2026-10-03

## Context

Artists can add credited participants but cannot correct their names or roles.
Pencil contributor logic and screen 19C include assigning roles to incomplete
credits. The existing contributor ID, artist association and splits must survive
such corrections.

## Decision

GET releases/:id/contributors/:contributorId returns the current owned active
release summary and exactly one associated credit. Read validation accepts empty
legacy role lists, so incomplete credits can be repaired. No account link or split
data is exposed. Missing, foreign and deleted data returns 404.

PATCH on the same path accepts the complete editable name and unique role list
plus expectedUpdatedAt, using the addition validation rules. Addition and editing
share a transaction-local owner/active/DRAFT/version guard that locks the release
and advances its version. The selected credit is updated only within that release.
No matching credit or a failed credit write rolls back the release version too.
Stale/non-DRAFT writes return 409. Only name and roles change; ID, artist link and
splits are preserved. The existing addition response schema remains compatible.

The portal reads a single current credit before opening its fields. One form serves
addition and editing across Light/Dark/Dim. Editing disables unchanged normalized
names/role sets. Form state and version snapshots stay local; rejected/unconfirmed
writes preserve entries, pending writes lock dismissal and mutations never retry
automatically. Confirm identity, returned fields and version before invalidating
the artist's Music/workspace cache. Read failures offer an explicit retry.

The Participants panel identifies empty role lists with a **Needs role** warning,
matching Pencil19C. An owned DRAFT exposes **Edit roles** for that credit through
the same editor; non-drafts have no write action. The warning disappears only after
the workspace receives confirmed assigned roles. No overall readiness or rights
completion status is derived from this local credit condition.

## Consequences

This is credit correction, not account invitation, rights confirmation or payout
editing. Contributor removal, role mapping for a delivery partner and financial
split editing remain separate slices. No dependency or database migration.
