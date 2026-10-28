---
'@bitrate/player': minor
---

Added layout variants and composable parts. `<bitrate-player chrome="…">` now renders `bar` (the default, unchanged), `mini`, `expanded`, `floating` or `none`, and each layout shows only the controls it allows and the host has a callback for. Hosts can also build their own layout from new part elements (`bitrate-player-cover`, `-meta`, `-transport`, `-seek`, `-volume`, `-actions`, `-quality`, `-error`) that read the nearest player, with `controls` attributes to narrow their buttons. Sizes and colours are tunable through `--bitrate-player-*` custom properties and `::part()`.
