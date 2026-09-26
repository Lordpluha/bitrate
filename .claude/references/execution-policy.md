# Bounded execution and evidence

One owner implements an ordinary task in-session, including its tests and review.
Delegate only independent bounded work with a concrete benefit. A role/skill name is not
a reason to spawn another agent. No recursive specialist chain; the main owner decides
whether another delegate is needed. Teams, /batch and unattended loops are opt-in.

## Handoff

Pass only: goal + canonical spec link, settled decisions, paths/ownership, acceptance IDs,
changes already made, exact verification evidence, unresolved issue and next step.
Do not ask delegates to reread all instructions, redo exploration or repeat grill-me.
Return a compact result with actionable findings; do not paste full command logs.

## Reuse of verification

Record command, cwd, exit status, runner/tool version and checked inputs. A commit SHA
alone does not identify dirty/untracked changes. Use `verification-evidence.py record`
after a directly observed successful check to capture source/config/dependency input
hashes. Use `check` before reusing it. Include affected dependency source, lockfiles,
configs, environment variant (non-secret label) and relevant runtime/tool versions.
The helper compares evidence; it never proves that a command was actually executed.
Its inputs must be chosen conservatively; missing dependencies or environment changes
invalidate reuse. Integration checks may depend on external state and need rerunning.
Do not hash real env/credential files or include credentials in recorded commands.

Rerun after relevant input changes, missing/incomplete evidence or a specific new risk.
After two failures with the same evidence, change the diagnostic hypothesis or gather new
data before retrying. Escalate an unresolved decision/blocker; do not relaunch blindly.
Preserve useful TDD feedback loops and broaden tests when the risk justifies it.

## Heavy work

Use `python3 -B .claude/scripts/run-heavy.py -- <command> <args...>` for heavy checks.
The launcher serializes participating commands across worktrees through the common Git
directory, then measures resources. Busy/resource failure means defer or narrow scope.
No automatic retry loop. Commands must remain in the foreground, not daemonize or
deliberately close the inherited lock descriptor. It cannot lock arbitrary commands or processes in other repos;
the resource census remains a conservative snapshot. Never stop user processes.

## Completion and context

Finish when acceptance criteria have evidence, required checks are complete and material
findings are resolved or explicitly reported as limitations. Additional improvements
become separate tasks. Do not keep polishing unrelated code after acceptance.

Use /clear for unrelated work. For a long related task prepare a short handoff, then
/compact at a stage boundary before context grows excessively. Preserve the canonical
spec, decisions, ownership, checks and next step; do not repeatedly compact on a timer.
Memory is for verified durable discoveries, not transcripts, task state or duplicated rules.
Documented local memory/Teams/plugin options: [Claude platform](claude-platform.md).

## Evidence CLI example

After observing a successful check, record the exact command and all relevant inputs:

```sh
python3 -B .claude/scripts/verification-evidence.py record --name api-unit \
  --variant local-test --tool-version '<actual runner + Node versions>' \
  --input apps/api/src --input apps/api/package.json --input apps/api/tsconfig.json \
  --input pnpm-lock.yaml --exit-code 0 -- pnpm --filter @bitrate/api test
```

Supply additional test, runner-config and dependency paths for the actual suite; the
example is not an exhaustive dependency set. Repeat with `check` instead of `record`
and omit `--exit-code 0` to compare the inputs. Records live in the checkout's Git metadata,
not tracked task/spec files. Do not put credentials in commands or labels.
