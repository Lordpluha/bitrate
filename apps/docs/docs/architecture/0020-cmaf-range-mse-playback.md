# ADR-0020: Single-file CMAF + Range index + MSE for audio playback

Status: Accepted

Date: 2026-08-11

## Context

The web player streams audio through HLS (`hls.js`, ~135 storage objects per track,
every 4-second segment proxied through NestJS) plus a progressive Opus fallback and a
dead WebSocket transport. The HLS cost is paid in full while its only real benefit —
adaptive bitrate — is never used: `applyNetworkAwareHlsQuality()` clamps the level once
at startup from `navigator.connection` and never revisits it.

Three replacement variants were designed and compared in `shemas/player-veriants.drawio`.
The decisive question turned out not to be "segments or whole file" but **who controls
the buffer**. With a plain `<audio>` element the browser owns buffering, download speed
can only be inferred from `buffered` growth, and switching quality means re-downloading a
second file from the current position — precisely when the network is already struggling.

Two assumptions had to hold before committing to the chosen variant, because neither is
recoverable late:

1. FFmpeg must produce **byte-identical fragment boundaries** across renditions.
2. A browser must accept fragments from **different renditions** in one `SourceBuffer`
   without a gap.

## Decision

Encode **one fragmented-MP4 (CMAF) file per bitrate**, index it by byte range, and drive
playback from a first-party MediaSource loader with our own ABR.

**Encoding** — `convertAudioToCmaf` in `@spotify/converter` runs FFmpeg **once** with one
`-map 0:a:0` output per bitrate, so the source decodes a single time and all renditions
share fragment boundaries:

- `-movflags +cmaf+global_sidx` — CMAF-compliant fMP4 with the index at the front.
  `+frag_keyframe+empty_moov` alone does **not** write a `sidx`.
- `-ar 48000 -ac 2` pinned on every rendition, so a fragment from one track is
  interchangeable with another.
- `-frag_duration` derived from **whole AAC frames**: 192 frames x 1024 samples / 48 kHz
  = 4.096 s exactly. A fractional target (e.g. plain "4 seconds" = 187.5 frames) lets
  FFmpeg round per rendition and the fragments stop lining up.

**Indexing** — `buildFragmentIndex` parses the `sidx` into
`[startTicks, durationTicks, offset, length]` per fragment.
`assertAlignedRenditions` fails the job when boundaries diverge, so a track never reaches
`READY` in a state that cannot be spliced.

**Manifest contract** (`version: 1`):

| Field | Meaning |
|---|---|
| `timescale` | ticks per second, 48000 |
| `durationTicks` | total track duration |
| `renditions[].initRange` | `ftyp`+`moov` only — **`sidx` is excluded** |
| `renditions[].fragments` | `[startTicks, durationTicks, offset, length]` |

Byte ranges are **inclusive on both ends**, matching HTTP `Range`. The `sidx` range and
the trailing `mfra` box stay server-side and are never sent to the browser.

`initRange` is **computed per file, never hardcoded**: FFmpeg 6.1 emits a 709-byte
`ftyp`+`moov` while FFmpeg 7.0.2 emits 708 for the same input.

**Playback** — one `MediaSource` with a single `SourceBuffer`
(`audio/mp4; codecs="mp4a.40.2"`), a strictly sequential `appendBuffer` queue, a buffer
window trimmed behind the play head, and quality decided per fragment. Devices without
MSE (iPhone before iOS 17.1 / Safari 17.1 `ManagedMediaSource`) play the **same file**
natively through `<audio>`; only adaptivity is lost.

### Verification performed before accepting

Both assumptions were measured, not assumed, on a 60 s 48 kHz stereo source:

- **Boundaries.** 128/192/320 kbps each produced 15 fragments, timescale 48000, identical
  `startTicks` and `durationTicks` on every fragment. Init segments differ in exactly
  **4 bytes** — the `maxBitrate`/`avgBitrate` fields in `esds`; the AudioSpecificConfig is
  byte-identical.
- **Splicing.** In Chromium, five append plans — baseline, `320→192→320` with and without
  re-appending init, an emergency `320→128` drop, and alternating renditions every
  fragment — each produced **one continuous buffered range** and advancing playback.

Splicing therefore works even without re-appending the init segment, but the loader
re-appends it on every rendition change anyway: it costs ~709 bytes, it is what the MSE
specification requires, and relying on the 4-byte coincidence would fail in a
browser-specific and hard-to-reproduce way.

## Consequences

**Easier**

- 3 storage objects per track instead of ~135; no playlists, no `hls.js` (~200 KB).
- Seeking is one Range request resolved through the index, on both the MSE and the native
  path.
- Bandwidth is measured in real bytes and milliseconds, because the player issues the
  requests.
- Quality changes cost exactly one fragment and duplicate zero traffic.
- Signed storage URLs can be refreshed between fragments, mid-track, unnoticed.
- The Opus-versus-AAC codec split between the progressive and HLS paths disappears —
  a track now exists in one codec.

**Harder / mandatory**

- A first-party loader is now ours to maintain, including MSE failure modes:
  `QuotaExceededError` on `appendBuffer` means trim the window and retry, not fall back.
- Every rendition set must pass `assertAlignedRenditions` before a track is `READY`.
- The manifest is versioned; changing fragment semantics requires bumping `version`.

**Out of scope**

- Opus. MSE in Safari cannot decode it, so AAC-LC is the single codec. A second Opus
  rendition gated on `isTypeSupported` remains possible later.
- Adaptive bitrate on iPhone before iOS 17.1 — those devices get the native path.

The HLS pipeline stays in place, unused, until the CMAF path is proven in production; it
is then removed together with `AudioGateway` and `useProgressiveAudioStreaming`.

## Alternatives considered

- **Variant A — keep HLS.** Pays the full cost of HLS (135 objects, double decode, every
  segment proxied through Node, `hls.js` in the bundle) for an ABR that the code never
  engages. Rejected as paying for an unused benefit.
- **Variant B — progressive file per bitrate with a custom ABR.** The browser owns the
  buffer, so the target buffer length is unenforceable; throughput can only be inferred
  from `buffered` growth; a quality switch re-downloads the file from the current position
  exactly when the network is degrading; and Ogg has no index, making seeks a binary
  search. Its own critique block concluded these are structural, not tunable. Rejected.
