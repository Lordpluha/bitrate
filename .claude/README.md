# Bitrate agent workflows

`CLAUDE.md` is the concise entrypoint. Ordinary tasks run in-session; delegate a bounded
task only when specialization, isolation or independent review has a concrete benefit.
[ADR-0040](../apps/docs/docs/architecture/0040-context-and-delegation-budget.md) supersedes
the mandatory delegation policy of ADR-0021.

## Requirements

Start with [How to AI](../README.md#how-to-ai) for the required Python/Bash/Claude Code
runtime, Linux/WSL2 resource-check boundary, plugin setup and optional tools. Application
development prerequisites are listed separately in [How to develop](../README.md#how-to-develop).

## Commands

| Command | Purpose |
|---|---|
| `/br-create-task "<idea>" [--update NNN] [--epic] [--dry-run]` | Research existing work and draft/update an issue; confirm GitHub mutations |
| `/br-implement "<task>" [--issue NNN] [--worktree] [--session] [--plan] [--review]` | Implement in-session, verify, and prepare a PR; optional bounded delegation |
| `/br-sync-docs [path] [--session]` | Scoped docs audit in-session; delegate a broad independent audit when justified |
| `/br-auto [--limit N] [--issue NNN] [--dry-run] [--recover-only]` | Explicit unattended issue pipeline with prepared worktrees and workers |

`--session` disables delegation. `--plan` produces a plan without starting implementation;
it does not itself require a planner agent. `--review` requests independent review unless
combined with `--session`, in which case disclose that the review was performed in-session.
See each command for its existing confirmation and remote-action boundaries.

## Agent roster

Model defaults are owned by agent frontmatter. The current-session model does not change
when working without a delegate. Delegate routine tasks to Sonnet/medium; reserve the
Opus/high specialists for complex diagnosis and risk-focused independent review.

| Agent | Model | Effort | Purpose |
|---|---|---|---|
| `br-planner` | Sonnet | medium | Separate planning for complex or cross-cutting work |
| `br-frontend-developer` | Sonnet | medium | Web-player, web-artists, ui-react and Svelte player |
| `br-backend-developer` | Sonnet | medium | NestJS API and data contracts |
| `br-mobile-developer` | Sonnet | medium | React Native + Expo |
| `br-desktop-developer` | Sonnet | medium | Tauri + React |
| `br-tester` | Sonnet | medium | A bounded test task that benefits from isolation |
| `br-librarian` | Sonnet | medium | Broad independent documentation audit; read-only |
| `br-devops` | Sonnet | medium | Routine CI, infrastructure and release work |
| `br-worker` | Sonnet | medium | Explicit end-to-end orchestration or `/br-auto` |
| `br-manager` | Sonnet | medium | Interactive tracker coordination with confirmations |
| `br-debugger` | Opus | high | Difficult root-cause investigation |
| `br-reviewer` | Opus | high | Requested independent or materially risky review |

Implementation agents can plan small changes and write their own focused tests. Report
out-of-scope work to the orchestrator; do not build a nested agent chain. The orchestrator
chooses any additional specialist and supplies only the context needed for that task.
Check evidence from delegates against the current revision; repeat successful checks only
after changes, missing evidence, failures or a need for independent reproduction.

## Isolation and ownership

- Writing delegates use a worktree unless the user explicitly requested the current
  checkout. Reuse an already prepared dedicated worktree; never create nested worktrees.
- Read-only delegates may share the checkout. Preserve user changes, dependencies and
  running servers; see [worktree safety](references/worktree-safety.md).
- Specialists do not push or mutate GitHub. `br-manager` owns interactive issue/PR/board
  mutations with confirmation; the `/br-auto` dispatcher owns its GitHub actions.
- An unattended `br-worker` may commit and push only its assigned branch, never `develop`.
- GitHub state is queried live; durable decisions go in ADRs, not a local tracker mirror.

## On-demand references

| Task | Read |
|---|---|
| Review or PR preparation | [Architecture checklist](references/architecture-checklist.md), relevant sections only |
| Heavy checks, tooling changes or failures | [Verification](references/verification.md) |
| Exploration, ADRs and tracker work | [Knowledge management](references/knowledge-base.md) |
| Host/Flatpak tool failures | [Environment](references/environment.md) |
| MCP setup | [MCP reference](references/mcp.md) |
| Tracker or documentation terminology | [Vocabulary](CONTEXT.md) |
| Token usage investigation | [Token budget](TOKEN_BUDGET.md) |

These are plain references, not startup `@` imports. Rules under `rules/` use `paths`
frontmatter; only the brief `code-style.md` is unconditional. A workflow event such as a
commit or PR needs an explicit read; it cannot be represented by an empty paths list.
Before creating files in an unread area, read its relevant rule directly.

Skills under `skills/` load when their workflow is needed. Their descriptions provide
discovery; there is no duplicate exhaustive skill catalog in the startup instructions.
Large tasks require the [grill-me interview and confirmed plan](references/large-task-planning.md)
before implementation, including in `--session` mode. The automatic entrypoint is the
plugin's `grilling` skill, which `/grill-me` wraps. `/wayfinder` remains user-invoked.
The main session interviews once; delegates reuse its decisions. Unattended large tasks
without a completed interview and confirmed plan block for interactive planning.

## Layout and maintenance

- `rules/`: scoped project conventions and the short verification baseline.
- `references/`: optional workflow manuals and incident history.
- `commands/`: four command entrypoints; `agents/`: twelve specialist definitions.
- `skills/` and `templates/`: task-specific recipes and scaffolds.
- `scripts/auto/`: worktree and GitHub helpers for explicit automation.
- `hooks/`: explicit-path secrets/Git approval checks and workspace formatting.
- `br-verify` / `br-review`: on-demand verification/review skills;
  [hook policy](references/hook-policy.md) owns approval semantics and runtime limits.
- `scripts/run-heavy.py`: shared-worktree lock, resource preflight and bounded execution.
- `scripts/verification-evidence.py`: compare declared check inputs, including dirty files.
- `scripts/check-instructions.py`: validate metadata, links and representative rule scopes.
- [Specifications](references/spec-workflow.md) and [execution](references/execution-policy.md):
  canonical requirements, handoffs, evidence and completion.
- [Platform options](references/claude-platform.md): Teams, memory, plugins, LSP and routing.
- `output-styles/bitrate-concise.md`: optional concise style; not activated automatically.
- `mattpocock-skills:tdd`: installed plugin workflow for logic/API/bugs.

Do not change MCP activation just to shorten its documentation. Current connections are
described in the MCP reference; investigate actual overhead before disabling them.
When changing policy, update callers and links, add a superseding ADR rather than rewriting
historical decisions, and validate `/context` in a fresh Claude Code session.
