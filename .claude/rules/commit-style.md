---
name: commit-style
description: Conventional Commits without a ticket prefix — the type and scope vocabulary, summary rules, when a change needs a changeset and which bump it gets, branch naming, and the mechanical enforcement through commitlint and Lefthook. Use whenever composing a commit message, naming a branch, or deciding whether a change needs a changeset.
globs:
  - ".changeset/**"
  - "commitlint.config.js"
  - ".cz-config.js"
license: MIT
metadata:
  author: lordpluha
  version: "1.0.0"
---

# Commit message style

Applies to every commit in this repository.

## Format

```
<type>(<scope>): <summary>
```

**Conventional Commits** — no Jira/ticket prefix. Use `pnpm commit` for the interactive wizard.

### Types

`feat` | `fix` | `docs` | `chore` | `refactor` | `test` | `perf` | `build` | `ci` | `style`

### Scopes

The app or package name:

| Scope | Applies to |
|-------|-----------|
| `api` | `apps/api/` |
| `web-player` | `apps/web-player/` |
| `desktop` | `apps/desktop/` |
| `mobile` | `apps/mobile/` |
| `ui-react` | `packages/ui-react/` |
| `player` | `packages/player/` |
| `contracts` | `packages/contracts/` |
| `converter` | `packages/converter/` |
| `docs` | `apps/docs/` |
| `ci` | GitHub Actions workflows |

Omit scope for repo-wide changes.

### Summary

- Imperative present tense: `add`, `fix`, `update`, `remove` — not `added`, `fixed`.
- No trailing period.
- ≤ 72 characters total.

## Examples

```
feat(api): add audio streaming with Range header support
fix(web-player): correct player state on track end
chore(packages): bump ui-react to 2.1.0
refactor(api): extract track processing into separate service
test(api): add integration tests for tracks controller
docs(web-player): update FSD architecture notes
perf(web-player): lazy-load album artwork
build(ci): add turbo caching to build workflow
```

## Body (optional)

Past-tense, plain prose. One short paragraph explaining the non-obvious **why**. No formal sections, no tracker IDs in the body. Most commits need no body — the header is enough.

## Changesets

Every workspace member (`apps/*` and `packages/*`) is `"private": true` — nothing publishes
to npm — but the repo still uses [Changesets](https://github.com/changesets/changesets) for
per-workspace versioning and `CHANGELOG.md` generation (`.changeset/config.json`,
`access: "restricted"`). Add a changeset whenever a change is user/behaviour-visible in an
app or package, not for pure docs/rules/test-only/chore changes.

The `br-*-developer` agents and `br-worker` (and `/br-implement` when working in-session)
write the file directly —
`pnpm changeset`'s interactive wizard is for humans; an agent just writes the markdown:

```markdown
---
'@bitrate/web-player': minor
'@bitrate/api': patch
---

One paragraph, past tense, describing the user/consumer-visible change.
```

File: `.changeset/<short-kebab-slug>.md` (2-4 words, e.g. `bright-audio-streams.md` —
matches the existing files' style). List every workspace whose behaviour changed, each with
its own bump.

**Bump-type rubric:**
- `patch` — bug fix, internal refactor with no behaviour change, dependency bump with no
  API change.
- `minor` — new feature, new endpoint, new component, backward-compatible behaviour change.
- `major` — breaking change (removed/renamed export, endpoint contract change, removed
  prop). Rare in a repo where nothing is actually published; still record it so
  `CHANGELOG.md` reflects the real severity.

A change that touches multiple workspaces (e.g. a new API endpoint plus the UI that
consumes it) gets one changeset file listing both, not two separate files.

## Branch naming

`feat/`, `fix/`, `docs/`, `refactor/`, `chore/`, `test/`, `hotfix/` prefix followed by a short slug:

```
feat/audio-streaming
fix/player-state-on-end
chore/bump-ui-react
```

## Commit and pull-request size

**A commit is sized by what it changes, not by how many files it touches.** The rule is that
each commit stands on its own: checked out alone, the repository builds and its tests pass.
That is what actually forbids a dump of unrelated edits, and it is checkable — `git rebase
--exec` runs the gates over a range, and a bisect is only meaningful when every commit is
green.

**A file count is a bad proxy, in both directions.** A regenerated
`packages/contracts/src/api/v1.ts` is one file and nine hundred lines that a reviewer must
read carefully. Renaming a DTO across three auth modules touches forty-seven files and is
one idea, reviewable in minutes — and split into arbitrary ten-file commits, every
intermediate commit fails to compile, because the class is renamed in one place and its
consumers in another. A cap per commit buys nothing there and costs bisectability.

For a pull request:

- **One logical change per PR.** A second idea gets a second PR, however small its diff.
- **Fifty changed files is a soft signal**, not a limit: at that size, say in the description
  why the change is still one idea. Generated output does not count toward it — the
  contract, test snapshots, `pnpm-lock.yaml`.
- **Two hundred files is the hard ceiling**, and a sweep that genuinely exceeds it (a
  rename, a linter migration, a regeneration) says so in its title and description rather
  than being split into parts that do not stand alone.

An earlier proposal capped a commit at ten files. It is recorded here as rejected so it is
not reintroduced: it would have forced the DTO rename above into five commits, four of them
broken, while leaving the thousand-line generated file unexamined.

## Repo-style preflight

Before proposing a commit header:

1. Inspect the actual diff and identify the primary behaviour change.
2. Choose the narrowest valid app/package scope.
3. Use `test` for test-only behaviour, `docs` for documentation-only changes, and `chore`
   only when no user/package behaviour changes.
4. Do not copy issue titles mechanically.
5. If any workspace's behaviour changed, ensure a changeset exists — see "Changesets" above.

## Mechanical enforcement

- Use `pnpm commit` for the interactive wizard.
- Commitlint validates the header through Lefthook.
- Header limit is 72 characters; body lines stay within the repository's 100-column style.
- Never bypass the hook merely to land a malformed message.
- Size is reviewed, not hooked. A pre-commit file-count check would fire on exactly the
  sweeps that are legitimately large and never on the one-file diff that needs the most
  attention, so the ceiling above is a review instruction. What a hook can check is the
  claim that each commit stands alone: `git rebase --exec 'pnpm lint && pnpm check-types'`
  over the branch's range, run before opening the PR.
