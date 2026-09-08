---
sidebar_position: 3
---

# Product backlog

Every candidate capability, grouped by the product zone it belongs to. This is a **backlog,
not a plan** — nothing here is committed, prioritised, or scheduled. The order in which any of
it gets built is decided in [Validation](./validation.md), and what is actually being shipped
lives in the [delivery roadmap](../guides/roadmap.md).

The single most damaging thing that can be done with this page is to treat it as a flat list of
equally important work. It is not.

:::note[Where an idea goes]
A new idea goes **here**, under a zone — not into the delivery roadmap and not into an app.
Promotion out of this page happens when the validation gate for its layer has been passed.
:::

## Two different orderings, often confused

The [four layers](./README.md#the-four-layers) are a **value stack**: how the product's worth
compounds, and where the defensible part sits. They are *not* a build order, and reading them
as one is the mistake this page most wants to prevent.

Under [Option A](./vision.md#the-open-question) — the assumption the whole section runs on —
the **Artist Workspace is built first**, and the Player is a supporting surface that makes an
artist's page worth linking to. Numbering the Player as layer 1 describes where it sits in the
value stack, not when it gets built.

| Zone | Value layer | Cannot start until |
|---|---|---|
| **Bitrate for Artists** | 2 — Artist Workspace | now; this is the MVP |
| **Bitrate AI** | 3 | the workspace holds real releases with real results |
| **Autopilot** | 4 | the AI layer's advice is accepted more often than overridden |
| Player / Listener Experience | 1 — Player | the artist side earns a reason for listeners to arrive |
| Social | 1 — Player | as above; Track Versions is the exception, see below |
| Marketplace, Platform | Ecosystem | a core worth extending |

So a capability from the AI zone built before the workspace works is waste, however good the
idea. A capability from the Player zone built first is not waste — it is simply the other
strategy, and choosing it means answering
[the open question](./vision.md#the-open-question) differently.

## Player / Listener Experience

| Capability | What it is |
|---|---|
| AI Playlist Builder | A short interview — mood, situation, genre, energy, length — that generates a playlist |
| Customizable UI | Player layout, visible blocks, and UI density under the listener's control |
| Smart Recommendations | Recommendation filters: unknown artists, popularity, genre, mood, era |
| Playlist Versioning | Change history for a playlist, with restore to a previous version |
| Smart Library | Folders and user-defined tags across tracks, albums and playlists |
| Advanced Search | Filtering by artist, genre, year, mood, popularity and other axes |
| Listening Analytics | Personal listening statistics, beyond a yearly recap |
| Local Music | A real local library alongside the streamed catalogue |
| Cross-device Queue | The current queue synchronised across devices |
| Music Discovery Graph | Interactive exploration: artist → similar → influences → genres → releases |

**Reality check.** Search and listening history exist server-side — the search is `pg_trgm`
trigram similarity, not full-text. Recommendations are **not** missing entirely, which is the
more awkward position: `/recommendations/feed`, related-artists and charts all exist as
heuristic SQL over listening history. They rank by `popularity`, `playCount` and
`monthlyListeners`, and
[nothing writes those columns outside the seeder](./tech-roadmap.md#defects-not-roadmap-items),
so on real data they sort by a constant.

That makes "Smart Recommendations" cheaper than a new subsystem and more urgent than a feature:
fix the counters first, then judge whether the heuristics are good enough before designing
anything to replace them.

## Social

| Capability | What it is |
|---|---|
| Timestamp Comments | Comments anchored to a specific point in a track |
| Listening Rooms | Shared rooms with one synchronised queue |
| Friend Profiles | Richer profiles showing musical activity and taste history |
| Artist Community | Listeners interacting with artists directly |
| Track Versions | Demo, original, remix, remaster and master grouped as one track entity |

**Track Versions is the strategically interesting one**, and the one exception worth
considering early despite sitting in the Player zone. Incumbents model a track as a finished
product, because a finished product is what a label delivers to them. Modelling the *process*
needs the artist to upload directly — which
[Spotify tried and abandoned](./vision.md#the-one-piece-of-hard-evidence-spotify-tried-this-and-retreated).
That is why the position is open, rather than proof that it cannot be taken back.

It is also the one with a real data-model cost — it changes what a "track" is, which touches
playback, playlists, library, search and analytics. Do not treat it as a social feature; treat
it as a schema decision that needs an ADR.

## Bitrate for Artists

This is the zone the [vision](./vision.md) argues is the actual product.

| Capability | What it is |
|---|---|
| Release Workspace | One workspace per release, holding everything about it |
| Release Roadmap | A step-by-step path from uploaded track to published and promoted |
| Release Tasks | Tasks, deadlines, statuses and collaborators on a release |
| Distribution | Sending a release to Spotify, Apple Music and other DSPs, as simply as possible |
| Cross-platform Analytics | Results from every supported platform in one place |
| Revenue Analytics | Earnings per release and where they came from |
| Revenue Forecast | Projected earnings based on current trajectory |
| Career Timeline | Releases, audience, revenue, milestones and growth over a career |

The first four are the MVP boundary. The last four require data that only exists *after*
artists have released through Bitrate, which is why they cannot come first regardless of how
attractive they are.

Distribution is the one item here that is not primarily an engineering problem — it is a
partnership and a legal problem. See [Music business](./music-business.md).

## Bitrate AI

A product layer, not a feature. Everything here depends on the workspace holding real release
data; an AI layer over an empty database produces confident nonsense, which is worse than no
AI layer at all.

| Capability | What it is |
|---|---|
| AI Release Analysis | Problems and opportunities in a release, surfaced before it is published |
| AI Producer | Recommends the artist's next step |
| AI A&R | Finds the audience, playlists, venues and directions that fit a track |
| AI Social Posts | Generates social content from a release |
| AI Marketing | Builds a marketing plan for a release |
| AI Campaigns | Generates and helps launch ad campaigns |
| AI Release Plan | Builds the plan of action before and after a release |
| AI Insights | Explains analytics in plain language: what happened → why → what to do |

**AI Insights is the one to build first**, and it is deliberately the least ambitious: no
generation, no autonomy, no new capability — only an explanation of numbers already collected.

It still needs those numbers to exist, and today they do not. `ListeningHistory` records who
played what and when, and not how much was listened, from where, or on what device, which is
too thin to explain anything. That is
[Stage 3 of the tech roadmap](./tech-roadmap.md#stage-3--data-before-intelligence) and a hard
prerequisite, not a detail.

It is also the capability resting most directly on
[an assumption nobody has tested](./vision.md#where-bitrate-has-a-right-to-win) — that artists
experience the missing explanation as a top-rank problem. If phase 1 says otherwise, this zone
shrinks rather than leads.

Note the boundary the [vision](./vision.md#what-bitrate-deliberately-does-not-do) sets: AI is
applied to the release and the career, never to composing the music.

## Autopilot

Separate from the AI zone on purpose. The AI zone *advises*; Autopilot *acts*.

The artist sets a goal — "release my track on October 20" — and Bitrate builds the release
plan, checks the metadata, prepares distribution, drafts the marketing plan, generates the
social content, schedules the posts, tracks the deadlines, and afterwards analyses the result
and proposes what to do next. The artist's interaction narrows to **approve, edit, or reject**.

The engine behind that decomposes into: a workflow engine, automatic task and deadline
creation, an approval system, scheduled actions, AI decision suggestions, and notifications.

Two things make this the last layer rather than an early one. It can only act on rails that
already exist, so every one of those actions must be a working feature of layers 2 and 3
first. And it is the layer where a wrong action has real consequences — a release published
early, a campaign that spends money — so it needs an approval model and an audit trail
designed before any of it runs.

## Artist Marketplace

A marketplace for the services around making and promoting music: mastering, mixing, cover
art, video, beats, session musicians, promotion. Later: portfolios, ratings, orders, payment
through Bitrate, escrow, and a platform commission.

Escrow and payouts move this out of product territory and into regulated financial territory —
see [Law roadmap](./law-roadmap.md) before any of it is designed.

## Bitrate Platform

A plugin SDK and public API so third parties can add integrations, analytics providers, AI
tools, distribution providers, visualisations, player extensions and artist tools.

This is where the open-source posture of the repository becomes a strategic asset rather than
a licensing detail. It is also the point where Bitrate stops being an application and becomes
a platform — which is a security and governance commitment, not just an API surface.

## What is deliberately absent

Podcasts, audiobooks, video, smart-TV and car integrations, and multi-language support appear
in the [delivery roadmap](../guides/roadmap.md) under "Future (2027+)". They are not in this
backlog because none of them serves
[the job to be done](./vision.md#the-job-to-be-done). If the strategy changes so that they do,
add them here with the reason attached.

One wrinkle worth naming rather than leaving for someone to trip over: podcasts are **not**
absent from the code. `Podcast`, `Episode` and `UserSavedEpisode` are already models in the
Prisma schema, with no API or UI on top of them. Either the strategy is wrong to exclude
podcasts, or that schema is speculative weight carried by every migration — and the second is
the more likely reading. Decide it deliberately; do not let three unused models quietly become
a commitment.
