# @bitrate/svgr

## 2.0.1

### Patch Changes

- e97e6c7: A code-health pass fixed bugs found in review and removed duplicated and wasteful work across
  the stack. The API created OAuth accounts atomically, deleted replaced avatars, closed storage
  streams on failure, kept muted notification categories from crowding out releases, reported
  playlist position races as conflicts and re-checked websocket sessions on a timer instead of on
  every message, with narrower reads and shared admin take-down, OAuth and ranking helpers. The
  landing page gave every scene its own particle layout again and stopped per-frame style reads;
  the player stopped rewriting the store on every progress tick and mutation errors were toasted
  once. The admin panel told load failures apart from missing records and kept the page when
  navigating search history; the artist dashboard themed its verify-email page and refreshed only
  the caches a release write changed. The carousel released its re-init listener and honoured
  consumer gaps, the player engine ignored superseded play requests, and the MP4 indexer and SVG
  colour detection did less work per file.

## 2.0.0

### Major Changes

- adc2b7c: Every workspace package moved from the `@spotify/` namespace to `@bitrate/`, the first step of
  the rebranding described in `apps/docs/docs/brand/`. Imports, `--filter` targets in `Taskfile.yml`,
  `lefthook.yml`, and the CI workflows, and the agent-layer rules under `.claude/` were updated to
  match. Documentation that narrates the removed `@spotify/tokens` and `@spotify/tokens-generator`
  packages kept the original names, because those packages never existed under the new namespace.

### Patch Changes

- adc2b7c: The project is now named Bitrate everywhere it names itself: repository metadata, README,
  CONTRIBUTING, the Docusaurus site, the agent layer under `.claude/`, and the GitHub URLs,
  which now point at `github.com/Lordpluha/bitrate`. `PRODUCT.md` no longer describes the brand
  as undecided scaffolding — it records Bitrate, the purple primary, and the three themes as
  settled, and points at `apps/docs/docs/brand/` for the rest.

  The Expo app changed its display name, slug, deep-link scheme, and bundle identifier
  (`com.lordpluha.spotifymobile` to `com.lordpluha.bitratemobile`), so existing installs and
  deep links do not carry over.

  `@bitrate/svgr`'s path-resolution tests derived the workspace root from one developer's home
  directory, so they only passed on that machine and broke the moment the checkout was renamed.
  They now derive it from the test file's own location.

- 27a4056: The icon generator formats its output without going through a shell.

  `execSync` built the Biome command by interpolating the output directory into a string, so the
  path was parsed by a shell before reaching the tool. It is `execFileSync` with the directory as its
  own argument now — never parsed, so no quoting in a path can change what runs. The directory comes
  from workspace configuration rather than a user, which is why this was latent rather than
  exploitable, but a build tool that runs on every developer's machine is a poor place to rely on
  that distinction holding.

- 195a6a9: Workspace package lookup honours the pnpm pattern instead of widening it.

  `apps/*` was rewritten to `apps/**` before globbing, which made the search walk the whole tree
  rather than the package directories pnpm means by that pattern — `node_modules` included, and this
  workspace uses the hoisted linker, so those hold real `package.json` files. The first name match
  won, so a nested copy of a package could be returned in place of its source.

  The rewrite also replaced only the first `*`, which CodeQL flagged; honouring the pattern verbatim
  removes both problems rather than papering over one. Verified by regenerating the icon components:
  63 produced, `@bitrate/ui-react` builds.
