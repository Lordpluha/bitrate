---
'@spotify/web-player': patch
---

The FSD layer guard now enforces the rule it claimed to. Its restricted-import
list held exact specifiers such as `@/entities`, but `tsconfig` maps `@*` to
`./src/*`, so `@entities/Player` and any deeper path resolved while matching
nothing — the lint rule reported violations only for an import form the codebase
never uses. It now matches both alias forms at any depth.

With the guard working, seventeen genuine violations surfaced and are fixed: the
Media Source Extensions playback subsystem lived in `shared/` while importing
from `entities/Player`, and two files in `shared/hooks/` were re-export shims for
`entities/Track`. The subsystem moved into the Player entity that owns it, the
shims are gone, and its one remaining cross-entity dependency — a domain type it
used for two fields — is now a narrow type the Player entity declares itself.

Navigation, styling and settings fixes ride along: the mobile bottom bar is built
from links rather than buttons, so middle-click and open-in-new-tab work again;
the settings dropdown no longer becomes keyboard-unreachable when it is given an
empty option list; overlays share one z-index scale instead of eleven ad-hoc
values with `!important` escapes; and raw palette colours were replaced with
design tokens.
