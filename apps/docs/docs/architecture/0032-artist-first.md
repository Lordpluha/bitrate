# ADR-0032: Bitrate is artist-first

Status: Accepted

Date: 2026-09-08

## Context

Two documents disagreed about who Bitrate is for, and the disagreement was load-bearing rather
than cosmetic.

[`PRODUCT.md`](https://github.com/Lordpluha/bitrate/blob/master/PRODUCT.md) named **listeners**
as the primary audience and stated that the product's success is measured against them. The
[strategy section](../strategy/README.md) argued the opposite: that the artist side is the
defensible product and the listening surface exists to make an artist's work reach people.

Both cannot be primary. The choice decides what gets built, what gets measured, and whether
there is a path to revenue at all — so it could not be settled by whichever document was edited
most recently.

The facts that bore on it, established by reading the code and checking sources rather than by
argument:

- **The surfaces are wildly asymmetric.** `apps/web-player` has 25 routes — album, artist,
  library, playlists, queue, lyrics, profile. `apps/web-artists` has 5, all of them auth. The
  artist product does not exist.
- **Listener-first has no reachable revenue.** A listener subscription needs a catalogue Bitrate
  cannot license at a scale it does not have. That is not "later"; on current inputs it is
  never.
- **Artist-first has an expensive gate.** Its MVP runs through
  [Law roadmap Gate 3](../strategy/law-roadmap.md#gate-3--distribution-to-the-dsps) — an artist
  agreement, a distribution partnership, payments — and a distribution partner will want a legal
  entity.
- **Since April 2024 Spotify pays nothing on a track below 1,000 streams in a rolling twelve
  months.** For an artist with a few hundred listeners, streaming income is not small, it is
  absent. A listener-first product therefore has nothing to offer the target artist, while the
  artist-first value — knowing what happened and what to do next — does not depend on streaming
  income at all.
- **Neither hypothesis has been tested.** No artist has been interviewed.

## Decision

**Bitrate is artist-first.** The independent artist is the customer and the primary audience.
The listening surface is a supporting surface: it makes an artist's page worth linking to, and
it is the listener-acquisition channel a pure streaming competitor cannot copy.

Success is measured in
[artists completing a release](../strategy/metrics.md#the-north-star), not in listener
retention or signups.

The goal for the next twelve months is a **business with revenue**, not a portfolio project.
That is what rules out listener-first rather than merely disfavouring it.

The next step is to **build the artist workspace**, deliberately chosen over running the
concierge validation first.

## Consequences

**`PRODUCT.md` is amended**, not the strategy section. Its "Users" section now names artists as
primary. It remains the source of truth for what the existing apps actually are; the strategy
section remains the source of truth for what to build next.

**The 25 player routes are not sunk cost.** Under this decision they become the artist's public
shopfront. They are not, however, where new investment goes.

**Building before validating is accepted risk, and it is real.** The recommendation on record
was to run ten concierge releases first — weeks of work, no legal entity, no code — because it
tests the hypothesis before paying for it. Building first means the cost of being wrong about
the customer is months rather than weeks. This is recorded so that if phase 4 finds artists do
not return for a second release, the cause is not re-litigated: it was known and accepted here.

**Gate 3 does not have to be paid up front.** The workspace — release as an entity, tasks,
deadlines, metadata validation, a release checklist, analytics ingestion — is buildable and
usable before distribution is wired to anything. The lawyer and the distribution partner are
needed at the step that sends a release to a DSP, not before it. Sequencing the build that way
keeps the expensive gate deferred while the product takes shape.

**Interviews are still owed.** [Phase 1](../strategy/validation.md#phase-1--validation) is not
cancelled by this decision, only reordered. Every claim about the customer in the strategy
section remains reasoning rather than evidence until artists are actually asked.

**Explicitly out of scope**: listener growth work, social features, and the marketplace, until
the artist side earns them.

## Alternatives considered

- **Listener-first** — finish the player, then discovery and social. Rejected because revenue
  requires a catalogue licence and a scale that is not reachable, and because it competes with
  incumbents on the single axis where they are strongest. It would have been the right answer
  had the goal been a portfolio project, which it is not.
- **Concierge first, decide after** — run ten releases by hand and let the evidence choose.
  Recommended and not taken; the reasoning and its cost are recorded above.
- **Both at once** — rejected without much deliberation. Two primary audiences means two success
  metrics, and a metric that can be satisfied two ways constrains nothing.
