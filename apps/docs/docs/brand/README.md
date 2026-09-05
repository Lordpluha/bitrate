# Brand and UX baseline

This directory contains cross-cutting UI contracts:

- [`tokens.md`](./tokens.md) — where each token lives and the consumption rules. Nothing is
  generated; the CSS is the source (see [ADR-0023](../architecture/0023-tokens-into-ui-react.md)).
- [`a11y.md`](./a11y.md) — the accessibility baseline for applications and `ui-react`.
- [`bitrate-brand-board.png`](./bitrate-brand-board.png) — the palette, the three themes, and
  the contrast pairs the tokens implement.

- [`brand.md`](./brand.md) — positioning, promise, tone, and the product decision filter.
- [`design.md`](./design.md) — the design principles those translate into.

`brand.md` and `design.md` sit above the rest: they decide, while `tokens.md` and `a11y.md`
own the contracts that implement the decision.

Product-specific art direction may evolve, but token ownership and accessibility are
repository-wide constraints.
