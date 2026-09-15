---
sidebar_position: 4
title: Audio streaming
---

# Audio streaming

Playback runs on **CMAF over byte ranges, driven by MediaSource Extensions** — one
fragmented-MP4 file per bitrate, indexed by byte range, played by a first-party loader with our
own adaptive bitrate logic. See
[ADR-0020](../architecture/0020-cmaf-range-mse-playback.md) for why, and for the encoding
constraints that make renditions splice-compatible.

HLS is still served, and still documented below, but it is the **fallback for tracks encoded
before CMAF renditions existed** — not the primary path. `useManifestResolver` returns `null`
when a track has no manifest, and that is the signal to fall back.

The API produces 128, 192 and 320 kbps renditions when the source bitrate permits. All of them
come out of one FFmpeg process with fragment boundaries aligned to whole AAC frames, so a
fragment from one rendition is interchangeable with the same fragment of another — which is what
lets the player switch bitrate mid-track without a gap.

## Endpoints

The current path — a manifest describing the renditions and their fragment index, then range
requests against the rendition itself:

```text
GET /api/v1/tracks/:trackId/manifest
GET /api/v1/tracks/:trackId/cmaf/:bitrate
Range: bytes=0-1048575
```

The HLS path, retained for tracks with no CMAF renditions:

```text
GET /api/v1/tracks/stream/:trackId/hls/master.m3u8
GET /api/v1/tracks/stream/:trackId/hls/:bitrate/index.m3u8
GET /api/v1/tracks/stream/:trackId/hls/:bitrate/init_0.mp4
GET /api/v1/tracks/stream/:trackId/hls/:bitrate/segment_00000.m4s
```

All endpoints require the user access-token cookie. Cross-origin clients must send credentials.

The original whole-file endpoint remains and supports standard byte ranges:

```text
GET /api/v1/tracks/stream/:trackId?bitrate=192&format=opus
Range: bytes=0-1048575
```

## Browser playback — the HLS fallback

Everything in this section describes the fallback path. Safari uses native HLS through the media
element. Chrome, Firefox, and Chromium-based desktop clients load `hls.js` on demand after a
track is selected.

Important `hls.js` settings:

- `xhr.withCredentials = true` sends the authentication cookie;
- the active player buffers about 30 seconds;
- the standby player buffers about 12 seconds of the next track;
- `startFragPrefetch` allows loading before playback begins;
- fatal network errors restart loading at the current media time;
- fatal media errors call `recoverMediaError()`.

## Prefetch and gapless transition

The player owns two persistent `<audio>` elements:

1. The active slot plays the current track.
2. The standby slot loads the next track manifest and initial segments.
3. When the active slot ends, the standby slot starts immediately.
4. The Zustand player store advances the queue after the media switch.
5. The previous active slot becomes the new standby slot and preloads the following track.

This avoids fetching the next manifest after the current track has already ended. HTML media elements cannot guarantee sample-perfect gapless playback on every browser, but the dual-slot approach removes the normal manifest and initial-buffer delay.

## Seeking

HLS seeking is time-based. Assigning `audio.currentTime` makes `hls.js` request the segment
containing that position. Four-second segments keep seek overfetch and bitrate-switch latency
small without creating an excessive number of requests.

## Recovery

The player stores the current position in `sessionStorage` under:

```text
bitrate-player-position:<trackId>
```

The position is updated during playback and explicit seek. If the HLS transport must be recreated, playback resumes from the saved position after metadata is loaded. A WebSocket disconnect does not stop audio because media is transported over independent HTTP requests.

## WebSocket responsibility

WebSocket events synchronize playback state between devices. They are not the audio transport. The client must not depend on `audioChunk` events for HLS playback.

## Conversion queue reliability

Track conversion runs in BullMQ with a job ID tied to the track and the uploaded source filename. A replaced upload therefore cannot publish stale conversion results.

Each job has five attempts with exponential backoff starting at five seconds. Both FFmpeg stages have a ten-minute process timeout. BullMQ also recovers stalled jobs when a worker exits while holding a lock.

The track exposes these processing states:

- `PROCESSING`: conversion is queued or retrying;
- `READY`: every required bitrate and HLS playlist was validated and published;
- `FAILED`: Redis rejected the job or all conversion attempts were exhausted.

Workers write into `storage/private/tracks/.processing`. They validate the audio file, HLS manifest, initialization segment, and at least one media segment before publication. Temporary directories are removed after success or failure and stale directories from previous attempts are cleaned when a retry starts.

Existing playable variants remain available while a replacement upload is processing. New database references are committed only after all new variants have been published. Failed jobs are retained in Redis for seven days for diagnostics; successful jobs are retained for one hour.
