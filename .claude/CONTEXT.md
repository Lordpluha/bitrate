# Shared vocabulary — bitrate agent layer

The words below mean one thing each in this repository. They are used in `CLAUDE.md`,
`.claude/rules/`, `.claude/commands/`, `.claude/agents/`, commit messages, and PR
descriptions. Using a synonym instead is not a style slip: it makes a grep miss, and it makes
an agent reach for the wrong document.

Adapted from the `CONTEXT.md` convention in
[mattpocock/skills](https://github.com/mattpocock/skills).

## Language

**Issue** — a single tracked unit of work on GitHub Issues: a bug, feature, or chore,
identified by its number (`#312`). This is the only unit `/sp-create-task` creates and
`/sp-auto` consumes. *Avoid*: ticket, story, card.

**Board** — the GitHub Projects board for this repository:
[`Lordpluha/projects/6`](https://github.com/users/Lordpluha/projects/6), a user-scope
project. Its **columns** are the options of the project's `Status` field and are the live
status of an issue:

```
Backlog → Todo → In progress → Code review → Ready for testing → In testing
        → Ready for merge → Ready for release → Released
        (plus Reopened, the kick-back column)
```

`Blocked` is where `/sp-auto` parks work it cannot finish; `Todo` is its intake gate, so a
card's column is what decides whether the unattended pipeline may touch it. Re-read the
options with `gh project field-list 6 --owner Lordpluha` rather than trusting this list if a
move fails. Board state is never
mirrored to a file; it is queried with `gh` whenever it is needed
([ADR-0016](../apps/docs/docs/architecture/0016-live-github-queries.md)).
*Avoid*: backlog (as the name of the tool), kanban, project.

**Card** — one issue's item on the **Board**. "Move the card" means change its column. An
issue and its card are the same work seen from two places; they can disagree, and when they
do, the card is what colleagues plan around.

**Task** — the thing an agent is asked to do in one run. A task usually implements an
**Issue**, but not always: an ad-hoc request in conversation is a task with no issue. Use
*issue* for the tracked record, *task* for the unit of agent work.

**Rule** — a file under `.claude/rules/`. **Project law**: conventions this codebase
enforces, listed exhaustively in `CLAUDE.md`'s Rule Index. A rule is read because its scope
matches the task. *Avoid*: guideline, standard, convention doc.

**Skill** — a directory under `.claude/skills/` holding a `SKILL.md`. A **recipe** for one
technology or workflow, listed in `CLAUDE.md`'s Skill Index. A skill is loaded because you
are working in that technology. Rules say what this project requires; skills say how the
technology works. *Avoid*: guide, playbook, helper.

**Command** — a file under `.claude/commands/`, invoked by a human as `/sp-<name>`. A command
owns confirmation and every GitHub mutation; it dispatches the work to an agent.

**Agent** / **specialist** — a file under `.claude/agents/`, dispatched via the Agent tool.
Pins its own model and effort. *Specialist* is the collective noun for the eleven agents that
own one stage or one app. `sp-worker` is the **orchestrator**: the one agent that dispatches
other agents. *Avoid*: subagent (except when naming the tool parameter), bot.

**Worker** — `sp-worker` specifically, and only that. Not a generic word for an agent doing
work.

**Mechanical pass** — `lint`, `check-types`, and (when files, exports, or dependencies
changed) `knip`. "Green" means all of them exited zero. *Avoid*: the checks, CI stuff.

**Changeset** — a file under `.changeset/` declaring a version bump per workspace. Required
for any user- or consumer-visible change; not for docs/rules/test-only/chore diffs.

**Workspace** — one pnpm package in the monorepo: `@bitrate/api`, `@bitrate/web-player`, and
so on. The unit a `--filter` and a changeset bump both address. *Avoid*: project, sub-repo.

**Slice** — one directory under an FSD layer in a Next.js app: `features/Album/`,
`entities/Track/`. Has a public `index.ts` barrel that is the only legal cross-slice import
target. *Avoid*: module, folder, component group.

**Module** — a NestJS module in `apps/api/src/modules/<name>/`. Never used for a frontend
slice.

**Unattended** — running with no human reading the output: `/sp-auto`, and `sp-worker` when
it was given a `WORKTREE`. In unattended mode an agent never asks a question; it blocks. The
opposite is **interactive**.

**Blocked** — a truthful stop, with a reason from the fixed set (`intent`, `clarification`,
`blocked`, `technical`, `scope`, `conflict`). On the **Board** it is expressed by moving the card
to the `Blocked` column. A blocked task is a good outcome; a
plausible-looking change that does not compile is not.

## Relationships

- The **Board** holds many **Cards**; each **Card** is one **Issue**.
- An **Issue** is implemented by one or more **Tasks**.
- A **Command** dispatches one or more **Agents**; only a Command mutates GitHub.
- `sp-worker` is the one **Agent** that dispatches other **Agents**.
- A **Rule** is matched by scope; a **Skill** is matched by technology. Both are listed
  exhaustively in `CLAUDE.md`.
- A **Workspace** contains many **Slices** (frontend) or many **Modules** (API).

## Flagged ambiguities

- **"ticket"** previously meant both a GitHub issue and an agent's unit of work. Resolved: the
  tracked record is an **Issue**, the unit of agent work is a **Task**. The retired
  `/sp-take-ticket` command and `sp-ticket` agent are the last places the old usage appears,
  and they survive only in superseded ADRs
  ([ADR-0022](../apps/docs/docs/architecture/0022-app-scoped-agent-roster.md)).
- **"worker"** was ambiguous between `sp-worker` and any agent doing work. Resolved:
  **Worker** names `sp-worker` only.
- **"module"** meant both a NestJS module and a frontend directory. Resolved: **Module** is
  NestJS; the frontend unit is a **Slice**.
- **"docs"** meant `apps/docs/`, `.claude/rules/`, and the root onboarding files
  interchangeably. Resolved: name the surface — `apps/docs/`, **rules**, or **root onboarding
  docs**. `sp-librarian` owns all of them, plus `.changeset/` and `PRODUCT.md`.
