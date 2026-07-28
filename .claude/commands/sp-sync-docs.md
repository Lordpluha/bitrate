---
description: Find where apps/docs has drifted from .claude/rules, ADRs, or the actual repo structure (dead references, stale tech-stack claims, ADR contradictions, mechanical restatement). Fixes objectively-verifiable drift only after confirmation; never rewrites an ADR's Decision. Self-contained — no separate agent file. Run this periodically — wire it to /schedule or /loop if you want it recurring.
argument-hint: "[path or app to focus on]"
author: lordpluha
---

`apps/docs/` (public Docusaurus site, human onboarding) and `.claude/` (agent
working rules) describe overlapping ground — FSD layout, API module structure, tech stack —
from different angles. That overlap drifts silently because no agent workflow reads
`apps/docs/` while implementing (see [ADR-0011](../../apps/docs/docs/architecture/0011-retire-apps-web.md)
for a real incident: `apps/docs/docs/applications/web/` kept describing a deleted app and a
stack ADR-0004 had already superseded, for months, undetected).

## What counts as drift (check all of these)

1. **Dead references** — a path, filename, or app name mentioned in `apps/docs/` that no
   longer exists (`grep` every `apps/<name>` mention against the actual `apps/` directory
   listing; every file path mention against the actual file).
2. **Stale tech-stack claims** — an `apps/docs/docs/applications/*/overview.md` bullet list
   ("Tech Stack") that doesn't match that app's `package.json` `dependencies`.
3. **Contradicted-by-ADR claims** — an `apps/docs/` page describing an approach (e.g. a
   data-fetching library, a state-management choice) that an accepted ADR under
   `apps/docs/docs/architecture/` has since superseded.
4. **Mechanical restatement** — an `apps/docs/` page reproducing structural detail that a
   specific rule file already owns verbatim or near-verbatim (a full FSD layer tree, a full
   module folder tree, a full test-tier list) instead of a short summary + link. This is a
   judgment call, not a mechanical check — flag it, don't auto-fix it silently.

## Step 1 — Scan

```bash
# Every apps/<name> mention vs the real directory listing
grep -rn "apps/[a-z-]*" apps/docs/docs --include="*.md" | grep -v "apps/docs"
ls apps/

# Every apps/docs/docs/applications/*/overview.md "Tech Stack" section vs package.json
for f in apps/docs/docs/applications/*/overview.md; do echo "== $f =="; done
```

Cross-reference each application overview's claimed stack against
`apps/<app>/package.json` `dependencies`/`devDependencies`. Cross-reference each ADR's
"Decision" against the current `.claude/rules/*.md` it corresponds to. `graphify query` is
useful here to cross-check what a page claims against the actual current code/rule
structure.

## Step 2 — Report findings before touching anything

List every finding with file:line, grouped by category (dead reference / stale stack /
ADR contradiction / mechanical restatement). This report always happens, even if nothing
gets fixed.

## Step 3 — Fix, but only after confirmation, and only what's objectively verifiable

- Dead references and stale tech-stack bullets: propose the exact edit, confirm, then fix.
- Mechanical-restatement findings: propose trimming the page to a short summary + a link to
  the owning rule file/ADR, confirm the specific rewrite before applying it — this is an
  editorial call, treat it with the same confirm-every-time discipline as `/sp-implement`'s
  PR edits.
- **Never rewrite an ADR's Context/Decision/Consequences.** An ADR contradiction is a
  finding for a human (or a follow-up `/sp-implement` ticket) to resolve with a new
  superseding ADR — same pattern as
  [ADR-0011](../../apps/docs/docs/architecture/0011-retire-apps-web.md), which itself came
  out of a `/sp-sync-docs`-shaped finding.

## Step 4 — Report

Summarize what was found, what was fixed (with confirmation), and what's left as a
human/follow-up decision (ADR contradictions, restatement calls the user declined).

Report using a `sp-sync-docs: PASS / PARTIAL / BLOCKED` verdict line.
