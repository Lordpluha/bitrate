# ADR-0072: Listener-wide playback pacing, per-user session throttling and pacing without Redis

Status: Accepted — supersedes "Redis outage (D18)" of [ADR-0067](./0067-playback-sessions.md)

Date: 2026-11-10

Tracked in [#522](https://github.com/Lordpluha/bitrate/issues/522).

## Context

ADR-0067 paces audio per listener **and track**: every track's budget is real time plus 60
seconds, but nothing bounds how many tracks one listener drains at once. Opening sessions for 100
tracks in parallel downloads all of them in roughly one track's length. Two more gaps widen it:

- `POST /tracks/:id/play-sessions` is throttled per address only, so one account behind rotating
  addresses opens sessions without limit.
- While Redis is unreachable (D18) a validly signed token plays with no pacing at all, so an outage
  is a window for full-speed downloads.

Issue #522 first proposed a cap of two sessions with the oldest evicted. It does not hold:
web-player answers a 403 by opening a new session and retrying (ADR-0067), so two devices over the
cap would evict each other in a loop while each keeps playing, and a ripper simply re-opens. The
limit has to be on audio delivered, not on handles.

## Decision

**A listener-wide bucket.** Besides the per-track budget, every charge also goes into one leaky
bucket per listener, `playback:listener:<userId>`: it fills by the audio served and drains at
**two** real-time streams (`LISTENER_CONCURRENT_STREAMS`); a charge that would lift it above a
**150-second** burst (`LISTENER_BURST_MS`) is refused with the existing `PlaybackPacingError` (429
with `Retry-After`, or a wait inside a paced response). Two streams cover two devices, or a track
plus the next track's prefetch; the burst covers one track's 60-second start, the prefetch and a
second device starting at once. The bucket is updated by one Lua script, so parallel requests cannot
read the same level and overflow together. A refused listener charge refunds the per-track charge.
Revocation does not reset the bucket, so signing in again buys no audio.

**Per-user session throttling.** `UserThrottlerGuard` (a `ThrottlerGuard` whose tracker is
`user:<id>`) runs on `POST /tracks/:id/play-sessions` after the auth guard, with the route's
existing 120-per-minute limit; the global per-address guard still applies.

**Pacing in memory without Redis.** When Redis fails during authorisation or a charge, the same
per-track and listener rules run in the API process's memory (`LocalPlaybackPacer`, bounded maps).
Revocation still waits for Redis; playback keeps working; the degraded metric still counts.

## Consequences

- Downloading a catalogue takes at least half its total length plus the burst, however many
  sessions or addresses are used.
- A third device or a third simultaneous stream for one account waits on the bucket; the listener
  hears buffering rather than an error. Family or shared plans would need a per-plan stream count.
- Each paced chunk now costs one more Redis round-trip (the script).
- While Redis is down every API replica paces on its own, so a listener spread over N replicas gets
  at most N times the budget — bounded, where it was unlimited.
- The bucket is not tied to devices yet; Bitrate Connect can later count its own streams on top.

## Alternatives considered

- **Cap concurrent sessions and evict the oldest** — loops with web-player's retry on 403 and is
  bypassed by re-opening; see Context.
- **Reject new sessions above a cap** — the same bypass by waiting for TTLs, and blocks prefetch.
- **Fail closed without Redis** — stops a ripper but also every listener during an outage.
- **Non-atomic counters (`HINCRBY` with a moving clock)** — parallel requests overshoot by the
  number in flight, which is exactly what a ripper maximises.
