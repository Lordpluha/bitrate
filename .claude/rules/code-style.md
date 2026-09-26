# Verification essentials

- Run the narrowest checks that cover the changed behavior; preserve exit status when
  filtering output. Report the command, result, and anything not verified.
- Fix diagnostics at their source; do not weaken compiler/linter rules to obtain a pass.
- Use `br-verify` for verification and `br-review` for reviews. Format only edited files:
  Admin/player use Prettier, other configured workspaces Biome; mobile has no formatter.
- Run heavy checks through `python3 -B .claude/scripts/run-heavy.py -- <command> <args...>`.
  It locks across worktrees before resource preflight; defer on busy/insufficient resources.
- Bound runners and Node heaps; start temporary servers under `timeout 300` and clean up
  only the processes you started. Never disturb the developer's running servers.
- Read `.claude/references/verification.md` before heavy checks, when a check fails, or
  when editing lint/type/build configuration. It owns exact memory limits and recovery steps.
