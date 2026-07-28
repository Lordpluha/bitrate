---
sidebar_position: 4
title: Audio streaming
---

# HLS audio streaming

The web player uses HLS VOD with AAC audio in fragmented MP4 segments. The API generates
128, 192, and 320 kbps variants when the source bitrate permits it. All renditions are encoded
in one FFmpeg process with aligned segments of approximately four seconds.

## Endpoints

```text
GET /api/v1/tracks/stream/:trackId/hls/master.m3u8
GET /api/v1/tracks/stream/:trackId/hls/:bitrate/index.m3u8
GET /api/v1/tracks/stream/:trackId/hls/:bitrate/init_0.mp4
GET /api/v1/tracks/stream/:trackId/hls/:bitrate/segment_00000.m4s
```

All endpoints require the user access-token cookie. Cross-origin clients must send credentials.

The legacy endpoint remains available as a fallback and supports standard byte ranges:

```text
GET /api/v1/tracks/stream/:trackId?bitrate=192&format=opus
Range: bytes=0-1048575
```

## Browser playback

Safari uses native HLS through the media element. Chrome, Firefox, and Chromium-based desktop
clients load `hls.js` on demand after a track is selected.

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
spotify-player-position:<trackId>
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
