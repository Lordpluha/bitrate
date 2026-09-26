---
description: "Audit scoped documentation and instruction drift against the repo; preserve historical ADR decisions and confirm publication."
argument-hint: "[path or app to focus on] [--session]"
author: lordpluha
---

Before a large effort, follow `.claude/references/large-task-planning.md`: run the
`grill-me` interview in the user-facing session, then present the plan for confirmation.
Reuse an already completed interview and confirmed scope. Read-only fact gathering can
support the interview; do not begin the planned mutations or implementation beforehand.


Three documentation surfaces describe overlapping ground from different angles, and each can
drift silently because no agent workflow mechanically re-checks them during normal
implementation work:

- **`apps/docs/`** — public Docusaurus site, human onboarding.
- **Root onboarding docs** — `README.md`, `CONTRIBUTING.md`, `CODE_STYLE.md`.
- **`.claude/` self-consistency** — `CLAUDE.md`'s loading and delegation policy
  against actual `paths` frontmatter, reference links, commands and agent model defaults;
  `.claude/README.md` against `.claude/skills/`.

This is not hypothetical: [ADR-0011](../../apps/docs/docs/architecture/0011-retire-apps-web.md)
documents a real incident on the `apps/docs/` surface — a page kept describing a deleted app
and a stack an ADR had already superseded, for months, undetected. See
[ADR-0013](../../apps/docs/docs/architecture/0013-docs-sync.md) (original `apps/docs/` scope),
[ADR-0031](../../apps/docs/docs/architecture/0031-expand-docs-sync-scope.md) (root onboarding
docs + `.claude/` self-consistency added), and [ADR-0040](../../apps/docs/docs/architecture/0040-context-and-delegation-budget.md)
(scoped loading and task-based delegation).

## Step 1 — Discovery

Audit the requested scope in-session. Read the relevant sections of `br-librarian.md`
for discovery categories when needed; do not scan every documentation surface for a
single-file correction. For a broad audit that benefits from independent discovery,
delegate one bounded scan to `br-librarian`. `--session` disables delegation.
The librarian reports findings and proposed fixes without editing files.

## Step 2 — Report findings before touching anything

Surface the full report to the user exactly as returned (or as found in-session), even if
nothing ends up getting fixed.

## Step 3 — Fix, but only after confirmation, and only what's objectively verifiable

- Dead references, stale tech-stack bullets, and orphaned/missing `.claude/` table rows:
  confirm the proposed edit, then apply it.
- Mechanical-restatement findings: confirm the specific rewrite (trim to a short summary + a
  link to the owning rule file/ADR) before applying it — this is an editorial call, treat it
  with the same confirm-every-time discipline as `/br-implement`'s PR edits.
- **Never rewrite an ADR's Context/Decision/Consequences.** An ADR contradiction is a
  finding for a human (or a follow-up `/br-implement` ticket) to resolve with a new
  superseding ADR — same pattern as
  [ADR-0011](../../apps/docs/docs/architecture/0011-retire-apps-web.md), which itself came
  out of a `/br-sync-docs`-shaped finding.

## Step 4 — Report

Summarize what was found, what was fixed (with confirmation), and what's left as a
human/follow-up decision (ADR contradictions, restatement calls the user declined).

Report using a `br-sync-docs: PASS / PARTIAL / BLOCKED` verdict line.
