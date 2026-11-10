# ADR-0073: Renditions are never cached; distinct-track signals on opening play sessions

Status: Accepted

Date: 2026-11-10

Tracked in [#522](https://github.com/Lordpluha/bitrate/issues/522) (D3, D5). Builds on
[ADR-0067](./0067-playback-sessions.md) and [ADR-0072](./0072-listener-wide-playback-pacing.md).

## Context

`GET /tracks/:id/cmaf/:bitrate` answered with `Cache-Control: private, max-age=31536000,
immutable`. The bytes never change, so the year-long cache was correct for bandwidth, but it left
whole cleartext renditions in the browser's disk cache: a playable file outside any play session,
which pacing and revocation never see.

Pacing bounds how fast audio leaves the API, but nothing reported an account that walks the
catalogue: opening sessions for track after track is the shape of a ripper (or a scraper probing
manifests) long before the listener bucket makes it slow.

## Decision

**No caching of rendition bytes.** Rendition responses carry `Cache-Control: private, no-store,
no-transform`. The player buffers in memory through MSE or `<audio>`; replays fetch again through a
live session.

**Distinct tracks per listener.** `PlaybackSessionService.open` keeps a sorted set
`playback:recent:<userId>` of the track ids opened in the last **10 minutes**. Reopening a track in
the window is not new activity.

- Crossing **40** distinct tracks is reported once: a warning log and
  `bitrate_api_playback_abuse_total{level="suspicious"}`. Nothing is blocked, so the threshold can
  be tuned on real traffic first.
- At **120** distinct tracks a new track is refused with 429, `Retry-After` until the oldest track
  leaves the window, the `errors.track.playback_too_many_tracks` message and
  `bitrate_api_playback_abuse_total{level="blocked"}`. Tracks already in the window still open.

## Consequences

- Replaying a track costs network again; egress should be watched after release.
- 120 distinct tracks in 10 minutes is one new track every 5 seconds without pause; skipping
  through a playlist with prefetch stays below it, a catalogue walk does not.
- Counting is not atomic: parallel opens can pass a threshold by the number in flight. It is a
  signal; the listener bucket of ADR-0072 bounds the audio regardless.
- Counted per account only. Per-address counting was left out because many listeners share an
  address (NAT, campus, carrier).
- Automatic bans and moderation actions stay out of scope; the log and metric feed them later.

## Alternatives considered

- **Short `max-age` instead of `no-store`** — still writes cleartext to disk.
- **Count sessions instead of distinct tracks** — retries after a 403 and prefetch inflate it for
  ordinary listeners.
- **Block at the suspicious threshold immediately** — no data yet on real listening patterns.
