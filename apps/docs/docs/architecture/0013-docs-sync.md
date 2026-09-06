# ADR-0013: apps/docs vs .claude — ownership boundary and drift detection

Status: Accepted

Date: 2026-07-20

Note: originally written when agent rules were split across `.agents/`/`.claude/`; see
[ADR-0018](./0018-consolidate-agents-into-claude.md), which folded that split into
`.claude/` alone. The boundary and drift-detection decision below is unaffected — only the
path of "agent working rules" changed.

Note: `/br-sync-docs`'s scope was later widened beyond `apps/docs/` alone — see
[ADR-0031](./0031-expand-docs-sync-scope.md), which adds root onboarding docs and `.claude/`
self-consistency as checked surfaces. The `apps/docs/` boundary and drift categories below
are unaffected.

## Context

`apps/docs/` (public Docusaurus site) and `.claude/` (agent working rules)
describe overlapping ground from different angles: `apps/docs/docs/applications/*/overview.md`
and `apps/docs/docs/getting-started/architecture.md` restate FSD layer trees, module folder
structures, and tech-stack lists that a specific rule file (`.claude/rules/fsd-web-player.md`,
`.claude/rules/api-rules.md`, etc.) already owns as the mechanical source of truth.

This is not hypothetical: [ADR-0011](./0011-retire-apps-web.md) documents a real incident —
`apps/docs/docs/applications/web/overview.md` kept describing a deleted app (`apps/web`) and
an Axios/SWR/Redux stack that ADR-0004 and ADR-0005 had already superseded, undetected for
months. The reason it went undetected: no agent workflow reads `apps/docs/` while
implementing — `CLAUDE.md`'s Rule Index and `/br-implement`'s Step 0 point at
`.claude/rules/`, never at `apps/docs/`. A page can drift arbitrarily far
from reality with nothing surfacing it until a human happens to read it.

## Decision

- `apps/docs/` and `.claude/` keep their current audiences and both continue to
  exist — one is public/human onboarding, the other is agent working rules. This ADR does
  not merge them.
- Application overview pages and the getting-started architecture page are onboarding
  summaries, not mechanical references: **link, don't restate**. A full FSD layer tree, a
  full module folder tree, or a full tech-stack enumeration belongs in exactly one place
  (the owning rule file or `package.json`); the `apps/docs/` page gets a short summary and a
  link. See `.claude/rules/monorepo.md` § "Documentation ownership".
- `/br-sync-docs` (see `.claude/commands/br-sync-docs.md` — self-contained, no separate
  agent file) is the drift detector: it checks
  `apps/docs/` references against the actual repo structure, application tech-stack claims
  against `package.json`, and ADR decisions against the current rule files. It fixes
  objectively-verifiable drift (dead references, stale stack bullets) only after
  confirmation, and never rewrites an ADR's Decision — an ADR-level contradiction is a
  finding for a human, resolved with a new superseding ADR (exactly the ADR-0011 pattern).
- `/br-sync-docs` is a periodic/manual-trigger command, not something the agent layer runs
  automatically on every session. A developer (or a scheduled `/loop`/`/schedule` job, set
  up explicitly by whoever wants it recurring) runs it on a cadence.

## Consequences

- Application overview pages get shorter and more likely to survive a rename/restructure
  without going stale, at the cost of one extra click for a reader who wants the mechanical
  detail.
- Drift is caught on a cadence, not continuously — a `/br-sync-docs` run only helps if
  someone (or a schedule) actually triggers it. This ADR doesn't force that cadence.
- Changing a rule file's mechanical detail (an FSD layer, a module tree) no longer requires
  hunting down every `apps/docs/` page that might restate it — there should be at most one,
  and it should already be a link.

## Alternatives considered

- **Merge `apps/docs/` content into `.claude/rules/`** — rejected; the two have different
  audiences (public onboarding vs agent working rules) and different tooling (Docusaurus
  site vs plain markdown read by agents), and public docs need prose/diagrams that would
  bloat rule files agents re-read on every task.
- **Continuous sync (Docusaurus pages generated from rule files)** — rejected as
  over-engineering for the current doc volume; a periodic `/br-sync-docs` pass is cheaper to
  build and reason about than a generation pipeline, and the drift this ADR addresses is
  measured in months, not minutes.
