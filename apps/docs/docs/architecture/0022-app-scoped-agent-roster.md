# ADR-0022: App-scoped developer agents, an unattended pipeline, and the retirement of br-ticket/br-take-ticket

Status: Accepted

Date: 2026-08-28

Supersedes the agent-roster parts of
[ADR-0012](./0012-ticket-driven-agent-commands.md) and
[ADR-0021](./0021-default-agent-dispatch.md). The default-to-dispatch principle of ADR-0021
stands unchanged; only the roster it dispatches to changes.

## Context

The agent layer introduced by [ADR-0008](./0008-agent-layer.md) and shaped by ADR-0012 and
ADR-0021 had accumulated three problems.

**One `br-developer` for six very different apps.** The repository holds `apps/api`
(NestJS), `apps/web-player` and `apps/web-artists` (Next.js + FSD), `apps/mobile`
(React Native + Expo), `apps/desktop` (Tauri 2), and `apps/admin` (Kottster + Knex). A
single implementation agent had to carry every convention set at once, and its rule sweep
pulled in web rules for native work. Worse, the three scaffolded apps have *no* rule file,
so the agent silently applied web-player conventions — FSD layers, `'use client'`,
Tailwind, `cn()` — to codebases where they are meaningless.

**`br-ticket` and `/br-take-ticket` did nothing useful.** `br-ticket` was read-only: it
proposed a board move, a branch name, and a comment, all of which the command then had to
re-derive and execute itself. The dispatch round-trip bought nothing. It also could not
work at all on a machine without the `gh` CLI — which is the case on the primary
development machine — so its failure mode was indistinguishable from it having nothing to
report. Checking out a branch is a step inside implementing a ticket, not a workflow worth
its own command and its own agent.

**No unattended path.** Every command required a human in the loop for each action. There
was no way to hand a set of well-specified issues to the agent layer and let it work them.

## Decision

**Five app-scoped developer agents replace `br-developer`:**
`br-frontend-developer` (web-player, web-artists, ui-react), `br-backend-developer` (api),
`br-mobile-developer`, `br-desktop-developer`, `br-admin-developer`. Each carries only its
own app's convention set and is explicit about which rules do *not* apply to it. The three
agents for scaffolded apps are additionally required to **flag an improvised convention in
their report** rather than inventing one silently — the missing rule files are a known gap,
and the agents surface it instead of papering over it.

**`br-devops` owns delivery infrastructure** — `.github/workflows`, `.github/actions`,
`infra/`, `turbo.json`, `lefthook.yml`, and the Changesets release path — on the Opus tier,
because a broken workflow blocks every PR and a wrong `permissions:` block leaks a token.
It reviews its own diff for permissions, secret handling, untrusted interpolation, and
action pinning.

**`br-ticket` and `/br-take-ticket` are removed.** Branch checkout folds into
`/br-implement`; live board discovery folds into the new `/br-create-task`.

**`br-docs` becomes `br-librarian`**, with its surface widened from three to four:
`.claude/`, `.changeset/`, `apps/docs/`, and `PRODUCT.md`. It stays read-only.

**`/br-create-task` is added** — it loads the whole board, open and recently-closed issues,
open PRs, and the ADR set, then *classifies* an idea against what already exists
(duplicate / already done / decided against / blocked / too big / fits cleanly) before
drafting anything. Reporting "this already exists as #214" is a successful run.

**`br-worker` becomes an orchestrator, and `/br-auto` runs it unattended.** `br-worker` owns
a task from 0 to 100%: it clarifies the goal (invoking `/grill-me` when a human is present),
plans it, delegates each stage to the specialist that owns it, and — the part that
distinguishes it from a dispatcher — **re-verifies every claim itself** rather than trusting
a specialist's `PASS`. It is the only agent that dispatches other agents. It runs in two
modes: `interactive`, where it asks the developer and narrates progress, and `unattended`,
where it never asks (a question posted to no one is an unbounded stall) and blocks instead.

`/br-auto` is the unattended driver, modelled on the `gg-client-jira-auto` pipeline from the
ggchest-client repository and adapted from Jira/GitLab to GitHub Issues/Projects/PRs. It is
gated on the board's `Todo` column, built on two scripts
(`.claude/scripts/auto/br-worktree.sh`, `br-pr.sh`), and designed to be **resumable and
idempotent**: it stores no journal, re-deriving each issue's stage from git and GitHub, which
are the only sources that cannot lie. Each `br-worker` is confined to its own git worktree
and may commit and push its own branch, but never touches GitHub state — the dispatcher owns
every outward-facing action.

**Planning and multi-session efforts route to two external skills.** `/grill-me` sharpens a
large or vague task by interview before it is planned; `/wayfinder` charts an effort
spanning more than one agent session as decision tickets on the tracker. Both come from the
user-scope `mattpocock-skills` plugin and are therefore *not* committed to this repository;
each developer installs it once.

## Consequences

- A developer agent's rule sweep is now proportionate to its app; native work no longer
  drags in web rules.
- The missing `apps/mobile`, `apps/desktop`, and `apps/admin` rule files become visible:
  three agents now report the gap every time they hit it, instead of it staying invisible.
- `/br-implement`'s routing table grows from one implementation target to six; picking the
  wrong one is now a possible failure mode where before it was impossible.
- The unattended pipeline is the first place where a prior approval covers a sequence of
  GitHub mutations rather than a single one. That is deliberate. The gate is the board's
  `Todo` column, not the agent's judgement and not an opt-in label: a dedicated `ai-auto`
  label was designed and rejected, because it adds a second place to express "this is ready"
  next to the column that already says so, and a board where the column and the label
  disagree is worse than either alone. The cost is a wider candidate set, carried by three
  things: `Todo` is a human-curated column, Stage 3 blocks any issue without acceptance
  criteria, and `--limit`/`--dry-run` bound the run.
- Because the pipeline parks stopped work in a `Blocked` column rather than a label, the
  board's `Status` field needs that option to exist. Without it `/br-auto`'s blocked path has
  nowhere honest to put an issue.
- `gh` becomes a hard dependency for `/br-create-task` and `/br-auto`. Both fail loudly on
  a machine without it instead of degrading silently, which is what `br-ticket` did.
- The agent count rises from seven to twelve, so `.claude/README.md` and `CLAUDE.md`
  carry more roster surface to keep in sync. `br-librarian` exists partly to catch that.
- A task run through `br-worker` costs the orchestrator's tokens *plus* every specialist it
  delegates to. That is the price of having one agent accountable end to end, and it is why
  `br-worker` is not the default entrypoint for a single-stage task — `/br-implement` still
  dispatches straight to the specialist for those.
- `br-worker` is on Opus specifically because its value is catching what the other agents
  missed. An orchestrator that believes its specialists' reports is a router, not a check.

## Alternatives considered

- **Keep one `br-developer` and add per-app rule files instead.** This fixes the convention
  bleed but not the rule-sweep cost: a single agent still reads a routing table covering six
  stacks to decide which one it is in. Splitting the agent makes the decision at dispatch
  time, where it is cheaper and more legible. The per-app rule files are still wanted — this
  ADR does not remove that need, it makes it visible.
- **Keep `br-ticket` and fix it by installing `gh`.** Installing `gh` is necessary
  regardless, but it would not make the agent earn its round-trip: it would still only
  propose actions the command re-executes. The problem was the shape, not the tooling.
- **Let `br-worker` trust the specialists' reports and skip re-verification.** Rejected:
  the failure mode this roster is most exposed to is a specialist reporting a test it never
  ran or a mechanical pass it did not re-run after its last edit. An orchestrator that only
  aggregates reports would launder those claims into a confident summary. Re-running the
  checks is most of what makes the role worth its token cost.
- **Build the unattended pipeline on the Agent tool's `isolation: worktree`.** Rejected:
  that branches from the session's current, possibly dirty, HEAD, whereas the pipeline needs
  each worktree branched from a freshly fetched `origin/develop`.
- **Vendor `grill-me` and `wayfinder` into `.claude/skills/` the way `impeccable` was
  vendored.** Rejected: unlike `impeccable`, these two are entangled with ~25 sibling skills
  (`grilling`, `prototype`, `research`, a tracker doc written by their own setup command).
  Copying two of them would break their cross-references. The plugin stays a per-developer
  install.
