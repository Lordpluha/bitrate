# Claude workflow refactor

## Goal and boundaries

Reduce unnecessary instruction loading, delegation and repeated verification while
preserving project architecture, user changes and explicit approvals. Scope: Claude Code
configuration, supporting scripts/tests and documentation. No application changes,
commits, staging, remote publication, new provider setup or automatic Teams activation.
Codex is a developer choice, not part of the project's default configuration.

## Agreed decisions and approval

In this task's conversation the user selected Claude Code only, component thresholds as
review signals with rationale, and the issue as canonical specification (one local file
when no issue exists). The user then said “Начни реализацию”. The standing “Ничего не
коммить” instruction remains in force. This local file is the canonical spec because no
issue was supplied; it does not claim GitHub approval or create a second tracker.

## Behavior and acceptance evidence

| ID | Requirement | Verification / result |
|---|---|---|
| AC-1 | Scoped rules omit unrelated framework requirements and reduce loaded source | `check-instructions.py`: nine scope fixtures pass; measurements below |
| AC-2 | Size/props/effects prompt semantic review, not automatic failure | Rules, developer/reviewer agents and checklist use one consistent policy |
| AC-3 | Planning precedes intake/rework setup; ordinary work avoids mandatory chains | br-auto intake/rework order reviewed; default one worker, explicit parallel override |
| AC-4 | Heavy participating checks serialize across worktrees | Tests cover contention, timeout, cancellation, child lifetime and resource refusal |
| AC-5 | Evidence reuse notices changed dirty/untracked inputs and commands | CLI integration test passes; helper explicitly cannot prove execution or discover all dependencies |
| AC-6 | Preserve guards, user state and no-commit constraint | Hook regression suite passes; index/HEAD unchanged; no application diff introduced |
| AC-7 | Explain optional platform features without silent installation | `claude-platform.md`; optional style provided, no active proxy/Teams/memory-store changes |
| AC-8 | Assess actual Claude loading and subscription effect | Fresh-session context 44.8k → 42.7k; memory 6.2k → 4.1k; Skills unchanged at 10k; quota effect pending |

## Implementation

1. Separate concise requirements from on-demand guides and narrow paths.
2. Unify orchestration and canonical specification ownership.
3. Add heavy-check launcher, evidence comparison and instruction validator.
4. Validate isolated CLI behavior, metadata, links and scope fixtures.
5. Continue with interactive Claude acceptance when running actual developer tasks.

## Recorded validation

- `python3 -B -m unittest discover -s .claude/hooks/tests -v`: 22 tests passed.
- `uv run --offline --no-project --with pyyaml python .claude/scripts/check-instructions.py`:
  metadata/links and nine scope fixtures passed.
- New/updated br-verify and br-review skill metadata validated; shell syntax and
  `git diff --check` passed.

Source Markdown snapshot before/after this refactor, in bytes (not token billing):

| Representative file | Before | After |
|---|---:|---:|
| web-player Home.tsx | 60,324 | 15,195 |
| web-player LoginForm.tsx | 60,324 | 16,041 |
| Admin example.ts | 41,275 | 4,766 |
| API tracks.service.ts | 29,113 | 4,364 |
| Svelte Player.svelte | 27,764 | 2,860 |

These totals cover matching rule files, including source frontmatter. They exclude
CLAUDE.md, conversation history, skill/MCP listings, dynamically read guides and caching.
Current measurements are reproducible with the validator; the before snapshot describes
the state inspected for this task, not the repository's older committed baseline.

## Remaining runtime checks

In fresh Claude sessions check a small bug, a cosmetic edit, an unapproved large task and
resumption of an approved task. Inspect /context, actual tool requests and usage. The
shell audit found the TypeScript LSP plugin enabled but no typescript-language-server in
that shell's PATH; verify the real Claude environment before claiming LSP operation.

## Recovery

Review/revert only this task's changes by path/hunk; preserve pre-existing configuration
work and application changes. Do not reset the checkout or restore whole files from HEAD.
The optional style is not enabled automatically. New runtime records live in Git metadata;
the launcher/evidence helpers do not create commits or change the index.

## Startup audit continuation — stages 1–3

The user approved this continuation with “Давай приступим к этапам 1-3”. Recorded the
fresh-session baseline, audited skill/plugin discovery costs, shortened local descriptions
and startup instructions, and resolved duplicate Context7/graphify/memory guidance.
[Token audit](../../../../.claude/TOKEN_BUDGET.md) owns the measurements and comparison
procedure. Protection/formatter hooks remain; only the conflicting graphify search
reminder was unregistered. Global originals have an external backup. AC-8 remains partial
until scoped loading and comparable real usage are observed. The user supplied the
after-edit fresh `/context`: 42.7k total, 4.1k memory, Skills still 10.0k.

The subsequent skill-attribution investigation found repeated long-context processing in
session 216ed566, reconciled wizard's approximately 35m counter with 40 later responses,
and identified engineering/design as account-synced plugins. The user approved making
Figma/Sentry optional locally; local plugin overrides and standalone Sentry MCP rejection
were applied and verified. Shared project defaults were preserved. The planning guide now
bounds unknown-skill retries and applies project delegation limits to factual research.
The token audit contains methods, limits and re-enable instructions; quota effects remain
unmeasured.

After local plugin toggles, the user reported Skills 10.0k → 9.5k and System tools
17.3k → 17.8k; total startup context remained 42.7k. No additional net startup saving is
claimed. The cause of the system-tool increase and subscription-quota impact are unverified.
