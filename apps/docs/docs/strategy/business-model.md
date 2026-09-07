---
sidebar_position: 8
---

# Business model

Where revenue comes from, what it costs to earn, and how the first customers are found. Read
[Music business](./music-business.md) first — the per-stream arithmetic there is what rules out
half of the obvious options.

Everything on this page is a **hypothesis until phase 4** of the
[validation plan](./validation.md). Pricing in particular should be tested, not reasoned about.

## The five candidate revenue lines

| Line | Who pays | When it can start | Assessment |
|---|---|---|---|
| **Artist subscription** | The artist, monthly | Phase 4 | **Start here.** The market already pays for these tools, the amount is predictable, and it does not depend on listener scale |
| **Distribution fee** | The artist, per release or as a share | Phase 4 | Natural pairing with the subscription. Directly comparable to incumbents, so pricing is constrained by them |
| **Marketplace commission** | Buyer and seller | Phase 6 | Good margin, but needs liquidity on both sides and drags in [regulated payments](./law-roadmap.md#gate-4--marketplace-and-payouts) |
| **Listener subscription** | The listener | Phase 6+ | Requires a catalogue and scale Bitrate does not have. Do not plan on it |
| **B2B / API** | Labels, other platforms | Phase 6+ | Only once the platform exists and is worth integrating with |

**Do not launch more than one.** Two pricing models at once make it impossible to learn which
of them works, and multiply the [legal surface](./law-roadmap.md#gate-2--the-first-euro).

### Why artist-paid, and not listener-paid

Listener subscriptions require licensing a catalogue Bitrate cannot license, at a scale it does
not have, against companies who did it a decade ago. Artist tools require none of that: the
customer has the problem today, already pays someone for a partial solution, and can be reached
one at a time.

It is also the only model where the first euro is reachable in [phase 4](./validation.md#phase-4--first-market)
rather than year three. That single fact is why the whole strategy is
[artist-first](./vision.md#the-open-question).

## Pricing hypothesis

The reference points an artist already knows: distribution runs roughly €20–€30 a year for
unlimited releases, or a per-release fee. Anything Bitrate charges is measured against that
number whether or not the comparison is fair.

A defensible starting shape:

| Tier | Roughly | For |
|---|---|---|
| **Free** | €0 | An artist page, and the workspace without distribution. Gets them in |
| **Artist** | €10–€20 / month | The release workflow, distribution, analytics, AI insights |
| **Pro** | Higher | Multiple artists, collaborators, advanced automation — a manager or small label |

Three things this shape gets right. The free tier creates artist pages, which are the
[listener-acquisition channel](./vision.md#where-bitrate-has-a-right-to-win) that costs nothing.
The paid tier is priced against *the workflow*, not against distribution alone, so it is not
trapped in a race to €20/year. And a higher tier exists for the customer who has more than one
artist, who is both easier to sell and worth more.

**Test it rather than deducing it.** Phase 1 interviews should establish what artists pay today
and for what; phase 4 should test at least two price points.

## Unit economics

The vocabulary that has to become second nature — with the caveat that **no number here can be
filled in yet**, because there are no customers. That is precisely why they are worth setting
up now: the shape of the model determines which experiments are worth running.

| Metric | What it means here |
|---|---|
| **ARPU** | Average revenue per artist per month |
| **CAC** | Fully loaded cost to acquire one paying artist — including founder time |
| **LTV** | ARPU × gross margin × average lifetime in months |
| **Churn** | Share of paying artists lost per month. In a per-release product, seasonality is severe |
| **Gross margin** | Revenue minus the cost of serving it — storage, egress, transcode, inference, distribution partner |
| **Payback period** | Months of margin to recover CAC. Below 12 is healthy for this kind of product |
| **Burn / runway** | Monthly spend, and how many months of it remain |

### The costs that scale with use

Unlike most SaaS, this product has real marginal cost, and three of the four are unusual:

- **Storage** — masters plus every rendition, kept indefinitely. Grows monotonically.
- **Egress** — audio delivery is the largest variable cost at scale, and today there is
  [no CDN](./tech-roadmap.md#where-the-system-stands).
- **Transcode** — CPU per upload, three encode passes, and currently
  [encoded twice over](./tech-roadmap.md#defects-not-roadmap-items).
- **AI inference** — per artist, per release. Must be a
  [designed constraint](./tech-roadmap.md#stage-4--the-ai-layer), not a discovered bill.

An artist who uploads a large catalogue and never converts costs real money. That is a reason to
bound the free tier's storage, not a reason to have no free tier.

### The one number to compute early

**Cost to serve one artist for one month**, at current infrastructure prices. It can be computed
today, from the existing stack, without a single customer — and it sets the floor under every
pricing conversation that follows.

## Go to market

The sequence, and the reason each step is shaped the way it is:

| Stage | How | Why |
|---|---|---|
| **First 10** | Direct outreach by the founder. Walk each one through a release by hand | This is [concierge validation](./validation.md#the-rule), not sales. The product design is the output |
| **To 50** | Referrals from the first 10, plus continued direct outreach | If the first 10 do not refer, that is the finding — stop and fix it |
| **To 100** | Content and case studies built from real results | Requires results, which requires the first 50 |
| **To 1,000** | Creator marketing, community, partnerships with studios and schools | Only once activation and retention are known |
| **Listeners** | Artists bring their own audience via their Bitrate pages | Free, and unavailable to a pure streaming competitor |

**The loop to build** — and the only one that compounds:

> artist releases → content and results → listeners arrive → a visible case study → new artists

**Where the first artists actually are.** Independent artist communities, production and
mixing forums, music schools, small studios, beat marketplaces, and local scenes. Poland and the
surrounding region is a legitimate first market rather than a limitation: it is reachable in
person, underserved by tools built for the US market, and small enough that ten artists is a
visible presence rather than a rounding error.

## Funding

The honest position: **bootstrap through phase 4**. Everything up to the first hundred artists
is reachable on a single VPS and founder time, and money raised before there is evidence is the
most expensive money available.

Understand the vocabulary before it is needed — cap table, dilution, valuation, SAFE and
convertible instruments, pre-seed and seed, the deck, due diligence — because learning it during
a negotiation is a bad position. See [Founder skills](./founder-skills.md).

The moment external money becomes rational is when there is a **repeatable** acquisition
channel and the [unit economics](#unit-economics) work — that is, when capital buys more of
something known to work, rather than funding the search for it.

## What would falsify this model

Stated explicitly, so the evidence is recognisable when it appears:

- Artists complete one release and never return → the product is a tool, not a workflow, and
  the subscription is wrong.
- They will pay for distribution but not for the workflow → Bitrate is a distributor, and
  competes on price with entrenched incumbents.
- CAC is dominated by founder time and does not fall → there is no scalable channel, and the
  business is a consultancy.
- Cost to serve exceeds what artists will pay → either the free tier or the infrastructure has
  to change before anything else does.

Any one of these appearing in [phase 4](./validation.md#phase-4--first-market) is worth more
than another year of building.
