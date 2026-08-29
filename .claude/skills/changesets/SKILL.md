---
name: changesets
description: Changesets versioning conventions for this monorepo — when a change needs one, the bump rubric, writing the file directly instead of using the wizard, multi-workspace changes, and the release workflow that consumes them. Use when adding a changeset, deciding a bump type, or when a PR is flagged for a missing changeset.
license: MIT
metadata:
  author: lordpluha
  version: "1.0.0"
---

# Changesets — per-workspace versioning

Every workspace is `"private": true` — nothing publishes to npm — but the repo still uses
Changesets for per-workspace versioning and `CHANGELOG.md` generation. `.changeset/config.json`
sets `access: "restricted"`. The `Release` workflow (`.github/workflows/release.yml`) consumes
pending changesets on pushes to `develop`.

## When you need one

**Yes** — the change is user- or consumer-visible in an app or package: a feature, a bug fix,
an endpoint or component contract change, a behaviour change, a dependency bump that alters
behaviour.

**No** — pure docs, `.claude/` rules, test-only, or chore diffs with no behaviour change.
Infrastructure and CI changes are usually `no` unless they alter an app's build output.

If you are unsure, ask what a *consumer* of that workspace would notice. Nothing? No
changeset.

## Write the file, don't run the wizard

`pnpm changeset` is an interactive wizard for humans. An agent writes the markdown directly:

```markdown
---
'@spotify/web-player': minor
'@spotify/api': patch
---

Added a Range-header audio streaming endpoint and wired the player's seek bar to it, so
scrubbing no longer re-downloads the whole track.
```

File: `.changeset/<short-kebab-slug>.md` — two to four words, matching the existing files'
style (`bright-audio-streams.md`).

The body is **one paragraph, past tense, describing the user/consumer-visible change** — it
lands verbatim in `CHANGELOG.md`, so write it for someone reading the changelog months later,
not for the reviewer of this PR. "Fixed the thing" is useless there; name what was broken and
what now happens.

## Bump rubric

| Bump | When |
|---|---|
| `patch` | Bug fix, internal refactor with no behaviour change, dependency bump with no API change |
| `minor` | New feature, new endpoint, new component, backward-compatible behaviour change |
| `major` | Breaking change — removed/renamed export, changed endpoint contract, removed prop |

`major` is rare in a repo where nothing publishes, but record it honestly anyway: the
changelog is the record of severity, and understating a breaking change is how a consumer
inside the monorepo gets surprised.

## Multi-workspace changes

A change touching several workspaces gets **one changeset listing all of them**, each with
its own bump — not one file per workspace:

```markdown
---
'@spotify/api': minor
'@spotify/contracts': patch
'@spotify/web-player': minor
---
```

List every workspace whose *behaviour* changed. A workspace you only reformatted does not
belong there.

**A changed API contract usually means three entries**: `@spotify/api` (the endpoint),
`@spotify/contracts` (the regenerated types), and each frontend that consumes it.

## Gotchas

- **A missing changeset is caught late.** `Quality-5` in
  `.claude/rules/architecture-checklist.md` is the review gate; nothing fails at commit time.
  Write it as part of the change, not as a follow-up.
- **Naming a workspace that did not change** inflates its version and pollutes its changelog.
- **The slug is not the summary.** `.changeset/fix-thing.md` with an empty body produces an
  empty changelog entry.
- **Do not edit `CHANGELOG.md` or `package.json` versions by hand** — the release workflow
  owns both. Hand edits get overwritten and confuse the next version bump.

## When this skill does not cover it

Do not guess an API from memory. In order:

1. **Read the installed version.** `node_modules/@changesets/cli` is what this repo actually runs; the
   docs site describes the latest release, which may not be it.
   ```bash
   node -p "require('@changesets/cli/package.json').version"
   ```
2. **Then the official docs:** https://github.com/changesets/changesets/tree/main/docs — match them to the version you just read.
3. **If both are silent, say so in your report** rather than inventing an API. Here that
   matters because most guidance assumes a publishing repo; every workspace here is private.

## Related

- `.claude/rules/commit-style.md` § "Changesets" — the canonical rule.
- `.claude/rules/architecture-checklist.md` — Quality-5, the review gate.
- `turborepo` skill — the workspace graph being versioned.
