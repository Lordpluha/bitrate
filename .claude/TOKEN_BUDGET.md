# Token usage troubleshooting

Read this when investigating usage or tuning the agent workflow. Everyday execution rules
live in `CLAUDE.md`; do not load this document for ordinary implementation tasks.

## Measure before changing behavior

1. In a fresh Claude Code session, run `/context` before opening files. Record memory/rule
   and tool overhead. Only the short unconditional rules should appear initially.
2. Open one representative file in the affected app and inspect `/context` again. Check
   that its applicable `paths` rules loaded and unrelated app rules did not.
3. Compare similar completed tasks: number of model requests, input/cache/output tokens,
   subagent activity, and the provider's actual usage display. Token counts alone do not
   establish subscription-quota cost; cached input and fresh input are different.
4. Compare a task in a fresh session with one in a long conversation. Repeated context
   processing may dominate even when visible answers are short.

## Investigate unexpected growth

- Check for rules lacking `paths`, accidental `@` imports, and overly broad patterns.
- Inspect repeated tool reads, large command outputs, agent chains and repeated checks.
- Keep RTK for useful output filtering; use raw output when investigating an exact failure
  or writing/parsing a log (see `references/verification.md`).
- Enable MCP servers when their results benefit the task. Inspect actual loaded tools and
  responses before attributing usage to idle servers; lazy loading varies by client.
- `br-worker` plus specialists costs multiple contexts. Use it for explicit orchestration,
  not single-stage work. A shorter instruction file does not fix an unnecessary agent loop.

## Maintain the setup

- Keep optional references outside `.claude/rules/`; moving them to another subfolder
  inside `rules/` does not prevent recursive discovery.
- Preserve required checks, worktree isolation and secret protection when shortening text.
- Recheck links and command/agent consistency after moving a document.
- Do not delete active worktrees or change models mid-task just to reduce a usage counter.
## Startup audit — 2026-09-23

Scope: user-approved stages 1–3 (baseline, skill catalog, instruction/memory duplication).
Local CLI: Claude Code 2.1.278. Baseline below is the user's fresh `/context` report for
`claude-sonnet-5`, before this audit's edits. It is not a new measurement by the auditor.

| Category | Baseline tokens |
|---|---:|
| Total used | 44.8k / 1.0M |
| System prompt | 9.8k |
| System tools | 17.3k |
| MCP tools | 606 |
| Custom agents | 865 |
| Memory files | 6.2k |
| Skills | 10.0k |
| Messages | 8 |
| Autocompact buffer (reserved separately) | 33.0k |
| Free space | 922.2k |

Loaded memory: project CLAUDE.md 3.9k; global context7.md 774; auto-memory index 772;
global RTK.md 369; code-style.md 348. Category values are rounded independently.
The earlier 751.1k snapshot contained 704.2k message tokens; its difference from this
baseline mostly reflects conversation history, not savings from configuration edits.

### Skill inventory and decisions

Inspected 29 project skills, four project commands, three personal skills (including the
`find-skills` symlink), eight synced skills and 15 enabled plugins. Plugin CLI inventory
reports 61 skills across those plugins. This is an inventory, not an exact effective
prompt count: duplicate names, manual invocation, bundled skills and client discovery
rules affect what loads. Recursive cache-file counts include legacy command copies;
for example Matt Pocock has 38 Markdown candidates but CLI reports 25 skills.

`claude plugin details <name>` estimates the following always-on costs. These include
plugin listings and are estimates, not a reconciliation of `/context`'s Skills category.

| Enabled plugin | CLI estimated always-on tokens |
|---|---:|
| figma | 2,133 |
| mattpocock-skills | 1,609 |
| sentry | 1,064 |
| chrome-devtools-mcp | 804 |
| claude-md-management | 175 |
| claude-code-setup | 139 |
| skill-creator | 112 |
| andrej-karpathy-skills | 103 |
| frontend-design | 78 |
| code-review | 20 |
| github, context7, playwright, typescript-lsp, security-guidance | 0 each |

Zero here does not mean the plugin has no tool/runtime cost. No plugins were disabled.
Their installed cache and the account-synced skill files were left intact.

- Shortened descriptions of 29 project skills, three commands, personal `find-docs` and
  personal `graphify`; retained invocation modes and project skill bodies.
- Personal and project graphify are separate copies. Personal precedence means editing
  only the project description would not affect this user's `/graphify`; both now use
  the scoped trigger. This duplication was not counted as two actual loaded descriptions.
- Context7's global rule now routes to `find-docs`, which owns the lookup procedure.
  Version-sensitive uncertainty and requested current docs still trigger verification;
  mere library mentions no longer force a lookup. Focused lookups stay in-session.
- Root CLAUDE.md keeps planning, TDD, isolation, approvals and scoped instruction routing.
- RTK keeps hook usage, raw diagnostics and audit commands; removed marketing and repetitive
  setup examples. Existing global/local RTK hook registrations were not changed.
- Auto-memory keeps all 12 topic links. Project rules own current graphify/resource policy;
  old blanket graphify advice and outdated resource limits are marked superseded.
  Exit 137 is SIGKILL, not sufficient evidence by itself to claim OOM.
- Removed only the graphify reminder registration from project PreToolUse. Its installed
  implementation emits a mandatory-query reminder on matching searches, conflicting with
  the scoped policy. Graphify and its wrapper remain installed; protection/formatting hooks
  remain registered. A future `graphify install` can reintroduce the upstream reminder;
  inspect the settings diff after reinstalling it.

### Measured source changes

UTF-8 bytes below are source sizes, **not token counts or subscription savings**.
Description totals include all 33 project entries and three personal entries, including
unchanged descriptions and the graphify duplicate; they exclude plugins/synced skills.

| Source | Before bytes | After bytes |
|---|---:|---:|
| Project/personal descriptions | 13,105 | 4,417 |
| Project CLAUDE.md (168 → 120 lines) | 10,584 | 7,727 |
| Global rules/context7.md | 2,306 | 463 |
| Global RTK.md | 964 | 447 |
| Auto-memory MEMORY.md | 1,880 | 1,138 |
| Personal find-docs whole file (on invocation) | 7,429 | 1,664 |

The find-docs row overlaps its description in the first row; do not add these rows to
estimate prompt savings. Topic-memory bodies are on-demand, not startup reductions.

### Validation and next measurement

Instruction metadata/links and nine rule-scope fixtures pass. YAML descriptions remain
valid; project skill bodies and invocation metadata are preserved. Hook regression tests
pass. Index/HEAD remain unchanged; changes are unstaged, with no commits.

The user supplied the after-edit fresh-session `/context` on 2026-09-24, with the same
reported model and 1M window:

| Category | Before | After | Change |
|---|---:|---:|---:|
| Total used | 44.8k | 42.7k | -2.1k (~4.7%) |
| Memory files | 6.2k | 4.1k | -2.1k (~33.9%) |
| Skills | 10.0k | 10.0k | No visible change |
| System prompt / tools | 9.8k / 17.3k | 9.8k / 17.3k | Unchanged |
| MCP tools | 606 | 605 | -1 |
| Custom agents / messages | 865 / 8 | 865 / 8 | Unchanged |
| Autocompact buffer | 33.0k | 33.0k | Unchanged |
| Free space | 922.2k | 924.3k | +2.1k |

Memory details: CLAUDE.md 3.9k → 2.9k; MEMORY.md 772 → 455;
context7.md 774 → 148; RTK.md 369 → 176; code-style.md 348 → 348.
Rounded totals show the improvement in memory loading; source-description reductions
have not produced a visible Skills-category reduction.

Official skills documentation explains that the discovery listing has a budget scaling
with 1% of the model context window; `/context` reports the listing after that budget is
applied. A saturated listing is therefore a plausible explanation for the unchanged 10k:
shorter local descriptions may make room for other descriptions. This is an inference,
not a measured attribution; confirm via `/doctor` or `/skill-doctor` in the user's client.
The inspected project/personal settings have no explicit listing-budget overrides; the
auditor's shell is not proof of the running client's environment.

Personal skills found: find-docs, find-skills, graphify. Account-synced skills found:
docs, docx, import-memory, morning, pdf, pptx, skill-creator, xlsx. Enabled plugin skills
also contribute to the combined catalog; their CLI estimates are above. None of those
observations establishes that global skills alone account for the 10k.

Remaining: open an app file to verify scoped loading and compare real tasks with `/usage`
for quota effects. This audit confirms lower startup context, not subscription savings.

Global-file originals are backed up outside Claude's discovery paths at
`~/.local/state/claude-config-backups/bitrate-startup-20260923/`.
The worktree/index snapshot for this audit is `/tmp/bitrate-startup-audit-before/`.
Restore only relevant files/hunks; do not reset the checkout or replace the staged work.

Loading semantics: [skills documentation](https://code.claude.com/docs/en/skills).
Cost-estimate command: [plugins reference](https://code.claude.com/docs/en/plugins-reference).

## Session attribution investigation — 2026-09-24

The user supplied `/skill-doctor` output: find-docs 92.7m attributed tokens / seven uses,
wizard 35m / one use, grilling 8.5m / one use. These are historical local attribution
figures, not skill-body sizes or a direct measurement of subscription quota consumed.

### Observed request metadata

Inspected local JSONL usage/tool metadata without copying conversation text, shell
arguments or credentials into this report. The main Bitrate session is
`216ed566-3ceb-4ac5-bd72-2cade0a5c9cb` (2026-09-22/23). Grouped assistant fragments by
message ID, taking the maximum reported value per usage field to avoid counting repeated
stream fragments. Excluded zero-usage messages; two malformed JSONL records were skipped.
These are recorded nonzero-usage responses, not a complete provider billing ledger.

| Main-session measurement | Observed value |
|---|---:|
| Distinct nonzero-usage assistant responses | 797 |
| Responses with input context above 150k | 790 |
| Median input context | 421,144 |
| Maximum input context | 895,271 |
| Fresh input tokens | 19,032 |
| Cache creation input tokens | 3,956,556 |
| Cache read input tokens | 365,771,579 |
| Output tokens | 544,839 |

Cache reads account for 98.9% of recorded input volume. The token totals repeatedly count
the same history across requests; they are not unique text or directly convertible to Pro
quota. Eight Agent calls and eight corresponding child transcript files were also found;
those files are separate from the main-session totals above. Four compaction markers on
September 22 did not prevent context growing large again on September 23.

At 20:35:30 UTC on September 23, wizard was invoked with about 842,577 input-context tokens.
The 40 later recorded responses total 34,984,221 tokens: 34,904,462 cache reads, 52,694
cache creation, 80 fresh input and 26,985 output. That interval includes eight Read,
21 Bash, nine Edit and one Write calls. Its total closely matches the user's rounded 35m
attribution. It supports repeated long-context processing as the explanation; it does not
prove that every subsequent action was necessary or caused exclusively by wizard.

The main-session find-docs calls occurred at input contexts of about 208,503 and 767,075.
Other find-docs calls were found in longer child sessions. The 92.7m seven-day figure was
not exactly reconstructed: invocation/attribution boundaries and report timing differ.
Do not assign every later session request to find-docs or divide its attribution by seven
and present that as an intrinsic per-lookup cost. Its current concise procedure already
limits targeted Context7 calls and does not require a research agent.

Three grilling calls failed with unknown-skill errors (one qualified name, then two
unqualified attempts), before a qualified call succeeded at 19:07:45 UTC. The input
context was already approximately 674k–691k. The planning reference now requires a
verified exposed skill name and evidence before retrying, instead of guessing aliases;
its factual research also follows the approved bounded-delegation policy. Interview and
confirmation remain required for large tasks.

### Synced plugin source

Found both `engineering` and `design`, version 1.2.0, under
`~/.claude/plugins/synced/<account-bucket>/<plugin>/.claude-plugin/plugin.json`.
They were absent from the ordinary installed_plugins.json registry, explaining why the
initial local plugin inventory missed them. The user's live skill report is the evidence
that they were loaded. Synced copies were not edited or deleted.

For account-synced plugins, inspect `/plugin` → Installed (source `synced`); disable there
unless organization-required, or manage removal on claude.ai. Deleting cache directories
is not a durable configuration change. [Official plugin management documentation](https://code.claude.com/docs/en/discover-plugins#manage-installed-plugins).

The immediate priority is shorter task contexts and bounded request loops. A multi-step
setup or unrelated task should start with a compact handoff in a fresh session; a related
long task should compact at a meaningful boundary. Keep the approved spec/decisions so
this does not restart planning. Plugin catalog reductions are secondary and require a
fresh `/context` comparison, because another description can occupy freed listing budget.
[Why long sessions consume usage](https://code.claude.com/docs/en/costs#why-usage-climbs-in-a-long-session).

### Optional local plugins — applied with user approval

The user chose “Да, включать по необходимости”. The local, gitignored
`.claude/settings.local.json` now overrides `figma@claude-plugins-official` and
`sentry@claude-plugins-official` to false. The separate `.mcp.json` Sentry server is also
rejected locally with `disabledMcpjsonServers: ["sentry"]`; otherwise disabling the plugin
would leave that independent connection enabled. `claude mcp get sentry` confirms Rejected.
Shared project settings, installed plugins, synced engineering/design, LSP and planning/TDD
skills remain unchanged. The pre-change local settings are backed up at
`~/.local/state/claude-config-backups/bitrate-optional-plugins-20260924/settings.local.json`.

Re-enable only when needed, from the project directory:

```sh
claude plugin enable figma@claude-plugins-official --scope local
claude plugin enable sentry@claude-plugins-official --scope local
```

For the standalone Sentry MCP connection, also remove only `sentry` from the local
`disabledMcpjsonServers` list and approve it in `/mcp` if prompted. Plugin and standalone
MCP are separate choices; enable only the connection the task needs. Use a new session to
apply and compare `/context`; changing plugins in a long running session may affect cache
reuse. The user-supplied after-toggle measurement is recorded below.

Validation: instruction metadata/links and nine rule-scope fixtures pass; local JSON parsed,
CLI plugin disables succeeded, shared-settings checksum and Git index stayed unchanged.
No model requests, application tests, commits or remote account changes were made by this
investigation. The logs are historical evidence, not a newly run workload.

### After-toggle context measurement — 2026-09-24

User-supplied fresh-session report, same reported model and 1M context window:

| Category | Before local plugin toggles | After | Change |
|---|---:|---:|---:|
| Total used | 42.7k | 42.7k | No visible change |
| Skills | 10.0k | 9.5k | -0.5k |
| System tools | 17.3k | 17.8k | +0.5k |
| MCP tools | 605 | 609 | +4 |
| Memory files | 4.1k | 4.1k | Unchanged |
| System prompt | 9.8k | 9.8k | Unchanged |
| Custom agents / messages | 865 / 8 | 865 / 8 | Unchanged |
| Autocompact buffer / free space | 33.0k / 924.3k | 33.0k / 924.3k | Unchanged |

The reported skill-listing reduction is offset by increased system-tool context at the
shown precision. Per-plugin estimates were not additive predictions of net savings.
The screenshot does not identify which system tools changed, or prove that the toggle
caused their increase. Resolving that requires comparing actual tool inventories under
matching client/version/settings. Do not disable more capabilities based on this total.
The original baseline improvement remains 44.8k → 42.7k, approximately 4.7%; no additional
net startup reduction or subscription-quota improvement is demonstrated by this snapshot.

### Browser MCP deduplication — 2026-09-24

User requested removing the less useful duplicate connections. Compared the supplied
`/context all` tool names with current project/plugin launch configurations:

| Browser server | Project connection | Plugin connection | Decision |
|---|---|---|---|
| Chrome DevTools | 30 tools; includes get_css_styles; pnpm dlx chrome-devtools-mcp@latest | Same other 29 tool names; npx chrome-devtools-mcp@1.9.0 | Keep project connection |
| Playwright | 25 tools; pnpm dlx @playwright/mcp@latest | Same 25 names/package selector, via npx | Keep project connection |

Both have no extra configured browser flags in the inspected launch definitions. Tool-name
coverage is based on the user's observed runtime report; it does not prove identical
schemas or behavior across versions. The pinned DevTools plugin has no unique tool name
in that report; retaining the project connection preserves CSS inspection capability.

Added only `plugin:chrome-devtools-mcp:chrome-devtools` and `plugin:playwright:playwright`
to this checkout's `disabledMcpServers` in `~/.claude.json`. Kept both plugin installations
and the useful Chrome DevTools skills. Shared `.mcp.json`, shared settings, local settings
and the Git index were unchanged. Other projects' choices were preserved.

`claude mcp get` confirms both plugin servers are Disabled for this project; project browser
connections remain enabled in configuration. No browser/model call was launched for this
check. Start a new Claude session and verify only `mcp__chrome-devtools__*` and
`mcp__playwright__*` remain in the browser tool inventory. The removed duplicate inventories
had 54 entries and approximately 16.5k tokens of definitions in the supplied report;
those were deferred definitions, not a promise of 16.5k lower startup context.

To restore a plugin server, enable its scoped name in `/mcp`. The original local state is
backed up outside discovery at
`~/.local/state/claude-config-backups/bitrate-browser-dedup-20260924T065913Z/claude.json`.
Restore only the relevant disabled-server entries if later settings have changed.
