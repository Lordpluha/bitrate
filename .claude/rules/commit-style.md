---
name: commit-style
description: Conventional Commits without a ticket prefix — the type and scope vocabulary, summary rules, when a change needs a changeset and which bump it gets, branch naming, and the mechanical enforcement through commitlint and Lefthook. Use whenever composing a commit message, naming a branch, or deciding whether a change needs a changeset.
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

The `sp-*-developer` agents and `sp-worker` (and `/sp-implement` when working in-session)
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
