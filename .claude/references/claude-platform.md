# Claude Code platform options

This is an on-demand design reference, not an instruction to activate every capability.
The approved project workflow remains Claude Code. Other clients are developer choices.

## What the supplied usage data says

The user reported a full five-hour Claude Pro window, 55% weekly usage, and 97% of local
usage in both >150k-context and subagent-heavy sessions. These categories overlap; they
are not percentages to add. They identify optimization priorities, not a causal breakdown.
br-devops (16%), general-purpose (14%) and /find-docs (13%) warrant targeted inspection.
Do not infer an exact token-saving ratio or blame MCP from this summary alone.

Priorities: shorter task contexts, fewer repeated reads, bounded delegation and reuse of
valid checks. /clear on unrelated work; a concise handoff and /compact at long-task stage
boundaries. Do not make several workers reread the full rule/skill collection.

## Teams and the proposed architecture

Teams are experimental, opt-in and more expensive than a single session. They are useful
for independent modules, competing diagnostic hypotheses and independent risk reviews.
They are not the default for small changes or sequential API-then-consumer work. Start a
pilot with one lead and two bounded participants; measure actual cost and defects found.
Assign path ownership, agree contracts, isolate writing worktrees and use the shared heavy
check launcher. Teams alone do not guarantee filesystem isolation or successful integration.

The capability graph is not a mandatory MCP → LSP → Teams → Plugins sequence:

- Plugins package reusable capabilities: skills, agents, hooks, MCP/LSP configuration.
- MCP supplies external tools/services; LSP provides semantic code navigation/diagnostics.
- Agents use a selected subset of those capabilities. The orchestrator assigns tasks,
  ownership and completion criteria. A team is one optional execution arrangement.
- Repository rules/ADRs supply project-specific contracts. Memory stores verified findings.

Frontend/backend/test/review roles can work without separate always-running agents.
Do not launch lint/typecheck/test suites after every Edit. Keep post-edit formatting scoped;
use LSP for immediate feedback and explicit scoped gates at meaningful checkpoints.

## Memory hygiene

Auto memory is for durable verified discoveries, not rules copied from source, transcripts,
credentials, current board state or pending tasks. Keep MEMORY.md a short index; topical
files hold detail. Each useful entry identifies scope, evidence path and last verification.
Correct or remove stale entries when contradicted; consult only relevant topics.

Agent memory is optional per specialist. Prefer project-specific scope for repository
facts; use local scope for personal/unreviewed notes. Never mix unrelated repositories in
a generic user-scoped frontend/backend memory. Promote validated team-wide decisions to
reviewed rules/ADRs, then remove duplicate memory prose. No mandatory write after each turn.
Start with one frequently reused specialist instead of enabling twelve memory stores.
Enabling memory adds startup context and may give the agent file-write tools; check the
effective tool boundary before enabling it on a supposedly read-only reviewer.

## Personal plugins

A separate Claude marketplace can distribute lordpluha-frontend-dev, -backend-dev,
-devops, -mobile-dev, -desktop-dev, -manager and -testing. Add a small shared core only for
truly reusable workflows; keep Bitrate paths, board IDs, architecture and commands here.
Do not duplicate the same skills/hooks/LSP server in each role plugin.

Proposed package layout: `.claude-plugin/plugin.json`, `agents/`, `skills/`, optional
`hooks/hooks.json`, `.mcp.json`, `.lsp.json`, `output-styles/`. Use plugin-root placeholders,
versioned releases and plugin validation. Namespaced plugin agents/skills need caller
updates before replacing local definitions; migrate one package at a time without loading
the old and new implementation together. A plugin is distribution, not a token discount.

Plugin agent frontmatter does not support `hooks`, `mcpServers` or `permissionMode` in the
current docs. Put shared integrations at plugin level; retain project agent adapters where
per-agent configuration is required. Do not assume an agent-scoped setting survived copying.
MCP connection approval and provider credentials remain developer choices, not embedded
defaults. No marketplace publication or plugin installation is part of this refactor.

## Output style and LSP

The optional `bitrate-concise` output style changes reporting only and explicitly keeps
the built-in coding instructions. It is not forced for every developer. Select it through
/output-style after restarting to discover new files. Skills own workflow and rules own
project policy; keep both out of style prompts. Styles do not automatically govern ordinary
subagent output; keep their report contracts short separately.

The TypeScript LSP plugin is enabled in project settings, but typescript-language-server
was not found on the audit shell PATH. Verify the actual Claude process PATH and /plugin
Errors before claiming it works. Language-server executables are installed separately.
Angular templates, Svelte and Rust need appropriate language support; a TS server alone
does not cover all of them. Verify definition/references/rename plus a deliberate diagnostic
in a temporary fixture. LSP diagnostics supplement, not replace, full scoped type checks.
Use one relevant server per language/workspace; do not start duplicates per role plugin.

## Automation and limits

Use /batch for bounded independent changes after agreements; /background changes where
work runs, not whether it costs requests. /goal and /loop can prolong execution: require
clear stopping conditions and avoid idle polling that repeatedly reads the same issues.
Command availability depends on the installed version/client; verify /help first.

For repeatable issue → implementation → verification → review → draft PR, start with
the existing br-auto workflow and prepared specifications. Agent SDK/headless automation
can later provide explicit state transitions, structured results, per-run turn/spend limits
and cancellation. Headless `-p` supports ordinary subagents, not interactive Teams in the
current docs. Therefore do not design CI around an assumption it can spawn Teams.
GitHub Actions/remote sessions require separate credentials, permissions, budgets and
deployment decisions. They are optional future integrations, not automatically activated.
An API dollar cap is not a Claude Pro five-hour subscription quota control.

## OmniRoute

Assuming the upstream project is diegosouzapw/OmniRoute, it is a multi-provider gateway
with routing/fallback and optional compression. It can be useful for an explicitly chosen
API/provider setup. Routing to another provider uses that provider's budget and capabilities;
it does not replenish the user's Claude Pro window or eliminate repeated context/agent work.
Assess compatibility of streaming, tools, caching and model behavior on a small fixture
before switching a coding workflow. Compression claims in its README are not measurements
of this project. Do not add a proxy/compressor to solve a workflow problem without a baseline.
No proxy, tokens, account imports or endpoint changes are installed by this refactor.

Official references consulted:
- [Teams](https://code.claude.com/docs/en/agent-teams)
- [Memory](https://code.claude.com/docs/en/memory)
- [Subagents and memory](https://code.claude.com/docs/en/sub-agents)
- [Plugin components and LSP](https://code.claude.com/docs/en/plugins-reference)
- [Output styles](https://code.claude.com/docs/en/output-styles)
- [CLI/headless limits](https://code.claude.com/docs/en/cli-reference)
- [OmniRoute upstream](https://github.com/diegosouzapw/OmniRoute)
