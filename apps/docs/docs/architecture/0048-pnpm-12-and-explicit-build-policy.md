# ADR-0048: pnpm 12.6.0 and an explicit build policy

Status: Accepted

Date: 2026-09-28

## Context

[ADR-0026](./0026-pnpm-11-settings-in-workspace-yaml.md) decided to move to pnpm 11 and to make
`pnpm-workspace.yaml` the only home for pnpm settings. The move was recorded but never applied:
`package.json` still pinned `pnpm@10.30.3` and carried the `pnpm` block (`overrides`,
`onlyBuiltDependencies`, `peerDependencyRules`), `.npmrc` still carried `autoInstallPeers` and the
hoist patterns, and eight Dockerfiles still pinned `10.27.0` or `10.30.3`.

That ADR rejected `pnpm@12.3.1` because pnpm 12 was a week old, had not become the `latest`
dist-tag, and removed install flags without documenting them. Both facts have changed: `12.6.0` is
the `latest` dist-tag, and its release notes list the breaking changes. Those that reach this
repository are the ones pnpm 11 already made, plus two new failures that pnpm 10 did not have.

## Decision

Pin `pnpm@12.6.0` everywhere the version appears: `package.json`, the `setup-node-pnpm` composite
action, and every Dockerfile. Apply the settings move that ADR-0026 decided: `overrides`,
`allowBuilds`, `peerDependencyRules`, `nodeLinker`, `autoInstallPeers` and `publicHoistPattern`
live in `pnpm-workspace.yaml`, and the `pnpm` block is removed from `package.json`. ADR-0026's
decision about where settings live stands. Only its pinned version is superseded.

`allowBuilds` is a complete policy. pnpm 12 fails the whole install with
`ERR_PNPM_IGNORED_BUILDS` when a dependency has a build script that the policy neither allows nor
denies. `lmdb` and `nx` were never built under pnpm 10, so they are set to `false`. A new
dependency with a build script must be added to the map with a deliberate `true` or `false`.

`turbo.json`'s `globalDependencies` lists `pnpm-workspace.yaml` next to `.npmrc`, so a cache is not
reused across a change to `overrides` or `allowBuilds`.

`.npmrc` is kept for now. This change could not inspect it, so it does not delete it. Its pnpm
settings are inert under pnpm 12 and duplicated in `pnpm-workspace.yaml`. It can go once someone
has confirmed that it holds nothing but those settings.

## Consequences

- The first install with pnpm 12 in an existing checkout rebuilds `node_modules`. In a non-TTY
  context that aborts with `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR` unless `CI` is set.
- `pnpm-lock.yaml` gains a leading YAML document (`packageManagerDependencies`) that records the
  pinned pnpm. The rest of the lockfile is unchanged, and a frozen install accepted it. That is
  the check that the moved `overrides` and settings match.
- pnpm 12 rejects an unknown key in `pnpm-workspace.yaml` (`ERR_PNPM_UNRECOGNIZED_WORKSPACE_SETTINGS`)
  when the pinned version is honored, so a misspelled setting now fails instead of being ignored.
- `pnpm install --frozen-lockfile false` is no longer accepted. Use `--no-frozen-lockfile`.
- The `pnpm` block in `package.json` and pnpm settings in `.npmrc` do nothing. There is no
  mechanical guard against adding them again.

## Alternatives considered

- **`pnpm@11.25.0`, as ADR-0026 decided** — not chosen. It needs the same settings move and the
  same `allowBuilds` policy, and it is no longer the current release.
- **Stay on `pnpm@10.30.3`** — not chosen: the version drift across `package.json`, CI and
  containers is a correctness problem regardless of the major version.
- **Bump the version without moving the settings** — rejected for the reason ADR-0026 gives: the
  install stays green while `overrides` and `allowBuilds` are silently inert.
