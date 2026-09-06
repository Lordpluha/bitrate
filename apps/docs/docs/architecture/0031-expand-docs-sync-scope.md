# ADR-0031: Expand /br-sync-docs to root onboarding docs and .claude/ self-consistency

> Renumbered from ADR-0020. Two records were committed under that number — this one and
> [CMAF + Range + MSE playback](./0020-cmaf-range-mse-playback.md), which reached the
> repository first and keeps it. The Docusaurus route strips the numeric prefix, so this
> page's URL is unchanged.

Status: Accepted

Date: 2026-07-30

## Context

[ADR-0013](./0013-docs-sync.md) scoped `/br-sync-docs` to one direction: check `apps/docs/`
references, tech-stack claims, and ADR restatements against `.claude/rules/` and
`package.json` as the sources of truth. Two other surfaces were left unchecked:

- **Root onboarding docs** — `README.md`, `CONTRIBUTING.md`, `CODE_STYLE.md` — can drift the
  same way `apps/docs/` did in the [ADR-0011](./0011-retire-apps-web.md) incident: a dead
  app reference, a stale setup command, a tech-stack bullet nobody updates after a
  dependency swap. Nothing was checking them.
- **`.claude/` self-consistency** — `CLAUDE.md`'s Rule Index, Commands, and Model-tier tables
  are hand-maintained pointers into `.claude/rules/`, `.claude/commands/`, and
  `.claude/agents/`. A renamed or deleted rule/command/agent file silently orphans its table
  row (dead reference) or leaves a new file with no table row pointing at it (nothing routes
  agents to it). This is the exact same drift shape ADR-0013 addresses for `apps/docs/`,
  just aimed at `.claude/` itself instead of at the public docs site.

Both gaps are the same failure mode as ADR-0011/ADR-0013: no agent workflow mechanically
checks these surfaces during normal implementation work, so drift is caught only if a human
happens to read the stale line.

## Decision

- `/br-sync-docs` (`.claude/commands/br-sync-docs.md`) now checks three surfaces instead of
  one:
  1. `apps/docs/` against `.claude/rules/`, ADRs, and `package.json` — unchanged from
     ADR-0013.
  2. Root onboarding docs (`README.md`, `CONTRIBUTING.md`, `CODE_STYLE.md`) against the
     actual repo structure, `package.json`, and ADRs — same drift categories (dead
     reference, stale stack claim, ADR contradiction, mechanical restatement) applied to
     these three files.
  3. `.claude/` self-consistency — `CLAUDE.md`'s Rule Index/Commands/Model-tier tables
     cross-checked against the actual files under `.claude/rules/`, `.claude/commands/`,
     `.claude/agents/`: every table row resolves to a real file, every file in those
     directories has a table row pointing to it. `.claude/README.md` checked the same way
     against `.claude/skills/`.
- Same fix discipline as ADR-0013 applies to all three surfaces: report every finding first,
  fix only objectively-verifiable drift after confirmation (dead references, stale bullets,
  orphaned/missing table rows), and never rewrite an ADR's Decision — an ADR-level
  contradiction is still a finding for a human, resolved with a new superseding ADR.
- ADR-0013's own Context/Decision/Consequences are unchanged and still accurate for the
  `apps/docs/` surface; this ADR only adds the two new surfaces alongside it, the same way
  ADR-0013 itself notes ADR-0018 changed the path of "agent working rules" without touching
  ADR-0013's boundary decision.

## Consequences

- A renamed/deleted rule, command, or agent file is caught as an orphaned Rule Index/Commands
  table row instead of silently leaving stale routing in `CLAUDE.md`.
- Root onboarding docs get the same periodic drift check `apps/docs/` already had — three
  files, not a large surface, so the added scan cost per `/br-sync-docs` run is small.
- `/br-sync-docs` remains a periodic/manual-trigger command (per ADR-0013) — this ADR widens
  what it checks, not when it runs.

## Alternatives considered

- **A separate command for `.claude/` self-consistency** — rejected; it's the same
  drift-detection shape (references vs. actual files, report-then-confirm-then-fix) as the
  existing command, and splitting it would mean running two commands to catch what's
  conceptually one category of problem (documentation surfaces drifting from reality).
- **Leave root onboarding docs unchecked** — rejected; they're exactly the kind of
  human-facing, rarely-re-read page ADR-0011 already showed goes stale for months once
  nothing routes back to it during implementation.
