# Brand and UX baseline

This section holds two kinds of document. The first five pages **decide** what Bitrate is; the last
three own the **contracts** that implement those decisions in code.

## The brand

Read in order the first time — each page assumes the one before it.

| Page | Answers |
|---|---|
| [Brand foundation](./foundation.md) | Why Bitrate exists, the mission, the vision, and what the first release actually has to solve |
| [Positioning and promise](./positioning.md) | How Bitrate describes itself, what it commits to, and the words used to say it |
| [Principles](./principles.md) | What simplicity means in practice, the architectural rule protecting it, and what Bitrate refuses to do |
| [Product decision filter](./decision-filter.md) | The test a proposed feature has to pass |
| [Personality, voice and naming](./voice.md) | How the product sounds, and how its own products are named |
| [Strategy](./strategy.md) | Monetization, the path from abstraction layer to infrastructure, who is served in what order |

[`design.md`](./design.md) translates all of the above into design direction.

## The contracts

- [`tokens.md`](./tokens.md) — where each token lives and the consumption rules. Nothing is
  generated; the CSS is the source (see [ADR-0023](../architecture/0023-tokens-into-ui-react.md)).
- [`a11y.md`](./a11y.md) — the accessibility baseline for applications and `ui-react`.
- [`bitrate-brand-board.png`](./bitrate-brand-board.png) — the palette, the three themes, and
  the contrast pairs the tokens implement.

Product-specific art direction may evolve, but token ownership and accessibility are
repository-wide constraints.

These six brand pages were one file, `brand.md`, until it was split — see
[ADR-0028](../architecture/0028-split-brand-foundation.md).
