---
name: br-review
description: "Review a Bitrate diff or prepare a PR; assess behavior, architecture and verification evidence."
---

# Review a scoped diff

1. Establish the requested base/diff and ownership. Read both staged and unstaged
   changes when relevant; do not stage, reset or rewrite user work.
2. Read only applicable sections of the [architecture checklist](../../references/architecture-checklist.md)
   and affected workspace rules. Trace important changed behavior to callers and tests.
3. Prioritize actionable defects: incorrect behavior, data loss, missing authorization,
   broken contracts and credible regressions. For each finding provide a file/line,
   trigger, impact and a concrete correction. Avoid speculative/style-only findings.
4. Check negative cases and verification evidence. Use `br-verify` if evidence is missing;
   do not rerun unchanged passing checks by default. Do not launch a full agent pipeline.
5. Routine review stays in-session. Delegate only requested independent review or a
   justified bounded risk review; read-only review may share the checkout. In `--session`
   mode keep it local and disclose that it is not independent.
6. Report findings by severity, or explicitly say none were found and state coverage
   limits. Fix only within authorized scope; review itself does not authorize commits,
   pushes, PR publication or sending comments to other people.
