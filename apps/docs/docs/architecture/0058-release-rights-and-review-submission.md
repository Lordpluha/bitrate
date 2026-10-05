# ADR-0058: Release rights confirmation, splits, identifiers and review submission

Status: Accepted

Date: 2026-10-05

## Context

Owned drafts hold credits but no rights information, and nothing moves a draft into
Bitrate review. Pencil screens 19 (Contributors & Rights) and the Review step define a
master-owner choice, two confirmations, a readiness checklist and "Submit for review",
which creates an internal request and never promises delivery. The design deliberately
leaves percentages and identifiers to the future delivery schema; the product owner
chose to add recording/composition splits and UPC/ISRC now. ADR-0051 already models
`ReleaseSplit` in basis points and places UPC on `Release` and ISRC on recordings.

## Decision

- `Release` stores `masterOwnerType` (`ARTIST | OTHER`), `masterOwnerName` (required
  exactly for `OTHER`, enforced by a CHECK), `writersConfirmedAt`, `accuracyConfirmedAt`
  and `submittedAt`. `ArtistTrackDraft` stores an optional unique compact `isrc`.
- `PATCH /releases/:id/rights` replaces the owner and both confirmations in one request,
  so every confirmation describes the saved owner. Any credit change clears both
  confirmations; replacing splits clears accuracy. All of these run in the draft's
  owner/status/version-guarded transaction.
- `PUT /releases/:id/splits` replaces one right type. Drafts may be partially allocated
  but never exceed 10,000 basis points, and every share must reference a credit on the
  same release.
- UPC (UPC-A/EAN-13 with a valid check digit) and ISRC (ISO 3901, stored without hyphens)
  are **optional for submission**: artists without codes must not be blocked before a
  distributor can assign them. Missing codes appear as non-blocking notices. Duplicates
  return 409.
- Readiness is computed by one pure function over unbounded owned data. Blockers: no
  recordings, missing master owner, either confirmation, a credit without roles, or a
  right type not totalling exactly 100%. Audio and artwork are not required until uploads
  exist.
- `POST /releases/:id/submit` requires an explicit `reviewed: true`, re-reads readiness
  inside the transaction and moves `DRAFT → SUBMITTED` with the version guard; blockers
  return 422 with their list. `POST /releases/:id/withdraw` returns `SUBMITTED → DRAFT`
  while no reviewer flow exists. Submission never starts external delivery.

## Consequences

The workspace now exposes rights, splits, ISRCs and readiness, and the Review stage is
real. Every edit after submission returns 409 until the artist withdraws. A reviewer
queue, review decisions, territories, consent evidence, per-territory allocations and
partner delivery remain out of scope. When a reviewer flow exists, withdrawal must be
restricted to requests that review has not started.

## Alternatives considered

- **Require UPC/ISRC for submission** — rejected: blocks artists who rely on a
  distributor to assign codes.
- **Separate endpoints per confirmation** — rejected: a confirmation saved apart from the
  owner it describes could confirm stale data.
- **Store readiness as a column** — rejected: it would drift from the data it summarises;
  it is cheap to compute on read and must be recomputed at submission anyway.
