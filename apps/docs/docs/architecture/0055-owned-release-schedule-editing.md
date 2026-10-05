# ADR-0055: Owned release draft schedule editing

Status: Accepted

Date: 2026-10-03

## Context

The owned release workspace reads `scheduledAt` but artists cannot set or clear it.
Pencil 24/24B describes release timing as a saved plan, separate from external delivery.
The existing timestamp column and version-guarded draft PATCH are sufficient for this slice.

## Decision

Extend the strict draft PATCH with optional `scheduledAt`: an ISO8601 instant with
milliseconds and an explicit timezone, or null to clear the plan. UTC years 1–9999
are accepted. Omitted fields remain unchanged. Reuse the atomic owner, active,
DRAFT and previously read updatedAt predicate. Foreign/deleted releases return 404;
stale or non-draft writes return 409. No schema migration or lifecycle transition.

The portal exposes Edit schedule in Preparation summary. The dialog reads the latest
summary, preserves that version for its edit session, and uses separate date/time
controls in fixed UTC. Milliseconds are preserved. Unchecking the plan clears it;
unchanged plans cannot be saved. Existing query/mutation helpers validate the returned
instant before confirming success or refreshing the artist's workspace/Music cache.
Failed/conflicting/unconfirmed writes preserve entries and never retry automatically.

Draft title/type and schedule editors share only the latest-draft loader. Form state
stays local; native dialog dismissal is locked while saving. One responsive form and
existing semantic theme roles serve Light/Dark/Dim. Timing surfaces use the source's
panel gradient, border and elevation; this is a small dialog, not the full delivery screen.

## Consequences

Saving timing is preparation metadata: it does not submit review, publish music or
send a release to destinations. Past planned dates remain valid; partner-specific
lead-time constraints belong to delivery planning. Timezone selection/recalculation,
delivery destinations and automated launch remain later slices. Source designs are
read through Pencil MCP; protected environment files and user data are unchanged.
