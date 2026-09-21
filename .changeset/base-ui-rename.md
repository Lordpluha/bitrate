---
'@bitrate/ui-react': minor
---

Migrated the Avatar, DropdownMenu, HoverCard, Popover, Select, Separator, and Tooltip primitives from the deprecated `@base-ui-components/react@1.0.0-rc.0` to its renamed, now-stable successor `@base-ui/react@1.8.0`, switching each component to the package's per-primitive subpath imports (e.g. `@base-ui/react/select`). The primitives' anatomy was unchanged across the rename, so no component API changed; a handful of internal DOM details these primitives render for accessibility (portal focus guards, generated element `id`s, and new `data-base-ui-*` trigger markers) moved to the upstream 1.8 implementation, and the affected snapshot baselines were updated to match.
