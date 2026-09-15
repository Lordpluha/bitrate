---
description: Find where .claude/, .changeset/, apps/docs/, PRODUCT.md, and root onboarding docs (README/CONTRIBUTING/CODE_STYLE) have drifted from each other or from the actual repo structure. Dispatches discovery to br-librarian by default; the command itself handles confirmation and applies fixes. Never rewrites an ADR's Decision. Run this periodically — wire it to /schedule or /loop if you want it recurring.
argument-hint: "[path or app to focus on] [--session]"
author: lordpluha
---

Three documentation surfaces describe overlapping ground from different angles, and each can
drift silently because no agent workflow mechanically re-checks them during normal
implementation work:

- **`apps/docs/`** — public Docusaurus site, human onboarding.
- **Root onboarding docs** — `README.md`, `CONTRIBUTING.md`, `CODE_STYLE.md`.
- **`.claude/` self-consistency** — `CLAUDE.md`'s Rule Index, Commands, and Model-tier tables
  against the actual files under `.claude/rules/`, `.claude/commands/`, `.claude/agents/`;
  `.claude/README.md` against `.claude/skills/`.

This is not hypothetical: [ADR-0011](../../apps/docs/docs/architecture/0011-retire-apps-web.md)
documents a real incident on the `apps/docs/` surface — a page kept describing a deleted app
and a stack an ADR had already superseded, for months, undetected. See
[ADR-0013](../../apps/docs/docs/architecture/0013-docs-sync.md) (original `apps/docs/` scope),
[ADR-0031](../../apps/docs/docs/architecture/0031-expand-docs-sync-scope.md) (root onboarding
docs + `.claude/` self-consistency added), and
[ADR-0021](../../apps/docs/docs/architecture/0021-default-agent-dispatch.md) (this command
now dispatches discovery to `br-librarian` by default).

Default: dispatch discovery to the `br-librarian` agent via the Agent tool (`subagent_type:
"br-librarian"`), passing the user-supplied arguments verbatim. Work in-session only when the
user passes `--session` or otherwise explicitly asks to skip the agent.

## Step 1 — Discovery (agent by default)

Invoke `br-librarian` and wait for its report: every finding, grouped by surface and category
(dead reference / stale stack / ADR contradiction / mechanical restatement / orphaned table
row), each with a proposed fix. `br-librarian` is read-only — it never edits a file itself.

If `--session` was passed, do the scan yourself instead — see `br-librarian.md`'s "Step 1 — Scan"
section for the exact grep/ls commands and drift categories; the check list is identical
either way.

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
