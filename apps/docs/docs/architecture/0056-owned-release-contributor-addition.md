# ADR-0056: Adding credited participants to an owned draft

Status: Accepted

Date: 2026-10-03

## Context

The release workspace already reads credited participants. Pencil 19/19B and
its contributor logic require a name and at least one role, while explicitly
leaving final delivery taxonomy and legal declarations to the delivery schema.
The existing ReleaseContributor model supports a bounded addition slice.

## Decision

Expose POST releases/:id/contributors with a strict body: trimmed displayName
(1–255 characters), one to five unique existing ReleaseCreditRole values, and
expectedUpdatedAt. Derive ownership from the artist session. In an interactive
transaction, first update the active owned DRAFT using its expected version,
then create the credit. The first write locks the release; both writes roll back
on failure. Advance the version by at least one millisecond. Foreign/deleted
releases return 404 and stale/non-DRAFT writes return 409. Return the updated
release summary and the new participant's ID, name and roles only.

Add contributor is available in the DRAFT workspace Participants panel. Its
dialog reuses the latest-summary loader and native modal. Inputs stay local,
are validated before posting, and remain visible after rejected or unconfirmed
writes. Pending writes lock inputs and dismissal. Mutations never retry
automatically. Validate the response and returned version before confirming
success; invalidate the artist's Music/workspace queries afterward.

One responsive form serves all three themes. Panel gradient, radius and role
chips follow the contributor source, with existing semantic tokens. This small
dialog adapts the contributor section; it is not the full creation wizard.

## Consequences

Credits grant neither account access nor shared editing. No linked artist ID,
financial split, legal declaration, lifecycle transition or delivery is written.
Existing credits and splits remain intact. Credit editing/removal, final partner
role mapping, rights confirmation and splits remain later slices. No dependency
or database migration is required.
