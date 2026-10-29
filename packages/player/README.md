# @bitrate/player

The Bitrate audio player as a framework-free custom element, `<bitrate-player>`, built with
Svelte 5. Hosts in any framework mount the tag, set its properties and listen to its events;
the element owns playback. See ADR-0039 and ADR-0063 in `apps/docs/docs/architecture/`.

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

| Part                       | Attributes                                                                 |
| -------------------------- | -------------------------------------------------------------------------- |
| `bitrate-player-cover`     | `size="sm\|md\|lg"`, `lg` fills its box                                    |
| `bitrate-player-meta`      | — title and artist                                                         |
| `bitrate-player-transport` | `controls`: any of `shuffle prev play next repeat`                         |
| `bitrate-player-seek`      | `variant="full\|stacked\|thin"`: time either side, under the rail, or none |
| `bitrate-player-volume`    | — mute and volume                                                          |
| `bitrate-player-actions`   | `controls`: any of `like pip queue expand`                                 |
| `bitrate-player-quality`   | — shows only with more than one rendition                                  |
| `bitrate-player-error`     | — the playback error, as `role="alert"`                                    |

Without `controls` a part allows all of its buttons; the callback rule above still applies.
Tag names are exported as `BITRATE_PLAYER_PART_TAG`. A part outside a player renders nothing.

## Styling

The element uses your design tokens (`--color-foreground`, `--color-surface`,
`--color-primary`, …) through the shadow boundary. These properties tune a layout or a part:

| Property                                                               | Default                                                         |
| ---------------------------------------------------------------------- | --------------------------------------------------------------- |
| `--bitrate-player-background`                                          | layout's own                                                    |
| `--bitrate-player-radius`                                              | `0.75rem` (`mini`, `floating`)                                  |
| `--bitrate-player-cover-size`                                          | `2.5rem` / `3.5rem` / `100%` by `size`                          |
| `--bitrate-player-cover-radius`                                        | `0.25rem`                                                       |
| `--bitrate-player-title-size`, `--bitrate-player-artist-size`          | `0.875rem`, `0.75rem`                                           |
| `--bitrate-player-play-size`, `--bitrate-player-play-icon-scale`       | `2rem`, `1`                                                     |
| `--bitrate-player-icon-button-size`, `--bitrate-player-icon-scale`     | `2rem`, `1`                                                     |
| `--bitrate-player-transport-gap`                                       | `1rem`                                                          |
| `--bitrate-player-track-height`                                        | `0.25rem`                                                       |
| `--bitrate-player-track-color`, `--bitrate-player-accent`              | border colour, text colour (rail rest, fill and active toggles) |
| `--bitrate-player-thumb-size`, `--bitrate-player-thumb-color`          | `0.75rem`, text colour                                          |
| `--bitrate-player-thumb-opacity`                                       | `0` (shown on hover/focus)                                      |
| `--bitrate-player-play-background`, `--bitrate-player-play-foreground` | text colour, background colour                                  |
| `--bitrate-player-time-size`, `--bitrate-player-time-min-width`        | `0.75rem`, `2.5rem`                                             |
| `--bitrate-player-floating-min-height`                                 | `12rem`                                                         |
| `--bitrate-player-scrim`, `--bitrate-player-on-media`                  | dark scrim, white text (`floating`)                             |

For anything else, inner nodes expose `::part()` names: `layout`, `cover`, `meta`, `title`,
`artist`, `transport`, `seek`, `volume`, `actions`, `quality`, `error`.

## Streaming mode

Set `streaming` and the element streams CMAF with adaptive bitrate over two media elements,
prefetching what comes next (ADR-0064). The host keeps its queue and tells the element what
plays now and what follows, each keyed per play:

```ts
player.streaming = {
  resolveManifest: (trackId) => api.manifest(trackId),
  fetchRange: ({ trackId, bitrate, range, signal }) =>
    api.range({ trackId, bitrate, range, signal }),
  // without MSE, or once the loader fails, the element plays this file natively
  renditionUrl: ({ trackId, bitrate }) => `/api/v1/tracks/${trackId}/cmaf/${bitrate}`,
  positions: sessionPositions, // optional: resume per play key
  isConstrained: () => navigator.connection?.saveData === true, // optional
  crossOrigin: 'use-credentials',
}
player.source = {
  key: 'mix:t1:1',
  trackId: 't1',
  duration: 182, // optional: shown until the media loads
  startTime: 64, // optional: a restored position, shown and resumed
}
player.next = { key: 'mix:t2:2', trackId: 't2' }
player.addEventListener('ended', ({ detail }) => {
  // move the queue on, then set source to what was next: the element switches instantly
})
```

`streaming.legacy` and `source.progressiveUrl` still work but are deprecated: ADR-0065 removes
the HLS and progressive formats. `seek(seconds)`, `volume`, `muted` and the read-only `state`
complete it; `statechange`
(`detail`: status, key, time, duration, volume, bitrate, error) fires on every change. Call
`configureCmafEngine({ storage, debugByDefault })` from `@bitrate/player/engine` once to keep
the measured bandwidth between tracks.

In streaming mode the element also:

- starts the prefetched `next` 50 ms before the current track ends, so there is no gap;
- offers **Auto** and the CMAF ladder in the quality select; a manual pick holds for the
  following tracks at their closest rendition at or below it (`state.renditions`,
  `state.autoBitrate`);
- with the `media-session` attribute, shows the track on the lock screen and in the OS media
  controls and answers play/pause, seek, ±10 s and previous/next. Set it on the one element
  that plays; a mirror never claims the session.

## Labels

Every accessible name and visible label can be translated: set `labels` to any subset, the
rest keep their English defaults. A mirror uses the labels of the element it mirrors.

```ts
player.labels = {
  play: (title) => `Відтворити «${title}»`,
  repeat: { off: 'Повторювати плейлист' },
}
```

## Mirrors

`mirror.mirror = player` makes a second element render and control the first, with no media
of its own — one element plays, every visible surface mirrors it:

```html
<bitrate-player chrome="none"></bitrate-player>
<!-- plays -->
<bitrate-player chrome="mini"></bitrate-player>
<!-- .mirror = the one above -->
```

## Events

`play`, `pause`, `ended`, `error` (`detail: { code, message }`), `statechange` and
`qualitychange` (`detail: { bitrate }`), all bubbling and composed. In streaming mode `ended`
carries `{ key }`. `element.play()`, `element.pause()` and `element.seek()` drive playback
from the host.
