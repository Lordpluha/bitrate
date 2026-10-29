# ADR-0065: One stored audio format — CMAF AAC, 10-second fragments, HTTP Range only

Status: Accepted — supersedes the "Transitional rollout state" of
[ADR-0020](./0020-cmaf-range-mse-playback.md) and the legacy adapter of
[ADR-0064](./0064-player-owns-streaming-and-prefetch.md)

Date: 2026-10-29

## Context

[ADR-0020](./0020-cmaf-range-mse-playback.md) chose CMAF + Range + MSE but kept the old
formats as a fallback until production telemetry proved the new path. As a result every
upload is encoded three times and served three ways:

| Artifact | Codec | Route | Consumer |
|---|---|---|---|
| Progressive `.opus`, one FFmpeg pass per bitrate | Opus | `GET /tracks/stream/:id` | admin, last fallback |
| HLS fMP4, 4 s segments (~135 objects) | AAC | `GET /tracks/stream/:id/hls/*` | `hlsLegacyAdapter` + hls.js |
| CMAF, one file per bitrate | AAC-LC | `GET /tracks/:id/manifest`, `GET /tracks/:id/cmaf/:bitrate` | `@bitrate/player` |

The legacy formats are coupled: the HLS root is resolved through the Opus `TrackFile` row.
All three routes are guarded only by `@UserAuth()` and throttling, so any per-play rule put on
one route is bypassed through another — `/stream/:id` returns the whole file. Planned
listening limits and Bitrate Connect need exactly one place where audio bytes leave the API.
`AudioGateway` (Socket.io) is still registered, but no client imports `socket.io-client`.

Production holds **no tracks**. The telemetry gate in ADR-0020 protected existing listeners
and existing files; there are none.

The owner also asked whether Opus over Range or over WebSocket would be a better single
format than CMAF AAC. That is three separate choices — codec, container and transport — and
each is answered below.

## Decision

**One stored format.** Every track exists only as CMAF (fragmented MP4) with AAC-LC
(`mp4a.40.2`), 48 kHz, stereo, one file per bitrate. The ladder stays 128/192/320 kbps capped
at the source bitrate (`getTargetBitrates`), encoded in **one** FFmpeg run so renditions share
fragment boundaries, and `assertAlignedRenditions` still gates `READY`. The uploaded master is
kept in object storage so a track can be re-encoded without a new upload.

**Fragment length: 469 AAC frames = 10.005 s** (469 x 1024 / 48000 = 10.00533 s). ADR-0020's
rule stands: a fragment is a whole number of AAC frames, otherwise renditions round
differently and stop lining up; exactly 10 s is 468.75 frames. `DEFAULT_FRAGMENT_FRAMES` in
`@bitrate/converter` changes from 192 to 469. The manifest already carries every fragment's
duration, so its semantics and `version: 1` do not change. Player thresholds tuned for 4 s
granularity — `UPGRADE_MIN_BUFFER` (12 s), `PREFETCH_BUFFER_SECONDS` (8 s),
`CONSTRAINED_START_BUFFER_SECONDS` (3 s) — are restated for 10 s steps in the same change,
since the buffer now grows a whole fragment at a time.

**One delivery path.** Listener audio leaves the API only through `GET /tracks/:id/manifest` and
`GET /tracks/:id/cmaf/:bitrate` with HTTP `Range`. The one exception is the staff-only
`GET /admin/tracks/:id/audio`: it already serves CMAF renditions behind an operator permission
and exists for moderation, not listening, so listener rules do not apply to it.
Removed together:

- the progressive Opus and HLS encodes (`prepareVariants`, `generateHls`, `validateHls`) and
  their converter entry points when nothing else uses them;
- `GET /tracks/stream/:id`, `GET /tracks/stream/:id/hls/*`, their service methods, storage-key
  helpers and contracts;
- `AudioGateway`, `UsersAuthWsGuard` and the API's Socket.io dependencies — it is the only
  gateway, and Bitrate Connect designs its own command channel when it needs one;
- hls.js, `hlsLegacyAdapter` and the HLS utilities in web-player;
- `Track.playbackVersion` and the manifest filter on it; the CMAF index columns of
  `TrackFile` become required.

A browser without MSE plays the same `.m4a` natively through `<audio>`, as ADR-0020 already
specified — that replaces `streaming.legacy`. Admin's `resolveSource` points at a CMAF
rendition instead of `/stream/:id`.

**Removal is immediate.** No re-encode backfill and no telemetry gate. A migration deletes the
non-CMAF `TrackFile` rows and the processing attempts on removed steps, marks tracks left
without CMAF renditions `FAILED` with a re-upload reason, then drops `playbackVersion` and the
removed `TrackProcessingStep` values, so every environment migrates the same way instead of
needing a database reset. Legacy objects in development and preprod buckets are removed by
resetting the bucket. Before the production deploy the track count is confirmed to be zero.
Compatibility is proven by the browser test matrix — Chromium, Firefox, WebKit and the no-MSE
path — instead of production telemetry.

**WebSocket is a control channel, never an audio transport.** Bitrate Connect may use a socket
for commands (pause, transfer, session revoked); bytes always go over HTTP.

**Extension points, not built now:**

- An HLS playlist **generated** from the stored fragment index (`EXT-X-MAP` +
  `EXT-X-BYTERANGE` pointing at the same files) for native players — AVPlayer, ExoPlayer,
  Chromecast, AirPlay — and for iPhones without `ManagedMediaSource`. No extra encode or
  storage.
- Opus as a second rendition group inside the same container, selected per track through
  `MediaSource.isTypeSupported`. AAC and Opus do not splice in one `SourceBuffer`, so the
  player picks one group for the whole track.
- A lossless tier (FLAC or ALAC in fMP4) as its own group, not an ABR rung.

**Out of scope:** advertising (deferred by the owner), DRM, loudness normalization, and
offloading byte serving to nginx. The per-play access token that listening limits and
Bitrate Connect build on is a separate decision; this record only makes it enforceable by
leaving one path.

## Consequences

**Easier**

- One FFmpeg run and three storage objects per track instead of N+2 runs and ~140 objects.
- One route to authorize, throttle and observe; a future per-play check covers all playback.
- 2.5 times fewer requests per minute of listening than 4 s fragments, so each request can
  afford an access check.
- Native clients can be added later without a new format.

**Harder**

- Start and seek wait for a whole fragment: about 160 KB at 128 kbps instead of about 65 KB,
  roughly 1.3 s instead of 0.5 s at 1 Mbit/s and 3.2 s instead of 1.3 s at 400 kbit/s
  (calculated, not measured).
- Adaptive bitrate decides every 10 s, so it reacts more slowly to a degrading network, and a
  Bitrate Connect handoff downloads one full fragment before sound.
- Opus' efficiency below 96 kbps is given up until the Opus group is added.
- MSE with AAC in the Tauri webview on Linux (WebKitGTK, dependent on GStreamer plugins) is
  unverified. It must be checked before the fallback is removed; if it fails, the Linux
  desktop app plays the same file natively without adaptivity.

**Mandatory**

- Renditions must stay aligned; the 469-frame value is changed only by a new record.
- No new listener audio route may be added beside `/cmaf` without going through the same
  access control; the staff preview stays operator-only.
- Stage 1 is tracked in [#422](https://github.com/Lordpluha/bitrate/issues/422).

## Alternatives considered

- **Opus as the single codec (Ogg, WebM or fMP4).** Better quality per bit below about
  96 kbps and license-free, but our ladder starts at 128 kbps, where both codecs are near
  transparent. Apple support remains uneven: Opus long played only in CAF; Opus in MP4 is
  reported only from iOS 17 in an unofficial Apple engineer answer
  ([Apple forums](https://developer.apple.com/forums/thread/722399)); WebM Opus arrived in
  Safari 15 with playback bugs ([WebKit 238546](https://bugs.webkit.org/show_bug.cgi?id=238546),
  [WebKit 245428](https://bugs.webkit.org/show_bug.cgi?id=245428)); Ogg playback in Safari 18.4
  is reported by third parties and disputed by others. Opus in Safari MSE could not be
  confirmed, and splicing Opus renditions was never measured. Apple clients would still need
  AAC, which means two formats again.
- **Progressive Ogg Opus + Range with a custom ABR.** ADR-0020's Variant B: Ogg has no index,
  so a seek is a bisection over the file; the browser owns the buffer; a quality switch
  re-downloads another file from the current position when the network is already degrading.
- **WebSocket transport.** It does not replace the container — MSE still needs fMP4 or WebM —
  and it gives up HTTP caching, `Range`, per-request retries and access logs. It adds state:
  memory per listener in a 512 MB API process, sticky routing when scaled, reconnects on a
  Wi-Fi to cellular switch and our own flow control. Native players cannot consume it.
  `AudioGateway` already existed and no client uses it.
- **Keep HLS segments.** About 135 objects and a second encode per track for an adaptivity the
  first-party loader already provides.
- **Keep 4.096 s fragments.** Faster start, seek and ABR reaction, at 2.5 times the request
  count. The owner chose 10 s.
- **DASH.** No native playback on iOS; a generated byte-range HLS playlist reaches the same
  native clients from the same files.
- **Keep the legacy formats until telemetry, as ADR-0020 planned.** That protected existing
  listeners and files; production has none.
