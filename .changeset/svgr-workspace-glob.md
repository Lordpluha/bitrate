---
'@bitrate/svgr': patch
---

Workspace package lookup honours the pnpm pattern instead of widening it.

`apps/*` was rewritten to `apps/**` before globbing, which made the search walk the whole tree
rather than the package directories pnpm means by that pattern — `node_modules` included, and this
workspace uses the hoisted linker, so those hold real `package.json` files. The first name match
won, so a nested copy of a package could be returned in place of its source.

The rewrite also replaced only the first `*`, which CodeQL flagged; honouring the pattern verbatim
removes both problems rather than papering over one. Verified by regenerating the icon components:
63 produced, `@bitrate/ui-react` builds.
