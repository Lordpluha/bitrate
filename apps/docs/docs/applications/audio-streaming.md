---
sidebar_position: 4
title: Audio streaming
---

# Audio streaming

Every track is stored in **one format: CMAF** — one fragmented-MP4 AAC-LC file per bitrate,
indexed by byte range — and played by a first-party MediaSource Extensions loader with our own
adaptive bitrate logic. See [ADR-0020](../architecture/0020-cmaf-range-mse-playback.md) for the
playback design and [ADR-0065](../architecture/0065-single-cmaf-aac-delivery-format.md) for why
CMAF is the only format: there is no HLS, progressive Opus or WebSocket audio path.

The API produces 128, 192 and 320 kbps renditions when the source bitrate permits. All of them
come out of one FFmpeg process with fragment boundaries aligned to whole AAC frames, so a
fragment from one rendition is interchangeable with the same fragment of another — which is what
lets the player switch bitrate mid-track without a gap.

## Endpoints

A manifest describes the renditions and their fragment index; the player then requests byte
ranges of the rendition file itself:

```text
GET /api/v1/tracks/:trackId/manifest
GET /api/v1/tracks/:trackId/cmaf/:bitrate
Range: bytes=0-1048575
```

These are the only routes that serve listener audio. Both require the user access-token cookie;
cross-origin clients must send credentials. Operators preview a track through the staff-only
`GET /api/v1/admin/tracks/:id/audio`, which serves the same CMAF files.

A track with no manifest (`404`) is not playable yet — it is still processing or failed.

## Browser playback

`<bitrate-player>` streams through MSE: it appends the initialization segment, then fragments,
choosing the rendition per fragment from measured throughput. Browsers without MSE — iPhones
before `ManagedMediaSource` — and plays whose loader fails play the **same rendition file**
natively through the media element, at the listener's pinned quality or the rung the adaptive
bitrate would open with. Only adaptivity is lost on that path.

## Prefetch and gapless transition

The player owns two persistent `<audio>` elements:

1. The active slot plays the current track.
2. The standby slot loads the next track's manifest and first fragments.
3. When the active slot ends, the standby slot starts immediately.
4. The Zustand player store advances the queue after the media switch.
5. The previous active slot becomes the new standby slot and preloads the following track.

This avoids fetching the next manifest after the current track has already ended. HTML media
elements cannot guarantee sample-perfect gapless playback on every browser, but the dual-slot
approach removes the normal manifest and initial-buffer delay.

## Seeking

A seek is one Range request: the loader looks up the fragment containing the position in the
manifest's index and fetches that byte window.

## Recovery

The player stores the current position in `sessionStorage` under the play's key:

```text
bitrate-player-position:<playKey>
```

The position is updated during playback and explicit seek. If a play falls back to the native
path, it resumes from the saved position once metadata is loaded.

## Conversion queue reliability

Track conversion runs in BullMQ with a job ID tied to the track and the uploaded source filename.
A replaced upload therefore cannot publish stale conversion results.

Each job has five attempts with exponential backoff starting at five seconds. The FFmpeg pass has
a ten-minute process timeout. BullMQ also recovers stalled jobs when a worker exits while holding
a lock.

The track exposes these processing states:

- `PROCESSING`: conversion is queued or retrying;
- `READY`: every rendition was encoded, passed the alignment check and was published;
- `FAILED`: Redis rejected the job or all conversion attempts were exhausted.

The worker downloads the master into a per-job scratch directory, encodes there, uploads the
renditions under a new generation and removes the scratch directory after success or failure.
Renditions whose fragment boundaries diverge fail the job, so an unspliceable track never becomes
`READY`.

Existing playable renditions remain available while a replacement upload is processing. New
database references are committed only after all new renditions have been uploaded. Failed jobs
are retained in Redis for seven days for diagnostics; successful jobs are retained for one hour.
