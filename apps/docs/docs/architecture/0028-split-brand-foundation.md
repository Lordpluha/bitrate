# ADR-0028: Split the brand foundation into one page per decision

Status: Accepted

Date: 2026-09-05

## Context

`apps/docs/docs/brand/brand.md` held the entire brand — twenty numbered sections covering
mission, positioning, promise, principles, the product decision filter, tone of voice, naming,
monetization, ecosystem strategy and audience hierarchy — in a single 306-line file.

Two problems followed from that.

The first was mechanical, and it made the document partly unreachable. Docusaurus treats
`index.md`, `README.md` **and a file named after its own folder** as the folder's index, so
`brand/README.md` and `brand/brand.md` both claimed the route `/docs/brand/`. The build warned
`Duplicate routes found!` and picked a winner non-deterministically, which meant the brand
foundation could silently not be the page served at its own address. The warning had been
present long enough to be treated as noise.

The second is that a file organised as "sections 1 through 20" cannot be linked to. Every
reference to it — from `PRODUCT.md`, from the roadmap, from `design.md` — either pointed at the
whole document or cited a section number, which is a reference that breaks the moment a section
is inserted. `PRODUCT.md` genuinely carried `brand.md §17`.

## Decision

The brand is six pages, each answering one question, under `apps/docs/docs/brand/`:

| Page | Was |
|---|---|
| `foundation.md` | §1 brand in one line, §2 why Bitrate exists, §3 mission, §4 vision, §5 initial focus |
| `positioning.md` | §6 positioning, §7 brand promise, §8 core value, §18 tagline and messaging |
| `principles.md` | §9 supporting principles, §15 architecture principle, §16 anti-principles |
| `decision-filter.md` | §10 product decision filter |
| `voice.md` | §11 brand personality, §12 tone of voice, §17 naming |
| `strategy.md` | §13 monetization, §14 ecosystem strategy, §19 audience hierarchy, §20 the long-term test |

Section numbering is dropped; headings keep their exact wording, so a heading anchor is now the
stable way to cite a piece of the brand. The prose itself is unchanged — the split moved 193
content lines verbatim and rewrote only the top-level title.

`brand/README.md` stays the section index and is now the only claimant to `/docs/brand/`.
Sibling pages carry `sidebar_position` so the section reads in the intended order rather than
alphabetically.

## Consequences

- The duplicate route is gone; `pnpm --filter @bitrate/docs build` no longer warns.
- Brand statements are individually addressable, so `PRODUCT.md` cites
  `brand/voice.md § Naming` instead of `brand.md §17`.
- Every inbound reference was updated: `PRODUCT.md`, `apps/docs/docs/guides/roadmap.md`,
  `apps/docs/docs/brand/design.md`, and two pending changesets.
- [ADR-0024](./0024-rebrand-to-bitrate.md) still names `brand.md` in its prose. That is left
  alone deliberately: it records what was true when the rebrand was decided, and accepted ADRs
  are superseded rather than rewritten.
- Adding a brand section now means adding a page and an index row, not appending §21 to a file
  nobody reads to the end.

## Alternatives considered

- **Rename `brand.md` and keep it whole** — resolves the route collision in one line and nothing
  else. The document stays unlinkable and keeps growing by appended sections.
- **Delete `brand/README.md` and let `brand.md` be the index** — also fixes the collision, and
  makes the situation worse: the section's entry page becomes a 306-line document rather than a
  map of what the section contains.
- **Split by audience (internal vs marketing)** — the file has no such seam. Positioning and
  tone serve both, so the cut would have duplicated content instead of dividing it.
