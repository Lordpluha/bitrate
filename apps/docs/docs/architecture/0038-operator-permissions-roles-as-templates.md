# ADR-0038: Operators hold permissions; roles are templates

Status: Accepted

Date: 2026-09-17

## Context

[ADR-0035](./0035-admin-panel-on-angular.md) brought the operator panel back with two fixed roles,
`ADMIN` and `MODERATOR`, stored as a Prisma enum on `Staff`. Authorisation was expressed as roles in
decorators: every admin controller declared `@AdminAuth('ADMIN', 'MODERATOR')` on the class, and four
routes narrowed that with `@StaffRoles('ADMIN')`.

That held while the roles were fixed, and broke on three requirements that arrived together:

- **Access finer than two roles.** An administrator needed to allow one action on a resource and
  refuse another — verify an artist but not delete one.
- **New roles created in the panel.** A role that exists as a database row cannot be named in a
  decorator, because decorators are compiled.
- **Per-operator adjustment.** Two moderators could legitimately need different access. A role that
  binds its holders together makes that impossible without inventing a role per person.

## Decision

### Permissions live on the operator

`Staff.permissions` (`text[]`) is the authorisation source. **A role is a template**: assigning it
copies its permission set onto the operator, and from then on that operator's set is edited on its
own. `Staff.roleId` stays, but only as provenance and a display label. **Holding a role guarantees
nothing at request time**, which is the opposite of what the word usually implies — anyone reading
the schema should treat `roleId` as history, not as access.

It follows that **editing a template does not reach operators already assigned it.** That is intended:
it is what makes per-operator adjustment survive a later template change.

### Permissions are code constants, not rows

The catalogue is an `as const` tuple in `apps/api/src/modules/admin-auth/access/permissions.ts`,
`resource:action` shaped — `artists:verify`, `tracks:reprocess`, `reports:advance`. A permission only
means something if a route checks it, so the code that checks it is the source of truth. A
`Permission` table would need re-seeding on every deploy and would add a foreign key to a list the
code already owns.

A stored permission is a string, so **a permission is added and deprecated, never renamed**: a rename
is a data migration on every operator's array, and a missed one silently removes access.

### Routes declare permissions; the class keeps the floor

`@AdminAuth()` stays **on each admin controller class**, with no role arguments. It is the floor: a
route whose author forgets its permission still requires an authenticated staff session — open to any
staff member, never anonymous. Every route declares `@RequirePermission('<resource>:<action>')`.
`admin-auth-coverage.unit-spec.ts` discovers controllers on disk and fails on any route that carries
neither a permission nor an explicit place in its public or session-only sets, so the forgotten
decorator is caught rather than merely contained.

The guard resolves permissions from the same staff lookup it already made, with the role joined in.
It still runs exactly two queries per request, with no cache.

### The built-in administrator is super by identity

`role.builtIn && role.name === 'ADMIN'` passes every check; that operator's own array is stored as `[]`
and cannot be edited. Without this, a permission added in code would reach nobody — including the
administrators meant to grant it — and the only way to recover would be the seeder. For the same
reason the built-in roles cannot be renamed: they are identified by name.

### Protected permissions, enforced in two places

`staff:*` and `roles:*` can be held only through the built-in administrator. They are rejected by one
shared validator, `assertGrantable`, called from **both** paths that write a permission set — the role
template editor and the per-operator editor. Assigning the built-in `ADMIN` role is the one
legitimate escalation path, reachable only by `staff:write` holders, which means only administrators.

### Sets are normalised before they are stored

Postgres compares `text[]` positionally, so the same grant saved as `[b, a]`, or with a repeat, is a
different value from the template's `[a, b]`. Every write deduplicates and orders a set by the
catalogue, and the divergence count compares arrays as sets, so an operator is never reported as
diverging from a template they match.

### Detailed audit belongs to the service

The global `AuditInterceptor` records the route, entity and actor, but never a request body. Extending
it to log bodies would write the password field of operator creation into the audit log. So every
permission change writes its own audit row **inside its own transaction**, carrying `before`, `after`,
`added`, `removed` and where the change came from.

### No mass re-apply; a holder count instead

An action to re-apply a template to every holder was designed and deliberately dropped: with the
handful of operators this panel serves, editing each one is the simpler tool, and a bulk overwrite is
the one action that destroys the per-operator adjustment this model exists for. What remains is
visibility: the permission catalogue reports how many active operators hold each permission, with zero
reported explicitly, so a permission nobody can use is noticed.

## Consequences

- Stored permission strings are a contract with the data. Add and deprecate; never rename.
- A new route is available to administrators immediately and to nobody else until an administrator
  grants it. The holder count is how that gap gets noticed.
- The panel hides what an operator cannot do, but only cosmetically — the API enforces every request.
  The panel's permission guard restores the session itself, because Angular runs every guard in a
  route's `canActivate` array concurrently.
- Revisit mass re-apply if the operator count grows past what an administrator can edit by hand.
- This supersedes the role-based guard mechanics described in ADR-0035's prose and in the
  `StaffRole` domain-union example in [ADR-0036](./0036-admin-clean-architecture.md). The layering in
  ADR-0036 is unchanged; `Permission` is now the domain-declared union bound to the contract there.

## Alternatives considered

- **Roles bind their holders.** Access comes from the role, and editing a role changes everyone on
  it. Rejected because the requirement was per-operator adjustment; this model can only offer it by
  creating a role per person.
- **Roles plus additive grants.** The role stays a live binding and an operator may be given extra
  permissions but never fewer. A reasonable middle ground, rejected because the requirement included
  taking access away from one operator without touching the others.
- **A `Permission` table.** Rejected because the checking code already owns the list, and a table
  would need reconciling with it on every deploy.
- **Carry permissions in the JWT.** Saves the join, but a revoked permission would keep working until
  the token expired. The guard's existing staff lookup made the join free.
