# ADR-0052: Artist release workspace foundation

Status: Accepted

Date: 2026-10-01

## Context

The artist dashboard epic [#241](https://github.com/Lordpluha/bitrate/issues/241) needs a
release workspace before roadmap, tasks and distribution can hold real data.
`Track` describes an audio recording; `Album` is an existing listener-facing catalogue item.
Neither is a preparation workspace. Artist session authentication also differs from operator
permissions: an authenticated artist is not entitled to edit another artist's release.

## Decision

- Introduce `Release` separately from `Album`, owned by `ownerArtistId`. Preserve existing
  albums, tracks and their APIs. Link existing tracks through an ordered `ReleaseTrack` relation.
  ISRC remains on the recording (`Track.isrc`); UPC belongs to `Release`.
- Begin with a **single-owner MVP**, the explicitly permitted option in
  [#244](https://github.com/Lordpluha/bitrate/issues/244). Upcoming release, roadmap and task
  endpoints must scope every read and mutation to the authenticated artist's ownership.
  Add ownership-denial tests before exposing those endpoints. Staff permissions do not apply.
- Credits and monetary shares are separate. `ReleaseContributor` stores a display name and
  credit roles, optionally linked to an artist account. Credits do not grant access.
  `ReleaseSplit` uses integer basis points for recording and composition rights separately;
  10,000 basis points is 100%. A composite foreign key prevents references to a contributor
  from a different release.
- Territories are an explicit release allow-list. An empty draft list means unspecified,
  never worldwide. Before submission, the service must validate territory codes against the
  real partner's supported markets and verify that the rights cover every selected market.
  This initial split model describes one allocation per right type across the release's
  selected territories; different allocations by territory or recording require a later
  model extension before such releases can be submitted.
- `ReleaseStatus` describes workspace progress. External delivery events must get a separate
  partner-backed state machine in [#248](https://github.com/Lordpluha/bitrate/issues/248).
  Declaring `SUBMITTED` or `RELEASED` in storage does not implement a delivery operation.
- Protect `/dashboard` in the TanStack layout `beforeLoad` using a server function.
  Validate session cookies against the artist auth API, relay rotated httpOnly cookies,
  return only the necessary identity fields, and fail closed on API outages.
  Each server-rendered application gets its own QueryClient.

## Consequences

This stage adds the schema and an additive migration; it exposes **no release CRUD or payout
API** yet. Database checks bound individual shares and ordered positions. Incomplete drafts
are allowed; the future submission service must check that each required right type totals
10,000, validate identifiers including check digits, require ready owned tracks, and prevent
arbitrary lifecycle changes. Those checks must run transactionally with their writes.

Collaborator invitations, shared workspace access, territorial allocations, consent evidence,
payments and partner delivery are not implemented by this migration. Contributors must not be
treated as collaborators. The full artist-side roles model is deferred until shared editing
is introduced, with a separate membership model and explicit permission enforcement.

The initial dashboard displays honest empty and unavailable states until release endpoints
exist. Existing catalogue data is neither copied nor silently published. No API contracts
are manually edited; regenerate them from Swagger when the release API is introduced.

## Alternatives considered

- **Use Album as the workspace** — mixes published catalogue data with incomplete drafts
  and breaks existing listener-facing assumptions.
- **Reuse operator roles** — operator permissions describe staff operations, not access to
  a particular artist's workspace.
- **Treat credited contributors as members** — confuses attribution and rights with login
  permissions; an external songwriter need not have a Bitrate account.
- **Build full collaborator RBAC immediately** — exceeds the chosen single-owner first stage.
  It remains required before granting shared editing access.
