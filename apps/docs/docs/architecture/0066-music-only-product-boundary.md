# ADR-0066: Bitrate is music-only; spoken word belongs to separate products

Status: Accepted

Date: 2026-10-29

## Context

The [vision](../strategy/vision.md) already said Bitrate is "not multi-vertical", but only
"until the music case works", and the [delivery roadmap](../guides/roadmap.md) still listed
podcasts and audiobooks as future content. The code went further than either: the API had a
`podcasts` module with `Podcast`, `Episode` and `UserSavedEpisode` models, the listener app
had podcast pages and saved episodes, and the operator panel had podcast take-downs
([ADR-0051](./0051-operator-panel-resource-coverage.md), item 10). The
[product backlog](../strategy/product-backlog.md) named the mismatch and asked for a
deliberate decision rather than letting unused models become a commitment. There is no
production podcast content.

## Decision

**Bitrate contains music only.** Podcasts and audiobooks are not part of Bitrate — not
deferred, but outside the product. Music videos and radio stations are not decided here and
stay on the roadmap as they are.

**Spoken word may become separate products.** A podcast or audiobook application, if one is
built, is its own product and may not carry the Bitrate brand. Its brand, its repository,
and whether it shares accounts, the player package or backend services with Bitrate are
deliberately left open; nothing in this repository is shaped for it in advance.

**The existing podcast vertical is removed, not frozen.** It is deleted from the listener
app, the operator panel and the API, and its tables are dropped. The code is not kept to be
carried into a future spoken-word product, which would need its own model anyway.

## Consequences

- Removal lands as one PR per workspace, consumers before the producer: web-player and the
  operator panel stop calling podcast endpoints, then the API drops the module, the
  `podcasts:*` permissions, the `podcast` and `episode` report subjects and the tables, and
  the contract is regenerated. Tracked by #427.
- The table-drop migration also deletes podcast and episode moderation reports and strips
  `podcasts:*` from stored roles and staff permissions. Nothing is exported; there is no
  production content to keep.
- Terms of use no longer grant listeners podcast streaming.
- Item 10 of [ADR-0051](./0051-operator-panel-resource-coverage.md) is superseded; the rest
  of that record stands.
- A proposal to add spoken word, video-podcasts or similar content to Bitrate now needs a
  superseding ADR, not just a roadmap entry.

## Alternatives considered

- **Keep the vertical but freeze it** — no new work, remove later. Rejected: the models stay
  "speculative weight carried by every migration", and every podcast surface keeps needing
  translation, permissions and moderation upkeep for content that will never ship.
- **Keep it until a separate app exists, then move the code there** — rejected: the future
  product may live under another brand and repository, with its own model; carrying this
  code until then costs the same upkeep for a migration that is unlikely to happen.
- **Keep spoken word inside Bitrate as a later vertical** — the previous position. Rejected:
  it dilutes the artist-first music product and the brand, and nothing in the job to be done
  needs it.
