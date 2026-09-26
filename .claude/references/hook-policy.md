# Deterministic checks and on-demand workflows

## Approval for one operation

`settings.json` runs `hooks/block-env-access.sh` → `project_guard.py` before file tools
and Bash. Safe operations emit nothing. Risky operations return the native PreToolUse
`permissionDecision: ask`: choose **Allow once** for that exact tool call. The hook never
returns `allow` or writes a lasting permission rule. A later operation is checked again.
Do not bundle several dangerous commands into one approval request; split them into
individual Bash calls. An approval covers the whole submitted Bash call.

Main-checkout branch switches and integration commands, destructive Git operations,
`rm`/`rmdir`, shell interpreters and ambiguous Git contexts require approval. The guard
recognizes Git `-C`, ordinary aliases, RTK and common wrappers; read-only Git is quiet.
Dedicated worktrees permit ordinary branch switching. Git reset/clean are no longer
hard-denied by permission patterns so the one-call prompt can work. Force push stays
prohibited. In `bypassPermissions`/`dontAsk` a risky operation is denied; return to an
interactive permission mode to approve it. Use an up-to-date Claude Code for native
hook `ask` behavior; the installed UI's approval flow needs a real interactive session.

## Secret paths

Read/Edit/Write/MultiEdit/NotebookEdit and explicit Grep/Glob paths are checked, as are
literal shell file arguments and redirections. Real environment files, credential
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
