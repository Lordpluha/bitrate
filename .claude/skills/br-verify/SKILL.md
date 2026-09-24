---
name: br-verify
description: "Verify a Bitrate change or triage failed checks with scoped commands, resource limits and reproducible evidence."
---

# Verify the changed behavior

1. Inspect the scoped diff without changing the index. Identify behavior, affected
   workspaces and existing checks; preserve unrelated user edits.
2. Load only relevant sections of [verification](../../references/verification.md).
   For behavior tests use [testing](../../rules/testing.md) and only the relevant runner
   skill. Logic, API and bugs follow `mattpocock-skills:tdd`; reuse confirmed seams.
3. Run heavy checks through `python3 -B .claude/scripts/run-heavy.py -- <command> <args...>`.
   It locks across worktrees before checking memory/swap/processes. Exit 75 means busy,
   78 means unavailable/insufficient resources, 124 means timeout; normal check exits are
   preserved. This serializes participating commands, not all machine processes.
   For evidence reuse follow [execution policy](../../references/execution-policy.md).
4. Use installed workspace tools. Admin/player format with Prettier, other configured
   workspaces with Biome; mobile has no configured formatter. Format edited files only.
   A post-edit hook is not proof that lint/types/tests passed. Shell edits need an explicit
   formatter run. Keep runner workers bounded and use the reference's heap limits.
5. Run the narrowest relevant checks, preserving exit codes. A docs-only change needs
   links/frontmatter/diff checks, not application builds. Hook logic has isolated tests:
   `python3 -B -m unittest discover -s .claude/hooks/tests -v`.
6. Report exact commands, results, checks skipped and remaining risks. Rerun only after
   relevant changes, failure or missing evidence. Do not create a commit unless requested.
