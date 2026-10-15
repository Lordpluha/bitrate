# Artist team roles: behavior and implementation

Status: draft — awaiting user confirmation of the plan below. Epic
[#241](https://github.com/Lordpluha/bitrate/issues/241), item "Roles & permissions (RBAC) for
artist accounts"; design frames `Urz87` / `a4Qsh` (Settings → Team and Safety).

## Goal and boundaries

An artist (the workspace **owner**) invites people to work in their workspace with a fixed role.
Members sign in with their own Bitrate artist account, switch into the owner's workspace and can
do exactly what their role allows; every artist endpoint enforces it on the server.

Affected workspaces: `apps/api` (auth, releases, artist-profile, notifications, mail),
`apps/web-artists`, `packages/contracts`. Docs: one new ADR.

Out of scope: separate team-only accounts; per-member permission editing (ADR-0038 style);
ownership transfer; release-level co-ownership; operator (admin panel) changes.

## Observable behavior and contracts

### Workspaces and roles

- A workspace is one artist account. Releases, tasks, delivery, analytics and notifications keep
  belonging to the owner (`ownerArtistId` is unchanged).
- The client names the active workspace with the `X-Bitrate-Workspace: <artistId>` header. Without
  it, or with the caller's own id, the caller acts as **Owner** of their own workspace.
- With another id, the server loads an **active** membership of the caller in that workspace on
  every request; none → `403 errors.workspace.not_a_member`. Removal or a role change therefore
  takes effect on the next request.
- Roles are fixed; each maps to code-constant permissions (`resource:action`, as ADR-0038):

| Permission | Owner | Manager | Collaborator | Viewer |
|---|---|---|---|---|
| `workspace:read` — releases, tracks, tasks, delivery status, notifications, search | ✓ | ✓ | ✓ | ✓ |
| `releases:edit` — create, metadata, artwork, recordings, order, contributors, schedule | ✓ | ✓ | ✓ | |
| `releases:rights` — rights, splits, ISRC/UPC | ✓ | ✓ | | |
| `delivery:plan` — stores and territories | ✓ | ✓ | | |
| `tasks:write` — create, edit, assign, delete tasks | ✓ | ✓ | ✓ | |
| `analytics:read` | ✓ | ✓ | | |
| `releases:submit` — submit, withdraw, revise | ✓ | | | |
| `team:manage` — invitations, roles, removal, team activity | ✓ | | | |
| `profile:edit` — public artist profile | ✓ | | | |

- A missing permission → `403 errors.workspace.permission_denied`. Owner-only actions are never
  granted to a role.
- Personal account settings (password, 2FA, sessions, account deletion, notification channels)
  always act on the caller's own account and ignore the header.

### Invitations and membership

- The owner invites by email with a role (Manager, Collaborator or Viewer). An email with a link
  is sent; the invitation expires after 7 days. A pending invitation can be revoked or re-sent.
- Only a signed-in account whose **verified** email equals the invited address can accept or
  decline. Someone without an account registers with that email and then sees the invitation.
- The invitee also sees pending invitations addressed to their email inside the portal.
- At most 20 members plus pending invitations per workspace (`422 errors.workspace.team_full`).
- The owner can change a member's role or remove them; a member can leave a workspace.
- Deleting the owner account makes the workspace unavailable to everyone; deleting a member
  account removes its memberships.
- Every invitation, acceptance, decline, role change, removal and leave is recorded as team
  activity, visible to the owner in Team and Safety.

### Per-person state inside a workspace

- Tasks can be assigned to a team member (or the owner) as well as to a release contributor.
- The notification "seen" time and the muted categories are kept per person per workspace.

### Client

- A workspace switcher lists the caller's own workspace and active memberships; the choice
  persists across reloads and server rendering.
- Actions the active role lacks are hidden or disabled with an explanation; the server remains
  the enforcement point.
- Settings → Team and Safety: members, roles, pending invitations, team activity (owner); the
  workspaces the caller belongs to with Leave (everyone).

### Migration

New tables for members, invitations and team activity; `ReleaseTask` gains an optional member
assignee; `ArtistNotificationState` and `ArtistNotificationPreference` become keyed by
(workspace, viewer) — existing rows map to (artist, artist), so no data is lost. Rollback drops the
new tables/columns and restores the single-key notification tables from the (artist, artist) rows.

## Acceptance and evidence

| ID | Observable criterion | Verification | Result / limitation |
|---|---|---|---|
| AC-1 | Without the header every artist endpoint behaves exactly as today for the account owner | Existing releases/auth specs stay green | Pending |
| AC-2 | A non-member naming another workspace gets 403 on every workspace route | Route → permission coverage spec | Pending |
| AC-3 | Each role can do exactly the actions in the table and gets 403 otherwise | Route → permission coverage spec | Pending |
| AC-4 | Removing a member or changing a role applies on their next request | Manual check | Pending |
| AC-5 | Only the matching verified email can accept; expired or revoked invitations cannot | Manual check | Pending |
| AC-6 | A team is capped at 20 members plus pending invitations | Manual check | Pending |
| AC-7 | Team changes appear in team activity | Manual check | Pending |
| AC-8 | Tasks can be assigned to members; seen state and muted categories are per person | Manual check | Pending |
| AC-9 | Switcher, permission-aware UI and Team and Safety work in web-artists | Manual check | Pending |

The user asked to keep tests and checks minimal for now: basic type/lint checks plus a route →
permission coverage table like the operator panel's. Authorization without broader tests is a
known risk, recorded here.

## Decisions and approval

Agreed in this conversation's interview (2026-10-09), recommended options chosen unless noted:
member = existing Bitrate artist account; active-workspace model, not release co-ownership; fixed
roles; owner-only: team, security and deletion, public profile, submission and delivery; Manager
broader than Collaborator; email invitations for any address; first stage also includes task
assignment to members, per-person seen state, team activity and a 20-person limit; memberships
disappear on account deletion, no ownership transfer. The header transport and the permission
names are implementation choices.

Plan confirmation: **pending**.

## Implementation plan

1. **API core.** Prisma: `ArtistTeamMember`, `ArtistTeamInvitation`, `ArtistTeamEvent`, enum
   `ArtistTeamRole`; task member assignee; (workspace, viewer) notification keys; one migration.
   `workspace-access` module: permission constants and role map, `WorkspaceGuard` resolving the
   header after `ArtistAuthGuard`, `@WorkspaceAccess(permission)` decorator, `request.workspace`.
   ADR-0060.
2. **Enforce on every artist route.** Controllers in `releases` and `artist-profile` pass
   `request.workspace.artistId` instead of `request.artist.id` and declare their permission;
   services keep their `ownerArtistId` scoping. Owner-only routes as in the table. Coverage spec.
3. **Team module.** Invitations (create, list, resend, revoke; email; accept/decline by token or
   from the inbox), members (list, role, remove, leave), workspaces I belong to, activity, limit,
   cleanup on account deletion.
4. **Per-person state.** Task member assignee; notification seen state and preferences per viewer.
5. **Contracts** regenerated.
6. **web-artists.** Active-workspace cookie and header middleware, workspace-aware query keys,
   switcher, `useWorkspaceAccess().can(...)` gating, Team and Safety, invitation inbox and
   accept page, member assignee picker.
7. **Docs and changeset.** Scoped checks: Biome and `tsc` per workspace, coverage spec.
