# @bitrate/player

The Bitrate audio player as a framework-free custom element, `<bitrate-player>`, built with
Svelte 5. Hosts in any framework mount the tag, set its properties and listen to its events;
the element owns playback. See ADR-0039 and ADR-0062 in `apps/docs/docs/architecture/`.

```ts
import '@bitrate/player' // registers <bitrate-player> and its part elements

const player = document.querySelector('bitrate-player')
player.renditions = [{ bitrate: 320, label: '320 kbps' }]
player.resolveSource = async ({ bitrate }) => `https://cdn.example/${bitrate}.m4a`
player.onNext = () => queue.next()
```

Set array and callback properties as DOM properties, not attributes, and only after the element
is defined (`await defineBitratePlayer()` or `customElements.whenDefined('bitrate-player')`).

## Variants: `chrome`

```html
<bitrate-player chrome="mini"></bitrate-player>
```

| `chrome`        | Layout                                           | Controls it can show               |
| --------------- | ------------------------------------------------ | ---------------------------------- |
| `bar` (default) | Horizontal desktop bar                           | everything                         |
| `mini`          | Compact mobile row with a hairline of progress   | Play, Next                         |
| `expanded`      | Full-screen now-playing view                     | everything except Open full player |
| `floating`      | Picture-in-picture window, cover art as backdrop | Previous, Play, Next               |
| `none`          | Nothing; only the parts you compose              | —                                  |

A control renders only when the layout includes it **and** you set its callback: no `onNext`,
no Next button, in any layout. Play needs no callback. An unknown `chrome` falls back to `bar`.

## Composing your own layout

Put part elements inside `<bitrate-player>` and the built-in layout steps aside. Every part
reads the nearest player; your own markup and CSS place them.

```html
<bitrate-player class="card">
  <bitrate-player-cover size="lg"></bitrate-player-cover>
  <bitrate-player-meta></bitrate-player-meta>
  <bitrate-player-seek variant="thin"></bitrate-player-seek>
  <bitrate-player-transport controls="prev play next"></bitrate-player-transport>
  <bitrate-player-actions controls="like queue"></bitrate-player-actions>
  <bitrate-player-error></bitrate-player-error>
</bitrate-player>
```

| Part                       | Attributes                                             |
| -------------------------- | ------------------------------------------------------ |
| `bitrate-player-cover`     | `size="sm\|md\|lg"`, `lg` fills its box                |
| `bitrate-player-meta`      | — title and artist                                     |
| `bitrate-player-transport` | `controls`: any of `shuffle prev play next repeat`     |
| `bitrate-player-seek`      | `variant="full\|thin"`, `thin` hides the time readouts |
| `bitrate-player-volume`    | — mute and volume                                      |
| `bitrate-player-actions`   | `controls`: any of `like pip queue expand`             |
| `bitrate-player-quality`   | — shows only with more than one rendition              |
| `bitrate-player-error`     | — the playback error, as `role="alert"`                |

Without `controls` a part allows all of its buttons; the callback rule above still applies.
Tag names are exported as `BITRATE_PLAYER_PART_TAG`. A part outside a player renders nothing.

## Styling

The element uses your design tokens (`--color-foreground`, `--color-surface`,
`--color-primary`, …) through the shadow boundary. These properties tune a layout or a part:

| Property                                                           | Default                                |
| ------------------------------------------------------------------ | -------------------------------------- |
| `--bitrate-player-background`                                      | layout's own                           |
| `--bitrate-player-radius`                                          | `0.75rem` (`mini`, `floating`)         |
| `--bitrate-player-cover-size`                                      | `2.5rem` / `3.5rem` / `100%` by `size` |
| `--bitrate-player-cover-radius`                                    | `0.25rem`                              |
| `--bitrate-player-title-size`, `--bitrate-player-artist-size`      | `0.875rem`, `0.75rem`                  |
| `--bitrate-player-play-size`, `--bitrate-player-play-icon-scale`   | `2rem`, `1`                            |
| `--bitrate-player-icon-button-size`, `--bitrate-player-icon-scale` | `2rem`, `1`                            |
| `--bitrate-player-transport-gap`                                   | `1rem`                                 |
| `--bitrate-player-track-height`                                    | `0.25rem`                              |
| `--bitrate-player-floating-min-height`                             | `12rem`                                |
| `--bitrate-player-scrim`, `--bitrate-player-on-media`              | dark scrim, white text (`floating`)    |

For anything else, inner nodes expose `::part()` names: `layout`, `cover`, `meta`, `title`,
`artist`, `transport`, `seek`, `volume`, `actions`, `quality`, `error`.

## Events

`play`, `pause`, `ended`, `error` (`detail: { code, message }`) and `qualitychange`
(`detail: { bitrate }`), all bubbling and composed. `element.play()` and `element.pause()`
drive playback from the host.
