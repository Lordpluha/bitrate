---
sidebar_position: 5
---

# Tech roadmap

The technical path from what exists today to what the [strategy](./vision.md) requires,
sequenced by the product layer each capability serves. It is deliberately **not** a wishlist of
technologies — every item below is either fixing something that is already wrong or unlocking a
specific product capability that cannot be built without it.

The governing rule: **the architecture should be exactly one step ahead of the product, never
two.** Most of the expensive mistakes available here — Kubernetes, microservices, a CDN, a data
warehouse — are mistakes only because of *when* they would be done, not because they are wrong.

## Where the system stands

Established by reading the code, not the documentation. Each row is a real constraint on what
can be built next.

| Area | State |
|---|---|
| **Audio pipeline** | Ingest → BullMQ → FFmpeg. Progressive Opus + HLS (AAC) + CMAF (AAC) at 128/192/320 kbps, filtered to the source bitrate |
| **Delivery** | Signed, time-limited URLs on both storage drivers. **No CDN** — `CDN_URL` is commented out. **No DRM** |
| **Storage** | Two drivers behind one interface: `local` (default) and S3-compatible, with real presigned GETs |
| **Search** | Postgres **`pg_trgm` trigram similarity** — not full-text search |
| **Recommendations** | None. What exists is heuristic SQL over listening history |
| **Analytics** | No event taxonomy, no product analytics, no warehouse. `PostHog` is commented out |
| **Metrics** | Two counters in an in-process `Map`, exposed behind a token. **No Prometheus server and no Grafana exist in any compose file**, so nothing scrapes them |
| **Payments** | None. `Subscription` is a schema stub whose `provider` fields are never written |
| **AI in the product** | None. The `.claude/` tooling is a development workflow and ships in no image |
| **Environments** | Exactly one: `production`. There is deliberately no staging |
| **Authorisation** | Binary — "is this the authenticated owner". **No roles, no RBAC of any kind** |

## Defects, not roadmap items

Four findings are not future work. They are things that are wrong now, and three of them
silently produce incorrect behaviour rather than an error.

**1. The ranking columns are never written.** `Track.popularity`, `Track.playCount` and
`Artist.monthlyListeners` are read in the `ORDER BY` of the recommendation feed, related
artists, and search tie-breaking. The only code that writes them is the **faker seeder**.
`HistoryService.record` inserts a listening row and increments nothing. On seeded data the
feature looks like it works; on real data every one of those queries sorts by a constant.

This is the highest-value fix in this document. It is small, and until it is done, no amount of
recommendation work can be evaluated.

**2. Dead full-text indexes.** Four `to_tsvector` GIN indexes were created in the init migration
and never dropped. Nothing queries them — search moved to trigram similarity — but Postgres
maintains them on every write. Drop them.

**3. Every track is encoded twice over.** The transcode job produces the HLS package *and* the
CMAF renditions on every run, with a source comment saying HLS is kept "until the CMAF path
ships". CMAF has shipped. Decide the retirement path and stop paying for both.

**4. The security scanners do not gate.** `pnpm audit` and TruffleHog both run
`continue-on-error: true`, and Trivy sets no exit code. All three report; none of them can fail
a build. That is a reporting pipeline being mistaken for a control.

**5. The backups did not exist, and the audio was not persisted.** Addressed by
[ADR-0033](../architecture/0033-off-host-backups-and-object-storage.md); the code has landed
and the operator steps in that ADR have not all been run yet. What was actually true, since the
earlier description of this item on this page was itself wrong in the reassuring direction:

- `task prod:backup` **did not exist**. This page and `Taskfile.yml`'s `db:backup` description
  both referred to it; no revision ever defined it. Nothing has written a production dump.
- Where the dumps would have gone was `$DEPLOY_PATH/backups` on the server — the disk they
  protect. There was no `aws s3 cp`, no `rclone`, no off-host rsync anywhere.
- The monitoring job checked that the newest file was recent and non-empty. **Nothing had ever
  restored one**, so what was verified was that a file exists.
- Uploaded audio was not merely un-backed-up. The production entrypoint runs from `/app`, so
  the API wrote every upload under `/app/storage`, and the two mounts the compose file declared
  (`../apps/api/uploads`, `../apps/api/public`) pointed at paths nothing has ever written to.
  `/app/storage` was mounted nowhere: **the masters lived in the container's writable layer and
  were destroyed by every deploy.** Backing up "the uploads directory" would have archived an
  empty directory Docker created for the bind mount.

The storage driver question this page raised is settled: production runs the `local` default,
because `STORAGE_DRIVER` is not set as a production environment variable and no `S3_*` secrets
exist. The decision is to move the audio to `STORAGE_DRIVER=s3`, which also removes the
single-host pin listed below.

This is the one defect where the failure is not recoverable by fixing code afterwards. A
platform whose pitch is that artists entrust it with their masters cannot be the reason those
masters are gone — and the [artist agreement](./law-roadmap.md#gate-3--distribution-to-the-dsps)
will eventually say so in writing.

One documentation drift remains: `apps/web-artists` has no Sentry dependency, so one of the
two web apps reports nothing. (`PRODUCT.md` and the delivery roadmap used to describe search as
"PostgreSQL FTS + GIN indexes"; both now say trigram, which is what the code does.)

## Stage 1 — make the foundation honest

**Gate:** before anything in [layer 2](./product-backlog.md#two-different-orderings-often-confused) is built.

This stage adds no features. It exists because every later stage assumes these things are true,
and they currently are not.

| Work | Why it blocks later work |
|---|---|
| Write the ranking columns at play time | Recommendations, charts and search ranking are all reading zeroes |
| Drop the dead FTS indexes | Write amplification for nothing |
| Retire the duplicate HLS encode | Halves transcode cost and removes a fork in the delivery path |
| Make the scanners gate | A control that cannot fail is not a control |
| Extract the transcode worker from the API process | FFmpeg currently runs three encode passes inside the same 512 MB container that serves HTTP. This is the single most likely cause of a production outage today |
| Move production to `STORAGE_DRIVER=s3` | It runs the `local` default, which pins the API to one host and kept the masters on one disk. The driver is implemented; see ADR-0033 for the migration |
| Sentry in `web-artists` | One of two web apps currently reports nothing |
| Run the ADR-0033 operator steps | The code ships a daily off-host backup and a restore rehearsal; the bucket, the secrets, and the one-time upload rescue are still to be done by hand |

**Extracting the worker is the load-bearing item.** It is what turns "one container that does
everything" into something that can be scaled, and it is a prerequisite for every ingest-heavy
capability in later stages.

## Stage 2 — the artist workspace

**Gate:** [Phase 2 of validation](./validation.md) — the release workflow is the thing being
built.

| Work | Notes |
|---|---|
| Release as a first-class entity | A release is not a track and not an album. It has state, a schedule, tasks and participants |
| Identifiers: ISRC and UPC | `Track.isrc` exists in the schema but the upload path cannot set it. There is no UPC field at all |
| Rights and contributor model | Splits — multiple contributors, each with a share — must exist in the data model **before** the first multi-contributor release. Retrofitting them onto paid-out revenue is very painful |
| Territory model | Rights are territorial; the schema must express "released here, not there" |
| Distribution adapter | One interface, one partner behind it first. Do not design for five providers before having one |
| Delivery state machine | A release has a real lifecycle across an external system: submitted, accepted, live, failed, taken down. Model it explicitly |
| Moderation reviewer side | Reports can be filed and can never be resolved. This is a legal obligation, not a nice-to-have — see [Law roadmap](./law-roadmap.md) |
| Roles and permissions | There is no RBAC at all. A workspace with collaborators cannot be built on "is this the owner" |

## Stage 3 — data before intelligence

**Gate:** before any AI work. This stage is what makes the AI layer possible; without it, an AI
feature has nothing truthful to reason about.

| Work | Notes |
|---|---|
| Event taxonomy | Define the events once, up front. A named, versioned schema — not `track('thing_happened')` scattered through the code |
| Richer listening events | `ListeningHistory` records user, track and timestamp. It does not record **how much** was listened, from what context, or on what device — which makes it unable to answer almost any real question |
| Ingesting DSP analytics | The workspace's value depends on results from outside Bitrate. Expect per-platform formats, delays and revisions |
| Analytics storage | Postgres is sufficient far longer than instinct suggests. Move to a columnar store when a real query is too slow, and not before |
| Metrics that survive a restart | The current counters live in one process's heap and are scraped by nothing |

**Recommendations belong here**, not in the player stage, and they should start as the
heuristics that exist plus correct data. A collaborative-filtering model on a catalogue with no
listeners is an exercise, not a feature.

## Stage 4 — the AI layer

**Gate:** the workspace holds real releases with real results.

The first capability is [AI Insights](./product-backlog.md#bitrate-ai) — explaining analytics
in plain language. It needs no generation and no autonomy, only the data from stage 3.

Architectural commitments to make once, at the start:

- **A provider boundary.** Model choice will change more than once. Keep the calls behind one
  interface, and never in a controller.
- **Grounding, not recall.** Every claim an AI surface makes must trace to a record in the
  system. A confident wrong number about someone's income is worse than no number.
- **Cost is a product constraint.** Per-artist inference cost belongs in the
  [unit economics](./business-model.md), not discovered later in a bill.
- **The composition boundary holds.** AI applies to the release and the career, never to
  writing the music. That is a [brand commitment](./vision.md#what-bitrate-deliberately-does-not-do).
- **Transparency.** Users must know when they are seeing AI output — see
  [Law roadmap](./law-roadmap.md).

## Stage 5 — Autopilot

**Gate:** the AI layer's recommendations are accepted more often than they are overridden.

Autopilot acts. That changes the engineering requirements qualitatively:

- **A workflow engine** with durable state — a multi-week plan cannot live in a request.
- **An approval model** as the default. Approve / edit / reject, per action.
- **An audit trail** of what was proposed, what was approved, what ran, and what resulted.
  Non-negotiable once actions spend money or publish publicly.
- **Reversibility.** Every automated action needs a defined undo, or an explicit statement that
  it has none — a published release and a spent ad budget are not undoable.
- **Scheduling with real guarantees.** Idempotent, retryable, and correct across a restart.

## Stage 6 — the platform

**Gate:** a core worth extending.

Public API, plugin SDK, and third-party extensions. This is the point where the security model
stops being about *users* and starts being about *untrusted code and untrusted integrations* —
versioned contracts, scoped tokens, rate limits per consumer, sandboxing, and a deprecation
policy. Treat it as a governance commitment rather than an API surface.

## Scaling: what breaks, and when to fix it

Each of these is a real single-instance constraint. None of them is worth pre-emptively
removing — the trigger is the point, not the item.

| Constraint | Breaks when | The fix |
|---|---|---|
| Socket.io has no Redis adapter | A second API replica exists | Add the adapter *at that moment*, not before |
| Transcode worker inside the API | Now — it competes with HTTP for 512 MB | Separate service (Stage 1) |
| `local` storage driver | A second API host exists | S3-compatible storage |
| Single Postgres, no pooler | Connection exhaustion or read load | PgBouncer first; replicas long after |
| Single Redis | It is both cache and queue backbone | Persistence and backups matter more than clustering |
| Postgres, Redis and nginx have **no memory limits** | A memory spike takes the host, not the container | Set the limits — this is cheap and overdue |
| No CDN | Audio egress becomes a cost or latency problem | A CDN in front of storage. Not before there is traffic to cache |
| One environment | A release needs rehearsal before production | A staging environment — the deploy workflow is already written to accept one as a new caller |

## What not to build

Stated explicitly, because each of these is attractive and each would be a mistake now:

- **Kubernetes.** One VPS with Compose is the correct architecture for the current load. The
  delivery roadmap lists microservices and auto-scaling under "Future"; that is the right place.
- **Microservices.** The modular monolith is not the constraint. Extracting the transcode
  worker is the one split with an actual reason.
- **A data warehouse.** Postgres will answer these questions for a long time.
- **A custom recommender.** Fix the columns that feed the existing heuristics first.
- **DRM.** Signed, expiring URLs are proportionate to the catalogue and the threat today.
- **Multi-region.** There is no user base to be far away from.

## Relationship to the delivery roadmap

The [delivery roadmap](../guides/roadmap.md) tracks versioned milestones — `v0.5.0` mobile beta,
`v0.7.0` monitoring, `v0.8.0` security. This page decides which of those milestones the strategy
actually needs, and in what order. Where they conflict, that conflict is a decision to make
explicitly, not a discrepancy to edit away.

Durable choices made while executing this roadmap belong in an
[ADR](../architecture/README.md), not here.
