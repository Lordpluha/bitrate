# Deterministic checks and on-demand workflows

## Approval for one operation

`settings.json` runs `hooks/block-env-access.sh` → `project_guard.py` before file tools
and Bash. Safe operations emit nothing. Risky operations return the native PreToolUse
`permissionDecision: ask`: choose **Allow once** for that exact tool call. The hook never
returns `allow` or writes a lasting permission rule. A later operation is checked again.
Do not bundle several dangerous commands into one approval request; split them into
individual Bash calls. An approval covers the whole submitted Bash call.

A hook `ask` overrides allow rules and auto mode, so the guard asks only when an
operation can lose data or changes the developer's main checkout:

| Where | Asks for |
|---|---|
| Main checkout | branch switch to an existing branch, merge/pull/rebase/cherry-pick/revert/am/bisect, reset to another commit |
| Main and non-agent linked worktrees | `reset --hard/--merge/--keep`, `clean` without `-n`, `restore` of the worktree, `checkout`/`switch` that discards or takes paths, stash push/apply, `git rm -f` |
| Anywhere | `branch -D/-f/-M/-C`, `stash drop/clear/pop/branch` (the stash stack is shared by all worktrees), `worktree remove --force` outside temp dirs, config/tag/remote writes, ref/history plumbing, unknown non-alias Git commands, `git -c` with a non-display key, `--output`/`grep -O`, `sudo`, dynamic `eval`, push to `develop`, `push --all/--branches/--prune` or refspec globs |
| `rm`, `unlink`, `shred`, `find -delete` | targets outside the project and temp dirs, the project/temp root itself, `.git`, repository/worktree roots, root-level wide globs, unresolved `$VAR` targets, paths with modified or untracked files outside agent worktrees |
| Unknown code | `$VAR`/`$(...)` as the command name, a shell reading piped stdin (`… \| bash`), `xargs`/`find -exec` with a non-read-only Git command or recursive `rm`, `GIT_*` exported or assigned earlier in the call, `pushd`/`popd` before a checkout-sensitive command |

Agent worktrees (`.claude/worktrees/*`) may reset, clean, stash push, restore and integrate
freely. Creating branches (`switch -c`, `checkout -b`), unstaging (`git reset [HEAD]
[paths]`), commits, fetch, safe `branch -d` and plain `worktree add/remove` are quiet.
Deleting ignored or committed files in the main checkout is quiet; deleting files that
hold uncommitted work asks.
Shell syntax is not a risk signal: variables, `$(...)`, `<(...)`, subshells, `{ }` groups,
`if`/`while` bodies, heredoc bodies, `source`, `timeout`/`nice`/`xargs`/`watch` wrappers,
`find -exec` and `sh -c` are parsed and their real commands checked. Comments, quotes and
heredoc delimiters follow shell rules, so `<<` or `#` inside quotes hides nothing. A heredoc
is checked as code when it feeds a shell or the same call runs a script; string literals
in `python -c`/`node -e` code and heredocs are checked for secret paths and risky
commands. Literal `NAME=value` assignments are expanded and word-split; cwd follows `cd`
and subshells. Force and mirror pushes stay denied. In `bypassPermissions`/`dontAsk` a
risky operation is denied; return to an interactive permission mode to approve it. Use an
up-to-date Claude Code for native hook `ask` behavior.

## Secret paths

Read/Edit/Write/MultiEdit/NotebookEdit and explicit Grep/Glob paths are checked, as are
literal shell file arguments and redirections, including their brace expansions and glob
matches (`.env*`, `.{env,x}`, Grep `glob`). Environment dumps (`env`, `printenv`, bare
`export`/`declare`/`set`), `gh auth token`, `gh auth status --show-token` and
`git credential` are denied. Real environment files, credential
directories, private-key filenames and common credential files are denied. Paths are
checked both lexically and after symlink resolution; `.env.example`, `.env.sample`,
`.env.template`, `.env.dist` are allowed only when the actual target is also allowed.
Broad `.env.*` Read denies were replaced by this check so templates remain usable;
the other static secret denies remain as defense in depth. Never include secret contents
in tool arguments, output or diagnostics.

This is a tool-call guard, not an OS sandbox or a complete shell interpreter. Recursive
searches without explicit secret paths, arbitrary programs/scripts and MCP tools are not
fully inspected. Standard permissions and the standing secret policy still apply.
Codex does not execute Claude's hooks; these controls apply to Claude Code sessions.
Hooks require Python 3 on Linux. Invalid pre-tool input and the guard's own six-second
deadline deny access; successful checks do not add text to model context.

## Formatting

After Edit/Write/MultiEdit, `format-on-edit.sh` → `format_file.py` resolves the edited
file's Git checkout and workspace. Admin/player use local Prettier, other supported
files use local Biome; mobile is explicitly skipped because it has no formatter.
Linked worktrees are supported, foreign repositories and symlink files are skipped.
Only the target file is passed, with the workspace as cwd; nothing is installed.
Missing tools, nonzero exits and timeouts produce a short notice; successful formatting
is silent. Shell/MCP file writes do not trigger this hook. A formatter can partially
write before a timeout; inspect the diff after a failure. Formatting is not linting.

## Workflow loading

Heavy checks use `run-heavy.py` to lock participating commands across worktrees before
resource preflight. `check-resources.py` alone remains a snapshot, not a lock.

- `br-verify`: focused checks, resource preflight and evidence; full details remain in
  [verification](verification.md).
- `br-review`: scoped review using the existing architecture checklist.
- `mattpocock-skills:tdd`: logic, API behavior and bug fixes. Confirm public seams and
  expected behavior; an already confirmed grill-me plan counts. Work one failing
  behavior test → minimal fix → passing test at a time, following the installed skill.
  Documentation and purely cosmetic edits do not require TDD. Reuse the existing
  plugin; do not duplicate its source or invent a runner for an unconfigured workspace.
- Large tasks still use [grill-me and a confirmed plan](large-task-planning.md).
  Semantic architecture and product decisions remain instructions/skills, not heuristics
  in a shell hook.

## Worktrees in VS Code

`.vscode/settings.json` enables `git.detectWorktrees`. Reload the window and use
**Source Control Repositories** to see existing Git worktrees. They are separate
directories/branches, not nested agent threads. No worktrees are created, deleted or
pruned by this setting; ordinary agents need not create a worktree unless they write.

## Checks

`python3 -B -m unittest discover -s .claude/hooks/tests -v` exercises synthetic hook
events, temporary Git repositories and orphan worktrees (Git with `--orphan` support),
with no commits. Controlled formatter executables test routing and write scope; these
fixtures do not substitute for checking real workspace formatters when installed.

References: [Claude hooks](https://code.claude.com/docs/en/hooks),
[VS Code worktree detection](https://code.visualstudio.com/docs/sourcecontrol/branches-worktrees#automatically-detect-worktrees).
