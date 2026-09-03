# ADR-0025: Remove the Kottster admin panel

Status: Accepted

Date: 2026-09-03

## Context

`apps/admin` was a Kottster panel with a single page over the `_UserLikedTracks` join table. It
was blocking the first production deployment, and looking at why exposed how little it returned
for what it cost.

**It carried published credentials.** Its Kottster secret key, API token, JWT salt, root admin
password, and database password were literals in `app.ts` and the Knex data source, tracked in a
public repository. `.claude/rules/admin-rules.md` had recorded them as compromised since before
the rebrand. They were moved to environment variables during the deployment work
([ADR-0024](0024-rebrand-to-bitrate.md)), but publication is not undone by a later commit.

**It bypassed every invariant the API enforces.** Kottster reaches PostgreSQL directly through
Knex, so no guard, Zod schema, business rule, queue job, or audit path applies to anything done
through it. Its one page targeted a Prisma implicit-relation join table, which Prisma manages and
which is especially unsafe to write by hand.

**It cost more than a single page is worth.** The panel required a dedicated agent
(`sp-admin-developer`), a rule file, a skill, two CI workflows, a slot in three more, a service in
two compose stacks, an nginx upstream and route, and five required environment variables — and it
was the only thing preventing the stack from starting without a Kottster API token.

## Decision

Delete `apps/admin` and everything that existed to serve it: the agent, the `kottster` skill,
`admin-rules.md`, the two workflows and the references in four others, the compose services, the
nginx upstream and `/admin` route, the documentation page, and the environment variables.

Operator tasks — catalog upload, artist and user management, moderation — have no interface for
now. They go through the API or the database directly until a replacement exists. The replacement,
if built, should go through the API rather than around it, so that one set of rules governs the
data regardless of who is writing.

## Consequences

- The production stack starts without a Kottster account. Six services instead of seven.
- `https://<domain>/admin` returns the web player's 404 rather than a panel.
- **The published credentials are still published.** Removing the code narrows what they open,
  but the Kottster API token must be revoked in its dashboard.
- Operator work has no UI. This is a real gap, recorded rather than hidden.
- The eleven remaining specialists no longer route `apps/admin` anywhere;
  [ADR-0022](0022-app-scoped-agent-roster.md) described twelve and stands as the record of that
  earlier roster.

## Alternatives considered

- **Keep it and rotate the secrets** — rejected. Rotation was necessary either way, and it would
  have left a direct-to-database write path that no API rule governs.
- **Keep it but remove it from the production stack** — rejected as the worst of both: the
  maintenance surface stays, the security note stays, and the thing still cannot be deployed.
- **Replace it now with an API-backed admin surface** — out of scope. That is a product decision
  and a real piece of work, not a step in a deployment.
